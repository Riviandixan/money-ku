import api from "./api";

export const reportService = {
  async getTransactionReport(startDate, endDate) {
    const response = await api.get("/reports/transactions", {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async exportTransactions() {
    const response = await api.get("/reports/export");
    return response.data;
  },
};

export default reportService;
