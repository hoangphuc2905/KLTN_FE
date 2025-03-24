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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const stats = {
    totalPapers: 200,
    totalViews: 111200,
    totalDownloads: 12112,
    year: 2024,
  };

  const typeChartData = {
    labels: ["Q1", "Q2", "Q3", "Q4", "None"],
    datasets: [
      {
        data: [22, 25, 21, 19, 15],
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
  };

  const roleChartData = {
    labels: ["Tác giả chính", "Liên hệ", "Vừa chính vừa liên hệ", "Tham gia"],
    datasets: [
      {
        data: [12, 13, 11, 9],
        backgroundColor: ["#00A3FF", "#7239EA", "#F1416C", "#7239EA"],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: false, // Đặt responsive là false
    maintainAspectRatio: false, // Đặt maintainAspectRatio là false
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  const donutChartData = {
    labels: [
      "Category 1",
      "Category 2",
      "Category 3",
      "Category 4",
      "Category 5",
      "Category 6",
      "Category 7",
      "Category 8",
      "Category 9",
      "Category 10",
    ],
    datasets: [
      {
        data: [1, 6, 2, 7, 7, 4, 3, 2, 7, 8],
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

  const topPapers = [
    {
      id: 1,
      title: "Bài báo siêu nổi hot",
      views: 154,
      downloads: 28,
      contributions: 10,
    },
    {
      id: 2,
      title: "Nghiên cứu bài báo không lỗi thoát",
      views: 148,
      downloads: 21,
      contributions: 9,
    },
    {
      id: 3,
      title: "Bài báo siêu dài phải xuống tận 3 bên vòng mới được",
      views: 126,
      downloads: 10,
      contributions: 7,
    },
  ];

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

  const handleQuarterChange = (event) => {
    const value = event.target.value;
    setSelectedQuarters((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
  };

  const handleRoleChange = (event) => {
    const value = event.target.value;
    setSelectedRoles((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
  };

  const handleFieldChange = (event) => {
    const value = event.target.value;
    setSelectedFields((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((item) => item !== value)
        : [...prevSelected, value]
    );
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

  const filteredRoleChartData = {
    ...roleChartData,
    datasets: [
      {
        ...roleChartData.datasets[0],
        data: selectedRoles.includes("All")
          ? roleChartData.datasets[0].data
          : roleChartData.datasets[0].data.map((value, index) =>
              selectedRoles.includes(roleChartData.labels[index]) ? value : 0
            ),
      },
    ],
  };

  const filteredDonutChartData = {
    ...donutChartData,
    datasets: [
      {
        ...donutChartData.datasets[0],
        data: selectedFields.includes("All")
          ? donutChartData.datasets[0].data
          : donutChartData.datasets[0].data.map((value, index) =>
              selectedFields.includes(donutChartData.labels[index]) ? value : 0
            ),
      },
    ],
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
                style={{ width: "200px", height: "50px" }}
              >
                <div className="text-lg font-bold text-gray-700">
                  {stats.totalPapers}
                </div>
                <div className="text-gray-500 mt-1 text-sm">Tổng bài báo</div>
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
              <select className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[85px]">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
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
                        {["All", "Q1", "Q2", "Q3", "Q4", "None"].map(
                          (quarter) => (
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
                          )
                        )}
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
                  Biểu đồ Thống kê theo vai trò
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
                      style={{ left: "-100px", width: "200px" }}
                    >
                      {" "}
                      {/* Adjusted width and position */}
                      <div className="px-4 py-5 w-full">
                        {[
                          "All",
                          "Tác giả chính",
                          "Liên hệ",
                          "Vừa chính vừa liên hệ",
                          "Tham gia",
                        ].map((role) => (
                          <label
                            key={role}
                            className="flex items-center mb-2 flex-wrap"
                          >
                            {" "}
                            {/* Added margin-bottom */}
                            <input
                              type="checkbox"
                              value={role}
                              checked={selectedRoles.includes(role)}
                              onChange={handleRoleChange}
                              className="mr-2"
                            />
                            {role}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Bar
                data={filteredRoleChartData}
                options={chartOptions}
                height={200}
                width={540}
              />
            </div>

            <div className="bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Biểu đồ Thống kê theo lĩnh vực nghiên cứu
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
                        {[
                          "All",
                          "Category 1",
                          "Category 2",
                          "Category 3",
                          "Category 4",
                          "Category 5",
                          "Category 6",
                          "Category 7",
                          "Category 8",
                          "Category 9",
                          "Category 10",
                        ].map((field) => (
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
                        ))}
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
                TOP 3 BÀI NGHIÊN CỨU KHOA HỌC TIÊU BIỂU
              </h2>
              <Table
                columns={columns}
                dataSource={topPapers}
                pagination={false}
                rowKey="id"
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
