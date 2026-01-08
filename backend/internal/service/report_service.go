package service

import (
	"fmt"
	"time"

	"go-moneyku/internal/domain"
)

type ReportService struct {
	transactionRepo domain.TransactionRepository
	walletRepo      domain.WalletRepository
}

func NewReportService(transactionRepo domain.TransactionRepository, walletRepo domain.WalletRepository) *ReportService {
	return &ReportService{
		transactionRepo: transactionRepo,
		walletRepo:      walletRepo,
	}
}

type ReportData struct {
	Transactions []domain.Transaction `json:"transactions"`
	Summary      ReportSummary        `json:"summary"`
}

type ReportSummary struct {
	TotalIncome      float64 `json:"total_income"`
	TotalExpense     float64 `json:"total_expense"`
	NetIncome        float64 `json:"net_income"`
	TransactionCount int     `json:"transaction_count"`
}

func (s *ReportService) GetTransactionReport(userID int, startDate, endDate time.Time) (*ReportData, error) {
	// Get transactions in date range
	transactions, err := s.transactionRepo.FindByDateRange(userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}

	// Calculate summary
	var totalIncome, totalExpense float64
	for _, transaction := range transactions {
		switch transaction.Type {
		case domain.TransactionTypeIncome:
			totalIncome += transaction.Amount
		case domain.TransactionTypeExpense:
			totalExpense += transaction.Amount
		}
	}

	summary := ReportSummary{
		TotalIncome:      totalIncome,
		TotalExpense:     totalExpense,
		NetIncome:        totalIncome - totalExpense,
		TransactionCount: len(transactions),
	}

	return &ReportData{
		Transactions: transactions,
		Summary:      summary,
	}, nil
}

func (s *ReportService) ExportTransactions(userID int) ([]domain.Transaction, error) {
	transactions, err := s.transactionRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	return transactions, nil
}
