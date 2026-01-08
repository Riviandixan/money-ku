package domain

import "time"

type Wallet struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Name      string    `json:"name"`
	Balance   float64   `json:"balance"`
	Currency  string    `json:"currency"`
	Type      string    `json:"type"`
	Icon      string    `json:"icon"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type WalletRepository interface {
	Create(wallet *Wallet) error
	FindByUserID(userID int) ([]Wallet, error)
	FindByID(id int) (*Wallet, error)
	Update(wallet *Wallet) error
	Delete(id int) error
	UpdateBalance(id int, newBalance float64) error
}
