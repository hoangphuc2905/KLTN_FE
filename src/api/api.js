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

  getWorkProcesses: async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/userworks/${user_id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching work processes:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getWorkUnitById: async (work_unit_id) => {
    try {
      const response = await axios.get(`${API_URL}/workUnits/${work_unit_id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching work unit:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createWorkUnit: async (workUnitData) => {
    try {
      const response = await axios.post(`${API_URL}/workUnits`, workUnitData);
      return response.data;
    } catch (error) {
      console.error("Error creating work unit:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createUserWork: async (userWorkData) => {
    try {
      const response = await axios.post(`${API_URL}/userworks`, userWorkData);
      return response.data;
    } catch (error) {
      console.error("Error creating user work:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createFormula: async (formulaData) => {
    try {
      const response = await axios.post(`${API_URL}/formulas`, formulaData);
      return response.data;
    } catch (error) {
      console.error("Error creating formula:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getUserWorksByUserId: async (user_id) => {
    try {
      const response = await axios.get(`${API_URL}/userworks/${user_id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user works:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Cập nhật công thức theo khoảng thời gian
  updateFormula: async (startDate, endDate, formulaData) => {
    try {
      const response = await axios.put(
        `${API_URL}/formulas/update-by-date-range?startDate=${startDate}&endDate=${endDate}`,
        formulaData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating formula:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateFormulaById: async (formulaId, formulaData) => {
    try {
      const response = await axios.put(
        `${API_URL}/formulas/update/${formulaId}`,
        formulaData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating formula:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  calculateScoreFromInput: async (inputData) => {
    try {
      const response = await axios.post(
        `${API_URL}/authorScores/input`,
        inputData
      );
      return response.data;
    } catch (error) {
      console.error("Error calculating score:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Lấy công thức theo khoảng thời gian
  getFormulaByDateRange: async (startDate, endDate) => {
    try {
      const response = await axios.post(
        `${API_URL}/formulas/get-by-date-range`,
        {
          startDate,
          endDate,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching formulas:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Lấy tất cả
  getAllFormula: async () => {
    try {
      const response = await axios.get(`${API_URL}/formulas`);
      return response.data;
    } catch (error) {
      console.error("Error fetching date ranges:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Tạo mới một Attribute
  createAttribute: async (attributeData) => {
    try {
      const response = await axios.post(`${API_URL}/attributes`, attributeData);
      return response.data;
    } catch (error) {
      console.error("Error creating attribute:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Cập nhật Attribute theo tên
  updateAttribute: async (name, attributeData) => {
    try {
      const response = await axios.put(
        `${API_URL}/attributes/${name}`,
        attributeData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating attribute:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Lấy tất cả Attribute
  getAllAttributes: async () => {
    try {
      const response = await axios.get(`${API_URL}/attributes`);
      return response.data;
    } catch (error) {
      console.error("Error fetching attributes:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Lấy Attribute theo ID
  getAttributeById: async (id) => {
    try {
      const response = await axios.post(`${API_URL}/attributes/id`, { id });
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching attribute by ID:",
        error.response?.data || error.message
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Xóa Attribute theo tên
  deleteAttributeByName: async (name) => {
    try {
      const response = await axios.delete(`${API_URL}/attributes/${name}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting attribute:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // Xóa công thức theo khoảng thời gian
  deleteFormulaByDateRange: async (startDate, endDate) => {
    try {
      const response = await axios.delete(
        `${API_URL}/formulas?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting formula:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  addNewYear: async (year) => {
    try {
      const response = await axios.post(`${API_URL}/formulas/add-year`, {
        year,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding new year:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createPaperType: async (paperTypeData) => {
    try {
      const response = await axios.post(`${API_URL}/papertypes`, paperTypeData);
      return response.data;
    } catch (error) {
      console.error("Error creating paper type:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllPaperTypes: async () => {
    try {
      const response = await axios.get(`${API_URL}/papertypes`);

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

      return response.data;
    } catch (error) {
      console.error("Error creating paper group:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllPaperGroups: async () => {
    try {
      const response = await axios.get(`${API_URL}/papergroups`);

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

      return response.data;
    } catch (error) {
      console.error("Error updating paper group:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllLecturers: async () => {
    try {
      const response = await axios.get(`${API_URL}/lecturers`);

      return response.data;
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);

      return response.data;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getDepartmentById: async (department) => {
    try {
      const response = await axios.get(`${API_URL}/departments/${department}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching department:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllDepartments: async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);

      return response.data;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getLecturerAndStudentByDepartment: async (department) => {
    try {
      const response = await axios.get(
        `${API_URL}/lecturers/lecturers-and-students/${department}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching users by department:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateStatusLecturerById: async (lecturer_id, isActive) => {
    try {
      const response = await axios.put(
        `${API_URL}/lecturers/status/${lecturer_id}`,
        { isActive }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating lecturer status:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateStatusStudentById: async (student_id, isActive) => {
    try {
      const response = await axios.put(
        `${API_URL}/students/status/${student_id}`,
        { isActive }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating student status:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  assignRole: async (adminId, lecturerId, newRole) => {
    try {
      const response = await axios.post(`${API_URL}/lecturers/assign-role`, {
        adminId,
        lecturerId,
        newRole,
      });

      return response.data;
    } catch (error) {
      console.error("Error assigning role:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  deleteRole: async (adminId, lecturerId, role) => {
    try {
      const response = await axios.post(`${API_URL}/lecturers/delete-role`, {
        adminId,
        lecturerId,
        role,
      });

      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllRoles: async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`);

      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getLecturerById: async (lecturer_id) => {
    try {
      const response = await axios.get(`${API_URL}/lecturers/${lecturer_id}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching lecturer:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getStudentById: async (student_id) => {
    try {
      const response = await axios.get(`${API_URL}/students/${student_id}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching student:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllScientificPapers: async (academicYear) => {
    try {
      const response = await axios.get(`${API_URL}/scientificPapers`, {
        params: { academicYear },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllScientificPapersByAllStatus: async (academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/scientificPapers/getAllScientificPapersByAllStatus`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getScientificPapersByTitle: async (title) => {
    try {
      if (!title) {
        throw new Error("Title is required");
      }

      const response = await axios.get(`${API_URL}/scientificPapers/by-title`, {
        params: { title },
      });

      return response.data.scientificPapers || [];
    } catch (error) {
      console.error("Error fetching scientific papers by title:", error);
      throw error.response?.data || { message: "Lỗi kết nối đến server" };
    }
  },

  getScientificPapersByDepartment: async (department, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/scientificPapers/department/${department}`,
        {
          params: { academicYear }, // Add academicYear to query string
        }
      );
      return response.data; // Return only the data property
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getScientificPaperById: async (paper_id) => {
    try {
      const response = await axios.get(
        `${API_URL}/scientificPapers/${paper_id}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching scientific paper:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateScientificPaperById: async (paper_id, paperData) => {
    try {
      const response = await axios.put(
        `${API_URL}/scientificPapers/${paper_id}`,
        paperData
      );

      return response.data;
    } catch (error) {
      console.error("Error updating scientific paper:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getScientificPapersByAuthorId: async (user_id, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/scientificPapers/author/${user_id}`,
        {
          params: { academicYear }, // Add academicYear to query string
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAuthorsByPaperId: async (paper_id) => {
    try {
      const response = await axios.get(
        `${API_URL}/paperauthor/paper/${paper_id}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching authors:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${API_URL}/articlesAI/uploadimage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response?.data || error.message
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createScientificPaper: async (paperData) => {
    try {
      const response = await axios.post(
        `${API_URL}/scientificPapers`,
        paperData
      );

      return response.data;
    } catch (error) {
      console.error("Error creating scientific paper:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createMessage: async (messageData) => {
    try {
      const response = await axios.post(`${API_URL}/messages`, messageData);

      return response.data;
    } catch (error) {
      console.error("Error creating message:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getMessagesByReceiverId: async (receiverId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/receiver/${receiverId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  markMessageAsRead: async (messageId) => {
    try {
      const response = await axios.put(
        `${API_URL}/messages/read/${messageId}`,
        {}
      );

      return response.data;
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateScientificPaperStatus: async (paperId, status) => {
    try {
      const response = await axios.put(
        `${API_URL}/scientificPapers/status/${paperId}`,
        { status }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating scientific paper status:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createPaperDownload: async (paperDownloadData) => {
    try {
      const response = await axios.post(
        `${API_URL}/paperdownload`,
        paperDownloadData
      );

      return response.data;
    } catch (error) {
      console.error("Error creating paper download:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getDownloadCountByPaperId: async (paperId) => {
    try {
      const response = await axios.get(
        `${API_URL}/paperdownload/count/${paperId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching download count:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  createPaperView: async (paperViewData) => {
    try {
      const response = await axios.post(`${API_URL}/paperview`, paperViewData);

      return response.data;
    } catch (error) {
      console.error("Error creating paper view:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getViewCountByPaperId: async (paperId) => {
    try {
      const response = await axios.get(`${API_URL}/paperview/count/${paperId}`);

      return response.data; // Return the response data
    } catch (error) {
      console.error("Error fetching view count:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getCollectionsByUserId: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/papercollections/${userId}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  createCollection: async (collectionData) => {
    try {
      const response = await axios.post(
        `${API_URL}/papercollections`,
        collectionData
      );

      return response.data;
    } catch (error) {
      console.error("Error creating collection:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  addPaperToCollection: async (payload) => {
    try {
      const response = await axios.post(
        `${API_URL}/papercollections/addpaper`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error("Error adding paper to collection:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  removePaperFromCollection: async (payload) => {
    try {
      const response = await axios.post(
        `${API_URL}/papercollections/removepaper`,
        payload
      );

      return response.data;
    } catch (error) {
      console.error("Error removing paper from collection:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateCollection: async (collectionId, collectionData) => {
    try {
      const response = await axios.put(
        `${API_URL}/papercollections/${collectionId}`,
        collectionData
      );

      return response.data;
    } catch (error) {
      console.error("Error updating collection:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  deleteCollection: async (collectionId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/papercollections/${collectionId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error deleting collection:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  isPaperInCollection: async (userId, paperId) => {
    try {
      const response = await axios.get(
        `${API_URL}/papercollections/check/${userId}/${paperId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error checking paper in collection:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTop5NewestScientificPapers: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/scientificPapers/top5-newest`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching top 5 newest scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTop5MostViewedAndDownloadedPapers: async (academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/scientificPapers/top5-most-viewed-downloaded`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching top 5 most viewed and downloaded papers:",
        error
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTotalPapersByAuthorId: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/total-by-author/${userId}`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching total papers by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getTotalViewsByAuthorId: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/total-views-by-author/${userId}`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching total views by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getTotalDownloadsByAuthorId: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/total-downloads-by-author/${userId}`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching total downloads by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getTotalPointByAuthorId: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/total-points-by-author/${userId}`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching total points by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getTop5PapersByAuthorId: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-papers-by-author/${userId}`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching top 5 papers by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllPaperAuthorsByTolalPointsAndTotalPapers: async (academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/paperauthor/statistics-by-department`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching all paper authors by total points and total papers:",
        error
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getPaperAuthorsByDepartment: async (department, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/paperauthor/department/${department}`,
        {
          params: { academicYear }, // Pass academicYear as a query parameter
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching paper authors by department:",
        error.response?.data || error.message
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getPapersByAuthor: async (authorId) => {
    try {
      const response = await fetch(`/api/papers/author/${authorId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch papers by author");
      }
      return await response.json();
    } catch (error) {
      console.error("Error in getPapersByAuthor:", error);
      throw error;
    }
  },

  getStatisticsByDepartmentId: async (departmentId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/statistics-by-department/${departmentId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by department ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  // getTop5MostViewedAndDownloadedPapers: async () => {
  //   try {
  //     const response = await axios.get(
  //       `${API_URL}/statistics/top5-most-viewed-and-downloaded-papers`
  //     );
  //     console.log("API Response:", response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error(
  //       "Error fetching top 5 most viewed and downloaded papers:",
  //       error
  //     );
  //     throw error.response?.data || "Lỗi kết nối đến server";
  //   }
  // },

  getStatisticsForAll: async (academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/statistics-for-all`,
        {
          params: { academicYear },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching statistics for all:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTop5MostViewedAndDownloadedPapersByDepartment: async (
    departmentId,
    academicYear
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-papers-by-department/${departmentId}`,
        {
          params: { academicYear }, // Pass academicYear as a query parameter
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error fetching top 3 most viewed and downloaded papers by department:",
        error
      );
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getStatisticsByAllGroup: async (academicYear) => {
    try {
      const response = await axios.get(`${API_URL}/statistics/by-all-group`, {
        params: { academicYear },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by group ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getStatisticsTop5ByAllDepartment: async (academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-by-all-group`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by department ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getStatisticsTop5ByType: async (academicYear) => {
    try {
      const response = await axios.get(`${API_URL}/statistics/top5-by-type`, {
        params: { academicYear },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by type:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getStatisticsByGroupByDepartment: async (departmentId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/group-by-department/${departmentId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by department ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTop5AuthorsByDepartment: async (departmentId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-authors-by-department/${departmentId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching top 5 authors by department ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getStatisticsTop5ByTypeByDepartment: async (departmentId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-by-type-by-department/${departmentId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by type:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getPaperGroupsByUser: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/paper-group-by-user/${userId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching statistics by user ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTop5PapersByPointByUser: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-papers-points-by-author/${userId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching top 5 papers by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTop5PaperTypesByUser: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/statistics/top5-paper-types-by-user/${userId}`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching top 5 paper types by user ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAcademicYears: async () => {
    try {
      const response = await axios.get(`${API_URL}/academic-years`);

      return response.data;
    } catch (error) {
      console.error("Error fetching academic years:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getRecommendations: async (paperId) => {
    try {
      const response = await axios.get(`${API_URL}/recommendations/${paperId}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getRecommendationsByUserHistory: async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/recommendations/user-history/${userId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations by user history:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  semanticSearch: async (query, department = null, criteria = null) => {
    try {
      const response = await axios.post(`${API_URL}/search/semantic`, {
        query,
        department,
        criteria,
      });

      return response.data;
    } catch (error) {
      console.error("Error performing semantic search:", error);
      throw error.response?.data?.message || "Lỗi kết nối đến server";
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_URL}/students`, studentData);

      return response.data;
    } catch (error) {
      console.error("Error creating student:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  importStudentsFromExcel: async (formData) => {
    try {
      if (!formData) {
        throw new Error("FormData không được cung cấp");
      }

      console.log("FormData entries:", [...formData.entries()]);

      const response = await axios.post(
        `${API_URL}/students/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error importing students from Excel:", error);
      if (error.response) {
        throw error.response.data;
      }
      throw new Error("Lỗi kết nối đến server");
    }
  },

  importLecturersFromExcel: async (formData) => {
    try {
      if (!formData) {
        throw new Error("FormData không được cung cấp");
      }

      console.log("FormData entries:", [...formData.entries()]);

      const response = await axios.post(
        `${API_URL}/lecturers/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error importing students from Excel:", error);
      if (error.response) {
        throw error.response.data;
      }
      throw new Error("Lỗi kết nối đến server");
    }
  },

  createLecturer: async (lecturerData) => {
    try {
      const response = await axios.post(`${API_URL}/lecturers`, lecturerData);

      return response.data;
    } catch (error) {
      console.error("Error creating lecturer:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getMessagesByStatusRejectionByPaperId: async (paperId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/paperbyrejection/${paperId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getMessagesByStatusRequestforEditByPaperId: async (paperId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/paperbyrequestforedit/${paperId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
  getMessagesByPaperByRejection: async (paperId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/paperbyrejection/${paperId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối đến server" };
    }
  },

  getMessagesByPaperByRequestForEdit: async (paperId) => {
    try {
      const response = await axios.get(
        `${API_URL}/messages/paperbyrequestforedit/${paperId}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối đến server" };
    }
  },

  getAllPaperViewsByUser: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/paperview/user/${userId}`);

      return response.data;
    } catch (error) {
      console.error("Error fetching paper views:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getAllPaperDownloadsByUser: async (userId) => {
    try {
      const response = await axios.get(
        `${API_URL}/paperdownload/user/${userId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching paper downloads:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getTotalPointsByAuthorAndYear: async (userId, academicYear) => {
    try {
      const response = await axios.get(
        `${API_URL}/paperauthor/${userId}/total-points`,
        {
          params: { academicYear },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching total points by author ID:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  getInactiveStudentsByDepartment: async (departmentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/students/inactive/${departmentId}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching inactive students:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },
};

export default userApi;
