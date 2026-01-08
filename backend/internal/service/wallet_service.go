package service

import (
	"fmt"

	"go-moneyku/internal/domain"
)

type WalletService struct {
	walletRepo      domain.WalletRepository
	transactionRepo domain.TransactionRepository
}

func NewWalletService(walletRepo domain.WalletRepository, transactionRepo domain.TransactionRepository) *WalletService {
	return &WalletService{
		walletRepo:      walletRepo,
		transactionRepo: transactionRepo,
	}
}

type CreateWalletRequest struct {
	Name     string  `json:"name"`
	Balance  float64 `json:"balance"`
	Currency string  `json:"currency"`
	Type     string  `json:"type"`
	Icon     string  `json:"icon"`
	Color    string  `json:"color"`
}

type UpdateWalletRequest struct {
	Name     string `json:"name"`
	Currency string `json:"currency"`
	Type     string `json:"type"`
	Icon     string `json:"icon"`
	Color    string `json:"color"`
}

func (s *WalletService) CreateWallet(userID int, req CreateWalletRequest) (*domain.Wallet, error) {
	// Validate input
	if req.Name == "" {
		return nil, fmt.Errorf("wallet name is required")
	}

	if req.Currency == "" {
		req.Currency = "IDR"
	}

	wallet := &domain.Wallet{
		UserID:   userID,
		Name:     req.Name,
		Balance:  req.Balance,
		Currency: req.Currency,
		Type:     req.Type,
		Icon:     req.Icon,
		Color:    req.Color,
	}

	if err := s.walletRepo.Create(wallet); err != nil {
		return nil, fmt.Errorf("failed to create wallet: %w", err)
	}

	return wallet, nil
}

func (s *WalletService) GetUserWallets(userID int) ([]domain.Wallet, error) {
	wallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch wallets: %w", err)
	}
	return wallets, nil
}

func (s *WalletService) GetWalletByID(walletID int, userID int) (*domain.Wallet, error) {
	wallet, err := s.walletRepo.FindByID(walletID)
	if err != nil {
		return nil, fmt.Errorf("wallet not found: %w", err)
	}

	// Verify ownership
	if wallet.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to wallet")
	}

	return wallet, nil
}

func (s *WalletService) UpdateWallet(walletID int, userID int, req UpdateWalletRequest) (*domain.Wallet, error) {
	// Get wallet and verify ownership
	wallet, err := s.GetWalletByID(walletID, userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		wallet.Name = req.Name
	}
	if req.Currency != "" {
		wallet.Currency = req.Currency
	}
	if req.Type != "" {
		wallet.Type = req.Type
	}
	if req.Icon != "" {
		wallet.Icon = req.Icon
	}
	if req.Color != "" {
		wallet.Color = req.Color
	}

	if err := s.walletRepo.Update(wallet); err != nil {
		return nil, fmt.Errorf("failed to update wallet: %w", err)
	}

	return wallet, nil
}

func (s *WalletService) DeleteWallet(walletID int, userID int) error {
	// Get wallet and verify ownership
	wallet, err := s.GetWalletByID(walletID, userID)
	if err != nil {
		return err
	}

	// Check if wallet has transactions
	transactions, err := s.transactionRepo.FindByWalletID(wallet.ID)
	if err == nil && len(transactions) > 0 {
		return fmt.Errorf("cannot delete wallet with existing transactions")
	}

	if err := s.walletRepo.Delete(walletID); err != nil {
		return fmt.Errorf("failed to delete wallet: %w", err)
	}

	return nil
}

func (s *WalletService) GetTotalBalance(userID int) (float64, error) {
	wallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return 0, fmt.Errorf("failed to fetch wallets: %w", err)
	}

	var total float64
	for _, wallet := range wallets {
		total += wallet.Balance
	}

	return total, nil
}
