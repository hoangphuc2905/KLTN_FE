import { useEffect, useState } from "react";
import { Table, Button } from "antd";
import Header from "../../../components/header";
import userApi from "../../../api/api";
import AddWorkProcessPage from "./AddWorkProcessPage";

const WorkProcessPage = () => {
  const [setWorkProcesses] = useState([]);
  const [showAddWorkProcessPopup, setShowAddWorkProcessPopup] = useState(false);
  useEffect(() => {
    const fetchWorkProcesses = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("Thiếu user_id");
        return;
      }

      try {
        const response = await userApi.getWorkProcesses(user_id);
        setWorkProcesses(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin quá trình công tác:", error);
      }
    };

    fetchWorkProcesses();
  }, []);

  const columns = [
    { title: "STT", dataIndex: "stt", key: "stt" },
    { title: "Mã cơ quan", dataIndex: "code", key: "code" },
    { title: "Tên cơ quan", dataIndex: "organization", key: "organization" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Vai trò", dataIndex: "position", key: "position" },
    { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate" },
    { title: "Ngày kết thúc", dataIndex: "endDate", key: "endDate" },
  ];

  const dataSource = [
    {
      key: "1",
      stt: 1,
      code: "001",
      organization: "Đại học Công nghiệp Thành phố Hồ Chí Minh",
      address: "HCM",
      position: "Giảng viên",
      startDate: "02/02/2022",
      endDate: "--",
    },
    {
      key: "2",
      stt: 2,
      code: "002",
      organization: "Đại học Công nghiệp Thành phố Hồ Chí Minh",
      address: "HCM",
      position: "Giảng viên",
      startDate: "02/02/2022",
      endDate: "02/02/2023",
    },
    {
      key: "3",
      stt: 3,
      code: "003",
      organization: "Đại học Công nghiệp Thành phố Hồ Chí Minh",
      address: "HCM",
      position: "Giảng viên",
      startDate: "02/02/2022",
      endDate: "--",
    },
  ];

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
            <span>Trang chủ</span>
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
    </div>
  );
};

export default WorkProcessPage;
