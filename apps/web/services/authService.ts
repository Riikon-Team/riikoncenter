import apiClient from "./apiClient";

export const authService = {
  login: async (data: Record<string, unknown>) => {
    return apiClient.post("/api/v1/auth/login", data);
  },
  register: async (data: Record<string, unknown>) => {
    return apiClient.post("/api/v1/auth/register", data);
  },
  logout: async () => {
    return apiClient.post("/api/v1/auth/logout");
  }
};
