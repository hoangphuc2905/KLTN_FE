import React, { useState } from "react";
import Header from "../../../components/header";
import { Home, ChevronRight } from "lucide-react";
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
    responsive: true,
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
    ],
    datasets: [
      {
        data: [1, 6, 2, 7, 7],
        backgroundColor: [
          "#00A3FF",
          "#F1416C",
          "#FFC700",
          "#7239EA",
          "#17B26A",
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
        align: "center",
        labels: {
          usePointStyle: true,
          padding: 20,
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
            <span>Trang chủ</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Quản lý người dùng
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Dạng biểu đồ
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="self-center w-full max-w-[1563px] px-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-4 justify-center w-full">
              <div
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "253px", height: "75px" }}
              >
                <div className="text-2xl font-bold text-gray-700">
                  {stats.totalPapers}
                </div>
                <div className="text-gray-500 mt-2 text-lg">Tổng bài báo</div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "253px", height: "75px" }}
              >
                <div className="text-2xl font-bold text-[#00A3FF]">
                  {stats.totalViews.toLocaleString()}
                </div>
                <div className="text-gray-500 mt-2 text-lg">Tổng lượt xem</div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center"
                style={{ width: "253px", height: "75px" }}
              >
                <div className="text-2xl font-bold text-[#FFB700]">
                  {stats.totalDownloads.toLocaleString()}
                </div>
                <div className="text-gray-500 mt-2 text-lg">Tổng lượt tải</div>
              </div>
            </div>
            <select className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        {/* Charts */}
        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-700 text-xs">
                  Biểu đồ Thống kê theo loại
                </h2>
                <select className="text-xs border rounded p-1 px-2">
                  <option>Tất cả</option>
                </select>
              </div>
              <Bar data={typeChartData} options={chartOptions} height={150} />
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700 text-sm">
                  Biểu đồ Thống kê theo vai trò
                </h2>
                <select className="text-xs border rounded p-1 px-2">
                  <option>Tất cả</option>
                </select>
              </div>
              <Bar data={roleChartData} options={chartOptions} height={200} />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700 text-sm">
                  Biểu đồ Thống kê theo lĩnh vực nghiên cứu
                </h2>
                <select className="text-xs border rounded p-1 px-2">
                  <option>Tất cả</option>
                </select>
              </div>
              <div className="flex justify-center items-center relative">
                <div className="absolute">
                  <div className="text-center">
                    <div className="text-xl font-bold">23</div>
                    <div className="text-gray-500 text-xs">bài nghiên cứu</div>
                  </div>
                </div>
                <Doughnut data={donutChartData} options={donutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
