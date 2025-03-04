import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authApi = {
  login: async (credentials) => {
    try {
      const fixedCredentials = {
        user_id: String(credentials.user_id),
        password: credentials.password,
      };

      const response = await axios.post(
        `${API_URL}/auth/login`,
        fixedCredentials
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
};

export default authApi;
