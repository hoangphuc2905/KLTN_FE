import Header from "../../../components/Header";
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
import { Table, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";
import { useEffect, useState, useRef } from "react";
import CountUp from "react-countup";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import Footer from "../../../components/Footer";
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

// Hàm tính toán options cho biểu đồ dựa trên dữ liệu thực tế
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
          autoSkip: false, // Không bỏ qua nhãn
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

const columns = [
  {
    title: "STT",
    dataIndex: "id",
    key: "id",
    render: (_, __, index) => index + 1,
    width: 40,
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
          maxWidth: "200px",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={text}
      >
        {text}
      </div>
    ),
    width: 100,
  },
  {
    title: "Lượt xem",
    dataIndex: "views",
    key: "views",
    width: 80,
    render: (text) => <span className="text-blue-500 font-medium">{text}</span>,
  },
  {
    title: "Lượt tải",
    dataIndex: "downloads",
    key: "downloads",
    width: 70,
    render: (text) => (
      <span className="text-amber-500 font-medium">{text}</span>
    ),
  },
  {
    title: "Điểm đóng góp",
    dataIndex: "contributions",
    key: "contributions",
    width: 120,
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
  const [selectedTypeFilters, setSelectedTypeFilters] = useState(["All"]);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [typeCounts, setTypeCounts] = useState({});
  const [typeChartType, setTypeChartType] = useState("bar");
  const [showTypeChartFilter, setShowTypeChartFilter] = useState(false);
  const [showTypeDownloadFilter, setShowTypeDownloadFilter] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );
  const [showPointFilter, setShowPointFilter] = useState(false);
  const [selectedPointFilters, setSelectedPointFilters] = useState(["All"]);
  const [pointChartType, setPointChartType] = useState("bar");
  const [showPointChartFilter, setShowPointChartFilter] = useState(false);
  const [showPointDownloadFilter, setShowPointDownloadFilter] = useState(false);
  const [pointChartData, setPointChartData] = useState({
    labels: [],
    originalLabels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#00A3FF",
          "#7239EA",
          "#F1416C",
          "#39eaa3",
          "#FFB700",
          "#50B83C",
          "#9C6ADE",
          "#47C1BF",
          "#5C6AC4",
          "#F49342",
        ],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  });

  const [showDonutFilter, setShowDonutFilter] = useState(false);
  const [selectedDonutFilters, setSelectedDonutFilters] = useState(["All"]);
  const [donutChartType, setDonutChartType] = useState("doughnut");
  const [showDonutChartFilter, setShowDonutChartFilter] = useState(false);
  const [showDonutDownloadFilter, setShowDonutDownloadFilter] = useState(false);
  const [donutChartData, setDonutChartData] = useState({
    labels: [],
    originalLabels: [],
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
          "#50B83C",
          "#9C6ADE",
          "#47C1BF",
          "#5C6AC4",
          "#F49342",
        ],
        borderWidth: 0,
      },
    ],
  });

  const userId = localStorage.getItem("user_id");
  const [totalPapers, setTotalPapers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [top5Papers, setTop5Papers] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");

  // Refs for click outside handling
  const typeFilterRef = useRef(null);
  const pointFilterRef = useRef(null);
  const donutFilterRef = useRef(null);
  const typeChartFilterRef = useRef(null);
  const pointChartFilterRef = useRef(null);
  const donutChartFilterRef = useRef(null);
  const typeDownloadFilterRef = useRef(null);
  const pointDownloadFilterRef = useRef(null);
  const donutDownloadFilterRef = useRef(null);
  const typeChartRef = useRef(null);
  const pointChartRef = useRef(null);
  const donutChartRef = useRef(null);

  // Thêm state cho nút Tải tất cả
  const [showExportAllFilter, setShowExportAllFilter] = useState(false);
  const exportAllFilterRef = useRef(null);

  // Thêm state để kiểm soát dropdown xuất file bảng
  const [showTableExport, setShowTableExport] = useState(false);
  const tableExportRef = useRef(null);

  // Thêm các hàm xuất file bảng
  const exportTableToExcel = (data, title) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Báo cáo");

      const headers = [
        "STT",
        "Tên bài nghiên cứu",
        "Lượt xem",
        "Lượt tải",
        "Điểm đóng góp",
      ];

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
        title || "BÁO CÁO DANH SÁCH BÀI BÁO NGHIÊN CỨU KHOA HỌC";
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
          item.title,
          item.views,
          item.downloads,
          item.contributions,
        ];

        const row = worksheet.addRow(rowData);
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Times New Roman", size: 12 };
          if (colNumber === 1) {
            cell.alignment = { horizontal: "center", vertical: "middle" };
          } else if (colNumber >= 3 && colNumber <= 5) {
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
        let maxLength = Math.max(headers[index] ? headers[index].length : 0);
        data.forEach((item, rowIndex) => {
          let value;
          switch (index) {
            case 0:
              value = String(rowIndex + 1);
              break;
            case 1:
              value = item.title;
              break;
            case 2:
              value = String(item.views);
              break;
            case 3:
              value = String(item.downloads);
              break;
            case 4:
              value = String(item.contributions);
              break;
            default:
              value = "";
          }
          if (value) {
            maxLength = Math.max(maxLength, String(value).length);
          }
        });
        column.width = maxLength + 4;
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
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Tiêu đề hệ thống
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      const systemTitle =
        "HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC\nCỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM";
      pdf.text(systemTitle, pageWidth / 2, 15, { align: "center" });

      // Ngày tạo
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Ngày tạo: ${formattedDate}`, 10, 35);

      // Tiêu đề báo cáo
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text(
        title || "BÁO CÁO DANH SÁCH BÀI BÁO NGHIÊN CỨU KHOA HỌC",
        pageWidth / 2,
        45,
        { align: "center" }
      );

      // Định dạng bảng dữ liệu
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const headers = [
        ["STT", "Tên bài nghiên cứu", "Lượt xem", "Lượt tải", "Điểm đóng góp"],
      ];
      const tableData = data.map((item, index) => [
        index + 1,
        item.title,
        item.views,
        item.downloads,
        item.contributions,
      ]);

      // Độ rộng cột tự động điều chỉnh
      const colWidths = [10, 100, 20, 20, 30];

      // Vẽ bảng
      pdf.autoTable({
        head: headers,
        body: tableData,
        startY: 55,
        columnStyles: {
          0: { halign: "center" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
        headStyles: {
          fillColor: [217, 225, 242],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          halign: "center",
        },
        columnWidth: colWidths,
        styles: {
          font: "helvetica",
          fontSize: 10,
          overflow: "linebreak",
          cellPadding: 3,
        },
        margin: { top: 55 },
      });

      const fileName = `${title.replace(/\s+/g, "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Thêm hàm mới để in bảng dưới dạng PDF thông qua trình duyệt
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
          <h1>Top 5 bài báo nổi bật</h1>
          <p>Năm học: ${selectedYear}</p>
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên bài nghiên cứu</th>
                <th>Lượt xem</th>
                <th>Lượt tải</th>
                <th>Điểm đóng góp</th>
              </tr>
            </thead>
            <tbody>
              ${top5Papers
                .map(
                  (paper, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td class="title-cell">${paper.title || ""}</td>
                  <td class="numeric">${paper.views || "0"}</td>
                  <td class="numeric">${paper.downloads || "0"}</td>
                  <td class="numeric">${paper.contributions || "0"}</td>
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
    const fetchData = async () => {
      try {
        if (userId) {
          const papersResponse = await userApi.getTotalPapersByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          setTotalPapers(papersResponse.total_papers);

          const viewsResponse = await userApi.getTotalViewsByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          setTotalViews(viewsResponse.total_views);

          const downloadsResponse = await userApi.getTotalDownloadsByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          setTotalDownloads(downloadsResponse.total_downloads);

          const pointsResponse = await userApi.getTotalPointByAuthorId(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
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
            setTop5Papers([]);
          }
        } else {
          setTop5Papers([]);
        }
      } catch (error) {
        console.error("Error fetching top 5 papers for table:", error);
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
          if (
            pointsResponse &&
            pointsResponse.papers &&
            pointsResponse.papers.length > 0
          ) {
            const formattedChartData = pointsResponse.papers.map((paper) => ({
              title: paper.title_vn || paper.title_en,
              contributionScore: paper.contributionScore,
            }));
            const labels = formattedChartData.map((paper) =>
              paper.title.length > 10
                ? paper.title.substring(0, 10) + "..."
                : paper.title
            );
            setPointChartData({
              labels,
              originalLabels: formattedChartData.map((paper) => paper.title),
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
                    "#50B83C",
                    "#9C6ADE",
                    "#47C1BF",
                    "#5C6AC4",
                    "#F49342",
                  ],
                  borderWidth: 0,
                  borderRadius: 6,
                },
              ],
            });
            setSelectedPointFilters(["All", ...labels]);
          } else {
            // Handle empty data
            setPointChartData({
              labels: [],
              originalLabels: [],
              datasets: [
                {
                  data: [],
                  backgroundColor: [],
                  borderWidth: 0,
                  borderRadius: 6,
                },
              ],
            });
            setSelectedPointFilters(["All"]);
          }
        } else {
          setPointChartData({
            labels: [],
            originalLabels: [],
            datasets: [
              {
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                borderRadius: 6,
              },
            ],
          });
          setSelectedPointFilters(["All"]);
        }
      } catch (error) {
        console.error("Error fetching top 5 papers by points:", error);
        setPointChartData({
          labels: [],
          originalLabels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderWidth: 0,
              borderRadius: 6,
            },
          ],
        });
        setSelectedPointFilters(["All"]);
      }
    };

    const fetchTop5PaperTypes = async () => {
      try {
        if (userId) {
          const response = await userApi.getTop5PaperTypesByUser(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          if (response && response.data && response.data.length > 0) {
            const formattedData = response.data.map((item) => ({
              type:
                item.type.length > 10
                  ? item.type.substring(0, 10) + "..."
                  : item.type,
              count: item.count,
            }));
            const labels = formattedData.map((item) => item.type);
            setDonutChartData({
              labels,
              originalLabels: response.data.map((item) => item.type),
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
                    "#50B83C",
                    "#9C6ADE",
                    "#47C1BF",
                    "#5C6AC4",
                    "#F49342",
                  ],
                  borderWidth: 0,
                },
              ],
            });
            setSelectedDonutFilters(["All", ...labels]);
          } else {
            // Handle empty data
            setDonutChartData({
              labels: [],
              originalLabels: [],
              datasets: [
                {
                  data: [],
                  backgroundColor: [],
                  borderWidth: 0,
                },
              ],
            });
            setSelectedDonutFilters(["All"]);
          }
        } else {
          setDonutChartData({
            labels: [],
            originalLabels: [],
            datasets: [
              {
                data: [],
                backgroundColor: [],
                borderWidth: 0,
              },
            ],
          });
          setSelectedDonutFilters(["All"]);
        }
      } catch (error) {
        console.error("Error fetching top 5 paper types:", error);
        setDonutChartData({
          labels: [],
          originalLabels: [],
          datasets: [
            {
              data: [],
              backgroundColor: [],
              borderWidth: 0,
            },
          ],
        });
        setSelectedDonutFilters(["All"]);
      }
    };

    fetchTop5PapersForTable();
    fetchTop5PapersForChart();
    fetchTop5PaperTypes();
  }, [userId, selectedYear]);

  useEffect(() => {
    const fetchTypeStatistics = async () => {
      try {
        if (userId) {
          const response = await userApi.getPaperGroupsByUser(
            userId,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          if (response && response.data) {
            setTypeCounts(response.data);
            setSelectedTypeFilters(["All", ...Object.keys(response.data)]);
          } else {
            // Handle empty data
            setTypeCounts({});
            setSelectedTypeFilters(["All"]);
          }
        } else {
          setTypeCounts({});
          setSelectedTypeFilters(["All"]);
        }
      } catch (error) {
        console.error("Error fetching type statistics:", error);
        setTypeCounts({});
        setSelectedTypeFilters(["All"]);
      }
    };

    fetchTypeStatistics();
  }, [userId, selectedYear]);

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
        typeChartFilterRef.current &&
        !typeChartFilterRef.current.contains(event.target)
      ) {
        setShowTypeChartFilter(false);
      }
      if (
        pointChartFilterRef.current &&
        !pointChartFilterRef.current.contains(event.target)
      ) {
        setShowPointChartFilter(false);
      }
      if (
        donutChartFilterRef.current &&
        !donutChartFilterRef.current.contains(event.target)
      ) {
        setShowDonutChartFilter(false);
      }
      if (
        typeDownloadFilterRef.current &&
        !typeDownloadFilterRef.current.contains(event.target)
      ) {
        setShowTypeDownloadFilter(false);
      }
      if (
        pointDownloadFilterRef.current &&
        !pointDownloadFilterRef.current.contains(event.target)
      ) {
        setShowPointDownloadFilter(false);
      }
      if (
        donutDownloadFilterRef.current &&
        !donutDownloadFilterRef.current.contains(event.target)
      ) {
        setShowDonutDownloadFilter(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTypeFilterChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      if (selectedTypeFilters.includes("All")) {
        setSelectedTypeFilters([]);
      } else {
        setSelectedTypeFilters(["All", ...Object.keys(typeCounts)]);
      }
    } else {
      if (selectedTypeFilters.includes(value)) {
        const newSelected = selectedTypeFilters.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedTypeFilters(newSelected);
      } else {
        const newSelected = [
          ...selectedTypeFilters.filter((item) => item !== "All"),
          value,
        ];
        if (newSelected.length === Object.keys(typeCounts).length) {
          newSelected.push("All");
        }
        setSelectedTypeFilters(newSelected);
      }
    }
  };

  const handlePointFilterChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      if (selectedPointFilters.includes("All")) {
        setSelectedPointFilters([]);
      } else {
        // Make sure we don't crash if labels are empty
        setSelectedPointFilters(
          pointChartData.labels?.length > 0
            ? ["All", ...pointChartData.labels]
            : ["All"]
        );
      }
    } else {
      if (selectedPointFilters.includes(value)) {
        const newSelected = selectedPointFilters.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedPointFilters(newSelected);
      } else {
        const newSelected = [
          ...selectedPointFilters.filter((item) => item !== "All"),
          value,
        ];
        // Make sure we don't crash if labels are empty
        if (
          pointChartData.labels?.length > 0 &&
          newSelected.length === pointChartData.labels.length
        ) {
          newSelected.push("All");
        }
        setSelectedPointFilters(newSelected);
      }
    }
  };

  const handleDonutFilterChange = (event) => {
    const value = event.target.value;
    if (value === "All") {
      if (selectedDonutFilters.includes("All")) {
        setSelectedDonutFilters([]);
      } else {
        // Make sure we don't crash if labels are empty
        setSelectedDonutFilters(
          donutChartData.labels?.length > 0
            ? ["All", ...donutChartData.labels]
            : ["All"]
        );
      }
    } else {
      if (selectedDonutFilters.includes(value)) {
        const newSelected = selectedDonutFilters.filter(
          (item) => item !== value && item !== "All"
        );
        setSelectedDonutFilters(newSelected);
      } else {
        const newSelected = [
          ...selectedDonutFilters.filter((item) => item !== "All"),
          value,
        ];
        // Make sure we don't crash if labels are empty
        if (
          donutChartData.labels?.length > 0 &&
          newSelected.length === donutChartData.labels.length
        ) {
          newSelected.push("All");
        }
        setSelectedDonutFilters(newSelected);
      }
    }
  };

  const handleColumnVisibilityChange = (selectedKeys) => {
    setVisibleColumns(selectedKeys);
  };

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

  const filteredTypeChartData = {
    labels:
      Object.keys(typeCounts).length > 0
        ? selectedTypeFilters.includes("All")
          ? Object.keys(typeCounts).filter((label) => typeCounts[label] > 0)
          : Object.keys(typeCounts).filter(
              (label) =>
                selectedTypeFilters.includes(label) && typeCounts[label] > 0
            )
        : [],
    datasets: [
      {
        data:
          Object.keys(typeCounts).length > 0
            ? selectedTypeFilters.includes("All")
              ? Object.values(typeCounts).filter((value) => value > 0)
              : Object.keys(typeCounts)
                  .filter(
                    (label) =>
                      selectedTypeFilters.includes(label) &&
                      typeCounts[label] > 0
                  )
                  .map((label) => typeCounts[label])
            : [],
        backgroundColor:
          Object.keys(typeCounts).length > 0
            ? selectedTypeFilters.includes("All")
              ? Object.values(typeCounts)
                  .map(
                    (_, index) =>
                      [
                        "#00A3FF",
                        "#7239EA",
                        "#F1416C",
                        "#39eaa3",
                        "#FF0000",
                        "#FFC700",
                        "#50B83C",
                        "#9C6ADE",
                        "#47C1BF",
                        "#5C6AC4",
                      ][index % 10]
                  )
                  .filter((_, index) => Object.values(typeCounts)[index] > 0)
              : Object.keys(typeCounts)
                  .filter(
                    (label) =>
                      selectedTypeFilters.includes(label) &&
                      typeCounts[label] > 0
                  )
                  .map(
                    (_, index) =>
                      [
                        "#00A3FF",
                        "#7239EA",
                        "#F1416C",
                        "#39eaa3",
                        "#FF0000",
                        "#FFC700",
                        "#50B83C",
                        "#9C6ADE",
                        "#47C1BF",
                        "#5C6AC4",
                      ][index % 10]
                  )
            : [],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const filteredPointChartData = {
    labels:
      pointChartData.labels?.length > 0
        ? selectedPointFilters.includes("All")
          ? pointChartData.labels
          : pointChartData.labels.filter((label) =>
              selectedPointFilters.includes(label)
            )
        : [],
    datasets: [
      {
        data:
          pointChartData.labels?.length > 0 &&
          pointChartData.datasets[0]?.data?.length > 0
            ? selectedPointFilters.includes("All")
              ? pointChartData.datasets[0].data
              : pointChartData.datasets[0].data.filter((_, index) =>
                  selectedPointFilters.includes(pointChartData.labels[index])
                )
            : [],
        backgroundColor:
          pointChartData.labels?.length > 0 &&
          pointChartData.datasets[0]?.backgroundColor?.length > 0
            ? selectedPointFilters.includes("All")
              ? pointChartData.datasets[0].backgroundColor
              : pointChartData.datasets[0].backgroundColor.filter((_, index) =>
                  selectedPointFilters.includes(pointChartData.labels[index])
                )
            : [],
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
    originalLabels:
      pointChartData.originalLabels?.length > 0
        ? selectedPointFilters.includes("All")
          ? pointChartData.originalLabels
          : pointChartData.originalLabels.filter((_, index) =>
              selectedPointFilters.includes(pointChartData.labels[index])
            )
        : [],
  };

  const filteredDonutChartData = {
    labels:
      donutChartData.labels?.length > 0
        ? selectedDonutFilters.includes("All")
          ? donutChartData.labels
          : donutChartData.labels.filter((label) =>
              selectedDonutFilters.includes(label)
            )
        : [],
    datasets: [
      {
        data:
          donutChartData.labels?.length > 0 &&
          donutChartData.datasets[0]?.data?.length > 0
            ? selectedDonutFilters.includes("All")
              ? donutChartData.datasets[0].data
              : donutChartData.datasets[0].data.filter((_, index) =>
                  selectedDonutFilters.includes(donutChartData.labels[index])
                )
            : [],
        backgroundColor:
          donutChartData.labels?.length > 0 &&
          donutChartData.datasets[0]?.backgroundColor?.length > 0
            ? selectedDonutFilters.includes("All")
              ? donutChartData.datasets[0].backgroundColor
              : donutChartData.datasets[0].backgroundColor.filter((_, index) =>
                  selectedDonutFilters.includes(donutChartData.labels[index])
                )
            : [],
        borderWidth: 0,
      },
    ],
    originalLabels:
      donutChartData.originalLabels?.length > 0
        ? selectedDonutFilters.includes("All")
          ? donutChartData.originalLabels
          : donutChartData.originalLabels.filter((_, index) =>
              selectedDonutFilters.includes(donutChartData.labels[index])
            )
        : [],
  };

  const hasTypeChartData =
    filteredTypeChartData.datasets[0]?.data?.length > 0 &&
    filteredTypeChartData.datasets[0].data.some((value) => value > 0);

  const hasPointChartData =
    filteredPointChartData.datasets[0]?.data?.length > 0 &&
    filteredPointChartData.datasets[0].data.some((value) => value > 0);

  const hasDonutChartData =
    filteredDonutChartData.datasets[0]?.data?.length > 0 &&
    filteredDonutChartData.datasets[0].data.some((value) => value > 0);

  const getTypeChartTitle = () => {
    if (selectedTypeFilters.includes("All")) {
      return "Biểu đồ Thống kê theo loại";
    } else {
      const selected = selectedTypeFilters.join(", ");
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
    } else if (chartSection === "point") {
      setPointChartType(type);
      setShowPointChartFilter(false);
    } else if (chartSection === "donut") {
      setDonutChartType(type);
      setShowDonutChartFilter(false);
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
    } else if (chartSection === "point") {
      setShowPointDownloadFilter(false);
    } else if (chartSection === "donut") {
      setShowDonutDownloadFilter(false);
    }
  };

  // Sửa lại hàm exportAllCharts để xuất tất cả vào một file duy nhất
  const exportAllCharts = async (format) => {
    try {
      if (format === "pdf") {
        // Capture các biểu đồ thành ảnh
        const typeCanvas = await html2canvas(typeChartRef.current, {
          scale: 2,
        });
        const typeImgData = typeCanvas.toDataURL("image/png");

        const pointCanvas = await html2canvas(pointChartRef.current, {
          scale: 2,
        });
        const pointImgData = pointCanvas.toDataURL("image/png");

        const donutCanvas = await html2canvas(donutChartRef.current, {
          scale: 2,
        });
        const donutImgData = donutCanvas.toDataURL("image/png");

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

        // Chuẩn bị dữ liệu cho bảng điểm
        const pointTableBody = filteredPointChartData.labels.map(
          (label, index) => {
            // Sử dụng tên đầy đủ từ originalLabels nếu có
            const fullLabel = filteredPointChartData.originalLabels
              ? filteredPointChartData.originalLabels[index] || label
              : label;
            return [
              { text: fullLabel, style: "tableCell" },
              {
                text: filteredPointChartData.datasets[0].data[index].toString(),
                style: "tableCell",
              },
            ];
          }
        );

        // Chuẩn bị dữ liệu cho bảng lĩnh vực
        const donutTableBody = filteredDonutChartData.labels.map(
          (label, index) => {
            // Sử dụng tên đầy đủ từ originalLabels nếu có
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
        const papersTableBody = top5Papers.map((paper, index) => [
          { text: (index + 1).toString(), style: "tableCell" },
          { text: paper.title || "", style: "tableCell" },
          { text: paper.views.toString() || "0", style: "tableCell" },
          { text: paper.downloads.toString() || "0", style: "tableCell" },
          { text: paper.contributions.toString() || "0", style: "tableCell" },
        ]);

        // Định nghĩa cấu trúc PDF
        const docDefinition = {
          content: [
            {
              text: "BÁO CÁO THỐNG KÊ NGHIÊN CỨU KHOA HỌC CÁ NHÂN",
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

            // Top 5 bài theo điểm đóng góp
            {
              text: "2. TOP 5 BÀI CÓ ĐIỂM ĐÓNG GÓP CAO NHẤT",
              style: "header",
              pageBreak: "before",
            },
            { image: pointImgData, width: 500, margin: [0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Tên bài nghiên cứu", style: "tableHeader" },
                    { text: "Điểm đóng góp", style: "tableHeader" },
                  ],
                  ...pointTableBody,
                ],
              },
              margin: [0, 10, 0, 20],
            },

            // Top 5 lĩnh vực
            {
              text: "3. TOP 5 BÀI BÁO THEO LĨNH VỰC NGHIÊN CỨU",
              style: "header",
              pageBreak: "before",
            },
            { image: donutImgData, width: 500, margin: [0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ["*", "auto"],
                body: [
                  [
                    { text: "Lĩnh vực", style: "tableHeader" },
                    { text: "Số lượng", style: "tableHeader" },
                  ],
                  ...donutTableBody,
                ],
              },
              margin: [0, 10, 0, 20],
            },

            // Top 5 papers
            {
              text: "4. TOP 5 BÀI BÁO NỔI BẬT",
              style: "header",
              pageBreak: "before",
            },
            {
              table: {
                headerRows: 1,
                widths: ["auto", "*", "auto", "auto", "auto"],
                body: [
                  [
                    { text: "STT", style: "tableHeader" },
                    { text: "Tên bài nghiên cứu", style: "tableHeader" },
                    { text: "Lượt xem", style: "tableHeader" },
                    { text: "Lượt tải", style: "tableHeader" },
                    { text: "Điểm đóng góp", style: "tableHeader" },
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
            `Thong_Ke_Ca_Nhan_${new Date()
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

        // Worksheet cho top 5 bài có điểm đóng góp cao
        const pointWorksheet = workbook.addWorksheet("Top 5 điểm cao nhất");
        const pointLabels =
          filteredPointChartData.originalLabels ||
          filteredPointChartData.labels ||
          [];
        const pointValues = filteredPointChartData.datasets[0]?.data || [];

        addHeaderSystem(pointWorksheet);
        addWorksheetHeader(
          pointWorksheet,
          "Top 5 bài có điểm đóng góp cao nhất"
        );
        addDataToWorksheet(pointWorksheet, pointLabels, pointValues);

        // Worksheet cho top 5 lĩnh vực
        const donutWorksheet = workbook.addWorksheet("Top 5 lĩnh vực");
        const donutLabels =
          filteredDonutChartData.originalLabels ||
          filteredDonutChartData.labels ||
          [];
        const donutValues = filteredDonutChartData.datasets[0]?.data || [];

        addHeaderSystem(donutWorksheet);
        addWorksheetHeader(
          donutWorksheet,
          "Top 5 bài báo theo lĩnh vực nghiên cứu"
        );
        addDataToWorksheet(donutWorksheet, donutLabels, donutValues);

        // Worksheet cho bảng top 5 papers
        const papersWorksheet = workbook.addWorksheet("Top 5 Bài báo");
        const paperHeaders = [
          "STT",
          "Tên bài nghiên cứu",
          "Lượt xem",
          "Lượt tải",
          "Điểm đóng góp",
        ];

        addHeaderSystem(papersWorksheet);
        addWorksheetHeader(papersWorksheet, "Top 5 bài báo nổi bật");

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
        top5Papers.forEach((paper, index) => {
          const rowData = [
            index + 1,
            paper.title,
            paper.views,
            paper.downloads,
            paper.contributions,
          ];

          const row = papersWorksheet.addRow(rowData);
          row.eachCell((cell, colNumber) => {
            cell.font = { name: "Times New Roman", size: 12 };
            if (colNumber === 1) {
              cell.alignment = { horizontal: "center", vertical: "middle" };
            } else if (colNumber >= 3 && colNumber <= 5) {
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
            top5Papers.forEach((item) => {
              const length = item.title ? item.title.length : 0;
              if (length > maxLength) {
                maxLength = length;
              }
            });
            column.width = Math.min(maxLength + 4, 50); // Giới hạn độ rộng tối đa
          } else {
            // Các cột số liệu khác
            const values =
              index === 2
                ? top5Papers.map((item) => item.views)
                : index === 3
                ? top5Papers.map((item) => item.downloads)
                : top5Papers.map((item) => item.contributions);

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
          const fileName = `Thong_Ke_Ca_Nhan_${new Date()
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
            <span className="font-semibold text-sm text-sky-900">Thống kê</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Dạng biểu đồ
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="flex flex-row justify-center mx-auto flex-wrap gap-2 sm:gap-4 w-full lg:w-auto">
              <div
                className="bg-[#F1F5F9] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[150px] lg:min-w-[170px]"
                style={{ height: "55px" }}
              >
                <div className="text-base sm:text-lg font-bold text-gray-700 pt-2">
                  <CountUp end={totalPapers} duration={2} />
                </div>
                <div className="text-gray-500 text-xs sm:text-sm pb-2">
                  Tổng bài báo
                </div>
              </div>
              <div
                className="bg-[#b0fccd] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[150px] lg:min-w-[170px]"
                style={{ height: "55px" }}
              >
                <div className="text-base sm:text-lg font-bold text-gray-700 pt-2">
                  <CountUp end={totalPoints} duration={2} decimals={1} />
                </div>
                <div className="text-gray-500 text-xs sm:text-sm pb-2">
                  Tổng điểm đóng góp
                </div>
              </div>
              <div
                className="bg-[#E8F7FF] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[150px] lg:min-w-[170px]"
                style={{ height: "55px" }}
              >
                <div className="text-base sm:text-lg font-bold text-[#00A3FF] pt-2">
                  <CountUp end={totalViews} duration={2} />
                </div>
                <div className="text-gray-500 text-xs sm:text-sm pb-2">
                  Tổng lượt xem
                </div>
              </div>
              <div
                className="bg-[#FFF8E7] rounded-lg flex flex-col justify-center items-center shadow-sm hover:shadow-md cursor-pointer transform hover:scale-105 transition-transform duration-300 flex-1 min-w-[95px] sm:min-w-[150px] lg:min-w-[170px]"
                style={{ height: "55px" }}
              >
                <div className="text-base sm:text-lg font-bold text-[#FFB700] pt-2">
                  <CountUp end={totalDownloads} duration={2} />
                </div>
                <div className="text-gray-500 text-xs sm:text-sm pb-2">
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

        {/* Charts */}
        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Type Chart */}
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
                  <div className="relative" ref={typeFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() => setShowTypeFilter(!showTypeFilter)}
                    >
                      <FilterOutlined className="text-blue-500" />
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
                              value="All"
                              checked={selectedTypeFilters.includes("All")}
                              onChange={handleTypeFilterChange}
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
                                  value={type}
                                  checked={selectedTypeFilters.includes(type)}
                                  onChange={handleTypeFilterChange}
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

            {/* Point Chart */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  Top 5 bài có điểm đóng góp cao nhất
                </h2>
                <div className="flex flex-wrap items-center gap-2 self-end">
                  <div className="relative" ref={pointChartFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowPointChartFilter(!showPointChartFilter)
                      }
                    >
                      <BarChartOutlined className="text-blue-500" />
                      <span className="text-xs">Loại biểu đồ</span>
                    </button>
                    {showPointChartFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="bar"
                              checked={pointChartType === "bar"}
                              onChange={() =>
                                handleChartTypeChange("point", "bar")
                              }
                              className="mr-2"
                            />
                            Biểu đồ cột
                          </label>
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="doughnut"
                              checked={pointChartType === "doughnut"}
                              onChange={() =>
                                handleChartTypeChange("point", "doughnut")
                              }
                              className="mr-2"
                            />
                            Biểu đồ tròn
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={pointFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() => setShowPointFilter(!showPointFilter)}
                    >
                      <FilterOutlined className="text-blue-500" />
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
                              value="All"
                              checked={selectedPointFilters.includes("All")}
                              onChange={handlePointFilterChange}
                              className="mr-2"
                            />
                            Tất cả
                          </label>
                          <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                            {pointChartData.labels.map((label) => (
                              <label
                                key={label}
                                className="flex items-center mb-2"
                              >
                                <input
                                  type="checkbox"
                                  value={label}
                                  checked={selectedPointFilters.includes(label)}
                                  onChange={handlePointFilterChange}
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
                  <div className="relative" ref={pointDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowPointDownloadFilter(!showPointDownloadFilter)
                      }
                    >
                      <DownloadOutlined className="text-blue-500" />
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showPointDownloadFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "point",
                                "pdf",
                                pointChartRef,
                                filteredPointChartData,
                                "Top 5 bài có điểm đóng góp cao nhất"
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
                                "point",
                                "excel",
                                pointChartRef,
                                filteredPointChartData,
                                "Top 5 bài có điểm đóng góp cao nhất"
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
                ref={pointChartRef}
                className="w-full h-[200px] sm:h-[250px] flex items-center justify-center"
              >
                {hasPointChartData ? (
                  pointChartType === "bar" ? (
                    <div className="w-full h-full">
                      <Bar
                        data={filteredPointChartData}
                        options={getChartOptions(filteredPointChartData, false)}
                        height={null}
                        width={null}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Doughnut
                        data={filteredPointChartData}
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

            {/* Donut Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  Top 5 bài báo theo lĩnh vực nghiên cứu
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative" ref={donutChartFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowDonutChartFilter(!showDonutChartFilter)
                      }
                    >
                      <BarChartOutlined className="text-blue-500" />
                      <span className="text-xs">Loại biểu đồ</span>
                    </button>
                    {showDonutChartFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="bar"
                              checked={donutChartType === "bar"}
                              onChange={() =>
                                handleChartTypeChange("donut", "bar")
                              }
                              className="mr-2"
                            />
                            Biểu đồ cột
                          </label>
                          <label className="flex items-center mb-2">
                            <input
                              type="radio"
                              value="doughnut"
                              checked={donutChartType === "doughnut"}
                              onChange={() =>
                                handleChartTypeChange("donut", "doughnut")
                              }
                              className="mr-2"
                            />
                            Biểu đồ tròn
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={donutFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() => setShowDonutFilter(!showDonutFilter)}
                    >
                      <FilterOutlined className="text-blue-500" />
                      <span className="text-xs">Bộ lọc</span>
                    </button>
                    {showDonutFilter && (
                      <div
                        className="absolute top-full right-0 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "250px" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <label key="All" className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              value="All"
                              checked={selectedDonutFilters.includes("All")}
                              onChange={handleDonutFilterChange}
                              className="mr-2"
                            />
                            Tất cả
                          </label>
                          <div className="max-h-[150px] overflow-y-auto pr-1 mt-2">
                            {donutChartData.labels.map((label) => (
                              <label
                                key={label}
                                className="flex items-center mb-2"
                              >
                                <input
                                  type="checkbox"
                                  value={label}
                                  checked={selectedDonutFilters.includes(label)}
                                  onChange={handleDonutFilterChange}
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
                  <div className="relative" ref={donutDownloadFilterRef}>
                    <button
                      className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                      onClick={() =>
                        setShowDonutDownloadFilter(!showDonutDownloadFilter)
                      }
                    >
                      <DownloadOutlined className="text-blue-500" />
                      <span className="text-xs">Xuất file</span>
                    </button>
                    {showDonutDownloadFilter && (
                      <div
                        className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                        style={{ width: "150px", right: "0" }}
                      >
                        <div className="px-4 py-3 w-full">
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              handleDownloadFormat(
                                "donut",
                                "pdf",
                                donutChartRef,
                                filteredDonutChartData,
                                "Top 5 lĩnh vực nghiên cứu"
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
                                "donut",
                                "excel",
                                donutChartRef,
                                filteredDonutChartData,
                                "Top 5 lĩnh vực nghiên cứu"
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
              <div ref={donutChartRef}>
                {hasDonutChartData ? (
                  donutChartType === "doughnut" ? (
                    <div className="flex flex-col items-start">
                      <Doughnut
                        data={filteredDonutChartData}
                        options={donutOptions}
                        height={200}
                        width={500}
                      />
                    </div>
                  ) : (
                    <Bar
                      data={filteredDonutChartData}
                      options={getChartOptions(filteredDonutChartData, false)}
                      height={200}
                      width={500}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500">
                    Không có dữ liệu để hiển thị
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <h2 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 sm:mb-0">
                  Top 5 bài báo nổi bật
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
                            onClick={printTopPapersTable}
                          >
                            <FilePdfOutlined className="text-red-500 mr-1" />
                            PDF
                          </div>
                          <div
                            className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-1"
                            onClick={() =>
                              exportTableToExcel(
                                top5Papers,
                                "Top 5 bài báo nổi bật"
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
                {top5Papers && top5Papers.length > 0 ? (
                  <Table
                    columns={columns.filter((col) =>
                      visibleColumns.includes(col.key)
                    )}
                    dataSource={top5Papers}
                    pagination={false}
                    rowKey="id"
                    onRow={onRowClick}
                    className="papers-table"
                    rowClassName="cursor-pointer"
                    size="small"
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
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

export default StatisticsChartPage;
