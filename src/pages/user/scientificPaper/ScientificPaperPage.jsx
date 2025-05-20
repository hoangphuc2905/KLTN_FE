import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import { Filter, ChevronDown } from "lucide-react";
import { Input, Table, Checkbox, Tooltip, Modal, Spin, Select } from "antd";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/api";
import Footer from "../../../components/Footer";

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
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const roleFilterRef = useRef(null);
  const [filterInstitution, setFilterInstitution] = useState(["Tất cả"]);
  const [showInstitutionFilter, setShowInstitutionFilter] = useState(false);
  const institutionFilterRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState(["Tất cả"]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const statusFilterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const itemsPerPage = pageSize;

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const [notes, setNotes] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: "",
    type: "",
  });
  const [sortedInfo, setSortedInfo] = useState({});
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("Tất cả");
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchNoteForPaper = async (paperId, status) => {
    try {
      let response;
      if (status === "revision") {
        response = await userApi.getMessagesByPaperByRequestForEdit(paperId);
      } else if (status === "refused") {
        response = await userApi.getMessagesByPaperByRejection(paperId);
      } else {
        return "";
      }
      const noteContent = response?.content || "";
      return noteContent;
    } catch (error) {
      console.error(`Error fetching note for paper ${paperId}:`, error);
      return "Lỗi khi tải ghi chú";
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const newNotes = {};
      for (const paper of papers) {
        if (paper.status === "revision" || paper.status === "refused") {
          const note = await fetchNoteForPaper(paper._id, paper.status);
          newNotes[paper._id] = note;
        } else {
          newNotes[paper._id] = paper.note || "";
        }
      }
      setNotes(newNotes);
    };

    fetchNotes();
  }, [papers]);

  useEffect(() => {
    const fetchPapers = async () => {
      setIsLoading(true);
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
        if (
          response?.scientificPapers &&
          Array.isArray(response.scientificPapers)
        ) {
          setPapers(response.scientificPapers);
        } else {
          console.error("Unexpected API response structure:", response);
          setPapers([]);
        }
      } catch (error) {
        console.error("Error fetching scientific papers:", error);
        setPapers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPapers();
  }, [selectedYear]);

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
    { value: "Tất cả", label: "Tất cả", color: "text-gray-600" },
    { value: "approved", label: "Đã duyệt", color: "text-green-600" },
    { value: "pending", label: "Chờ duyệt", color: "text-yellow-600" },
    { value: "refused", label: "Từ chối", color: "text-red-600" },
    { value: "revision", label: "Chờ chỉnh sửa", color: "text-orange-600" },
  ];

  const filteredPapers = (papers || [])
    .filter((paper) => {
      if (activeTab === "Đã duyệt" && paper.status !== "approved") return false;
      if (activeTab === "Chờ duyệt" && paper.status !== "pending") return false;
      if (activeTab === "Chờ chỉnh sửa" && paper.status !== "revision")
        return false;
      if (activeTab === "Từ chối" && paper.status !== "refused") return false;
      return true;
    })
    .filter((paper) => {
      const authorNames =
        paper.author?.map((auth) => auth.author_name_vi).join(", ") || "";
      const authorCount = parseInt(paper.author_count?.split("(")[0] || 0);
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
          )) &&
        (filterStatus.includes("Tất cả") || filterStatus.includes(paper.status))
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
    }
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
    setCurrentPage(pagination.current);
  };

  const handleViewLink = (record, e) => {
    e.stopPropagation();
    if (record.publication_link) {
      window.open(record.publication_link, "_blank");
    } else {
      alert("Không có link minh chứng cho bài báo này");
    }
  };

  const handleViewFile = (record, e) => {
    e.stopPropagation();
    if (record.evidence_file) {
      window.open(record.evidence_file, "_blank");
    } else {
      alert("Không có file minh chứng cho bài báo này");
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) =>
        (currentPage - 1) * itemsPerPage + index + 1,
      width: 65,
      fixed: "left",
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "article_type",
      key: "paperType",
      sorter: (a, b) =>
        a.article_type?.type_name.localeCompare(b.article_type?.type_name),
      sortOrder: sortedInfo.columnKey === "paperType" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
      render: (article_type) => (
        <Tooltip placement="topLeft" title={article_type?.type_name}>
          {article_type?.type_name || "Không có dữ liệu"}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "article_group",
      key: "group",
      sorter: (a, b) =>
        a.article_group?.group_name.localeCompare(b.article_group?.group_name),
      sortOrder: sortedInfo.columnKey === "group" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
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
      sorter: (a, b) => a.title_vn.localeCompare(b.title_vn),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
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
        a.author
          ?.map((author) => author.author_name_vi)
          .join(", ")
          .localeCompare(
            b.author?.map((author) => author.author_name_vi).join(", ")
          ),
      sortOrder: sortedInfo.columnKey === "authors" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
      render: (authors) => {
        if (!authors || authors.length === 0) {
          return "Không có dữ liệu";
        }
        const authorNames = authors
          ?.map((author) => author.author_name_vi)
          .join(", ");
        return (
          <Tooltip placement="topLeft" title={authorNames}>
            {authorNames}
          </Tooltip>
        );
      },
      width: 180,
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
      ellipsis: { showTitle: false },
      render: (author_count) => (
        <Tooltip placement="topLeft" title={author_count}>
          {author_count || "Không có dữ liệu"}
        </Tooltip>
      ),
      width: 130,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "author",
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
      ellipsis: { showTitle: false },
      render: (author) => {
        const userId = localStorage.getItem("user_id");
        const userRole = author?.find((auth) => auth.user_id === userId)?.role;
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
      width: 170,
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "author",
      key: "institution",
      sorter: (a, b) => {
        const nameA = a.author?.[0]?.work_unit_id?.name_vi || "";
        const nameB = b.author?.[0]?.work_unit_id?.name_vi || "";
        return nameA.localeCompare(nameB);
      },
      sortOrder:
        sortedInfo.columnKey === "institution" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
      render: (author) => {
        const nameVi = author?.[0]?.work_unit_id?.name_vi;
        return (
          <Tooltip placement="topLeft" title={nameVi}>
            {nameVi || "Không có dữ liệu"}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publish_date",
      key: "publicationDate",
      sorter: (a, b) => new Date(a.publish_date) - new Date(b.publish_date),
      sortOrder:
        sortedInfo.columnKey === "publicationDate" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
      render: (publish_date) => {
        if (!publish_date) {
          return "Không có dữ liệu";
        }
        const formattedDate = new Date(publish_date).toLocaleDateString(
          "vi-VN"
        );
        return (
          <Tooltip placement="topLeft" title={formattedDate}>
            {formattedDate}
          </Tooltip>
        );
      },
      width: 170,
    },
    {
      title: "MINH CHỨNG",
      key: "evidence",
      render: (text, record) => (
        <div className="flex-col text-[#00A3FF]">
          {record.file ? (
            <button
              className="hover:underline"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn sự kiện click lan tỏa lên hàng (row)
                window.open(record.file, "_blank");
              }}
            >
              Xem file
            </button>
          ) : (
            <span className="text-gray-400">Không có</span>
          )}
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
          <span className={`${statusObj?.color || "text-gray-600"}`}>
            {statusObj?.label || "Không có dữ liệu"}
          </span>
        );
      },
      ellipsis: { showTitle: false },
      width: 150,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "createdAt",
      key: "dateAdded",
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      sortOrder: sortedInfo.columnKey === "dateAdded" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
      render: (createdAt) => {
        if (!createdAt) {
          return "Không có dữ liệu";
        }
        const formattedDate = new Date(createdAt).toLocaleDateString("vi-VN");
        return (
          <Tooltip placement="topLeft" title={formattedDate}>
            {formattedDate}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "NGÀY CẬP NHẬT",
      dataIndex: "updatedAt",
      key: "dateUpdated",
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
      sortOrder:
        sortedInfo.columnKey === "dateUpdated" ? sortedInfo.order : null,
      ellipsis: { showTitle: false },
      render: (updatedAt) => {
        if (!updatedAt) {
          return "Không có dữ liệu";
        }
        const formattedDate = new Date(updatedAt).toLocaleDateString("vi-VN");
        return (
          <Tooltip placement="topLeft" title={formattedDate}>
            {formattedDate}
          </Tooltip>
        );
      },
      width: 170,
    },
    {
      title: "GHI CHÚ",
      dataIndex: "note",
      key: "note",
      render: (note, record) => (
        <Tooltip placement="topLeft" title={notes[record._id] || note || ""}>
          <span className="text-red-600">
            {notes[record._id] || note || ""}
          </span>
        </Tooltip>
      ),
      ellipsis: { showTitle: false },
      width: 200,
    },
  ];

  const [checkedList, setCheckedList] = useState(
    columns.map((item) => item.key)
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
        showPaperTypeFilter &&
        paperTypeFilterRef.current &&
        !paperTypeFilterRef.current.contains(event.target)
      ) {
        setShowPaperTypeFilter(false);
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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showFilter,
    showColumnFilter,
    showPaperTypeFilter,
    showGroupFilter,
    showRoleFilter,
    showInstitutionFilter,
    showStatusFilter,
  ]);

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto max-lg:max-w-full max-lg:px-4">
          <div className="w-full bg-white">
            <Header />
          </div>
          <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4 max-sm:px-2">
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
              <span className="font-semibold text-sm text-sky-900">
                Bài báo nghiên cứu khoa học
              </span>
            </div>
          </div>

          <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4 max-sm:px-2">
            <div className="flex justify-between items-center max-lg:flex-wrap">
              <div className="flex border-b gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
                  {papers.filter((paper) => paper.status === "approved").length}
                  )
                </button>
                <button
                  className={`px-4 py-2 text-center text-xs ${
                    activeTab === "Chờ duyệt"
                      ? "bg-[#00A3FF] text-white"
                      : "bg-white text-gray-700"
                  } rounded-lg`}
                  onClick={() => setActiveTab("Chờ duyệt")}
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
                  {papers.filter((paper) => paper.status === "revision").length}
                  )
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
              <div className="flex items-center mt-2 max-lg:mt-4">
                <select
                  className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[110px]"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {academicYears.map((year, index) => (
                    <option key={index} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-lg:px-4 max-sm:px-2 overflow-x-auto">
            <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
              <div className="bg-white rounded-xl shadow-sm p-4 max-sm:p-3">
                <div className="flex justify-end mb-4 relative gap-2 max-sm:flex-wrap">
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs max-sm:px-1 max-sm:py-0.5"
                    onClick={() => {
                      setShowFilter(!showFilter);
                      setShowColumnFilter(false);
                    }}
                  >
                    <Filter className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
                    <span className="text-xs max-sm:text-[10px]">Bộ lọc</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs max-sm:px-1 max-sm:py-0.5"
                    onClick={() => {
                      setShowColumnFilter(!showColumnFilter);
                      setShowFilter(false);
                    }}
                  >
                    <Filter className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
                    <span className="text-xs max-sm:text-[10px]">Chọn cột</span>
                  </button>
                  {showFilter && (
                    <div
                      ref={filterRef}
                      className="absolute right-0 top-10 mt-2 z-50 shadow-lg"
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
                                      checked={filterPaperType.includes(
                                        "Tất cả"
                                      )}
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
                                  className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2"
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

                          {activeTab === "all" && (
                            <div className="mb-3">
                              <label className="block text-gray-700 text-xs">
                                Trạng thái:
                              </label>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowStatusFilter(!showStatusFilter);
                                  }}
                                  className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex justify-between items-center"
                                >
                                  <span className="truncate">
                                    {filterStatus.includes("Tất cả")
                                      ? "Tất cả"
                                      : filterStatus
                                          .map(
                                            (status) =>
                                              uniqueStatuses.find(
                                                (s) => s.value === status
                                              )?.label
                                          )
                                          .join(", ")}
                                  </span>
                                  <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                                </button>
                                {showStatusFilter && (
                                  <div
                                    ref={statusFilterRef}
                                    className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 max-w-[250px]"
                                  >
                                    <div className="max-h-[100px] overflow-y-auto pr-1">
                                      <Checkbox
                                        checked={filterStatus.includes(
                                          "Tất cả"
                                        )}
                                        onChange={(e) => {
                                          setFilterStatus(
                                            e.target.checked ? ["Tất cả"] : []
                                          );
                                        }}
                                      >
                                        Tất cả
                                      </Checkbox>
                                      <Checkbox.Group
                                        options={uniqueStatuses
                                          .filter((s) => s.value !== "Tất cả")
                                          .map((status) => ({
                                            label: status.label,
                                            value: status.value,
                                          }))}
                                        value={filterStatus.filter(
                                          (status) => status !== "Tất cả"
                                        )}
                                        onChange={(checkedValues) => {
                                          if (
                                            checkedValues.length ===
                                            uniqueStatuses.length - 1
                                          ) {
                                            setFilterStatus(["Tất cả"]);
                                          } else {
                                            setFilterStatus(checkedValues);
                                          }
                                        }}
                                        className="flex flex-col gap-2 mt-2"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

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
                  {showColumnFilter && (
                    <div
                      ref={columnFilterRef}
                      className="absolute right-0 top-10 mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200"
                    >
                      <div className="px-4 py-5 w-full max-w-[350px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                        <Checkbox
                          onChange={handleSelectAllColumns}
                          checked={checkedList.length === columns.length}
                        >
                          Chọn tất cả
                        </Checkbox>
                        <div className="max-h-[300px] overflow-y-auto pr-1 mt-2">
                          <Checkbox.Group
                            options={options}
                            value={checkedList}
                            onChange={(value) => setCheckedList(value)}
                            className="flex flex-col gap-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                  </div>
                ) : papers.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Không có dữ liệu để hiển thị.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table
                      columns={newColumns}
                      dataSource={filteredPapers.map((paper, index) => ({
                        ...paper,
                        key: paper.id || paper._id || index,
                      }))}
                      pagination={{
                        current: currentPage,
                        pageSize: itemsPerPage,
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
                                { value: 50, label: "50 / trang" },
                                { value: 100, label: "100 / trang" },
                              ]}
                            />
                            <span>{`${range[0]}-${range[1]} của ${total} mục`}</span>
                          </div>
                        ),
                      }}
                      rowKey="key"
                      className="text-sm max-sm:text-xs"
                      scroll={{
                        x: newColumns.reduce(
                          (total, col) => total + (col.width || 0),
                          0
                        ),
                      }}
                      onRow={(record) => ({
                        onClick: () => handleRowClick(record),
                      })}
                      locale={{
                        emptyText: <div style={{ height: "35px" }}></div>,
                      }}
                    />
                  </div>
                )}

                <Modal
                  title={modalContent.title}
                  open={isModalVisible}
                  onCancel={handleModalClose}
                  footer={[
                    <button
                      key="close"
                      onClick={handleModalClose}
                      className="px-4 py-2 bg-[#00A3FF] text-white rounded-lg text-sm"
                    >
                      Đóng
                    </button>,
                  ]}
                >
                  {modalContent.type === "link" ? (
                    <div>
                      <p>{modalContent.content}</p>
                      {modalContent.content &&
                        modalContent.content !== "Không có link minh chứng" && (
                          <a
                            href={modalContent.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00A3FF] hover:underline"
                          >
                            Mở trong tab mới
                          </a>
                        )}
                    </div>
                  ) : (
                    <div>
                      <p>{modalContent.content}</p>
                      {modalContent.content &&
                        modalContent.content !== "Không có file minh chứng" && (
                          <a
                            href={modalContent.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00A3FF] hover:underline"
                          >
                            Tải xuống
                          </a>
                        )}
                    </div>
                  )}
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScientificPaperPage;
