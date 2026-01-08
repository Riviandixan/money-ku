package repository

import (
	"context"
	"fmt"
	"time"

	"go-moneyku/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type walletRepository struct {
	db *pgxpool.Pool
}

func NewWalletRepository(db *pgxpool.Pool) domain.WalletRepository {
	return &walletRepository{db: db}
}

func (r *walletRepository) Create(wallet *domain.Wallet) error {
	query := `
		INSERT INTO wallets (user_id, name, balance, currency, type, icon, color, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	now := time.Now()
	wallet.CreatedAt = now
	wallet.UpdatedAt = now

	err := r.db.QueryRow(
		context.Background(),
		query,
		wallet.UserID,
		wallet.Name,
		wallet.Balance,
		wallet.Currency,
		wallet.Type,
		wallet.Icon,
		wallet.Color,
		wallet.CreatedAt,
		wallet.UpdatedAt,
	).Scan(&wallet.ID)

	if err != nil {
		return fmt.Errorf("failed to create wallet: %w", err)
	}

	return nil
}

func (r *walletRepository) FindByUserID(userID int) ([]domain.Wallet, error) {
	query := `
		SELECT id, user_id, name, balance, currency, type, icon, color, created_at, updated_at
		FROM wallets
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch wallets: %w", err)
	}
	defer rows.Close()

	var wallets []domain.Wallet
	for rows.Next() {
		var wallet domain.Wallet
		err := rows.Scan(
			&wallet.ID,
			&wallet.UserID,
			&wallet.Name,
			&wallet.Balance,
			&wallet.Currency,
			&wallet.Type,
			&wallet.Icon,
			&wallet.Color,
			&wallet.CreatedAt,
			&wallet.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan wallet: %w", err)
		}
		wallets = append(wallets, wallet)
	}

	return wallets, nil
}

func (r *walletRepository) FindByID(id int) (*domain.Wallet, error) {
	query := `
		SELECT id, user_id, name, balance, currency, type, icon, color, created_at, updated_at
		FROM wallets
		WHERE id = $1
	`

	wallet := &domain.Wallet{}
	err := r.db.QueryRow(context.Background(), query, id).Scan(
		&wallet.ID,
		&wallet.UserID,
		&wallet.Name,
		&wallet.Balance,
		&wallet.Currency,
		&wallet.Type,
		&wallet.Icon,
		&wallet.Color,
		&wallet.CreatedAt,
		&wallet.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("wallet not found: %w", err)
	}

	return wallet, nil
}

func (r *walletRepository) Update(wallet *domain.Wallet) error {
	query := `
		UPDATE wallets
		SET name = $1, currency = $2, type = $3, icon = $4, color = $5, updated_at = $6
		WHERE id = $7
	`

	wallet.UpdatedAt = time.Now()

	_, err := r.db.Exec(
		context.Background(),
		query,
		wallet.Name,
		wallet.Currency,
		wallet.Type,
		wallet.Icon,
		wallet.Color,
		wallet.UpdatedAt,
		wallet.ID,
	)

	if err != nil {
		return fmt.Errorf("failed to update wallet: %w", err)
	}

	return nil
}

func (r *walletRepository) Delete(id int) error {
	query := `DELETE FROM wallets WHERE id = $1`

	_, err := r.db.Exec(context.Background(), query, id)
	if err != nil {
		return fmt.Errorf("failed to delete wallet: %w", err)
	}

	return nil
}

func (r *walletRepository) UpdateBalance(id int, newBalance float64) error {
	query := `
		UPDATE wallets
		SET balance = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := r.db.Exec(
		context.Background(),
		query,
		newBalance,
		time.Now(),
		id,
	)

	if err != nil {
		return fmt.Errorf("failed to update wallet balance: %w", err)
	}

	return nil
}
