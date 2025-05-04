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
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Doughnut } from "react-chartjs-2";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
  pdfMake.vfs = pdfFonts;
}

// Định nghĩa font Roboto có hỗ trợ tiếng Việt
pdfMake.fonts = {
  Roboto: {
    normal: "Roboto-Regular.ttf",
    bold: "Roboto-Medium.ttf",
    italics: "Roboto-Italic.ttf",
    bolditalics: "Roboto-MediumItalic.ttf",
  },
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const getChartOptions = (data, showDataLabels = false) => {
  const maxValue =
    data && data.datasets && data.datasets[0] && data.datasets[0].data
      ? Math.max(
          ...data.datasets[0].data.filter((val) => !isNaN(val) && val !== 0)
        )
      : 0;

  const roundedMax = Math.ceil((maxValue + 10) / 10) * 10;
  const step = Math.min(Math.ceil(roundedMax / 5), Math.ceil(roundedMax / 10));

  // Kiểm tra nếu đang ở màn hình lớn
  const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint

  // Lọc ra các indices của các giá trị data khác 0
  const nonZeroIndices =
    data && data.datasets && data.datasets[0] && data.datasets[0].data
      ? data.datasets[0].data
          .map((value, index) => ({ value, index }))
          .filter((item) => item.value > 0)
          .map((item) => item.index)
      : [];

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            if (data.originalLabels && tooltipItems[0]) {
              const index = tooltipItems[0].dataIndex;
              return data.originalLabels[index] || tooltipItems[0].label;
            }
            return tooltipItems[0].label;
          },
        },
      },
      datalabels: showDataLabels
        ? {
            color: "#000",
            font: {
              size: 12,
              weight: "bold",
            },
            formatter: (value) => value,
          }
        : false,
    },
    scales: {
      x: {
        ticks: {
          callback: function (value, index) {
            // Chỉ hiển thị label cho các cột có giá trị > 0
            return nonZeroIndices.includes(index)
              ? this.getLabelForValue(value)
              : "";
          },
          autoSkip: false,
          maxRotation: isLargeScreen ? 0 : 45, // Màn hình lớn: ngang, màn hình nhỏ: xoay 45 độ
          minRotation: isLargeScreen ? 0 : 45, // Đảm bảo nhất quán
          font: {
            size: isLargeScreen ? 12 : 10, // Font lớn hơn trên màn hình lớn
          },
        },
      },
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
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      align: "center",
      labels: {
        usePointStyle: true,
        padding: 20,
        boxWidth: 10,
        font: {
          size: 10,
        },
      },
    },
    datalabels: {
      color: "#000",
      font: {
        size: 10,
        weight: "bold",
      },
      formatter: (value) => value,
    },
  },
  cutout: 0,
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    totalViews: 0,
    totalDownloads: 0,
    year: 2024,
  });

  const [selectedYear, setSelectedYear] = useState("Tất cả");
  const [typeChartType, setTypeChartType] = useState("bar");
  const [departmentChartType, setDepartmentChartType] = useState("bar");
  const [fieldChartType, setFieldChartType] = useState("doughnut");
  const [showTypeChartFilter, setShowTypeChartFilter] = useState(false);
  const [showDepartmentChartFilter, setShowDepartmentChartFilter] =
    useState(false);
  const [showFieldChartFilter, setShowFieldChartFilter] = useState(false);
  const [showTypeDownloadFilter, setShowTypeDownloadFilter] = useState(false);
  const [showDepartmentDownloadFilter, setShowDepartmentDownloadFilter] =
    useState(false);
  const [showFieldDownloadFilter, setShowFieldDownloadFilter] = useState(false);
  const [showTableExport, setShowTableExport] = useState(false);

  // Thêm state cho nút tải tất cả
  const [showExportAllFilter, setShowExportAllFilter] = useState(false);
  const exportAllFilterRef = useRef(null);

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
          );

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
          );

          // Khi là biểu đồ cột mới rút gọn tên khoa
          const formattedLabels =
            departmentChartType === "bar"
              ? labels.map((label) =>
                  label.length > 10 ? label.substring(0, 10) + "..." : label
                )
              : labels;

          setDepartmentChartData({
            labels: formattedLabels,
            datasets: [
              {
                data,
                backgroundColor,
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
            originalLabels: labels,
          });
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch department chart data:", error);
      }
    };

    fetchDepartmentChartData();
  }, [selectedYear, departmentChartType]);

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
          const entries = Object.entries(response.data)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          const labels = entries.map((entry) => entry[0]);
          const data = entries.map((entry) => entry[1]);
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#39eaa3", "#FFC700"][index % 5]
          );

          // Tạo formattedLabels cho biểu đồ cột
          const formattedLabels =
            fieldChartType === "bar"
              ? labels.map((label) =>
                  label.length > 10 ? label.substring(0, 10) + "..." : label
                )
              : labels;

          setTop5ByFieldChartData({
            labels: formattedLabels,
            datasets: [
              {
                data,
                backgroundColor,
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
            originalLabels: labels,
          });
        } else {
          console.error("Unexpected API response structure:", response);
        }
      } catch (error) {
        console.error("Failed to fetch top 5 by type chart data:", error);
      }
    };

    fetchTop5ByTypeChartData();
  }, [selectedYear, fieldChartType]);

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
          setTopPapers([]);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          console.warn(
            "No data found for the selected academic year:",
            error.response.data
          );
          setTopPapers([]);
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
      dataIndex: "viewCount",
      key: "viewCount",
      width: 90,
      render: (text) => (
        <span className="text-blue-500 font-medium">{text}</span>
      ),
    },
    {
      title: "Lượt tải",
      dataIndex: "downloadCount",
      key: "downloadCount",
      width: 90,
      render: (text) => (
        <span className="text-amber-500 font-medium">{text}</span>
      ),
    },
  ];

  const onRowClick = (record) => {
    return {
      onClick: () => {
        navigate(`/scientific-paper/${record._id}`);
      },
      style: { cursor: "pointer" },
      className: "hover:bg-blue-50 transition-colors duration-200",
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
  const typeChartFilterRef = useRef(null);
  const departmentChartFilterRef = useRef(null);
  const fieldChartFilterRef = useRef(null);
  const typeDownloadFilterRef = useRef(null);
  const departmentDownloadFilterRef = useRef(null);
  const fieldDownloadFilterRef = useRef(null);
  const typeChartRef = useRef(null);
  const departmentChartRef = useRef(null);
  const fieldChartRef = useRef(null);
  const tableExportRef = useRef(null);
  const navigate = useNavigate();
  const [academicYears, setAcademicYears] = useState([]);

  const getAcademicYears = async () => {
    try {
      const response = await userApi.getAcademicYears();
      const years = response.academicYears || [];
      setAcademicYears(["Tất cả", ...years.reverse()]);
      setSelectedYear("Tất cả");
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
      if (selectedQuarters.includes("All")) {
        setSelectedQuarters([]);
      } else {
        setSelectedQuarters(["All", ...typeChartData.labels]);
      }
    } else {
      if (selectedQuarters.includes(value)) {
        const newSelected = selectedQuarters.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedQuarters(newSelected);
      } else {
        const newSelected = [
          ...selectedQuarters.filter((item) => item !== "All"),
          value,
        ];

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
      if (selectedRoles.includes("All")) {
        setSelectedRoles([]);
      } else {
        setSelectedRoles(["All", ...departmentChartData.originalLabels]);
      }
    } else {
      if (selectedRoles.includes(value)) {
        const newSelected = selectedRoles.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedRoles(newSelected);
      } else {
        const newSelected = [
          ...selectedRoles.filter((item) => item !== "All"),
          value,
        ];

        if (newSelected.length === departmentChartData.originalLabels.length) {
          newSelected.push("All");
        }

        setSelectedRoles(newSelected);
      }
    }
  };

  const handleFieldChange = (event) => {
    const value = event.target.value;

    if (value === "All") {
      if (selectedFields.includes("All")) {
        setSelectedFields([]);
      } else {
        setSelectedFields(["All", ...top5ByFieldChartData.labels]);
      }
    } else {
      if (selectedFields.includes(value)) {
        const newSelected = selectedFields.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedFields(newSelected);
      } else {
        const newSelected = [
          ...selectedFields.filter((item) => item !== "All"),
          value,
        ];

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
    if (
      typeChartFilterRef.current &&
      !typeChartFilterRef.current.contains(event.target)
    ) {
      setShowTypeChartFilter(false);
    }
    if (
      departmentChartFilterRef.current &&
      !departmentChartFilterRef.current.contains(event.target)
    ) {
      setShowDepartmentChartFilter(false);
    }
    if (
      fieldChartFilterRef.current &&
      !fieldChartFilterRef.current.contains(event.target)
    ) {
      setShowFieldChartFilter(false);
    }
    if (
      typeDownloadFilterRef.current &&
      !typeDownloadFilterRef.current.contains(event.target)
    ) {
      setShowTypeDownloadFilter(false);
    }
    if (
      departmentDownloadFilterRef.current &&
      !departmentDownloadFilterRef.current.contains(event.target)
    ) {
      setShowDepartmentDownloadFilter(false);
    }
    if (
      fieldDownloadFilterRef.current &&
      !fieldDownloadFilterRef.current.contains(event.target)
    ) {
      setShowFieldDownloadFilter(false);
    }
    if (
      tableExportRef.current &&
      !tableExportRef.current.contains(event.target)
    ) {
      setShowTableExport(false);
    }
    if (
      exportAllFilterRef.current &&
      !exportAllFilterRef.current.contains(event.target)
    ) {
      setShowExportAllFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Thay đổi cách lọc dữ liệu để ẩn hoàn toàn các cột bằng 0
  const filteredTypeChartData = {
    labels: selectedQuarters.includes("All")
      ? typeChartData.labels
      : typeChartData.labels.filter((label, index) =>
          selectedQuarters.includes(label)
        ),
    datasets: [
      {
        ...typeChartData.datasets[0],
        data: selectedQuarters.includes("All")
          ? typeChartData.datasets[0].data
          : typeChartData.datasets[0].data.filter((_, index) =>
              selectedQuarters.includes(typeChartData.labels[index])
            ),
        backgroundColor: selectedQuarters.includes("All")
          ? typeChartData.datasets[0].backgroundColor
          : typeChartData.datasets[0].backgroundColor.filter((_, index) =>
              selectedQuarters.includes(typeChartData.labels[index])
            ),
      },
    ],
  };

  const filteredDepartmentChartData = {
    labels: selectedRoles.includes("All")
      ? departmentChartData.labels
      : departmentChartData.labels.filter((_, index) =>
          selectedRoles.includes(departmentChartData.originalLabels[index])
        ),
    datasets: [
      {
        ...departmentChartData.datasets[0],
        data: selectedRoles.includes("All")
          ? departmentChartData.datasets[0].data
          : departmentChartData.datasets[0].data.filter((_, index) =>
              selectedRoles.includes(departmentChartData.originalLabels[index])
            ),
        backgroundColor: selectedRoles.includes("All")
          ? departmentChartData.datasets[0].backgroundColor
          : departmentChartData.datasets[0].backgroundColor.filter((_, index) =>
              selectedRoles.includes(departmentChartData.originalLabels[index])
            ),
      },
    ],
    originalLabels: selectedRoles.includes("All")
      ? departmentChartData.originalLabels
      : departmentChartData.originalLabels.filter((label) =>
          selectedRoles.includes(label)
        ),
  };

  const filteredDonutChartData = {
    labels: selectedFields.includes("All")
      ? top5ByFieldChartData.labels
      : top5ByFieldChartData.labels.filter((label) =>
          selectedFields.includes(label)
        ),
    datasets: [
      {
        ...top5ByFieldChartData.datasets[0],
        data: selectedFields.includes("All")
          ? top5ByFieldChartData.datasets[0].data
          : top5ByFieldChartData.datasets[0].data.filter((_, index) =>
              selectedFields.includes(top5ByFieldChartData.labels[index])
            ),
        backgroundColor: selectedFields.includes("All")
          ? top5ByFieldChartData.datasets[0].backgroundColor
          : top5ByFieldChartData.datasets[0].backgroundColor.filter(
              (_, index) =>
                selectedFields.includes(top5ByFieldChartData.labels[index])
            ),
      },
    ],
    originalLabels: selectedFields.includes("All")
      ? top5ByFieldChartData.originalLabels
      : top5ByFieldChartData.originalLabels?.filter((label, index) =>
          selectedFields.includes(top5ByFieldChartData.labels[index])
        ),
  };

  const hasTypeChartData =
    selectedQuarters.length > 0 &&
    filteredTypeChartData.datasets[0].data.some((value) => value > 0);

  const hasDepartmentChartData =
    selectedRoles.length > 0 &&
    filteredDepartmentChartData.datasets[0].data.some((value) => value > 0);

  const hasFieldChartData =
    selectedFields.length > 0 &&
    filteredDonutChartData.datasets[0].data.some((value) => value > 0);

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

  const generatePDF = async (chartRef, title, data) => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // Chuẩn bị dữ liệu cho bảng - sử dụng originalLabels nếu có
      const tableBody = data.labels.map((label, index) => {
        // Sử dụng tên đầy đủ từ originalLabels nếu có
        const fullLabel = data.originalLabels
          ? data.originalLabels[index] || label
          : label;
        return [
          { text: fullLabel, style: "tableCell" },
          { text: data.datasets[0].data[index].toString(), style: "tableCell" },
        ];
      });

      // Định nghĩa cấu trúc PDF
      const docDefinition = {
        content: [
          { text: title, style: "header" },
          { image: imgData, width: 500, margin: [0, 20] },
          { text: "Dữ liệu chi tiết", style: "subheader", pageBreak: "before" },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto"],
              body: [
                [
                  { text: "Loại", style: "tableHeader" },
                  { text: "Số lượng", style: "tableHeader" },
                ],
                ...tableBody,
              ],
            },
          },
        ],
        defaultStyle: {
          font: "Roboto",
        },
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: "center",
            margin: [0, 0, 0, 20],
          },
          subheader: {
            fontSize: 16,
            bold: true,
            margin: [0, 10, 0, 5],
          },
          tableHeader: {
            bold: true,
            fontSize: 13,
            color: "black",
            fillColor: "#eeeeee",
          },
          tableCell: {
            fontSize: 12,
          },
        },
      };

      // Tạo PDF và tự động tải xuống
      pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const generateExcel = (data, title) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Báo cáo");

      // Lấy nhãn và giá trị từ dữ liệu biểu đồ
      const labels = data.originalLabels || data.labels || [];
      const values = data.datasets[0]?.data || [];

      const headers = ["STT", "Tên", "Giá trị"];

      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;

      // Tiêu đề hệ thống
      worksheet.mergeCells(
        "A1",
        `${String.fromCharCode(64 + headers.length)}7`
      );
      const systemNameCell = worksheet.getCell("A1");
      systemNameCell.value =
        "HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC\nCỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM";
      systemNameCell.font = { name: "Times New Roman", size: 14, bold: true };
      systemNameCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      // Ngày tạo
      worksheet.mergeCells("A8", "C8");
      const dateCell = worksheet.getCell("A8");
      dateCell.value = `Ngày tạo: ${formattedDate}`;
      dateCell.font = { name: "Times New Roman", size: 11 };
      dateCell.alignment = { horizontal: "left", vertical: "middle" };

      // Tiêu đề báo cáo
      worksheet.mergeCells(
        "A11",
        `${String.fromCharCode(64 + headers.length)}11`
      );
      const titleCell = worksheet.getCell("A11");
      titleCell.value = title || "BÁO CÁO";
      titleCell.font = { name: "Times New Roman", size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCEEFF" },
      };

      // Thêm header
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { name: "Times New Roman", size: 12, bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D9E1F2" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Thêm dữ liệu
      labels.forEach((label, index) => {
        const rowData = [index + 1, label, values[index]];

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Times New Roman", size: 12 };
          if (colNumber === 1) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else if (colNumber === 3) {
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else {
            cell.alignment = { horizontal: "left", vertical: "middle" };
          }
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Tự động điều chỉnh độ rộng cột
      worksheet.columns.forEach((column, index) => {
        let maxLength = headers[index] ? headers[index].length : 0;

        if (index === 0) {
          // STT
          column.width = 8;
        } else if (index === 1) {
          // Tên
          labels.forEach((label) => {
            const length = label ? label.length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
        } else {
          // Giá trị
          values.forEach((value) => {
            const length = value ? String(value).length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = maxLength + 4;
        }
      });

      // Xuất file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const fileName = `${title.replace(/\s+/g, "_")}_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;
        saveAs(blob, fileName);
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
    }
  };

  const handleDownload = (chartType, format, chartRef, data, title) => {
    if (format === "pdf") {
      generatePDF(chartRef, title, data);
    } else if (format === "excel") {
      generateExcel(data, title);
    }
  };

  const handleChartTypeChange = (chartSection, type) => {
    if (chartSection === "type") {
      setTypeChartType(type);
      setShowTypeChartFilter(false);
    } else if (chartSection === "department") {
      setDepartmentChartType(type);
      setShowDepartmentChartFilter(false);
    } else if (chartSection === "field") {
      setFieldChartType(type);
      setShowFieldChartFilter(false);
    }
  };

  const handleDownloadFormat = (
    chartSection,
    format,
    chartRef,
    data,
    title
  ) => {
    if (format) {
      handleDownload(chartSection, format, chartRef, data, title);
    }
    if (chartSection === "type") {
      setShowTypeDownloadFilter(false);
    } else if (chartSection === "department") {
      setShowDepartmentDownloadFilter(false);
    } else if (chartSection === "field") {
      setShowFieldDownloadFilter(false);
    }
  };

  const exportTableToExcel = (data, title) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Báo cáo");

      const headers = ["STT", "Tên bài nghiên cứu", "Lượt xem", "Lượt tải"];

      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;

      // Tiêu đề hệ thống
      worksheet.mergeCells(
        "A1",
        `${String.fromCharCode(64 + headers.length)}7`
      );
      const systemNameCell = worksheet.getCell("A1");
      systemNameCell.value =
        "HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC\nCỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM";
      systemNameCell.font = { name: "Times New Roman", size: 14, bold: true };
      systemNameCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      // Ngày tạo
      worksheet.mergeCells("A8", "C8");
      const dateCell = worksheet.getCell("A8");
      dateCell.value = `Ngày tạo: ${formattedDate}`;
      dateCell.font = { name: "Times New Roman", size: 11 };
      dateCell.alignment = { horizontal: "left", vertical: "middle" };

      // Tiêu đề báo cáo
      worksheet.mergeCells(
        "A11",
        `${String.fromCharCode(64 + headers.length)}11`
      );
      const titleCell = worksheet.getCell("A11");
      titleCell.value =
        title || "Top 5 bài nghiên cứu được xem nhiều nhất và tải nhiều nhất";
      titleCell.font = { name: "Times New Roman", size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCEEFF" },
      };

      // Thêm header
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { name: "Times New Roman", size: 12, bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D9E1F2" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Thêm dữ liệu
      data.forEach((item, index) => {
        const rowData = [
          index + 1,
          item.title_vn,
          item.viewCount,
          item.downloadCount,
        ];

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Times New Roman", size: 12 };
          if (colNumber === 1) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else if (colNumber === 3 || colNumber === 4) {
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else {
            cell.alignment = { horizontal: "left", vertical: "middle" };
          }
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Tự động điều chỉnh độ rộng cột
      worksheet.columns.forEach((column, index) => {
        let maxLength = headers[index] ? headers[index].length : 0;

        if (index === 0) {
          // STT
          column.width = 8;
        } else if (index === 1) {
          // Tên bài nghiên cứu
          data.forEach((item) => {
            const length = item.title_vn ? item.title_vn.length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
        } else {
          // Lượt xem, Lượt tải
          const values =
            index === 2
              ? data.map((item) => item.viewCount)
              : data.map((item) => item.downloadCount);

          values.forEach((value) => {
            const length = value ? String(value).length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = maxLength + 4;
        }
      });

      // Xuất file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/octet-stream" });
        const fileName = `${title.replace(/\s+/g, "_")}_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;
        saveAs(blob, fileName);
      });
    } catch (error) {
      console.error("Error generating Excel:", error);
    }
  };

  const exportTableToPDF = (data, title) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.text(title, 10, 10);
      let y = 20;

      data.forEach((item, index) => {
        pdf.text(`STT: ${index + 1}`, 10, y);
        pdf.text(`Tên bài nghiên cứu: ${item.title_vn}`, 10, y + 10);
        pdf.text(`Lượt xem: ${item.viewCount}`, 10, y + 20);
        pdf.text(`Lượt tải: ${item.downloadCount}`, 10, y + 30);
        y += 40;
      });

      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Thêm hàm in bảng thông qua trình duyệt
  const printTopPapersTable = () => {
    const printWindow = window.open("", "_blank");
    const tableHtml = `
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 20px;
              font-size: 18px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .numeric {
              text-align: right;
            }
            .date {
              text-align: center;
            }
            .title-cell {
              max-width: 300px;
            }
          </style>
        </head>
        <body>
          <h1>Top 5 bài nghiên cứu được xem nhiều nhất và tải nhiều nhất</h1>
          <p>Năm học: ${selectedYear}</p>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên bài nghiên cứu</th>
                <th>Lượt xem</th>
                <th>Lượt tải</th>
              </tr>
            </thead>
            <tbody>
              ${topPapers
                .map(
                  (paper, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td class="title-cell">${paper.title_vn || ""}</td>
                  <td class="numeric">${paper.viewCount || "0"}</td>
                  <td class="numeric">${paper.downloadCount || "0"}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(tableHtml);
    printWindow.document.close();
    printWindow.print();
  };

  // Thêm hàm xuất tất cả các biểu đồ
  const exportAllCharts = async (format) => {
    try {
      if (format === "pdf") {
        // Capture các biểu đồ thành ảnh
        const typeCanvas = await html2canvas(typeChartRef.current, {
          scale: 2,
        });
        const typeImgData = typeCanvas.toDataURL("image/png");

        const departmentCanvas = await html2canvas(departmentChartRef.current, {
          scale: 2,
        });
        const departmentImgData = departmentCanvas.toDataURL("image/png");

        const fieldCanvas = await html2canvas(fieldChartRef.current, {
          scale: 2,
        });
        const fieldImgData = fieldCanvas.toDataURL("image/png");

        // Chuẩn bị dữ liệu cho bảng loại
        const typeTableBody = filteredTypeChartData.labels.map(
          (label, index) => {
            const fullLabel = filteredTypeChartData.originalLabels
              ? filteredTypeChartData.originalLabels[index] || label
              : label;
            return [
              { text: fullLabel, style: "tableCell" },
              {
                text: filteredTypeChartData.datasets[0].data[index].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng khoa
        const deptTableBody = filteredDepartmentChartData.labels.map(
          (label, index) => {
            const fullLabel = filteredDepartmentChartData.originalLabels
              ? filteredDepartmentChartData.originalLabels[index] || label
              : label;
            return [
              { text: fullLabel, style: "tableCell" },
              {
                text: filteredDepartmentChartData.datasets[0].data[
                  index
                ].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng lĩnh vực
        const fieldTableBody = filteredDonutChartData.labels.map(
          (label, index) => {
            const fullLabel = filteredDonutChartData.originalLabels
              ? filteredDonutChartData.originalLabels[index] || label
              : label;
            return [
              { text: fullLabel, style: "tableCell" },
              {
                text: filteredDonutChartData.datasets[0].data[index].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng top papers
        const papersTableBody = topPapers.map((paper, index) => [
          { text: (index + 1).toString(), style: "tableCell" },
          { text: paper.title_vn || "", style: "tableCell" },
          { text: paper.viewCount.toString() || "0", style: "tableCell" },
          { text: paper.downloadCount.toString() || "0", style: "tableCell" },
        ]);

        // Định nghĩa cấu trúc PDF
        const docDefinition = {
          content: [
            {
              text: "BÁO CÁO THỐNG KÊ HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC",
              style: "mainHeader",
            },
            { text: `Năm học: ${selectedYear}`, style: "subHeader" },
            {
              text: `Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}`,
              style: "dateHeader",
            },
            { text: "", margin: [0, 10] },

            // Biểu đồ theo loại
            { text: "1. BIỂU ĐỒ THỐNG KÊ THEO LOẠI", style: "header" },
            { image: typeImgData, width: 500, margin: [0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Loại", style: "tableHeader" },
                    { text: "Số lượng", style: "tableHeader" },
                  ],
                  ...typeTableBody,
                ],
              },
              margin: [0, 10, 0, 20],
            },

            // Top 5 khoa
            {
              text: "2. TOP 5 KHOA CÓ NHIỀU BÀI NGHIÊN CỨU",
              style: "header",
              pageBreak: "before",
            },
            { image: departmentImgData, width: 500, margin: [0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Khoa", style: "tableHeader" },
                    { text: "Số lượng", style: "tableHeader" },
                  ],
                  ...deptTableBody,
                ],
              },
              margin: [0, 10, 0, 20],
            },

            // Top 5 lĩnh vực
            {
              text: "3. TOP 5 LĨNH VỰC CÓ NHIỀU BÀI NGHIÊN CỨU",
              style: "header",
              pageBreak: "before",
            },
            { image: fieldImgData, width: 500, margin: [0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Lĩnh vực", style: "tableHeader" },
                    { text: "Số lượng", style: "tableHeader" },
                  ],
                  ...fieldTableBody,
                ],
              },
              margin: [0, 10, 0, 20],
            },

            // Top 5 papers
            {
              text: "4. TOP 5 BÀI NGHIÊN CỨU ĐƯỢC XEM NHIỀU NHẤT VÀ TẢI NHIỀU NHẤT",
              style: "header",
              pageBreak: "before",
            },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto"],
                body: [
                  [
                    { text: "STT", style: "tableHeader" },
                    { text: "Tên bài nghiên cứu", style: "tableHeader" },
                    { text: "Lượt xem", style: "tableHeader" },
                    { text: "Lượt tải", style: "tableHeader" },
                  ],
                  ...papersTableBody,
                ],
              },
              margin: [0, 10],
            },
          ],
          defaultStyle: {
            font: "Roboto",
          },
          styles: {
            mainHeader: {
              fontSize: 16,
              bold: true,
              alignment: "center",
              margin: [0, 0, 0, 5],
            },
            subHeader: {
              fontSize: 14,
              alignment: "center",
              margin: [0, 5, 0, 0],
            },
            dateHeader: {
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 10],
            },
            header: {
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 10],
            },
            subheader: {
              fontSize: 12,
              bold: true,
              margin: [0, 5, 0, 5],
            },
            tableHeader: {
              bold: true,
              fontSize: 11,
              color: "black",
              fillColor: "#eeeeee",
              alignment: "center",
            },
            tableCell: {
              fontSize: 10,
            },
          },
        };

        // Tạo PDF và tự động tải xuống
        pdfMake
          .createPdf(docDefinition)
          .download(
            `Thong_Ke_Tong_Hop_${new Date()
              .toLocaleDateString("vi-VN")
              .replace(/\//g, "_")}.pdf`
          );
      } else if (format === "excel") {
        // Tạo một workbook duy nhất với nhiều worksheets
        const workbook = new ExcelJS.Workbook();

        // Thông tin chung
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${
          currentDate.getMonth() + 1
        }/${currentDate.getFullYear()}`;

        // Worksheet cho biểu đồ theo loại
        const typeWorksheet = workbook.addWorksheet("Thống kê theo loại");
        const typeLabels =
          filteredTypeChartData.originalLabels ||
          filteredTypeChartData.labels ||
          [];
        const typeValues = filteredTypeChartData.datasets[0]?.data || [];

        // Header hệ thống cho mỗi worksheet
        const addHeaderSystem = (worksheet) => {
          worksheet.mergeCells("A1", "C7");
          const systemNameCell = worksheet.getCell("A1");
          systemNameCell.value =
            "HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC\nCỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM";
          systemNameCell.font = {
            name: "Times New Roman",
            size: 14,
            bold: true,
          };
          systemNameCell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };

          // Năm học
          worksheet.mergeCells("A8", "C8");
          const yearCell = worksheet.getCell("A8");
          yearCell.value = `Năm học: ${selectedYear}`;
          yearCell.font = { name: "Times New Roman", size: 12, bold: true };
          yearCell.alignment = { horizontal: "left", vertical: "middle" };

          // Ngày tạo
          worksheet.mergeCells("A9", "C9");
          const dateCell = worksheet.getCell("A9");
          dateCell.value = `Ngày tạo: ${formattedDate}`;
          dateCell.font = { name: "Times New Roman", size: 11 };
          dateCell.alignment = { horizontal: "left", vertical: "middle" };
        };

        // Thêm header cho từng worksheet
        const addWorksheetHeader = (worksheet, title) => {
          worksheet.mergeCells("A11", "C11");
          const titleCell = worksheet.getCell("A11");
          titleCell.value = title;
          titleCell.font = { name: "Times New Roman", size: 16, bold: true };
          titleCell.alignment = { horizontal: "center", vertical: "middle" };
          titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFCCEEFF" },
          };
        };

        // Thêm dữ liệu cho worksheet
        const addDataToWorksheet = (
          worksheet,
          labels,
          values,
          startRow = 13
        ) => {
          const headers = ["STT", "Tên", "Giá trị"];

          // Thêm header
          const headerRow = worksheet.addRow(headers);
          headerRow.eachCell((cell) => {
            cell.font = { name: "Times New Roman", size: 12, bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "D9E1F2" },
            };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });

          // Thêm dữ liệu
          labels.forEach((label, index) => {
            const rowData = [index + 1, label, values[index]];

            const row = worksheet.addRow(rowData);
            row.eachCell((cell, colNumber) => {
              cell.font = { name: "Times New Roman", size: 12 };
              if (colNumber === 1) {
                cell.alignment = { horizontal: "center", vertical: "middle" };
              } else if (colNumber === 3) {
                cell.alignment = { horizontal: "right", vertical: "middle" };
              } else {
                cell.alignment = { horizontal: "left", vertical: "middle" };
              }
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            });
          });

          // Điều chỉnh độ rộng cột
          worksheet.columns.forEach((column, index) => {
            let maxLength = headers[index] ? headers[index].length : 0;

            if (index === 0) {
              // STT
              column.width = 8;
            } else if (index === 1) {
              // Tên
              labels.forEach((label) => {
                const length = label ? label.length : 0;
                if (length > maxLength) {
                  maxLength = length;
                }
              });
              column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
            } else {
              // Giá trị
              values.forEach((value) => {
                const length = value ? String(value).length : 0;
                if (length > maxLength) {
                  maxLength = length;
                }
              });
              column.width = maxLength + 4;
            }
          });
        };

        // Xử lý worksheet cho biểu đồ theo loại
        addHeaderSystem(typeWorksheet);
        addWorksheetHeader(typeWorksheet, "Biểu đồ Thống kê theo loại");
        addDataToWorksheet(typeWorksheet, typeLabels, typeValues);

        // Worksheet cho top 5 khoa
        const deptWorksheet = workbook.addWorksheet("Top 5 khoa");
        const deptLabels =
          filteredDepartmentChartData.originalLabels ||
          filteredDepartmentChartData.labels ||
          [];
        const deptValues = filteredDepartmentChartData.datasets[0]?.data || [];

        addHeaderSystem(deptWorksheet);
        addWorksheetHeader(deptWorksheet, "Top 5 khoa có nhiều bài nghiên cứu");
        addDataToWorksheet(deptWorksheet, deptLabels, deptValues);

        // Worksheet cho top 5 lĩnh vực
        const fieldWorksheet = workbook.addWorksheet("Top 5 lĩnh vực");
        const fieldLabels =
          filteredDonutChartData.originalLabels ||
          filteredDonutChartData.labels ||
          [];
        const fieldValues = filteredDonutChartData.datasets[0]?.data || [];

        addHeaderSystem(fieldWorksheet);
        addWorksheetHeader(
          fieldWorksheet,
          "Top 5 lĩnh vực có nhiều bài nghiên cứu"
        );
        addDataToWorksheet(fieldWorksheet, fieldLabels, fieldValues);

        // Worksheet cho bảng top 5 papers
        const papersWorksheet = workbook.addWorksheet("Top 5 Papers");
        const paperHeaders = [
          "STT",
          "Tên bài nghiên cứu",
          "Lượt xem",
          "Lượt tải",
        ];

        addHeaderSystem(papersWorksheet);
        addWorksheetHeader(
          papersWorksheet,
          "Top 5 bài nghiên cứu được xem nhiều nhất và tải nhiều nhất"
        );

        // Thêm header cho papers
        const paperHeaderRow = papersWorksheet.addRow(paperHeaders);
        paperHeaderRow.eachCell((cell) => {
          cell.font = { name: "Times New Roman", size: 12, bold: true };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D9E1F2" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Thêm dữ liệu papers
        topPapers.forEach((paper, index) => {
          const rowData = [
            index + 1,
            paper.title_vn,
            paper.viewCount,
            paper.downloadCount,
          ];

          const row = papersWorksheet.addRow(rowData);
          row.eachCell((cell, colNumber) => {
            cell.font = { name: "Times New Roman", size: 12 };
            if (colNumber === 1) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
            } else if (colNumber === 3 || colNumber === 4) {
              cell.alignment = { horizontal: "right", vertical: "middle" };
            } else {
              cell.alignment = { horizontal: "left", vertical: "middle" };
            }
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });

        // Điều chỉnh độ rộng cột cho papers
        papersWorksheet.columns.forEach((column, index) => {
          let maxLength = paperHeaders[index] ? paperHeaders[index].length : 0;

          if (index === 0) {
            // STT
            column.width = 8;
          } else if (index === 1) {
            // Tên bài nghiên cứu
            topPapers.forEach((item) => {
              const length = item.title_vn ? item.title_vn.length : 0;
              if (length > maxLength) {
                maxLength = length;
              }
            });
            column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
          } else {
            // Lượt xem, Lượt tải
            const values =
              index === 2
                ? topPapers.map((item) => item.viewCount)
                : topPapers.map((item) => item.downloadCount);

            values.forEach((value) => {
              const length = value ? String(value).length : 0;
              if (length > maxLength) {
                maxLength = length;
              }
            });
            column.width = maxLength + 4;
          }
        });

        // Xuất file
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: "application/octet-stream" });
          const fileName = `Thong_Ke_Tong_Hop_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;
          saveAs(blob, fileName);
        });
      }

      setShowExportAllFilter(false);
    } catch (error) {
      console.error("Error exporting all charts:", error);
    }
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen overflow-x-hidden">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[100%] md:max-w-[calc(100%-120px)] lg:max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600 flex-wrap text-sm">
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

        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-4">
          {/* Loại bỏ div thừa này */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-row justify-center mx-auto flex-wrap gap-2 sm:gap-4 w-full lg:w-auto">
              <div
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[130px]"
                style={{
                  height: "55px",
                }}
              >
                <div className="text-base sm:text-lg font-bold text-gray-700 pt-2">
                  <CountUp end={stats.totalPapers} duration={2} />
                </div>
                <div className="text-gray-500 text-xs sm:text-sm pb-2">
                  Tổng bài báo
                </div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[130px]"
                style={{
                  height: "55px",
                }}
              >
                <div className="text-base sm:text-lg font-bold text-[#00A3FF] pt-2">
                  <CountUp end={stats.totalViews} duration={2} />
                </div>
                <div className="text-gray-500 pb-2 text-xs sm:text-sm">
                  Tổng lượt xem
                </div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[130px]"
                style={{
                  height: "55px",
                }}
              >
                <div className="text-base sm:text-lg font-bold text-[#FFB700] pt-2">
                  <CountUp end={stats.totalDownloads} duration={2} />
                </div>
                <div className="text-gray-500 pb-2 text-xs sm:text-sm">
                  Tổng lượt tải
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto flex justify-center lg:justify-end gap-2">
              {/* Thêm nút Tải tất cả */}
              <div className="relative" ref={exportAllFilterRef}>
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border bg-white h-[35px] text-sm"
                  onClick={() => setShowExportAllFilter(!showExportAllFilter)}
                >
                  <span className="text-sm">Tải tất cả</span>
                </button>
                {showExportAllFilter && (
                  <div
                    className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                    style={{ width: "150px", right: "0" }}
                  >
                    <div className="px-4 py-3 w-full">
                      <div
                        className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                        onClick={() => exportAllCharts("pdf")}
                      >
                        PDF
                      </div>
                      <div
                        className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                        onClick={() => exportAllCharts("excel")}
                      >
                        Excel
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <select
                className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-sm sm:text-base w-full sm:w-[110px]"
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

        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Statistics by Type */}
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  {getTypeChartTitle()}
                </h2>
                <div className="flex flex-wrap items-center gap-2 self-end">
                  <div className="relative" ref={typeChartFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowTypeChartFilter(!showTypeChartFilter)
                      }
                    >
                      <span className="text-xs">Loại biểu đồ</span>
                    </button>
                    {showTypeChartFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="bar"
                              checked={typeChartType === "bar"}
                              onChange={() =>
                                handleChartTypeChange("type", "bar")
                              }
                              className="mr-2"
                            />
                            Biểu đồ cột
                          </label>
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="doughnut"
                              checked={typeChartType === "doughnut"}
                              onChange={() =>
                                handleChartTypeChange("type", "doughnut")
                              }
                              className="mr-2"
                            />
                            Biểu đồ tròn
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
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
                  <div className="relative" ref={typeDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowTypeDownloadFilter(!showTypeDownloadFilter)
                      }
                    >
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showTypeDownloadFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "type",
                                "pdf",
                                typeChartRef,
                                filteredTypeChartData,
                                getTypeChartTitle()
                              )
                            }
                          >
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "type",
                                "excel",
                                typeChartRef,
                                filteredTypeChartData,
                                getTypeChartTitle()
                              )
                            }
                          >
                            Excel
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                ref={typeChartRef}
                className="w-full h-[200px] sm:h-[250px] flex items-center justify-center"
              >
                {hasTypeChartData ? (
                  typeChartType === "bar" ? (
                    <div className="w-full h-full">
                      <Bar
                        data={filteredTypeChartData}
                        options={getChartOptions(filteredTypeChartData, false)}
                        height={null}
                        width={null}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Doughnut
                        data={filteredTypeChartData}
                        options={donutOptions}
                        height={null}
                        width={null}
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Không có dữ liệu để hiển thị
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 Departments */}
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  Top 5 khoa có nhiều bài nghiên cứu
                </h2>
                <div className="flex flex-wrap items-center gap-2 self-end">
                  <div className="relative" ref={departmentChartFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowDepartmentChartFilter(!showDepartmentChartFilter)
                      }
                    >
                      <span className="text-xs">Loại biểu đồ</span>
                    </button>
                    {showDepartmentChartFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="bar"
                              checked={departmentChartType === "bar"}
                              onChange={() =>
                                handleChartTypeChange("department", "bar")
                              }
                              className="mr-2"
                            />
                            Biểu đồ cột
                          </label>
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="doughnut"
                              checked={departmentChartType === "doughnut"}
                              onChange={() =>
                                handleChartTypeChange("department", "doughnut")
                              }
                              className="mr-2"
                            />
                            Biểu đồ tròn
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
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
                            {departmentChartData.originalLabels.map((label) => (
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
                  <div className="relative" ref={departmentDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowDepartmentDownloadFilter(
                          !showDepartmentDownloadFilter
                        )
                      }
                    >
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showDepartmentDownloadFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "department",
                                "pdf",
                                departmentChartRef,
                                filteredDepartmentChartData,
                                "Top 5 khoa có nhiều bài nghiên cứu"
                              )
                            }
                          >
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "department",
                                "excel",
                                departmentChartRef,
                                filteredDepartmentChartData,
                                "Top 5 khoa có nhiều bài nghiên cứu"
                              )
                            }
                          >
                            Excel
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                ref={departmentChartRef}
                className="w-full h-[200px] sm:h-[250px] flex items-center justify-center"
              >
                {hasDepartmentChartData ? (
                  departmentChartType === "bar" ? (
                    <div className="w-full h-full">
                      <Bar
                        data={filteredDepartmentChartData}
                        options={getChartOptions(
                          filteredDepartmentChartData,
                          false
                        )}
                        height={null}
                        width={null}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Doughnut
                        data={filteredDepartmentChartData}
                        options={donutOptions}
                        height={null}
                        width={null}
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Không có dữ liệu để hiển thị
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 Fields */}
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  Top 5 lĩnh vực có nhiều bài nghiên cứu
                </h2>
                <div className="flex flex-wrap items-center gap-2 self-end">
                  <div className="relative" ref={fieldChartFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowFieldChartFilter(!showFieldChartFilter)
                      }
                    >
                      <span className="text-xs">Loại biểu đồ</span>
                    </button>
                    {showFieldChartFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="bar"
                              checked={fieldChartType === "bar"}
                              onChange={() =>
                                handleChartTypeChange("field", "bar")
                              }
                              className="mr-2"
                            />
                            Biểu đồ cột
                          </label>
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="doughnut"
                              checked={fieldChartType === "doughnut"}
                              onChange={() =>
                                handleChartTypeChange("field", "doughnut")
                              }
                              className="mr-2"
                            />
                            Biểu đồ tròn
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
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
                  <div className="relative" ref={fieldDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowFieldDownloadFilter(!showFieldDownloadFilter)
                      }
                    >
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showFieldDownloadFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "field",
                                "pdf",
                                fieldChartRef,
                                filteredDonutChartData,
                                "Top 5 lĩnh vực có nhiều bài nghiên cứu"
                              )
                            }
                          >
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "field",
                                "excel",
                                fieldChartRef,
                                filteredDonutChartData,
                                "Top 5 lĩnh vực có nhiều bài nghiên cứu"
                              )
                            }
                          >
                            Excel
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                ref={fieldChartRef}
                className="w-full h-[200px] sm:h-[250px] flex items-center justify-center"
              >
                {hasFieldChartData ? (
                  fieldChartType === "doughnut" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Doughnut
                        data={filteredDonutChartData}
                        options={donutOptions}
                        height={null}
                        width={null}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      <Bar
                        data={filteredDonutChartData}
                        options={getChartOptions(filteredDonutChartData, false)}
                        height={null}
                        width={null}
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Không có dữ liệu để hiển thị
                  </div>
                )}
              </div>
            </div>

            {/* Top 5 Papers Table */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  Top 5 bài nghiên cứu được xem nhiều nhất và tải nhiều nhất
                </h2>
                <div className="flex items-center gap-2 self-end">
                  <div className="relative" ref={tableExportRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() => setShowTableExport(!showTableExport)}
                    >
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showTableExport && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              exportTableToExcel(topPapers, "Top_5_Papers")
                            }
                          >
                            Excel
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={printTopPapersTable}
                          >
                            PDF
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                {topPapers.length > 0 ? (
                  <Table
                    columns={columns}
                    dataSource={topPapers}
                    pagination={false}
                    rowKey="_id"
                    onRow={onRowClick}
                    className="papers-table"
                    rowClassName="cursor-pointer"
                    size="small"
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                    Không có dữ liệu để hiển thị.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
