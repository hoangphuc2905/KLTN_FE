import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Input,
  Select,
  Table,
  message,
  Radio,
  Form,
  Button,
  Checkbox,
} from "antd";
import Header from "../../../components/header";
import userApi from "../../../api/api";

const ManagementUsers = () => {
  const [userRole] = useState(localStorage.getItem("current_role") || "");
  const [users, setUsers] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [departmentNames, setDepartmentNames] = useState({});
  const [activeTab, setActiveTab] = useState("user");
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterDepartment, setFilterDepartment] = useState(["Tất cả"]);
  const [filterPosition, setFilterPosition] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState(["Tất cả"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState("");

  const filterRef = useRef(null);
  const departmentFilterRef = useRef(null);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilter &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
      if (
        showDepartmentFilter &&
        departmentFilterRef.current &&
        !departmentFilterRef.current.contains(event.target)
      ) {
        setShowDepartmentFilter(false);
      }
      if (
        showStatusFilter &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setShowStatusFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter, showDepartmentFilter, showStatusFilter]);

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
    setNewStatus(user.isActive ? "Hoạt động" : "Không hoạt động");
    setNewRole(user.role);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (selectedUser) {
      try {
        const updatedStatus = newStatus === "Hoạt động";
        if (activeTab === "user") {
          await userApi.updateStatusStudentById(
            selectedUser.student_id,
            updatedStatus
          );
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.student_id === selectedUser.student_id
                ? { ...user, isActive: updatedStatus }
                : user
            )
          );
        } else if (activeTab === "lecturer") {
          await userApi.updateStatusLecturerById(
            selectedUser.lecturer_id,
            updatedStatus
          );
          setLecturers((prevLecturers) =>
            prevLecturers.map((lecturer) =>
              lecturer.lecturer_id === selectedUser.lecturer_id
                ? { ...lecturer, isActive: updatedStatus, role: newRole }
                : lecturer
            )
          );
        }
        message.success("Cập nhật trạng thái thành công!");
      } catch (error) {
        console.error("Error updating status:", error);
        message.error("Cập nhật trạng thái thất bại!");
      }
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearchByName = (e) => {
    setFilterName(e.target.value);
  };

  const handleSearchById = (e) => {
    setFilterId(e.target.value);
  };

  const displayedUsers = activeTab === "user" ? users : lecturers;

  const uniquePositions = [
    "Tất cả",
    ...new Set(displayedUsers.map((user) => user.position)),
  ];
  const uniqueDepartments = [
    ...new Set(
      displayedUsers.map((user) => {
        if (typeof user.department === "object" && user.department._id) {
          return user.department._id;
        }
        return user.department;
      })
    ),
  ];

  const uniqueStatuses = ["Hoạt động", "Không hoạt động"];
  const uniqueRoles = [...new Set(lecturers.map((lecturer) => lecturer.role))];

  const filteredUsers = displayedUsers.filter((user) => {
    const userDepartmentId =
      typeof user.department === "object" && user.department._id
        ? user.department._id
        : user.department;

    return (
      (filterName === "" || user.full_name.includes(filterName)) &&
      (filterId === "" ||
        (activeTab === "user" && user.student_id.includes(filterId)) ||
        (activeTab === "lecturer" && user.lecturer_id.includes(filterId))) &&
      (filterDepartment.includes("Tất cả") ||
        filterDepartment.includes(userDepartmentId)) &&
      (filterPosition === "Tất cả" || user.position === filterPosition) &&
      (filterStatus.includes("Tất cả") ||
        filterStatus.includes(user.isActive ? "Hoạt động" : "Không hoạt động"))
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
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
              <span
                className={`px-2 py-1 rounded text-sm ${
                  isActive ? "text-green-700" : "text-red-700"
                }`}
              >
                {isActive ? "Hoạt động" : "Không hoạt động"}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7167 7.51667L12.4833 8.28333L4.93333 15.8333H4.16667V15.0667L11.7167 7.51667ZM14.7167 2.5C14.5083 2.5 14.2917 2.58333 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C15.1417 2.575 14.9333 2.5 14.7167 2.5ZM11.7167 5.15833L2.5 14.375V17.5H5.625L14.8417 8.28333L11.7167 5.15833Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ),
            align: "center",
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
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
              <span
                className={`px-2 py-1 rounded text-sm ${
                  isActive ? "text-green-700" : "text-red-700"
                }`}
              >
                {isActive ? "Hoạt động" : "Không hoạt động"}
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
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7167 7.51667L12.4833 8.28333L4.93333 15.8333H4.16667V15.0667L11.7167 7.51667ZM14.7167 2.5C14.5083 2.5 14.2917 2.58333 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C15.1417 2.575 14.9333 2.5 14.7167 2.5ZM11.7167 5.15833L2.5 14.375V17.5H5.625L14.8417 8.28333L11.7167 5.15833Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            ),
            align: "center",
          },
        ];

  const filterForm = (
    <form
      ref={filterRef}
      className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3"
    >
      <div className="mb-3">
        <label className="block text-gray-700 text-xs">Họ và tên:</label>
        <Input
          value={filterName}
          onChange={handleSearchByName}
          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-xs">
          {activeTab === "user" ? "MSSV" : "MSGV"}:
        </label>
        <Input
          value={filterId}
          onChange={handleSearchById}
          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
        />
      </div>

      <div className="mb-3">
        <label className="block text-gray-700 text-xs">Khoa:</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
          >
            {filterDepartment.length === 0
              ? "Chọn khoa"
              : filterDepartment.length === uniqueDepartments.length
              ? "Tất cả"
              : filterDepartment
                  .map((dept) => departmentNames[dept] || dept)
                  .join(", ")}
          </button>
          {showDepartmentFilter && (
            <div
              ref={departmentFilterRef}
              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
            >
              <Checkbox
                indeterminate={
                  filterDepartment.length > 0 &&
                  filterDepartment.length < uniqueDepartments.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilterDepartment(uniqueDepartments);
                  } else {
                    setFilterDepartment([]);
                  }
                }}
                checked={filterDepartment.length === uniqueDepartments.length}
              >
                Tất cả
              </Checkbox>
              <Checkbox.Group
                options={uniqueDepartments.map((department) => ({
                  label: departmentNames[department] || department,
                  value: department,
                }))}
                value={filterDepartment}
                onChange={(checkedValues) => {
                  if (checkedValues.length === 0) {
                    setFilterDepartment([]); // Khi không chọn gì, dữ liệu sẽ trống
                  } else if (
                    checkedValues.length === uniqueDepartments.length
                  ) {
                    setFilterDepartment(uniqueDepartments); // Chọn lại tất cả
                  } else {
                    setFilterDepartment(checkedValues);
                  }
                }}
                className="flex flex-col gap-2 mt-2"
              />
            </div>
          )}
        </div>
      </div>

      {activeTab === "lecturer" && (
        <div className="mb-3">
          <label className="block text-gray-700 text-xs">Chức vụ:</label>
          <Select
            value={filterPosition}
            onChange={(value) => setFilterPosition(value)}
            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
          >
            {uniquePositions.map((position) => (
              <Select.Option key={position} value={position}>
                {position}
              </Select.Option>
            ))}
          </Select>
        </div>
      )}

      <div className="mb-3">
        <label className="block text-gray-700 text-xs">Trạng thái:</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatusFilter(!showStatusFilter)}
            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
          >
            {filterStatus.length === 0
              ? "Chọn trạng thái"
              : filterStatus.length === uniqueStatuses.length
              ? "Tất cả"
              : filterStatus.join(", ")}
          </button>
          {showStatusFilter && (
            <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
              <Checkbox
                indeterminate={
                  filterStatus.length > 0 &&
                  filterStatus.length < uniqueStatuses.length
                }
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilterStatus(uniqueStatuses);
                  } else {
                    setFilterStatus([]);
                  }
                }}
                checked={filterStatus.length === uniqueStatuses.length}
              >
                Tất cả
              </Checkbox>
              <Checkbox.Group
                options={uniqueStatuses}
                value={filterStatus}
                onChange={(checkedValues) => {
                  if (checkedValues.length === 0) {
                    setFilterStatus([]); // Khi không chọn gì, dữ liệu sẽ trống
                  } else if (checkedValues.length === uniqueStatuses.length) {
                    setFilterStatus(uniqueStatuses); // Chọn lại tất cả
                  } else {
                    setFilterStatus(checkedValues);
                  }
                }}
                className="flex flex-col gap-2 mt-2"
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setFilterName("");
          setFilterId("");
          setFilterDepartment(["Tất cả"]);
          setFilterPosition("Tất cả");
          setFilterStatus(["Tất cả"]);
        }}
        className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
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
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3161/3161370.png"
                    alt="Filter Icon"
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Bộ lọc</span>
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
        title={`Cập nhật trạng thái - ${
          selectedUser?.full_name || "Người dùng"
        }`} // Display user name
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div className="mb-3">
          <label className="block text-gray-700 text-sm">Trạng thái:</label>
          <Radio.Group
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full"
          >
            <Radio value="Hoạt động">Hoạt động</Radio>
            <Radio value="Không hoạt động">Không hoạt động</Radio>
          </Radio.Group>
        </div>
        {activeTab === "lecturer" && (
          <div className="mb-3">
            <label className="block text-gray-700 text-sm">Quyền:</label>
            <Select
              value={newRole}
              onChange={(value) => setNewRole(value)}
              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full text-sm"
            >
              {uniqueRoles.map((role) => (
                <Select.Option key={role} value={role}>
                  {role}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagementUsers;
