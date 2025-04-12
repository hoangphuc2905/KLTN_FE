import React, { useState, useRef, useEffect } from "react";
import Header from "../../../components/header";
import { Home, ChevronRight } from "lucide-react";
import Footer from "../../../components/footer";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Hàm tính toán options cho biểu đồ dựa trên dữ liệu thực tế
const getChartOptions = (data) => {
  const maxValue =
    data && data.datasets && data.datasets[0] && data.datasets[0].data
      ? Math.max(
          ...data.datasets[0].data.filter((val) => !isNaN(val) && val !== 0)
        )
      : 0;

  const roundedMax = Math.ceil((maxValue + 10) / 10) * 10;

  // Ensure stepSize is reasonable to avoid too many ticks
  const step = Math.min(
    roundedMax > 100 ? 20 : roundedMax > 50 ? 10 : 5,
    Math.ceil(roundedMax / 10)
  );

  return {
    responsive: false,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: roundedMax,
        ticks: {
          stepSize: step,
        },
      },
    },
  };
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalViews: 0,
    totalDownloads: 0,
    year: 2024,
  });

  const [selectedYear, setSelectedYear] = useState("Tất cả");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await userApi.getStatisticsForAll(
          selectedYear !== "Tất cả" ? selectedYear : undefined
        );
        if (response) {
          setStats((prevStats) => ({
            ...prevStats,
            totalPapers: response.total_papers,
            totalViews: response.total_views,
            totalDownloads: response.total_downloads,
          }));
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };

    fetchStatistics();
  }, [selectedYear]);

  const [typeChartData, setTypeChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });

  useEffect(() => {
    const fetchTypeChartData = async () => {
      try {
        const response = await userApi.getStatisticsByAllGroup(
          selectedYear !== "Tất cả" ? selectedYear : undefined
        );
        if (response && response.data) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#7239EA", "#FF0000"][index % 5]
          ); // Generate colors dynamically

          setTypeChartData({
            labels,
            datasets: [
              {
                data,
                backgroundColor,
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
          });

          // Đặt các loại dữ liệu vào selectedQuarters khi dữ liệu được tải
          setSelectedQuarters(["All", ...labels]);
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch type chart data:", error);
      }
    };

    fetchTypeChartData();
  }, [selectedYear]);

  const [departmentChartData, setDepartmentChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });

  useEffect(() => {
    const fetchDepartmentChartData = async () => {
      try {
        const response = await userApi.getStatisticsTop5ByAllDepartment(
          selectedYear !== "Tất cả" ? selectedYear : undefined
        );
        if (response && response.data) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#39eaa3", "#FFC700"][index % 5]
          ); // Generate colors dynamically

          setDepartmentChartData({
            labels,
            datasets: [
              {
                data,
                backgroundColor,
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
          });
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch department chart data:", error);
      }
    };

    fetchDepartmentChartData();
  }, [selectedYear]);

  const [top5ByFieldChartData, setTop5ByFieldChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });

  useEffect(() => {
    const fetchTop5ByTypeChartData = async () => {
      try {
        const response = await userApi.getStatisticsTop5ByType(
          selectedYear !== "Tất cả" ? selectedYear : undefined
        );
        if (response && response.data) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#39eaa3", "#FFC700"][index % 5]
          ); // Generate colors dynamically

          setTop5ByFieldChartData({
            labels,
            datasets: [
              {
                data,
                backgroundColor,
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
          });
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch top 5 by type chart data:", error);
      }
    };

    fetchTop5ByTypeChartData();
  }, [selectedYear]);

  const donutOptions = {
    responsive: false, // Đặt responsive là false
    maintainAspectRatio: false, // Đặt maintainAspectRatio là false
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          usePointStyle: true,
          padding: 20,
          boxWidth: 10, // Adjust the box width to fit more labels
        },
      },
    },
    cutout: "70%",
  };

  const [topPapers, setTopPapers] = useState([]);

  useEffect(() => {
    const fetchTopPapers = async () => {
      try {
        const response = await userApi.getTop5MostViewedAndDownloadedPapers(
          selectedYear !== "Tất cả" ? selectedYear : undefined
        );
        if (response && response.papers && response.papers.length > 0) {
          setTopPapers(response.papers);
        } else {
          console.warn("No data found for top papers:", response);
          setTopPapers([]); // Set empty array to indicate no data
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn(
            "No data found for the selected academic year:",
            error.response.data
          );
          setTopPapers([]); // Set empty array to indicate no data
        } else {
          console.error(
            "Failed to fetch top papers:",
            error.response?.data || error.message
          );
        }
      }
    };

    fetchTopPapers();
  }, [selectedYear]);

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: "Tên bài nghiên cứu",
      dataIndex: "title_vn",
      key: "title_vn",
      width: 320,
      ellipsis: true,
      render: (text, record) => (
        <div
          className="cursor-pointer hover:text-blue-500"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/scientific-paper/${record._id}`);
          }}
          style={{
            maxWidth: "300px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={text}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Lượt xem",
      dataIndex: "viewCount",
      key: "viewCount",
      width: 95,
    },
    {
      title: "Lượt tải",
      dataIndex: "downloadCount",
      key: "downloadCount",
      width: 95,
    },
  ];

  // Add the row click handler for the entire table
  const onRowClick = (record) => {
    return {
      onClick: () => {
        navigate(`/scientific-paper/${record._id}`);
      },
      style: { cursor: "pointer" },
    };
  };

  const [selectedQuarters, setSelectedQuarters] = useState(["All"]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(["All"]);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [selectedFields, setSelectedFields] = useState(["All"]);
  const [showFieldFilter, setShowFieldFilter] = useState(false);
  const filterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const fieldFilterRef = useRef(null);
  const navigate = useNavigate();

  const [academicYears, setAcademicYears] = useState([]);

  // Fetch academic years
  const getAcademicYears = async () => {
    try {
      const response = await userApi.getAcademicYears();
      const years = response.academicYears || [];
      setAcademicYears(["Tất cả", ...years.reverse()]); // Reverse to ensure the latest year is first
      setSelectedYear("Tất cả"); // Default to "Tất cả"
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  useEffect(() => {
    getAcademicYears();
  }, []);

  const handleQuarterChange = (event) => {
    const value = event.target.value;

    if (value === "All") {
      // Nếu click vào "Tất cả"
      if (selectedQuarters.includes("All")) {
        // Nếu đang chọn "Tất cả" thì bỏ chọn tất cả
        setSelectedQuarters([]);
      } else {
        // Nếu chưa chọn "Tất cả" thì chọn tất cả
        setSelectedQuarters(["All", ...typeChartData.labels]);
      }
    } else {
      // Nếu click vào một mục cụ thể
      if (selectedQuarters.includes(value)) {
        // Nếu đã chọn thì bỏ chọn mục đó và bỏ chọn "Tất cả"
        const newSelected = selectedQuarters.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedQuarters(newSelected);
      } else {
        // Nếu chưa chọn thì thêm mục đó
        const newSelected = [
          ...selectedQuarters.filter((item) => item !== "All"),
          value,
        ];

        // Nếu đã chọn tất cả các mục khác thì thêm cả "Tất cả"
        if (newSelected.length === typeChartData.labels.length) {
          newSelected.push("All");
        }

        setSelectedQuarters(newSelected);
      }
    }
  };

  const handleRoleChange = (event) => {
    const value = event.target.value;

    if (value === "All") {
      // Nếu click vào "Tất cả"
      if (selectedRoles.includes("All")) {
        // Nếu đang chọn "Tất cả" thì bỏ chọn tất cả
        setSelectedRoles([]);
      } else {
        // Nếu chưa chọn "Tất cả" thì chọn tất cả
        setSelectedRoles(["All", ...departmentChartData.labels]);
      }
    } else {
      // Nếu click vào một mục cụ thể
      if (selectedRoles.includes(value)) {
        // Nếu đã chọn thì bỏ chọn mục đó và bỏ chọn "Tất cả"
        const newSelected = selectedRoles.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedRoles(newSelected);
      } else {
        // Nếu chưa chọn thì thêm mục đó
        const newSelected = [
          ...selectedRoles.filter((item) => item !== "All"),
          value,
        ];

        // Nếu đã chọn tất cả các mục khác thì thêm cả "Tất cả"
        if (newSelected.length === departmentChartData.labels.length) {
          newSelected.push("All");
        }

        setSelectedRoles(newSelected);
      }
    }
  };

  const handleFieldChange = (event) => {
    const value = event.target.value;

    if (value === "All") {
      // Nếu click vào "Tất cả"
      if (selectedFields.includes("All")) {
        // Nếu đang chọn "Tất cả" thì bỏ chọn tất cả
        setSelectedFields([]);
      } else {
        // Nếu chưa chọn "Tất cả" thì chọn tất cả
        setSelectedFields(["All", ...top5ByFieldChartData.labels]);
      }
    } else {
      // Nếu click vào một mục cụ thể
      if (selectedFields.includes(value)) {
        // Nếu đã chọn thì bỏ chọn mục đó và bỏ chọn "Tất cả"
        const newSelected = selectedFields.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedFields(newSelected);
      } else {
        // Nếu chưa chọn thì thêm mục đó
        const newSelected = [
          ...selectedFields.filter((item) => item !== "All"),
          value,
        ];

        // Nếu đã chọn tất cả các mục khác thì thêm cả "Tất cả"
        if (newSelected.length === top5ByFieldChartData.labels.length) {
          newSelected.push("All");
        }

        setSelectedFields(newSelected);
      }
    }
  };

  const handleClickOutside = (event) => {
    if (filterRef.current && !filterRef.current.contains(event.target)) {
      setShowFilter(false);
    }
    if (
      roleFilterRef.current &&
      !roleFilterRef.current.contains(event.target)
    ) {
      setShowRoleFilter(false);
    }
    if (
      fieldFilterRef.current &&
      !fieldFilterRef.current.contains(event.target)
    ) {
      setShowFieldFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredTypeChartData = {
    ...typeChartData,
    datasets: [
      {
        ...typeChartData.datasets[0],
        data: selectedQuarters.includes("All")
          ? typeChartData.datasets[0].data
          : typeChartData.datasets[0].data.map((value, index) =>
              selectedQuarters.includes(typeChartData.labels[index]) ? value : 0
            ),
      },
    ],
  };

  const filteredDepartmentChartData = {
    ...departmentChartData,
    datasets: [
      {
        ...departmentChartData.datasets[0],
        data: selectedRoles.includes("All")
          ? departmentChartData.datasets[0].data
          : departmentChartData.datasets[0].data.map((value, index) =>
              selectedRoles.includes(departmentChartData.labels[index])
                ? value
                : 0
            ),
      },
    ],
  };

  const filteredDonutChartData = {
    ...top5ByFieldChartData,
    datasets: [
      {
        ...top5ByFieldChartData.datasets[0],
        data: selectedFields.includes("All")
          ? top5ByFieldChartData.datasets[0].data
          : top5ByFieldChartData.datasets[0].data.map((value, index) =>
              selectedFields.includes(top5ByFieldChartData.labels[index])
                ? value
                : 0
            ),
      },
    ],
  };

  const getTypeChartTitle = () => {
    if (selectedQuarters.includes("All")) {
      return "Biểu đồ Thống kê theo loại";
    } else {
      const selected = selectedQuarters.join(", ");
      return `Biểu đồ Thống kê theo loại ${
        selected.length > 30 ? selected.substring(0, 30) + "..." : selected
      }`;
    }
  };

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
            <span className="cursor-pointer hover:text-blue-500">Thống kê</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Dạng biểu đồ
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 justify-center w-full">
              <div
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-gray-700 pt-4">
                  {stats.totalPapers}
                </div>
                <div className="text-gray-500 text-sm pb-4">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#00A3FF] pt-4">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#FFB700] pt-4">
                  {stats.totalDownloads.toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt tải</div>
              </div>
            </div>
            <div className="ml-4">
              <select
                className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[125px]"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  {getTypeChartTitle()}
                </h2>
                <div className="relative" ref={filterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showFilter && (
                    <div
                      className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "200px", right: "0" }}
                    >
                      <div className="px-4 py-3 w-full">
                        <label key="All" className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            value="All"
                            checked={selectedQuarters.includes("All")}
                            onChange={handleQuarterChange}
                            className="mr-2"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                          {typeChartData.labels.map((label) => (
                            <label
                              key={label}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                value={label}
                                checked={selectedQuarters.includes(label)}
                                onChange={handleQuarterChange}
                                className="mr-2"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={filteredTypeChartData}
                options={getChartOptions(filteredTypeChartData)}
                height={200}
                width={500}
              />
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Top 5 khoa có nhiều bài nghiên cứu
                </h2>
                <div className="relative" ref={roleFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowRoleFilter(!showRoleFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showRoleFilter && (
                    <div
                      className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "250px", right: "0" }}
                    >
                      <div className="px-4 py-3 w-full">
                        <label key="All" className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            value="All"
                            checked={selectedRoles.includes("All")}
                            onChange={handleRoleChange}
                            className="mr-2"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                          {departmentChartData.labels.map((label) => (
                            <label
                              key={label}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                value={label}
                                checked={selectedRoles.includes(label)}
                                onChange={handleRoleChange}
                                className="mr-2"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={filteredDepartmentChartData}
                options={getChartOptions(filteredDepartmentChartData)}
                height={200}
                width={540}
              />
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Top 5 lĩnh vực có nhiều bài nghiên cứu
                </h2>
                <div className="relative" ref={fieldFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowFieldFilter(!showFieldFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showFieldFilter && (
                    <div
                      className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "250px", right: "0" }}
                    >
                      <div className="px-4 py-3 w-full">
                        <label key="All" className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            value="All"
                            checked={selectedFields.includes("All")}
                            onChange={handleFieldChange}
                            className="mr-2"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                          {top5ByFieldChartData.labels.map((label) => (
                            <label
                              key={label}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                value={label}
                                checked={selectedFields.includes(label)}
                                onChange={handleFieldChange}
                                className="mr-2"
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-start items-center relative">
                <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
                <Doughnut
                  data={filteredDonutChartData}
                  options={donutOptions}
                  height={200}
                  width={500}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="font-semibold text-gray-700 mb-4">
                Top 5 bài nghiên cứu được xem nhiều nhất và tải nhiều nhất
              </h2>
              {topPapers.length > 0 ? (
                <Table
                  columns={columns}
                  dataSource={topPapers}
                  pagination={false}
                  rowKey="_id"
                  onRow={onRowClick}
                  size="small"
                />
              ) : (
                <div className="text-gray-500 text-center">
                  Không có dữ liệu để hiển thị.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
