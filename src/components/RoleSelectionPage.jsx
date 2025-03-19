import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Button } from "antd";

const Logo = new URL("../../src/assets/logoLogin.png", import.meta.url).href;
const { Title, Text } = Typography;

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
      department_in_charge: "/subject-home",
    };

    localStorage.setItem("current_role", role);

    console.log("Chuyển hướng đến:", routes[role]);

    window.dispatchEvent(new Event("storage"));

    navigate(routes[role] || "/home");
  };

  return (
    <>
      <div className="flex overflow-hidden flex-col pb-24 bg-white max-md:pb-12">
        <header className="flex flex-col items-center h-[60px] px-20 w-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5 max-md:max-w-full">
          <img
            src={Logo}
            alt="Logo"
            className="object-contain z-10 h-full max-w-full aspect-[7.19] w-[600px] max-md:w-[200px]"
          />
        </header>

        <div className="flex flex-col items-center mt-10 px-4">
          <Title level={3}>Chọn quyền đăng nhập</Title>
          <Text>Vui lòng chọn vai trò của bạn:</Text>

          <div className="mt-5 w-full max-w-md">
            {roles.map((role) => (
              <Card
                key={role}
                hoverable
                className="mb-3 text-center cursor-pointer"
                onClick={() => redirectToRolePage(role)}
              >
                <Title level={4}>
                  {roleDetails[role]?.icon} {roleDetails[role]?.name || role}
                </Title>
                <Text>
                  {roleDetails[role]?.description || "Vai trò không xác định"}
                </Text>
              </Card>
            ))}
          </div>

          <Button
            type="primary"
            danger
            className="mt-4"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </>
  );
};

export default RoleSelectionPage;
