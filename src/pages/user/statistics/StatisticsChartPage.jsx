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
    width: 60,
  },
  {
    title: "Tên bài nghiên cứu",
    dataIndex: "title",
    key: "title",
    ellipsis: true,
    render: (text, record) => (
      <div
        className="cursor-pointer hover:text-blue-500"
        onClick={(e) => {
          e.stopPropagation();
          if (record._id) {
            navigate(`/scientific-paper/${record._id}`);
          } else {
            console.error("Paper ID not found in record:", record);
          }
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
  },
  {
    title: "Lượt tải",
    dataIndex: "downloads",
    key: "downloads",
    width: 95,
  },
  {
    title: "Điểm đóng góp",
    dataIndex: "contributions",
    key: "contributions",
    width: 135,
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
  const [showColumnFilter, setShowColumnFilter] = useState(false);
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
  const [top3Papers, setTop3Papers] = useState([]);
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
  const columnFilterRef = useRef(null);

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
    const fetchTop5PapersAndPoints = async () => {
      try {
        if (userId) {
          const top5Response = await userApi.getTop5PapersByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          console.log("Top 5 Papers API Response:", top5Response);

          if (top5Response && top5Response.papers) {
            // Transform data for the table
            const formattedPapers = top5Response.papers.map((paper, index) => ({
              id: index + 1,
              _id: paper._id,
              title: paper.title_vn || paper.title_en,
              views: paper.viewCount,
              downloads: paper.downloadCount,
              contributions: paper.contributionScore,
            }));
            setTop3Papers(formattedPapers);

            // Transform data for the chart
            const formattedChartData = top5Response.papers.map((paper) => ({
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
          } else {
            console.warn("No papers found for this author.");
            setTop3Papers([]);
            setPointChartData({
              labels: [],
              datasets: [
                {
                  data: [],
                  backgroundColor: [],
                },
              ],
            });
          }
        }
      } catch (error) {
        console.error("Error fetching top 5 papers and points:", error);
        setTop3Papers([]);
        setPointChartData({
          labels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
            },
          ],
        });
      }
    };

    fetchTop5PapersAndPoints();
  }, [userId, selectedYear]);

  useEffect(() => {
    const fetchTypeStatistics = async () => {
      try {
        const response = await userApi.getStatisticsByGroupByUser(userId);
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
  }, []);

  useEffect(() => {
    const fetchTop5PaperTypes = async () => {
      try {
        if (userId) {
          const response = await userApi.getTop5PaperTypesByUser(userId);
          console.log("Top 5 Paper Types API Response:", response);

          if (response && response.data) {
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
          }
        }
      } catch (error) {
        console.error("Error fetching top 5 paper types:", error);
      }
    };

    fetchTop5PaperTypes();
  }, [userId]);

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
      if (
        columnFilterRef.current &&
        !columnFilterRef.current.contains(event.target)
      ) {
        setShowColumnFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeFilterChange = (selectedFilters) => {
    setSelectedTypeFilters(selectedFilters);

    // Update the point and donut chart filters based on the selected type filters
    const filteredLabels = [];
    setSelectedPointFilters(filteredLabels);

    const filteredDepartments = [];
    setSelectedDonutFilters([...new Set(filteredDepartments)]);
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
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-gray-700 pt-4">
                  {totalPapers}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#b0fccd] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-gray-700 pt-4">
                  {totalPoints.toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">
                  Tổng điểm đóng góp
                </div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#00A3FF] pt-4">
                  {totalViews.toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-shadow"
                style={{ width: "200px", height: "55px" }}
              >
                <div className="text-lg font-bold text-[#FFB700] pt-4">
                  {totalDownloads.toLocaleString()}
                </div>
                <div className="text-gray-500 pb-4 text-sm">Tổng lượt tải</div>
              </div>
            </div>
            <div className="ml-4">
              <select
                className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[125px] cursor-pointer hover:bg-[#008AE0] transition-colors"
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
                  <div
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setShowTypeFilter(!showTypeFilter)}
                  >
                    Bộ lọc
                  </div>
                  {showTypeFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "220px" }}
                    >
                      <div className="p-3">
                        <Checkbox
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
                          className="mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer block"
                        >
                          Tất cả
                        </Checkbox>
                        <div className="max-h-[200px] overflow-y-auto">
                          {Object.keys(typeCounts).map((type) => (
                            <Checkbox
                              key={type}
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
                              className="block mb-2 hover:bg-gray-50 p-1 rounded"
                            >
                              {type}
                            </Checkbox>
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
                  Biểu đồ Thống kê top 5 bài báo có điểm đóng góp cao nhất
                </h2>
                <div className="relative" ref={pointFilterRef}>
                  <div
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setShowPointFilter(!showPointFilter)}
                  >
                    Bộ lọc
                  </div>
                  {showPointFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "250px" }}
                    >
                      <div className="p-3">
                        <Checkbox
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
                          className="mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer block"
                        >
                          Tất cả
                        </Checkbox>
                        <div className="max-h-[200px] overflow-y-auto">
                          {pointFilterOptions.map((option) => (
                            <Checkbox
                              key={option.value}
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
                              className="block mb-2 hover:bg-gray-50 p-1 rounded"
                            >
                              {option.label}
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={pointChartData}
                options={getChartOptions(pointChartData)}
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
                  <div
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDonutFilter(!showDonutFilter)}
                  >
                    Bộ lọc
                  </div>
                  {showDonutFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "200px" }}
                    >
                      <div className="p-3">
                        <Checkbox
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
                          className="mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer block"
                        >
                          Tất cả
                        </Checkbox>
                        <div className="max-h-[200px] overflow-y-auto">
                          {donutFilterOptions.map((option) => (
                            <Checkbox
                              key={option.value}
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
                              className="block mb-2 hover:bg-gray-50 p-1 rounded"
                            >
                              {option.label}
                            </Checkbox>
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
                <div className="relative" ref={columnFilterRef}>
                  <div
                    className="flex items-center gap-2 text-gray-600 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setShowColumnFilter(!showColumnFilter)}
                  >
                    Bộ lọc cột
                  </div>
                  {showColumnFilter && (
                    <div
                      className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                      style={{ width: "220px" }}
                    >
                      <div className="p-3">
                        <Checkbox
                          indeterminate={
                            visibleColumns.length > 0 &&
                            visibleColumns.length < columnOptions.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setVisibleColumns(
                                columnOptions.map((col) => col.value)
                              );
                            } else {
                              setVisibleColumns([]);
                            }
                          }}
                          checked={
                            visibleColumns.length === columnOptions.length
                          }
                          className="mb-2 hover:bg-gray-50 p-1 rounded cursor-pointer block"
                        >
                          Chọn tất cả
                        </Checkbox>
                        <div className="max-h-[200px] overflow-y-auto">
                          {columnOptions.map((option) => (
                            <Checkbox
                              key={option.value}
                              checked={visibleColumns.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setVisibleColumns([
                                    ...visibleColumns,
                                    option.value,
                                  ]);
                                } else {
                                  setVisibleColumns(
                                    visibleColumns.filter(
                                      (c) => c !== option.value
                                    )
                                  );
                                }
                              }}
                              className="block mb-2 hover:bg-gray-50 p-1 rounded"
                            >
                              {option.label}
                            </Checkbox>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Table
                columns={columns.filter((col) =>
                  visibleColumns.includes(col.key)
                )}
                dataSource={top3Papers}
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
