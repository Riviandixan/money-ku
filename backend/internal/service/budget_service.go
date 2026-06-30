package service

import (
	"fmt"
	"time"

	"go-moneyku/internal/domain"
)

type BudgetService struct {
	budgetRepo      domain.BudgetRepository
	transactionRepo domain.TransactionRepository
}

func NewBudgetService(budgetRepo domain.BudgetRepository, transactionRepo domain.TransactionRepository) *BudgetService {
	return &BudgetService{
		budgetRepo:      budgetRepo,
		transactionRepo: transactionRepo,
	}
}

type CreateBudgetRequest struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Period   string  `json:"period"`
	Month    int     `json:"month"`
	Year     int     `json:"year"`
}

type UpdateBudgetRequest struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
	Period   string  `json:"period"`
	Month    int     `json:"month"`
	Year     int     `json:"year"`
}

func (s *BudgetService) CreateBudget(userID int, req CreateBudgetRequest) (*domain.Budget, error) {
	if req.Category == "" {
		return nil, fmt.Errorf("category is required")
	}
	if req.Amount <= 0 {
		return nil, fmt.Errorf("amount must be greater than zero")
	}
	if req.Period == "" {
		req.Period = "monthly"
	}
	if req.Period != "monthly" && req.Period != "weekly" {
		return nil, fmt.Errorf("period must be 'monthly' or 'weekly'")
	}

	now := time.Now()
	if req.Month == 0 {
		req.Month = int(now.Month())
	}
	if req.Year == 0 {
		req.Year = now.Year()
	}
	if req.Month < 1 || req.Month > 12 {
		return nil, fmt.Errorf("month must be between 1 and 12")
	}

	budget := &domain.Budget{
		UserID:   userID,
		Category: req.Category,
		Amount:   req.Amount,
		Period:   req.Period,
		Month:    req.Month,
		Year:     req.Year,
	}

	if err := s.budgetRepo.Create(budget); err != nil {
		return nil, fmt.Errorf("budget for this category already exists in this period or failed to create: %w", err)
	}

	return budget, nil
}

func (s *BudgetService) GetBudgetsWithUsage(userID, month, year int) ([]domain.BudgetWithUsage, error) {
	now := time.Now()
	if month == 0 {
		month = int(now.Month())
	}
	if year == 0 {
		year = now.Year()
	}

	budgets, err := s.budgetRepo.FindByUserIDAndPeriod(userID, month, year)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch budgets: %w", err)
	}

	// Get all transactions in this month/year to calculate spending per category
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	transactions, err := s.transactionRepo.FindByDateRange(userID, startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}

	// Build spending map by category (only expense type)
	spendingByCategory := make(map[string]float64)
	for _, t := range transactions {
		if t.Type == domain.TransactionTypeExpense && t.Category != "" {
			spendingByCategory[t.Category] += t.Amount
		}
	}

	result := make([]domain.BudgetWithUsage, 0, len(budgets))
	for _, b := range budgets {
		spent := spendingByCategory[b.Category]
		remaining := b.Amount - spent
		if remaining < 0 {
			remaining = 0
		}
		percentage := 0.0
		if b.Amount > 0 {
			percentage = (spent / b.Amount) * 100
			if percentage > 100 {
				percentage = 100
			}
		}
		result = append(result, domain.BudgetWithUsage{
			Budget:     b,
			Spent:      spent,
			Remaining:  remaining,
			Percentage: percentage,
		})
	}

	return result, nil
}

func (s *BudgetService) UpdateBudget(budgetID, userID int, req UpdateBudgetRequest) (*domain.Budget, error) {
	budget, err := s.budgetRepo.FindByID(budgetID)
	if err != nil {
		return nil, fmt.Errorf("budget not found: %w", err)
	}
	if budget.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to budget")
	}

	if req.Category != "" {
		budget.Category = req.Category
	}
	if req.Amount > 0 {
		budget.Amount = req.Amount
	}
	if req.Period != "" {
		if req.Period != "monthly" && req.Period != "weekly" {
			return nil, fmt.Errorf("period must be 'monthly' or 'weekly'")
		}
		budget.Period = req.Period
	}
	if req.Month >= 1 && req.Month <= 12 {
		budget.Month = req.Month
	}
	if req.Year > 0 {
		budget.Year = req.Year
	}

	if err := s.budgetRepo.Update(budget); err != nil {
		return nil, fmt.Errorf("failed to update budget: %w", err)
	}

	return budget, nil
}

func (s *BudgetService) DeleteBudget(budgetID, userID int) error {
	budget, err := s.budgetRepo.FindByID(budgetID)
	if err != nil {
		return fmt.Errorf("budget not found: %w", err)
	}
	if budget.UserID != userID {
		return fmt.Errorf("unauthorized access to budget")
	}

	if err := s.budgetRepo.Delete(budgetID); err != nil {
		return fmt.Errorf("failed to delete budget: %w", err)
	}

	return nil
}
