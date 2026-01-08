package handler

import (
	"net/http"
	"time"

	"go-moneyku/internal/middleware"
	"go-moneyku/internal/service"
	"go-moneyku/internal/utils"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	reportService *service.ReportService
}

func NewReportHandler(reportService *service.ReportService) *ReportHandler {
	return &ReportHandler{
		reportService: reportService,
	}
}

func (h *ReportHandler) GetTransactionReport(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	// Get date range from query params
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	if startDateStr == "" || endDateStr == "" {
		utils.ValidationErrorResponse(c, "start_date and end_date are required (format: YYYY-MM-DD)")
		return
	}

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

	report, err := h.reportService.GetTransactionReport(userID, startDate, endDate)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Report generated successfully", report)
}

func (h *ReportHandler) ExportTransactions(c *gin.Context) {
	userID, exists := middleware.GetUserID(c)
	if !exists {
		utils.UnauthorizedResponse(c, "User not authenticated")
		return
	}

	transactions, err := h.reportService.ExportTransactions(userID)
	if err != nil {
		utils.InternalErrorResponse(c, err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Transactions exported successfully", transactions)
}
