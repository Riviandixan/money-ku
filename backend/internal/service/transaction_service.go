package service

import (
	"fmt"
	"time"

	"go-moneyku/internal/domain"
)

type TransactionService struct {
	transactionRepo domain.TransactionRepository
	walletRepo      domain.WalletRepository
}

func NewTransactionService(transactionRepo domain.TransactionRepository, walletRepo domain.WalletRepository) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
		walletRepo:      walletRepo,
	}
}

type CreateTransactionRequest struct {
	WalletID    int                    `json:"wallet_id"`
	Type        domain.TransactionType `json:"type"`
	Amount      float64                `json:"amount"`
	Category    string                 `json:"category"`
	Description string                 `json:"description"`
	Date        string                 `json:"date"`
	ToWalletID  *int                   `json:"to_wallet_id,omitempty"`
}

func (s *TransactionService) CreateTransaction(userID int, req CreateTransactionRequest) (*domain.Transaction, error) {
	// Validate input
	if req.Amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than zero")
	}

	// Parse date
	var transactionDate time.Time
	var err error
	if req.Date == "" {
		transactionDate = time.Now()
	} else {
		// Try parsing YYYY-MM-DD
		transactionDate, err = time.Parse("2006-01-02", req.Date)
		if err != nil {
			// Try parsing RFC3339 as fallback
			transactionDate, err = time.Parse(time.RFC3339, req.Date)
			if err != nil {
				return nil, fmt.Errorf("invalid date format (use YYYY-MM-DD or RFC3339)")
			}
		}
	}

	// Get source wallet and verify ownership
	sourceWallet, err := s.walletRepo.FindByID(req.WalletID)
	if err != nil {
		return nil, fmt.Errorf("wallet not found: %w", err)
	}
	if sourceWallet.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to wallet")
	}

	// Handle different transaction types
	switch req.Type {
	case domain.TransactionTypeExpense:
		if sourceWallet.Balance < req.Amount {
			return nil, fmt.Errorf("insufficient balance")
		}
		// Decrease wallet balance
		newBalance := sourceWallet.Balance - req.Amount
		if err := s.walletRepo.UpdateBalance(sourceWallet.ID, newBalance); err != nil {
			return nil, fmt.Errorf("failed to update wallet balance: %w", err)
		}

	case domain.TransactionTypeIncome:
		// Increase wallet balance
		newBalance := sourceWallet.Balance + req.Amount
		if err := s.walletRepo.UpdateBalance(sourceWallet.ID, newBalance); err != nil {
			return nil, fmt.Errorf("failed to update wallet balance: %w", err)
		}

	case domain.TransactionTypeTransfer:
		if req.ToWalletID == nil {
			return nil, fmt.Errorf("destination wallet is required for transfer")
		}
		if *req.ToWalletID == req.WalletID {
			return nil, fmt.Errorf("cannot transfer to the same wallet")
		}
		if sourceWallet.Balance < req.Amount {
			return nil, fmt.Errorf("insufficient balance")
		}

		// Get destination wallet and verify ownership
		destWallet, err := s.walletRepo.FindByID(*req.ToWalletID)
		if err != nil {
			return nil, fmt.Errorf("destination wallet not found: %w", err)
		}
		if destWallet.UserID != userID {
			return nil, fmt.Errorf("unauthorized access to destination wallet")
		}

		// Update both wallet balances
		if err := s.walletRepo.UpdateBalance(sourceWallet.ID, sourceWallet.Balance-req.Amount); err != nil {
			return nil, fmt.Errorf("failed to update source wallet balance: %w", err)
		}
		if err := s.walletRepo.UpdateBalance(destWallet.ID, destWallet.Balance+req.Amount); err != nil {
			// Rollback source wallet
			s.walletRepo.UpdateBalance(sourceWallet.ID, sourceWallet.Balance)
			return nil, fmt.Errorf("failed to update destination wallet balance: %w", err)
		}

	default:
		return nil, fmt.Errorf("invalid transaction type")
	}

	// Create transaction record
	transaction := &domain.Transaction{
		UserID:      userID,
		WalletID:    req.WalletID,
		Type:        req.Type,
		Amount:      req.Amount,
		Category:    req.Category,
		Description: req.Description,
		Date:        transactionDate,
		ToWalletID:  req.ToWalletID,
	}

	if err := s.transactionRepo.Create(transaction); err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

func (s *TransactionService) GetUserTransactions(userID int) ([]domain.Transaction, error) {
	transactions, err := s.transactionRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	return transactions, nil
}

func (s *TransactionService) GetWalletTransactions(walletID int, userID int) ([]domain.Transaction, error) {
	// Verify wallet ownership
	wallet, err := s.walletRepo.FindByID(walletID)
	if err != nil {
		return nil, fmt.Errorf("wallet not found: %w", err)
	}
	if wallet.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to wallet")
	}

	transactions, err := s.transactionRepo.FindByWalletID(walletID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	return transactions, nil
}

func (s *TransactionService) GetTransactionsByDateRange(userID int, startDate, endDate time.Time) ([]domain.Transaction, error) {
	transactions, err := s.transactionRepo.FindByDateRange(userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	return transactions, nil
}

func (s *TransactionService) DeleteTransaction(transactionID int, userID int) error {
	// Get transaction and verify ownership
	transaction, err := s.transactionRepo.FindByID(transactionID)
	if err != nil {
		return fmt.Errorf("transaction not found: %w", err)
	}
	if transaction.UserID != userID {
		return fmt.Errorf("unauthorized access to transaction")
	}

	// Reverse the balance changes
	sourceWallet, err := s.walletRepo.FindByID(transaction.WalletID)
	if err != nil {
		return fmt.Errorf("wallet not found: %w", err)
	}

	switch transaction.Type {
	case domain.TransactionTypeExpense:
		// Add back the amount
		newBalance := sourceWallet.Balance + transaction.Amount
		if err := s.walletRepo.UpdateBalance(sourceWallet.ID, newBalance); err != nil {
			return fmt.Errorf("failed to update wallet balance: %w", err)
		}

	case domain.TransactionTypeIncome:
		// Subtract the amount
		newBalance := sourceWallet.Balance - transaction.Amount
		if err := s.walletRepo.UpdateBalance(sourceWallet.ID, newBalance); err != nil {
			return fmt.Errorf("failed to update wallet balance: %w", err)
		}

	case domain.TransactionTypeTransfer:
		if transaction.ToWalletID != nil {
			destWallet, err := s.walletRepo.FindByID(*transaction.ToWalletID)
			if err == nil {
				// Reverse both wallets
				s.walletRepo.UpdateBalance(sourceWallet.ID, sourceWallet.Balance+transaction.Amount)
				s.walletRepo.UpdateBalance(destWallet.ID, destWallet.Balance-transaction.Amount)
			}
		}
	}

	// Delete transaction
	if err := s.transactionRepo.Delete(transactionID); err != nil {
		return fmt.Errorf("failed to delete transaction: %w", err)
	}

	return nil
}

func (s *TransactionService) GetTransactionStats(userID int) (*domain.TransactionStats, error) {
	stats, err := s.transactionRepo.GetStatsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get transaction stats: %w", err)
	}
	return stats, nil
}

func (s *TransactionService) GetRecentTransactions(userID int, limit int) ([]domain.Transaction, error) {
	if limit <= 0 {
		limit = 10
	}
	transactions, err := s.transactionRepo.GetRecentByUserID(userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch recent transactions: %w", err)
	}
	return transactions, nil
}
