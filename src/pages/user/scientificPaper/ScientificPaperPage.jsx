import { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Input, Table, Checkbox, Divider, Tooltip, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";

const ScientificPaperPage = () => {
  const [papers, setPapers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]);
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false);
  const paperTypeFilterRef = useRef(null);
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
  const groupFilterRef = useRef(null);
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorCountFrom, setFilterAuthorCountFrom] = useState("");
  const [filterAuthorCountTo, setFilterAuthorCountTo] = useState("");
  const [filterRole, setFilterRole] = useState(["Tất cả"]);
  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const institutionFilterRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState(["Tất cả"]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const statusFilterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

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
          setPapers(response); // Directly set the response as papers
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

  const navigate = useNavigate();
  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(
      (papers || []).map((paper) => paper.article_type?.type_name || "")
    ),
  ];
  const uniqueGroups = [
    "Tất cả",
    ...new Set(
      (papers || []).map((paper) => paper.article_group?.group_name || "")
    ),
  ];
  const uniqueRoles = [
    "Tất cả",
    "Chính",
    "Liên hệ",
    "Vừa chính vừa liên hệ",
    "Tham gia",
  ];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(
      (papers || [])
        .flatMap(
          (paper) =>
            paper.author?.map((auth) => auth.work_unit_id?.name_vi) || []
        )
        .filter(Boolean)
    ),
  ];
  const uniqueStatuses = [
    "Tất cả",
    { value: "approved", label: "Đã duyệt", color: "text-green-600" },
    { value: "pending", label: "Đang chờ", color: "text-yellow-600" },
    { value: "refused", label: "Từ chối", color: "text-red-600" },
    { value: "revision", label: "Chờ chỉnh sửa", color: "text-orange-600" },
  ];

  const handleFilterDropdownOpen = (filterType) => {
    switch (filterType) {
      case "paperType":
        setFilterPaperType(uniquePaperTypes);
        setShowPaperTypeFilter(true);
        break;
      case "group":
        setFilterGroup(uniqueGroups);
        setShowGroupFilter(true);
        break;
      case "role":
        setFilterRole(uniqueRoles);
        setShowRoleFilter(true);
        break;
      case "institution":
        setFilterInstitution(uniqueInstitutions);
        setShowInstitutionFilter(true);
        break;
      case "status":
        setFilterStatus(uniqueStatuses);
        setShowStatusFilter(true);
        break;
      default:
        break;
    }
  };

  const filteredPapers = (papers || [])
    .filter((paper) => {
      // Filter papers based on the active tab
      if (activeTab === "Đã duyệt" && paper.status !== "approved") return false;
      if (activeTab === "Đang chờ" && paper.status !== "pending") return false;
      if (activeTab === "Chờ chỉnh sửa" && paper.status !== "revision")
        return false;
      if (activeTab === "Từ chối" && paper.status !== "refused") return false;
      return true;
    })
    .filter((paper) => {
      // Apply filters to the filtered papers
      const authorNames =
        paper.author?.map((auth) => auth.author_name_vi).join(", ") || ""; // Combine author names for filtering
      const authorCount = parseInt(paper.author_count?.split("(")[0] || 0); // Extract author count

      return (
        (filterPaperType.includes("Tất cả") ||
          filterPaperType.includes(paper.article_type?.type_name)) &&
        (filterGroup.includes("Tất cả") ||
          filterGroup.includes(paper.article_group?.group_name)) &&
        (filterPaperTitle === "" ||
          paper.title_vn
            ?.toLowerCase()
            .includes(filterPaperTitle.toLowerCase())) &&
        (filterAuthorName === "" ||
          authorNames.toLowerCase().includes(filterAuthorName.toLowerCase())) &&
        (filterAuthorCountFrom === "" ||
          authorCount >= parseInt(filterAuthorCountFrom)) &&
        (filterAuthorCountTo === "" ||
          authorCount <= parseInt(filterAuthorCountTo)) &&
        (filterRole.includes("Tất cả") ||
          filterRole.some((role) =>
            paper.author?.some((auth) => auth.role === role)
          )) &&
        (filterInstitution.includes("Tất cả") ||
          filterInstitution.some((institution) =>
            paper.author?.some(
              (auth) => auth.work_unit_id?.name_vi === institution
            )
          ))
      );
    });

  const handleRowClick = (record) => {
    const paperId = record.id || record._id;
    if (!paperId) {
      console.error("Paper ID is undefined:", record);
      return;
    }

    if (record.status === "approved") {
      navigate(`/scientific-paper/${paperId}`);
    } else if (record.status === "revision") {
      navigate(`/scientific-paper/edit/${paperId}`);
    } else {
      setModalContent(record);
      setIsModalVisible(true);
    }
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      width: 65,
      fixed: "left", // Fix this column to the left
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "article_type", // Truy cập vào article_type
      key: "paperType",
      sorter: (a, b) =>
        a.article_type?.type_name.localeCompare(b.article_type?.type_name),
      sortOrder: sortedInfo.columnKey === "paperType" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (article_type) => (
        <Tooltip placement="topLeft" title={article_type?.type_name}>
          {article_type?.type_name || "Không có dữ liệu"}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "article_group", // Truy cập vào article_group
      key: "group",
      sorter: (a, b) =>
        a.article_group?.group_name.localeCompare(b.article_group?.group_name),
      sortOrder: sortedInfo.columnKey === "group" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (article_group) => (
        <Tooltip placement="topLeft" title={article_group?.group_name}>
          {article_group?.group_name || "Không có dữ liệu"}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title_vn",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
      width: 300,
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "author",
      key: "authors",
      sorter: (a, b) =>
        a.authors
          ?.map((author) => author.author_name_vi)
          .join(", ")
          .localeCompare(
            b.authors?.map((author) => author.author_name_vi).join(", ")
          ),
      sortOrder: sortedInfo.columnKey === "authors" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (authors) => {
        if (!authors || authors.length === 0) {
          return "Không có dữ liệu"; // Xử lý trường hợp authors không có dữ liệu
        }
        const authorNames = authors
          ?.map((author) => author.author_name_vi)
          .join(", "); // Lấy danh sách tên tác giả
        return (
          <Tooltip placement="topLeft" title={authorNames}>
            {authorNames}
          </Tooltip>
        );
      },
      width: 200,
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "author_count",
      key: "authorCount",
      sorter: (a, b) => {
        const countA = parseInt(a.author_count?.split("(")[0] || 0);
        const countB = parseInt(b.author_count?.split("(")[0] || 0);
        return countA - countB;
      },
      sortOrder:
        sortedInfo.columnKey === "authorCount" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (author_count) => {
        if (!author_count) {
          return "Không có dữ liệu";
        }
        return (
          <Tooltip placement="topLeft" title={author_count}>
            {author_count}
          </Tooltip>
        );
      },
      width: 100,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "author", // Truy cập vào mảng author
      key: "role",
      sorter: (a, b) => {
        const userId = localStorage.getItem("user_id");
        const roleA =
          a.author?.find((auth) => auth.user_id === userId)?.role || "";
        const roleB =
          b.author?.find((auth) => auth.user_id === userId)?.role || "";
        return roleA.localeCompare(roleB);
      },
      sortOrder: sortedInfo.columnKey === "role" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (author) => {
        const userId = localStorage.getItem("user_id"); // Lấy user_id từ localStorage
        const userRole = author?.find((auth) => auth.user_id === userId)?.role; // Tìm role của user_id
        const roleMapping = {
          MainAuthor: "Chính",
          CorrespondingAuthor: "Liên hệ",
          MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
          Participant: "Tham gia",
        };
        const translatedRole = roleMapping[userRole] || "Không có dữ liệu";
        return (
          <Tooltip placement="topLeft" title={translatedRole}>
            {translatedRole}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "author", // Truy cập vào mảng author
      key: "institution",
      sorter: (a, b) => {
        const nameA = a.author?.[0]?.work_unit_id?.name_vi || ""; // Lấy name_vi từ author đầu tiên
        const nameB = b.author?.[0]?.work_unit_id?.name_vi || "";
        return nameA.localeCompare(nameB);
      },
      sortOrder:
        sortedInfo.columnKey === "institution" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (author) => {
        const nameVi = author?.[0]?.work_unit_id?.name_vi; // Lấy name_vi từ author đầu tiên
        if (!nameVi) {
          return "Không có dữ liệu"; // Xử lý trường hợp không có dữ liệu
        }
        return (
          <Tooltip placement="topLeft" title={nameVi}>
            {nameVi}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publish_date", // Truy cập vào trường publish_date
      key: "publicationDate",
      sorter: (a, b) => new Date(a.publish_date) - new Date(b.publish_date),
      sortOrder:
        sortedInfo.columnKey === "publicationDate" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (publish_date) => {
        if (!publish_date) {
          return "Không có dữ liệu"; // Xử lý trường hợp không có ngày công bố
        }
        const formattedDate = new Date(publish_date).toLocaleDateString(
          "vi-VN"
        ); // Định dạng ngày theo kiểu dd/mm/yyyy
        return (
          <Tooltip placement="topLeft" title={formattedDate}>
            {formattedDate}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "MINH CHỨNG",
      key: "evidence",
      render: () => (
        <div className="flex-col text-[#00A3FF]">
          <button className="hover:underline">Xem link|</button>
          <button className="hover:underline">Xem file</button>
        </div>
      ),
      width: 150,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      render: (status) => {
        const statusObj = uniqueStatuses.find((s) => s.value === status);
        return (
          <span className={`${getStatusColor(status)}`}>
            {statusObj ? statusObj.label : "Không có dữ liệu"}
          </span>
        );
      },
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "createdAt", // Truy cập vào trường createdAt
      key: "dateAdded",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: sortedInfo.columnKey === "dateAdded" ? sortedInfo.order : null,
      ellipsis: {
        showTitle: false,
      },
      render: (createdAt) => {
        if (!createdAt) {
          return "Không có dữ liệu"; // Xử lý trường hợp không có ngày thêm
        }
        const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN"); // Định dạng ngày theo kiểu dd/mm/yyyy
        return (
          <Tooltip placement="topLeft" title={formattedDate}>
            {formattedDate}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (text, record) => (
        <button
          className="text-[#00A3FF]"
          onClick={() => handleRowClick(record)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7167 7.51667L12.4833 8.28333L4.93333 15.8333H4.16667V15.0667L11.7167 7.51667ZM14.7167 2.5C14.5083 2.5 14.2917 2.58333 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C15.1417 2.575 14.9333 2.5 14.7167 2.5ZM11.7167 5.15833L2.5 14.375V17.5H5.625L14.8417 8.28333L11.7167 5.15833Z"
              fill="currentColor"
            />
          </svg>
        </button>
      ),
      width: 120,
      align: "center",
    },
    {
      title: "GHI CHÚ",
      dataIndex: "note",
      key: "note",
      render: (note) => <span className="text-red-600">{note}</span>,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
    },
  ];

  const getStatusColor = (status) => {
    const statusObj = uniqueStatuses.find((s) => s.value === status);
    return statusObj ? statusObj.color : "text-gray-600";
  };

  const [checkedList, setCheckedList] = useState(
    columns.map((item) => item.key) // All columns are selected by default
  );
  const options = columns.map(({ key, title }) => ({
    label: title,
    value: key,
  }));
  const newColumns = columns.filter((item) => checkedList.includes(item.key));

  const handleSelectAllColumns = (e) => {
    if (e.target.checked) {
      setCheckedList(columns.map((item) => item.key));
    } else {
      setCheckedList([]);
    }
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
            <span className="font-semibold text-sm text-sky-900">
              Bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div
            className="flex border-b"
            style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
          >
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "all"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả ({papers.length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Đã duyệt"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Đã duyệt")}
            >
              Đã duyệt (
              {papers.filter((paper) => paper.status === "approved").length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Đang chờ"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Đang chờ")}
            >
              Chờ duyệt (
              {papers.filter((paper) => paper.status === "pending").length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Chờ chỉnh sửa"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Chờ chỉnh sửa")}
            >
              Chờ chỉnh sửa (
              {papers.filter((paper) => paper.status === "revision").length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Từ chối"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Từ chối")}
            >
              Từ chối (
              {papers.filter((paper) => paper.status === "refused").length})
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
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
                              handleFilterDropdownOpen("paperType")
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
                                options={uniquePaperTypes
                                  .filter((type) => type !== "Tất cả")
                                  .map((type) => ({
                                    label: type,
                                    value: type,
                                  }))}
                                value={filterPaperType}
                                onChange={(checkedValues) => {
                                  console.log(
                                    "Selected Paper Types:",
                                    checkedValues
                                  ); // Debug
                                  setFilterPaperType(checkedValues);
                                }}
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
                            onClick={() => handleFilterDropdownOpen("group")}
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
                                options={uniqueGroups
                                  .filter((group) => group !== "Tất cả")
                                  .map((group) => ({
                                    label: group,
                                    value: group,
                                  }))}
                                value={filterGroup}
                                onChange={(checkedValues) => {
                                  console.log(
                                    "Selected Groups:",
                                    checkedValues
                                  ); // Debug
                                  setFilterGroup(checkedValues);
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

                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Số tác giả:
                        </label>
                        <div className="flex gap-2">
                          <div>
                            <Input
                              type="number"
                              placeholder="Từ"
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
                            <Input
                              type="number"
                              placeholder="Đến"
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
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Vai trò:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => handleFilterDropdownOpen("role")}
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

                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          CQ đứng tên:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              handleFilterDropdownOpen("institution")
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
                          Trạng thái:
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => handleFilterDropdownOpen("status")}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left"
                            disabled={activeTab !== "all"} // Only enable for "Tất cả" tab
                          >
                            Chọn trạng thái
                          </button>
                          {showStatusFilter && activeTab === "all" && (
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
                                options={uniqueStatuses
                                  .filter((status) => status.value !== "Tất cả")
                                  .map((status) => ({
                                    label: status.label,
                                    value: status.value,
                                  }))}
                                value={filterStatus}
                                onChange={(checkedValues) =>
                                  setFilterStatus(checkedValues)
                                }
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
                          setFilterAuthorCountFrom("");
                          setFilterAuthorCountTo("");
                          setFilterRole(["Tất cả"]);
                          setFilterInstitution(["Tất cả"]);
                          setFilterStatus(["Tất cả"]);
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
                        onChange={handleSelectAllColumns}
                        checked={checkedList.length === columns.length}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <Checkbox.Group
                        options={options}
                        value={checkedList}
                        onChange={(value) => {
                          setCheckedList(value);
                        }}
                        className="flex flex-col gap-2 mt-2"
                      />
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              {papers.length === 0 ? (
                <p>Loading or no data available...</p> // Add a fallback UI for empty data
              ) : (
                <Table
                  columns={newColumns}
                  dataSource={filteredPapers.map((paper, index) => ({
                    ...paper,
                    key: index, // Ensure each row has a unique key
                  }))}
                  onChange={handleChange}
                  pagination={{
                    current: currentPage,
                    pageSize: itemsPerPage,
                    total: filteredPapers.length,
                    onChange: (page) => setCurrentPage(page),
                  }}
                  rowKey="id"
                  className="text-sm"
                  scroll={{
                    x: newColumns.reduce(
                      (total, col) => total + (col.width || 0),
                      0
                    ),
                  }} // Add horizontal scroll for wide tables
                  onRow={(record) => ({
                    onClick: () => handleRowClick(record),
                  })}
                />
              )}
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
        <p>
          <strong>Trạng thái:</strong> {modalContent.status}
        </p>
        {modalContent.note && (
          <p>
            <strong>Ghi chú:</strong> {modalContent.note}
          </p>
        )}
        <button className="text-[#00A3FF] mt-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7167 7.51667L12.4833 8.28333L4.93333 15.8333H4.16667V15.0667L11.7167 7.51667ZM14.7167 2.5C14.5083 2.5 14.2917 2.58333 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C15.1417 2.575 14.9333 2.5 14.7167 2.5ZM11.7167 5.15833L2.5 14.375V17.5H5.625L14.8417 8.28333L11.7167 5.15833Z"
              fill="currentColor"
            />
          </svg>
          Chỉnh sửa
        </button>
      </Modal>
    </div>
  );
};

export default ScientificPaperPage;
