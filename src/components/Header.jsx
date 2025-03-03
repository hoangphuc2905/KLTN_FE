import { useEffect, useState } from "react";
import Logo from "../assets/logoLogin.png";
import userApi from "../../src/api/api";

const Header = () => {
  const [user, setUser] = useState(null);

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
        console.log("Thông tin user:", response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="flex items-center justify-between h-[70px] px-6 w-full bg-white shadow-md">
      <img src={Logo} alt="Logo" className="h-12 w-auto" />

      <h1 className="text-lg font-bold text-black text-center">
        HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
        CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
      </h1>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">🔔</button>

        {user ? (
          <div className="flex items-center gap-2">
            <img
              src={user?.avatar || "https://via.placeholder.com/40"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />

            <div className="flex flex-col">
              <span className="text-blue-500 font-bold">{user.full_name}</span>
              <span className="text-gray-500 text-sm">{user.role_id}</span>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Đang tải...</span>
        )}
      </div>
    </header>
  );
};

export default Header;
