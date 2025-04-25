import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

const Logo = new URL("../../src/assets/logo.png", import.meta.url).href;

const roleDetails = {
  admin: {
    name: "Quản trị viên",
    icon: "🛠️",
    description: "Quản lý toàn hệ thống",
  },
  lecturer: {
    name: "Giảng viên",
    icon: "📚",
    description: "Giảng dạy và hướng dẫn sinh viên",
  },
  head_of_department: {
    name: "Trưởng khoa",
    icon: "🏫",
    description: "Quản lý khoa chuyên môn",
  },
  deputy_head_of_department: {
    name: "Phó khoa",
    icon: "📋",
    description: "Hỗ trợ trưởng khoa",
  },
  department_in_charge: {
    name: "Bộ phận phụ trách",
    icon: "🎓",
    description: "Quản lý bộ môn hoặc phòng ban",
  },
};

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const storedRoles = JSON.parse(localStorage.getItem("roles")) || [];
    const normalizedRoles = storedRoles.map((role) => role.toLowerCase()); // Chuyển về chữ thường
    if (normalizedRoles.length === 1) {
      redirectToRolePage(normalizedRoles[0]);
    }
    setRoles(normalizedRoles);
  }, []);

  const redirectToRolePage = (role) => {
    const routes = {
      admin: "/admin/management/chart",
      lecturer: "/home",
      head_of_department: "/management/chart",
      deputy_head_of_department: "/management/chart",
      department_in_charge: "/management/chart",
    };

    const normalizedRole = role.toLowerCase(); // Chuẩn hóa vai trò về chữ thường
    const targetRoute = routes[normalizedRole] || "/home"; // Lấy đường dẫn hoặc mặc định là "/home"

    localStorage.setItem("current_role", normalizedRole);
    window.dispatchEvent(new Event("storage"));
    navigate(targetRoute);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="flex items-center h-[60px] px-20 w-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5 max-md:max-w-full">
        <div className="flex items-center w-full">
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Logo"
              className="object-contain h-full max-w-full  w-[100px] max-md:w-[50px]"
            />
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-sm font-bold text-center text-zinc-800 max-md:text-xs">
              HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
              CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
            </h1>
          </div>
        </div>
      </header>

      <div className="mt-12 w-full max-w-4xl text-center">
        <h2 className="text-2xl font-semibold">Chọn quyền đăng nhập</h2>
        <p className="text-gray-600 mt-2">Vui lòng chọn vai trò của bạn:</p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {roles.map((role) => (
            <div
              key={role}
              className="flex flex-col items-center p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-100 w-48"
              onClick={() => redirectToRolePage(role)}
            >
              <span className="text-3xl">{roleDetails[role]?.icon}</span>
              <h3 className="text-lg font-medium mt-2">
                {roleDetails[role]?.name || role}
              </h3>
              <p className="text-gray-500 text-sm text-center">
                {roleDetails[role]?.description || "Vai trò không xác định"}
              </p>
            </div>
          ))}
        </div>

        <Button
          type="primary"
          danger
          className="mt-6 px-6 py-2"
          onClick={() => {
            localStorage.clear();
            navigate("/");
          }}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
