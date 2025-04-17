import { useEffect, useState, useRef } from "react";
import Logo from "../assets/logoLogin.png";
import userApi from "../api/api";
import { FaChevronDown } from "react-icons/fa";
import ChangePasswordPopup from "../pages/user/profile/ChangePasswordPopup";
import { message } from "antd";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState("");
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // State to store unread notifications count
  const menuRef = useRef(null);

  const roleMapping = {
    student: "Sinh viên",
    admin: "Quản trị viên",
    lecturer: "Giảng viên",
    head_of_department: "Trưởng khoa",
    deputy_head_of_department: "Phó khoa",
    department_in_charge: "Bộ phận phụ trách",
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Thiếu token. Chuyển hướng đến trang đăng nhập.");
        window.location.href = "/";
        return;
      }

      try {
        const response = await userApi.getUserInfo({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        console.log("Thông tin user:", response.data);
      } catch (error) {
        if (error.response?.data?.message === "Invalid token") {
          message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error(
            "Lỗi khi lấy thông tin user:",
            error.response?.data || error.message
          );
        }
      }
    };

    fetchUserData();
    const role = localStorage.getItem("current_role");
    const roleInVietnamese = roleMapping[role] || "Sinh viên";
    setCurrentRole(roleInVietnamese);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchUnreadNotifications = async () => {
      try {
        const receiverId = localStorage.getItem("user_id");
        const currentRole = localStorage.getItem("current_role");

        if (!receiverId || !currentRole) {
          console.error("Thiếu receiverId hoặc currentRole");
          return;
        }

        const response = await userApi.getMessagesByReceiverId(receiverId);
        if (!response || response.length === 0) {
          setUnreadCount(0);
          return;
        }

        const filteredMessages = response.filter((msg) => {
          const isApprovalType = msg.message_type === "Request for Approval";
          if (currentRole === "lecturer" && isApprovalType) {
            return false;
          }
          return !msg.isread;
        });

        setUnreadCount(filteredMessages.length);
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error);
      }
    };

    fetchUnreadNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    message.success("Bạn đã đăng xuất thành công.");
    window.location.href = "/";
  };

  const openProfile = () => {
    window.location.href = "/profile";
  };

  const openUpdateProfile = () => {
    window.location.href = "/update-profile";
  };

  const openWorkHistory = () => {
    window.location.href = "/work-process";
  };

  const openNotifications = () => {
    window.location.href = "/notifications";
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-[70px] px-4 md:px-6 lg:px-8">
        <img
          src={Logo}
          alt="Logo"
          className="h-12 w-auto cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
        <h1 className="text-sm font-bold text-black text-center">
          HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
          CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
        </h1>

        <div className="relative flex items-center gap-4" ref={menuRef}>
          <button
            className="text-gray-500 hover:text-gray-700 relative"
            onClick={openNotifications}
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center transform translate-x-1/2 -translate-y-1/2">
                {unreadCount > 5 ? "5+" : unreadCount}
              </span>
            )}
          </button>

          {user ? (
            <div
              className="flex items-center gap-2 cursor-pointer relative"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <img
                src={user?.avatar || "https://via.placeholder.com/40"}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border border-gray-300"
              />
              <div className="text-gray-700 font-semibold flex flex-col items-start">
                <span>{user.full_name}</span>
                <span className="text-sm text-gray-500">
                  {currentRole ? `${currentRole}` : "Sinh viên"}
                </span>
              </div>
              <FaChevronDown className="text-gray-500 text-xs" />

              {/* Menu Dropdown */}
              {menuOpen && (
                <div className="absolute top-full left-0 mt-2 w-60 bg-white shadow-lg rounded-lg py-2 border z-50">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    onClick={openProfile}
                  >
                    👤 Thông tin cá nhân
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    onClick={openUpdateProfile}
                  >
                    👤 Cập nhật thông tin cá nhân
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    onClick={openWorkHistory}
                  >
                    👤 Quá trình công tác
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    onClick={() => setShowChangePasswordPopup(true)}
                  >
                    🔑 Đổi mật khẩu
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-red-500"
                    onClick={handleLogout}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500">Đang tải...</span>
          )}
        </div>
      </div>
      {showChangePasswordPopup && (
        <ChangePasswordPopup
          onClose={() => setShowChangePasswordPopup(false)}
        />
      )}
    </header>
  );
};

export default Header;
