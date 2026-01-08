package main

import (
	"log"

	"go-moneyku/internal/app"
	"go-moneyku/internal/config"
	"go-moneyku/internal/database"
	"go-moneyku/internal/handler"
	"go-moneyku/internal/repository"
	"go-moneyku/internal/service"
	"go-moneyku/internal/utils"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set JWT secret
	utils.SetJWTSecret(cfg.JWT.Secret)

	// Connect to database
	db, err := database.Connect(cfg.GetDSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close(db)

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	walletRepo := repository.NewWalletRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)

	// Initialize services
	authService := service.NewAuthService(userRepo)
	walletService := service.NewWalletService(walletRepo, transactionRepo)
	transactionService := service.NewTransactionService(transactionRepo, walletRepo)
	dashboardService := service.NewDashboardService(walletRepo, transactionRepo)
	reportService := service.NewReportService(transactionRepo, walletRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	walletHandler := handler.NewWalletHandler(walletService)
	transactionHandler := handler.NewTransactionHandler(transactionService)
	dashboardHandler := handler.NewDashboardHandler(dashboardService)
	reportHandler := handler.NewReportHandler(reportService)

	// Setup router
	router := app.NewRouter(
		authHandler,
		walletHandler,
		transactionHandler,
		dashboardHandler,
		reportHandler,
	)

	// Create and start server
	server := app.NewServer(router.Setup(), cfg.Server.Port)
	if err := server.Start(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
