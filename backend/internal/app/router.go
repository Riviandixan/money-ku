package app

import (
	"go-moneyku/internal/handler"
	"go-moneyku/internal/middleware"

	"github.com/gin-gonic/gin"
)

type Router struct {
	authHandler        *handler.AuthHandler
	walletHandler      *handler.WalletHandler
	transactionHandler *handler.TransactionHandler
	dashboardHandler   *handler.DashboardHandler
	reportHandler      *handler.ReportHandler
}

func NewRouter(
	authHandler *handler.AuthHandler,
	walletHandler *handler.WalletHandler,
	transactionHandler *handler.TransactionHandler,
	dashboardHandler *handler.DashboardHandler,
	reportHandler *handler.ReportHandler,
) *Router {
	return &Router{
		authHandler:        authHandler,
		walletHandler:      walletHandler,
		transactionHandler: transactionHandler,
		dashboardHandler:   dashboardHandler,
		reportHandler:      reportHandler,
	}
}

func (r *Router) Setup() *gin.Engine {
	router := gin.Default()

	// Apply CORS middleware
	router.Use(middleware.CORSMiddleware())

	// API routes
	api := router.Group("/api")
	{
		// Public routes - Authentication
		auth := api.Group("/auth")
		{
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/signup", r.authHandler.Signup)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(middleware.AuthMiddleware())
		{
			// Auth routes (protected)
			protected.GET("/auth/me", r.authHandler.GetCurrentUser)

			// Wallet routes
			wallets := protected.Group("/wallets")
			{
				wallets.POST("", r.walletHandler.CreateWallet)
				wallets.GET("", r.walletHandler.GetWallets)
				wallets.GET("/:id", r.walletHandler.GetWallet)
				wallets.PUT("/:id", r.walletHandler.UpdateWallet)
				wallets.DELETE("/:id", r.walletHandler.DeleteWallet)
			}

			// Transaction routes
			transactions := protected.Group("/transactions")
			{
				transactions.POST("", r.transactionHandler.CreateTransaction)
				transactions.GET("", r.transactionHandler.GetTransactions)
				transactions.DELETE("/:id", r.transactionHandler.DeleteTransaction)
			}

			// Dashboard routes
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/summary", r.dashboardHandler.GetSummary)
				dashboard.GET("/spending-by-category", r.dashboardHandler.GetSpendingByCategory)
			}

			// Report routes
			reports := protected.Group("/reports")
			{
				reports.GET("/transactions", r.reportHandler.GetTransactionReport)
				reports.GET("/export", r.reportHandler.ExportTransactions)
			}
		}
	}

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	return router
}
