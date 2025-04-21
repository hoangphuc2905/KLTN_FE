import React, { useState, useRef, useEffect } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CountUp from "react-countup";
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

// Register ChartJS components
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
  // Tìm giá trị cao nhất trong dữ liệu
  const maxValue =
    data && data.datasets && data.datasets[0] && data.datasets[0].data
      ? Math.max(
          ...data.datasets[0].data.filter((val) => !isNaN(val) && val !== 0)
        )
      : 0;

  // Làm tròn lên chục gần nhất
  const roundedMax = Math.ceil(maxValue / 10) * 10;

  // Tính toán bước (step) phù hợp dựa trên khoảng giá trị
  const step = roundedMax > 100 ? 20 : roundedMax > 50 ? 10 : 5;

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

const donutOptions = {
  responsive: false,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      align: "center",
      labels: {
        usePointStyle: true,
        padding: 20,
        boxWidth: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          const label = tooltipItem.label || "";
          const value = tooltipItem.raw || 0;
          return `${label}: ${value}`;
        },
      },
    },
    datalabels: {
      color: "#000",
      font: {
        size: 12,
        weight: "bold",
      },
      formatter: (value) => value, // Display the number of articles
    },
  },
  cutout: 0, // Remove the cutout effect to make it a full pie chart
};

const ManagementDepartmentChart = () => {
  const [selectedQuarters, setSelectedQuarters] = useState(["All"]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFields, setSelectedFields] = useState(["All"]);
  const [showFieldFilter, setShowFieldFilter] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState(["All"]);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalViews: 0,
    totalDownloads: 0,
  });
  const [topPapers, setTopPapers] = useState([]);
  const [typeChartData, setTypeChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#00A3FF",
          "#7239EA",
          "#F1416C",
          "#FF0000",
          "#FFC700",
        ],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });
  const [topContributorsChartData, setTopContributorsChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#00A3FF",
          "#7239EA",
          "#F1416C",
          "#FF0000",
          "#FFC700",
        ],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
    originalLabels: [],
  });
  const [topResearchFieldsChartData, setTopResearchFieldsChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#00A3FF",
          "#7239EA",
          "#F1416C",
          "#FF0000",
          "#FFC700",
        ],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });
  const [originalResearchFieldsData, setOriginalResearchFieldsData] = useState({
    labels: [],
    data: [],
  });
  const [originalContributorsData, setOriginalContributorsData] = useState({
    labels: [],
    data: [],
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");
  const filterRef = useRef(null);
  const fieldFilterRef = useRef(null);
  const authorFilterRef = useRef(null);
  const navigate = useNavigate();
  const departmentId = localStorage.getItem("department");

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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await userApi.getStatisticsByDepartmentId(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear // Pass null if "Tất cả" is selected
        );

        const updatedStats = {
          totalPapers: data.total_papers ?? 0,
          totalViews: data.total_views ?? 0,
          totalDownloads: data.total_downloads ?? 0,
        };
        console.log("✅ Setting stats:", updatedStats);
        setStats(updatedStats);
      } catch (error) {
        console.error("❌ Failed to fetch statistics:", error);
      }
    };

    if (departmentId) {
      fetchStatistics();
    }
  }, [departmentId, selectedYear]); // Add selectedYear as a dependency

  useEffect(() => {
    const fetchTopPapers = async () => {
      try {
        const response =
          await userApi.getTop5MostViewedAndDownloadedPapersByDepartment(
            departmentId,
            selectedYear === "Tất cả" ? null : selectedYear // Pass null if "Tất cả" is selected
          );

        if (response && response.papers && response.papers.length > 0) {
          const formattedPapers = response.papers.map((paper, index) => ({
            id: index + 1,
            _id: paper._id, // Add the _id property for navigation
            title: paper.title_vn,
            views: paper.viewCount,
            downloads: paper.downloadCount,
          }));
          setTopPapers(formattedPapers);
        } else {
          console.warn("No scientific papers found for this department");
          setTopPapers([]); // Set an empty array if no data is returned
        }
      } catch (error) {
        console.error("Failed to fetch top papers:", error);
        setTopPapers([]); // Set an empty array in case of an error
      }
    };

    if (departmentId) {
      fetchTopPapers();
    }
  }, [departmentId, selectedYear]); // Add selectedYear as a dependency

  useEffect(() => {
    const fetchTypeStatistics = async () => {
      try {
        const response = await userApi.getStatisticsByGroupByDepartment(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear // Pass null if "Tất cả" is selected
        );

        if (
          response &&
          response.data &&
          Object.keys(response.data).length > 0
        ) {
          const labels = Object.keys(response.data); // Use labels directly from the database response
          const mappedData = {
            labels,
            datasets: [
              {
                data: Object.values(response.data),
                backgroundColor: [
                  "#00A3FF",
                  "#7239EA",
                  "#F1416C",
                  "#FF0000",
                  "#FFC700",
                ],
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
          };
          setTypeChartData(mappedData);
        } else {
          console.warn("No data found for type statistics");
          setTypeChartData({
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
        }
      } catch (error) {
        console.error("❌ Failed to fetch type statistics:", error);
        setTypeChartData({
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
      }
    };

    if (departmentId) {
      fetchTypeStatistics();
    }
  }, [departmentId, selectedYear]); // Add selectedYear as a dependency

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const response = await userApi.getTop5AuthorsByDepartment(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear // Pass null if "Tất cả" is selected
        );

        if (response && response.data && response.data.length > 0) {
          const labels = response.data.map((author) => author.authorName);
          const data = response.data.map((author) => author.totalPoints);

          // Format author names to add ellipsis if too long
          const formattedLabels = labels.map((label) =>
            label.length > 10 ? label.substring(0, 10) + "..." : label
          );

          setOriginalContributorsData({
            labels,
            data,
          });

          setTopContributorsChartData({
            labels: formattedLabels,
            datasets: [
              {
                data,
                backgroundColor: [
                  "#00A3FF",
                  "#7239EA",
                  "#F1416C",
                  "#FF0000",
                  "#FFC700",
                ],
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
            // Store original labels for filters and tooltips
            originalLabels: labels,
          });
        } else {
          console.warn("No data found for top contributors");
          setOriginalContributorsData({ labels: [], data: [] });
          setTopContributorsChartData({
            labels: [],
            datasets: [
              {
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
            originalLabels: [],
          });
        }
      } catch (error) {
        console.error("❌ Failed to fetch top contributors:", error);
        setOriginalContributorsData({ labels: [], data: [] });
        setTopContributorsChartData({
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderWidth: 0,
              borderRadius: 6,
            },
          ],
          originalLabels: [],
        });
      }
    };

    if (departmentId) {
      fetchTopContributors();
    }
  }, [departmentId, selectedYear]); // Add selectedYear as a dependency

  useEffect(() => {
    const fetchTopResearchFields = async () => {
      try {
        const response = await userApi.getStatisticsTop5ByTypeByDepartment(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear // Pass null if "Tất cả" is selected
        );

        if (
          response &&
          response.data &&
          Object.keys(response.data).length > 0
        ) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);

          setOriginalResearchFieldsData({
            labels,
            data,
          });

          setTopResearchFieldsChartData({
            labels,
            datasets: [
              {
                data,
                backgroundColor: [
                  "#00A3FF",
                  "#7239EA",
                  "#F1416C",
                  "#FF0000",
                  "#FFC700",
                ],
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
          });
        } else {
          console.warn("No data found for top research fields");
          setOriginalResearchFieldsData({ labels: [], data: [] });
          setTopResearchFieldsChartData({
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
        }
      } catch (error) {
        console.error("❌ Failed to fetch top research fields:", error);
        setOriginalResearchFieldsData({ labels: [], data: [] });
        setTopResearchFieldsChartData({
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
      }
    };

    if (departmentId) {
      fetchTopResearchFields();
    }
  }, [departmentId, selectedYear]); // Add selectedYear as a dependency

  // Update research fields chart when filters change
  useEffect(() => {
    if (originalResearchFieldsData.labels.length > 0) {
      const filteredLabels = [];
      const filteredData = [];

      originalResearchFieldsData.labels.forEach((label, index) => {
        if (selectedFields.includes("All") || selectedFields.includes(label)) {
          filteredLabels.push(label);
          filteredData.push(originalResearchFieldsData.data[index]);
        }
      });

      setTopResearchFieldsChartData({
        labels: filteredLabels,
        datasets: [
          {
            data: filteredData,
            backgroundColor: [
              "#00A3FF",
              "#7239EA",
              "#F1416C",
              "#FF0000",
              "#FFC700",
            ],
            borderWidth: 0,
            borderRadius: 6,
          },
        ],
      });
    }
  }, [selectedFields, originalResearchFieldsData]);

  // Update contributors chart when filters change
  useEffect(() => {
    if (originalContributorsData.labels.length > 0) {
      const filteredLabels = [];
      const filteredData = [];

      originalContributorsData.labels.forEach((label, index) => {
        if (
          selectedAuthors.includes("All") ||
          selectedAuthors.includes(label)
        ) {
          filteredLabels.push(label);
          filteredData.push(originalContributorsData.data[index]);
        }
      });

      setTopContributorsChartData({
        labels: filteredLabels,
        datasets: [
          {
            data: filteredData,
            backgroundColor: [
              "#00A3FF",
              "#7239EA",
              "#F1416C",
              "#FF0000",
              "#FFC700",
            ],
            borderWidth: 0,
            borderRadius: 6,
          },
        ],
        originalLabels: originalContributorsData.labels,
      });
    }
  }, [selectedAuthors, originalContributorsData]);

  const handleQuarterChange = (event) => {
    const value = event.target.value;
    setSelectedQuarters((prevSelected) => {
      if (value === "All") {
        return prevSelected.includes("All")
          ? []
          : ["All", ...typeChartData.labels];
      }
      const updatedSelection = prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value];
      return updatedSelection.length === typeChartData.labels.length
        ? ["All", ...typeChartData.labels]
        : updatedSelection.filter((item) => item !== "All");
    });
  };

  const handleFieldChange = (event) => {
    const value = event.target.value;
    setSelectedFields((prevSelected) => {
      if (value === "All") {
        return prevSelected.includes("All")
          ? []
          : ["All", ...originalResearchFieldsData.labels];
      }

      let updatedSelection;
      if (prevSelected.includes(value)) {
        updatedSelection = prevSelected.filter((item) => item !== value);
      } else {
        updatedSelection = [...prevSelected, value];
      }

      if (
        updatedSelection.length === originalResearchFieldsData.labels.length
      ) {
        return ["All", ...originalResearchFieldsData.labels];
      } else {
        return updatedSelection.filter((item) => item !== "All");
      }
    });
  };

  const handleAuthorChange = (event) => {
    const value = event.target.value;
    setSelectedAuthors((prevSelected) => {
      if (value === "All") {
        return prevSelected.includes("All")
          ? []
          : ["All", ...originalContributorsData.labels];
      }

      let updatedSelection;
      if (prevSelected.includes(value)) {
        updatedSelection = prevSelected.filter((item) => item !== value);
      } else {
        updatedSelection = [...prevSelected, value];
      }

      if (updatedSelection.length === originalContributorsData.labels.length) {
        return ["All", ...originalContributorsData.labels];
      } else {
        return updatedSelection.filter((item) => item !== "All");
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
      if (
        fieldFilterRef.current &&
        !fieldFilterRef.current.contains(event.target)
      ) {
        setShowFieldFilter(false);
      }
      if (
        authorFilterRef.current &&
        !authorFilterRef.current.contains(event.target)
      ) {
        setShowAuthorFilter(false);
      }
    };

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
        data: typeChartData.labels.map((label, index) =>
          selectedQuarters.includes("All") || selectedQuarters.includes(label)
            ? typeChartData.datasets[0].data[index]
            : 0
        ),
      },
    ],
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (text) => (
        <span className="font-medium text-gray-600">{text}</span>
      ),
    },
    {
      title: "Tên bài nghiên cứu",
      dataIndex: "title",
      key: "title",
      width: 320,
      ellipsis: true,
      render: (text, record) => (
        <div
          className="cursor-pointer hover:text-blue-500 transition-colors duration-200 font-medium"
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
      dataIndex: "views",
      key: "views",
      width: 95,
      render: (text) => (
        <span className="text-blue-500 font-medium">{text}</span>
      ),
    },
    {
      title: "Lượt tải",
      dataIndex: "downloads",
      key: "downloads",
      width: 95,
      render: (text) => (
        <span className="text-amber-500 font-medium">{text}</span>
      ),
    },
  ];

  // Add the row click handler for the entire table
  const onRowClick = (record) => {
    return {
      onClick: () => {
        navigate(`/scientific-paper/${record._id}`);
      },
      style: { cursor: "pointer" },
      className: "hover:bg-blue-50 transition-colors duration-200",
    };
  };

  // Check if there's any data to display in the charts
  const hasTypeChartData =
    selectedQuarters.length > 0 &&
    filteredTypeChartData.datasets[0].data.some((value) => value > 0);

  const hasContributorsChartData =
    selectedAuthors.length > 0 &&
    topContributorsChartData.datasets[0].data.some((value) => value > 0);

  const hasFieldsChartData =
    selectedFields.length > 0 &&
    topResearchFieldsChartData.datasets[0].data.some((value) => value > 0);

  const hasTopPapersData = topPapers.length > 0;

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
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-gray-700 pt-4">
                  <CountUp end={stats.totalPapers ?? 0} duration={2} />
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#00A3FF] pt-4">
                  <CountUp
                    end={stats.totalViews ?? 0}
                    duration={2}
                    separator=","
                  />
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#FFB700] pt-4">
                  <CountUp
                    end={stats.totalDownloads ?? 0}
                    duration={2}
                    separator=","
                  />
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt tải</div>
              </div>
            </div>
            <div className="ml-4">
              <select
                className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[110px]"
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
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ Thống kê theo loại
                </h2>
                <div className="relative" ref={filterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition-colors"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "200px", right: "0" }}
                    >
                      <div className="px-4 py-3 w-full max-w-[400px]">
                        <label className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            value="All"
                            checked={selectedQuarters.includes("All")}
                            onChange={handleQuarterChange}
                            className="mr-2 accent-blue-500"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto">
                          {typeChartData.labels.map((quarter) => (
                            <label
                              key={quarter}
                              className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={quarter}
                                checked={
                                  selectedQuarters.includes(quarter) ||
                                  selectedQuarters.includes("All")
                                }
                                onChange={handleQuarterChange}
                                className="mr-2 accent-blue-500"
                              />
                              {quarter}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {hasTypeChartData ? (
                <Bar
                  data={filteredTypeChartData}
                  options={{
                    ...getChartOptions(filteredTypeChartData),
                    plugins: {
                      ...getChartOptions(filteredTypeChartData).plugins,
                      datalabels: false, // Disable data labels
                    },
                  }}
                  height={200}
                  width={500}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Không có dữ liệu để hiển thị
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Top 5 tác giả có điểm đóng góp
                </h2>
                <div className="relative" ref={authorFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition-colors"
                    onClick={() => setShowAuthorFilter(!showAuthorFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showAuthorFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "250px" }}
                    >
                      <div className="px-4 py-3 w-full max-w-[250px]">
                        <label className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            value="All"
                            checked={selectedAuthors.includes("All")}
                            onChange={handleAuthorChange}
                            className="mr-2 accent-blue-500"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[200px] overflow-y-auto">
                          {originalContributorsData.labels.map((author) => (
                            <label
                              key={author}
                              className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={author}
                                checked={
                                  selectedAuthors.includes(author) ||
                                  selectedAuthors.includes("All")
                                }
                                onChange={handleAuthorChange}
                                className="mr-2 accent-blue-500"
                              />
                              <span
                                className="text-sm"
                                title={author.length > 15 ? author : ""}
                              >
                                {author.length > 15
                                  ? author.substring(0, 15) + "..."
                                  : author}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {hasContributorsChartData ? (
                <Bar
                  data={topContributorsChartData}
                  options={{
                    ...getChartOptions(topContributorsChartData),
                    plugins: {
                      ...getChartOptions(topContributorsChartData).plugins,
                      datalabels: false, // Disable data labels
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max:
                          Math.ceil(
                            Math.max(
                              ...topContributorsChartData.datasets[0].data
                            ) / 10
                          ) * 10,
                        ticks: {
                          stepSize:
                            Math.ceil(
                              Math.max(
                                ...topContributorsChartData.datasets[0].data
                              ) / 50
                            ) * 5,
                        },
                      },
                      x: {
                        ticks: {
                          callback: function (value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 10
                              ? label.substring(0, 10) + "..."
                              : label;
                          },
                        },
                      },
                    },
                  }}
                  height={200}
                  width={540}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Không có dữ liệu để hiển thị
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Top 5 lĩnh vực có nhiều bài nghiên cứu
                </h2>
                <div className="relative" ref={fieldFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs hover:bg-gray-50 transition-colors"
                    onClick={() => setShowFieldFilter(!showFieldFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showFieldFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "250px" }}
                    >
                      <div className="px-4 py-3 w-full max-w-[250px]">
                        <label className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            value="All"
                            checked={selectedFields.includes("All")}
                            onChange={handleFieldChange}
                            className="mr-2 accent-blue-500"
                          />
                          All
                        </label>
                        <div className="max-h-[200px] overflow-y-auto">
                          {originalResearchFieldsData.labels.map((field) => (
                            <label
                              key={field}
                              className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={field}
                                checked={
                                  selectedFields.includes(field) ||
                                  selectedFields.includes("All")
                                }
                                onChange={handleFieldChange}
                                className="mr-2 accent-blue-500"
                              />
                              <span className="text-sm">{field}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {hasFieldsChartData ? (
                <div className="flex justify-start items-center relative">
                  <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
                  <Doughnut
                    data={topResearchFieldsChartData}
                    options={donutOptions}
                    height={200}
                    width={500}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Không có dữ liệu để hiển thị
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-semibold text-gray-700 mb-4">
                Top 5 bài nghiên cứu được nổi bật
              </h2>
              {hasTopPapersData ? (
                <Table
                  columns={columns}
                  dataSource={topPapers}
                  pagination={false}
                  rowKey="id"
                  onRow={onRowClick}
                  className="papers-table"
                  rowClassName="cursor-pointer"
                  size="small"
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                  Không có dữ liệu để hiển thị
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

export default ManagementDepartmentChart;
