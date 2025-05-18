import { useEffect, useState } from "react";
import { Table, Button, Spin, Dropdown, Menu, Modal, message } from "antd";
import userApi from "../../../api/api";
import Header from "../../../components/Header";
import AddWorkProcessPage from "./AddWorkProcessPage";
import EditWorkProcessPage from "./EditWorkProcessPage";
import Footer from "../../../components/Footer";
import { useNavigate } from "react-router-dom";

const WorkProcessPage = () => {
  const [workProcesses, setWorkProcesses] = useState([]);
  const [showAddWorkProcessPopup, setShowAddWorkProcessPopup] = useState(false);
  const [showEditWorkProcessPopup, setShowEditWorkProcessPopup] =
    useState(false);
  const [selectedWorkProcess, setSelectedWorkProcess] = useState(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkProcesses = async () => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      console.error("Thiếu user_id");
      return;
    }
    setIsLoading(true);
    try {
      const userWorks = await userApi.getWorkProcesses(user_id);
      const workProcessesWithDetails = await Promise.all(
        userWorks.map(async (userWork) => {
          const workUnit = await userApi.getWorkUnitById(userWork.work_unit_id);
          return {
            ...userWork,
            name_vi: workUnit.name_vi,
            name_en: workUnit.name_en,
            address_vi: workUnit.address_vi,
            address_en: workUnit.address_en,
          };
        })
      );
      setWorkProcesses(workProcessesWithDetails);
    } catch (error) {
      console.error("Lỗi khi lấy thông tin quá trình công tác:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkProcesses();
  }, []);

  const handleEdit = (record) => {
    setSelectedWorkProcess(record);
    setShowEditWorkProcessPopup(true);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa quá trình công tác này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await userApi.deleteUserWorkById(record._id);
          fetchWorkProcesses();
          message.success("Xóa quá trình công tác thành công!");
        } catch (error) {
          console.error("Lỗi khi xóa quá trình công tác:", error);
        }
      },
    });
  };

  const columns = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Tên cơ quan", dataIndex: "name_vi", key: "name_vi" },
    { title: "Địa chỉ", dataIndex: "address_vi", key: "address_vi" },
    { title: "Vai trò", dataIndex: "role_vi", key: "role_vi" },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="1" onClick={() => handleEdit(record)}>
              Chỉnh sửa
            </Menu.Item>
            <Menu.Item key="2" onClick={() => handleDelete(record)}>
              Xóa
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="text">⋮</Button>
          </Dropdown>
        );
      },
    },
  ];

  const dataSource = workProcesses.map((process, index) => ({
    key: index + 1,
    stt: index + 1,
    _id: process._id,
    work_unit_id: process.work_unit_id,
    name_vi: process.name_vi,
    name_en: process.name_en,
    address_vi: process.address_vi,
    address_en: process.address_en,
    role_vi: process.role_vi,
    role_en: process.role_en,
    start_date: new Date(process.start_date).toLocaleDateString("vi-VN"),
    end_date: process.end_date
      ? new Date(process.end_date).toLocaleDateString("vi-VN")
      : "--",
    raw_start_date: process.start_date, // Giữ giá trị gốc
    raw_end_date: process.end_date, // Giữ giá trị gốc
  }));

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="flex flex-col pb-7 max-w-[calc(100%-220px)] mx-auto max-sm:max-w-[calc(100%-32px)]">
          <div className="w-full bg-white">
            <Header />
          </div>

          <div className="self-center w-full max-w-[1563px] px-6 pt-[80px] bg-[#E7ECF0] z-10 max-md:px-4 max-sm:px-4 max-sm:pt-[60px]">
            <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
                alt="Home Icon"
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <span
                onClick={() => navigate("/home")}
                className="cursor-pointer hover:text-blue-500"
              >
                Trang chủ
              </span>
              <span className="text-gray-400"> &gt; </span>
              <span className="font-semibold text-sky-900">
                Quá trình công tác
              </span>
            </div>
          </div>

          <div className="flex justify-end mb-4 mr-4 sm:mr-6 pt-16">
            <Button
              type="primary"
              onClick={() => setShowAddWorkProcessPopup(true)}
            >
              + Thêm quá trình công tác
            </Button>
          </div>

          <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full max-sm:px-4">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  pagination={false}
                  bordered={false}
                  scroll={{ x: 320 }}
                />
              )}
            </div>
          </div>
        </div>
        {showAddWorkProcessPopup && (
          <AddWorkProcessPage
            onClose={() => setShowAddWorkProcessPopup(false)}
            refreshData={fetchWorkProcesses}
          />
        )}
        {showEditWorkProcessPopup && (
          <EditWorkProcessPage
            workProcess={selectedWorkProcess}
            onClose={() => setShowEditWorkProcessPopup(false)}
            refreshData={fetchWorkProcesses}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WorkProcessPage;
