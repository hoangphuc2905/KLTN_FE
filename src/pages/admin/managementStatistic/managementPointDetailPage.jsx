import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import { Filter } from "lucide-react";
import { Input, Table, Checkbox, Modal, Spin, Divider } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import userApi from "../../../api/api";
import Footer from "../../../components/Footer";

const ManagementPointDetailPage = () => {
  const location = useLocation();
  const { departmentId, departmentName, selectedYear } = location.state || {};
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

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);

  const columnOptions = [
    { label: "STT", value: "id" },
    { label: "MÃ TÁC GIẢ", value: "authorId" },
    { label: "TÁC GIẢ", value: "author" },
    { label: "KHOA", value: "department" },
    { label: "TỔNG BÀI", value: "totalPapers" },
    { label: "TỔNG ĐIỂM", value: "totalPoints" },
    { label: "XEM CHI TIẾT", value: "action" },
  ];

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      sorter: (a, b) => a.id - b.id,
      width: 65,
    },
    {
      title: "MÃ TÁC GIẢ",
      dataIndex: "authorId",
      key: "authorId",
      sorter: (a, b) => a.authorId.localeCompare(b.authorId),
      width: 150,
    },
    {
      title: "TÊN TÁC GIẢ",
      dataIndex: "author",
      key: "author",
      sorter: (a, b) => a.author.localeCompare(b.author),
      width: 250,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
      width: 270,
    },
    {
      title: "TỔNG BÀI",
      dataIndex: "totalPapers",
      key: "totalPapers",
      sorter: (a, b) => a.totalPapers - b.totalPapers,
      width: 120,
    },
    {
      title: "TỔNG ĐIỂM",
      dataIndex: "totalPoints",
      key: "totalPoints",
      sorter: (a, b) => a.totalPoints - b.totalPoints,
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

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        if (!departmentId) {
          console.error(`Error: Missing departmentId`);
          return;
        }
        const response = await userApi.getPaperAuthorsByDepartment(
          departmentId,
          selectedYear || null
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
        console.error("Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [departmentId, selectedYear]);

  // Handle column selection
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
  };

  // Filter states
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorId, setFilterAuthorId] = useState("");
  const [filterTotalPapersFrom, setFilterTotalPapersFrom] = useState("");
  const [filterTotalPapersTo, setFilterTotalPapersTo] = useState("");
  const [filterTotalPointsFrom, setFilterTotalPointsFrom] = useState("");
  const [filterTotalPointsTo, setFilterTotalPointsTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortedInfo, setSortedInfo] = useState({});
  const itemsPerPage = 10;

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  // Filter papers
  const filteredPapers = papers.filter((paper) => {
    const totalPapers = parseInt(paper.totalPapers) || 0;
    const totalPoints = parseFloat(paper.totalPoints) || 0;
    const papersFrom = parseInt(filterTotalPapersFrom) || 0;
    const papersTo = parseInt(filterTotalPapersTo) || Infinity;
    const pointsFrom = parseFloat(filterTotalPointsFrom) || 0;
    const pointsTo = parseFloat(filterTotalPointsTo) || Infinity;

    return (
      (filterAuthorName === "" ||
        paper.author.toLowerCase().includes(filterAuthorName.toLowerCase())) &&
      (filterAuthorId === "" ||
        paper.authorId.toLowerCase().includes(filterAuthorId.toLowerCase())) &&
      totalPapers >= papersFrom &&
      totalPapers <= papersTo &&
      totalPoints >= pointsFrom &&
      totalPoints <= pointsTo
    );
  });

  // Modal for author details
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
        selectedYear
      );
      const scientificPapers = response?.scientificPapers || [];
      const mappedPapers = await Promise.all(
        scientificPapers
          .filter((paper) => paper.status === "approved")
          .map(async (paper) => {
            const userAuthor = paper.author?.find(
              (authorItem) => authorItem.user_id === author.authorId
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
              title_vn: paper.title_vn || "N/A",
              magazine_type: paper.article_type?.type_name || "N/A",
              point: points,
              role: displayRole,
              institution: departmentName || "N/A",
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
      key: "title",
      width: 300,
    },
    {
      title: "Loại bài",
      dataIndex: "magazine_type",
      key: "type",
      width: 150,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 150,
    },
    {
      title: "Cơ quan đứng tên",
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

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo");

    const visibleColumnsList = columns.filter(
      (col) => col.key !== "action" && col.dataIndex
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
    titleCell.value = "BÁO CÁO ĐIỂM ĐÓNG GÓP CHI TIẾT";
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
        if (column.key === "id") {
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
    const fileName = `BaoCao_DiemDongGop_ChiTiet_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    saveAs(blob, fileName);
  };

  const printData = () => {
    const printWindow = window.open("", "_blank");
    const tableHeaders = columns
      .filter((col) => col.key !== "action")
      .map(
        (col) =>
          `<th style="border: 1px solid #ddd; padding: 8px;">${col.title}</th>`
      )
      .join("");
    const tableRows = filteredPapers
      .map((paper) => {
        const rowData = columns
          .filter((col) => col.key !== "action")
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
          <h1 style="text-align: center;">BÁO CÁO ĐIỂM ĐÓNG GÓP CHI TIẾT</h1>
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

  const downloadAuthorPapersExcel = async () => {
    if (!selectedAuthor || authorPapers.length === 0) {
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Chi tiết bài viết");

    const headers = [
      "Tên bài viết",
      "Loại bài",
      "Vai trò",
      "Cơ quan đứng tên",
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter, showColumnFilter]);

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
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
              onClick={() => navigate("/admin/management/chart")}
              className="cursor-pointer hover:text-blue-500"
            >
              Thống kê
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span
              onClick={() => navigate("/admin/management/point")}
              className="cursor-pointer hover:text-blue-500"
            >
              Điểm đóng góp
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Chi tiết điểm đóng góp
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end items-center gap-4 mb-4">
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
                {showColumnFilter && (
                  <div
                    ref={columnFilterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200 max-sm:w-full"
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
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
                {showFilter && (
                  <div
                    ref={filterRef}
                    className="absolute top-full mt-2 z-50 shadow-lg max-sm:w-full"
                  >
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3 rounded-lg border border-gray-200">
                      <div className="max-h-[500px] overflow-y-auto pr-1">
                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Tên tác giả:
                          </label>
                          <Input
                            type="text"
                            placeholder="Nhập tên tác giả"
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
                            placeholder="Nhập mã tác giả"
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
                            <Input
                              type="number"
                              placeholder="Từ"
                              value={filterTotalPapersFrom}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || parseInt(value) >= 0) {
                                  setFilterTotalPapersFrom(value);
                                }
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                            <Input
                              type="number"
                              placeholder="Đến"
                              value={filterTotalPapersTo}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || parseInt(value) >= 0) {
                                  setFilterTotalPapersTo(value);
                                }
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-gray-700 text-xs">
                            Tổng điểm:
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Từ"
                              value={filterTotalPointsFrom}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || parseFloat(value) >= 0) {
                                  setFilterTotalPointsFrom(value);
                                }
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                              step="0.1"
                            />
                            <Input
                              type="number"
                              placeholder="Đến"
                              value={filterTotalPointsTo}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || parseFloat(value) >= 0) {
                                  setFilterTotalPointsTo(value);
                                }
                              }}
                              className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                              min={0}
                              step="0.1"
                            />
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
                      </div>
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
                    pageSize: itemsPerPage,
                    total: filteredPapers.length,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  rowKey={(record) => record.id}
                  className="text-sm"
                  onChange={handleChange}
                  scroll={{
                    x: columns.reduce(
                      (total, col) => total + (col.width || 100),
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
              Khoa: {departmentName} | Mã tác giả: {selectedAuthor?.authorId}
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
            <div className="flex justify-center items-center h-64">
              <Spin size="large">
                <div className="p-8 text-center">Đang tải dữ liệu...</div>
              </Spin>
            </div>
          ) : (
            <>
              <div className="flex justify-end items-center gap-4 mb-4">
                <button
                  onClick={downloadAuthorPapersExcel}
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                rowKey={(record) => record.id}
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

export default ManagementPointDetailPage;
