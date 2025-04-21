import { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  Input,
  Select,
  Table,
  message,
  Radio,
  Checkbox,
  Tooltip,
  Dropdown,
  Divider,
  Spin,
} from "antd";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";
import AddLecturerModal from "./AddLecturerModal";
import {
  DownOutlined,
  FileExcelOutlined,
  EditOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";
import { Filter, ChevronDown } from "lucide-react";

const ManagementUsers = () => {
  const [userRole] = useState(localStorage.getItem("current_role") || "");
  const [users, setUsers] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [activeTab, setActiveTab] = useState("user");
  const [showFilter, setShowFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterDepartment, setFilterDepartment] = useState(["Tất cả"]);
  const [filterPosition, setFilterPosition] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState(["Tất cả"]);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [lecturerCurrentPage, setLecturerCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState([]);
  const departmentId = localStorage.getItem("department");

  const filterRef = useRef(null);
  const departmentFilterRef = useRef(null);
  const statusFilterRef = useRef(null);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const navigate = useNavigate();

  const [roleOptions, setRoleOptions] = useState([]);
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isLecturerModalVisible, setIsLecturerModalVisible] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);

  const reloadData = async () => {
    try {
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
      console.error("Error reloading data:", error);
    }
  };

  const handleAddStudent = async () => {
    setIsStudentModalVisible(true);
    await reloadData();
  };

  const handleAddLecturer = async () => {
    setIsLecturerModalVisible(true);
    await reloadData();
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setExcelData(jsonData);
        setIsExcelModalVisible(true);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExcelSave = async () => {
    try {
      const fileInput =
        activeTab === "user"
          ? document.getElementById("studentExcelInput")
          : document.getElementById("lecturerExcelInput");
      const file = fileInput?.files[0];
      if (!file) {
        message.error("Vui lòng chọn tệp Excel!");
        return;
      }

      if (!departmentId) {
        message.error("Không tìm thấy thông tin khoa trong localStorage!");
        return;
      }

      const validatedExcelData = excelData.map((row) => {
        if (!row.lecturer_id && activeTab === "lecturer") {
          throw new Error("Dữ liệu Excel thiếu mã giảng viên!");
        }
        if (!row.student_id && activeTab === "user") {
          throw new Error("Dữ liệu Excel thiếu mã sinh viên!");
        }

        return {
          ...row,
          department: departmentId,
        };
      });

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "data",
        JSON.stringify({
          [activeTab === "user" ? "students" : "lecturers"]: validatedExcelData,
        })
      );

      const response =
        activeTab === "user"
          ? await userApi.importStudentsFromExcel(formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
          : await userApi.importLecturersFromExcel(formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

      console.log("API Response:", response.data);
      message.success("Dữ liệu đã được lưu thành công!");
      setIsExcelModalVisible(false);
      fileInput.value = "";
      await reloadData();
    } catch (error) {
      console.error("Error importing data from Excel:", error);
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Lỗi khi lưu dữ liệu từ Excel!"
      );
    }
  };

  const handleExcelCancel = () => {
    setIsExcelModalVisible(false);
  };

  const handleExcelCellChange = (rowIndex, key, value) => {
    setExcelData((prevData) =>
      prevData.map((row, index) =>
        index === rowIndex ? { ...row, [key]: value } : row
      )
    );
  };

  const handleStudentModalCancel = () => {
    setIsStudentModalVisible(false);
  };

  const handleLecturerModalCancel = () => {
    setIsLecturerModalVisible(false);
  };

  const studentMenuItems = [
    {
      key: "1",
      icon: <FileExcelOutlined />,
      label: (
        <span
          onClick={() => document.getElementById("studentExcelInput").click()}
        >
          Từ Excel
        </span>
      ),
    },
    {
      key: "2",
      icon: <EditOutlined />,
      label: <span onClick={handleAddStudent}>Thủ công</span>,
    },
  ];

  const lecturerMenuItems = [
    {
      key: "1",
      icon: <FileExcelOutlined />,
      label: (
        <span
          onClick={() => document.getElementById("lecturerExcelInput").click()}
        >
          Từ Excel
        </span>
      ),
    },
    {
      key: "2",
      icon: <EditOutlined />,
      label: <span onClick={handleAddLecturer}>Thủ công</span>,
    },
  ];

  const roleMapping = {
    admin: "Quản trị viên",
    lecturer: "Giảng viên",
    head_of_department: "Trưởng khoa",
    deputy_head_of_department: "Phó khoa",
    department_in_charge: "Cán bộ phụ trách khoa",
  };

  const degreeMapping = {
    Bachelor: "Cử nhân",
    Master: "Thạc sĩ",
    Doctor: "Tiến sĩ",
    Egineer: "Kỹ sư",
    Professor: "Giáo sư",
    Ossociate_Professor: "Phó giáo sư",
  };

  const degreePriority = {
    Professor: 1,
    Ossociate_Professor: 2,
    Doctor: 3,
    Master: 4,
    Bachelor: 5,
    Egineer: 6,
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await userApi.getAllRoles();
        setRoleOptions(
          roles
            .filter((role) => role.role_name)
            .map((role) => ({
              label: roleMapping[role.role_name] || role.role_name,
              value: role.role_name,
              _id: role._id,
            }))
        );
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoleOptions([]);
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
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target)
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
        if (userRole === "admin") {
          const lecturersData = await userApi.getAllLecturers();
          const students = await userApi.getAllStudents();
          console.log("Fetched data (admin):", { students, lecturersData });
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
          console.log("Fetched data (department):", data);
          setUsers(data.students || []);
          setLecturers(data.lecturers || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, departmentId]);

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
          await userApi.updateStatusStudentById(
            selectedUser.student_id,
            updatedStatus
          );
        } else if (activeTab === "lecturer") {
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

          const uniqueRoles = [...new Set(newRole)];
          const currentRoles = selectedUser.roles.map((role) => role.role_name);

          for (const role of uniqueRoles) {
            if (!currentRoles.includes(role)) {
              try {
                await userApi.assignRole(
                  adminId,
                  selectedUser.lecturer_id,
                  role
                );
              } catch (error) {
                console.error("Error assigning role:", error);
                throw new Error(
                  error.response?.data?.message || "Failed to assign role"
                );
              }
            }
          }

          for (const role of currentRoles) {
            if (!uniqueRoles.includes(role)) {
              try {
                await userApi.removeRole(
                  adminId,
                  selectedUser.lecturer_id,
                  role
                );
              } catch (error) {
                console.error("Error removing role:", error);
                throw new Error(
                  error.response?.data?.message || "Failed to remove role"
                );
              }
            }
          }
        }

        message.success("Cập nhật trạng thái và chức vụ thành công!");
        await reloadData();
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
    setUserCurrentPage(1);
    setLecturerCurrentPage(1);
  };

  const handleSearchById = (e) => {
    setFilterId(e.target.value);
    setUserCurrentPage(1);
    setLecturerCurrentPage(1);
  };

  const handleRoleChange = (checkedValues) => {
    const filteredRoles = checkedValues.filter((role) => role !== "lecturer");
    const allowedRoles = [
      "head_of_department",
      "deputy_head_of_department",
      "department_in_charge",
      "admin",
    ];
    const selectedAllowedRole = filteredRoles.find((role) =>
      allowedRoles.includes(role)
    );
    setNewRole(
      selectedAllowedRole ? ["lecturer", selectedAllowedRole] : ["lecturer"]
    );
  };

  const handleRoleDelete = async (role) => {
    if (role === "lecturer") {
      message.error("Quyền 'Giảng viên' không thể bị xóa!");
      return;
    }

    try {
      const adminId = localStorage.getItem("user_id");
      const lecturerId = selectedUser?.lecturer_id;
      const roleObject = roleOptions.find((r) => r.value === role);

      if (!roleObject) {
        console.error("Role not found in roleOptions:", role);
        message.error("Không tìm thấy quyền cần xóa!");
        return;
      }

      console.log("Deleting role with parameters:", {
        adminId,
        lecturerId,
        roleId: roleObject._id,
      });

      if (!adminId || !lecturerId || !roleObject._id) {
        throw new Error("Thiếu thông tin người dùng, quản trị viên hoặc quyền");
      }

      await userApi.deleteRole(adminId, lecturerId, roleObject._id);
      message.success(`Đã xóa quyền ${roleMapping[role] || role} thành công!`);
      setNewRole((prevRoles) => prevRoles.filter((r) => r !== role));
      await reloadData();
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

  const uniqueDepartments = useMemo(
    () => [
      "Tất cả",
      ...new Set(
        displayedUsers.map((user) =>
          typeof user.department === "object" && user.department.department_name
            ? user.department.department_name
            : user.department || "Không xác định"
        )
      ),
    ],
    [displayedUsers]
  );

  const uniquePositions = useMemo(
    () => [
      "Tất cả",
      ...new Set(
        displayedUsers.map((user) => user.position || "Không xác định")
      ),
    ],
    [displayedUsers]
  );

  const uniqueStatuses = ["Tất cả", "Hoạt động", "Không hoạt động"];

  const filteredUsers = useMemo(() => {
    console.log("Filtering users:", {
      filterName,
      filterId,
      filterDepartment,
      filterPosition,
      filterStatus,
    });

    return displayedUsers
      .filter((user) => {
        const userDepartmentName =
          typeof user.department === "object" && user.department.department_name
            ? user.department.department_name
            : user.department || "Không xác định";

        return (
          (!filterName ||
            user.full_name.toLowerCase().includes(filterName.toLowerCase())) &&
          (!filterId ||
            (activeTab === "user" && user.student_id.includes(filterId)) ||
            (activeTab === "lecturer" &&
              user.lecturer_id.includes(filterId))) &&
          (filterDepartment.length === 0 ||
            filterDepartment.includes("Tất cả") ||
            filterDepartment.includes(userDepartmentName)) &&
          (filterPosition === "Tất cả" || user.position === filterPosition) &&
          (filterStatus.length === 0 ||
            filterStatus.includes("Tất cả") ||
            filterStatus.includes(
              user.isActive ? "Hoạt động" : "Không hoạt động"
            ))
        );
      })
      .sort((a, b) => {
        if (!sortKey || !sortOrder) return 0;

        const getValue = (user, key) => {
          if (key === "full_name") return user.full_name.toLowerCase();
          if (key === "id")
            return activeTab === "user" ? user.student_id : user.lecturer_id;
          if (key === "department") {
            return typeof user.department === "object" &&
              user.department.department_name
              ? user.department.department_name
              : user.department || "Không xác định";
          }
          if (key === "roles") {
            const roles = Array.isArray(user.roles)
              ? user.roles.filter((role) => role.role_name !== "lecturer")
              : [];
            return roles.length > 0 ? roles[0].role_name : "lecturer";
          }
          if (key === "degree") {
            return degreePriority[user.degree] || 999;
          }
          if (key === "isActive") {
            return user.isActive ? 0 : 1;
          }
          return "";
        };

        const valueA = getValue(a, sortKey);
        const valueB = getValue(b, sortKey);

        if (typeof valueA === "string") {
          return sortOrder === "ascend"
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        return sortOrder === "ascend" ? valueA - valueB : valueB - valueA;
      });
  }, [
    displayedUsers,
    filterName,
    filterId,
    filterDepartment,
    filterPosition,
    filterStatus,
    sortKey,
    sortOrder,
  ]);

  const columns =
    activeTab === "user"
      ? [
          {
            title: "STT",
            dataIndex: "id",
            key: "id",
            render: (text, record, index) =>
              (userCurrentPage - 1) * itemsPerPage + index + 1,
            width: 65,
            fixed: "left",
          },
          {
            title: "MSSV",
            dataIndex: "student_id",
            key: "id",
            width: 150,
            ellipsis: { showTitle: false },
            render: (student_id) => (
              <Tooltip placement="topLeft" title={student_id}>
                {student_id}
              </Tooltip>
            ),
            sorter: true,
          },
          {
            title: "HỌ VÀ TÊN",
            dataIndex: "full_name",
            key: "full_name",
            width: 200,
            ellipsis: { showTitle: false },
            render: (full_name) => (
              <Tooltip placement="topLeft" title={full_name}>
                {full_name}
              </Tooltip>
            ),
            sorter: true,
          },
          {
            title: "KHOA",
            dataIndex: "department",
            key: "department",
            width: 200,
            ellipsis: { showTitle: false },
            render: (department) => {
              const deptName =
                typeof department === "object" && department.department_name
                  ? department.department_name
                  : department || "Không xác định";
              return (
                <Tooltip placement="topLeft" title={deptName}>
                  {deptName}
                </Tooltip>
              );
            },
            sorter: true,
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
            sorter: true,
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
            render: (text, record, index) =>
              (lecturerCurrentPage - 1) * itemsPerPage + index + 1,
            width: 65,
            fixed: "left",
          },
          {
            title: "MSGV",
            dataIndex: "lecturer_id",
            key: "id",
            width: 150,
            ellipsis: { showTitle: false },
            render: (lecturer_id) => (
              <Tooltip placement="topLeft" title={lecturer_id}>
                {lecturer_id}
              </Tooltip>
            ),
            sorter: true,
          },
          {
            title: "HỌ VÀ TÊN",
            dataIndex: "full_name",
            key: "full_name",
            width: 200,
            ellipsis: { showTitle: false },
            render: (full_name) => (
              <Tooltip placement="topLeft" title={full_name}>
                {full_name}
              </Tooltip>
            ),
            sorter: true,
          },
          {
            title: "KHOA",
            dataIndex: "department",
            key: "department",
            width: 200,
            ellipsis: { showTitle: false },
            render: (department) => {
              const deptName =
                typeof department === "object" && department.department_name
                  ? department.department_name
                  : department || "Không xác định";
              return (
                <Tooltip placement="topLeft" title={deptName}>
                  {deptName}
                </Tooltip>
              );
            },
            sorter: true,
          },
          {
            title: "CHỨC VỤ",
            dataIndex: "roles",
            key: "roles",
            width: 120,
            ellipsis: { showTitle: false },
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
            sorter: true,
          },
          {
            title: "CHỨC DANH",
            dataIndex: "degree",
            key: "degree",
            width: 120,
            ellipsis: { showTitle: false },
            render: (degree) => {
              const degreeText = degreeMapping[degree] || "Không xác định";
              return (
                <Tooltip placement="topLeft" title={degreeText}>
                  {degreeText}
                </Tooltip>
              );
            },
            sorter: true,
          },
          {
            title: "TRẠNG THÁI",
            dataIndex: "isActive",
            key: "isActive",
            width: 120,
            render: (isActive) => (
              <span
                className={`px-2 py-1 rounded text-sm ${
                  isActive ? "text-green-700" : "text-red-700"
                }`}
              >
                {isActive ? "Hoạt động" : "Không hoạt động"}
              </span>
            ),
            sorter: true,
          },
          {
            title: "CHỈNH SỬA",
            key: "edit",
            width: 140,
            fixed: "right",
            render: (text, record) => {
              const isHeadOfDepartment = record.roles?.some(
                (role) => role.role_name === "head_of_department"
              );
              const isDeputyHeadOfDepartment = record.roles?.some(
                (role) => role.role_name === "deputy_head_of_department"
              );

              if (
                (userRole === "deputy_head_of_department" &&
                  isHeadOfDepartment) ||
                (userRole === "department_in_charge" &&
                  (isHeadOfDepartment || isDeputyHeadOfDepartment))
              ) {
                return null;
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
      className="relative px-4 py-5 w-[300px] bg-white rounded-lg border border-gray-200 shadow-lg max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3"
    >
      <div className="max-h-[300px] overflow-y-auto pr-1">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Họ và tên:</label>
          <Input
            value={filterName}
            onChange={handleSearchByName}
            placeholder="Nhập họ và tên"
            className="w-full h-[32px] text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">
            {activeTab === "user" ? "MSSV" : "MSGV"}:
          </label>
          <Input
            value={filterId}
            onChange={handleSearchById}
            placeholder={`Nhập ${activeTab === "user" ? "MSSV" : "MSGV"}`}
            className="w-full h-[32px] text-sm"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">Khoa:</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDepartmentFilter(!showDepartmentFilter)}
              className="w-full h-[32px] bg-white rounded-md border border-gray-300 text-sm text-left px-3 flex items-center justify-between"
            >
              <span className="truncate max-w-[380px]">
                {filterDepartment.length === 0
                  ? "Chọn khoa"
                  : filterDepartment.length === uniqueDepartments.length
                  ? "Tất cả"
                  : filterDepartment.join(", ")}
              </span>
              <DownOutlined className="text-xs" />
            </button>
            {showDepartmentFilter && (
              <div
                ref={departmentFilterRef}
                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-3 w-full shadow-md max-h-[250px] overflow-y-auto"
              >
                <Checkbox
                  indeterminate={
                    filterDepartment.length > 0 &&
                    filterDepartment.length < uniqueDepartments.length
                  }
                  onChange={(e) => {
                    setFilterDepartment(
                      e.target.checked ? uniqueDepartments : []
                    );
                    setUserCurrentPage(1);
                    setLecturerCurrentPage(1);
                  }}
                  checked={filterDepartment.length === uniqueDepartments.length}
                >
                  Tất cả
                </Checkbox>
                <Checkbox.Group
                  options={uniqueDepartments.map((department) => ({
                    label: department,
                    value: department,
                  }))}
                  value={filterDepartment}
                  onChange={(checkedValues) => {
                    setFilterDepartment(checkedValues);
                    setUserCurrentPage(1);
                    setLecturerCurrentPage(1);
                  }}
                  className="flex flex-col gap-2 mt-2"
                />
              </div>
            )}
          </div>
        </div>

        {activeTab === "lecturer" && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-1">Chức vụ:</label>
            <Select
              value={filterPosition}
              onChange={(value) => {
                setFilterPosition(value);
                setUserCurrentPage(1);
                setLecturerCurrentPage(1);
              }}
              className="w-full h-[32px] text-sm"
            >
              {uniquePositions.map((position) => (
                <Select.Option key={position} value={position}>
                  {position}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm mb-1">
            Trạng thái:
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStatusFilter(!showStatusFilter)}
              className="w-full h-[32px] bg-white rounded-md border border-gray-300 text-sm text-left px-3 flex items-center justify-between"
            >
              <span className="truncate max-w-[380px]">
                {filterStatus.length === 0
                  ? "Chọn trạng thái"
                  : filterStatus.length === uniqueStatuses.length
                  ? "Tất cả"
                  : filterStatus.join(", ")}
              </span>
              <DownOutlined className="text-xs" />
            </button>
            {showStatusFilter && (
              <div
                ref={statusFilterRef}
                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-3 w-full shadow-md"
              >
                <Checkbox
                  indeterminate={
                    filterStatus.length > 0 &&
                    filterStatus.length < uniqueStatuses.length
                  }
                  onChange={(e) => {
                    setFilterStatus(e.target.checked ? uniqueStatuses : []);
                    setUserCurrentPage(1);
                    setLecturerCurrentPage(1);
                  }}
                  checked={filterStatus.length === uniqueStatuses.length}
                >
                  Tất cả
                </Checkbox>
                <Checkbox.Group
                  options={uniqueStatuses
                    .filter((status) => status !== "Tất cả")
                    .map((status) => ({
                      label: status,
                      value: status,
                    }))}
                  value={filterStatus}
                  onChange={(checkedValues) => {
                    setFilterStatus(checkedValues);
                    setUserCurrentPage(1);
                    setLecturerCurrentPage(1);
                  }}
                  className="flex flex-col gap-2 mt-2"
                />
              </div>
            )}
          </div>
        </div>

        <Divider className="my-4" />
        <button
          type="button"
          onClick={() => {
            setFilterName("");
            setFilterId("");
            setFilterDepartment([]);
            setFilterPosition("Tất cả");
            setFilterStatus([]);
            setShowFilter(false);
            setUserCurrentPage(1);
            setLecturerCurrentPage(1);
          }}
          className="w-full bg-blue-500 text-white py-2 rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Bỏ lọc tất cả
        </button>
      </div>
    </form>
  );

  const totalStudents = users.length;
  const totalLecturers = lecturers.length;

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
            className="flex justify-between items-center border-b"
            style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
          >
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 text-center text-xs ${
                  activeTab === "user"
                    ? "bg-[#00A3FF] text-white"
                    : "bg-white text-gray-700"
                } rounded-lg`}
                onClick={() => setActiveTab("user")}
              >
                Sinh viên ({totalStudents})
              </button>
              <button
                className={`px-4 py-2 text-center text-xs ${
                  activeTab === "lecturer"
                    ? "bg-[#00A3FF] text-white"
                    : "bg-white text-gray-700"
                } rounded-lg`}
                onClick={() => setActiveTab("lecturer")}
              >
                Giảng viên ({totalLecturers})
              </button>
            </div>
            <div>
              {userRole !== "admin" &&
                (activeTab === "user" ? (
                  <Dropdown
                    menu={{ items: studentMenuItems }}
                    trigger={["click"]}
                  >
                    <button className="px-4 py-2 bg-[#00A3FF] text-white rounded-lg text-xs flex items-center gap-2">
                      Thêm sinh viên <DownOutlined />
                    </button>
                  </Dropdown>
                ) : (
                  <Dropdown
                    menu={{ items: lecturerMenuItems }}
                    trigger={["click"]}
                  >
                    <button className="px-4 py-2 bg-[#00A3FF] text-white rounded-lg text-xs flex items-center gap-2">
                      Thêm giảng viên <DownOutlined />
                    </button>
                  </Dropdown>
                ))}
            </div>
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
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 right-0 shadow-lg">
                    {filterForm}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={filteredUsers}
                  pagination={{
                    current:
                      activeTab === "user"
                        ? userCurrentPage
                        : lecturerCurrentPage,
                    pageSize: itemsPerPage,
                    total: filteredUsers.length,
                    onChange: (page) =>
                      activeTab === "user"
                        ? setUserCurrentPage(page)
                        : setLecturerCurrentPage(page),
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
                    emptyText: (
                      <div className="text-center py-8 text-gray-500">
                        Không có người dùng phù hợp với bộ lọc
                      </div>
                    ),
                  }}
                  onChange={(pagination, filters, sorter) => {
                    if (sorter.field) {
                      setSortKey(sorter.field);
                      setSortOrder(sorter.order);
                    } else {
                      setSortKey(null);
                      setSortOrder(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        id="studentExcelInput"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        onChange={handleExcelUpload}
      />
      <input
        type="file"
        id="lecturerExcelInput"
        accept=".xlsx, .xls"
        style={{ display: "none" }}
        onChange={handleExcelUpload}
      />

      <Modal
        title={`Cập nhật trạng thái - ${
          selectedUser?.full_name || "Người dùng"
        }`}
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
                { label: "Giảng viên", value: "lecturer", disabled: true },
                ...roleOptions.filter((role) => role.value !== "lecturer"),
              ]}
              value={newRole}
              onChange={handleRoleChange}
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

      <Modal
        title="Thêm sinh viên"
        visible={isStudentModalVisible}
        onCancel={handleStudentModalCancel}
        footer={null}
      >
        <AddStudentModal onClose={handleStudentModalCancel} studentData={{}} />
      </Modal>

      <Modal
        title="Thêm giảng viên"
        visible={isLecturerModalVisible}
        onCancel={handleLecturerModalCancel}
        footer={null}
      >
        <AddLecturerModal
          onClose={handleLecturerModalCancel}
          lecturerData={{}}
        />
      </Modal>

      <Modal
        title="Xem và chỉnh sửa dữ liệu Excel"
        visible={isExcelModalVisible}
        onOk={handleExcelSave}
        onCancel={handleExcelCancel}
        width={800}
      >
        <Table
          dataSource={excelData}
          columns={
            excelData.length > 0
              ? Object.keys(excelData[0]).map((key) => ({
                  title: key,
                  dataIndex: key,
                  key,
                  render: (text, record, index) => (
                    <Input
                      value={text}
                      onChange={(e) =>
                        handleExcelCellChange(index, key, e.target.value)
                      }
                    />
                  ),
                }))
              : []
          }
          rowKey={(record, index) => index}
          pagination={false}
          scroll={{ x: true }}
        />
      </Modal>
      <Footer />
    </div>
  );
};

export default ManagementUsers;
