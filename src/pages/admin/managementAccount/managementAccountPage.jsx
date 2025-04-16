import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Input,
  Select,
  Table,
  message,
  Radio,
  Checkbox,
  Tooltip,
} from "antd";
import Header from "../../../components/header";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";

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
  const itemsPerPage = 10;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState([]);

  const filterRef = useRef(null);
  const departmentFilterRef = useRef(null);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const navigate = useNavigate();

  const [roleOptions, setRoleOptions] = useState([]);

  const roleMapping = {
    admin: "Quản trị viên",
    lecturer: "Giảng viên",
    head_of_department: "Trưởng khoa",
    deputy_head_of_department: "Phó khoa",
    department_in_charge: "Cán bộ phụ trách khoa",
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await userApi.getAllRoles();
        setRoleOptions(
          roles
            .filter((role) => role.role_name) // Ensure valid roles
            .map((role) => ({
              label: roleMapping[role.role_name] || role.role_name, // Map to Vietnamese
              value: role.role_name, // Use role_name as value
              _id: role._id, // Include _id for API calls
            }))
        );
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoleOptions([]); // Fallback to an empty array
      }
    };

    if (isModalVisible) {
      fetchRoles();
    }
  }, [isModalVisible]);

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
    if (user.roles) {
      setNewRole(user.roles.map((role) => role.role_name));
    }

    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (selectedUser) {
      try {
        const updatedStatus = newStatus === "Hoạt động";

        if (activeTab === "user") {
          // Update student status
          await userApi.updateStatusStudentById(
            selectedUser.student_id,
            updatedStatus
          );
        } else if (activeTab === "lecturer") {
          // Update lecturer status
          await userApi.updateStatusLecturerById(
            selectedUser.lecturer_id,
            updatedStatus
          );

          const adminId = localStorage.getItem("user_id");
          if (!adminId) {
            console.error("Admin ID is missing in localStorage");
            throw new Error("Admin ID is missing in localStorage");
          }
          if (!selectedUser.lecturer_id) {
            console.error("Lecturer ID is missing");
            throw new Error("Lecturer ID is missing");
          }

          // Ensure roles are unique
          const uniqueRoles = [...new Set(newRole)];
          const currentRoles = selectedUser.roles.map((role) => role.role_name);

          // Add new roles
          for (const role of uniqueRoles) {
            if (!currentRoles.includes(role)) {
              try {
                await userApi.assignRole(
                  adminId,
                  selectedUser.lecturer_id,
                  role
                );
              } catch (error) {
                console.error("Error assigning role:", {
                  message: error.message,
                  response: error.response?.data,
                  status: error.response?.status,
                  config: error.config,
                });
                throw new Error(
                  error.response?.data?.message || "Failed to assign role"
                );
              }
            }
          }

          // Remove unchecked roles
          for (const role of currentRoles) {
            if (!uniqueRoles.includes(role)) {
              try {
                await userApi.removeRole(
                  adminId,
                  selectedUser.lecturer_id,
                  role
                );
              } catch (error) {
                console.error("Error removing role:", {
                  message: error.message,
                  response: error.response?.data,
                  status: error.response?.status,
                  config: error.config,
                });
                throw new Error(
                  error.response?.data?.message || "Failed to remove role"
                );
              }
            }
          }
        }

        message.success("Cập nhật trạng thái và chức vụ thành công!");
        // Reload table data
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
              setUsers(data.students || []);
              setLecturers(data.lecturers || []);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };

        fetchData();
      } catch (error) {
        console.error("Error updating status or roles:", error);
        message.error(
          error.message || "Cập nhật trạng thái hoặc chức vụ thất bại!"
        );
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

  const handleRoleChange = (checkedValues) => {
    // Ensure "lecturer" is always included
    const filteredRoles = checkedValues.filter((role) => role !== "lecturer");

    // Enforce a maximum of one additional role
    const allowedRoles = [
      "head_of_department",
      "deputy_head_of_department",
      "department_in_charge",
      "admin",
    ];

    const selectedAllowedRole = filteredRoles.find((role) =>
      allowedRoles.includes(role)
    );

    if (selectedAllowedRole) {
      // Keep "lecturer" and the newly selected role
      setNewRole(["lecturer", selectedAllowedRole]);
    } else {
      // If no additional role is selected, keep only "lecturer"
      setNewRole(["lecturer"]);
    }
  };

  const handleRoleDelete = async (role) => {
    if (role === "lecturer") {
      message.error("Quyền 'Giảng viên' không thể bị xóa!");
      return;
    }

    try {
      const adminId = localStorage.getItem("user_id");
      const lecturerId = selectedUser?.lecturer_id;

      // Tìm roleObject từ roleOptions
      const roleObject = roleOptions.find((r) => r.value === role);

      if (!roleObject) {
        console.error("Role not found in roleOptions:", role);
        message.error("Không tìm thấy quyền cần xóa!");
        return;
      }

      console.log("Deleting role with parameters:", {
        adminId,
        lecturerId,
        roleId: roleObject._id, // Đảm bảo key là `roleId`
      });

      if (!adminId || !lecturerId || !roleObject._id) {
        throw new Error("Thiếu thông tin người dùng, quản trị viên hoặc quyền");
      }

      // Gửi request đến API
      await userApi.deleteRole(adminId, lecturerId, roleObject._id);
      message.success(`Đã xóa quyền ${roleMapping[role] || role} thành công!`);

      // Cập nhật UI
      setNewRole((prevRoles) => prevRoles.filter((r) => r !== role));

      // Reload table data
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
            setUsers(data.students || []);
            setLecturers(data.lecturers || []);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    } catch (error) {
      console.error("Error deleting role:", error);
      message.error(error.message || "Không thể xóa quyền, vui lòng thử lại!");
    }
  };

  const renderRoleList = () => {
    return newRole.map((role) => (
      <div key={role} className="flex items-center gap-2">
        <span>{roleMapping[role] || role}</span>
        {role !== "lecturer" && (
          <button
            onClick={() => handleRoleDelete(role)}
            className="text-red-500 hover:text-red-700 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 hover:bg-red-200"
            title="Xóa quyền"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    ));
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
  // const uniqueRoles = [...new Set(lecturers.map((lecturer) => lecturer.role))];

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

  const degreeMapping = {
    Bachelor: "Cử nhân",
    Master: "Thạc sĩ",
    Doctor: "Tiến sĩ",
    Egineer: "Kỹ sư",
    Professor: "Giáo sư",
    Ossociate_Professor: "Phó giáo sư",
  };

  const columns =
    activeTab === "user"
      ? [
          {
            title: "STT",
            dataIndex: "id",
            key: "id",
            render: (text, record, index) => index + 1,
            width: 65,
            fixed: "left",
          },
          {
            title: "HỌ VÀ TÊN",
            dataIndex: "full_name",
            key: "full_name",
            width: 200,
            ellipsis: {
              showTitle: false,
            },
            render: (full_name) => (
              <Tooltip placement="topLeft" title={full_name}>
                {full_name}
              </Tooltip>
            ),
          },
          {
            title: "KHOA",
            dataIndex: "department",
            key: "department",
            width: 200,
            ellipsis: {
              showTitle: false,
            },
            render: (department) => {
              const deptName =
                typeof department === "object" && department.department_name
                  ? department.department_name
                  : departmentNames[department] || "Đang tải...";
              return (
                <Tooltip placement="topLeft" title={deptName}>
                  {deptName}
                </Tooltip>
              );
            },
          },
          {
            title: "MSSV",
            dataIndex: "student_id",
            key: "student_id",
            width: 150,
            ellipsis: {
              showTitle: false,
            },
            render: (student_id) => (
              <Tooltip placement="topLeft" title={student_id}>
                {student_id}
              </Tooltip>
            ),
          },
          {
            title: "TRẠNG THÁI",
            dataIndex: "isActive",
            key: "isActive",
            width: 150,
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
            width: 100,
            fixed: "right",
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
            width: 65,
            fixed: "left",
          },
          {
            title: "MSGV",
            dataIndex: "lecturer_id",
            key: "lecturer_id",
            width: 150,
            ellipsis: {
              showTitle: false,
            },
            render: (lecturer_id) => (
              <Tooltip placement="topLeft" title={lecturer_id}>
                {lecturer_id}
              </Tooltip>
            ),
          },
          {
            title: "HỌ VÀ TÊN",
            dataIndex: "full_name",
            key: "full_name",
            width: 200,
            ellipsis: {
              showTitle: false,
            },
            render: (full_name) => (
              <Tooltip placement="topLeft" title={full_name}>
                {full_name}
              </Tooltip>
            ),
          },
          {
            title: "KHOA",
            dataIndex: "department",
            key: "department",
            width: 200,
            ellipsis: {
              showTitle: false,
            },
            render: (department) => {
              const deptName =
                typeof department === "object" && department.department_name
                  ? department.department_name
                  : departmentNames[department] || "Đang tải...";
              return (
                <Tooltip placement="topLeft" title={deptName}>
                  {deptName}
                </Tooltip>
              );
            },
          },
          {
            title: "CHỨC VỤ",
            dataIndex: "roles",
            key: "roles",
            width: 180,
            ellipsis: {
              showTitle: false,
            },
            render: (roles) => {
              const roleText = Array.isArray(roles)
                ? roles
                    .filter(
                      (role) =>
                        !(roles.length > 1 && role.role_name === "lecturer")
                    )
                    .map(
                      (role) => roleMapping[role.role_name] || role.role_name
                    )
                    .join(", ")
                : "Không xác định";
              return (
                <Tooltip placement="topLeft" title={roleText}>
                  {roleText}
                </Tooltip>
              );
            },
          },
          {
            title: "CHỨC DANH",
            dataIndex: "degree",
            key: "degree",
            width: 150,
            ellipsis: {
              showTitle: false,
            },
            render: (degree) => {
              const degreeText = degreeMapping[degree] || "Không xác định";
              return (
                <Tooltip placement="topLeft" title={degreeText}>
                  {degreeText}
                </Tooltip>
              );
            },
          },
          {
            title: "TRẠNG THÁI",
            dataIndex: "isActive",
            key: "isActive",
            width: 150,
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
            width: 100,
            fixed: "right",
            render: (text, record) => {
              const isHeadOfDepartment = record.roles.some(
                (role) => role.role_name === "head_of_department"
              );
              const isDeputyHeadOfDepartment = record.roles.some(
                (role) => role.role_name === "deputy_head_of_department"
              );

              if (
                (userRole === "deputy_head_of_department" &&
                  isHeadOfDepartment) ||
                (userRole === "department_in_charge" &&
                  (isHeadOfDepartment || isDeputyHeadOfDepartment))
              ) {
                return null; // Hide the button
              }

              return (
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
              );
            },
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
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500"
            >
              Trang chủ
            </span>
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

              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={filteredUsers}
                  pagination={{
                    current: currentPage,
                    pageSize: itemsPerPage,
                    total: filteredUsers.length,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  rowKey={(record) =>
                    record._id || record.student_id || record.lecturer_id
                  }
                  className="text-sm"
                  scroll={{
                    x: columns.reduce(
                      (total, col) => total + (col.width || 0),
                      0
                    ),
                  }}
                  locale={{
                    emptyText: <div style={{ height: "35px" }}></div>,
                  }}
                />
              </div>
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
            <label className="block text-gray-700 text-sm">Chức vụ:</label>
            <Checkbox.Group
              options={[
                { label: "Giảng viên", value: "lecturer", disabled: true }, // Always include "lecturer" as disabled
                ...roleOptions.filter((role) => role.value !== "lecturer"),
              ]}
              value={newRole}
              onChange={(checkedValues) => setNewRole(checkedValues)}
              className="flex flex-col gap-2"
            />
            <div className="mt-3">
              <label className="block text-gray-700 text-sm">
                Danh sách quyền:
              </label>
              <div className="flex flex-col gap-2">{renderRoleList()}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagementUsers;
