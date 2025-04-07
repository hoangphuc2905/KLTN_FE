import { useEffect, useState } from "react";
import userApi from "../../../api/api";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2024");
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

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto max-md:max-w-full">
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
              Thông tin cá nhân
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-md:px-4">
          <section className="flex flex-wrap items-start max-md:flex-col max-md:max-w-full">
            <section className="flex flex-col self-stretch py-6 pr-px pl-11 bg-white rounded-lg max-md:pl-5 max-md:max-w-full">
              <div className="flex items-start gap-10 flex-nowrap max-md:flex-wrap">
                <img
                  src={user?.avatar}
                  className="object-contain shrink-0 self-end rounded-full w-[150px] h-[150px] max-md:w-[100px] max-md:h-[100px]"
                  alt="Profile photo"
                />
                <div className="flex flex-col w-[calc(100%-220px)] max-w-full max-md:w-full">
                  <h2 className="text-sm font-medium leading-none text-black max-md:text-base">
                    THÔNG TIN LÝ LỊCH KHOA HỌC
                  </h2>
                  <hr className="object-contain self-stretch mt-3 w-full max-md:max-w-full" />
                  <div className="mt-4 max-w-full w-[1110px] max-md:w-full">
                    <div className="flex gap-5 max-md:flex-col">
                      <div className="w-[32%] max-md:w-full">
                        <div className="flex flex-col grow text-sm font-medium leading-none text-black max-md:mt-10">
                          <div className="mr-7 max-md:mr-2.5">
                            Mã số sinh viên:{" "}
                            <span className="font-bold">
                              {user?.lecturer_id || user?.student_id}
                            </span>
                          </div>
                          <div className="mt-4">
                            Họ và tên:{" "}
                            <span className="font-bold">{user?.full_name}</span>
                          </div>
                          <div className="self-start mt-4">
                            Giới tính:{" "}
                            <span className="font-bold">
                              {translateGender(user?.gender)}
                            </span>
                          </div>
                          <div className="mt-4">
                            Ngày vào trường:{" "}
                            <span className="font-bold">
                              {formatDate(user?.start_date)}
                            </span>
                          </div>
                          <div className="self-start mt-4">
                            Khoa:{" "}
                            <span className="font-bold">
                              {departmentName || "Chưa cập nhật"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 w-[68%] max-md:ml-0 max-md:w-full">
                        <div className="flex flex-col grow items-start text-sm font-medium leading-none text-black max-md:mt-10 max-md:max-w-full">
                          <div>
                            Ngày sinh:{" "}
                            <span className="font-bold">
                              {formatDate(user?.date_of_birth)}
                            </span>
                          </div>
                          <div className="mt-4">
                            Số CCCD:{" "}
                            <span className="font-bold">{user?.cccd}</span>
                          </div>
                          <div className="mt-4">
                            Email:{" "}
                            <span className="font-bold">{user?.email}</span>
                          </div>
                          <div className="mt-4">
                            Số điện thoại:{" "}
                            <span className="font-bold">{user?.phone}</span>
                          </div>
                          <div className="self-stretch mt-4 max-md:max-w-full">
                            Địa chỉ liên hệ:{" "}
                            <span className="font-bold">{user?.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Adjustments for mobile responsiveness */}
              <h2 className="self-center mt-6 text-sm font-medium leading-none text-black max-md:text-base">
                TRAO ĐỔI GẦN ĐÂY
              </h2>
              <hr className="object-contain self-stretch mt-3 w-full max-md:max-w-full" />
              <div className="mt-4 mr-9 max-md:mr-2.5 max-md:max-w-full">
                <div className="flex gap-5 max-md:flex-col">
                  <div className="w-[28%] max-md:w-full">
                    <div className="flex flex-col pt-7 w-full max-md:mt-10">
                      <div className="flex flex-col items-center px-6 pt-6 pb-1.5 mt-0 bg-white rounded-3xl border border-black min-h-[474px] max-md:px-4">
                        <div className="flex justify-between w-full">
                          <h3 className="text-sm font-bold leading-none text-black max-md:text-base">
                            Thành tích đóng góp
                          </h3>
                          <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="flex z-10 gap-2 items-center pr-10 pl-3 text-sm font-bold leading-none text-black whitespace-nowrap rounded-md border border-solid bg-zinc-100 border-gray-300 h-[19px] w-[116px] max-md:h-[36px] max-md:w-[100px]"
                          >
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                            <option value="2022">2022</option>
                          </select>
                        </div>
                        <div className="mt-4 max-w-full min-h-[402px] w-[355px]">
                          <div className="flex flex-col items-center w-full">
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a85564bf2d993b2f5f5e6338fad61fc05c6ae7fb53a9eb0683310e68382b8e5b?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                              className="object-contain max-w-full aspect-square w-[200px]"
                              alt="Statistics chart"
                            />
                          </div>
                          <div className="mt-4 w-full text-sm leading-loose text-gray-800 max-w-[355px] min-h-[154px] max-md:mt-10">
                            <div className="flex gap-6 items-start px-8 w-full max-md:px-5">
                              <div className="flex flex-1 shrink gap-2 items-center whitespace-nowrap rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-green-500 rounded"></div>
                                <div className="flex-1 shrink self-stretch my-auto basis-0">
                                  Done
                                </div>
                              </div>
                              <div className="flex flex-1 shrink gap-2 items-center text-right rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-red-500 rounded"></div>
                                <div className="self-stretch my-auto">
                                  Overdue work
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-6 items-start px-8 mt-4 w-full text-right max-md:px-5">
                              <div className="flex flex-1 shrink gap-2 items-center rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-orange-400 rounded"></div>
                                <div className="self-stretch my-auto">
                                  Work finished late
                                </div>
                              </div>
                              <div className="flex flex-1 shrink gap-2 items-center whitespace-nowrap rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-blue-500 rounded"></div>
                                <div className="self-stretch my-auto">
                                  Processing
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
                    <div className="mt-2.5 w-full text-xl text-black max-md:mt-10 max-md:text-base">
                      <div className="relative flex flex-col pl-8 border-gray-300">
                        {Array(5)
                          .fill(0)
                          .map((_, index) => (
                            <div
                              key={index}
                              className="relative flex items-start gap-2 max-md:gap-1"
                            >
                              {/* Avatar + Đường dọc */}
                              <div className="relative flex flex-col items-center">
                                <div className="w-11 h-11 rounded-full bg-white border border-gray-300 flex items-center justify-center max-md:w-8 max-md:h-8">
                                  <img
                                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/aed835d36a2dd64ee06f5306c36e2c710acd8eb301ba94120a7c5fc6b7e141b0"
                                    className="w-10 h-10 rounded-full max-md:w-6 max-md:h-6"
                                    alt="Profile"
                                  />
                                </div>
                                {index < 4 && (
                                  <div className="w-[2px] h-12 bg-gray-300 max-md:h-8"></div>
                                )}
                              </div>
                              {/* Nội dung bên phải */}
                              <div className="relative flex-auto p-2 bg-white rounded-lg shadow-md w-[700px] max-md:w-full text-sm max-md:text-xs">
                                <span className="font-bold">Admin</span>
                                <br />
                                Duyệt thông tin bài báo
                                <div className="absolute top-3 right-3 text-gray-500 text-sm max-md:text-xs">
                                  2 tháng
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
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

export default ProfilePage;
