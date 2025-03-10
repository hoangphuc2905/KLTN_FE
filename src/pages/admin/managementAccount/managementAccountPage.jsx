import React, { useState } from "react";
import Header from "../../../components/header";
import { Input, Select, Table } from "antd";

const ManagementUsers = () => {
  const users = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      position: "Giảng viên",
      department: "CÔNG NGHỆ THÔNG TIN",
      studentId: "21040431",
      role: "USER",
      status: "Hoạt động",
    },
    {
      id: "2",
      name: "Nguyễn Duy Thanh",
      position: "Sinh viên",
      department: "QUẢN TRỊ KINH DOANH",
      studentId: "22055592",
      role: "USER",
      status: "Khóa",
    },
    {
      id: "3",
      name: "Huỳnh Hoàng Phúc",
      position: "Sinh viên",
      department: "TÀI CHÍNH KẾ TOÁN",
      studentId: "11024521",
      role: "USER",
      status: "Hoạt động",
    },
    {
      id: "4",
      name: "Nguyễn Văn D",
      position: "Giảng viên",
      department: "CƠ NGOẠI NGỮ",
      studentId: "12230421",
      role: "USER",
      status: "Hoạt động",
    },
    {
      id: "5",
      name: "Nguyễn Văn C",
      position: "Giảng viên",
      department: "CƠ NGOẠI NGỮ",
      studentId: "12230421",
      role: "USER",
      status: "Hoạt động",
    },
  ];

  const admins = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      position: "Giảng viên",
      department: "CÔNG NGHỆ THÔNG TIN",
      studentId: "21040431",
      role: "ADMIN",
      status: "Hoạt động",
    },
    {
      id: "2",
      name: "Nguyễn Duy Thanh",
      position: "Trưởng khoa CNTT",
      department: "QUẢN TRỊ KINH DOANH",
      studentId: "22055592",
      role: "ADMIN",
      status: "Khóa",
    },
    {
      id: "3",
      name: "Huỳnh Hoàng Phúc",
      position: "Phó trưởng khoa TCKT",
      department: "TÀI CHÍNH KẾ TOÁN",
      studentId: "11024521",
      role: "ADMIN",
      status: "Hoạt động",
    },
    {
      id: "4",
      name: "Nguyễn Văn D",
      position: "Giảng viên",
      department: "CƠ NGOẠI NGỮ",
      studentId: "12230421",
      role: "ADMIN",
      status: "Hoạt động",
    },
    {
      id: "5",
      name: "Nguyễn Văn C",
      position: "Giảng viên",
      department: "CƠ NGOẠI NGỮ",
      studentId: "12230421",
      role: "ADMIN",
      status: "Hoạt động",
    },
  ];
  const [activeTab, setActiveTab] = useState("user");
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("Tất cả");
  const [filterPosition, setFilterPosition] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const displayedUsers = activeTab === "user" ? users : admins;

  const uniquePositions = [
    "Tất cả",
    ...new Set(displayedUsers.map((user) => user.position)),
  ];
  const uniqueDepartments = [
    "Tất cả",
    ...new Set(displayedUsers.map((user) => user.department)),
  ];
  const uniqueStatuses = [
    "Tất cả",
    ...new Set(displayedUsers.map((user) => user.status)),
  ];

  const filteredUsers = displayedUsers.filter((user) => {
    return (
      (filterName === "" || user.name.includes(filterName)) &&
      (filterId === "" || user.studentId.includes(filterId)) &&
      (filterDepartment === "Tất cả" || user.department === filterDepartment) &&
      (filterPosition === "Tất cả" || user.position === filterPosition) &&
      (filterStatus === "Tất cả" || user.status === filterStatus)
    );
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "HỌ VÀ TÊN",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "CHỨC VỤ",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "MSSV/MSGV",
      dataIndex: "studentId",
      key: "studentId",
    },
    {
      title: "QUYỀN",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            status === "Hoạt động" ? "text-green-700" : "text-red-700"
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (text, record) => (
        <button className="text-blue-500">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png"
            alt="Edit"
            className="w-5 h-5"
          />
        </button>
      ),
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
            <span className="font-semibold text-sm text-sky-900">
              Quản lý người dùng
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex border-b">
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "user"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("user")}
            >
              Người dùng
            </button>
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "admin"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("admin")}
            >
              Admin
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative">
                <button
                  className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg border"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3161/3161370.png"
                    alt="Filter Icon"
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Bộ lọc</span>
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg">
                    <form className="relative px-4 py-5 w-full bg-white max-w-[500px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Họ và tên:
                        </label>
                        <Input
                          type="text"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          MSSV/MSGV:
                        </label>
                        <Input
                          type="text"
                          value={filterId}
                          onChange={(e) => setFilterId(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Khoa:
                        </label>
                        <Select
                          value={filterDepartment}
                          onChange={(value) => setFilterDepartment(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueDepartments.map((department) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Chức vụ:
                        </label>
                        <Select
                          value={filterPosition}
                          onChange={(value) => setFilterPosition(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniquePositions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Trạng thái:
                        </label>
                        <Select
                          value={filterStatus}
                          onChange={(value) => setFilterStatus(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterName("");
                          setFilterId("");
                          setFilterDepartment("Tất cả");
                          setFilterPosition("Tất cả");
                          setFilterStatus("Tất cả");
                        }}
                        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md text-sm"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <Table
                columns={columns}
                dataSource={filteredUsers}
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total: filteredUsers.length,
                  onChange: (page) => setCurrentPage(page),
                }}
                rowKey="id"
                className="text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementUsers;
