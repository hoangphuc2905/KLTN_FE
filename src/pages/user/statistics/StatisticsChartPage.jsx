import Header from "../../../components/header";
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
import { Table, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";
import { useEffect, useState, useRef } from "react";
import CountUp from "react-countup";

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
  },
  cutout: "70%",
};

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
    dataIndex: "title",
    key: "title",
    ellipsis: true,
    render: (text, record) => (
      <div
        className="cursor-pointer hover:text-blue-500 transition-colors duration-200 font-medium"
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/scientific-paper/${record._id}`;
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
    width: 200,
  },
  {
    title: "Lượt xem",
    dataIndex: "views",
    key: "views",
    width: 95,
    render: (text) => <span className="text-blue-500 font-medium">{text}</span>,
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
  {
    title: "Điểm đóng góp",
    dataIndex: "contributions",
    key: "contributions",
    width: 135,
    render: (text) => (
      <span className="text-green-500 font-medium">{text}</span>
    ),
  },
];

const columnOptions = columns.map((col) => ({
  label: col.title,
  value: col.key,
}));

const StatisticsChartPage = () => {
  const navigate = useNavigate();
  const [selectedTypeFilters, setSelectedTypeFilters] = useState([]);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [typeCounts, setTypeCounts] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );
  const [showPointFilter, setShowPointFilter] = useState(false);
  const [selectedPointFilters, setSelectedPointFilters] = useState([]);
  const [pointChartData, setPointChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#00A3FF",
          "#7239EA",
          "#F1416C",
          "#39eaa3",
          "#FFB700",
        ],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });
  const pointFilterOptions = pointChartData.labels.map((label) => ({
    label,
    value: label,
  }));
  const [showDonutFilter, setShowDonutFilter] = useState(false);
  const [selectedDonutFilters, setSelectedDonutFilters] = useState([]);
  const donutFilterOptions = [];
  const userId = localStorage.getItem("user_id");
  const [totalPapers, setTotalPapers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [top5Papers, setTop5Papers] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [donutChartData, setDonutChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#ff0000",
          "#8241f1",
          "#705b10",
          "#39eaa3",
          "#c09624",
          "#8686d4",
          "#0cebd8",
          "#F1416C",
          "#FFC700",
          "#856666",
        ],
        borderWidth: 0,
      },
    ],
  });

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");

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

  // Add refs for click outside handling
  const typeFilterRef = useRef(null);
  const pointFilterRef = useRef(null);
  const donutFilterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId) {
          // Fetch total papers with selected academic year
          const papersResponse = await userApi.getTotalPapersByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Total Papers API Response:", papersResponse);
          setTotalPapers(papersResponse.total_papers);

          // Fetch total views
          const viewsResponse = await userApi.getTotalViewsByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Total Views API Response:", viewsResponse);
          setTotalViews(viewsResponse.total_views);

          // Fetch total downloads
          const downloadsResponse = await userApi.getTotalDownloadsByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Total Downloads API Response:", downloadsResponse);
          setTotalDownloads(downloadsResponse.total_downloads);

          // Fetch total points
          const pointsResponse = await userApi.getTotalPointByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Total Points API Response:", pointsResponse);
          setTotalPoints(pointsResponse.total_points);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, [userId, selectedYear]);

  useEffect(() => {
    const fetchTop5PapersForTable = async () => {
      try {
        if (userId) {
          const top5Response = await userApi.getTop5PapersByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Top 5 Papers for Table API Response:", top5Response);

          if (
            top5Response &&
            top5Response.papers &&
            top5Response.papers.length > 0
          ) {
            const formattedPapers = top5Response.papers.map((paper, index) => ({
              id: index + 1,
              _id: paper._id,
              title: paper.title_vn || paper.title_en,
              views: paper.viewCount,
              downloads: paper.downloadCount,
              contributions: paper.contributionScore,
            }));
            setTop5Papers(formattedPapers);
          } else {
            console.warn("No papers found for the table.");
            setTop5Papers([]);
          }
        } else {
          setTop5Papers([]);
        }
      } catch (error) {
        console.error(
          "Error fetching top 5 papers for table:",
          error.message || error
        );
        setTop5Papers([]);
      }
    };

    const fetchTop5PapersForChart = async () => {
      try {
        if (userId) {
          const pointsResponse = await userApi.getTop5PapersByPointByUser(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Top 5 Papers by Points API Response:", pointsResponse);

          if (
            pointsResponse &&
            pointsResponse.papers &&
            pointsResponse.papers.length > 0
          ) {
            const formattedChartData = pointsResponse.papers.map((paper) => ({
              title: paper.title_vn || paper.title_en,
              contributionScore: paper.contributionScore,
            }));
            setPointChartData({
              labels: formattedChartData.map((paper) =>
                paper.title.length > 20
                  ? paper.title.substring(0, 20) + "..."
                  : paper.title
              ),
              datasets: [
                {
                  data: formattedChartData.map(
                    (paper) => paper.contributionScore
                  ),
                  backgroundColor: [
                    "#00A3FF",
                    "#7239EA",
                    "#F1416C",
                    "#39eaa3",
                    "#FFB700",
                  ],
                  borderWidth: 0,
                  borderRadius: 6,
                },
              ],
            });
            setSelectedPointFilters(
              formattedChartData.map((paper) =>
                paper.title.length > 20
                  ? paper.title.substring(0, 20) + "..."
                  : paper.title
              )
            );
          } else {
            console.warn("No papers found for the chart.");
            setPointChartData({
              labels: ["No data"],
              datasets: [
                {
                  data: [0],
                  backgroundColor: ["#E0E0E0"],
                },
              ],
            });
          }
        } else {
          setPointChartData({
            labels: ["No data"],
            datasets: [
              {
                data: [0],
                backgroundColor: ["#E0E0E0"],
              },
            ],
          });
        }
      } catch (error) {
        console.error(
          "Error fetching top 5 papers by points:",
          error.message || error
        );
        setPointChartData({
          labels: ["No data"],
          datasets: [
            {
              data: [0],
              backgroundColor: ["#E0E0E0"],
            },
          ],
        });
      }
    };

    const fetchTop5PaperTypes = async () => {
      try {
        if (userId) {
          const response = await userApi.getTop5PaperTypesByUser(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Top 5 Paper Types API Response:", response);

          if (response && response.data && response.data.length > 0) {
            const formattedData = response.data.map((item) => ({
              type:
                item.type.length > 20
                  ? item.type.substring(0, 20) + "..."
                  : item.type,
              count: item.count,
            }));

            setDonutChartData({
              labels: formattedData.map((item) => item.type),
              datasets: [
                {
                  data: formattedData.map((item) => item.count),
                  backgroundColor: [
                    "#ff0000",
                    "#8241f1",
                    "#705b10",
                    "#39eaa3",
                    "#c09624",
                    "#8686d4",
                    "#0cebd8",
                    "#F1416C",
                    "#FFC700",
                    "#856666",
                  ],
                  borderWidth: 0,
                },
              ],
            });
          } else {
            console.warn("No paper types found for this user.");
            setDonutChartData({
              labels: ["No data"],
              datasets: [
                {
                  data: [0],
                  backgroundColor: ["#E0E0E0"],
                },
              ],
            });
          }
        } else {
          setDonutChartData({
            labels: ["No data"],
            datasets: [
              {
                data: [0],
                backgroundColor: ["#E0E0E0"],
              },
            ],
          });
        }
      } catch (error) {
        console.error(
          "Error fetching top 5 paper types:",
          error.message || error
        );
        setDonutChartData({
          labels: ["No data"],
          datasets: [
            {
              data: [0],
              backgroundColor: ["#E0E0E0"],
            },
          ],
        });
      }
    };

    fetchTop5PapersForTable();
    fetchTop5PapersForChart();
    fetchTop5PaperTypes();
  }, [userId, selectedYear]);

  useEffect(() => {
    const fetchTypeStatistics = async () => {
      try {
        const response = await userApi.getPaperGroupsByUser(
          userId,
          selectedYear === "Tất cả" ? null : selectedYear
        );
        console.log("Type Statistics API Response:", response);
        if (response && response.data) {
          setTypeCounts(response.data);
          setSelectedTypeFilters(Object.keys(response.data));
        }
      } catch (error) {
        console.error("Error fetching type statistics:", error);
      }
    };

    fetchTypeStatistics();
  }, [userId, selectedYear]);

  // Add click outside handler to close filter dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        typeFilterRef.current &&
        !typeFilterRef.current.contains(event.target)
      ) {
        setShowTypeFilter(false);
      }
      if (
        pointFilterRef.current &&
        !pointFilterRef.current.contains(event.target)
      ) {
        setShowPointFilter(false);
      }
      if (
        donutFilterRef.current &&
        !donutFilterRef.current.contains(event.target)
      ) {
        setShowDonutFilter(false);
      }
      // Removing the column filter reference
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeFilterChange = (selectedFilters) => {
    setSelectedTypeFilters(selectedFilters);

    // Update the chart data based on the selected type filters
    const filteredLabels = Object.keys(typeCounts).filter((type) =>
      selectedFilters.includes(type)
    );
    const filteredData = filteredLabels.map((label) => typeCounts[label]);

    setPointChartData({
      labels: filteredLabels,
      datasets: [
        {
          data: filteredData,
          backgroundColor: [
            "#00A3FF",
            "#7239EA",
            "#F1416C",
            "#39eaa3",
            "#FFB700",
          ],
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    });
  };

  const handlePointFilterChange = (selectedFilters) => {
    setSelectedPointFilters(selectedFilters);

    // Update the type and donut chart filters based on the selected point filters
    const filteredTypes = [];
    setSelectedTypeFilters([...new Set(filteredTypes)]);

    const filteredDepartments = [];
    setSelectedDonutFilters([...new Set(filteredDepartments)]);
  };

  const handleDonutFilterChange = (selectedFilters) => {
    setSelectedDonutFilters(selectedFilters);

    // Update the type and point chart filters based on the selected donut filters
    const filteredTypes = [];
    setSelectedTypeFilters([...new Set(filteredTypes)]);

    const filteredLabels = [];
    setSelectedPointFilters(filteredLabels);
  };

  const handleColumnVisibilityChange = (selectedKeys) => {
    setVisibleColumns(selectedKeys);
  };

  // Add onRow click handler for the table
  const onRowClick = (record) => {
    return {
      onClick: () => {
        if (record._id) {
          navigate(`/scientific-paper/${record._id}`);
        } else {
          console.error("Paper ID not found in record:", record);
        }
      },
      style: { cursor: "pointer" },
      className: "hover:bg-blue-50 transition-colors duration-200",
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
            <span className="font-semibold text-sm text-sky-900">Thống kê</span>
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
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-gray-700 pt-4">
                  <CountUp end={totalPapers} duration={2} />
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#b0fccd] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-gray-700 pt-4">
                  <CountUp end={totalPoints} duration={2} decimals={1} />
                </div>
                <div className="text-gray-500 pb-4 text-sm">
                  Tổng điểm đóng góp
                </div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#00A3FF] pt-4">
                  <CountUp end={totalViews} duration={2} />
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#FFB700] pt-4">
                  <CountUp end={totalDownloads} duration={2} />
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt tải</div>
              </div>
            </div>
            <div className="ml-4">
              <select
                className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[110px] cursor-pointer hover:bg-[#008AE0] transition-colors"
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
                <div className="relative" ref={typeFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowTypeFilter(!showTypeFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showTypeFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "220px" }}
                    >
                      <div className="px-4 py-3 w-full">
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedTypeFilters.length ===
                              Object.keys(typeCounts).length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTypeFilters(Object.keys(typeCounts));
                              } else {
                                setSelectedTypeFilters([]);
                              }
                            }}
                            className="mr-2"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                          {Object.keys(typeCounts).map((type) => (
                            <label
                              key={type}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTypeFilters.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTypeFilters([
                                      ...selectedTypeFilters,
                                      type,
                                    ]);
                                  } else {
                                    setSelectedTypeFilters(
                                      selectedTypeFilters.filter(
                                        (t) => t !== type
                                      )
                                    );
                                  }
                                }}
                                className="mr-2"
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={{
                  labels: Object.keys(typeCounts).filter((type) =>
                    selectedTypeFilters.includes(type)
                  ),
                  datasets: [
                    {
                      data: Object.values(typeCounts).filter((_, index) =>
                        selectedTypeFilters.includes(
                          Object.keys(typeCounts)[index]
                        )
                      ),
                      backgroundColor: [
                        "#00A3FF",
                        "#7239EA",
                        "#F1416C",
                        "#7239EA",
                        "#FF0000",
                      ],
                      borderWidth: 0,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={getChartOptions({
                  datasets: [
                    {
                      data: Object.values(typeCounts).filter((_, index) =>
                        selectedTypeFilters.includes(
                          Object.keys(typeCounts)[index]
                        )
                      ),
                    },
                  ],
                })}
                height={200}
                width={500}
              />
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Top 5 bài có điểm đóng góp cao nhất
                </h2>
                <div className="relative" ref={pointFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowPointFilter(!showPointFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showPointFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "220px" }}
                    >
                      <div className="px-4 py-3 w-full">
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedPointFilters.length ===
                              pointFilterOptions.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPointFilters(
                                  pointFilterOptions.map((opt) => opt.value)
                                );
                              } else {
                                setSelectedPointFilters([]);
                              }
                            }}
                            className="mr-2"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                          {pointFilterOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPointFilters.includes(
                                  option.value
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPointFilters([
                                      ...selectedPointFilters,
                                      option.value,
                                    ]);
                                  } else {
                                    setSelectedPointFilters(
                                      selectedPointFilters.filter(
                                        (t) => t !== option.value
                                      )
                                    );
                                  }
                                }}
                                className="mr-2"
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={{
                  labels: pointChartData.labels.filter((label, index) =>
                    selectedPointFilters.includes(label)
                  ),
                  datasets: [
                    {
                      data: pointChartData.labels
                        .filter((label, index) =>
                          selectedPointFilters.includes(label)
                        )
                        .map((label) => {
                          const index = pointChartData.labels.indexOf(label);
                          return pointChartData.datasets[0].data[index];
                        }),
                      backgroundColor:
                        pointChartData.datasets[0].backgroundColor,
                      borderWidth: 0,
                      borderRadius: 6,
                    },
                  ],
                }}
                options={getChartOptions({
                  datasets: [
                    {
                      data: pointChartData.labels
                        .filter((label, index) =>
                          selectedPointFilters.includes(label)
                        )
                        .map((label) => {
                          const index = pointChartData.labels.indexOf(label);
                          return pointChartData.datasets[0].data[index];
                        }),
                    },
                  ],
                })}
                height={200}
                width={540}
              />
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ Thống kê top 5 bài báo theo lĩnh vực nghiên cứu
                </h2>
                <div className="relative" ref={donutFilterRef}>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                    onClick={() => setShowDonutFilter(!showDonutFilter)}
                  >
                    <span className="text-xs">Bộ lọc</span>
                  </button>
                  {showDonutFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "220px" }}
                    >
                      <div className="px-4 py-3 w-full">
                        <label className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedDonutFilters.length ===
                              donutFilterOptions.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDonutFilters(
                                  donutFilterOptions.map((opt) => opt.value)
                                );
                              } else {
                                setSelectedDonutFilters([]);
                              }
                            }}
                            className="mr-2"
                          />
                          Tất cả
                        </label>
                        <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                          {donutFilterOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedDonutFilters.includes(
                                  option.value
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDonutFilters([
                                      ...selectedDonutFilters,
                                      option.value,
                                    ]);
                                  } else {
                                    setSelectedDonutFilters(
                                      selectedDonutFilters.filter(
                                        (t) => t !== option.value
                                      )
                                    );
                                  }
                                }}
                                className="mr-2"
                              />
                              {option.label}
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
                  data={donutChartData}
                  options={donutOptions}
                  height={200}
                  width={500}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">
                  Top 5 bài báo nổi bật
                </h2>
              </div>
              <Table
                columns={columns.filter((col) =>
                  visibleColumns.includes(col.key)
                )}
                dataSource={top5Papers}
                pagination={false}
                rowKey="id"
                onRow={onRowClick}
                className="papers-table"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChartPage;
