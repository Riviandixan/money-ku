package domain

import "time"

type TransactionType string

const (
	TransactionTypeIncome   TransactionType = "income"
	TransactionTypeExpense  TransactionType = "expense"
	TransactionTypeTransfer TransactionType = "transfer"
)

type Transaction struct {
	ID          int             `json:"id"`
	UserID      int             `json:"user_id"`
	WalletID    int             `json:"wallet_id"`
	Type        TransactionType `json:"type"`
	Amount      float64         `json:"amount"`
	Category    string          `json:"category"`
	Description string          `json:"description"`
	Date        time.Time       `json:"date"`
	ToWalletID  *int            `json:"to_wallet_id,omitempty"` // For transfers
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type TransactionRepository interface {
	Create(transaction *Transaction) error
	FindByUserID(userID int) ([]Transaction, error)
	FindByWalletID(walletID int) ([]Transaction, error)
	FindByDateRange(userID int, startDate, endDate time.Time) ([]Transaction, error)
	FindByID(id int) (*Transaction, error)
	Delete(id int) error
	GetStatsByUserID(userID int) (*TransactionStats, error)
	GetRecentByUserID(userID int, limit int) ([]Transaction, error)
}

type TransactionStats struct {
	TotalIncome   float64 `json:"total_income"`
	TotalExpense  float64 `json:"total_expense"`
	TotalTransfer float64 `json:"total_transfer"`
}
