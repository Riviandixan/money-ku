package handler

import (
	"net/http"
	"strconv"

	"go-moneyku/internal/middleware"
	"go-moneyku/internal/service"
	"go-moneyku/internal/utils"

	"github.com/gin-gonic/gin"
)

type BudgetHandler struct {
	budgetService *service.BudgetService
}

func NewBudgetHandler(budgetService *service.BudgetService) *BudgetHandler {
	return &BudgetHandler{budgetService: budgetService}
}

func (h *BudgetHandler) CreateBudget(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	var req service.CreateBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	budget, err := h.budgetService.CreateBudget(userID, req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Budget created successfully", budget)
}

func (h *BudgetHandler) GetBudgets(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	monthStr := c.Query("month")
	yearStr := c.Query("year")

	month, _ := strconv.Atoi(monthStr)
	year, _ := strconv.Atoi(yearStr)

	budgets, err := h.budgetService.GetBudgetsWithUsage(userID, month, year)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Budgets retrieved successfully", budgets)
}

func (h *BudgetHandler) UpdateBudget(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	budgetID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid budget ID")
		return
	}

	var req service.UpdateBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorResponse(c, "Invalid request body")
		return
	}

	budget, err := h.budgetService.UpdateBudget(budgetID, userID, req)
	if err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Budget updated successfully", budget)
}

func (h *BudgetHandler) DeleteBudget(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	budgetID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		utils.ValidationErrorResponse(c, "Invalid budget ID")
		return
	}

	if err := h.budgetService.DeleteBudget(budgetID, userID); err != nil {
		utils.ValidationErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Budget deleted successfully", nil)
}
