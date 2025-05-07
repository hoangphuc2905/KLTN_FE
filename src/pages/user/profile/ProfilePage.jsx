import { useEffect, useState, useRef } from "react";
import userApi from "../../../api/api";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useNavigate, Link } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Pagination, Spin } from "antd";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2024");
  const [departmentName, setDepartmentName] = useState("");
  const [recentlyViewedPapers, setRecentlyViewedPapers] = useState([]);
  const [recentlyDownloadedPapers, setRecentlyDownloadedPapers] = useState([]);
  const [contributionStats, setContributionStats] = useState({
    totalRequired: 0,
    totalAchieved: 0,
    percentage: 0,
  });
  const [activeTab, setActiveTab] = useState("viewed"); // Tab state
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 5;
  const chartRef = useRef(null);
  const navigate = useNavigate();
  const [academicYears, setAcademicYears] = useState([]); // State for academic years
  const [isLoading, setIsLoading] = useState(false); // Thêm state cho loading

  const formatViewDate = (viewDate) => {
    const now = new Date();
    const viewedDate = new Date(viewDate);

    const diffInTime = now - viewedDate;
    const diffInMinutes = Math.floor(diffInTime / (1000 * 60));
    const diffInHours = Math.floor(diffInTime / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays === 1) {
      return "Hôm qua";
    } else if (diffInDays === 2) {
      return "2 ngày trước";
    } else {
      return viewedDate.toLocaleDateString("vi-VN");
    }
  };

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
      setIsLoading(true);
      try {
        const response = await userApi.getAllPaperViewsByUser(userId);
        const formattedPapers = response.map((item) => ({
          id: item.paper_id._id,
          title: item.paper_id.title_vn,
          author: item.paper_id.author.map((a) => a.author_name_vi).join(", "),
          summary: item.paper_id.summary,
          departmentName: item.paper_id.department.department_name,
          thumbnailUrl: item.paper_id.cover_image,
          viewDate: formatViewDate(item.createdAt), // Use createdAt for view time
        }));
        setRecentlyViewedPapers(formattedPapers);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bài báo đã xem gần đây:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyViewedPapers();
  }, []);

  useEffect(() => {
    const fetchRecentlyDownloadedPapers = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      setIsLoading(true);
      try {
        const response = await userApi.getAllPaperDownloadsByUser(userId);
        const formattedPapers = (response || []).map((item) => ({
          id: item.paper_id?._id || "N/A",
          title: item.paper_id?.title_vn || "N/A",
          author:
            item.paper_id?.author?.map((a) => a.author_name_vi).join(", ") ||
            "N/A",
          summary: item.paper_id?.summary || "N/A",
          departmentName: item.paper_id?.department?.department_name || "N/A",
          thumbnailUrl: item.paper_id?.cover_image || "",
          downloadDate: item.paper_id?.publish_date
            ? new Date(item.paper_id.publish_date).toLocaleDateString("vi-VN")
            : "N/A",
        }));
        setRecentlyDownloadedPapers(formattedPapers);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bài báo đã tải gần đây:", error);
        setRecentlyDownloadedPapers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyDownloadedPapers();
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
        const userId = user?.lecturer_id || user?.student_id;
        if (!userId) return;

        let totalPoints = 0;

        if (selectedYear !== "Tất cả") {
          const response = await userApi.getTotalPointsByAuthorAndYear(
            userId,
            selectedYear
          );
          totalPoints = response.total_points || 0;
        } else {
          const response = await userApi.getTotalPointsByAuthorAndYear(userId);
          totalPoints = response.total_points || 0;
        }

        const totalRequired = 10;
        const percentage = (totalPoints / totalRequired) * 100;

        setContributionStats({
          totalRequired,
          totalAchieved: totalPoints,
          percentage: Math.min(percentage, 100),
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thành tích:", error);
        setContributionStats({
          totalRequired: 10,
          totalAchieved: 0,
          percentage: 0,
        });
      }
    };

    fetchContributionStats();
  }, [selectedYear, user]);

  // Fetch academic years
  const getAcademicYears = async () => {
    try {
      const response = await userApi.getAcademicYears();
      const years = response.academicYears || [];
      setAcademicYears(["Tất cả", ...years.reverse()]);
      setSelectedYear("Tất cả");
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  useEffect(() => {
    getAcademicYears();
  }, []);

  // Cấu hình biểu đồ Highcharts
  const getChartOptions = () => {
    return {
      chart: {
        type: "pie",
        height: 350,
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
        {
          name: "Điểm đóng góp",
          colorByPoint: true,
          size: "90%",
          innerSize: "85%",
          borderRadius: 4,
          data: [
            {
              name: "Đã đạt",
              y: contributionStats.totalAchieved || 0, // Fallback to 0
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
                (contributionStats.totalRequired || 0) -
                (contributionStats.totalAchieved || 0), // Fallback to 0
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
      accessibility: {
        enabled: false, // Disable accessibility warning
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              chart: {
                height: 400,
              },
              series: [{ size: "120%", innerSize: "115%" }],
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
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

              <hr className="object-contain self-stretch mt-3 w-full max-md:max-w-full" />
              <div className="mr-9 max-md:mr-2.5 max-md:max-w-full">
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
                            {academicYears.map((year, index) => (
                              <option key={index} value={year}>
                                {year}
                              </option>
                            ))}
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
                        {/* Sticky Tabs */}
                        <div className="sticky top-0 bg-white z-10 flex gap-4 mb-4 p-2 shadow-sm">
                          <button
                            className={`text-sm font-bold ${
                              activeTab === "viewed"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600"
                            }`}
                            onClick={() => {
                              setActiveTab("viewed");
                              setCurrentPage(1); // Reset to page 1 when switching tabs
                            }}
                          >
                            Bài báo đã xem gần đây
                          </button>
                          <button
                            className={`text-sm font-bold ${
                              activeTab === "downloaded"
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-600"
                            }`}
                            onClick={() => {
                              setActiveTab("downloaded");
                              setCurrentPage(1); // Reset to page 1 when switching tabs
                            }}
                          >
                            Bài báo đã tải gần đây
                          </button>
                        </div>
                        {/* Content */}
                        {activeTab === "viewed" &&
                          (isLoading ? (
                            <div className="flex justify-center items-center min-h-[300px]">
                              <Spin size="large" />
                            </div>
                          ) : recentlyViewedPapers.length > 0 ? (
                            getPaginatedData(recentlyViewedPapers).map(
                              (paper, index) => (
                                <Link
                                  to={`/scientific-paper/${paper.id}`}
                                  key={index}
                                  className="mb-4 block"
                                >
                                  <article className="relative flex gap-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-300">
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
                                          {paper.viewDate}{" "}
                                          {/* Display formatted view date */}
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
                                    </div>
                                  </article>
                                </Link>
                              )
                            )
                          ) : (
                            <div className="text-center text-gray-500 text-sm mt-4">
                              Không có bài báo đã xem gần đây.
                            </div>
                          ))}
                        {activeTab === "downloaded" &&
                          (isLoading ? (
                            <div className="flex justify-center items-center min-h-[300px]">
                              <Spin size="large" />
                            </div>
                          ) : recentlyDownloadedPapers.length > 0 ? (
                            getPaginatedData(recentlyDownloadedPapers).map(
                              (paper, index) => (
                                <Link
                                  to={`/scientific-paper/${paper.id}`}
                                  key={index}
                                  className="mb-4 block"
                                >
                                  <article className="relative flex gap-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 border border-gray-300">
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
                                          {paper.downloadDate}
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
                                    </div>
                                  </article>
                                </Link>
                              )
                            )
                          ) : (
                            <div className="text-center text-gray-500 text-sm mt-4">
                              Không có bài báo đã tải gần đây.
                            </div>
                          ))}
                        {/* Sticky Pagination */}
                        <div className="sticky bottom-0 bg-white z-10 p-2 shadow-sm">
                          <Pagination
                            current={currentPage}
                            pageSize={itemsPerPage}
                            total={
                              activeTab === "viewed"
                                ? recentlyViewedPapers.length
                                : recentlyDownloadedPapers.length
                            }
                            onChange={handlePageChange}
                            showSizeChanger={false}
                          />
                        </div>
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
