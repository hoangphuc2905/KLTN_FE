import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const userApi = {
  getUserInfo: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No token found. Please log in.");
    }

    return await axios.get(`${API_URL}/auth/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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

  updateFormula: async (year, formulaData) => {
    try {
      const response = await axios.put(
        `${API_URL}/formulas/${year}`,
        formulaData
      );
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

  createAttribute: async (attributeData) => {
    try {
      const response = await axios.post(`${API_URL}/attributes`, attributeData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating attribute:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateAttribute: async (year, attributeData) => {
    try {
      const response = await axios.put(
        `${API_URL}/attributes/${year}`,
        attributeData
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating attribute:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  deleteAttributeByYear: async (year) => {
    try {
      const response = await axios.delete(`${API_URL}/attributes/${year}`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting attribute:", error);
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

  getAllYearsByFormula: async () => {
    try {
      const response = await axios.get(`${API_URL}/formulas/years`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching years:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  addNewYear: async (year) => {
    try {
      const response = await axios.post(`${API_URL}/formulas/add-year`, {
        year,
      });
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error adding new year:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createPaperType: async (paperTypeData) => {
    try {
      const response = await axios.post(`${API_URL}/papertypes`, paperTypeData);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating paper type:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllPaperTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/papertypes`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching paper types:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updatePaperType: async (paperTypeData) => {
    try {
      const response = await axios.put(
        `${API_URL}/papertypes/${paperTypeData._id}`,
        paperTypeData
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating paper type:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createPaperGroup: async (paperGroupData) => {
    try {
      const response = await axios.post(
        `${API_URL}/papergroups`,
        paperGroupData
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating paper group:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllPaperGroups: async () => {
    try {
      const response = await axios.get(`${API_URL}/papergroups`);
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching paper groups:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updatePaperGroup: async (paperGroupData) => {
    try {
      const response = await axios.put(
        `${API_URL}/papergroups/${paperGroupData._id}`,
        paperGroupData
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating paper group:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
};

export default userApi;
