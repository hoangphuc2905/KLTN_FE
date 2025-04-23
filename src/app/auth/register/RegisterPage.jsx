import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/Footer";
const Logo = new URL("../../../assets/logo.png", import.meta.url).href;
import userApi from "../../../api/api";
import authApi from "../../../api/authApi";
import { message, Modal } from "antd";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    student_id: "",
    start_date: "",
    full_name: "",
    gender: "",
    date_of_birth: "",
    faculty: "",
    address: "",
    email: "",
    cccd: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await userApi.getAllDepartments();
        if (Array.isArray(response)) {
          setDepartments(response);
        } else {
          message.error("Không thể lấy danh sách khoa");
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        message.error("Có lỗi xảy ra khi lấy danh sách khoa");
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const currentDate = new Date();

    // Check Mã số sinh viên
    if (!formData.student_id)
      newErrors.student_id = "Vui lòng nhập mã sinh viên";

    // Check Ngày vào trường
    if (!formData.start_date) {
      newErrors.start_date = "Vui lòng chọn ngày vào trường";
    } else if (new Date(formData.start_date) >= currentDate) {
      newErrors.start_date = "Ngày vào trường phải nhỏ hơn ngày hiện tại";
    }

    // Check Họ và tên
    if (!formData.full_name) newErrors.full_name = "Vui lòng nhập họ và tên";

    // Check Giới tính
    if (!formData.gender) newErrors.gender = "Vui lòng chọn giới tính";

    // Check Ngày sinh
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = "Vui lòng chọn ngày sinh";
    } else {
      const birthDate = new Date(formData.date_of_birth);
      const age = currentDate.getFullYear() - birthDate.getFullYear();
      const isBirthdayPassed =
        currentDate.getMonth() > birthDate.getMonth() ||
        (currentDate.getMonth() === birthDate.getMonth() &&
          currentDate.getDate() >= birthDate.getDate());
      if (age < 18 || (age === 18 && !isBirthdayPassed)) {
        newErrors.date_of_birth = "Ngày sinh phải đủ 18 tuổi";
      }
    }

    // Check Khoa
    if (!formData.faculty) newErrors.faculty = "Vui lòng chọn khoa";

    // Check Địa chỉ
    if (!formData.address) newErrors.address = "Vui lòng nhập địa chỉ";

    // Check Email
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Check CCCD
    if (!formData.cccd) {
      newErrors.cccd = "Vui lòng nhập số CCCD";
    } else if (!/^\d{12}$/.test(formData.cccd)) {
      newErrors.cccd = "CCCD phải có 12 chữ số";
    }

    // Check Số điện thoại
    if (!formData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const selectedDepartment = departments.find(
        (dept) => dept.department_name === formData.faculty
      );

      if (!selectedDepartment) {
        message.error("Khoa không hợp lệ");
        return;
      }

      const payload = {
        ...formData,
        department: selectedDepartment._id, // Ensure the correct field name and value
      };

      await authApi.registerStudent(payload);
      setIsModalVisible(true); // Show the modal on success
    } catch (error) {
      if (error.response && error.response.data) {
        const { message: errorMessage } = error.response.data;
        if (errorMessage === "Mã số sinh viên hoặc email đã tồn tại") {
          message.error("Mã số sinh viên hoặc email đã được sử dụng");
        } else {
          message.error(errorMessage || "Có lỗi xảy ra khi đăng ký tài khoản");
        }
      } else {
        console.error("Error during registration:", error);
        message.error("Có lỗi xảy ra khi đăng ký tài khoản");
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      student_id: "",
      start_date: "",
      full_name: "",
      gender: "",
      date_of_birth: "",
      faculty: "",
      address: "",
      email: "",
      cccd: "",
      phone: "",
    });
    setErrors({});
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
    navigate("/login"); // Redirect to login after closing the modal
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="flex items-center h-[60px] px-20 w-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5 max-md:max-w-full">
        <div className="flex items-center w-full">
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Logo"
              className="object-contain h-full max-w-full  w-[100px] max-md:w-[50px]"
            />
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-sm font-bold text-center text-zinc-800 max-md:text-xs">
              HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
              CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
            </h1>
          </div>
        </div>
      </header>
      <div className="flex flex-col items-center py-10 px-6">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-gray-600 text-center mb-8">
            Vui lòng điền đầy đủ các thông tin bên dưới để tạo tài khoản.
          </p>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã số sinh viên */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mã số sinh viên
              </label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
                placeholder="Nhập mã sinh viên"
              />
              {errors.student_id && (
                <p className="text-xs text-red-600 mt-1">{errors.student_id}</p>
              )}
            </div>
            {/* Ngày vào trường */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày vào trường
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
              />
              {errors.start_date && (
                <p className="text-xs text-red-600 mt-1">{errors.start_date}</p>
              )}
            </div>
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ và tên
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
                placeholder="Nhập họ và tên"
              />
              {errors.full_name && (
                <p className="text-xs text-red-600 mt-1">{errors.full_name}</p>
              )}
            </div>
            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
              >
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              {errors.gender && (
                <p className="text-xs text-red-600 mt-1">{errors.gender}</p>
              )}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
                placeholder="Nhập số điện thoại"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>
            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày sinh
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
              />
              {errors.date_of_birth && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.date_of_birth}
                </p>
              )}
            </div>
            {/* Khoa */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Khoa
              </label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
              >
                <option value="">Chọn khoa</option>
                {departments.map((department) => (
                  <option
                    key={department._id}
                    value={department.department_name}
                  >
                    {department.department_name}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <p className="text-xs text-red-600 mt-1">{errors.faculty}</p>
              )}
            </div>
            {/* CCCD */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CCCD
              </label>
              <input
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
                placeholder="Nhập số CCCD"
              />
              {errors.cccd && (
                <p className="text-xs text-red-600 mt-1">{errors.cccd}</p>
              )}
            </div>
            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-[48px] px-3"
                placeholder="Nhập địa chỉ"
              />
              {errors.address && (
                <p className="text-xs text-red-600 mt-1">{errors.address}</p>
              )}
            </div>
          </form>
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </span>
            </p>
            <div className="flex gap-4">
              <button
                className="px-6 py-3 bg-red-500 text-white rounded-md shadow-md hover:bg-red-600"
                onClick={handleCancel}
              >
                Hủy
              </button>
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
                onClick={handleSave}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Đăng ký thành công"
        visible={isModalVisible}
        onOk={handleModalOk}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <p>
          Tài khoản bạn đã đăng ký thành công. Bộ phận phụ trách sẽ xem xét và
          duyệt cho bạn. Thông tin đăng nhập sẽ được gửi qua email khi tài khoản
          bạn được duyệt.
        </p>
      </Modal>
      <Footer />
    </div>
  );
};

export default RegisterPage;
