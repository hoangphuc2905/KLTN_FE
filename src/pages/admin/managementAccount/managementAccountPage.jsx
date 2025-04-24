import { useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  Input,
  Table,
  message,
  Radio,
  Checkbox,
  Tooltip,
  Dropdown,
  Divider,
} from "antd";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";
import AddStudentModal from "./AddStudentModal";
import AddLecturerModal from "./AddLecturerModal";
import { Filter, ChevronDown } from "lucide-react";
import {
  DownOutlined,
  FileExcelOutlined,
  EditOutlined,
} from "@ant-design/icons";
import * as XLSX from "xlsx";

const ManagementUsers = () => {
  const [userRole] = useState(localStorage.getItem("current_role") || "");
  const [users, setUsers] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [activeTab, setActiveTab] = useState("user");
  const [filterName, setFilterName] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterDepartment, setFilterDepartment] = useState(["Tất cả"]);
  const [filterPosition, setFilterPosition] = useState(["Tất cả"]);
  const [filterStatus, setFilterStatus] = useState(["Tất cả"]);
  const [filterEmail, setFilterEmail] = useState(""); // Thêm state cho email
  const [filterPhone, setFilterPhone] = useState(""); // Thêm state cho phone
  const [filterGender, setFilterGender] = useState(["Tất cả"]); // Thêm state cho gender
  const [filterDateOfBirth, setFilterDateOfBirth] = useState(""); // Thêm state cho date_of_birth
  const [filterCccd, setFilterCccd] = useState(""); // Thêm state cho cccd
  const [filterAddress, setFilterAddress] = useState(""); // Thêm state cho address
  const [filterRole, setFilterRole] = useState(["Tất cả"]); // Thêm state cho chức vụ
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [lecturerCurrentPage, setLecturerCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [newRole, setNewRole] = useState([]);
  const departmentId = localStorage.getItem("department");

  const navigate = useNavigate();

  const [roleOptions, setRoleOptions] = useState([]);
  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [isLecturerModalVisible, setIsLecturerModalVisible] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);

  // Filter dropdown states
  const [showFilter, setShowFilter] = useState(false);
  const [showDepartmentFilter, setShowDepartmentFilter] = useState(false);
  const [showPositionFilter, setShowPositionFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showGenderFilter, setShowGenderFilter] = useState(false); // Thêm state cho gender filter
  const [showRoleFilter, setShowRoleFilter] = useState(false); // Thêm state cho role filter
  const [showColumnFilter, setShowColumnFilter] = useState(false);

  const filterRef = useRef(null);
  const departmentFilterRef = useRef(null);
  const positionFilterRef = useRef(null);
  const statusFilterRef = useRef(null);
  const genderFilterRef = useRef(null); // Thêm ref cho gender filter
  const roleFilterRef = useRef(null); // Thêm ref cho role filter
  const columnFilterRef = useRef(null);

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

  // Định nghĩa columns trước khi sử dụng
  const getUserColumns = () => [
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
      key: "student_id",
      width: 120,
      ellipsis: { showTitle: false },
      render: (student_id) => (
        <Tooltip placement="topLeft" title={student_id}>
          {student_id}
        </Tooltip>
      ),
      sorter: (a, b) => a.student_id?.localeCompare(b.student_id || ""),
    },
    {
      title: "HỌ VÀ TÊN",
      dataIndex: "full_name",
      key: "full_name",
      width: 180,
      ellipsis: { showTitle: false },
      render: (full_name) => (
        <Tooltip placement="topLeft" title={full_name}>
          {full_name}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      width: 180,
      ellipsis: { showTitle: false },
      render: (email) => (
        <Tooltip placement="topLeft" title={email}>
          {email}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      ellipsis: { showTitle: false },
      render: (phone) => (
        <Tooltip placement="topLeft" title={phone}>
          {phone}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gender",
      key: "gender",
      width: 130,
      render: (gender) => (
        <span>
          {gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác"}
        </span>
      ),
      sorter: true,
    },
    {
      title: "NGÀY SINH",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 140,
      ellipsis: { showTitle: false },
      render: (date) => (
        <Tooltip
          placement="topLeft"
          title={date ? new Date(date).toLocaleDateString("vi-VN") : ""}
        >
          {date ? new Date(date).toLocaleDateString("vi-VN") : ""}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "CCCD",
      dataIndex: "cccd",
      key: "cccd",
      width: 130,
      ellipsis: { showTitle: false },
      render: (cccd) => (
        <Tooltip placement="topLeft" title={cccd}>
          {cccd}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "ĐỊA CHỈ",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: { showTitle: false },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      width: 180,
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
      width: 140,
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
      width: 80,
      fixed: "right",
      render: (text, record) => (
        <button
          className="text-blue-500"
          onClick={() => handleEditClick(record)}
        >
          <EditOutlined />
        </button>
      ),
      align: "center",
    },
  ];

  const getLecturerColumns = () => [
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
      key: "lecturer_id",
      width: 120,
      ellipsis: { showTitle: false },
      render: (lecturer_id) => (
        <Tooltip placement="topLeft" title={lecturer_id}>
          {lecturer_id}
        </Tooltip>
      ),
      sorter: (a, b) => a.lecturer_id?.localeCompare(b.lecturer_id || ""),
    },
    {
      title: "HỌ VÀ TÊN",
      dataIndex: "full_name",
      key: "full_name",
      width: 180,
      ellipsis: { showTitle: false },
      render: (full_name) => (
        <Tooltip placement="topLeft" title={full_name}>
          {full_name}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      width: 180,
      ellipsis: { showTitle: false },
      render: (email) => (
        <Tooltip placement="topLeft" title={email}>
          {email}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "SỐ ĐIỆN THOẠI",
      dataIndex: "phone",
      key: "phone",
      width: 150,
      ellipsis: { showTitle: false },
      render: (phone) => (
        <Tooltip placement="topLeft" title={phone}>
          {phone}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "GIỚI TÍNH",
      dataIndex: "gender",
      key: "gender",
      width: 130,
      render: (gender) => (
        <span>
          {gender === "male" ? "Nam" : gender === "female" ? "Nữ" : "Khác"}
        </span>
      ),
      sorter: true,
    },
    {
      title: "NGÀY SINH",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 140,
      ellipsis: { showTitle: false },
      render: (date) => (
        <Tooltip
          placement="topLeft"
          title={date ? new Date(date).toLocaleDateString("vi-VN") : ""}
        >
          {date ? new Date(date).toLocaleDateString("vi-VN") : ""}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "CCCD",
      dataIndex: "cccd",
      key: "cccd",
      width: 130,
      ellipsis: { showTitle: false },
      render: (cccd) => (
        <Tooltip placement="topLeft" title={cccd}>
          {cccd}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "ĐỊA CHỈ",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: { showTitle: false },
      render: (address) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      width: 180,
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
                (role) => !(roles.length > 1 && role.role_name === "lecturer")
              )
              .map((role) => roleMapping[role.role_name] || role.role_name)
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
      width: 140,
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
      width: 140,
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
      width: 80,
      fixed: "right",
      render: (text, record) => {
        const isHeadOfDepartment = record.roles?.some(
          (role) => role.role_name === "head_of_department"
        );
        const isDeputyHeadOfDepartment = record.roles?.some(
          (role) => role.role_name === "deputy_head_of_department"
        );

        if (
          (userRole === "deputy_head_of_department" && isHeadOfDepartment) ||
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
            <EditOutlined />
          </button>
        );
      },
      align: "center",
    },
  ];

  const columns =
    activeTab === "user" ? getUserColumns() : getLecturerColumns();

  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );

  // Các hàm xử lý khác
  const handleColumnVisibilityChange = (selectedColumns) => {
    setVisibleColumns(selectedColumns);
  };

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  const columnOptions = columns.map((col) => ({
    label: col.title,
    value: col.key,
  }));

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

  const handleDownloadTemplate = () => {
    const templateData =
      activeTab === "user"
        ? [
            [
              "student_id",
              "full_name",
              "email",
              "phone",
              "gender",
              "date_of_birth",
              "cccd",
              "address",
              "start_date",
            ],
            [
              "2100001",
              "Nguyễn Văn A",
              "nguyenvana@example.com",
              "0123456789",
              "male",
              "01/01/2000",
              "123456789",
              "123 Lê Văn Sỹ, Quận 3, TP.HCM",
              "01/09/2020",
            ],
          ]
        : [
            [
              "lecturer_id",
              "full_name",
              "email",
              "phone",
              "gender",
              "date_of_birth",
              "cccd",
              "address",
              "start_date",
            ],
            [
              "0147895",
              "Trần Thị B",
              "tranthib@example.com",
              "0987654321",
              "female",
              "15/05/1985",
              "987654321",
              "456 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
              "01/09/2015",
            ],
          ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      activeTab === "user" ? "Student Template" : "Lecturer Template"
    );

    XLSX.writeFile(
      workbook,
      activeTab === "user" ? "Student_Template.xlsx" : "Lecturer_Template.xlsx"
    );
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
          Nhập từ Excel
        </span>
      ),
    },
    {
      key: "2",
      icon: <FileExcelOutlined />,
      label: <span onClick={handleDownloadTemplate}>Tải file excel mẫu</span>,
    },
    {
      key: "3",
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
          Nhập từ Excel
        </span>
      ),
    },
    {
      key: "2",
      icon: <FileExcelOutlined />,
      label: <span onClick={handleDownloadTemplate}>Tải file excel mẫu</span>,
    },
    {
      key: "3",
      icon: <EditOutlined />,
      label: <span onClick={handleAddLecturer}>Thủ công</span>,
    },
  ];

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
    const fetchData = async () => {
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
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userRole, departmentId]);

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
        showPositionFilter &&
        positionFilterRef.current &&
        !positionFilterRef.current.contains(event.target)
      ) {
        setShowPositionFilter(false);
      }
      if (
        showStatusFilter &&
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target)
      ) {
        setShowStatusFilter(false);
      }
      if (
        showGenderFilter &&
        genderFilterRef.current &&
        !genderFilterRef.current.contains(event.target)
      ) {
        setShowGenderFilter(false);
      }
      if (
        showRoleFilter &&
        roleFilterRef.current &&
        !roleFilterRef.current.contains(event.target)
      ) {
        setShowRoleFilter(false);
      }
      if (
        showColumnFilter &&
        columnFilterRef.current &&
        !columnFilterRef.current.contains(event.target)
      ) {
        setShowColumnFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showFilter,
    showDepartmentFilter,
    showPositionFilter,
    showStatusFilter,
    showGenderFilter,
    showRoleFilter,
    showColumnFilter,
  ]);

  useEffect(() => {
    setVisibleColumns(columns.map((col) => col.key));
  }, [activeTab]);

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
        lecturers
          .filter((lecturer) => lecturer.degree)
          .map((lecturer) => degreeMapping[lecturer.degree] || "Không xác định")
      ),
    ],
    [lecturers]
  );

  const uniqueStatuses = ["Tất cả", "Hoạt động", "Không hoạt động"];

  const uniqueGenders = useMemo(
    () => [
      "Tất cả",
      ...new Set(displayedUsers.map((user) => user.gender || "Khác")),
    ],
    [displayedUsers]
  );

  const uniqueRoles = useMemo(
    () => [
      "Tất cả",
      ...new Set(
        displayedUsers.flatMap((user) =>
          user.roles
            ? user.roles.map(
                (role) => roleMapping[role.role_name] || role.role_name
              )
            : []
        )
      ),
    ],
    [displayedUsers]
  );

  const filteredUsers = useMemo(() => {
    return displayedUsers
      .filter((user) => {
        const userDepartmentName =
          typeof user.department === "object" && user.department.department_name
            ? user.department.department_name
            : user.department || "Không xác định";

        const userRoles = user.roles
          ? user.roles.map(
              (role) => roleMapping[role.role_name] || role.role_name
            )
          : [];

        const userDegree = user.degree
          ? degreeMapping[user.degree] || "Không xác định"
          : "Không xác định";

        return (
          (!filterName ||
            user.full_name.toLowerCase().includes(filterName.toLowerCase())) &&
          (!filterId ||
            (activeTab === "user" && user.student_id.includes(filterId)) ||
            (activeTab === "lecturer" &&
              user.lecturer_id.includes(filterId))) &&
          (filterDepartment.includes("Tất cả") ||
            filterDepartment.includes(userDepartmentName)) &&
          (filterPosition.includes("Tất cả") ||
            filterPosition.includes(userDegree)) &&
          (filterStatus.includes("Tất cả") ||
            filterStatus.includes(
              user.isActive ? "Hoạt động" : "Không hoạt động"
            )) &&
          (!filterEmail ||
            (user.email || "")
              .toLowerCase()
              .includes(filterEmail.toLowerCase())) &&
          (!filterPhone ||
            (user.phone || "")
              .toLowerCase()
              .includes(filterPhone.toLowerCase())) &&
          (filterGender.includes("Tất cả") ||
            filterGender.includes(user.gender || "Khác")) &&
          (!filterDateOfBirth ||
            (user.date_of_birth &&
              new Date(user.date_of_birth)
                .toLocaleDateString("vi-VN")
                .includes(filterDateOfBirth))) &&
          (!filterCccd ||
            (user.cccd || "")
              .toLowerCase()
              .includes(filterCccd.toLowerCase())) &&
          (!filterAddress ||
            (user.address || "")
              .toLowerCase()
              .includes(filterAddress.toLowerCase())) &&
          (filterRole.includes("Tất cả") ||
            filterRole.some((role) => userRoles.includes(role)))
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
          if (key === "email") return (user.email || "").toLowerCase();
          if (key === "phone") return (user.phone || "").toLowerCase();
          if (key === "gender") return (user.gender || "").toLowerCase();
          if (key === "date_of_birth")
            return user.date_of_birth
              ? new Date(user.date_of_birth)
              : new Date(0);
          if (key === "cccd") return (user.cccd || "").toLowerCase();
          if (key === "address") return (user.address || "").toLowerCase();

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
    filterEmail,
    filterPhone,
    filterGender,
    filterDateOfBirth,
    filterCccd,
    filterAddress,
    sortKey,
    sortOrder,
    filterRole,
  ]);

  const totalStudents = users.length;
  const totalLecturers = lecturers.length;

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto flex-grow max-lg:max-w-full max-lg:px-4">
        <div className="w-full bg-white">
          <Header />
        </div>
        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4">
          <div className="flex items-center gap-2 text-gray-600 max-sm:flex-wrap">
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
        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4">
          <div className="flex justify-between items-center max-lg:flex-wrap">
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
            <div className="flex gap-2 mt-2 max-lg:mt-4">
              {userRole !== "admin" && (
                <Dropdown
                  menu={{
                    items:
                      activeTab === "user"
                        ? studentMenuItems
                        : lecturerMenuItems,
                  }}
                  trigger={["click"]}
                >
                  <button className="px-4 py-2 bg-[#00A3FF] text-white rounded-lg text-xs flex items-center gap-2">
                    Thêm {activeTab === "user" ? "sinh viên" : "giảng viên"}{" "}
                    <DownOutlined />
                  </button>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-lg:px-4 max-md:max-w-full">
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative gap-2 max-sm:flex-wrap">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => {
                    setShowColumnFilter(!showColumnFilter);
                    setShowFilter(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Chọn cột</span>
                </button>
                {showFilter && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg max-sm:w-full"
                  >
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3 rounded-lg border border-gray-200">
                      <div className="max-h-[400px] overflow-y-auto pr-1">
                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Khoa:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDepartmentFilter(!showDepartmentFilter);
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterDepartment.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterDepartment.join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showDepartmentFilter && (
                              <div
                                ref={departmentFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterDepartment.includes(
                                      "Tất cả"
                                    )}
                                    onChange={(e) => {
                                      setFilterDepartment(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
                                  >
                                    Tất cả
                                  </Checkbox>
                                  <Checkbox.Group
                                    options={uniqueDepartments
                                      .filter((dept) => dept !== "Tất cả")
                                      .map((dept) => ({
                                        label: dept,
                                        value: dept,
                                      }))}
                                    value={filterDepartment.filter(
                                      (dept) => dept !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniqueDepartments.length - 1
                                      ) {
                                        setFilterDepartment(["Tất cả"]);
                                      } else {
                                        setFilterDepartment(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Chỉ hiển thị bộ lọc chức danh và chức vụ khi đang ở tab giảng viên */}
                        {activeTab === "lecturer" && (
                          <>
                            <div className="mb-3">
                              <label className="block text-gray-700 text-xs">
                                Chức danh:
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPositionFilter(!showPositionFilter);
                                  }}
                                  className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                                >
                                  <span className="truncate">
                                    {filterPosition.includes("Tất cả")
                                      ? "Tất cả"
                                      : filterPosition.join(", ")}
                                  </span>
                                  <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                                </button>
                                {showPositionFilter && (
                                  <div
                                    ref={positionFilterRef}
                                    className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                                  >
                                    <div className="max-h-[100px] overflow-y-auto pr-1">
                                      <Checkbox
                                        checked={filterPosition.includes(
                                          "Tất cả"
                                        )}
                                        onChange={(e) => {
                                          setFilterPosition(
                                            e.target.checked ? ["Tất cả"] : []
                                          );
                                        }}
                                      >
                                        Tất cả
                                      </Checkbox>
                                      <Checkbox.Group
                                        options={uniquePositions
                                          .filter((pos) => pos !== "Tất cả")
                                          .map((pos) => ({
                                            label: pos,
                                            value: pos,
                                          }))}
                                        value={filterPosition.filter(
                                          (pos) => pos !== "Tất cả"
                                        )}
                                        onChange={(checkedValues) => {
                                          if (
                                            checkedValues.length ===
                                            uniquePositions.length - 1
                                          ) {
                                            setFilterPosition(["Tất cả"]);
                                          } else {
                                            setFilterPosition(checkedValues);
                                          }
                                        }}
                                        className="flex flex-col gap-2 mt-2"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mb-3">
                              <label className="block text-gray-700 text-xs">
                                Chức vụ:
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRoleFilter(!showRoleFilter);
                                  }}
                                  className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                                >
                                  <span className="truncate">
                                    {filterRole.includes("Tất cả")
                                      ? "Tất cả"
                                      : filterRole.join(", ")}
                                  </span>
                                  <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                                </button>
                                {showRoleFilter && (
                                  <div
                                    ref={roleFilterRef}
                                    className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                                  >
                                    <div className="max-h-[100px] overflow-y-auto pr-1">
                                      <Checkbox
                                        checked={filterRole.includes("Tất cả")}
                                        onChange={(e) => {
                                          setFilterRole(
                                            e.target.checked ? ["Tất cả"] : []
                                          );
                                        }}
                                      >
                                        Tất cả
                                      </Checkbox>
                                      <Checkbox.Group
                                        options={uniqueRoles
                                          .filter((role) => role !== "Tất cả")
                                          .map((role) => ({
                                            label: role,
                                            value: role,
                                          }))}
                                        value={filterRole.filter(
                                          (role) => role !== "Tất cả"
                                        )}
                                        onChange={(checkedValues) => {
                                          if (
                                            checkedValues.length ===
                                            uniqueRoles.length - 1
                                          ) {
                                            setFilterRole(["Tất cả"]);
                                          } else {
                                            setFilterRole(checkedValues);
                                          }
                                        }}
                                        className="flex flex-col gap-2 mt-2"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Trạng thái:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowStatusFilter(!showStatusFilter);
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterStatus.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterStatus.join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showStatusFilter && (
                              <div
                                ref={statusFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterStatus.includes("Tất cả")}
                                    onChange={(e) => {
                                      setFilterStatus(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
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
                                    value={filterStatus.filter(
                                      (status) => status !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniqueStatuses.length - 1
                                      ) {
                                        setFilterStatus(["Tất cả"]);
                                      } else {
                                        setFilterStatus(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Giới tính:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowGenderFilter(!showGenderFilter);
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterGender.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterGender
                                      .map((g) =>
                                        g === "male"
                                          ? "Nam"
                                          : g === "female"
                                          ? "Nữ"
                                          : "Khác"
                                      )
                                      .join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showGenderFilter && (
                              <div
                                ref={genderFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterGender.includes("Tất cả")}
                                    onChange={(e) => {
                                      setFilterGender(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
                                  >
                                    Tất cả
                                  </Checkbox>
                                  <Checkbox.Group
                                    options={uniqueGenders
                                      .filter((gender) => gender !== "Tất cả")
                                      .map((gender) => ({
                                        label:
                                          gender === "male"
                                            ? "Nam"
                                            : gender === "female"
                                            ? "Nữ"
                                            : "Khác",
                                        value: gender,
                                      }))}
                                    value={filterGender.filter(
                                      (gender) => gender !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniqueGenders.length - 1
                                      ) {
                                        setFilterGender(["Tất cả"]);
                                      } else {
                                        setFilterGender(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Họ và tên:
                          </label>
                          <Input
                            type="text"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            {activeTab === "user" ? "MSSV" : "MSGV"}:
                          </label>
                          <Input
                            type="text"
                            value={filterId}
                            onChange={(e) => setFilterId(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Email:
                          </label>
                          <Input
                            type="text"
                            value={filterEmail}
                            onChange={(e) => setFilterEmail(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Số điện thoại:
                          </label>
                          <Input
                            type="text"
                            value={filterPhone}
                            onChange={(e) => setFilterPhone(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Ngày sinh:
                          </label>
                          <Input
                            type="text"
                            value={filterDateOfBirth}
                            onChange={(e) =>
                              setFilterDateOfBirth(e.target.value)
                            }
                            placeholder="dd/mm/yyyy"
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            CCCD:
                          </label>
                          <Input
                            type="text"
                            value={filterCccd}
                            onChange={(e) => setFilterCccd(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Địa chỉ:
                          </label>
                          <Input
                            type="text"
                            value={filterAddress}
                            onChange={(e) => setFilterAddress(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterName("");
                          setFilterId("");
                          setFilterDepartment(["Tất cả"]);
                          setFilterPosition(["Tất cả"]);
                          setFilterStatus(["Tất cả"]);
                          setFilterEmail("");
                          setFilterPhone("");
                          setFilterGender(["Tất cả"]);
                          setFilterDateOfBirth("");
                          setFilterCccd("");
                          setFilterAddress("");
                          setFilterRole(["Tất cả"]);
                        }}
                        className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
                {showColumnFilter && (
                  <div
                    ref={columnFilterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200 max-sm:w-full"
                  >
                    <div className="px-4 py-5 w-full max-w-[350px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <Checkbox
                        indeterminate={
                          visibleColumns.length > 0 &&
                          visibleColumns.length < columns.length
                        }
                        onChange={(e) => {
                          setVisibleColumns(
                            e.target.checked
                              ? columns.map((col) => col.key)
                              : []
                          );
                        }}
                        checked={visibleColumns.length === columns.length}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <div className="max-h-[300px] overflow-y-auto pr-1 mt-2">
                        <Checkbox.Group
                          options={columnOptions}
                          value={visibleColumns}
                          onChange={handleColumnVisibilityChange}
                          className="flex flex-col gap-2"
                        />
                      </div>
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={filteredColumns}
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
                        Không có người dùng phù hợp
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
      <Footer />
    </div>
  );
};

export default ManagementUsers;
