import { useEffect, useState, useRef } from "react";
import userApi from "../../../api/api";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2024");
  const [departmentName, setDepartmentName] = useState("");
  const [recentlyViewedPapers, setRecentlyViewedPapers] = useState([]);
  const [contributionStats, setContributionStats] = useState({
    totalRequired: 10, // Điểm cần đóng góp
    totalAchieved: 8, // Điểm đã đóng góp
    percentage: 80, // Phần trăm hoàn thành
  });
  const chartRef = useRef(null);
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

  useEffect(() => {
    const fetchRecentlyViewedPapers = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu này
        // const response = await userApi.getRecentlyViewedPapers(userId);
        // setRecentlyViewedPapers(response.data);

        // Dữ liệu mẫu cho demo
        setRecentlyViewedPapers([
          {
            id: "paper1",
            title:
              "Nghiên cứu ứng dụng trí tuệ nhân tạo trong chuẩn đoán bệnh ung thư phổi giai đoạn sớm",
            author: "Nguyễn Văn A, Trần Thị B",
            summary:
              "Nghiên cứu này đề xuất một phương pháp mới sử dụng deep learning để phát hiện các dấu hiệu sớm của bệnh ung thư phổi thông qua phân tích ảnh X-quang và CT scan.",
            departmentName: "Khoa Công nghệ Thông tin",
            thumbnailUrl:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da",
            views: 328,
            downloads: 42,
            viewDate: "Hôm nay",
          },
          {
            id: "paper2",
            title:
              "Phát triển vật liệu composite từ sợi tre và nhựa tái chế thân thiện với môi trường",
            author: "Lê Xuân C, Phạm Minh D",
            summary:
              "Nghiên cứu chế tạo vật liệu composite từ sợi tre và nhựa tái chế có khả năng phân hủy sinh học, góp phần giảm thiểu ô nhiễm môi trường từ rác thải nhựa.",
            departmentName: "Khoa Kỹ thuật Vật liệu",
            thumbnailUrl:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72",
            views: 156,
            downloads: 23,
            viewDate: "Hôm qua",
          },
          {
            id: "paper3",
            title:
              "Ảnh hưởng của biến đổi khí hậu đến sự đa dạng sinh học tại Vườn Quốc gia Cát Tiên",
            author: "Hoàng Thị E",
            summary:
              "Nghiên cứu đánh giá tác động của biến đổi khí hậu đến hệ sinh thái và đa dạng sinh học tại Vườn Quốc gia Cát Tiên, đề xuất các giải pháp bảo tồn hiệu quả.",
            departmentName: "Khoa Sinh học",
            thumbnailUrl:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/aed835d36a2dd64ee06f5306c36e2c710acd8eb301ba94120a7c5fc6b7e141b0",
            views: 203,
            downloads: 31,
            viewDate: "3 ngày trước",
          },
          {
            id: "paper4",
            title:
              "Nghiên cứu giải pháp tối ưu hóa lưới điện thông minh tích hợp nguồn năng lượng tái tạo",
            author: "Đặng Văn F, Ngô Thị G",
            summary:
              "Đề xuất mô hình lưới điện thông minh với khả năng tích hợp và quản lý hiệu quả các nguồn năng lượng tái tạo như điện mặt trời và điện gió.",
            departmentName: "Khoa Điện - Điện tử",
            thumbnailUrl:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da",
            views: 187,
            downloads: 29,
            viewDate: "1 tuần trước",
          },
          {
            id: "paper5",
            title:
              "Phát triển thuật toán xử lý ngôn ngữ tự nhiên cho tiếng Việt ứng dụng trong phân tích cảm xúc Phát triển thuật toán xử lý ngôn ngữ tự nhiên cho tiếng Việt ứng dụng trong phân tích cảm xúc",
            author:
              "Trần Văn H, Trần Văn H, Trần Văn H, Trần Văn H, Trần Văn H",
            summary:
              "Nghiên cứu phát triển các mô hình và thuật toán xử lý ngôn ngữ tự nhiên đặc thù cho tiếng Việt, ứng dụng trong phân tích cảm xúc từ bình luận người dùng trên mạng xã hội. Nghiên cứu phát triển các mô hình và thuật toán xử lý ngôn ngữ tự nhiên đặc thù cho tiếng Việt, ứng dụng trong phân tích cảm xúc từ bình luận người dùng trên mạng xã hội. Nghiên cứu phát triển các mô hình và thuật toán xử lý ngôn ngữ tự nhiên đặc thù cho tiếng Việt, ứng dụng trong phân tích cảm xúc từ bình luận người dùng trên mạng xã hội.",
            departmentName: "Khoa Công nghệ Thông tin",
            thumbnailUrl:
              "https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72",
            views: 246,
            downloads: 38,
            viewDate: "2 tuần trước",
          },
        ]);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bài báo đã xem gần đây:", error);
      }
    };

    fetchRecentlyViewedPapers();
  }, []);

  // Thêm CSS cho thanh cuộn tùy chỉnh
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
      }
      
      .custom-scrollbar::-webkit-scrollbar {
        width: 0;
        display: none; /* Chrome, Safari and Opera */
      }
      
      .custom-scrollbar-hover {
        scrollbar-width: thin;
        -ms-overflow-style: -ms-autohiding-scrollbar;
      }
      
      .custom-scrollbar-hover::-webkit-scrollbar {
        width: 5px;
        background-color: transparent;
        display: none;
      }
      
      .custom-scrollbar-hover:hover::-webkit-scrollbar {
        display: block;
      }
      
      .custom-scrollbar-hover::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 10px;
      }
      
      .custom-scrollbar-hover::-webkit-scrollbar-thumb {
        background-color: rgba(203, 213, 224, 0.5);
        border-radius: 10px;
      }
      
      .custom-scrollbar-hover:hover::-webkit-scrollbar-thumb {
        background-color: rgba(203, 213, 224, 0.8);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch thành tích đóng góp theo năm
  useEffect(() => {
    const fetchContributionStats = async () => {
      try {
        // Trong thực tế, sẽ gọi API để lấy dữ liệu
        // const response = await userApi.getContributionStats(user?.id, selectedYear);
        // setContributionStats(response.data);

        // Dữ liệu mẫu
        const mockData = {
          2024: { totalRequired: 10, totalAchieved: 8, percentage: 80 },
          2023: { totalRequired: 8, totalAchieved: 7, percentage: 87.5 },
          2022: { totalRequired: 6, totalAchieved: 4, percentage: 66.7 },
        };

        setContributionStats(mockData[selectedYear]);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thành tích:", error);
      }
    };

    fetchContributionStats();
  }, [selectedYear]);

  // Cấu hình biểu đồ Highcharts
  const getChartOptions = () => {
    return {
      chart: {
        type: "pie",
        height: 300,
        backgroundColor: "transparent",
        style: {
          fontFamily: '"Inter", sans-serif',
        },
      },
      title: {
        text: null,
      },
      tooltip: {
        pointFormat: "<b>{point.percentage:.1f}%</b>",
        style: {
          fontSize: "14px",
        },
      },
      plotOptions: {
        pie: {
          borderWidth: 0,
          shadow: {
            offsetX: 0,
            offsetY: 0,
            width: 5,
            opacity: 0.15,
          },
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: [
        // Vòng tròn bọc ngoài cùng (trang trí)
        {
          name: "Outer Wrapper",
          data: [
            {
              name: "Outer Wrapper",
              y: 1,
              color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, "#f0f7ff"],
                  [1, "#e6f0ff"],
                ],
              },
              dataLabels: { enabled: false },
            },
          ],
          size: "160%",
          innerSize: "150%",
          borderWidth: 0,
          dataLabels: { enabled: false },
          enableMouseTracking: false,
        },
        // Vòng tròn bên ngoài lớn (tổng điểm cần đóng góp)
        {
          name: "Tổng điểm",
          data: [
            {
              name: "Tổng điểm",
              y: 1,
              color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, "#eaeff4"],
                  [1, "#d8e1eb"],
                ],
              },
              dataLabels: { enabled: false },
            },
          ],
          size: "130%",
          innerSize: "100%",
          borderWidth: 0,
          dataLabels: { enabled: false },
          enableMouseTracking: false,
        },
        // Vòng tròn bên trong (điểm đã đóng góp)
        {
          name: "Điểm đóng góp",
          colorByPoint: true,
          size: "100%",
          innerSize: "75%",
          borderRadius: 4,
          data: [
            {
              name: "Đã đạt",
              y: contributionStats.totalAchieved,
              color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, "#00A3FF"],
                  [1, "#0077FF"],
                ],
              },
              dataLabels: {
                enabled: false,
              },
            },
            {
              name: "Còn thiếu",
              y:
                contributionStats.totalRequired -
                contributionStats.totalAchieved,
              color: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                  [0, "#f0f0f0"],
                  [1, "#e0e0e0"],
                ],
              },
              dataLabels: {
                enabled: false,
              },
            },
          ],
        },
      ],
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              chart: {
                height: 300,
              },
              series: [{ size: "170%" }, { size: "140%" }, { size: "110%" }],
            },
          },
        ],
      },
    };
  };

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
                      <div className="flex flex-col items-center px-6 pt-6 pb-1.5 mt-0 bg-white rounded-3xl border border-black min-h-[320px] max-md:px-4">
                        <div className="flex justify-between w-full">
                          <h3 className="text-sm font-bold leading-none text-black max-md:text-base">
                            Thành tích đóng góp
                          </h3>
                          <select
                            className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-sm w-[110px] cursor-pointer hover:bg-[#008AE0] transition-colors"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                          >
                            <option value="2024">2024-2025</option>
                            <option value="2023">2023-2024</option>
                            <option value="2022">2022-2023</option>
                          </select>
                        </div>
                        <div className="mt-4 max-w-full min-h-[280px] w-full">
                          <div className="flex flex-col items-center w-full relative">
                            <HighchartsReact
                              highcharts={Highcharts}
                              options={getChartOptions()}
                              ref={chartRef}
                            />

                            {/* Số liệu ở giữa biểu đồ */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                              <div className="text-4xl font-bold text-gray-800">
                                {contributionStats.percentage}%
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Hoàn thành
                              </div>
                              <div className="text-base font-semibold mt-2 text-sky-600">
                                {contributionStats.totalAchieved}/
                                {contributionStats.totalRequired} điểm
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
                    <div className="mt-2.5 w-full text-xl text-black max-md:mt-10 max-md:text-base">
                      <div className="relative flex flex-col pl-4 border-gray-300 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <h3 className="text-base font-bold mb-3 text-gray-800">
                          Bài báo đã xem gần đây
                        </h3>
                        {recentlyViewedPapers.map((paper, index) => (
                          <Link
                            to={`/scientific-paper/${paper.id}`}
                            key={index}
                            className="mb-4 block"
                          >
                            <article className="relative flex gap-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3">
                              <div className="flex-shrink-0">
                                <img
                                  src={paper.thumbnailUrl}
                                  className="w-16 h-20 object-cover rounded-md border border-gray-200"
                                  alt={paper.title}
                                />
                              </div>
                              <div className="flex-grow overflow-hidden pr-2">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-bold text-sm line-clamp-2 mb-1 pr-16">
                                    {paper.title}
                                  </h4>
                                  <div className="absolute top-3 right-3 text-xs text-gray-500">
                                    {paper.viewDate}
                                  </div>
                                </div>
                                <div className="text-xs text-sky-900">
                                  {paper.author}
                                </div>
                                <p className="text-xs text-neutral-800 line-clamp-2 mt-1">
                                  {paper.summary}
                                </p>
                                <div className="text-xs text-sky-900 mt-1">
                                  {paper.departmentName}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 justify-end">
                                  <div className="flex items-center">
                                    <img
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                                      className="w-3 h-3 mr-1"
                                      alt="Views"
                                    />
                                    <span className="text-orange-500">
                                      {paper.views}
                                    </span>
                                  </div>
                                  <div className="flex items-center ml-2">
                                    <img
                                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                                      className="w-3 h-3 mr-1"
                                      alt="Downloads"
                                    />
                                    <span>{paper.downloads}</span>
                                  </div>
                                </div>
                              </div>
                            </article>
                          </Link>
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
