package repository

import (
	"context"
	"fmt"
	"time"

	"go-moneyku/internal/domain"

	"github.com/jackc/pgx/v5/pgxpool"
)

type budgetRepository struct {
	db *pgxpool.Pool
}

func NewBudgetRepository(db *pgxpool.Pool) domain.BudgetRepository {
	return &budgetRepository{db: db}
}

func (r *budgetRepository) Create(budget *domain.Budget) error {
	query := `
		INSERT INTO budgets (user_id, category, amount, period, month, year, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id
	`
	now := time.Now()
	budget.CreatedAt = now
	budget.UpdatedAt = now

	err := r.db.QueryRow(
		context.Background(),
		query,
		budget.UserID,
		budget.Category,
		budget.Amount,
		budget.Period,
		budget.Month,
		budget.Year,
		budget.CreatedAt,
		budget.UpdatedAt,
	).Scan(&budget.ID)

	if err != nil {
		return fmt.Errorf("failed to create budget: %w", err)
	}
	return nil
}

func (r *budgetRepository) FindByUserID(userID int) ([]domain.Budget, error) {
	query := `
		SELECT id, user_id, category, amount, period, month, year, created_at, updated_at
		FROM budgets
		WHERE user_id = $1
		ORDER BY year DESC, month DESC, category ASC
	`
	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch budgets: %w", err)
	}
	defer rows.Close()

	return r.scanBudgets(rows)
}

func (r *budgetRepository) FindByUserIDAndPeriod(userID, month, year int) ([]domain.Budget, error) {
	query := `
		SELECT id, user_id, category, amount, period, month, year, created_at, updated_at
		FROM budgets
		WHERE user_id = $1 AND month = $2 AND year = $3
		ORDER BY category ASC
	`
	rows, err := r.db.Query(context.Background(), query, userID, month, year)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch budgets by period: %w", err)
	}
	defer rows.Close()

	return r.scanBudgets(rows)
}

func (r *budgetRepository) FindByID(id int) (*domain.Budget, error) {
	query := `
		SELECT id, user_id, category, amount, period, month, year, created_at, updated_at
		FROM budgets
		WHERE id = $1
	`
	budget := &domain.Budget{}
	err := r.db.QueryRow(context.Background(), query, id).Scan(
		&budget.ID,
		&budget.UserID,
		&budget.Category,
		&budget.Amount,
		&budget.Period,
		&budget.Month,
		&budget.Year,
		&budget.CreatedAt,
		&budget.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("budget not found: %w", err)
	}
	return budget, nil
}

func (r *budgetRepository) Update(budget *domain.Budget) error {
	query := `
		UPDATE budgets
		SET category = $1, amount = $2, period = $3, month = $4, year = $5, updated_at = $6
		WHERE id = $7 AND user_id = $8
	`
	budget.UpdatedAt = time.Now()
	_, err := r.db.Exec(
		context.Background(),
		query,
		budget.Category,
		budget.Amount,
		budget.Period,
		budget.Month,
		budget.Year,
		budget.UpdatedAt,
		budget.ID,
		budget.UserID,
	)
	if err != nil {
		return fmt.Errorf("failed to update budget: %w", err)
	}
	return nil
}

func (r *budgetRepository) Delete(id int) error {
	query := `DELETE FROM budgets WHERE id = $1`
	_, err := r.db.Exec(context.Background(), query, id)
	if err != nil {
		return fmt.Errorf("failed to delete budget: %w", err)
	}
	return nil
}

func (r *budgetRepository) scanBudgets(rows interface {
	Next() bool
	Scan(dest ...interface{}) error
}) ([]domain.Budget, error) {
	var budgets []domain.Budget
	for rows.Next() {
		var b domain.Budget
		err := rows.Scan(
			&b.ID,
			&b.UserID,
			&b.Category,
			&b.Amount,
			&b.Period,
			&b.Month,
			&b.Year,
			&b.CreatedAt,
			&b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget: %w", err)
		}
		budgets = append(budgets, b)
	}
	return budgets, nil
}
