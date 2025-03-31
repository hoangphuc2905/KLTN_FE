import { useEffect, useState } from "react";
import { Table, Button } from "antd";
import userApi from "../../../api/api";
import Header from "../../../components/header";
import AddWorkProcessPage from "./AddWorkProcessPage";
import Footer from "../../../components/footer";
import { useNavigate } from "react-router-dom";

const WorkProcessPage = () => {
  const [workProcesses, setWorkProcesses] = useState([]);
  const [showAddWorkProcessPopup, setShowAddWorkProcessPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkProcesses = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("Thiếu user_id");
        return;
      }

      try {
        const userWorks = await userApi.getWorkProcesses(user_id);
        const workProcessesWithDetails = await Promise.all(
          userWorks.map(async (userWork) => {
            const workUnit = await userApi.getWorkUnitById(
              userWork.work_unit_id
            );
            return {
              ...userWork,
              name_vi: workUnit.name_vi,
              address_vi: workUnit.address_vi,
            };
          })
        );
        setWorkProcesses(workProcessesWithDetails);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin quá trình công tác:", error);
      }
    };

    fetchWorkProcesses();
  }, []);

  const columns = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Mã cơ quan", dataIndex: "work_unit_id", key: "work_unit_id" },
    { title: "Tên cơ quan", dataIndex: "name_vi", key: "name_vi" },
    { title: "Địa chỉ", dataIndex: "address_vi", key: "address_vi" },
    { title: "Vai trò", dataIndex: "role_vi", key: "role_vi" },
    { title: "Ngày bắt đầu", dataIndex: "start_date", key: "start_date" },
    { title: "Ngày kết thúc", dataIndex: "end_date", key: "end_date" },
  ];

  const dataSource = workProcesses.map((process, index) => ({
    key: index + 1,
    stt: index + 1,
    work_unit_id: process.work_unit_id,
    name_vi: process.name_vi,
    address_vi: process.address_vi,
    role_vi: process.role_vi,
    start_date: new Date(process.start_date).toLocaleDateString("vi-VN"),
    end_date: process.end_date
      ? new Date(process.end_date).toLocaleDateString("vi-VN")
      : "--",
  }));

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-5 h-5"
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

        <div className="flex justify-end mb-4 mr-6">
          <Button
            type="primary"
            onClick={() => setShowAddWorkProcessPopup(true)}
          >
            + Thêm quá trình công tác
          </Button>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              bordered={false}
            />
          </div>
        </div>
      </div>
      {showAddWorkProcessPopup && (
        <AddWorkProcessPage onClose={() => setShowAddWorkProcessPopup(false)} />
      )}
      <Footer />
    </div>
  );
};

export default WorkProcessPage;
