import api from "./api";

export const transactionService = {
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.wallet_id) params.append("wallet_id", filters.wallet_id);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  async createTransaction(transactionData) {
    const response = await api.post("/transactions", transactionData);
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export default transactionService;
