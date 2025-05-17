import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor để thêm Access Token vào header của mỗi yêu cầu
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor để xử lý lỗi 401 và làm mới token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        const { accessToken } = response.data;

        localStorage.setItem("accessToken", accessToken);

        // Cập nhật header và thử lại yêu cầu gốc
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error(
          "Failed to refresh token:",
          refreshError.response?.data || refreshError.message
        );
        // Nếu refresh token hết hạn, xóa token và chuyển hướng đến trang đăng nhập
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user_id");
        localStorage.removeItem("roles");
        localStorage.removeItem("email");
        localStorage.removeItem("user_type");
        localStorage.removeItem("current_role");
        localStorage.removeItem("department");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.student_id || data.lecturer_id,
        roles: data.roles,
        email: data.email,
        userType: data.user_type,
        department: data.department,
      };

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user_id", userInfo.userId);
      localStorage.setItem("roles", JSON.stringify(userInfo.roles));
      localStorage.setItem("email", userInfo.email || "");
      localStorage.setItem("user_type", userInfo.userType || "");
      localStorage.setItem("department", userInfo.department || "");

      return userInfo;
    } catch (error) {
      console.error("Error during login:", error);
      throw error.response?.data || "Login failed.";
    }
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("Bạn chưa đăng nhập!");
      }

      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });
      const { accessToken } = response.data;

      localStorage.setItem("accessToken", accessToken);
      return { accessToken };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error.response?.data || "Token refresh failed.";
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.post("/auth/change-password", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  },

  updateUserInfo: async (data) => {
    try {
      const response = await api.put("/auth/update-info", data);
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
      const response = await api.patch(`/auth/approve/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error during student approval:", error);
      throw error.response?.data || "Approval failed.";
    }
  },
};

export { api };
export default authApi;
