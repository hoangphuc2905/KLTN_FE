import React, { useState, useRef, useEffect } from "react";
import Header from "../../../components/header";
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

const chartOptions = {
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
      max: 100,
      ticks: {
        stepSize: 20,
      },
    },
  },
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
  },
  cutout: "70%",
};

const ManagementDepartmentChart = () => {
  const [selectedQuarters, setSelectedQuarters] = useState(["All"]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFields, setSelectedFields] = useState(["All"]);
  const [showFieldFilter, setShowFieldFilter] = useState(false);
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
  const filterRef = useRef(null);
  const fieldFilterRef = useRef(null);
  const navigate = useNavigate();
  const departmentId = localStorage.getItem("department");

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await userApi.getStatisticsByDepartmentId(departmentId);

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
  }, [departmentId]);

  useEffect(() => {
    const fetchTopPapers = async () => {
      try {
        const response =
          await userApi.getTop5MostViewedAndDownloadedPapersByDepartment(
            departmentId
          );
        if (response && response.papers) {
          const formattedPapers = response.papers.map((paper, index) => ({
            id: index + 1,
            _id: paper._id, // Add the _id property for navigation
            title: paper.title_vn,
            views: paper.viewCount,
            downloads: paper.downloadCount,
          }));
          setTopPapers(formattedPapers);
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch top papers:", error);
      }
    };

    if (departmentId) {
      fetchTopPapers();
    }
  }, [departmentId]);

  useEffect(() => {
    const fetchTypeStatistics = async () => {
      try {
        const response = await userApi.getStatisticsByGroupByDepartment(
          departmentId
        );
        if (response && response.data) {
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
        }
      } catch (error) {
        console.error("❌ Failed to fetch type statistics:", error);
      }
    };

    if (departmentId) {
      fetchTypeStatistics();
    }
  }, [departmentId]);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const response = await userApi.getTop5AuthorsByDepartment(departmentId);
        if (response && response.data) {
          const labels = response.data.map((author) => author.authorName);
          const data = response.data.map((author) => author.totalPoints);

          setTopContributorsChartData({
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
        }
      } catch (error) {
        console.error("❌ Failed to fetch top contributors:", error);
      }
    };

    if (departmentId) {
      fetchTopContributors();
    }
  }, [departmentId]);

  useEffect(() => {
    const fetchTopResearchFields = async () => {
      try {
        const response = await userApi.getStatisticsTop5ByTypeByDepartment(
          departmentId
        );
        if (response && response.data) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);

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
        }
      } catch (error) {
        console.error("❌ Failed to fetch top research fields:", error);
      }
    };

    if (departmentId) {
      fetchTopResearchFields();
    }
  }, [departmentId]);

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
        return prevSelected.includes("All") ? [] : ["All"];
      }
      const updatedSelection = prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value];
      return updatedSelection.filter((item) => item !== "All");
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
    },
    {
      title: "Tên bài nghiên cứu",
      dataIndex: "title",
      key: "title",
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
      dataIndex: "views",
      key: "views",
      width: 95,
    },
    {
      title: "Lượt tải",
      dataIndex: "downloads",
      key: "downloads",
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
                  {stats.totalPapers ?? 0}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#00A3FF] pt-4">
                  {(stats.totalViews ?? 0).toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#FFB700] pt-4">
                  {(stats.totalDownloads ?? 0).toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt tải</div>
              </div>
            </div>
            <div className="ml-4">
              <select className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[125px]">
                <option value="2024">2024-2025</option>
                <option value="2023">2023-2024</option>
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
                  Biểu đồ Thống kê theo loại
                </h2>
                <div className="relative" ref={filterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowFilter(!showFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showFilter && (
                    <div className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-5 w-full max-w-[400px]">
                        {["All", ...typeChartData.labels].map((quarter) => (
                          <label key={quarter} className="flex items-center">
                            <input
                              type="checkbox"
                              value={quarter}
                              checked={selectedQuarters.includes(quarter)}
                              onChange={handleQuarterChange}
                              className="mr-2"
                            />
                            {quarter}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={filteredTypeChartData}
                options={chartOptions}
                height={200}
                width={500}
              />
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ top 5 tác giả có điểm đóng góp cao nhất
                </h2>
              </div>
              <Bar
                data={topContributorsChartData}
                options={{
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
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
                height={200}
                width={540}
              />
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ Thống kê top 5 bài nghiên cứu theo lĩnh vực nghiên cứu
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
                      style={{ width: "200px" }}
                    >
                      <div className="px-4 py-5 w-full max-w-[200px]">
                        {["All", ...topResearchFieldsChartData.labels].map(
                          (field) => (
                            <label
                              key={field}
                              className="flex items-center mb-2 flex-wrap"
                            >
                              <input
                                type="checkbox"
                                value={field}
                                checked={selectedFields.includes(field)}
                                onChange={handleFieldChange}
                                className="mr-2"
                              />
                              {field}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-start items-center relative">
                <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
                <Doughnut
                  data={topResearchFieldsChartData}
                  options={donutOptions}
                  height={200}
                  width={500}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="font-semibold text-gray-700 mb-4">
                Top 5 bài nghiên cứu được nổi bật
              </h2>
              <Table
                columns={columns}
                dataSource={topPapers}
                pagination={false}
                rowKey="id"
                onRow={onRowClick} // Add the row click handler
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManagementDepartmentChart;
