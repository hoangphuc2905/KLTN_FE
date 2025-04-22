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

      const data = response.data;

      const userInfo = {
        token: data.token,
        userId: data.student_id || data.lecturer_id,
        roles: data.roles,
        email: data.email,
        userType: data.user_type,
        department: data.department,
      };

      return userInfo;
    } catch (error) {
      console.error("Error during login:", error);
      throw error.response?.data || "Login failed.";
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
      throw error.response?.data || error.message;
    }
  },

  registerStudent: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      console.error("Error during student registration:", error);
      throw error.response?.data || "Registration failed.";
    }
  },

  approveStudent: async (studentId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/auth/approve/${studentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error during student approval:", error);
      throw error.response?.data || "Approval failed.";
    }
  },
};

export default authApi;
