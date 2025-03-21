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

  changePassword: async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        data
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateUserInfo: async (data) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Bạn chưa đăng nhập!");
      }

      const response = await axios.put(`${API_URL}/auth/update-info`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error updating user info:",
        error.response?.data || error.message
      );
      throw error.response?.data || error.message; // Ném lỗi để xử lý ở `handleSave`
    }
  },
};

export default authApi;
