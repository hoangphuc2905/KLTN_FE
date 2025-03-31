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
} from "antd";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import userApi from "../../../api/api";

const ManagementTable = () => {
  const [papers, setPapers] = useState([]); // Initialize papers state
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const [fromAuthorCount, setFromAuthorCount] = useState("");
  const [toAuthorCount, setToAuthorCount] = useState("");
  const navigate = useNavigate();

  const [showFilter, setShowFilter] = useState(false);
  const uniqueGroups = [...new Set(papers.map((paper) => paper.group))];
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]);
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorCountFrom, setFilterAuthorCountFrom] = useState("");
  const [filterAuthorCountTo, setFilterAuthorCountTo] = useState("");
  const uniqueRoles = [...new Set(papers.map((paper) => paper.role))];
  const [filterRole, setFilterRole] = useState(["Tất cả"]);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const uniqueInstitutions = [
    ...new Set(papers.map((paper) => paper.institution)),
  ];
  const [filterInstitution, setFilterInstitution] = useState([]);

  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const itemsPerPage = 10;

  const uniquePaperTypes = [...new Set(papers.map((paper) => paper.paperType))];

  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]);
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false);

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
              const userRole =
                paper.author?.find((author) => author.user_id === user_id)
                  ?.role || "N/A";

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
                role: userRole, // Use the role of the logged-in user
                institution: departmentName, // Use the fetched department name
                publicationDate: paper.publish_date || "N/A",
                dateAdded: paper.createdAt || "N/A",
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

  console.log("Mapped Papers:", papers); // Log mapped papers for debugging
  console.log("Filter Values:", {
    filterPaperType,
    filterGroup,
    filterPaperTitle,
    filterAuthorName,
    fromAuthorCount,
    toAuthorCount,
    filterRole,
    filterInstitution,
  }); // Log filter values for debugging

  const filteredPapers = papers.filter((paper) => {
    const authorNames = paper.authors?.toLowerCase() || ""; // Combine author names for filtering
    const authorCount = parseInt(paper.authorCount || 0); // Extract author count

    return (
      (filterPaperType.includes("Tất cả") || // Fix logic for "Tất cả"
        filterPaperType.some((type) => type === paper.paperType)) &&
      (filterGroup.includes("Tất cả") || filterGroup.includes(paper.group)) &&
      (filterPaperTitle === "" ||
        paper.title.toLowerCase().includes(filterPaperTitle.toLowerCase())) &&
      (filterAuthorName === "" ||
        authorNames.includes(filterAuthorName.toLowerCase())) &&
      (fromAuthorCount === "" || authorCount >= parseInt(fromAuthorCount)) && // Fix filter logic for "from"
      (toAuthorCount === "" || authorCount <= parseInt(toAuthorCount)) && // Fix filter logic for "to"
      (filterRole.includes("Tất cả") || filterRole.includes(paper.role)) &&
      (filterInstitution.length === 0 ||
        filterInstitution.includes(paper.institution))
    );
  });

  console.log("Filtered Papers:", filteredPapers); // Log filtered data for debugging

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

  const maxAuthorCount = Math.max(
    ...papers.map(
      (paper) =>
        paper.authorCount
          ? parseInt(paper.authorCount.match(/\d+/)?.[0] || 0) // Safely parse authorCount
          : 0 // Default to 0 if authorCount is undefined
    )
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
      render: (text, record, index) => index + 1,
      width: 75,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "paperType",
      key: "paperType",
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.authorCount.localeCompare(b.authorCount),
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
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
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
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded),
      render: (dateAdded) => (
        <Tooltip placement="topLeft" title={formatDate(dateAdded)}>
          {formatDate(dateAdded)}
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

  const checkedList = columns.map((col) => col.key);

  const newColumns = columns.filter((item) => checkedList.includes(item.key));

  const handleColumnVisibilityChange = (selectedColumns) => {
    setVisibleColumns(selectedColumns);
    if (selectedColumns.length === 0) {
      setFilterInstitution([]);
    }
  };

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã duyệt":
        return "text-green-600";
      case "Đang chờ":
        return "text-yellow-600";
      case "Từ chối":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleDownload = () => {
    const selectedColumns = columns
      .filter((col) => visibleColumns.includes(col.key))
      .map((col) => col.dataIndex);

    const headers = columns
      .filter((col) => visibleColumns.includes(col.key))
      .map((col) => col.title);

    const tableData = filteredPapers.map((paper) => {
      const rowData = {};
      selectedColumns.forEach((col) => {
        rowData[col] = paper[col] || "";
      });
      return rowData;
    });

    const finalData = [
      headers,
      ...tableData.map((row) => selectedColumns.map((col) => row[col])),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(finalData);

    const columnWidths = headers.map((header, index) => ({
      wch: Math.max(
        header.length,
        ...tableData.map((row) =>
          row[selectedColumns[index]]
            ? row[selectedColumns[index]].toString().length
            : 10
        )
      ),
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Papers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Papers_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
              Dạng bảng
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4">
            <select className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[85px]">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <button
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={handleDownload}
            >
              Download
            </button>
            <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg">
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
                            <div
                              ref={paperTypeFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
                            >
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
                                  if (checkedValues.includes("Tất cả")) {
                                    setFilterPaperType(["Tất cả"]); // Select all if "Tất cả" is selected
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
                            <div
                              ref={groupFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
                            >
                              <Checkbox
                                indeterminate={
                                  filterGroup.length > 0 &&
                                  filterGroup.length < uniqueGroups.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterGroup(["Tất cả", ...uniqueGroups]); // Include "Tất cả" when selecting all
                                  } else {
                                    setFilterGroup([]); // Clear all selections
                                  }
                                }}
                                checked={filterGroup.includes("Tất cả")}
                              >
                                Tất cả
                              </Checkbox>
                              <Checkbox.Group
                                options={uniqueGroups.map((group) => ({
                                  label: group,
                                  value: group,
                                }))}
                                value={filterGroup.filter(
                                  (group) => group !== "Tất cả"
                                )} // Exclude "Tất cả" from the group list
                                onChange={(checkedValues) => {
                                  if (
                                    checkedValues.length === uniqueGroups.length
                                  ) {
                                    setFilterGroup([
                                      "Tất cả",
                                      ...checkedValues,
                                    ]); // Add "Tất cả" if all groups are selected
                                  } else {
                                    setFilterGroup(checkedValues); // Update with selected groups
                                  }
                                }}
                                className="flex flex-col gap-2 mt-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Tên bài báo:
                        </label>
                        <Input
                          type="text"
                          value={filterPaperTitle}
                          onChange={(e) => setFilterPaperTitle(e.target.value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>

                      <div>
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

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Số tác giả:
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={fromAuthorCount} // Bind to fromAuthorCount
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!isNaN(value) && value >= 0) {
                                setFromAuthorCount(value); // Update fromAuthorCount directly
                              }
                            }}
                            placeholder="Từ"
                            min={0}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                          />
                          <Input
                            type="number"
                            value={toAuthorCount} // Bind to toAuthorCount
                            onChange={(e) => {
                              const value = e.target.value;
                              if (!isNaN(value) && value >= 0) {
                                setToAuthorCount(value); // Update toAuthorCount directly
                              }
                            }}
                            placeholder="Đến"
                            min={0}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[145px] max-md:w-full max-md:max-w-[145px] max-sm:w-full text-xs"
                          />
                        </div>
                      </div>

                      <div>
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
                                options={uniqueRoles.map((role) => ({
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

                      <div>
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
                                    setFilterInstitution([
                                      "Tất cả",
                                      ...uniqueInstitutions,
                                    ]); // Include "Tất cả" when selecting all
                                  } else {
                                    setFilterInstitution([]); // Clear all selections
                                  }
                                }}
                                checked={filterInstitution.includes("Tất cả")}
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
                                value={filterInstitution.filter(
                                  (institution) => institution !== "Tất cả"
                                )} // Exclude "Tất cả" from the institution list
                                onChange={(checkedValues) => {
                                  if (
                                    checkedValues.length ===
                                    uniqueInstitutions.length
                                  ) {
                                    setFilterInstitution([
                                      "Tất cả",
                                      ...checkedValues,
                                    ]); // Add "Tất cả" if all institutions are selected
                                  } else if (checkedValues.length === 0) {
                                    setFilterInstitution([]); // Clear all selections
                                  } else {
                                    setFilterInstitution(checkedValues); // Update with selected institutions
                                  }
                                }}
                                className="flex flex-col gap-2 mt-2"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterPaperType(["Tất cả"]);
                          setFilterGroup(["Tất cả"]);
                          setFilterPaperTitle("");
                          setFilterAuthorName("");
                          setFilterAuthorCountFrom(""); // Clear "Từ" field
                          setFilterAuthorCountTo(""); // Clear "Đến" field
                          setFromAuthorCount(""); // Clear state for "Từ"
                          setToAuthorCount(""); // Clear state for "Đến"
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
                        indeterminate={
                          visibleColumns.length > 0 &&
                          visibleColumns.length < columns.length
                        }
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
                      <Checkbox.Group
                        options={columnOptions}
                        value={visibleColumns}
                        onChange={handleColumnVisibilityChange}
                        className="flex flex-col gap-2 mt-2"
                      />
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              <Table
                columns={filteredColumns}
                dataSource={
                  filteredPapers.length > 0 && visibleColumns.length > 0
                    ? filteredPapers
                    : []
                } // Show no data if no filters or columns are selected
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total:
                    filteredPapers.length > 0 && visibleColumns.length > 0
                      ? filteredPapers.length
                      : 0, // Adjust pagination
                  onChange: (page) => setCurrentPage(page),
                }}
                rowKey={(record) => record.id || record.key} // Ensure rowKey is unique
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
      <Modal
        title="Chi tiết"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>
          <strong>Loại bài báo:</strong> {modalContent.paperType}
        </p>
        <p>
          <strong>Thuộc nhóm:</strong> {modalContent.group}
        </p>
        <p>
          <strong>Tên bài báo nghiên cứu khoa học:</strong> {modalContent.title}
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
          <strong>Ngày công bố:</strong> {modalContent.publicationDate}
        </p>
        <p>
          <strong>Ngày thêm:</strong> {modalContent.dateAdded}
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

export default ManagementTable;
