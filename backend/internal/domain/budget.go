package domain

import "time"

type Budget struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Category  string    `json:"category"`
	Amount    float64   `json:"amount"`
	Period    string    `json:"period"`
	Month     int       `json:"month"`
	Year      int       `json:"year"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type BudgetWithUsage struct {
	Budget
	Spent      float64 `json:"spent"`
	Remaining  float64 `json:"remaining"`
	Percentage float64 `json:"percentage"`
}

type BudgetRepository interface {
	Create(budget *Budget) error
	FindByUserID(userID int) ([]Budget, error)
	FindByUserIDAndPeriod(userID, month, year int) ([]Budget, error)
	FindByID(id int) (*Budget, error)
	Update(budget *Budget) error
	Delete(id int) error
}
