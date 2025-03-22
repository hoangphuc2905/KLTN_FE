import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

const Logo = new URL("../../src/assets/logoLogin.png", import.meta.url).href;

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
    if (storedRoles.length === 1) {
      redirectToRolePage(storedRoles[0]);
    }
    setRoles(storedRoles);
  }, []);

  const redirectToRolePage = (role) => {
    const routes = {
      admin: "/admin/management/chart",
      lecturer: "/home",
      head_of_department: "/admin/management/chart",
      deputy_head_of_department: "/admin/management/chart",
      department_in_charge: "/admin/management/chart",
    };

    localStorage.setItem("current_role", role);
    window.dispatchEvent(new Event("storage"));
    navigate(routes[role] || "/home");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <header className="w-full flex justify-center py-4 bg-white shadow-md">
        <img src={Logo} alt="Logo" className="h-12" />
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
