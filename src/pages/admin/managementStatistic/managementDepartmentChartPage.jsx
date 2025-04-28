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
          const backgroundColor = labels.map(
            (_, index) =>
              ["#00A3FF", "#7239EA", "#F1416C", "#FF0000", "#FFC700"][index % 5]
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
    if (!chartRef.current) {
      console.error("Chart reference is null");
      return;
    }
    try {
      const canvas = await html2canvas(chartRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 20;

      pdf.text(title, 10, 10);
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.addPage();
      pdf.text("Dữ liệu chi tiết", 10, 10);
      let y = 20;
      data.labels.forEach((label, index) => {
        const value = data.datasets[0].data[index];
        pdf.text(`${label}: ${value}`, 10, y);
        y += 10;
      });

      pdf.save(`${title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const generateExcel = (data, title) => {
    try {
      const worksheetData = data.labels.map((label, index) => ({
        Label: label,
        Value: data.datasets[0].data[index],
      }));
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${title}.xlsx`);
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
    } else if (chartSection === "author") {
      setAuthorChartType(type);
      setShowAuthorChartFilter(false);
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
    } else if (chartSection === "author") {
      setShowAuthorDownloadFilter(false);
    } else if (chartSection === "field") {
      setShowFieldDownloadFilter(false);
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
            <div className="w-full lg:w-auto flex justify-center lg:justify-end">
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
              <h2 className="font-semibold text-gray-700 mb-4">
                Top 5 bài nghiên cứu được nổi bật
              </h2>
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
