import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import { Filter } from "lucide-react";
import { Input, Select, Table, Checkbox, Modal } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import userApi from "../../../api/api";
import Footer from "../../../components/Footer";

const ManagementPointDepartmentPage = () => {
  const { department } = useParams();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const navigate = useNavigate();
  const [visibleColumns, setVisibleColumns] = useState([
    "checkbox",
    "id",
    "authorId",
    "author",
    "department",
    "totalPapers",
    "totalPoints",
    "action",
  ]);
  const departmentId = localStorage.getItem("department");
  const [userRole] = useState(localStorage.getItem("current_role") || "");

  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");

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

  const fetchPapers = async (academicYear = "Tất cả") => {
    try {
      setLoading(true);
      const response =
        academicYear === "Tất cả"
          ? await userApi.getPaperAuthorsByDepartment(departmentId)
          : await userApi.getPaperAuthorsByDepartment(
              departmentId,
              academicYear
            );

      const data = response.result || []; // Access the 'result' property
      setPapers(
        data.map((item, index) => ({
          id: index + 1,
          authorId: item["MÃ_TÁC_GIẢ"],
          author: item["TÁC_GIẢ"],
          department: item["KHOA"],
          totalPapers: item["TỔNG_BÀI"],
          totalPoints: item["TỔNG_ĐIỂM"],
        }))
      );
    } catch (error) {
      console.error("Error fetching papers:", error.message || error);
      setPapers([]); // Fallback to an empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    fetchPapers(value); // Fetch data based on the selected year
  };

  useEffect(() => {
    fetchPapers(selectedYear); // Fetch data when the component mounts or selectedYear changes
  }, [departmentId, selectedYear]);

  const columnOptions = [
    { label: "STT", value: "id" },
    { label: "MÃ TÁC GIẢ", value: "authorId" },
    { label: "TÁC GIẢ", value: "author" },
    { label: "KHOA", value: "department" },
    { label: "TỔNG BÀI", value: "totalPapers" },
    { label: "TỔNG ĐIỂM", value: "totalPoints" },
    { label: "XEM CHI TIẾT", value: "action" },
  ];

  const [selectAll, setSelectAll] = useState(
    visibleColumns.length === columnOptions.length
  );
  useEffect(() => {
    setSelectAll(visibleColumns.length === columnOptions.length);
  }, [visibleColumns]);

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setVisibleColumns(columnOptions.map((option) => option.value));
    } else {
      setVisibleColumns([]);
    }
  };

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
    setSelectAll(checkedValues.length === columnOptions.length);
  };

  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterRole, setFilterRole] = useState(["Tất cả"]);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const [filterTotalPapersFrom, setFilterTotalPapersFrom] = useState("");
  const [filterTotalPapersTo, setFilterTotalPapersTo] = useState("");
  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]);
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false);
  const [filterTotalPointsFrom, setFilterTotalPointsFrom] = useState("");
  const [filterTotalPointsTo, setFilterTotalPointsTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const uniqueRoles = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.position)),
  ];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.department)),
  ];
  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.journalType)),
  ];

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterAuthorName === "" || paper.author.includes(filterAuthorName)) &&
      (filterRole.includes("Tất cả") || filterRole.includes(paper.position)) &&
      (filterInstitution.includes("Tất cả") ||
        filterInstitution.includes(paper.department)) &&
      (filterTotalPapersFrom === "" ||
        paper.totalPapers >= parseInt(filterTotalPapersFrom)) &&
      (filterTotalPapersTo === "" ||
        paper.totalPapers <= parseInt(filterTotalPapersTo)) &&
      (filterPaperType.includes("Tất cả") ||
        filterPaperType.includes(paper.journalType)) &&
      (filterTotalPointsFrom === "" ||
        paper.totalPoints >= parseInt(filterTotalPointsFrom)) &&
      (filterTotalPointsTo === "" ||
        paper.totalPoints <= parseInt(filterTotalPointsTo))
    );
  });

  const [sortedInfo, setSortedInfo] = useState({});

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorPapers, setAuthorPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);

  const handleViewDetails = async (author) => {
    setSelectedAuthor(author);
    setIsModalVisible(true);
    setLoadingPapers(true);
    try {
      const response = await userApi.getScientificPapersByAuthorId(
        author.authorId,
        selectedYear === "Tất cả" ? undefined : selectedYear // Pass selectedYear if not "Tất cả"
      );
      console.log("Full API Response:", response);

      const papers = response.scientificPapers || []; // Access the 'scientificPapers' property
      const mappedPapers = await Promise.all(
        papers
          .filter((paper) => paper.status === "approved") // Only include approved papers
          .map(async (paper) => {
            // Fetch department name
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

            // Filter role for the selected author
            const userAuthor = paper.author?.find(
              (authorItem) => authorItem.user_id === author.authorId
            );
            const userRole = userAuthor?.role || "N/A";

            // Get the point value directly from the API response
            const points = userAuthor?.point || 0;

            // Map role to display values
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
              title_vn: paper.title_vn || "N/A",
              magazine_type: paper.article_type?.type_name || "N/A",
              point: points,
              role: displayRole,
              institution: departmentName,
            };
          })
      );
      setAuthorPapers(mappedPapers); // Display the data in the modal table
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      setAuthorPapers([]); // Fallback to an empty array on error
    } finally {
      setLoadingPapers(false);
    }
  };

  const paperColumns = [
    {
      title: "Tên bài viết",
      dataIndex: "title_vn",
      key: "title_vn",
    },
    {
      title: "Loại bài",
      dataIndex: "magazine_type",
      key: "magazine_type",
    },
    {
      title: "Điểm",
      dataIndex: "point",
      key: "point",
    },
  ];

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      width: 65,
    },
    {
      title: "MÃ TÁC GIẢ",
      dataIndex: "authorId",
      key: "authorId",
      sorter: (a, b) => a.authorId.localeCompare(b.authorId),
      sortOrder: sortedInfo.columnKey === "authorId" ? sortedInfo.order : null,
      width: 150,
    },
    {
      title: "TÊN TÁC GIẢ",
      dataIndex: "author",
      key: "author",
      sorter: (a, b) => a.author.localeCompare(b.author),
      sortOrder: sortedInfo.columnKey === "author" ? sortedInfo.order : null,
      width: 250,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
      sortOrder:
        sortedInfo.columnKey === "department" ? sortedInfo.order : null,
      width: 270,
    },
    {
      title: "TỔNG BÀI",
      dataIndex: "totalPapers",
      key: "totalPapers",
      sorter: (a, b) => a.totalPapers - b.totalPapers,
      sortOrder:
        sortedInfo.columnKey === "totalPapers" ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: "TỔNG ĐIỂM",
      dataIndex: "totalPoints",
      key: "totalPoints",
      sorter: (a, b) => a.totalPoints - b.totalPoints,
      sortOrder:
        sortedInfo.columnKey === "totalPoints" ? sortedInfo.order : null,
      width: 130,
    },
    {
      title: "XEM CHI TIẾT",
      key: "action",
      render: (text, record) => (
        <button
          onClick={() => handleViewDetails(record)}
          className="text-blue-500 underline"
        >
          Xem chi tiết
        </button>
      ),
      width: 130,
    },
  ].filter((column) => visibleColumns.includes(column.key));

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo");

    // Lấy danh sách các cột hiển thị có dữ liệu
    const visibleColumnsList = columns.filter(
      (col) => col.dataIndex && visibleColumns.includes(col.key)
    );
    const headers = visibleColumnsList.map((col) => col.title);

    // Lấy ngày tháng năm hiện tại
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;

    // Gộp 3 dòng đầu để hiển thị tên hệ thống
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

    // Thêm ngày tháng năm tạo
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
    titleCell.value = "BÁO CÁO ĐIỂM ĐÓNG GÓP";
    titleCell.font = { name: "Times New Roman", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFCCEEFF" },
    };

    // Thêm header row (dòng 12)
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
        if (column.dataIndex === "id") {
          return index + 1; // STT bắt đầu từ 1
        }
        return paper[column.dataIndex] || "";
      });

      const row = worksheet.addRow(rowData);

      // Style cho từng cell trong row
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Times New Roman", size: 12 };
        // Căn giữa cho STT, căn phải cho số, căn trái cho text
        if (colNumber === 1) {
          // STT
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (
          ["totalPapers", "totalPoints"].includes(
            visibleColumnsList[colNumber - 1].dataIndex
          )
        ) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
        } else {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        }
        // Thêm border
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
      let maxLength = 0;
      // Tính độ rộng dựa trên header
      maxLength = Math.max(
        maxLength,
        headers[index] ? headers[index].length : 0
      );

      // Tính độ rộng dựa trên dữ liệu
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

      // Điều chỉnh độ rộng theo nội dung + padding
      column.width = maxLength + 4;
    });

    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const fileName = `BaoCao_DiemDongGop_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
  };

  const printData = () => {
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
      <table style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Data</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Báo cáo Điểm Đóng Góp</h1>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const downloadAuthorPapersExcel = async () => {
    if (!selectedAuthor || authorPapers.length === 0) {
      console.log("No data available to download");
      return;
    }

    console.log("Starting Excel download with data:", authorPapers);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Chi tiết bài viết");

      // Headers for the Excel file
      const headers = ["Tên bài viết", "Loại bài", "Điểm"];

      // Current date for the report
      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;

      // System name header
      worksheet.mergeCells("A1", `C7`);
      const systemNameCell = worksheet.getCell("A1");
      systemNameCell.value =
        "HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC\nCỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM";
      systemNameCell.font = { name: "Times New Roman", size: 14, bold: true };
      systemNameCell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      // Date created
      worksheet.mergeCells("A8", "C8");
      const dateCell = worksheet.getCell("A8");
      dateCell.value = `Ngày tạo: ${formattedDate}`;
      dateCell.font = { name: "Times New Roman", size: 11 };
      dateCell.alignment = { horizontal: "left", vertical: "middle" };

      // Author info
      worksheet.mergeCells("A9", "C9");
      const authorInfoCell = worksheet.getCell("A9");
      authorInfoCell.value = `Tác giả: ${selectedAuthor.author} | Mã tác giả: ${selectedAuthor.authorId}`;
      authorInfoCell.font = { name: "Times New Roman", size: 11 };
      authorInfoCell.alignment = { horizontal: "left", vertical: "middle" };

      // Department info
      worksheet.mergeCells("A10", "C10");
      const departmentInfoCell = worksheet.getCell("A10");
      departmentInfoCell.value = `Khoa: ${selectedAuthor.department}`;
      departmentInfoCell.font = { name: "Times New Roman", size: 11 };
      departmentInfoCell.alignment = { horizontal: "left", vertical: "middle" };

      // Paper and point totals
      worksheet.mergeCells("A11", "C11");
      const totalPapersCell = worksheet.getCell("A11");
      totalPapersCell.value = `Tổng số bài: ${
        selectedAuthor.totalPapers || 0
      } | Tổng điểm: ${selectedAuthor.totalPoints || 0}`;
      totalPapersCell.font = { name: "Times New Roman", size: 11, bold: true };
      totalPapersCell.alignment = { horizontal: "left", vertical: "middle" };

      // Title
      worksheet.mergeCells("A13", "C13");
      const titleCell = worksheet.getCell("A13");
      titleCell.value = "CHI TIẾT BÀI VIẾT CỦA TÁC GIẢ";
      titleCell.font = { name: "Times New Roman", size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCEEFF" },
      };

      // Add header row
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
      authorPapers.forEach((paper) => {
        const rowData = [
          paper.title_vn || "N/A",
          paper.magazine_type || "N/A",
          paper.point || 0,
        ];

        const row = worksheet.addRow(rowData);

        // Style for each cell in the row
        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Times New Roman", size: 12 };
          // Right align for numbers, left align for text
          if (colNumber === 3) {
            // Point column
            cell.alignment = { horizontal: "right", vertical: "middle" };
          } else {
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
      worksheet.getColumn(1).width = 50; // Title column
      worksheet.getColumn(2).width = 20; // Type column
      worksheet.getColumn(3).width = 10; // Point column

      console.log("Worksheet created, preparing to create buffer...");

      // Generate the Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      console.log("Buffer created:", buffer);

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `ChiTiet_TacGia_${selectedAuthor.authorId}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      saveAs(blob, fileName);
      console.log("File download initiated");
    } catch (error) {
      console.error("Error in downloadAuthorPapersExcel:", error);
    }
  };

  const printAuthorPapers = () => {
    if (!selectedAuthor || !authorPapers.length) return;

    const printWindow = window.open("", "_blank");
    const tableHeaders = paperColumns
      .map(
        (col) =>
          `<th style="border: 1px solid #ddd; padding: 8px;">${col.title}</th>`
      )
      .join("");
    const tableRows = authorPapers
      .map((paper) => {
        const rowData = paperColumns
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
      <table style="border-collapse: collapse; width: 100%; text-align: left;">
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Chi tiết bài viết của tác giả</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1 style="text-align: center;">Chi tiết bài viết của tác giả</h1>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <p><strong>Tác giả:</strong> ${selectedAuthor.author}</p>
              <p><strong>Mã tác giả:</strong> ${selectedAuthor.authorId}</p>
              <p><strong>Khoa:</strong> ${selectedAuthor.department}</p>
            </div>
            <div>
              <p><strong>Tổng số bài:</strong> ${
                selectedAuthor.totalPapers || 0
              }</p>
              <p><strong>Tổng điểm:</strong> ${
                selectedAuthor.totalPoints || 0
              }</p>
            </div>
          </div>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
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
    showRoleFilter,
    showInstitutionFilter,
    showPaperTypeFilter,
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
              Điểm đóng góp
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[115px]"
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
              onClick={printData}
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
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs mr-2" // Added margin-right
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs" // Removed margin-right
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
                        checked={selectAll}
                        onChange={handleSelectAllChange}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <Checkbox.Group
                        options={columnOptions}
                        value={visibleColumns}
                        onChange={handleColumnVisibilityChange}
                        className="flex flex-col gap-2"
                      />
                    </div>
                  </div>
                )}
                {showFilter && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg"
                  >
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Tên tác giả:
                        </label>
                        <Input
                          type="text"
                          value={filterAuthorName}
                          onChange={(e) => setFilterAuthorName(e.target.value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Chức vụ:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowRoleFilter(!showRoleFilter)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                          >
                            Chọn chức vụ
                          </button>
                          {showRoleFilter && (
                            <div
                              ref={roleFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
                            >
                              <Checkbox
                                indeterminate={
                                  filterRole.length > 0 &&
                                  filterRole.length < uniqueRoles.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterRole(uniqueRoles);
                                  } else {
                                    setFilterRole([]);
                                  }
                                }}
                                checked={
                                  filterRole.length === uniqueRoles.length
                                }
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
                          Khoa:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowInstitutionFilter(!showInstitutionFilter)
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                          >
                            Chọn khoa
                          </button>
                          {showInstitutionFilter && (
                            <div
                              ref={institutionFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
                            >
                              <Checkbox
                                indeterminate={
                                  filterInstitution.length > 0 &&
                                  filterInstitution.length <
                                    uniqueInstitutions.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterInstitution(uniqueInstitutions);
                                  } else {
                                    setFilterInstitution([]);
                                  }
                                }}
                                checked={
                                  filterInstitution.length ===
                                  uniqueInstitutions.length
                                }
                              >
                                Tất cả
                              </Checkbox>
                              <Checkbox.Group
                                options={uniqueInstitutions
                                  .filter(
                                    (institution) => institution !== "Tất cả"
                                  )
                                  .map((institution) => ({
                                    label: institution,
                                    value: institution,
                                  }))}
                                value={filterInstitution}
                                onChange={(checkedValues) =>
                                  setFilterInstitution(checkedValues)
                                }
                                className="flex flex-col gap-2 mt-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Tổng bài:
                        </label>
                        <div className="flex gap-2">
                          <div>
                            <Input
                              type="number"
                              placeholder="Từ"
                              value={filterTotalPapersFrom}
                              onChange={(e) =>
                                setFilterTotalPapersFrom(
                                  Math.max(0, e.target.value)
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                              max={Number.MAX_SAFE_INTEGER}
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Đến"
                              value={filterTotalPapersTo}
                              onChange={(e) =>
                                setFilterTotalPapersTo(
                                  Math.max(0, e.target.value)
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                              max={Number.MAX_SAFE_INTEGER}
                              defaultValue={Number.MAX_SAFE_INTEGER}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Tổng điểm:
                        </label>
                        <div className="flex gap-2">
                          <div>
                            <Input
                              type="number"
                              placeholder="Từ"
                              value={filterTotalPointsFrom}
                              onChange={(e) =>
                                setFilterTotalPointsFrom(
                                  Math.max(0, e.target.value)
                                )
                              }
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Đến"
                              value={filterTotalPointsTo}
                              onChange={(e) =>
                                setFilterTotalPointsTo(
                                  Math.max(0, e.target.value)
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
                          setFilterAuthorName("");
                          setFilterRole(["Tất cả"]);
                          setFilterInstitution(["Tất cả"]);
                          setFilterTotalPapersFrom("");
                          setFilterTotalPapersTo("");
                          setFilterPaperType(["Tất cả"]);
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
              </div>

              {loading ? (
                <div className="text-center mt-10">Loading...</div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredPapers}
                  pagination={{
                    current: currentPage,
                    pageSize: itemsPerPage,
                    total: filteredPapers.length,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  rowKey="id"
                  className="text-sm"
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={
          <div className="font-semibold">
            Chi tiết bài viết: {selectedAuthor?.author}
            <div className="text-sm font-normal text-gray-500 mt-1">
              Khoa: {selectedAuthor?.department} | Mã tác giả:{" "}
              {selectedAuthor?.authorId}
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={900}
        className="author-papers-modal"
      >
        <div className="mt-4">
          {loadingPapers ? (
            <div className="text-center my-4">Đang tải dữ liệu...</div>
          ) : (
            <>
              <div className="flex justify-end gap-4 mb-4">
                <button
                  onClick={() => downloadAuthorPapersExcel()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/724/724933.png"
                    alt="Download Icon"
                    className="w-4 h-4 invert"
                  />
                  Download
                </button>
                <button
                  onClick={printAuthorPapers}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2358/2358854.png"
                    alt="Print Icon"
                    className="w-4 h-4 invert"
                  />
                  Print
                </button>
              </div>
              <div className="flex justify-between mb-4">
                <div className="text-lg">
                  Tổng số bài:{" "}
                  <span className="font-semibold">
                    {selectedAuthor?.totalPapers || 0}
                  </span>
                </div>
                <div className="text-lg">
                  Tổng điểm:{" "}
                  <span className="font-semibold">
                    {selectedAuthor?.totalPoints || 0}
                  </span>
                </div>
              </div>
              <Table
                columns={paperColumns}
                dataSource={authorPapers}
                pagination={{ pageSize: 5 }}
                rowKey={(record) => record.id || record._id} // Ensure a unique key is used
                scroll={{ y: 400 }}
                size="small"
              />
            </>
          )}
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default ManagementPointDepartmentPage;
