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
import {
  DownloadOutlined,
  FilterOutlined,
  BarChartOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ExportOutlined,
} from "@ant-design/icons";

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

// Register ChartJS components
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

// Hàm tính toán options cho biểu đồ
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
        size: 12,
        weight: "bold",
      },
      formatter: (value) => value,
    },
  },
  cutout: 0,
};

const ManagementDepartmentChart = () => {
  const [selectedQuarters, setSelectedQuarters] = useState(["All"]);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedFields, setSelectedFields] = useState(["All"]);
  const [showFieldFilter, setShowFieldFilter] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState(["All"]);
  const [showAuthorFilter, setShowAuthorFilter] = useState(false);
  const [typeChartType, setTypeChartType] = useState("bar");
  const [authorChartType, setAuthorChartType] = useState("bar");
  const [fieldChartType, setFieldChartType] = useState("doughnut");
  const [showTypeChartFilter, setShowTypeChartFilter] = useState(false);
  const [showAuthorChartFilter, setShowAuthorChartFilter] = useState(false);
  const [showFieldChartFilter, setShowFieldChartFilter] = useState(false);
  const [showTypeDownloadFilter, setShowTypeDownloadFilter] = useState(false);
  const [showAuthorDownloadFilter, setShowAuthorDownloadFilter] =
    useState(false);
  const [showFieldDownloadFilter, setShowFieldDownloadFilter] = useState(false);
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
        backgroundColor: [],
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
        backgroundColor: [],
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
        backgroundColor: [],
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
  const typeChartFilterRef = useRef(null);
  const authorChartFilterRef = useRef(null);
  const fieldChartFilterRef = useRef(null);
  const typeDownloadFilterRef = useRef(null);
  const authorDownloadFilterRef = useRef(null);
  const fieldDownloadFilterRef = useRef(null);
  const typeChartRef = useRef(null);
  const authorChartRef = useRef(null);
  const fieldChartRef = useRef(null);
  const navigate = useNavigate();
  const departmentId = localStorage.getItem("department");

  // Thêm biến state để kiểm soát dropdown xuất file
  const [showTableExport, setShowTableExport] = useState(false);
  const tableExportRef = useRef(null);

  // Thêm state và ref cho nút Tải tất cả
  const [showExportAllFilter, setShowExportAllFilter] = useState(false);
  const exportAllFilterRef = useRef(null);

  // Thêm các hàm xuất file
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
      titleCell.value = title || "Top 5 bài nghiên cứu được nổi bật";
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
        const rowData = [index + 1, item.title, item.views, item.downloads];

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
            const length = item.title ? item.title.length : 0;
            if (length > maxLength) {
              maxLength = length;
            }
          });
          column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
        } else {
          // Lượt xem, Lượt tải
          const values =
            index === 2
              ? data.map((item) => item.views)
              : data.map((item) => item.downloads);

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
        pdf.text(`Tên bài nghiên cứu: ${item.title}`, 10, y + 10);
        pdf.text(`Lượt xem: ${item.views}`, 10, y + 20);
        pdf.text(`Lượt tải: ${item.downloads}`, 10, y + 30);
        y += 40;
      });

      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await userApi.getStatisticsByDepartmentId(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear
        );
        setStats({
          totalPapers: data.total_papers ?? 0,
          totalViews: data.total_views ?? 0,
          totalDownloads: data.total_downloads ?? 0,
        });
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      }
    };
    if (departmentId) fetchStatistics();
  }, [departmentId, selectedYear]);

  useEffect(() => {
    const fetchTopPapers = async () => {
      try {
        const response =
          await userApi.getTop5MostViewedAndDownloadedPapersByDepartment(
            departmentId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
        if (response && response.papers && response.papers.length > 0) {
          const formattedPapers = response.papers.map((paper, index) => ({
            id: index + 1,
            _id: paper._id,
            title: paper.title_vn,
            views: paper.viewCount,
            downloads: paper.downloadCount,
          }));
          setTopPapers(formattedPapers);
        } else {
          setTopPapers([]);
        }
      } catch (error) {
        console.error("Failed to fetch top papers:", error);
        setTopPapers([]);
      }
    };
    if (departmentId) fetchTopPapers();
  }, [departmentId, selectedYear]);

  useEffect(() => {
    const fetchTypeStatistics = async () => {
      try {
        const response = await userApi.getStatisticsByGroupByDepartment(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear
        );
        if (
          response &&
          response.data &&
          Object.keys(response.data).length > 0
        ) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#FF0000", "#FFC700"][index % 5]
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
        console.error("Failed to fetch type statistics:", error);
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
    if (departmentId) fetchTypeStatistics();
  }, [departmentId, selectedYear]);

  useEffect(() => {
    const fetchTopContributors = async () => {
      try {
        const response = await userApi.getTop5AuthorsByDepartment(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear
        );
        if (response && response.data && response.data.length > 0) {
          const labels = response.data.map((author) => author.authorName);
          const data = response.data.map((author) => author.totalPoints);
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#FF0000", "#FFC700"][index % 5]
          );

          // Cải thiện hiển thị labels cho biểu đồ cột - giới hạn độ dài và thêm dấu "..."
          const formattedLabels = labels.map((label) =>
            label.length > 8 ? label.substring(0, 8) + "..." : label
          );

          setOriginalContributorsData({ labels, data });
          setTopContributorsChartData({
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
          setSelectedAuthors(["All", ...labels]);
        } else {
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
        console.error("Failed to fetch top contributors:", error);
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
    if (departmentId) fetchTopContributors();
  }, [departmentId, selectedYear, authorChartType]);

  useEffect(() => {
    const fetchTopResearchFields = async () => {
      try {
        const response = await userApi.getStatisticsTop5ByTypeByDepartment(
          departmentId,
          selectedYear === "Tất cả" ? null : selectedYear
        );
        if (
          response &&
          response.data &&
          Object.keys(response.data).length > 0
        ) {
          const labels = Object.keys(response.data);
          const data = Object.values(response.data);

          // Tạo mảng màu có nhiều hơn 5 màu và đảm bảo mỗi màu là duy nhất
          const colors = [
            "#00A3FF",
            "#7239EA",
            "#F1416C",
            "#FF0000",
            "#FFC700",
            "#50B83C",
            "#9C6ADE",
            "#47C1BF",
            "#5C6AC4",
            "#F49342",
            "#DE3618",
            "#00848E",
            "#8A8A8A",
            "#006EFF",
            "#9C27B0",
          ];

          // Sử dụng các màu khác nhau cho mỗi lĩnh vực
          const backgroundColor = labels.map(
            (_, index) => colors[index % colors.length]
          );

          const formattedLabels =
            fieldChartType === "bar"
              ? labels.map((label) =>
                  label.length > 10 ? label.substring(0, 10) + "..." : label
                )
              : labels;

          setOriginalResearchFieldsData({ labels, data });
          setTopResearchFieldsChartData({
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
          setSelectedFields(["All", ...labels]);
        } else {
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
        console.error("Failed to fetch top research fields:", error);
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
    if (departmentId) fetchTopResearchFields();
  }, [departmentId, selectedYear, fieldChartType]);

  // Lọc dữ liệu biểu đồ
  const filteredTypeChartData = {
    labels: selectedQuarters.includes("All")
      ? typeChartData.labels.filter(
          (_, index) => typeChartData.datasets[0].data[index] > 0
        )
      : typeChartData.labels.filter(
          (label, index) =>
            selectedQuarters.includes(label) &&
            typeChartData.datasets[0].data[index] > 0
        ),
    datasets: [
      {
        ...typeChartData.datasets[0],
        data: selectedQuarters.includes("All")
          ? typeChartData.datasets[0].data.filter((value) => value > 0)
          : typeChartData.datasets[0].data.filter(
              (value, index) =>
                selectedQuarters.includes(typeChartData.labels[index]) &&
                value > 0
            ),
        backgroundColor: selectedQuarters.includes("All")
          ? typeChartData.datasets[0].backgroundColor.filter(
              (_, index) => typeChartData.datasets[0].data[index] > 0
            )
          : typeChartData.datasets[0].backgroundColor.filter(
              (_, index) =>
                selectedQuarters.includes(typeChartData.labels[index]) &&
                typeChartData.datasets[0].data[index] > 0
            ),
      },
    ],
  };

  const filteredContributorsChartData = {
    labels: selectedAuthors.includes("All")
      ? topContributorsChartData.labels.filter(
          (_, index) => topContributorsChartData.datasets[0].data[index] > 0
        )
      : topContributorsChartData.labels.filter(
          (_, index) =>
            selectedAuthors.includes(
              topContributorsChartData.originalLabels[index]
            ) && topContributorsChartData.datasets[0].data[index] > 0
        ),
    datasets: [
      {
        ...topContributorsChartData.datasets[0],
        data: selectedAuthors.includes("All")
          ? topContributorsChartData.datasets[0].data.filter(
              (value) => value > 0
            )
          : topContributorsChartData.datasets[0].data.filter(
              (value, index) =>
                selectedAuthors.includes(
                  topContributorsChartData.originalLabels[index]
                ) && value > 0
            ),
        backgroundColor: selectedAuthors.includes("All")
          ? topContributorsChartData.datasets[0].backgroundColor.filter(
              (_, index) => topContributorsChartData.datasets[0].data[index] > 0
            )
          : topContributorsChartData.datasets[0].backgroundColor.filter(
              (_, index) =>
                selectedAuthors.includes(
                  topContributorsChartData.originalLabels[index]
                ) && topContributorsChartData.datasets[0].data[index] > 0
            ),
      },
    ],
    originalLabels: selectedAuthors.includes("All")
      ? topContributorsChartData.originalLabels.filter(
          (_, index) => topContributorsChartData.datasets[0].data[index] > 0
        )
      : topContributorsChartData.originalLabels.filter(
          (label, index) =>
            selectedAuthors.includes(label) &&
            topContributorsChartData.datasets[0].data[index] > 0
        ),
  };

  const filteredFieldsChartData = {
    labels: selectedFields.includes("All")
      ? topResearchFieldsChartData.labels.filter(
          (_, index) => topResearchFieldsChartData.datasets[0].data[index] > 0
        )
      : topResearchFieldsChartData.labels.filter(
          (label, index) =>
            selectedFields.includes(label) &&
            topResearchFieldsChartData.datasets[0].data[index] > 0
        ),
    datasets: [
      {
        ...topResearchFieldsChartData.datasets[0],
        data: selectedFields.includes("All")
          ? topResearchFieldsChartData.datasets[0].data.filter(
              (value) => value > 0
            )
          : topResearchFieldsChartData.datasets[0].data.filter(
              (value, index) =>
                selectedFields.includes(
                  topResearchFieldsChartData.labels[index]
                ) && value > 0
            ),
        backgroundColor: selectedFields.includes("All")
          ? topResearchFieldsChartData.datasets[0].backgroundColor.filter(
              (_, index) =>
                topResearchFieldsChartData.datasets[0].data[index] > 0
            )
          : topResearchFieldsChartData.datasets[0].backgroundColor.filter(
              (_, index) =>
                selectedFields.includes(
                  topResearchFieldsChartData.labels[index]
                ) && topResearchFieldsChartData.datasets[0].data[index] > 0
            ),
      },
    ],
    originalLabels: selectedFields.includes("All")
      ? topResearchFieldsChartData.originalLabels?.filter(
          (_, index) => topResearchFieldsChartData.datasets[0].data[index] > 0
        )
      : topResearchFieldsChartData.originalLabels?.filter(
          (label, index) =>
            selectedFields.includes(topResearchFieldsChartData.labels[index]) &&
            topResearchFieldsChartData.datasets[0].data[index] > 0
        ),
  };

  const handleQuarterChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      setSelectedQuarters(
        selectedQuarters.includes("All") ? [] : ["All", ...typeChartData.labels]
      );
    } else {
      const newSelected = selectedQuarters.includes(value)
        ? selectedQuarters.filter((item) => item !== value && item !== "All")
        : [...selectedQuarters.filter((item) => item !== "All"), value];
      setSelectedQuarters(
        newSelected.length === typeChartData.labels.length
          ? ["All", ...typeChartData.labels]
          : newSelected
      );
    }
  };

  const handleFieldChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      setSelectedFields(
        selectedFields.includes("All")
          ? []
          : ["All", ...originalResearchFieldsData.labels]
      );
    } else {
      const newSelected = selectedFields.includes(value)
        ? selectedFields.filter((item) => item !== value && item !== "All")
        : [...selectedFields.filter((item) => item !== "All"), value];
      setSelectedFields(
        newSelected.length === originalResearchFieldsData.labels.length
          ? ["All", ...originalResearchFieldsData.labels]
          : newSelected
      );
    }
  };

  const handleAuthorChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      setSelectedAuthors(
        selectedAuthors.includes("All")
          ? []
          : ["All", ...originalContributorsData.labels]
      );
    } else {
      const newSelected = selectedAuthors.includes(value)
        ? selectedAuthors.filter((item) => item !== value && item !== "All")
        : [...selectedAuthors.filter((item) => item !== "All"), value];
      setSelectedAuthors(
        newSelected.length === originalContributorsData.labels.length
          ? ["All", ...originalContributorsData.labels]
          : newSelected
      );
    }
  };

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
    if (
      typeChartFilterRef.current &&
      !typeChartFilterRef.current.contains(event.target)
    ) {
      setShowTypeChartFilter(false);
    }
    if (
      authorChartFilterRef.current &&
      !authorChartFilterRef.current.contains(event.target)
    ) {
      setShowAuthorChartFilter(false);
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
      authorDownloadFilterRef.current &&
      !authorDownloadFilterRef.current.contains(event.target)
    ) {
      setShowAuthorDownloadFilter(false);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasTypeChartData =
    selectedQuarters.length > 0 &&
    filteredTypeChartData.datasets[0].data.some((value) => value > 0);

  const hasContributorsChartData =
    selectedAuthors.length > 0 &&
    filteredContributorsChartData.datasets[0].data.some((value) => value > 0);

  const hasFieldsChartData =
    selectedFields.length > 0 &&
    filteredFieldsChartData.datasets[0].data.some((value) => value > 0);

  const hasTopPapersData = topPapers.length > 0;

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
          {
            text: data.datasets[0].data[index].toString(),
            style: "tableCell",
          },
        ];
      });

      // Định nghĩa cấu trúc PDF
      const docDefinition = {
        content: [
          { text: title, style: "header" },
          { image: imgData, width: 500, margin: [0, 20] },
          {
            text: "Dữ liệu chi tiết",
            style: "subheader",
            pageBreak: "before",
          },
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

  const pdfTopPapersTable = () => {
    try {
      // Chuẩn bị dữ liệu cho bảng top papers
      const papersTableBody = topPapers.map((paper, index) => [
        { text: (index + 1).toString(), style: "tableCell" },
        { text: paper.title || "", style: "tableCell" },
        { text: paper.views.toString() || "0", style: "tableCell" },
        { text: paper.downloads.toString() || "0", style: "tableCell" },
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

          // Top 5 papers
          {
            text: "TOP 5 BÀI NGHIÊN CỨU ĐƯỢC NỔI BẬT",
            style: "header",
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
          `Top_5_Bai_Nghien_Cuu_Noi_Bat_${new Date()
            .toLocaleDateString("vi-VN")
            .replace(/\//g, "_")}.pdf`
        );
    } catch (error) {
      console.error("Error generating PDF for top papers table:", error);
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
    } else if (chartSection === "author") {
      setShowAuthorDownloadFilter(false);
    } else if (chartSection === "field") {
      setShowFieldDownloadFilter(false);
    }
  };

  const handleChartTypeChange = (chartSection, type) => {
    if (chartSection === "type") {
      setTypeChartType(type);
      setShowTypeChartFilter(false);
    } else if (chartSection === "author") {
      setAuthorChartType(type);
      setShowAuthorChartFilter(false);
    } else if (chartSection === "field") {
      setFieldChartType(type);
      setShowFieldChartFilter(false);
    }
  };

  const handleDownload = (chartType, format, chartRef, data, title) => {
    if (format === "pdf") {
      generatePDF(chartRef, title, data);
    } else if (format === "excel") {
      generateExcel(data, title);
    }
  };

  // Sửa lại hàm xuất tất cả biểu đồ để tạo một file duy nhất
  const exportAllCharts = async (format) => {
    try {
      if (format === "pdf") {
        // Capture các biểu đồ thành ảnh
        const typeCanvas = await html2canvas(typeChartRef.current, {
          scale: 2,
        });
        const typeImgData = typeCanvas.toDataURL("image/png");

        const authorCanvas = await html2canvas(authorChartRef.current, {
          scale: 2,
        });
        const authorImgData = authorCanvas.toDataURL("image/png");

        const fieldCanvas = await html2canvas(fieldChartRef.current, {
          scale: 2,
        });
        const fieldImgData = fieldCanvas.toDataURL("image/png");

        // Chuẩn bị dữ liệu cho bảng loại
        const typeTableBody = filteredTypeChartData.labels.map(
          (label, index) => {
            return [
              { text: label, style: "tableCell" },
              {
                text: filteredTypeChartData.datasets[0].data[index].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng tác giả
        const authorTableBody = filteredContributorsChartData.labels.map(
          (label, index) => {
            // Sử dụng tên đầy đủ từ originalLabels nếu có
            const fullLabel = filteredContributorsChartData.originalLabels
              ? filteredContributorsChartData.originalLabels[index] || label
              : label;
            return [
              { text: fullLabel, style: "tableCell" },
              {
                text: filteredContributorsChartData.datasets[0].data[
                  index
                ].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng lĩnh vực
        const fieldTableBody = filteredFieldsChartData.labels.map(
          (label, index) => {
            // Sử dụng tên đầy đủ từ originalLabels nếu có
            const fullLabel = filteredFieldsChartData.originalLabels
              ? filteredFieldsChartData.originalLabels[index] || label
              : label;
            return [
              { text: fullLabel, style: "tableCell" },
              {
                text: filteredFieldsChartData.datasets[0].data[
                  index
                ].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng top papers
        const papersTableBody = topPapers.map((paper, index) => [
          { text: (index + 1).toString(), style: "tableCell" },
          { text: paper.title || "", style: "tableCell" },
          { text: paper.views.toString() || "0", style: "tableCell" },
          { text: paper.downloads.toString() || "0", style: "tableCell" },
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

            // Top 5 tác giả
            {
              text: "2. TOP 5 TÁC GIẢ CÓ ĐIỂM ĐÓNG GÓP",
              style: "header",
              pageBreak: "before",
            },
            { image: authorImgData, width: 500, margin: [0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Tên tác giả", style: "tableHeader" },
                    { text: "Điểm đóng góp", style: "tableHeader" },
                  ],
                  ...authorTableBody,
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
              text: "4. TOP 5 BÀI NGHIÊN CỨU ĐƯỢC NỔI BẬT",
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
            `Thong_Ke_Khoa_${new Date()
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
        const typeLabels = filteredTypeChartData.labels || [];
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

        // Worksheet cho top 5 tác giả
        const authorWorksheet = workbook.addWorksheet("Top 5 tác giả");
        const authorLabels =
          filteredContributorsChartData.originalLabels ||
          filteredContributorsChartData.labels ||
          [];
        const authorValues =
          filteredContributorsChartData.datasets[0]?.data || [];

        addHeaderSystem(authorWorksheet);
        addWorksheetHeader(authorWorksheet, "Top 5 tác giả có điểm đóng góp");
        addDataToWorksheet(authorWorksheet, authorLabels, authorValues);

        // Worksheet cho top 5 lĩnh vực
        const fieldWorksheet = workbook.addWorksheet("Top 5 lĩnh vực");
        const fieldLabels =
          filteredFieldsChartData.originalLabels ||
          filteredFieldsChartData.labels ||
          [];
        const fieldValues = filteredFieldsChartData.datasets[0]?.data || [];

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
          "Top 5 bài nghiên cứu được nổi bật"
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
            paper.title,
            paper.views,
            paper.downloads,
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
              const length = item.title ? item.title.length : 0;
              if (length > maxLength) {
                maxLength = length;
              }
            });
            column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
          } else {
            // Lượt xem, Lượt tải
            const values =
              index === 2
                ? topPapers.map((item) => item.views)
                : topPapers.map((item) => item.downloads);

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
          const fileName = `Thong_Ke_Khoa_${new Date()
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
      width: 90,
      render: (text) => (
        <span className="text-blue-500 font-medium">{text}</span>
      ),
    },
    {
      title: "Lượt tải",
      dataIndex: "downloads",
      key: "downloads",
      width: 90,
      render: (text) => (
        <span className="text-amber-500 font-medium">{text}</span>
      ),
    },
  ];

  const onRowClick = (record) => {
    return {
      onClick: () => navigate(`/scientific-paper/${record._id}`),
      style: { cursor: "pointer" },
      className: "hover:bg-blue-50 transition-colors duration-200",
    };
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen overflow-x-hidden">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[100%] md:max-w-[calc(100%-120px)] lg:max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600 flex-wrap text-xs sm:text-sm">
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
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-row justify-center mx-auto flex-wrap gap-2 sm:gap-4 w-full lg:w-auto">
              <div
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[130px]"
                style={{
                  height: "55px",
                }}
              >
                <div className="text-base sm:text-lg font-bold text-gray-700 pt-2">
                  <CountUp end={stats.totalPapers ?? 0} duration={2} />
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
                  <CountUp
                    end={stats.totalViews ?? 0}
                    duration={2}
                    separator=","
                  />
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
                  <CountUp
                    end={stats.totalDownloads ?? 0}
                    duration={2}
                    separator=","
                  />
                </div>
                <div className="text-gray-500 pb-2 text-xs sm:text-sm">
                  Tổng lượt tải
                </div>
              </div>
            </div>
            <div className="w-full lg:w-auto flex justify-center lg:justify-end gap-2 flex-wrap sm:flex-nowrap">
              {/* Thêm nút Tải tất cả */}
              <div className="relative" ref={exportAllFilterRef}>
                <button
                  className="flex items-center justify-center gap-2 text-gray-600 px-2 py-1 rounded-lg border bg-white h-[35px] text-sm w-full sm:w-auto min-w-[100px]"
                  onClick={() => setShowExportAllFilter(!showExportAllFilter)}
                >
                  <DownloadOutlined className="text-blue-500" />
                  <span className="text-sm whitespace-nowrap">Tải tất cả</span>
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
                        <FilePdfOutlined className="text-red-500 mr-1" />
                        PDF
                      </div>
                      <div
                        className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                        onClick={() => exportAllCharts("excel")}
                      >
                        <FileExcelOutlined className="text-green-500 mr-1" />
                        Excel
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <select
                className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-sm min-w-[100px]"
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
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
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
                      <BarChartOutlined className="text-blue-500" />
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
                      <FilterOutlined className="text-blue-500" />
                      <span className="text-xs">Bộ lọc</span>
                    </button>
                    {showFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "200px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
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
                                  checked={selectedQuarters.includes(quarter)}
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
                  <div className="relative" ref={typeDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowTypeDownloadFilter(!showTypeDownloadFilter)
                      }
                    >
                      <DownloadOutlined className="text-blue-500" />
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
                            <FilePdfOutlined className="text-red-500 mr-1" />
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
                            <FileExcelOutlined className="text-green-600 mr-1" />
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

            {/* Top 5 Contributors */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  Top 5 tác giả có điểm đóng góp
                </h2>
                <div className="flex flex-wrap items-center gap-2 self-end">
                  <div className="relative" ref={authorChartFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowAuthorChartFilter(!showAuthorChartFilter)
                      }
                    >
                      <BarChartOutlined className="text-blue-500" />
                      <span className="text-xs">Loại biểu đồ</span>
                    </button>
                    {showAuthorChartFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="bar"
                              checked={authorChartType === "bar"}
                              onChange={() =>
                                handleChartTypeChange("author", "bar")
                              }
                              className="mr-2"
                            />
                            Biểu đồ cột
                          </label>
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="doughnut"
                              checked={authorChartType === "doughnut"}
                              onChange={() =>
                                handleChartTypeChange("author", "doughnut")
                              }
                              className="mr-2"
                            />
                            Biểu đồ tròn
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={authorFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() => setShowAuthorFilter(!showAuthorFilter)}
                    >
                      <FilterOutlined className="text-blue-500" />
                      <span className="text-xs">Bộ lọc</span>
                    </button>
                    {showAuthorFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "250px", right: "0" }}
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
                                  checked={selectedAuthors.includes(author)}
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
                  <div className="relative" ref={authorDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowAuthorDownloadFilter(!showAuthorDownloadFilter)
                      }
                    >
                      <DownloadOutlined className="text-blue-500" />
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showAuthorDownloadFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "author",
                                "pdf",
                                authorChartRef,
                                filteredContributorsChartData,
                                "Top 5 tác giả có điểm đóng góp"
                              )
                            }
                          >
                            <FilePdfOutlined className="text-red-500 mr-1" />
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "author",
                                "excel",
                                authorChartRef,
                                filteredContributorsChartData,
                                "Top 5 tác giả có điểm đóng góp"
                              )
                            }
                          >
                            <FileExcelOutlined className="text-green-600 mr-1" />
                            Excel
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div
                ref={authorChartRef}
                className="w-full h-[200px] sm:h-[250px] flex items-center justify-center"
              >
                {hasContributorsChartData ? (
                  authorChartType === "bar" ? (
                    <div className="w-full h-full">
                      <Bar
                        data={filteredContributorsChartData}
                        options={getChartOptions(
                          filteredContributorsChartData,
                          false
                        )}
                        height={null}
                        width={null}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Doughnut
                        data={filteredContributorsChartData}
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

            {/* Top 5 Research Fields */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
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
                      <BarChartOutlined className="text-blue-500" />
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
                      <FilterOutlined className="text-blue-500" />
                      <span className="text-xs">Bộ lọc</span>
                    </button>
                    {showFieldFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "250px", right: "0" }}
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
                            Tất cả
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
                                  checked={selectedFields.includes(field)}
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
                  <div className="relative" ref={fieldDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowFieldDownloadFilter(!showFieldDownloadFilter)
                      }
                    >
                      <DownloadOutlined className="text-blue-500" />
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
                                filteredFieldsChartData,
                                "Top 5 lĩnh vực có nhiều bài nghiên cứu"
                              )
                            }
                          >
                            <FilePdfOutlined className="text-red-500 mr-1" />
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "field",
                                "excel",
                                fieldChartRef,
                                filteredFieldsChartData,
                                "Top 5 lĩnh vực có nhiều bài nghiên cứu"
                              )
                            }
                          >
                            <FileExcelOutlined className="text-green-600 mr-1" />
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
                {hasFieldsChartData ? (
                  fieldChartType === "doughnut" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Doughnut
                        data={filteredFieldsChartData}
                        options={donutOptions}
                        height={null}
                        width={null}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full">
                      <Bar
                        data={filteredFieldsChartData}
                        options={getChartOptions(
                          filteredFieldsChartData,
                          false
                        )}
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

            {/* Top 5 Papers */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-700">
                  Top 5 bài nghiên cứu được nổi bật
                </h2>
                <div className="flex gap-2">
                  <div className="relative" ref={tableExportRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() => setShowTableExport(!showTableExport)}
                    >
                      <DownloadOutlined className="text-blue-500" />
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
                            onClick={pdfTopPapersTable}
                          >
                            <FilePdfOutlined className="text-red-500 mr-1" />
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              exportTableToExcel(
                                topPapers,
                                "Top 5 bài nghiên cứu được nổi bật"
                              )
                            }
                          >
                            <FileExcelOutlined className="text-green-600 mr-1" />
                            Excel
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
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
                    scroll={{ x: "max-content" }}
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
      </div>
      <Footer />
    </div>
  );
};

export default ManagementDepartmentChart;
