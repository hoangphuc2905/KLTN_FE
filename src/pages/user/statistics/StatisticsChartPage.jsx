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
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

const typeCounts = mockData.reduce((acc, paper) => {
  acc[paper.selectedPaperType] = (acc[paper.selectedPaperType] || 0) + 1;
  return acc;
}, {});

const typeChartOptions = {
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
      max: 20, // Maximum value for "Thống kê theo loại"
      ticks: {
        stepSize: 4, // Step size for "Thống kê theo loại"
      },
    },
  },
};

const pointChartData = {
  labels: mockData.map((paper) => paper.titleEn), // Use paper titles as labels
  datasets: [
    {
      data: mockData.map((paper) => paper.point), // Use points for this chart
      backgroundColor: ["#00A3FF", "#7239EA", "#F1416C", "#39eaa3", "#FFB700"],
      borderWidth: 0,
      borderRadius: 6,
    },
  ],
};

const pointChartOptions = {
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
      max: 100, // Maximum value for "Thống kê theo điểm bài báo"
      ticks: {
        stepSize: 10, // Step size for "Thống kê theo điểm bài báo"
      },
    },
  },
};

const donutChartData = {
  labels: mockData.map((paper) => paper.selectedDepartment),
  datasets: [
    {
      data: mockData.map((paper) => paper.totalViews),
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
  },
  {
    title: "Tên bài nghiên cứu",
    dataIndex: "title",
    key: "title",
  },
  {
    title: "Lượt xem",
    dataIndex: "views",
    key: "views",
  },
  {
    title: "Lượt tải",
    dataIndex: "downloads",
    key: "downloads",
  },
  {
    title: "Điểm đóng góp",
    dataIndex: "contributions",
    key: "contributions",
  },
];

const columnOptions = columns.map((col) => ({
  label: col.title,
  value: col.key,
}));

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedTypeFilters, setSelectedTypeFilters] = useState(
    Object.keys(typeCounts)
  );
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [showPointFilter, setShowPointFilter] = useState(false);
  const [selectedPointFilters, setSelectedPointFilters] = useState(
    pointChartData.labels
  );
  const pointFilterOptions = pointChartData.labels.map((label) => ({
    label,
    value: label,
  }));
  const [showDonutFilter, setShowDonutFilter] = useState(false);
  const [selectedDonutFilters, setSelectedDonutFilters] = useState(
    donutChartData.labels
  );
  const donutFilterOptions = donutChartData.labels.map((label) => ({
    label,
    value: label,
  }));

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
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "50px" }}
              >
                <div className="text-lg font-bold text-gray-700">
                  {stats.totalPapers}
                </div>
                <div className="text-gray-500 mt-1 text-sm">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#b0fccd] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "50px" }}
              >
                <div className="text-lg font-bold text-gray-700">
                  {stats.totalPoints}
                </div>
                <div className="text-gray-500 mt-1 text-sm">
                  Tổng điểm đóng góp
                </div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "50px" }}
              >
                <div className="text-lg font-bold text-[#00A3FF]">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-gray-500 mt-1 text-sm">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "200px", height: "50px" }}
              >
                <div className="text-lg font-bold text-[#FFB700]">
                  {stats.totalDownloads.toLocaleString()}
                </div>
                <div className="text-gray-500 mt-1 text-sm">Tổng lượt tải</div>
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
                <div className="relative">
                  <div
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs cursor-pointer"
                    onClick={() => setShowTypeFilter(!showTypeFilter)}
                  >
                    Bộ lọc
                  </div>
                  {showTypeFilter && (
                    <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
                      <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                        <Checkbox.Group
                          options={Object.keys(typeCounts).map((type) => ({
                            label: type,
                            value: type,
                          }))}
                          value={selectedTypeFilters}
                          onChange={handleTypeFilterChange}
                          className="flex flex-col gap-2"
                        />
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
                options={typeChartOptions}
                height={200}
                width={500}
              />
            </div>
            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ Thống kê theo điểm bài báo
                </h2>
                <div className="relative">
                  <div
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs cursor-pointer"
                    onClick={() => setShowPointFilter(!showPointFilter)}
                  >
                    Bộ lọc
                  </div>
                  {showPointFilter && (
                    <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
                      <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                        <Checkbox.Group
                          options={pointFilterOptions}
                          value={selectedPointFilters}
                          onChange={handlePointFilterChange}
                          className="flex flex-col gap-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={{
                  labels: pointChartData.labels.filter((label) =>
                    selectedPointFilters.includes(label)
                  ),
                  datasets: [
                    {
                      ...pointChartData.datasets[0],
                      data: pointChartData.datasets[0].data.filter((_, index) =>
                        selectedPointFilters.includes(
                          pointChartData.labels[index]
                        )
                      ),
                    },
                  ],
                }}
                options={pointChartOptions}
                height={200}
                width={540}
              />
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ Thống kê theo lĩnh vực nghiên cứu
                </h2>
                <div className="relative">
                  <div
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs cursor-pointer"
                    onClick={() => setShowDonutFilter(!showDonutFilter)}
                  >
                    Bộ lọc
                  </div>
                  {showDonutFilter && (
                    <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
                      <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                        <Checkbox.Group
                          options={donutFilterOptions}
                          value={selectedDonutFilters}
                          onChange={handleDonutFilterChange}
                          className="flex flex-col gap-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-start items-center relative">
                <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
                <Doughnut
                  data={{
                    labels: donutChartData.labels.filter((label) =>
                      selectedDonutFilters.includes(label)
                    ),
                    datasets: [
                      {
                        ...donutChartData.datasets[0],
                        data: donutChartData.datasets[0].data.filter(
                          (_, index) =>
                            selectedDonutFilters.includes(
                              donutChartData.labels[index]
                            )
                        ),
                      },
                    ],
                  }}
                  options={donutOptions}
                  height={200}
                  width={500}
                />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">
                  TOP 3 BÀI NGHIÊN CỨU KHOA HỌC TIÊU BIỂU
                </h2>
                <div className="relative">
                  <div
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs cursor-pointer"
                    onClick={() => setShowColumnFilter(!showColumnFilter)}
                  >
                    Bộ lọc cột
                  </div>
                  {showColumnFilter && (
                    <div className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200">
                      <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
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
                        >
                          Chọn tất cả
                        </Checkbox>
                        <Checkbox.Group
                          options={columnOptions}
                          value={visibleColumns}
                          onChange={handleColumnVisibilityChange}
                          className="flex flex-col gap-2 mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Table
                columns={columns.filter((col) =>
                  visibleColumns.includes(col.key)
                )}
                dataSource={topPapers}
                pagination={false}
                rowKey="id"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
