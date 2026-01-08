package handler

import (
	"net/http"
	"strconv"

	"go-moneyku/internal/middleware"
	"go-moneyku/internal/service"
	"go-moneyku/internal/utils"

	"github.com/gin-gonic/gin"
)

type WalletHandler struct {
	walletService *service.WalletService
}

func NewWalletHandler(walletService *service.WalletService) *WalletHandler {
	return &WalletHandler{
		walletService: walletService,
	}
}

func (h *WalletHandler) CreateWallet(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	var req service.CreateWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	wallet, err := h.walletService.CreateWallet(userID, req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Wallet created successfully", wallet)
}

func (h *WalletHandler) GetWallets(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	wallets, err := h.walletService.GetUserWallets(userID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wallets retrieved successfully", wallets)
}

func (h *WalletHandler) GetWallet(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	walletID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid wallet ID")
		return
	}

	wallet, err := h.walletService.GetWalletByID(walletID, userID)
	if err != nil {
		utils.NotFoundResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wallet retrieved successfully", wallet)
}

func (h *WalletHandler) UpdateWallet(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	walletID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid wallet ID")
		return
	}

	var req service.UpdateWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	wallet, err := h.walletService.UpdateWallet(walletID, userID, req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wallet updated successfully", wallet)
}

func (h *WalletHandler) DeleteWallet(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	walletID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid wallet ID")
		return
	}

	if err := h.walletService.DeleteWallet(walletID, userID); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Wallet deleted successfully", nil)
}
