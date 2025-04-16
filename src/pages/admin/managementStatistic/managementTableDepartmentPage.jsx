import { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import { useNavigate } from "react-router-dom";
import { Filter } from "lucide-react";
import {
  Input,
  Select,
  Table,
  Tooltip,
  Modal,
  Space,
  Checkbox,
  Divider,
  Spin,
} from "antd";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import userApi from "../../../api/api";

const ManagementTableDepartmentPage = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(
    localStorage.getItem("current_role") || ""
  );
  const [userDepartment, setUserDepartment] = useState(
    localStorage.getItem("department") || ""
  );

  const roleMapping = {
    MainAuthor: "Chính",
    CorrespondingAuthor: "Liên hệ",
    MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
    Participant: "Tham gia",
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      width: 75,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "articleType",
      key: "articleType",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.articleType.localeCompare(b.articleType || ""),
      render: (typeName) => (
        <Tooltip placement="topLeft" title={typeName}>
          {typeName}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NHÓM",
      dataIndex: "groupName",
      key: "groupName",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.groupName.localeCompare(b.groupName || ""),
      render: (groupName) => (
        <Tooltip placement="topLeft" title={groupName}>
          {groupName}
        </Tooltip>
      ),
      width: 100,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title_vn",
      key: "title",
      ellipsis: { showTitle: false },
      sorter: (a, b) => a.title_vn?.localeCompare(b.title_vn || ""),
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
      render: (authors) => (
        <Tooltip placement="topLeft" title={authors}>
          {authors}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "author_count",
      key: "authorCount",
      ellipsis: { showTitle: false },
      sorter: (a, b) => parseInt(a.author_count) - parseInt(b.author_count),
      render: (authorCount) => (
        <Tooltip placement="topLeft" title={authorCount}>
          {authorCount}
        </Tooltip>
      ),
      width: 120,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "roles",
      key: "roles",
      ellipsis: { showTitle: false },
      render: (roles) => (
        <Tooltip placement="topLeft" title={roles}>
          {roles
            .split(", ")
            .map((role) => roleMapping[role] || role)
            .join(", ")}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institutions",
      key: "institutions",
      ellipsis: { showTitle: false },
      render: (institutions) => (
        <Tooltip placement="topLeft" title={institutions}>
          {institutions}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publish_date",
      key: "publicationDate",
      ellipsis: { showTitle: false },
      sorter: (a, b) => new Date(a.publish_date) - new Date(b.publish_date),
      render: (publishDate) => (
        <Tooltip placement="topLeft" title={publishDate}>
          {new Date(publishDate).toLocaleDateString()}
        </Tooltip>
      ),
      width: 160,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "createdAt",
      key: "dateAdded",
      ellipsis: { showTitle: false },
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (dateAdded) => (
        <Tooltip placement="topLeft" title={dateAdded}>
          {new Date(dateAdded).toLocaleDateString()}
        </Tooltip>
      ),
      width: 150,
    },
  ];

  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [fromAuthorCount, setFromAuthorCount] = useState("");
  const [toAuthorCount, setToAuthorCount] = useState("");
  const navigate = useNavigate();

  const [showFilter, setShowFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState("Tất cả");
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]); // Default to "Tất cả"
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorCount, setFilterAuthorCount] = useState("");
  const [filterRole, setFilterRole] = useState(["Tất cả"]); // Default to "Tất cả"
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [filterInstitution, setFilterInstitution] = useState([]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const itemsPerPage = 10;

  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );

  const columnOptions = columns.map((col) => ({
    label: col.title,
    value: col.key,
  }));

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  const handleColumnVisibilityChange = (selectedColumns) => {
    setVisibleColumns(selectedColumns);
  };

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch academic years
  const getAcademicYears = async () => {
    try {
      const response = await userApi.getAcademicYears();
      const years = response.academicYears || [];
      setAcademicYears(["Tất cả", ...years.reverse()]); // Reverse to ensure the latest year is first
      setSelectedYear("Tất cả"); // Default to "Tất cả"
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
        setLoading(true);
        const response = await userApi.getScientificPapersByDepartment(
          userDepartment,
          selectedYear === "Tất cả" ? undefined : selectedYear
        );
        const fetchedPapers = response.scientificPapers || []; // Access the correct property
        const approvedPapers = fetchedPapers
          .filter((paper) => paper.status === "approved")
          .map((paper) => ({
            ...paper,
            articleType: paper.article_type?.type_name || "",
            groupName: paper.article_group?.group_name || "",
            authors:
              paper.author?.map((a) => a.author_name_vi).join(", ") || "",
            roles: paper.author?.map((a) => a.role).join(", ") || "",
            institutions:
              paper.author?.map((a) => a.work_unit_id?.name_vi).join(", ") ||
              "",
          }));
        setPapers(approvedPapers);
      } catch (error) {
        console.error("Error fetching papers:", error);
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [selectedYear, userDepartment]);

  const filteredPapers = papers.filter((paper) => {
    const authorCount = paper.author_count
      ? parseInt(paper.author_count.match(/\d+/)?.[0] || 0)
      : 0;

    return (
      (filterPaperType === "Tất cả" || paper.articleType === filterPaperType) &&
      (filterGroup.includes("Tất cả") ||
        filterGroup.includes(paper.groupName)) &&
      (filterPaperTitle === "" || paper.title_vn?.includes(filterPaperTitle)) &&
      (filterAuthorName === "" || paper.authors.includes(filterAuthorName)) &&
      (fromAuthorCount === "" || authorCount >= fromAuthorCount) &&
      (toAuthorCount === "" || authorCount <= toAuthorCount) &&
      (filterRole.includes("Tất cả") ||
        paper.roles.split(", ").some((role) => filterRole.includes(role))) &&
      (filterInstitution.length === 0 ||
        filterInstitution.includes(paper.institutions))
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

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo");

    // Get only the visible columns with data
    const visibleColumnsList = filteredColumns.filter((col) => col.dataIndex);
    const headers = visibleColumnsList.map((col) => col.title);

    // Get current date
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;

    // Merge cells for system name (rows 1-7)
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

    // Add date created
    worksheet.mergeCells("A8", "C8");
    const dateCell = worksheet.getCell("A8");
    dateCell.value = `Ngày tạo: ${formattedDate}`;
    dateCell.font = { name: "Times New Roman", size: 11 };
    dateCell.alignment = { horizontal: "left", vertical: "middle" };

    // Add title
    worksheet.mergeCells(
      "A11",
      `${String.fromCharCode(64 + headers.length)}11`
    );
    const titleCell = worksheet.getCell("A11");
    titleCell.value = "BÁO CÁO DANH SÁCH";
    titleCell.font = { name: "Times New Roman", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCEEFF" },
    };

    // Add headers
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell, colNumber) => {
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

    // Add data rows
    filteredPapers.forEach((paper, index) => {
      const rowData = visibleColumnsList.map((column) => {
        if (column.key === "id") {
          return index + 1; // STT starts from 1
        }

        // Handle date fields
        if (column.key === "publicationDate" && paper.publish_date) {
          return new Date(paper.publish_date).toLocaleDateString();
        }
        if (column.key === "dateAdded" && paper.createdAt) {
          return new Date(paper.createdAt).toLocaleDateString();
        }

        // For roles, convert to Vietnamese display
        if (column.key === "roles" && paper.roles) {
          return paper.roles
            .split(", ")
            .map((role) => roleMapping[role] || role)
            .join(", ");
        }

        // For other fields
        return paper[column.dataIndex] || "";
      });

      const row = worksheet.addRow(rowData);

      // Style each cell in the row
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Times New Roman", size: 12 };
        // Align center for STT, right for numbers, left for text
        if (colNumber === 1) {
          // STT
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (
          ["author_count"].includes(visibleColumnsList[colNumber - 1].dataIndex)
        ) {
          // Numbers
          cell.alignment = { horizontal: "right", vertical: "middle" };
        } else {
          // Text
          cell.alignment = { horizontal: "left", vertical: "middle" };
        }
        // Add borders
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Adjust column widths
    worksheet.columns.forEach((column, index) => {
      let maxLength = 0;
      // Calculate width based on headers
      maxLength = Math.max(
        maxLength,
        headers[index] ? headers[index].length : 0
      );

      // Calculate width based on data
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

      // Adjust width based on content + padding
      column.width = maxLength + 4;
    });

    // Export to Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const fileName = `BaoCao_DanhSach_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
  };

  const printTable = () => {
    const printWindow = window.open("", "_blank");
    const tableHeaders = filteredColumns
      .map((col) => `<th>${col.title}</th>`)
      .join("");
    const tableRows = filteredPapers
      .map((paper) => {
        const rowData = filteredColumns
          .map((col) => `<td>${paper[col.dataIndex] || ""}</td>`)
          .join("");
        return `<tr>${rowData}</tr>`;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">BÁO CÁO DANH SÁCH</h1>
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
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const groupFilterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const institutionFilterRef = useRef(null);

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
  ]);

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
            <span
              onClick={() => navigate("/admin/management/chart")}
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

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4">
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
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={downloadExcel}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
                alt="Download Icon"
                className="w-4 h-4 invert"
              />
              Download
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={printTable}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2358/2358854.png"
                alt="Print Icon"
                className="w-4 h-4 invert"
              />
              Print
            </button>
          </div>
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative gap-2">
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
                {showFilter && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg"
                  >
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="max-h-[400px] overflow-y-auto pr-1">
                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Loại bài báo:
                          </label>
                          <select
                            value={filterPaperType}
                            onChange={(e) => setFilterPaperType(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          >
                            {[]}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Thuộc nhóm:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowGroupFilter(!showGroupFilter)
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                            >
                              Chọn nhóm
                            </button>
                            {showGroupFilter && (
                              <div
                                ref={groupFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-h-[200px] overflow-y-auto"
                              >
                                <Checkbox
                                  indeterminate={false}
                                  onChange={(e) => {}}
                                  checked={false}
                                >
                                  Tất cả
                                </Checkbox>
                                <Checkbox.Group
                                  options={[]}
                                  value={filterGroup}
                                  onChange={(checkedValues) =>
                                    setFilterGroup(checkedValues)
                                  }
                                  className="flex flex-col gap-2 mt-2"
                                />
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

                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Vai trò:
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowRoleFilter(!showRoleFilter)}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                            >
                              Chọn vai trò
                            </button>
                            {showRoleFilter && (
                              <div
                                ref={roleFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-h-[200px] overflow-y-auto"
                              >
                                <Checkbox
                                  indeterminate={false}
                                  onChange={(e) => {}}
                                  checked={false}
                                >
                                  Tất cả
                                </Checkbox>
                                <Checkbox.Group
                                  options={[]}
                                  value={filterRole}
                                  onChange={(checkedValues) =>
                                    setFilterRole(checkedValues)
                                  }
                                  className="flex flex-col gap-2 mt-2"
                                />
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
                              onClick={() =>
                                setShowInstitutionFilter(!showInstitutionFilter)
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                            >
                              Chọn CQ đứng tên
                            </button>
                            {showInstitutionFilter && (
                              <div
                                ref={institutionFilterRef}
                                className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-h-[200px] overflow-y-auto"
                              >
                                <Checkbox
                                  indeterminate={false}
                                  onChange={(e) => {}}
                                  checked={false}
                                >
                                  Tất cả
                                </Checkbox>
                                <Checkbox.Group
                                  options={[]}
                                  value={filterInstitution}
                                  onChange={(checkedValues) => {
                                    if (checkedValues.length === 0) {
                                      setFilterInstitution([]);
                                    } else if (
                                      checkedValues.length ===
                                      uniqueInstitutions.length
                                    ) {
                                      setFilterInstitution(uniqueInstitutions);
                                    } else {
                                      setFilterInstitution(checkedValues);
                                    }
                                  }}
                                  className="flex flex-col gap-2 mt-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterPaperType("Tất cả");
                          setFilterGroup(["Tất cả"]);
                          setFilterPaperTitle("");
                          setFilterAuthorName("");
                          setFilterAuthorCount("");
                          setFilterRole(["Tất cả"]);
                          setFilterInstitution([]);
                        }}
                        className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
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
                {showColumnFilter && (
                  <div
                    ref={columnFilterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                  >
                    <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <Checkbox
                        indeterminate={false}
                        onChange={(e) => {}}
                        checked={false}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <div className="max-h-[300px] overflow-y-auto mt-2 pr-1">
                        <Checkbox.Group
                          options={columnOptions}
                          value={visibleColumns}
                          onChange={handleColumnVisibilityChange}
                          className="flex flex-col gap-2"
                        />
                      </div>
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Spin size="large">
                    <div className="p-8 text-center">Đang tải dữ liệu...</div>
                  </Spin>
                </div>
              ) : (
                <Table
                  columns={filteredColumns}
                  dataSource={filteredPapers} // Ensure this is correctly populated
                  pagination={{
                    current: currentPage,
                    pageSize: itemsPerPage,
                    total: filteredPapers.length,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  rowKey="id"
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
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Chi tiết"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>
          <strong>Loại bài báo:</strong> {modalContent.articleType}
        </p>
        <p>
          <strong>Thuộc nhóm:</strong> {modalContent.groupName}
        </p>
        <p>
          <strong>Tên bài báo nghiên cứu khoa học:</strong>{" "}
          {modalContent.title_vn}
        </p>
        <p>
          <strong>Tác giả:</strong> {modalContent.authors}
        </p>
        <p>
          <strong>Số tác giả:</strong> {modalContent.author_count}
        </p>
        <p>
          <strong>Vai trò:</strong> {modalContent.roles}
        </p>
        <p>
          <strong>CQ đứng tên:</strong> {modalContent.institutions}
        </p>
        <p>
          <strong>Ngày công bố:</strong>{" "}
          {new Date(modalContent.publish_date).toLocaleDateString()}
        </p>
        <p>
          <strong>Ngày thêm:</strong>{" "}
          {new Date(modalContent.createdAt).toLocaleDateString()}
        </p>
        {modalContent.note && (
          <p>
            <strong>Ghi chú:</strong> {modalContent.note}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default ManagementTableDepartmentPage;
