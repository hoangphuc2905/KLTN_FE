import React, { useState } from "react";
import Header from "../../../components/header";
import { Input, Select } from "antd";

const UserManagement = () => {
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
              Quản lý người dùng
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex border-b">
            <button
              className={`px-8 py-3 text-center ${
                activeTab === "user"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("user")}
            >
              Người dùng
            </button>
            <button
              className={`px-8 py-3 text-center ${
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
                  <span>Bộ lọc</span>
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg">
                    <form className="relative px-4 py-5 w-full bg-white max-w-[500px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700">
                          Họ và tên:
                        </label>
                        <Input
                          type="text"
                          value={filterName}
                          onChange={(e) => setFilterName(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700">
                          MSSV/MSGV:
                        </label>
                        <Input
                          type="text"
                          value={filterId}
                          onChange={(e) => setFilterId(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700">Khoa:</label>
                        <Select
                          value={filterDepartment}
                          onChange={(e) => setFilterDepartment(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full"
                        >
                          {uniqueDepartments.map((department) => (
                            <option key={department} value={department}>
                              {department}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700">Chức vụ:</label>
                        <Select
                          value={filterPosition}
                          onChange={(e) => setFilterPosition(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full"
                        >
                          {uniquePositions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700">
                          Trạng thái:
                        </label>
                        <Select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full"
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
                        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F7FB] text-left">
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        STT
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        HỌ VÀ TÊN
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        CHỨC VỤ
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        KHOA
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        MSSV/MSGV
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        QUYỀN
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        TRẠNG THÁI
                      </th>
                      <th className="px-6 py-4 text-gray-700 font-medium">
                        CHỈNH SỬA
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <tr key={user.id} className="border-t">
                        <td className="px-6 py-4">{index + 1}</td>
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4">{user.position}</td>
                        <td className="px-6 py-4">{user.department}</td>
                        <td className="px-6 py-4">{user.studentId}</td>
                        <td className="px-6 py-4">{user.role}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded ${
                              user.status === "Hoạt động"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-500">
                            <img
                              src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png"
                              alt="Edit"
                              className="w-5 h-5"
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-6 self-end mt-4 text-xs font-semibold tracking-wide text-slate-500 max-md:mr-2.5">
                <div className="basis-auto">Rows per page: 5</div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/8e29a0ad94996b532b19cd0e968585b8ceb69861260ed667891dc4df2486e74d?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                  className="object-contain shrink-0 my-auto w-2 aspect-[1.6] fill-slate-500"
                  alt="Dropdown icon"
                />
                <div className="flex gap-4 items-start">
                  <div className="self-stretch">1-2 of 250</div>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/50a83fa7ebc907e098614dc0c26babcadb79777ed3870782579f5c757a43f365?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                    className="object-contain shrink-0 w-1.5 aspect-[0.6] fill-slate-500"
                    alt="Previous page"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/1422d2fb88e649dbd9e98e5e0ae1f3d31fe1cf5c52730537f0c558eb14410c87?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                    className="object-contain shrink-0 w-1.5 aspect-[0.6] fill-slate-500"
                    alt="Next page"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
