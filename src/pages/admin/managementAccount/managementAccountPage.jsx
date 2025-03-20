import { useState, useEffect } from "react";
import { Modal, Input, Select, Table } from "antd";
import Header from "../../../components/header";
import userApi from "../../../api/api";

const ManagementUsers = () => {
  const [userRole, setUserRole] = useState(
    localStorage.getItem("current_role") || ""
  ); // Retrieve role from localStorage
  const [users, setUsers] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [departmentNames, setDepartmentNames] = useState({});
  const [activeTab, setActiveTab] = useState("user");
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("Tất cả");
  const [filterPosition, setFilterPosition] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentId = localStorage.getItem("department");

        if (userRole === "admin") {
          const lecturersData = await userApi.getAllLecturers();
          const students = await userApi.getAllStudents();

          setUsers(students);
          setLecturers(lecturersData);
        } else if (
          [
            "head_of_department",
            "deputy_head_of_department",
            "department_in_charge",
          ].includes(userRole)
        ) {
          if (!departmentId) {
            console.error("Department ID is missing in localStorage");
            return;
          }

          const data = await userApi.getLecturerAndStudentByDepartment(
            departmentId
          );
          console.log("Data theo khoa $departmentId:", data);
          setUsers(data.students || []);
          setLecturers(data.lecturers || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userRole]);

  useEffect(() => {
    const fetchDepartmentNames = async () => {
      try {
        const uniqueDepartmentIds = [
          ...new Set([...users, ...lecturers].map((user) => user.department)),
        ];

        const departmentData = {};
        for (const departmentId of uniqueDepartmentIds) {
          if (typeof departmentId === "object" && departmentId._id) {
            const department = await userApi.getDepartmentById(
              departmentId._id
            );
            departmentData[departmentId._id] = department.department_name;
          } else if (typeof departmentId === "string") {
            const department = await userApi.getDepartmentById(departmentId);
            departmentData[departmentId] = department.department_name;
          } else {
            console.warn("Invalid departmentId:", departmentId);
          }
        }

        setDepartmentNames(departmentData);
      } catch (error) {
        console.error("Lỗi khi lấy tên khoa:", error);
      }
    };

    if (users.length > 0 || lecturers.length > 0) {
      fetchDepartmentNames();
    }
  }, [users, lecturers]);

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setNewRole(user.role);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    // Update the ser's status and role here
    if (selectedUser) {
      selectedUser.status = newStatus;
      if (activeTab === "lecturer") {
        selectedUser.role = newRole;
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const displayedUsers = activeTab === "user" ? users : lecturers;

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
  const uniqueRoles = [...new Set(lecturers.map((lecturer) => lecturer.role))];

  const filteredUsers = displayedUsers.filter((user) => {
    return (
      (filterName === "" || user.name.includes(filterName)) &&
      (filterId === "" || user.studentId.includes(filterId)) &&
      (filterDepartment === "Tất cả" || user.department === filterDepartment) &&
      (filterPosition === "Tất cả" || user.position === filterPosition) &&
      (filterStatus === "Tất cả" || user.status === filterStatus)
    );
  });

  const columns =
    activeTab === "user"
      ? [
          {
            title: "STT",
            dataIndex: "id",
            key: "id",
            render: (text, record, index) => index + 1,
          },
          {
            title: "HỌ VÀ TÊN",
            dataIndex: "full_name",
            key: "full_name",
          },
          {
            title: "KHOA",
            dataIndex: "department",
            key: "department",
            render: (department) => {
              if (
                typeof department === "object" &&
                department.department_name
              ) {
                return department.department_name;
              }
              return departmentNames[department] || "Đang tải...";
            },
          },
          {
            title: "MSSV",
            dataIndex: "student_id",
            key: "student_id",
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
              <button
                className="text-blue-500"
                onClick={() => handleEditClick(record)}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png"
                  alt="Edit"
                  className="w-5 h-5"
                />
              </button>
            ),
          },
        ]
      : [
          {
            title: "STT",
            dataIndex: "id",
            key: "id",
            render: (text, record, index) => index + 1,
          },
          {
            title: "HỌ VÀ TÊN",
            dataIndex: "full_name",
            key: "full_name",
          },

          {
            title: "KHOA",
            dataIndex: "department",
            key: "department",
            render: (department) => {
              if (
                typeof department === "object" &&
                department.department_name
              ) {
                return department.department_name;
              }
              return departmentNames[department] || "Đang tải...";
            },
          },
          {
            title: "CHỨC VỤ",
            dataIndex: "position",
            key: "position",
          },
          {
            title: "MSGV",
            dataIndex: "lecturer_id",
            key: "lecturer_id",
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
            title: "QUYỀN",
            dataIndex: "role",
            key: "role",
          },
          {
            title: "CHỈNH SỬA",
            key: "edit",
            render: (text, record) => (
              <button
                className="text-blue-500"
                onClick={() => handleEditClick(record)}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png"
                  alt="Edit"
                  className="w-5 h-5"
                />
              </button>
            ),
          },
        ];

  const filterForm = (
    <form className="relative px-4 py-5 w-full bg-white max-w-[500px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
      <div className="mb-3">
        <label className="block text-gray-700 text-sm">Họ và tên:</label>
        <Input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-sm">
          {activeTab === "user" ? "MSSV" : "MSGV"}:
        </label>
        <Input
          type="text"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-sm">Khoa:</label>
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

      {activeTab === "lecturer" && (
        <div className="mb-3">
          <label className="block text-gray-700 text-sm">Chức vụ:</label>
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
      )}

      <div className="mb-3">
        <label className="block text-gray-700 text-sm">Trạng thái:</label>
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
  );

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
          <div
            className="flex border-b"
            style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
          >
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "user"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("user")}
            >
              Sinh viên
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "lecturer"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("lecturer")}
            >
              Giảng viên
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
                    {filterForm}
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

      <Modal
        title="Cập nhật trạng thái"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="mb-3">
          <label className="block text-gray-700 text-sm">Trạng thái:</label>
          <Select
            value={newStatus}
            onChange={(value) => setNewStatus(value)}
            className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full text-sm"
          >
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
        {activeTab === "lecturer" && (
          <div className="mb-3">
            <label className="block text-gray-700 text-sm">Quyền:</label>
            <Select
              value={newRole}
              onChange={(value) => setNewRole(value)}
              className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full text-sm"
            >
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagementUsers;
