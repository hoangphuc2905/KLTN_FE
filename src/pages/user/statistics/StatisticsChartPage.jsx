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
      const worksheetData = data.map((item, index) => ({
        STT: index + 1,
        "Tên bài nghiên cứu": item.title,
        "Lượt xem": item.views,
        "Lượt tải": item.downloads,
        "Điểm đóng góp": item.contributions,
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${title}.xlsx`);
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
        pdf.text(`Tên bài nghiên cứu: ${item.title}`, 10, y + 5);
        pdf.text(`Lượt xem: ${item.views}`, 10, y + 10);
        pdf.text(`Lượt tải: ${item.downloads}`, 10, y + 15);
        pdf.text(`Điểm đóng góp: ${item.contributions}`, 10, y + 20);
        y += 30;
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
                      ["#00A3FF", "#7239EA", "#F1416C", "#7239EA", "#FF0000"][
                        index % 5
                      ]
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
                      ["#00A3FF", "#7239EA", "#F1416C", "#7239EA", "#FF0000"][
                        index % 5
                      ]
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

  // Sửa lại hàm exportAllCharts để phù hợp với biến có trong file này
  const exportAllCharts = async (format) => {
    try {
      if (format === "pdf") {
        // Xuất tất cả dạng PDF
        await Promise.all([
          generatePDF(
            typeChartRef,
            "Biểu đồ Thống kê theo loại",
            filteredTypeChartData
          ),
          generatePDF(
            pointChartRef,
            "Top 5 bài có điểm đóng góp cao nhất",
            filteredPointChartData
          ),
          generatePDF(
            donutChartRef,
            "Top 5 bài báo theo lĩnh vực nghiên cứu",
            filteredDonutChartData
          ),
        ]);

        // Xuất bảng dữ liệu
        exportTableToPDF(top5Papers, "Top 5 bài báo nổi bật");
      } else if (format === "excel") {
        // Xuất tất cả dạng Excel
        generateExcel(filteredTypeChartData, "Biểu đồ Thống kê theo loại");
        generateExcel(
          filteredPointChartData,
          "Top 5 bài có điểm đóng góp cao nhất"
        );
        generateExcel(
          filteredDonutChartData,
          "Top 5 bài báo theo lĩnh vực nghiên cứu"
        );

        // Xuất bảng dữ liệu
        exportTableToExcel(top5Papers, "Top 5 bài báo nổi bật");
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
                            exportTableToPDF(
                              top5Papers,
                              "Top 5 bài báo nổi bật"
                            )
                          }
                        >
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
                          Excel
                        </div>
                      </div>
                    </div>
                  )}
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
