import api from "./api";

export const walletService = {
  async getWallets() {
    const response = await api.get("/wallets");
    return response.data;
  },

  async getWallet(id) {
    const response = await api.get(`/wallets/${id}`);
    return response.data;
  },

  async createWallet(walletData) {
    const response = await api.post("/wallets", walletData);
    return response.data;
  },

  async updateWallet(id, walletData) {
    const response = await api.put(`/wallets/${id}`, walletData);
    return response.data;
  },

  async deleteWallet(id) {
    const response = await api.delete(`/wallets/${id}`);
    return response.data;
  },
};

export default walletService;
