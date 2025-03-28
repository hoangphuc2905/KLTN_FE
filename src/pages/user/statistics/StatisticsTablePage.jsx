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
  const [filterGroup, setFilterGroup] = useState(uniqueGroups);
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorCount, setFilterAuthorCount] = useState("");
  const uniqueRoles = [...new Set(papers.map((paper) => paper.role))];
  const [filterRole, setFilterRole] = useState(uniqueRoles);
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const uniqueInstitutions = [
    ...new Set(papers.map((paper) => paper.institution)),
  ];
  const [filterInstitution, setFilterInstitution] =
    useState(uniqueInstitutions);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const uniqueStatuses = ["Đã duyệt", "Đang chờ", "Từ chối"];
  const [filterStatus, setFilterStatus] = useState(uniqueStatuses);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

  const itemsPerPage = 10;

  const uniquePaperTypes = [...new Set(papers.map((paper) => paper.paperType))];

  const [filterPaperType, setFilterPaperType] = useState(uniquePaperTypes);
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
        console.log("Full API Response:", response); // Log the full response for debugging

        if (Array.isArray(response)) {
          console.log("API Response is an array:", response); // Log the array response
          const mappedPapers = response.map((paper) => ({
            id: paper.paper_id,
            paperType: paper.article_type?.type_name || "N/A",
            group: paper.article_group?.group_name || "N/A",
            title: paper.title_vn || "N/A",
            authors:
              paper.author?.map((author) => author.name).join(", ") || "N/A",
            authorCount: paper.author_count || "0",
            role: paper.role || "N/A", // Assuming role is part of the API response
            institution: paper.department || "N/A",
            publicationDate: paper.publish_date || "N/A",
            dateAdded: paper.createdAt || "N/A",
          }));
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
    filterStatus,
  }); // Log filter values for debugging

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterPaperType.includes("Tất cả") ||
        filterPaperType.includes(paper.paperType)) &&
      (filterGroup.includes("Tất cả") || filterGroup.includes(paper.group)) &&
      (filterPaperTitle === "" ||
        paper.title.toLowerCase().includes(filterPaperTitle.toLowerCase())) &&
      (filterAuthorName === "" ||
        paper.authors.toLowerCase().includes(filterAuthorName.toLowerCase())) &&
      (fromAuthorCount === "" || paper.authorCount >= fromAuthorCount) &&
      (toAuthorCount === "" || paper.authorCount <= toAuthorCount) &&
      (filterRole.includes("Tất cả") || filterRole.includes(paper.role)) &&
      (filterInstitution.length === 0 ||
        filterInstitution.includes(paper.institution)) &&
      (filterStatus.length === 0 || filterStatus.includes(paper.status))
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
        <Tooltip placement="topLeft" title={publicationDate}>
          {publicationDate}
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
        <Tooltip placement="topLeft" title={dateAdded}>
          {dateAdded}
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
    const tableData = filteredPapers.map((paper, index) => {
      const rowData = { STT: index + 1 };
      visibleColumns.forEach((col) => {
        switch (col) {
          case "paperType":
            rowData["Loại bài báo"] = paper.paperType;
            break;
          case "group":
            rowData["Nhóm"] = paper.group;
            break;
          case "title":
            rowData["Tên bài báo nghiên cứu khoa học"] = paper.title;
            break;
          case "authors":
            rowData["Tác giả"] = paper.authors;
            break;
          case "authorCount":
            rowData["Số tác giả"] = paper.authorCount;
            break;
          case "role":
            rowData["Vai trò"] = paper.role;
            break;
          case "institution":
            rowData["CQ đứng tên"] = paper.institution;
            break;
          case "publicationDate":
            rowData["Ngày công bố"] = paper.publicationDate;
            break;
          case "dateAdded":
            rowData["Ngày thêm"] = paper.dateAdded;
            break;
          default:
            break;
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Papers");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "papers.xlsx");
  };

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const groupFilterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const institutionFilterRef = useRef(null);
  const statusFilterRef = useRef(null);
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
        showStatusFilter &&
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target)
      ) {
        setShowStatusFilter(false);
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
    showStatusFilter,
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
                                onChange={(checkedValues) =>
                                  setFilterGroup(checkedValues)
                                }
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

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Trạng thái:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setShowStatusFilter(!showStatusFilter)
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                          >
                            Chọn trạng thái
                          </button>
                          {showStatusFilter && (
                            <div
                              ref={statusFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
                            >
                              <Checkbox
                                indeterminate={
                                  filterStatus.length > 0 &&
                                  filterStatus.length < uniqueStatuses.length
                                }
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterStatus(uniqueStatuses);
                                  } else {
                                    setFilterStatus([]);
                                  }
                                }}
                                checked={
                                  filterStatus.length === uniqueStatuses.length
                                }
                              >
                                Tất cả
                              </Checkbox>
                              <Checkbox.Group
                                options={uniqueStatuses.map((status) => ({
                                  label: status,
                                  value: status,
                                }))}
                                value={filterStatus}
                                onChange={(checkedValues) => {
                                  if (checkedValues.length === 0) {
                                    setFilterStatus([]); // Khi không chọn gì, dữ liệu sẽ trống
                                  } else if (
                                    checkedValues.length ===
                                    uniqueStatuses.length
                                  ) {
                                    setFilterStatus(uniqueStatuses); // Chọn lại tất cả
                                  } else {
                                    setFilterStatus(checkedValues);
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
                          setFilterAuthorCount("");
                          setFilterRole(uniqueRoles);
                          setFilterInstitution([]);
                          setFilterStatus(uniqueStatuses);
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
                dataSource={filteredPapers} // Ensure dataSource is set correctly
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total: filteredPapers.length,
                  onChange: (page) => setCurrentPage(page),
                }}
                rowKey="id" // Ensure rowKey matches the unique identifier
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
