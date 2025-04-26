import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import { useNavigate } from "react-router-dom";
import { Filter, ChevronDown } from "lucide-react";
import { Input, Table, Tooltip, Modal, Space, Checkbox, Select } from "antd";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import userApi from "../../../api/api";
import Footer from "../../../components/Footer";

const StatisticsTablePage = () => {
  const [papers, setPapers] = useState([]);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [fromAuthorCount, setFromAuthorCount] = useState("");
  const [toAuthorCount, setToAuthorCount] = useState("");
  const navigate = useNavigate();
  const [pageSize, setPageSize] = useState(10);

  const [showFilter, setShowFilter] = useState(false);
  const uniqueGroups = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.group).filter((g) => g && g !== "N/A")
    ),
  ];
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]);
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const uniqueRoles = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.role).filter((r) => r && r !== "N/A")
    ),
  ];
  const [filterRole, setFilterRole] = useState(["Tất cả"]);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.institution).filter((i) => i && i !== "N/A")
    ),
  ];
  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const itemsPerPage = 10;

  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.paperType).filter((p) => p && p !== "N/A")
    ),
  ];
  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]);
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false);

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");

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

        const papersData = response?.scientificPapers || [];
        if (Array.isArray(papersData)) {
          const mappedPapers = await Promise.all(
            papersData.map(async (paper) => {
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

              const userRole =
                paper.author?.find((author) => author.user_id === user_id)
                  ?.role || "N/A";

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
                paperType: paper.article_type?.type_name || "N/A",
                group: paper.article_group?.group_name || "N/A",
                title: paper.title_vn || "N/A",
                authors:
                  paper.author
                    ?.map((author) => author.author_name_vi)
                    .join(", ") || "Không có tác giả",
                authorCount: paper.author_count || "0",
                role: displayRole,
                institution: departmentName,
                publicationDate: paper.publish_date || "N/A",
                dateAdded: paper.createdAt || "N/A",
                updatedAt: paper.updatedAt || "N/A",
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
      }
    };

    fetchPapers();
  }, [selectedYear]);

  const filteredPapers = papers.filter((paper) => {
    const authorNames = paper.authors?.toLowerCase() || "";
    const authorCount = parseInt(paper.authorCount || 0);
    return (
      (filterPaperType.includes("Tất cả") ||
        filterPaperType.includes(paper.paperType)) &&
      (filterGroup.includes("Tất cả") || filterGroup.includes(paper.group)) &&
      (filterPaperTitle === "" ||
        paper.title.toLowerCase().includes(filterPaperTitle.toLowerCase())) &&
      (filterAuthorName === "" ||
        authorNames.includes(filterAuthorName.toLowerCase())) &&
      (fromAuthorCount === "" || authorCount >= parseInt(fromAuthorCount)) &&
      (toAuthorCount === "" || authorCount <= parseInt(toAuthorCount)) &&
      (filterRole.includes("Tất cả") || filterRole.includes(paper.role)) &&
      (filterInstitution.includes("Tất cả") ||
        filterInstitution.includes(paper.institution))
    );
  });

  const handleRowClick = (record) => {
    setModalContent(record);
    setIsModalVisible(true);
  };

  const handleFromAuthorCountChange = (value) => {
    if (!isNaN(value) && value >= 0) {
      setFromAuthorCount(value);
    }
  };

  const handleToAuthorCountChange = (value) => {
    if (!isNaN(value) && value >= 0) {
      setToAuthorCount(value);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) =>
        (currentPage - 1) * itemsPerPage + index + 1,
      width: 75,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "paperType",
      key: "paperType",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.paperType.localeCompare(b.paperType),
      render: (paperType) => (
        <Tooltip placement="topLeft" title={paperType}>
          {paperType}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NHÓM",
      dataIndex: "group",
      key: "group",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.group.localeCompare(b.group),
      render: (group) => (
        <Tooltip placement="topLeft" title={group}>
          {group}
        </Tooltip>
      ),
      width: 100,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
      width: 300,
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "authors",
      key: "authors",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.authors.localeCompare(b.authors),
      render: (authors) => (
        <Tooltip placement="topLeft" title={authors}>
          {authors}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      ellipsis: { showTitle: false },
      sorter: (a, b) =>
        parseInt(a.authorCount || 0) - parseInt(b.authorCount || 0),
      render: (authorCount) => (
        <Tooltip placement="topLeft" title={authorCount}>
          {authorCount}
        </Tooltip>
      ),
      width: 120,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => (
        <Tooltip placement="topLeft" title={role}>
          {role}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.institution.localeCompare(b.institution),
      render: (institution) => (
        <Tooltip placement="topLeft" title={institution}>
          {institution}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publicationDate",
      key: "publicationDate",
      ellipsis: { showTitle: false },
      sorter: (a, b) =>
        new Date(a.publicationDate) - new Date(b.publicationDate),
      render: (publicationDate) => (
        <Tooltip placement="topLeft" title={formatDate(publicationDate)}>
          {formatDate(publicationDate)}
        </Tooltip>
      ),
      width: 160,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "dateAdded",
      key: "dateAdded",
      ellipsis: { showTitle: false },
      sorter: (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded),
      render: (dateAdded) => (
        <Tooltip placement="topLeft" title={formatDate(dateAdded)}>
          {formatDate(dateAdded)}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NGÀY CẬP NHẬT",
      dataIndex: "updatedAt",
      key: "updatedAt",
      ellipsis: { showTitle: false },
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      render: (updatedAt) => (
        <Tooltip placement="topLeft" title={formatDate(updatedAt)}>
          {formatDate(updatedAt)}
        </Tooltip>
      ),
      width: 150,
    },
  ];

  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );

  const columnOptions = columns.map((col) => ({
    label: col.title,
    value: col.key,
  }));

  const handleColumnVisibilityChange = (selectedColumns) => {
    setVisibleColumns(selectedColumns);
  };

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

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
    titleCell.value = "BÁO CÁO DANH SÁCH BÀI BÁO NGHIÊN CỨU KHOA HỌC";
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
          ["authorCount"].includes(visibleColumnsList[colNumber - 1].dataIndex)
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
    const fileName = `BaoCao_DanhSach_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const tableHtml = `
      <html>
        <head>
          <title>Print Table</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Báo cáo danh sách</h1>
          <table>
            <thead>
              <tr>
                ${filteredColumns
                  .map((col) => `<th>${col.title}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredPapers
                .map(
                  (paper) => `
                  <tr>
                    ${filteredColumns
                      .map((col) => `<td>${paper[col.dataIndex] || ""}</td>`)
                      .join("")}
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

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const groupFilterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const institutionFilterRef = useRef(null);
  const paperTypeFilterRef = useRef(null);

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

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto flex-grow max-lg:max-w-full max-lg:px-4">
        <div className="w-full bg-white">
          <Header />
        </div>
        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4">
          <div className="flex items-center gap-2 text-gray-600 max-sm:flex-wrap">
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
              Dạng bảng
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-lg:px-4 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4 flex-wrap">
            <select
              className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[110px]"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg max-sm:w-full max-sm:text-xs"
                onClick={downloadExcel}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
                  alt="Download Icon"
                  className="w-4 h-4 invert max-sm:w-3 max-sm:h-3"
                />
                Download
              </button>
              <button
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg max-sm:w-full max-sm:text-xs"
                onClick={printTable}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2358/2358854.png"
                  alt="Print Icon"
                  className="w-4 h-4 invert max-sm:w-3 max-sm:h-3"
                />
                Print
              </button>
            </div>
          </div>
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative gap-2 max-sm:flex-wrap">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs max-sm:w-full"
                  onClick={() => {
                    setShowFilter(!showFilter);
                    setShowColumnFilter(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs max-sm:w-full"
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
                            CQ đứng tên:
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
                            Tên bài báo:
                          </label>
                          <Input
                            type="text"
                            value={filterPaperTitle}
                            onChange={(e) =>
                              setFilterPaperTitle(e.target.value)
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Tên tác giả:
                          </label>
                          <Input
                            type="text"
                            value={filterAuthorName}
                            onChange={(e) =>
                              setFilterAuthorName(e.target.value)
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Số tác giả:
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={fromAuthorCount}
                              onChange={(e) =>
                                handleFromAuthorCountChange(e.target.value)
                              }
                              placeholder="Từ"
                              min={0}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                            />
                            <Input
                              type="number"
                              value={toAuthorCount}
                              onChange={(e) =>
                                handleToAuthorCountChange(e.target.value)
                              }
                              placeholder="Đến"
                              min={0}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterPaperType(["Tất cả"]);
                          setFilterGroup(["Tất cả"]);
                          setFilterPaperTitle("");
                          setFilterAuthorName("");
                          setFromAuthorCount("");
                          setToAuthorCount("");
                          setFilterRole(["Tất cả"]);
                          setFilterInstitution(["Tất cả"]);
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
                            setVisibleColumns(columns.map((col) => col.key));
                          } else {
                            setVisibleColumns([]);
                          }
                        }}
                        checked={visibleColumns.length === columns.length}
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

              <div className="overflow-x-auto">
                <Table
                  columns={filteredColumns}
                  dataSource={filteredPapers}
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
                            { value: 30, label: "30 / trang" },
                            { value: 50, label: "50 / trang" },
                            { value: 100, label: "100 / trang" },
                          ]}
                        />
                        <span>{`${range[0]}-${range[1]} của ${total} mục`}</span>
                      </div>
                    ),
                  }}
                  rowKey={(record) => record.id || record.key}
                  className="text-sm"
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                  })}
                  scroll={{
                    x: filteredColumns.reduce(
                      (total, col) => total + (col.width || 0),
                      0
                    ),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Modal
        title="Chi tiết"
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
      >
        <Space direction="vertical">
          <p>
            <strong>Loại bài báo:</strong> {modalContent.paperType}
          </p>
          <p>
            <strong>Thuộc nhóm:</strong> {modalContent.group}
          </p>
          <p>
            <strong>Tên bài báo nghiên cứu khoa học:</strong>{" "}
            {modalContent.title}
          </p>
          <p>
            <strong>Tác giả:</strong> {modalContent.authors}
          </p>
          <p>
            <strong>Số tác giả:</strong> {modalContent.authorCount}
          </p>
          <p>
            <strong>Vai trò:</strong> {modalContent.role}
          </p>
          <p>
            <strong>CQ đứng tên:</strong> {modalContent.institution}
          </p>
          <p>
            <strong>Ngày công bố:</strong>{" "}
            {formatDate(modalContent.publicationDate)}
          </p>
          <p>
            <strong>Ngày thêm:</strong> {formatDate(modalContent.dateAdded)}
          </p>
          <p>
            <strong>Ngày cập nhật:</strong> {formatDate(modalContent.updatedAt)}
          </p>
          {modalContent.note && (
            <p>
              <strong>Ghi chú:</strong> {modalContent.note}
            </p>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default StatisticsTablePage;
