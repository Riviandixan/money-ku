import api from "./api";

export const authService = {
  async login(username, password) {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  async signup(username, password) {
    const response = await api.post("/auth/signup", { username, password });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
