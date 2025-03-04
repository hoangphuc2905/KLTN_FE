import { useEffect, useState, useRef } from "react";
import Logo from "../assets/logoLogin.png";
import userApi from "../../src/api/api";
import { FaChevronDown } from "react-icons/fa";

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("Thiếu user_id");
        return;
      }

      try {
        const response = await userApi.getUserInfo(user_id);
        setUser(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUserData();
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

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const openProfile = () => {
    window.location.href = "/profile";
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between h-[70px] px-4 md:px-6 lg:px-8">
        <img src={Logo} alt="Logo" className="h-12 w-auto" />

        <h1 className="text-lg font-bold text-black text-center">
          HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
          CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
        </h1>

        <div className="relative flex items-center gap-4" ref={menuRef}>
          <button className="text-gray-500 hover:text-gray-700">🔔</button>

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
              <span className="text-gray-700 font-semibold flex items-center gap-1">
                {user.full_name}{" "}
                <FaChevronDown className="text-gray-500 text-xs" />
              </span>

              {/* Menu Dropdown */}
              {menuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 border z-50">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    onClick={openProfile}
                  >
                    👤 Thông tin cá nhân
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                    onClick={() => alert("Đổi mật khẩu")}
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
    </header>
  );
};

export default Header;
