import { useEffect, useState } from "react";
import { message } from "antd";
import userApi from "../../../api/api";
import authApi from "../../../api/authApi";
import Header from "../../../components/Header";
import Footer from "../../../components/footer";
import { useNavigate } from "react-router-dom";

const UpdateProfilePage = () => {
  const [user, setUser] = useState({
    user_id: "",
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
  const [initialUser, setInitialUser] = useState(null);
  const [departmentName, setDepartmentName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Thiếu token. Vui lòng đăng nhập.");
        return;
      }

      try {
        const response = await userApi.getUserInfo({
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setInitialUser(response.data);
        if (response.data.department) {
          const departmentResponse = await userApi.getDepartmentById(
            response.data.department
          );
          setDepartmentName(departmentResponse.department_name); // Lưu tên khoa vào state
        }
      } catch (error) {
        if (error.response?.data?.message === "Invalid token") {
          console.error("Token không hợp lệ. Vui lòng đăng nhập lại.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error(
            "Lỗi khi lấy thông tin user:",
            error.response?.data || error.message
          );
        }
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const translateGender = (gender) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Khác";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const data = {
      address: user.address,
      phone: user.phone,
      email: user.email,
    };

    try {
      const response = await authApi.updateUserInfo(data);
      console.log("User profile updated:", response);
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      if (error.message === "Bạn chưa đăng nhập!") {
        message.error("Bạn chưa đăng nhập!");
      } else if (error.message === "Lecturer not found") {
        message.error("Không tìm thấy giảng viên!");
      } else if (error.message === "Invalid request body") {
        message.error("Dữ liệu gửi không hợp lệ!");
      } else {
        message.error(error.message || "Lỗi khi cập nhật thông tin.");
      }
      console.error("Lỗi khi cập nhật thông tin user:", error);
    }
  };

  const handleCancel = () => {
    setUser(initialUser);
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto max-md:max-w-full max-md:px-4">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-md:px-4">
          <div className="flex items-center gap-2 text-gray-600 max-md:text-sm">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-5 h-5 max-md:w-4 max-md:h-4"
            />
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500"
            >
              Trang chủ
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">
              Cập nhật thông tin cá nhân
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-md:px-4">
          <section className="flex flex-col self-stretch py-2 pr-px pl-11 bg-white rounded-lg max-md:pl-5 max-md:max-w-full">
            <section className="flex relative flex-col items-center self-stretch px-20 pb-11 rounded-lg min-h-fit max-md:px-4">
              <div className="flex relative flex-col max-w-full w-[1300px] max-md:w-full">
                <img
                  src={user?.avatar}
                  className="object-contain self-center max-w-full aspect-[0.94] rounded-[250px] w-[150px] h-[150px] max-md:w-[100px] max-md:h-[100px]"
                  alt="User avatar"
                />
                <p className="mt-4 mr-20 ml-10 text-sm font-semibold leading-none text-red-600 max-md:mr-2.5 max-md:ml-0 max-md:text-xs">
                  Lưu ý: Để chỉnh sửa những thông tin có ô (màu xám) Thầy/ cô và
                  sinh viên liên hệ Chuyên viên phòng CTHC để cập nhật từ phần
                  mềm nhân sự.
                </p>

                <div className="grid grid-cols-4 gap-7 mt-4 w-full text-sm leading-none text-black max-md:grid-cols-1 max-md:gap-4">
                  {/* Mã số sinh viên */}
                  <label className="font-medium flex items-center text-sm max-md:text-xs">
                    Mã số sinh viên:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {user?.lecturer_id || user?.student_id}
                  </div>

                  {/* Ngày vào trường */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Ngày vào trường:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {formatDate(user?.start_date)}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-7 mt-5 w-full text-sm leading-none text-black max-md:grid-cols-1 max-md:gap-4">
                  {/* Họ và tên */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Họ và tên:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {user?.full_name}
                  </div>

                  {/* Giới tính */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Giới tính:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {translateGender(user?.gender)}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-7 mt-5 w-full text-sm leading-none text-black max-md:grid-cols-1 max-md:gap-4">
                  {/* Ngày sinh */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Ngày sinh:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {formatDate(user?.date_of_birth)}
                  </div>

                  {/* Khoa */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Khoa:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {departmentName}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-7 mt-5 w-full text-sm leading-none text-black max-md:grid-cols-1 max-md:gap-4">
                  {/* CCCD */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    CCCD:
                  </label>
                  <div className="font-bold bg-zinc-100 border border-gray-300 rounded-md p-3 h-[20px] flex items-center col-span-1 text-sm max-md:text-xs">
                    {user?.cccd}
                  </div>

                  {/* Số điện thoại */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Số điện thoại:
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={user?.phone}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-3 h-[20px] col-span-1 bg-white outline-none text-sm max-md:text-xs"
                  />
                </div>

                <div className="grid grid-cols-4 gap-7 mt-5 w-full text-sm leading-none text-black max-md:grid-cols-1 max-md:gap-4">
                  {/* Địa chỉ liên hệ */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Địa chỉ liên hệ:
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={user?.address}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-3 h-[20px] col-span-1 bg-white outline-none text-sm max-md:text-xs"
                  />

                  {/* Email */}
                  <label className="font-medium flex items-center col-span-1 text-sm max-md:text-xs">
                    Email:
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={user?.email}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md p-3 h-[20px] col-span-1 bg-white outline-none text-sm max-md:text-xs"
                  />
                </div>

                <div className="flex gap-9 self-end mt-8 max-w-full text-sm font-semibold leading-none text-white w-[257px] max-md:gap-4 max-md:w-full">
                  <button
                    className="flex flex-1 justify-center items-center whitespace-nowrap bg-red-600 rounded-md h-[40px] max-md:h-[48px]"
                    onClick={handleCancel}
                  >
                    <span className="gap-2.5 self-stretch px-10 my-auto max-md:px-5 max-md:text-xs">
                      Hủy
                    </span>
                  </button>
                  <button
                    className="flex flex-1 justify-center items-center bg-sky-500 rounded-md h-[40px] max-md:h-[48px]"
                    onClick={handleSave}
                  >
                    <span className="gap-2.5 self-stretch px-10 my-auto max-md:px-5 max-md:text-xs">
                      Lưu
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateProfilePage;
