package service

import (
	"fmt"

	"go-moneyku/internal/domain"
)

type DashboardService struct {
	walletRepo      domain.WalletRepository
	transactionRepo domain.TransactionRepository
}

func NewDashboardService(walletRepo domain.WalletRepository, transactionRepo domain.TransactionRepository) *DashboardService {
	return &DashboardService{
		walletRepo:      walletRepo,
		transactionRepo: transactionRepo,
	}
}

type DashboardSummary struct {
	TotalBalance float64              `json:"total_balance"`
	TotalIncome  float64              `json:"total_income"`
	TotalExpense float64              `json:"total_expense"`
	WalletCount  int                  `json:"wallet_count"`
	Transactions []domain.Transaction `json:"recent_transactions"`
	Wallets      []domain.Wallet      `json:"wallets"`
}

type SpendingByCategory struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
}

func (s *DashboardService) GetSummary(userID int) (*DashboardSummary, error) {
	// Get all wallets
	wallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch wallets: %w", err)
	}

	// Calculate total balance (only for 'tabungan' type)
	var totalBalance float64
	for _, wallet := range wallets {
		if wallet.Type == "tabungan" || wallet.Type == "Tabungan" {
			totalBalance += wallet.Balance
		}
	}

	// Get transaction stats
	stats, err := s.transactionRepo.GetStatsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transaction stats: %w", err)
	}

	// Get recent transactions
	recentTransactions, err := s.transactionRepo.GetRecentByUserID(userID, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch recent transactions: %w", err)
	}

	summary := &DashboardSummary{
		TotalBalance: totalBalance,
		TotalIncome:  stats.TotalIncome,
		TotalExpense: stats.TotalExpense,
		WalletCount:  len(wallets),
		Transactions: recentTransactions,
		Wallets:      wallets,
	}

	return summary, nil
}

func (s *DashboardService) GetSpendingByCategory(userID int) ([]SpendingByCategory, error) {
	// Get all transactions
	transactions, err := s.transactionRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}

	// Group by category
	categoryMap := make(map[string]float64)
	for _, transaction := range transactions {
		if transaction.Type == domain.TransactionTypeExpense {
			category := transaction.Category
			if category == "" {
				category = "Uncategorized"
			}
			categoryMap[category] += transaction.Amount
		}
	}

	// Convert to slice
	var result []SpendingByCategory
	for category, amount := range categoryMap {
		result = append(result, SpendingByCategory{
			Category: category,
			Amount:   amount,
		})
	}

	return result, nil
}
