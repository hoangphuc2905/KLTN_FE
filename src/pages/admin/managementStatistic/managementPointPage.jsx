import { useState, useEffect } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Input, Table, Checkbox } from "antd";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import userApi from "../../../api/api";

const ManagementPoint = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const navigate = useNavigate();
  const [visibleColumns, setVisibleColumns] = useState([
    "checkbox",
    "id",
    "department",
    "totalPapers",
    "totalPoints",
    "action",
  ]);

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

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const response =
          await userApi.getAllPaperAuthorsByTolalPointsAndTotalPapers(
            selectedYear === "Tất cả" ? null : selectedYear
          );

        // Validate response and ensure result is an array
        const data = Array.isArray(response.result) ? response.result : [];
        setPapers(
          data.map((item) => ({
            id: item["DEPARTMENT_ID"],
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
  }, [selectedYear]);

  const columnOptions = [
    { label: "STT", value: "id" },
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

  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const [filterTotalPapersFrom, setFilterTotalPapersFrom] = useState("");
  const [filterTotalPapersTo, setFilterTotalPapersTo] = useState("");
  const [filterTotalPointsFrom, setFilterTotalPointsFrom] = useState("");
  const [filterTotalPointsTo, setFilterTotalPointsTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.department)),
  ];

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterInstitution.includes("Tất cả") ||
        filterInstitution.includes(paper.department)) &&
      (filterTotalPapersFrom === "" ||
        paper.totalPapers >= parseInt(filterTotalPapersFrom)) &&
      (filterTotalPapersTo === "" ||
        paper.totalPapers <= parseInt(filterTotalPapersTo)) &&
      (filterTotalPointsFrom === "" ||
        paper.totalPoints >= parseInt(filterTotalPointsFrom)) &&
      (filterTotalPointsTo === "" ||
        paper.totalPoints <= parseInt(filterTotalPointsTo))
    );
  });

  const handleViewDetails = (departmentId, departmentName) => {
    const state = {
      departmentId,
      departmentName,
      ...(selectedYear !== "Tất cả" && { selectedYear }), // Chỉ thêm selectedYear nếu không phải "Tất cả"
    };

    navigate(`/admin/management/point/detail/${departmentId}`, { state });
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      width: 65,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      width: 270,
    },
    {
      title: "TỔNG BÀI",
      dataIndex: "totalPapers",
      key: "totalPapers",
      width: 120,
    },
    {
      title: "TỔNG ĐIỂM",
      dataIndex: "totalPoints",
      key: "totalPoints",
      width: 130,
    },
    {
      title: "XEM CHI TIẾT",
      key: "action",
      render: (text, record) => (
        <button
          onClick={() => handleViewDetails(record.id, record.department)}
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
              onChange={(e) => setSelectedYear(e.target.value)}
              className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[130px]"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Download
            </button>
            <button
              onClick={printData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2358/2358854.png"
                alt="Print Icon"
                className="w-4 h-4"
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
                          setFilterInstitution(["Tất cả"]);
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPoint;
