import { useState, useEffect, useRef } from "react";
import { Modal, Input, Table, message, Tooltip } from "antd";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/authApi";

const UserApprovalPage = () => {
  const [userRole] = useState(localStorage.getItem("current_role") || "");
  const [users, setUsers] = useState([]);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const departmentId = localStorage.getItem("department");
  const navigate = useNavigate();

  const getInactiveStudentsByDepartment = async (departmentId) => {
    try {
      const data = await userApi.getInactiveStudentsByDepartment(departmentId);
      console.log("Inactive students by department:", data.students);

      return (data.students || []).filter((user) => !user.isActive);
    } catch (error) {
      console.error("Error fetching inactive students by department:", error);
      return [];
    }
  };

  const reloadData = async () => {
    try {
      if (userRole === "admin") {
        const students = await userApi.getAllStudents();
        setUsers(students.filter((user) => !user.isActive)); // Dữ liệu đầy đủ
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
        const inactiveStudents = await getInactiveStudentsByDepartment(
          departmentId
        );
        setUsers(inactiveStudents); // Dữ liệu đầy đủ
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userRole === "admin") {
          const students = await userApi.getAllStudents();
          setUsers(students.filter((user) => !user.isActive)); // Only include pending users
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
          const inactiveStudents = await getInactiveStudentsByDepartment(
            departmentId
          );
          setUsers(inactiveStudents); // Only include pending users
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole, departmentId]);

  const approveStudent = async (studentId) => {
    try {
      await authApi.approveStudent(studentId);
      message.success("Người dùng đã được duyệt!");
      await reloadData();
    } catch (error) {
      console.error("Error approving user:", error);
      message.error("Lỗi khi duyệt người dùng!");
    }
  };

  const confirmApprove = (studentId) => {
    Modal.confirm({
      title: "Xác nhận duyệt",
      content: "Bạn có chắc chắn muốn duyệt tài khoản này không?",
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: () => approveStudent(studentId),
    });
  };

  const handleRowClick = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const handleApprove = async () => {
    if (selectedUser) {
      confirmApprove(selectedUser.student_id); // Use confirmation modal
      setIsModalVisible(false);
    }
  };

  const columns = [
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
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      width: 250,
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
      width: 150,
      render: (gender) => (gender === "male" ? "Nam" : "Nữ"),
      sorter: true,
    },
    {
      title: "NGÀY SINH",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: true,
    },
    {
      title: "CCCD",
      dataIndex: "cccd",
      key: "cccd",
      width: 150,
      ellipsis: { showTitle: false },
      render: (cccd) => (
        <Tooltip placement="topLeft" title={cccd || "Không xác định"}>
          {cccd || "Không xác định"}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "ĐỊA CHỈ",
      dataIndex: "address",
      key: "address",
      width: 250,
      ellipsis: { showTitle: false },
      render: (address) => (
        <Tooltip placement="topLeft" title={address || "Không xác định"}>
          {address || "Không xác định"}
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: "NGÀY BẮT ĐẦU",
      dataIndex: "start_date",
      key: "start_date",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
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
      title: "DUYỆT",
      key: "approve",
      width: 100,
      fixed: "right",
      render: (text, record) => (
        <button
          className="text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click event
            confirmApprove(record.student_id);
          }}
        >
          Duyệt
        </button>
      ),
      align: "center",
    },
  ];

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
          <div className="w-full bg-white">
            <Header />
          </div>
          <div className="self-center w-full max-w-[1563px] px-6 mt-4">
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
                alt="Home Icon"
                className="w-4 h-4"
              />
              <span
                onClick={() => navigate("/home")}
                className="cursor-pointer hover:text-blue-500"
              >
                Trang chủ
              </span>
              <span className="text-gray-400"> &gt; </span>
              <span className="font-medium text-gray-700">
                Quản lý tài khoản
              </span>
            </div>
          </div>
          <div className="self-center w-full max-w-[1563px] px-6 mt-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-base font-medium text-gray-800">
                Tài khoản cần duyệt:{" "}
                <span className="text-blue-600">{users.length}</span>
              </h2>
            </div>
          </div>
          <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
            <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="overflow-x-auto">
                  <Table
                    columns={columns}
                    dataSource={users}
                    pagination={{
                      current: userCurrentPage,
                      pageSize: itemsPerPage,
                      total: users.length,
                      onChange: (page) => setUserCurrentPage(page),
                    }}
                    rowKey={(record) => record._id || record.student_id}
                    className="text-sm"
                    scroll={{
                      x: columns.reduce(
                        (total, col) => total + (col.width || 0),
                        0
                      ),
                    }}
                    locale={{
                      emptyText: (
                        <div className="text-center py-6 text-gray-500">
                          Không có tài khoản cần duyệt
                        </div>
                      ),
                    }}
                    onRow={(record) => ({
                      onClick: () => handleRowClick(record), // Only trigger modal on row click
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Modal
        title="Thông tin chi tiết"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <button
            key="approve"
            className="text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600"
            onClick={handleApprove}
          >
            Duyệt
          </button>,
          <button
            key="cancel"
            className="text-gray-700 bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            onClick={() => setIsModalVisible(false)}
          >
            Đóng
          </button>,
        ]}
      >
        {selectedUser && (
          <div>
            <p>
              <strong>MSSV:</strong> {selectedUser.student_id}
            </p>
            <p>
              <strong>Họ và Tên:</strong> {selectedUser.full_name}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedUser.phone}
            </p>
            <p>
              <strong>Giới tính:</strong>{" "}
              {selectedUser.gender === "male" ? "Nam" : "Nữ"}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {new Date(selectedUser.date_of_birth).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <strong>CCCD:</strong> {selectedUser.cccd || "Không xác định"}
            </p>
            <p>
              <strong>Địa chỉ:</strong>{" "}
              {selectedUser.address || "Không xác định"}
            </p>
            <p>
              <strong>Khoa:</strong>{" "}
              {selectedUser.department?.department_name || "Không xác định"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserApprovalPage;
