package handler

import (
	"net/http"
	"strconv"
	"time"

	"go-moneyku/internal/middleware"
	"go-moneyku/internal/service"
	"go-moneyku/internal/utils"

	"github.com/gin-gonic/gin"
)

type TransactionHandler struct {
	transactionService *service.TransactionService
}

func NewTransactionHandler(transactionService *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		transactionService: transactionService,
	}
}

func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	var req service.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	transaction, err := h.transactionService.CreateTransaction(userID, req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Transaction created successfully", transaction)
}

func (h *TransactionHandler) GetTransactions(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	// Check for wallet_id filter
	walletIDStr := c.Query("wallet_id")
	if walletIDStr != "" {
		walletID, err := strconv.Atoi(walletIDStr)
		if err != nil {
			utils.ValidationErrorResponse(c, "Invalid wallet ID")
			return
		}

		transactions, err := h.transactionService.GetWalletTransactions(walletID, userID)
		if err != nil {
			utils.InternalErrorResponse(c, err.Error())
			return
		}

		utils.SuccessResponse(c, http.StatusOK, "Transactions retrieved successfully", transactions)
		return
	}

	// Check for date range filter
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	if startDateStr != "" && endDateStr != "" {
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			utils.ValidationErrorResponse(c, "Invalid start date format (use YYYY-MM-DD)")
			return
		}

		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			utils.ValidationErrorResponse(c, "Invalid end date format (use YYYY-MM-DD)")
			return
		}

		transactions, err := h.transactionService.GetTransactionsByDateRange(userID, startDate, endDate)
		if err != nil {
			utils.InternalErrorResponse(c, err.Error())
			return
		}

		utils.SuccessResponse(c, http.StatusOK, "Transactions retrieved successfully", transactions)
		return
	}

	// Get all user transactions
	transactions, err := h.transactionService.GetUserTransactions(userID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Transactions retrieved successfully", transactions)
}

func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	transactionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid transaction ID")
		return
	}

	if err := h.transactionService.DeleteTransaction(transactionID, userID); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Transaction deleted successfully", nil)
}
