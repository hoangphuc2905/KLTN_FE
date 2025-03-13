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

  getWorkProcesses: async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/userworks/${user_id}`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching work processes:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getWorkUnitById: async (work_unit_id) => {
    try {
      const response = await axios.get(`${API_URL}/workUnits/${work_unit_id}`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching work unit:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createWorkUnit: async (workUnitData) => {
    try {
      const response = await axios.post(`${API_URL}/workUnits`, workUnitData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating work unit:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createUserWork: async (userWorkData) => {
    try {
      const response = await axios.post(`${API_URL}/userworks`, userWorkData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating user work:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createFormula: async (formulaData) => {
    try {
      const response = await axios.post(`${API_URL}/formulas`, formulaData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating formula:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateFormula: async (formulaData) => {
    try {
      const response = await axios.put(`${API_URL}/formulas`, formulaData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating formula:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAttributeByYear: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/attributes/${year}`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching attributes:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getFormulaByYear: async (year) => {
    try {
      const response = await axios.get(`${API_URL}/formulas/${year}`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching formulas:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
};

export default userApi;
