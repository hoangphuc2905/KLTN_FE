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

const mockData = [
  {
    coverImage: "https://via.placeholder.com/150",
    selectedFile: "file1.pdf",
    authors: ["Author A", "Author B"],
    selectedDepartment: "Department 1",
    summary: "This is a summary of the first paper.",
    keywords: ["keyword1", "keyword2"],
    selectedPaperType: "Type 1",
    selectedPaperGroup: "Group A",
    titleVn: "Tiêu đề tiếng Việt 1",
    titleEn: "English Title 1",
    publishDate: "2023-01-01",
    magazineVi: "Tạp chí Việt Nam 1",
    magazineEn: "English Magazine 1",
    magazineType: "Type A",
    pageCount: 10,
    issnIsbn: "1234-5678",
    doi: "10.1234/example1",
    link: "https://example.com/paper1",
    point: 85, // Updated to reflect max 100
    totalPapers: 50,
    totalViews: 3000,
    totalDownloads: 500,
    year: 2024,
  },
  {
    coverImage: "https://via.placeholder.com/150",
    selectedFile: "file2.pdf",
    authors: ["Author C", "Author D"],
    selectedDepartment: "Department 2",
    summary: "This is a summary of the second paper.",
    keywords: ["keyword3", "keyword4"],
    selectedPaperType: "Type 2",
    selectedPaperGroup: "Group B",
    titleVn: "Tiêu đề tiếng Việt 2",
    titleEn: "English Title 2",
    publishDate: "2023-02-01",
    magazineVi: "Tạp chí Việt Nam 2",
    magazineEn: "English Magazine 2",
    magazineType: "Type B",
    pageCount: 15,
    issnIsbn: "2345-6789",
    doi: "10.1234/example2",
    link: "https://example.com/paper2",
    point: 90, // Updated to reflect max 100
    totalPapers: 60,
    totalViews: 4000,
    totalDownloads: 600,
    year: 2024,
  },
  {
    coverImage: "https://via.placeholder.com/150",
    selectedFile: "file3.pdf",
    authors: ["Author E", "Author F"],
    selectedDepartment: "Department 3",
    summary: "This is a summary of the third paper.",
    keywords: ["keyword5", "keyword6"],
    selectedPaperType: "Type 3",
    selectedPaperGroup: "Group C",
    titleVn: "Tiêu đề tiếng Việt 3",
    titleEn: "English Title 3",
    publishDate: "2023-03-01",
    magazineVi: "Tạp chí Việt Nam 3",
    magazineEn: "English Magazine 3",
    magazineType: "Type C",
    pageCount: 20,
    issnIsbn: "3456-7890",
    doi: "10.1234/example3",
    link: "https://example.com/paper3",
    point: 80, // Updated to reflect max 100
    totalPapers: 70,
    totalViews: 5000,
    totalDownloads: 700,
    year: 2024,
  },
  {
    coverImage: "https://via.placeholder.com/150",
    selectedFile: "file4.pdf",
    authors: ["Author G", "Author H"],
    selectedDepartment: "Department 4",
    summary: "This is a summary of the fourth paper.",
    keywords: ["keyword7", "keyword8"],
    selectedPaperType: "Type 4",
    selectedPaperGroup: "Group D",
    titleVn: "Tiêu đề tiếng Việt 4",
    titleEn: "English Title 4",
    publishDate: "2023-04-01",
    magazineVi: "Tạp chí Việt Nam 4",
    magazineEn: "English Magazine 4",
    magazineType: "Type D",
    pageCount: 25,
    issnIsbn: "4567-8901",
    doi: "10.1234/example4",
    link: "https://example.com/paper4",
    point: 95, // Updated to reflect max 100
    totalPapers: 80,
    totalViews: 6000,
    totalDownloads: 800,
    year: 2024,
  },
];

const stats = {
  totalPapers: mockData.reduce((sum, paper) => sum + paper.totalPapers, 0),
  totalViews: mockData.reduce((sum, paper) => sum + paper.totalViews, 0),
  totalPoints: mockData.reduce((sum, paper) => sum + paper.point, 0),
  totalDownloads: mockData.reduce(
    (sum, paper) => sum + paper.totalDownloads,
    0
  ),
  year: new Date().getFullYear(),
};

const topPapers = mockData
  .map((paper, index) => ({
    id: index + 1,
    title: paper.titleEn,
    views: paper.totalViews,
    downloads: paper.totalDownloads,
    contributions: paper.point,
  }))
  .slice(0, 3); // Limit to top 3 papers

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
  const donutFilterOptions = mockData
    .map((paper) => paper.selectedDepartment)
    .map((label) => ({
      label,
      value: label,
    }));
  const userId = localStorage.getItem("user_id");
  const [totalPapers, setTotalPapers] = useState(stats.totalPapers);
  const [totalViews, setTotalViews] = useState(stats.totalViews);
  const [totalDownloads, setTotalDownloads] = useState(stats.totalDownloads);
  const [top3Papers, setTop3Papers] = useState(topPapers);
  const [totalPoints, setTotalPoints] = useState(stats.totalPoints);
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

  // Add refs for click outside handling
  const typeFilterRef = useRef(null);
  const pointFilterRef = useRef(null);
  const donutFilterRef = useRef(null);
  const columnFilterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (userId) {
          // Fetch total papers
          const papersResponse = await userApi.getTotalPapersByAuthorId(userId);
          console.log("Total Papers API Response:", papersResponse);
          setTotalPapers(papersResponse.total_papers);

          // Fetch total views
          const viewsResponse = await userApi.getTotalViewsByAuthorId(userId);
          console.log("Total Views API Response:", viewsResponse);
          setTotalViews(viewsResponse.total_views);

          // Fetch total downloads
          const downloadsResponse = await userApi.getTotalDownloadsByAuthorId(
            userId
          );
          console.log("Total Downloads API Response:", downloadsResponse);
          setTotalDownloads(downloadsResponse.total_downloads);

          // Fetch total points
          const pointsResponse = await userApi.getTotalPointByAuthorId(userId);
          console.log("Total Points API Response:", pointsResponse);
          setTotalPoints(pointsResponse.total_points);

          // Fetch top 3 papers
          const top3Response = await userApi.getTop3PapersByAuthorId(userId);
          console.log("Top 3 Papers API Response:", top3Response);

          // Transform the API response to match the table format
          if (top3Response && top3Response.papers) {
            const formattedPapers = top3Response.papers.map((paper, index) => ({
              id: index + 1,
              _id: paper._id, // Ensure we extract the _id from the paper
              title: paper.title_vn || paper.title_en,
              views: paper.viewCount,
              downloads: paper.downloadCount,
              contributions: paper.contributionScore,
            }));
            setTop3Papers(formattedPapers);
          }
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchData();
  }, [userId]);

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
    const fetchTop5Papers = async () => {
      try {
        if (userId) {
          const response = await userApi.getTop5PapersByAuthor(userId);
          console.log("Top 5 Papers API Response:", response);

          if (response && response.papers) {
            const formattedData = response.papers.map((paper) => ({
              title: paper.title_vn || paper.title_en,
              contributionScore: paper.contributionScore,
            }));

            setPointChartData({
              labels: formattedData.map((paper) =>
                paper.title.length > 20
                  ? paper.title.substring(0, 20) + "..."
                  : paper.title
              ),
              datasets: [
                {
                  data: formattedData.map((paper) => paper.contributionScore),
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
          }
        }
      } catch (error) {
        console.error("Error fetching top 5 papers:", error);
      }
    };

    fetchTop5Papers();
  }, [userId]);

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
    const filteredLabels = mockData
      .filter((paper) => selectedFilters.includes(paper.selectedPaperType))
      .map((paper) => paper.titleEn);
    setSelectedPointFilters(filteredLabels);

    const filteredDepartments = mockData
      .filter((paper) => selectedFilters.includes(paper.selectedPaperType))
      .map((paper) => paper.selectedDepartment);
    setSelectedDonutFilters([...new Set(filteredDepartments)]);
  };

  const handlePointFilterChange = (selectedFilters) => {
    setSelectedPointFilters(selectedFilters);

    // Update the type and donut chart filters based on the selected point filters
    const filteredTypes = mockData
      .filter((paper) => selectedFilters.includes(paper.titleEn))
      .map((paper) => paper.selectedPaperType);
    setSelectedTypeFilters([...new Set(filteredTypes)]);

    const filteredDepartments = mockData
      .filter((paper) => selectedFilters.includes(paper.titleEn))
      .map((paper) => paper.selectedDepartment);
    setSelectedDonutFilters([...new Set(filteredDepartments)]);
  };

  const handleDonutFilterChange = (selectedFilters) => {
    setSelectedDonutFilters(selectedFilters);

    // Update the type and point chart filters based on the selected donut filters
    const filteredTypes = mockData
      .filter((paper) => selectedFilters.includes(paper.selectedDepartment))
      .map((paper) => paper.selectedPaperType);
    setSelectedTypeFilters([...new Set(filteredTypes)]);

    const filteredLabels = mockData
      .filter((paper) => selectedFilters.includes(paper.selectedDepartment))
      .map((paper) => paper.titleEn);
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
              <select className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[125px] cursor-pointer hover:bg-[#008AE0] transition-colors">
                <option value="2024">2024-2025</option>
                <option value="2023">2023-2024</option>
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
