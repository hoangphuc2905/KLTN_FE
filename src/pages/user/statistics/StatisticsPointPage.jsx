import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import { Filter, ChevronDown } from "lucide-react";
import {
  Input,
  Table,
  Checkbox,
  Tooltip,
  Modal,
  Space,
  Select,
  Spin,
} from "antd";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";
import Footer from "../../../components/Footer";

const StatisticsPointPage = () => {
  const [papers, setPapers] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");
  const [academicYears, setAcademicYears] = useState([]);
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "id",
    "title",
    "type",
    "group",
    "authorCount",
    "role",
    "institution",
    "publicationDate",
    "points",
    "action",
  ]);
  const [filterRole, setFilterRole] = useState(["Tất cả"]);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]);
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false);
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthorCountFrom, setFilterAuthorCountFrom] = useState("");
  const [filterAuthorCountTo, setFilterAuthorCountTo] = useState("");
  const [filterTotalPointsFrom, setFilterTotalPointsFrom] = useState("");
  const [filterTotalPointsTo, setFilterTotalPointsTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false); // Thêm state cho loading

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const groupFilterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const institutionFilterRef = useRef(null);
  const paperTypeFilterRef = useRef(null);

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
    const date = new Date(dateString);
    return `${date.getUTCDate().toString().padStart(2, "0")}/${(
      date.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getUTCFullYear()}`;
  };

  const uniqueRoles = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.role).filter((r) => r && r !== "N/A")
    ),
  ];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.institution).filter((i) => i && i !== "N/A")
    ),
  ];
  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.type).filter((p) => p && p !== "N/A")
    ),
  ];
  const uniqueGroups = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.group).filter((g) => g && g !== "N/A")
    ),
  ];

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
    const fetchPapers = async () => {
      setIsLoading(true); // Bắt đầu loading
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          console.error("Missing user_id");
          return;
        }

        const response = await userApi.getScientificPapersByAuthorId(
          user_id,
          selectedYear === "Tất cả" ? null : selectedYear
        );

        if (
          response?.scientificPapers &&
          Array.isArray(response.scientificPapers)
        ) {
          const mappedPapers = await Promise.all(
            response.scientificPapers.map(async (paper) => {
              let departmentName = "N/A";
              if (paper.department) {
                try {
                  const departmentResponse = await userApi.getDepartmentById(
                    paper.department
                  );
                  departmentName = departmentResponse?.department_name || "N/A";
                } catch (error) {
                  console.error(
                    `Error fetching department for ID ${paper.department}:`,
                    error
                  );
                }
              }

              const userAuthor = paper.author?.find(
                (author) => author.user_id === user_id
              );
              const userRole = userAuthor?.role || "N/A";
              const points = userAuthor?.point || 0;

              const displayRole = (() => {
                switch (userRole) {
                  case "MainAndCorrespondingAuthor":
                    return "Vừa chính vừa liên hệ";
                  case "CorrespondingAuthor":
                    return "Liên hệ";
                  case "MainAuthor":
                    return "Chính";
                  case "Participant":
                    return "Tham gia";
                  default:
                    return "N/A";
                }
              })();

              return {
                id: paper.paper_id,
                type: paper.article_type?.type_name || "N/A",
                group: paper.article_group?.group_name || "N/A",
                title: paper.title_vn || "N/A",
                authors:
                  paper.author
                    ?.map((author) => author.author_name_vi)
                    .join(", ") || "Không có tác giả",
                authorCount: paper.author_count || "0",
                role: displayRole,
                institution: departmentName,
                publicationDate: paper.publish_date
                  ? formatDate(paper.publish_date)
                  : "N/A",
                dateAdded: paper.createdAt || "N/A",
                points: points,
              };
            })
          );
          setPapers(mappedPapers);
        } else {
          console.error("Unexpected API response structure:", response);
          setPapers([]);
        }
      } catch (error) {
        console.error("Error fetching scientific papers:", error);
        setPapers([]);
      } finally {
        setIsLoading(false); // Kết thúc loading
      }
    };

    fetchPapers();
  }, [selectedYear]);

  const filteredPapers = papers.filter((paper) => {
    const authorCountNumeric = parseInt(paper.authorCount) || 0;
    return (
      (filterRole.includes("Tất cả") || filterRole.includes(paper.role)) &&
      (filterInstitution.includes("Tất cả") ||
        filterInstitution.includes(paper.institution)) &&
      (filterPaperType.includes("Tất cả") ||
        filterPaperType.includes(paper.type)) &&
      (filterGroup.includes("Tất cả") || filterGroup.includes(paper.group)) &&
      (filterTitle === "" ||
        paper.title.toLowerCase().includes(filterTitle.toLowerCase())) &&
      (filterAuthorCountFrom === "" ||
        authorCountNumeric >= parseInt(filterAuthorCountFrom)) &&
      (filterAuthorCountTo === "" ||
        authorCountNumeric <= parseInt(filterAuthorCountTo)) &&
      (filterTotalPointsFrom === "" ||
        paper.points >= parseInt(filterTotalPointsFrom)) &&
      (filterTotalPointsTo === "" ||
        paper.points <= parseInt(filterTotalPointsTo))
    );
  });

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleRowClick = (record) => {
    setModalContent({
      ...record,
      publicationDate:
        record.publicationDate !== "N/A"
          ? record.publicationDate
          : "Không xác định",
    });
    setIsModalVisible(true);
  };

  const getPointFormula = (paper) => {
    const basePoints = 10;
    const authorCount = parseInt(paper.authorCount) || 1;
    const roleMultiplier = getRoleMultiplier(paper.role);

    let formula = `Điểm cơ bản cho bài báo ${paper.type}: ${basePoints} điểm`;
    if (authorCount > 1) {
      formula += `\nSố tác giả: ${authorCount} người → Hệ số chia: ${authorCount}`;
    }
    if (paper.role !== "Tham gia") {
      formula += `\nVai trò ${paper.role}: Hệ số nhân ${roleMultiplier}`;
    }
    formula += `\n\nCông thức: ${basePoints}`;
    if (authorCount > 1) formula += ` ÷ ${authorCount}`;
    if (roleMultiplier !== 1) formula += ` × ${roleMultiplier}`;
    formula += ` = ${paper.points} điểm`;

    return formula;
  };

  const getRoleMultiplier = (role) => {
    switch (role) {
      case "Vừa chính vừa liên hệ":
        return 1.5;
      case "Chính":
        return 1.3;
      case "Liên hệ":
        return 1.2;
      default:
        return 1;
    }
  };

  const columnOptions = [
    { label: "STT", value: "id" },
    { label: "Tên bài báo nghiên cứu khoa học", value: "title" },
    { label: "Loại bài báo", value: "type" },
    { label: "Thuộc nhóm", value: "group" },
    { label: "Số tác giả", value: "authorCount" },
    { label: "Vai trò", value: "role" },
    { label: "Khoa", value: "institution" },
    { label: "Ngày công bố", value: "publicationDate" },
    { label: "Điểm", value: "points" },
    { label: "Xem chi tiết", value: "action" },
  ];

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      width: 75,
      fixed: "left",
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      width: 300,
      ellipsis: { showTitle: false },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
      fixed: "left",
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" ? sortedInfo.order : null,
      width: 150,
      ellipsis: { showTitle: false },
      render: (type) => (
        <Tooltip placement="topLeft" title={type}>
          {type}
        </Tooltip>
      ),
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "group",
      key: "group",
      sorter: (a, b) => a.group.localeCompare(b.group),
      sortOrder: sortedInfo.columnKey === "group" ? sortedInfo.order : null,
      width: 150,
      ellipsis: { showTitle: false },
      render: (group) => (
        <Tooltip placement="topLeft" title={group}>
          {group}
        </Tooltip>
      ),
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      sorter: (a, b) =>
        parseInt(a.authorCount || 0) - parseInt(b.authorCount || 0),
      sortOrder:
        sortedInfo.columnKey === "authorCount" ? sortedInfo.order : null,
      width: 120,
      ellipsis: { showTitle: false },
      render: (authorCount) => (
        <Tooltip placement="topLeft" title={authorCount}>
          {authorCount}
        </Tooltip>
      ),
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortOrder: sortedInfo.columnKey === "role" ? sortedInfo.order : null,
      width: 120,
      ellipsis: { showTitle: false },
      render: (role) => (
        <Tooltip placement="topLeft" title={role}>
          {role}
        </Tooltip>
      ),
    },
    {
      title: "KHOA",
      dataIndex: "institution",
      key: "institution",
      sorter: (a, b) => a.institution.localeCompare(b.institution),
      sortOrder:
        sortedInfo.columnKey === "institution" ? sortedInfo.order : null,
      width: 200,
      ellipsis: { showTitle: false },
      render: (institution) => (
        <Tooltip placement="topLeft" title={institution}>
          {institution}
        </Tooltip>
      ),
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publicationDate",
      key: "publicationDate",
      sorter: (a, b) =>
        new Date(a.publicationDate) - new Date(b.publicationDate),
      sortOrder:
        sortedInfo.columnKey === "publicationDate" ? sortedInfo.order : null,
      width: 160,
      render: (date) => <span>{formatDate(date)}</span>,
    },
    {
      title: "ĐIỂM",
      dataIndex: "points",
      key: "points",
      sorter: (a, b) => a.points - b.points,
      sortOrder: sortedInfo.columnKey === "points" ? sortedInfo.order : null,
      width: 130,
    },
    {
      title: "Xem chi tiết",
      key: "action",
      render: (text, record) => (
        <a
          href="#"
          className="text-blue-500"
          onClick={(e) => {
            e.preventDefault();
            handleRowClick(record);
          }}
        >
          Xem chi tiết
        </a>
      ),
      width: 130,
    },
  ].filter((column) => visibleColumns.includes(column.key));

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo");

    const visibleColumnsList = columns.filter(
      (col) => col.dataIndex && visibleColumns.includes(col.key)
    );
    const headers = visibleColumnsList.map((col) => col.title);

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;

    worksheet.mergeCells("A1", `${String.fromCharCode(64 + headers.length)}7`);
    const systemNameCell = worksheet.getCell("A1");
    systemNameCell.value =
      "HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC\nCỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM";
    systemNameCell.font = { name: "Times New Roman", size: 14, bold: true };
    systemNameCell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };

    worksheet.mergeCells("A8", "C8");
    const dateCell = worksheet.getCell("A8");
    dateCell.value = `Ngày tạo: ${formattedDate}`;
    dateCell.font = { name: "Times New Roman", size: 11 };
    dateCell.alignment = { horizontal: "left", vertical: "middle" };

    worksheet.mergeCells(
      "A11",
      `${String.fromCharCode(64 + headers.length)}11`
    );
    const titleCell = worksheet.getCell("A11");
    titleCell.value = "BÁO CÁO ĐIỂM ĐÓNG GÓP";
    titleCell.font = { name: "Times New Roman", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCEEFF" },
    };

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

    filteredPapers.forEach((paper, index) => {
      const rowData = visibleColumnsList.map((column) => {
        if (column.dataIndex === "id") {
          return index + 1;
        }
        return paper[column.dataIndex] || "";
      });

      const row = worksheet.addRow(rowData);
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Times New Roman", size: 12 };
        if (colNumber === 1) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (
          ["authorCount", "points"].includes(
            visibleColumnsList[colNumber - 1].dataIndex
          )
        ) {
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

    worksheet.columns.forEach((column, index) => {
      let maxLength = Math.max(headers[index] ? headers[index].length : 0);
      filteredPapers.forEach((paper, rowIndex) => {
        const columnName = visibleColumnsList[index]?.dataIndex;
        if (columnName === "id") {
          maxLength = Math.max(maxLength, String(rowIndex + 1).length);
        } else if (columnName) {
          const value = paper[columnName];
          if (value) {
            maxLength = Math.max(maxLength, String(value).length);
          }
        }
      });
      column.width = maxLength + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const fileName = `BaoCao_DiemDongGop_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const tableHeaders = columns
      .filter((col) => col.dataIndex)
      .map(
        (col) =>
          `<th style="border: 1px solid #ddd; padding: 8px;">${col.title}</th>`
      )
      .join("");
    const tableRows = filteredPapers
      .map((paper) => {
        const rowData = columns
          .filter((col) => col.dataIndex)
          .map(
            (col) =>
              `<td style="border: 1px solid #ddd; padding: 8px;">${
                paper[col.dataIndex] || ""
              }</td>`
          )
          .join("");
        return `<tr>${rowData}</tr>`;
      })
      .join("");

    const tableHTML = `
      <html>
        <head>
          <title>Print Table</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO ĐIỂM ĐÓNG GÓP</h1>
          <p>Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}</p>
          <table>
            <thead>
              <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilter &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
      if (
        showColumnFilter &&
        columnFilterRef.current &&
        !columnFilterRef.current.contains(event.target)
      ) {
        setShowColumnFilter(false);
      }
      if (
        showGroupFilter &&
        groupFilterRef.current &&
        !groupFilterRef.current.contains(event.target)
      ) {
        setShowGroupFilter(false);
      }
      if (
        showRoleFilter &&
        roleFilterRef.current &&
        !roleFilterRef.current.contains(event.target)
      ) {
        setShowRoleFilter(false);
      }
      if (
        showInstitutionFilter &&
        institutionFilterRef.current &&
        !institutionFilterRef.current.contains(event.target)
      ) {
        setShowInstitutionFilter(false);
      }
      if (
        showPaperTypeFilter &&
        paperTypeFilterRef.current &&
        !paperTypeFilterRef.current.contains(event.target)
      ) {
        setShowPaperTypeFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showFilter,
    showColumnFilter,
    showGroupFilter,
    showRoleFilter,
    showInstitutionFilter,
    showPaperTypeFilter,
  ]);

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] mx-auto px-4 max-w-full lg:max-w-[calc(100%-220px)]">
        <div className="w-full bg-white">
          <Header />
        </div>
        <div className="self-center w-full mt-4">
          <div className="flex items-center gap-2 text-gray-600 flex-wrap">
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
            <span
              onClick={() => navigate("/statistics-chart")}
              className="cursor-pointer hover:text-blue-500"
            >
              Thống kê
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Thống kê điểm đóng góp
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-end gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[110px]"
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
                  alt="Download Icon"
                  className="w-4 h-4 invert"
                />
                Download
              </button>
              <button
                onClick={printTable}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2358/2358854.png"
                  alt="Print Icon"
                  className="w-4 h-4 invert"
                />
                Print
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap justify-end gap-2 mb-4 relative">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => {
                    setShowFilter(!showFilter);
                    setShowColumnFilter(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => {
                    setShowColumnFilter(!showColumnFilter);
                    setShowFilter(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Chọn cột</span>
                </button>
                {showFilter && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg"
                  >
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3 rounded-lg border border-gray-200">
                      <div className="max-h-[400px] overflow-y-auto pr-1">
                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Loại bài báo:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPaperTypeFilter(!showPaperTypeFilter);
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterPaperType.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterPaperType.join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showPaperTypeFilter && (
                              <div
                                ref={paperTypeFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterPaperType.includes("Tất cả")}
                                    onChange={(e) => {
                                      setFilterPaperType(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
                                  >
                                    Tất cả
                                  </Checkbox>
                                  <Checkbox.Group
                                    options={uniquePaperTypes
                                      .filter((type) => type !== "Tất cả")
                                      .map((type) => ({
                                        label: type,
                                        value: type,
                                      }))}
                                    value={filterPaperType.filter(
                                      (type) => type !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniquePaperTypes.length - 1
                                      ) {
                                        setFilterPaperType(["Tất cả"]);
                                      } else {
                                        setFilterPaperType(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Thuộc nhóm:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowGroupFilter(!showGroupFilter);
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterGroup.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterGroup.join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showGroupFilter && (
                              <div
                                ref={groupFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterGroup.includes("Tất cả")}
                                    onChange={(e) => {
                                      setFilterGroup(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
                                  >
                                    Tất cả
                                  </Checkbox>
                                  <Checkbox.Group
                                    options={uniqueGroups
                                      .filter((group) => group !== "Tất cả")
                                      .map((group) => ({
                                        label: group,
                                        value: group,
                                      }))}
                                    value={filterGroup.filter(
                                      (group) => group !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniqueGroups.length - 1
                                      ) {
                                        setFilterGroup(["Tất cả"]);
                                      } else {
                                        setFilterGroup(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Vai trò:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRoleFilter(!showRoleFilter);
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterRole.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterRole.join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showRoleFilter && (
                              <div
                                ref={roleFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterRole.includes("Tất cả")}
                                    onChange={(e) => {
                                      setFilterRole(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
                                  >
                                    Tất cả
                                  </Checkbox>
                                  <Checkbox.Group
                                    options={uniqueRoles
                                      .filter((role) => role !== "Tất cả")
                                      .map((role) => ({
                                        label: role,
                                        value: role,
                                      }))}
                                    value={filterRole.filter(
                                      (role) => role !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniqueRoles.length - 1
                                      ) {
                                        setFilterRole(["Tất cả"]);
                                      } else {
                                        setFilterRole(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Khoa:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowInstitutionFilter(
                                  !showInstitutionFilter
                                );
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                            >
                              <span className="truncate">
                                {filterInstitution.includes("Tất cả")
                                  ? "Tất cả"
                                  : filterInstitution.join(", ")}
                              </span>
                              <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                            </button>
                            {showInstitutionFilter && (
                              <div
                                ref={institutionFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                              >
                                <div className="max-h-[100px] overflow-y-auto pr-1">
                                  <Checkbox
                                    checked={filterInstitution.includes(
                                      "Tất cả"
                                    )}
                                    onChange={(e) => {
                                      setFilterInstitution(
                                        e.target.checked ? ["Tất cả"] : []
                                      );
                                    }}
                                  >
                                    Tất cả
                                  </Checkbox>
                                  <Checkbox.Group
                                    options={uniqueInstitutions
                                      .filter((inst) => inst !== "Tất cả")
                                      .map((inst) => ({
                                        label: inst,
                                        value: inst,
                                      }))}
                                    value={filterInstitution.filter(
                                      (inst) => inst !== "Tất cả"
                                    )}
                                    onChange={(checkedValues) => {
                                      if (
                                        checkedValues.length ===
                                        uniqueInstitutions.length - 1
                                      ) {
                                        setFilterInstitution(["Tất cả"]);
                                      } else {
                                        setFilterInstitution(checkedValues);
                                      }
                                    }}
                                    className="flex flex-col gap-2 mt-2"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Tên bài báo nghiên cứu khoa học:
                          </label>
                          <Input
                            type="text"
                            value={filterTitle}
                            onChange={(e) => setFilterTitle(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3 flex gap-2">
                          <div>
                            <label className="block text-gray-700 text-xs">
                              Số tác giả từ:
                            </label>
                            <Input
                              type="number"
                              value={filterAuthorCountFrom}
                              onChange={(e) =>
                                setFilterAuthorCountFrom(
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, parseInt(e.target.value))
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-xs">
                              Số tác giả đến:
                            </label>
                            <Input
                              type="number"
                              value={filterAuthorCountTo}
                              onChange={(e) =>
                                setFilterAuthorCountTo(
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, parseInt(e.target.value))
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                          </div>
                        </div>

                        <div className="mb-3 flex gap-2">
                          <div>
                            <label className="block text-gray-700 text-xs">
                              Tổng điểm từ:
                            </label>
                            <Input
                              type="number"
                              value={filterTotalPointsFrom}
                              onChange={(e) =>
                                setFilterTotalPointsFrom(
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, parseInt(e.target.value))
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-xs">
                              Tổng điểm đến:
                            </label>
                            <Input
                              type="number"
                              value={filterTotalPointsTo}
                              onChange={(e) =>
                                setFilterTotalPointsTo(
                                  e.target.value === ""
                                    ? ""
                                    : Math.max(0, parseInt(e.target.value))
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterPaperType(["Tất cả"]);
                          setFilterGroup(["Tất cả"]);
                          setFilterTitle("");
                          setFilterAuthorCountFrom("");
                          setFilterAuthorCountTo("");
                          setFilterRole(["Tất cả"]);
                          setFilterInstitution(["Tất cả"]);
                          setFilterTotalPointsFrom("");
                          setFilterTotalPointsTo("");
                        }}
                        className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
                {showColumnFilter && (
                  <div
                    ref={columnFilterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                  >
                    <div className="px-4 py-5 w-full max-w-[350px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <Checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            setVisibleColumns(
                              columnOptions.map((col) => col.value)
                            );
                          } else {
                            setVisibleColumns([]);
                          }
                        }}
                        checked={visibleColumns.length === columnOptions.length}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <div className="max-h-[300px] overflow-y-auto pr-1 mt-2">
                        <Checkbox.Group
                          options={columnOptions}
                          value={visibleColumns}
                          onChange={handleColumnVisibilityChange}
                          className="flex flex-col gap-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Spin size="large" />
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredPapers.map((paper, index) => ({
                    ...paper,
                    key: paper.id || index,
                  }))}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredPapers.length,
                    onChange: (page) => setCurrentPage(page),
                    showSizeChanger: false,
                    showTotal: (total, range) => (
                      <div className="flex items-center">
                        <Select
                          value={pageSize}
                          onChange={handlePageSizeChange}
                          style={{ width: 120, marginRight: 16 }}
                          options={[
                            { value: 10, label: "10 / trang" },
                            { value: 20, label: "20 / trang" },
                            { value: 50, label: "50 / trang" },
                            { value: 100, label: "100 / trang" },
                          ]}
                        />
                        <span>{`${range[0]}-${range[1]} của ${total} mục`}</span>
                      </div>
                    ),
                  }}
                  rowKey="key"
                  className="text-sm"
                  onChange={handleChange}
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                  })}
                  scroll={{
                    x: columns.reduce(
                      (total, col) => total + (col.width || 0),
                      0
                    ),
                  }}
                  locale={{
                    emptyText: <div style={{ height: "35px" }}></div>,
                  }}
                  style={{
                    minHeight: "525px",
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Chi tiết điểm"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <button
            key="close"
            onClick={() => setIsModalVisible(false)}
            className="px-4 py-2 bg-[#00A3FF] text-white rounded-lg text-sm"
          >
            Đóng
          </button>,
        ]}
        width={700}
      >
        <Space direction="vertical">
          <p>
            <strong>Loại bài báo:</strong> {modalContent.type}
          </p>
          <p>
            <strong>Thuộc nhóm:</strong> {modalContent.group}
          </p>
          <p>
            <strong>Tên bài báo nghiên cứu khoa học:</strong>{" "}
            {modalContent.title}
          </p>
          <p>
            <strong>Số tác giả:</strong> {modalContent.authorCount}
          </p>
          <p>
            <strong>Vai trò:</strong> {modalContent.role}
          </p>
          <p>
            <strong>Khoa:</strong> {modalContent.institution}
          </p>
          <p>
            <strong>Ngày công bố:</strong> {modalContent.publicationDate}
          </p>
        </Space>
        <h3 className="font-bold text-lg mb-3 mt-4">Bảng điểm chi tiết</h3>
        <Table
          dataSource={[
            {
              key: "1",
              points: modalContent.points,
              formula: getPointFormula(modalContent),
            },
          ]}
          columns={[
            {
              title: "Điểm",
              dataIndex: "points",
              key: "points",
              width: "30%",
            },
            {
              title: "Công thức tính điểm",
              dataIndex: "formula",
              key: "formula",
              width: "70%",
            },
          ]}
          pagination={false}
          bordered
        />
      </Modal>
      <Footer />
    </div>
  );
};

export default StatisticsPointPage;
