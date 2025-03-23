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
    totalPoints: 120,
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

  const navigate = useNavigate();

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
                <select className="text-sm border rounded p-1 px-3">
                  <option>Tất cả</option>
                </select>
              </div>
              <Bar
                data={typeChartData}
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
                <select className="text-sm border rounded p-1 px-3">
                  <option>Tất cả</option>
                </select>
              </div>
              <Bar
                data={roleChartData}
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
                <select className="text-sm border rounded p-1 px-3">
                  <option>Tất cả</option>
                </select>
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
    </div>
  );
};

export default Dashboard;
