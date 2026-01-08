package repository

import (
	"context"
	"fmt"
	"time"

	"go-moneyku/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type transactionRepository struct {
	db *pgxpool.Pool
}

func NewTransactionRepository(db *pgxpool.Pool) domain.TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(transaction *domain.Transaction) error {
	query := `
		INSERT INTO transactions (user_id, wallet_id, type, amount, category, description, date, to_wallet_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`

	now := time.Now()
	transaction.CreatedAt = now
	transaction.UpdatedAt = now

	err := r.db.QueryRow(
		context.Background(),
		query,
		transaction.UserID,
		transaction.WalletID,
		transaction.Type,
		transaction.Amount,
		transaction.Category,
		transaction.Description,
		transaction.Date,
		transaction.ToWalletID,
		transaction.CreatedAt,
		transaction.UpdatedAt,
	).Scan(&transaction.ID)

	if err != nil {
		return fmt.Errorf("failed to create transaction: %w", err)
	}

	return nil
}

func (r *transactionRepository) FindByUserID(userID int) ([]domain.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, category, description, date, to_wallet_id, created_at, updated_at
		FROM transactions
		WHERE user_id = $1
		ORDER BY date DESC, created_at DESC
	`

	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	defer rows.Close()

	return r.scanTransactions(rows)
}

func (r *transactionRepository) FindByWalletID(walletID int) ([]domain.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, category, description, date, to_wallet_id, created_at, updated_at
		FROM transactions
		WHERE wallet_id = $1 OR to_wallet_id = $1
		ORDER BY date DESC, created_at DESC
	`

	rows, err := r.db.Query(context.Background(), query, walletID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	defer rows.Close()

	return r.scanTransactions(rows)
}

func (r *transactionRepository) FindByDateRange(userID int, startDate, endDate time.Time) ([]domain.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, category, description, date, to_wallet_id, created_at, updated_at
		FROM transactions
		WHERE user_id = $1 AND date >= $2 AND date <= $3
		ORDER BY date DESC, created_at DESC
	`

	rows, err := r.db.Query(context.Background(), query, userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}
	defer rows.Close()

	return r.scanTransactions(rows)
}

func (r *transactionRepository) FindByID(id int) (*domain.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, category, description, date, to_wallet_id, created_at, updated_at
		FROM transactions
		WHERE id = $1
	`

	transaction := &domain.Transaction{}
	err := r.db.QueryRow(context.Background(), query, id).Scan(
		&transaction.ID,
		&transaction.UserID,
		&transaction.WalletID,
		&transaction.Type,
		&transaction.Amount,
		&transaction.Category,
		&transaction.Description,
		&transaction.Date,
		&transaction.ToWalletID,
		&transaction.CreatedAt,
		&transaction.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	return transaction, nil
}

func (r *transactionRepository) Delete(id int) error {
	query := `DELETE FROM transactions WHERE id = $1`

	_, err := r.db.Exec(context.Background(), query, id)
	if err != nil {
		return fmt.Errorf("failed to delete transaction: %w", err)
	}

	return nil
}

func (r *transactionRepository) GetStatsByUserID(userID int) (*domain.TransactionStats, error) {
	query := `
		SELECT 
			COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
			COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
			COALESCE(SUM(CASE WHEN type = 'transfer' THEN amount ELSE 0 END), 0) as total_transfer
		FROM transactions
		WHERE user_id = $1
	`

	stats := &domain.TransactionStats{}
	err := r.db.QueryRow(context.Background(), query, userID).Scan(
		&stats.TotalIncome,
		&stats.TotalExpense,
		&stats.TotalTransfer,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get transaction stats: %w", err)
	}

	return stats, nil
}

func (r *transactionRepository) GetRecentByUserID(userID int, limit int) ([]domain.Transaction, error) {
	query := `
		SELECT id, user_id, wallet_id, type, amount, category, description, date, to_wallet_id, created_at, updated_at
		FROM transactions
		WHERE user_id = $1
		ORDER BY date DESC, created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(context.Background(), query, userID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch recent transactions: %w", err)
	}
	defer rows.Close()

	return r.scanTransactions(rows)
}

func (r *transactionRepository) scanTransactions(rows interface {
	Next() bool
	Scan(dest ...interface{}) error
}) ([]domain.Transaction, error) {
	var transactions []domain.Transaction
	for rows.Next() {
		var transaction domain.Transaction
		err := rows.Scan(
			&transaction.ID,
			&transaction.UserID,
			&transaction.WalletID,
			&transaction.Type,
			&transaction.Amount,
			&transaction.Category,
			&transaction.Description,
			&transaction.Date,
			&transaction.ToWalletID,
			&transaction.CreatedAt,
			&transaction.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan transaction: %w", err)
		}
		transactions = append(transactions, transaction)
	}

	return transactions, nil
}
