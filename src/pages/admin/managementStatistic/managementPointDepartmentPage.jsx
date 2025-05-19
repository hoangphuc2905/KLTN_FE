import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import { Filter, ChevronDown } from "lucide-react";
import { Input, Table, Checkbox, Modal, Spin, Select } from "antd";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

      const data = response.result || [];
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
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    setCurrentPage(1);
    fetchPapers(value);
  };

  useEffect(() => {
    fetchPapers(selectedYear);
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
  const [filterAuthorId, setFilterAuthorId] = useState("");
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

  const [uniqueRoles, setUniqueRoles] = useState(["Tất cả"]);
  const [uniqueInstitutions, setUniqueInstitutions] = useState(["Tất cả"]);
  const [uniquePaperTypes, setUniquePaperTypes] = useState(["Tất cả"]);

  useEffect(() => {
    const roles = ["Tất cả", ...new Set(papers.map((paper) => paper.position))];
    const institutions = [
      "Tất cả",
      ...new Set(papers.map((paper) => paper.department)),
    ];
    const paperTypes = [
      "Tất cả",
      ...new Set(papers.map((paper) => paper.journalType)),
    ];
    setUniqueRoles(roles);
    setUniqueInstitutions(institutions);
    setUniquePaperTypes(paperTypes);
  }, [papers]);

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterAuthorName === "" ||
        paper.author.toLowerCase().includes(filterAuthorName.toLowerCase())) &&
      (filterAuthorId === "" ||
        paper.authorId.toLowerCase().includes(filterAuthorId.toLowerCase())) &&
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
    setCurrentPage(pagination.current);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorPapers, setAuthorPapers] = useState([]);
  const [loadingPapers, setLoadingPapers] = useState(false);

  const roleMapping = {
    MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
    CorrespondingAuthor: "Liên hệ",
    MainAuthor: "Chính",
    Participant: "Tham gia",
  };

  const handleViewDetails = async (author) => {
    setSelectedAuthor(author);
    setIsModalVisible(true);
    setLoadingPapers(true);
    try {
      const response = await userApi.getScientificPapersByAuthorId(
        author.authorId,
        selectedYear === "Tất cả" ? undefined : selectedYear
      );
      const papers = response.scientificPapers || [];
      const mappedPapers = await Promise.all(
        papers
          .filter((paper) => paper.status === "approved")
          .map(async (paper) => {
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
              (authorItem) => authorItem.user_id === author.authorId
            );
            const userRole = userAuthor?.role || "N/A";
            const points = userAuthor?.point || 0;

            const displayRole = roleMapping[userRole] || userRole;

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
      setAuthorPapers(mappedPapers);
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      setAuthorPapers([]);
    } finally {
      setLoadingPapers(false);
    }
  };

  const paperColumns = [
    {
      title: "Tên bài viết",
      dataIndex: "title_vn",
      key: "title_vn",
      width: 300,
    },
    {
      title: "Loại bài",
      dataIndex: "magazine_type",
      key: "magazine_type",
      width: 150,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 150,
    },
    {
      title: "CQ đứng tên",
      dataIndex: "institution",
      key: "institution",
      width: 200,
    },
    {
      title: "Điểm",
      dataIndex: "point",
      key: "point",
      width: 100,
    },
  ];

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
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
      render: (text) => parseFloat(text).toFixed(1),
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

    filteredPapers.forEach((paper, index) => {
      const rowData = visibleColumnsList.map((column) => {
        if (column.dataIndex === "id") {
          return (currentPage - 1) * pageSize + index + 1;
        }
        return paper[column.dataIndex] || "";
      });

      const row = worksheet.addRow(rowData);

      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Times New Roman", size: 12 };
        if (colNumber === 1) {
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
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    worksheet.columns.forEach((column, index) => {
      let maxLength = 0;
      maxLength = Math.max(
        maxLength,
        headers[index] ? headers[index].length : 0
      );

      filteredPapers.forEach((paper, rowIndex) => {
        const columnName = visibleColumnsList[index]?.dataIndex;
        if (columnName === "id") {
          maxLength = Math.max(
            maxLength,
            String((currentPage - 1) * pageSize + rowIndex + 1).length
          );
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
      .map((paper, index) => {
        const rowData = columns
          .filter((col) => col.dataIndex)
          .map((col) => {
            if (col.dataIndex === "id") {
              return `<td style="border: 1px solid #ddd; padding: 8px;">${
                (currentPage - 1) * pageSize + index + 1
              }</td>`;
            }
            return `<td style="border: 1px solid #ddd; padding: 8px;">${
              paper[col.dataIndex] || ""
            }</td>`;
          })
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

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Chi tiết bài viết");

      const headers = [
        "Tên bài viết",
        "Loại bài",
        "Vai trò",
        "CQ đứng tên",
        "Điểm",
      ];

      const currentDate = new Date();
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`;

      worksheet.mergeCells("A1", "E7");
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

      worksheet.mergeCells("A9", "C9");
      const authorInfoCell = worksheet.getCell("A9");
      authorInfoCell.value = `Tác giả: ${selectedAuthor.author} | Mã tác giả: ${selectedAuthor.authorId}`;
      authorInfoCell.font = { name: "Times New Roman", size: 11 };
      authorInfoCell.alignment = { horizontal: "left", vertical: "middle" };

      worksheet.mergeCells("A10", "C10");
      const departmentInfoCell = worksheet.getCell("A10");
      departmentInfoCell.value = `Khoa: ${selectedAuthor.department}`;
      departmentInfoCell.font = { name: "Times New Roman", size: 11 };
      departmentInfoCell.alignment = { horizontal: "left", vertical: "middle" };

      worksheet.mergeCells("A11", "C11");
      const totalPapersCell = worksheet.getCell("A11");
      totalPapersCell.value = `Tổng số bài: ${
        selectedAuthor.totalPapers || 0
      } | Tổng điểm: ${selectedAuthor.totalPoints || 0}`;
      totalPapersCell.font = { name: "Times New Roman", size: 11, bold: true };
      totalPapersCell.alignment = { horizontal: "left", vertical: "middle" };

      worksheet.mergeCells("A13", "E13");
      const titleCell = worksheet.getCell("A13");
      titleCell.value = "CHI TIẾT BÀI VIẾT CỦA TÁC GIẢ";
      titleCell.font = { name: "Times New Roman", size: 16, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCEEFF" },
      };

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

      authorPapers.forEach((paper) => {
        const rowData = [
          paper.title_vn || "N/A",
          paper.magazine_type || "N/A",
          paper.role || "N/A",
          paper.institution || "N/A",
          paper.point || 0,
        ];

        const row = worksheet.addRow(rowData);

        row.eachCell((cell, colNumber) => {
          cell.font = { name: "Times New Roman", size: 12 };
          if (colNumber === 5) {
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

      worksheet.getColumn(1).width = 50;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 20;
      worksheet.getColumn(4).width = 30;
      worksheet.getColumn(5).width = 10;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const fileName = `ChiTiet_TacGia_${selectedAuthor.authorId}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      saveAs(blob, fileName);
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
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto max-lg:max-w-full max-lg:px-4">
        <div className="w-full bg-white">
          <Header />
        </div>
        <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4">
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

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-lg:px-4 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4 items-center max-sm:flex-wrap">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[115px] max-sm:w-auto"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg max-sm:w-auto"
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
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg max-sm:w-auto"
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
              <div className="flex justify-end mb-4 relative gap-2 flex-wrap">
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
                {showColumnFilter && (
                  <div
                    ref={columnFilterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                  >
                    <div className="px-4 py-5 w-full max-w-[350px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAllChange}
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
                {showFilter && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg"
                  >
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3 rounded-lg border border-gray-200">
                      <div className="max-h-[400px] overflow-y-auto pr-1">
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
                            Mã tác giả:
                          </label>
                          <Input
                            type="text"
                            value={filterAuthorId}
                            onChange={(e) => setFilterAuthorId(e.target.value)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                          />
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
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterAuthorName("");
                          setFilterAuthorId("");
                          setFilterTotalPapersFrom("");
                          setFilterTotalPapersTo("");
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
                <div className="flex justify-center items-center h-64">
                  <Spin size="large">
                    <div className="p-8 text-center">Đang tải dữ liệu...</div>
                  </Spin>
                </div>
              ) : (
                <Table
                  columns={columns}
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
                  rowKey="id"
                  className="text-sm"
                  onChange={handleChange}
                  onRow={(record) => ({
                    onClick: () => handleViewDetails(record),
                  })}
                  scroll={{
                    x: columns.reduce(
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
        width={1000}
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
                    {selectedAuthor?.totalPoints
                      ? parseFloat(selectedAuthor.totalPoints).toFixed(1)
                      : "0"}
                  </span>
                </div>
              </div>
              <Table
                columns={paperColumns}
                dataSource={authorPapers}
                pagination={{ pageSize: 5 }}
                rowKey={(record) => record.id || record._id}
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
