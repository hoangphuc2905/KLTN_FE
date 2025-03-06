import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const userApi = {
  getUserInfo: async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/users/${user_id}`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateUserProfile: async (user_id, userData) => {
    try {
      const response = await axios.put(`${API_URL}/users/${user_id}`, userData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
};

export default userApi;
