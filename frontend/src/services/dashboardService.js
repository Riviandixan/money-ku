import api from "./api";

export const dashboardService = {
  async getSummary() {
    const response = await api.get("/dashboard/summary");
    return response.data;
  },

  async getSpendingByCategory() {
    const response = await api.get("/dashboard/spending-by-category");
    return response.data;
  },
};

export default dashboardService;
