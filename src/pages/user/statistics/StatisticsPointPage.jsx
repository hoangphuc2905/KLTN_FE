import { useState, useEffect } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Input, Table, Checkbox, Tooltip, Modal } from "antd"; // Added Tooltip and Modal import
import { saveAs } from "file-saver";
import ExcelJS from "exceljs"; // Import ExcelJS
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";

const ManagementPoint = () => {
  const [papers, setPapers] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          console.error("Missing user_id");
          return;
        }

        const response = await userApi.getScientificPapersByAuthorId(user_id);
        console.log("Full API Response:", response);

        if (Array.isArray(response)) {
          const mappedPapers = await Promise.all(
            response.map(async (paper) => {
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

              // Filter role for the logged-in user
              const userAuthor = paper.author?.find(
                (author) => author.user_id === user_id
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
                type: paper.article_type?.type_name || "N/A",
                group: paper.article_group?.group_name || "N/A",
                title: paper.title_vn || "N/A",
                authors:
                  paper.author
                    ?.map((author) => author.author_name_vi)
                    .join(", ") || "Không có tác giả",
                authorCount: paper.author_count || "0",
                role: displayRole, // Use the mapped display role
                institution: departmentName, // Use the fetched department name
                publicationDate: formatDate(paper.publish_date), // Format publication date
                dateAdded: paper.createdAt || "N/A",
                featured: true, // Set default value
                points: points, // Use the point value from the API
              };
            })
          );
          setPapers(mappedPapers); // Map API response to match table structure
        } else {
          console.error("Unexpected API response structure:", response);
          setPapers([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching scientific papers:", error);
        setPapers([]); // Fallback to an empty array on error
      }
    };

    fetchPapers();
  }, []);

  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "checkbox",
    "id",
    "type",
    "group",
    "title",
    "authorCount",
    "role",
    "institution",
    "publicationDate",
    "points",
    "action",
  ]);

  const columnOptions = [
    { label: "STT", value: "id" },
    { label: "Loại bài báo", value: "type" },
    { label: "Nhóm", value: "group" },
    { label: "Tiêu đề", value: "title" },
    { label: "Số lượng tác giả", value: "authorCount" },
    { label: "Vai trò", value: "role" },
    { label: "Cơ quan", value: "institution" },
    { label: "Ngày xuất bản", value: "publicationDate" },
    { label: "Điểm", value: "points" },
    { label: "Xem chi tiết", value: "action" },
  ];

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };
  const navigate = useNavigate();
  const [filterRole, setFilterRole] = useState(["Tất cả"]); // Updated state
  const [showRoleFilter, setShowRoleFilter] = useState(false); // Added state
  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]); // Updated state
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false); // Added state
  const [filterTotalPapersFrom, setFilterTotalPapersFrom] = useState("");
  const [filterTotalPapersTo, setFilterTotalPapersTo] = useState("");
  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]); // Updated state
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false); // Added state
  const [filterTotalPointsFrom, setFilterTotalPointsFrom] = useState("");
  const [filterTotalPointsTo, setFilterTotalPointsTo] = useState("");
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]); // Updated state
  const [showGroupFilter, setShowGroupFilter] = useState(false); // Added state
  const [filterTitle, setFilterTitle] = useState(""); // Added missing state
  const [filterAuthorCountFrom, setFilterAuthorCountFrom] = useState(""); // Updated state
  const [filterAuthorCountTo, setFilterAuthorCountTo] = useState(""); // Updated state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const uniqueRoles = [...new Set(papers.map((paper) => paper.role))];
  const uniqueInstitutions = [
    ...new Set(papers.map((paper) => paper.institution)),
  ];
  const uniquePaperTypes = [...new Set(papers.map((paper) => paper.type))];
  const uniqueGroups = [...new Set(papers.map((paper) => paper.group))];

  const filteredPapers = papers.filter((paper) => {
    const authorCountNumeric = parseInt(paper.authorCount.split(" ")[0]); // Extract numeric part of authorCount
    return (
      (filterRole.includes("Tất cả") || filterRole.includes(paper.role)) &&
      (filterInstitution.includes("Tất cả") ||
        filterInstitution.includes(paper.institution)) &&
      (filterTotalPapersFrom === "" ||
        paper.totalPapers >= parseInt(filterTotalPapersFrom)) &&
      (filterTotalPapersTo === "" ||
        paper.totalPapers <= parseInt(filterTotalPapersTo)) &&
      (filterPaperType.includes("Tất cả") ||
        filterPaperType.includes(paper.type)) &&
      (filterTotalPointsFrom === "" ||
        paper.points >= parseInt(filterTotalPointsFrom)) &&
      (filterTotalPointsTo === "" ||
        paper.points <= parseInt(filterTotalPointsTo)) &&
      (filterGroup.includes("Tất cả") || filterGroup.includes(paper.group)) &&
      (filterTitle === "" || paper.title.includes(filterTitle)) &&
      (filterAuthorCountFrom === "" ||
        authorCountNumeric >= parseInt(filterAuthorCountFrom)) &&
      (filterAuthorCountTo === "" ||
        authorCountNumeric <= parseInt(filterAuthorCountTo))
    );
  });

  const [sortedInfo, setSortedInfo] = useState({});

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  // Function to generate point formula explanation
  const getPointFormula = (paper) => {
    // Default values if data is missing
    const basePoints = 10; // Example base point
    const authorCount = parseInt(paper.authorCount) || 1;
    const roleMultiplier = getRoleMultiplier(paper.role);

    // Calculate points based on role and author count
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

  // Helper function to get role multiplier
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

  const handleRowClick = (record) => {
    setModalContent(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      width: 75,
      fixed: "left", // Added fixed header
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
      fixed: "left", // Added fixed header
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" ? sortedInfo.order : null,
      width: 150,
      ellipsis: {
        showTitle: false,
      },
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
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      sorter: (a, b) => a.authorCount.localeCompare(b.authorCount),
      sortOrder:
        sortedInfo.columnKey === "authorCount" ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortOrder: sortedInfo.columnKey === "role" ? sortedInfo.order : null,
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (role) => (
        <Tooltip placement="topLeft" title={role}>
          {role}
        </Tooltip>
      ),
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
      sorter: (a, b) => a.institution.localeCompare(b.institution),
      sortOrder:
        sortedInfo.columnKey === "institution" ? sortedInfo.order : null,
      width: 160,
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
      render: (date) => <span>{formatDate(date)}</span>, // Ensure consistent format
    },
    {
      title: "ĐIỂM",
      dataIndex: "points",
      key: "points",
      sorter: (a, b) => a.points - b.points,
      sortOrder: sortedInfo.columnKey === "points" ? sortedInfo.order : null,
      width: 130,
      // fixed: "right", // Added fixed header
    },
    {
      title: "Xem chi tiết",
      key: "action",
      render: (text, record) => (
        <a href={`/details/${record.id}`} className="text-blue-500">
          Xem chi tiết
        </a>
      ),
      width: 130,
      // fixed: "right", // Added fixed header
    },
  ].filter((column) => visibleColumns.includes(column.key));

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Báo cáo");

    // Add title
    worksheet.mergeCells("A1", "J1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "BÁO CÁO ĐIỂM ĐÓNG GÓP";
    titleCell.font = { name: "Times New Roman", size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Add headers
    const headers = columns
      .filter((col) => col.dataIndex)
      .map((col) => col.title);
    worksheet.addRow(headers);
    headers.forEach((header, index) => {
      const cell = worksheet.getRow(2).getCell(index + 1);
      cell.font = { name: "Times New Roman", size: 12, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D9E1F2" }, // Light blue background
      };
    });

    // Add data rows
    const selectedColumns = columns.map((col) => col.dataIndex).filter(Boolean);
    filteredPapers.forEach((paper) => {
      const rowData = selectedColumns.map((col) => paper[col] || "");
      worksheet.addRow(rowData);
    });

    // Style data rows
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex > 2) {
        row.eachCell((cell) => {
          cell.font = { name: "Times New Roman", size: 12 };
          cell.alignment = { horizontal: "left", vertical: "middle" };
        });
      }
    });

    // Adjust column widths
    worksheet.columns = headers.map((header, index) => ({
      width: Math.max(
        header.length,
        ...filteredPapers.map((paper) =>
          paper[selectedColumns[index]]
            ? paper[selectedColumns[index]].toString().length
            : 10
        )
      ),
    }));

    // Save the file
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
      .map((col) => `<th>${col.title}</th>`)
      .join("");
    const tableRows = filteredPapers
      .map((paper) => {
        const rowData = columns
          .filter((col) => col.dataIndex)
          .map((col) => `<td>${paper[col.dataIndex] || ""}</td>`)
          .join("");
        return `<tr>${rowData}</tr>`;
      })
      .join("");

    const tableHTML = `
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
          <h1 style="text-align: center;">BÁO CÁO ĐIỂM ĐÓNG GÓP</h1>
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

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4">
            <select className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[110px]">
              <option value="2024">2024-2025</option>
              <option value="2023">2023-2024</option>
            </select>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Download
            </button>
            <button
              onClick={printTable}
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
              <div className="flex justify-end mb-4 relative gap-2">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => setShowFilter(!showFilter)}
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
                {showColumnFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200">
                    <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <Checkbox
                        indeterminate={
                          visibleColumns.length > 0 &&
                          visibleColumns.length < columnOptions.length
                        }
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
                      <Checkbox.Group
                        options={columnOptions}
                        value={visibleColumns}
                        onChange={handleColumnVisibilityChange}
                        className="flex flex-col gap-2 mt-2"
                      />
                    </div>
                  </div>
                )}
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg">
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Loại bài báo:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowPaperTypeFilter(!showPaperTypeFilter)
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                          >
                            Chọn loại bài báo
                          </button>
                          {showPaperTypeFilter && (
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
                              <Checkbox
                                indeterminate={
                                  filterPaperType.length > 0 &&
                                  filterPaperType.length <
                                    uniquePaperTypes.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterPaperType(uniquePaperTypes);
                                  } else {
                                    setFilterPaperType([]);
                                  }
                                }}
                                checked={
                                  filterPaperType.length ===
                                  uniquePaperTypes.length
                                }
                              >
                                Tất cả
                              </Checkbox>
                              <Checkbox.Group
                                options={uniquePaperTypes.map((type) => ({
                                  label: type,
                                  value: type,
                                }))}
                                value={filterPaperType}
                                onChange={(checkedValues) => {
                                  if (checkedValues.length === 0) {
                                    setFilterPaperType([]); // Khi không chọn gì, dữ liệu sẽ trống
                                  } else if (
                                    checkedValues.length ===
                                    uniquePaperTypes.length
                                  ) {
                                    setFilterPaperType(uniquePaperTypes); // Chọn lại tất cả
                                  } else {
                                    setFilterPaperType(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-2 mt-2"
                              />
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
                            onClick={() => setShowGroupFilter(!showGroupFilter)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                          >
                            Chọn nhóm
                          </button>
                          {showGroupFilter && (
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
                              <Checkbox
                                indeterminate={
                                  filterGroup.length > 0 &&
                                  filterGroup.length < uniqueGroups.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterGroup(uniqueGroups);
                                  } else {
                                    setFilterGroup([]);
                                  }
                                }}
                                checked={
                                  filterGroup.length === uniqueGroups.length
                                }
                              >
                                Tất cả
                              </Checkbox>
                              <Checkbox.Group
                                options={uniqueGroups.map((group) => ({
                                  label: group,
                                  value: group,
                                }))}
                                value={filterGroup}
                                onChange={(checkedValues) => {
                                  if (checkedValues.length === 0) {
                                    setFilterGroup([]); // Khi không chọn gì, dữ liệu sẽ trống
                                  } else if (
                                    checkedValues.length === uniqueGroups.length
                                  ) {
                                    setFilterGroup(uniqueGroups); // Chọn lại tất cả
                                  } else {
                                    setFilterGroup(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-2 mt-2"
                              />
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
                                Math.max(0, e.target.value)
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
                                Math.max(0, e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                            min={0}
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
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
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
                                options={uniqueRoles.map((role) => ({
                                  label: role,
                                  value: role,
                                }))}
                                value={filterRole}
                                onChange={(checkedValues) => {
                                  if (checkedValues.length === 0) {
                                    setFilterRole([]); // Khi không chọn gì, dữ liệu sẽ trống
                                  } else if (
                                    checkedValues.length === uniqueRoles.length
                                  ) {
                                    setFilterRole(uniqueRoles); // Chọn lại tất cả
                                  } else {
                                    setFilterRole(checkedValues);
                                  }
                                }}
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
                            <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2">
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
                                options={uniqueInstitutions.map(
                                  (institution) => ({
                                    label: institution,
                                    value: institution,
                                  })
                                )}
                                value={filterInstitution}
                                onChange={(checkedValues) => {
                                  if (checkedValues.length === 0) {
                                    setFilterInstitution([]); // Khi không chọn gì, dữ liệu sẽ trống
                                  } else if (
                                    checkedValues.length ===
                                    uniqueInstitutions.length
                                  ) {
                                    setFilterInstitution(uniqueInstitutions); // Chọn lại tất cả
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
                                Math.max(0, e.target.value)
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
                                Math.max(0, e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                            min={0}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterRole(["Tất cả"]); // Updated reset for filterRole
                          setFilterInstitution(["Tất cả"]); // Updated reset for filterInstitution
                          setFilterTotalPapersFrom("");
                          setFilterTotalPapersTo("");
                          setFilterPaperType(["Tất cả"]); // Updated reset for filterPaperType
                          setFilterTotalPointsFrom("");
                          setFilterTotalPointsTo("");
                          setFilterGroup(["Tất cả"]); // Updated reset for filterGroup
                          setFilterTitle(""); // Added reset for filterTitle
                          setFilterAuthorCountFrom(""); // Updated reset for filterAuthorCountFrom
                          setFilterAuthorCountTo(""); // Updated reset for filterAuthorCountTo
                        }}
                        className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
              </div>

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
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                scroll={{
                  x: columns.reduce(
                    (total, col) => total + (col.width || 0),
                    0
                  ),
                }} // Added horizontal scroll
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Chi tiết điểm"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <div className="mb-4">
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
            <strong>CQ đứng tên:</strong> {modalContent.institution}
          </p>
          <p>
            <strong>Ngày công bố:</strong> {modalContent.publicationDate}
          </p>
        </div>

        <h3 className="font-bold text-lg mb-3">Bảng điểm chi tiết</h3>
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
    </div>
  );
};

export default ManagementPoint;
