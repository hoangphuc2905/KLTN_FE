import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Filter, ChevronDown } from "lucide-react";
import { Input, Select, Table, Checkbox, Divider, Tooltip } from "antd";
import userApi from "../../../api/api";

const ManagementAriticle = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [userRole] = useState(localStorage.getItem("current_role") || "");
  const [userDepartment] = useState(localStorage.getItem("department") || "");
  const [departments, setDepartments] = useState({});
  const [selectedYear, setSelectedYear] = useState("Tất cả");
  const [academicYears, setAcademicYears] = useState([]);
  const [sortedInfo, setSortedInfo] = useState({});
  const [notes, setNotes] = useState({});

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        let fetchedPapers = [];
        if (userRole === "admin") {
          const response = await getAllScientificPapers(
            selectedYear === "Tất cả" ? null : selectedYear
          );
          fetchedPapers = Array.isArray(response.scientificPapers)
            ? response.scientificPapers
            : [];
        } else if (
          [
            "head_of_department",
            "deputy_head_of_department",
            "department_in_charge",
          ].includes(userRole)
        ) {
          const response = await getScientificPapersByDepartment(
            userDepartment,
            selectedYear === "Tất cả" ? null : selectedYear
          );
          fetchedPapers = Array.isArray(response.scientificPapers)
            ? response.scientificPapers
            : [];
        }
        setPapers(fetchedPapers);
      } catch (error) {
        console.error("Error fetching papers:", error);
        setPapers([]);
      }
    };

    fetchPapers();
  }, [userRole, userDepartment, selectedYear]);

  const fetchDepartments = async () => {
    try {
      const response = await userApi.getAllDepartments();
      const departmentMap = response.reduce((map, department) => {
        map[department._id] = department.department_name;
        return map;
      }, {});
      setDepartments(departmentMap);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments({});
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const getAllScientificPapers = async (academicYear) => {
    try {
      const response = await userApi.getAllScientificPapers(academicYear);
      return response;
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  };

  const getScientificPapersByDepartment = async (department, academicYear) => {
    try {
      const response = await userApi.getScientificPapersByDepartment(
        department,
        academicYear
      );
      return response;
    } catch (error) {
      console.error("Error fetching scientific papers:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  };

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

  const [activeTab, setActiveTab] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState(["Tất cả"]);
  const [showPaperTypeFilter, setShowPaperTypeFilter] = useState(false);
  const paperTypeFilterRef = useRef(null);
  const [filterGroup, setFilterGroup] = useState(["Tất cả"]);
  const [showGroupFilter, setShowGroupFilter] = useState(false);
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
  const itemsPerPage = 10;

  const filterRef = useRef(null);
  const columnFilterRef = useRef(null);
  const groupFilterRef = useRef(null);
  const roleFilterRef = useRef(null);
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  // Derive unique filter options from papers
  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.article_type?.type_name).filter(Boolean)
    ),
  ];
  const uniqueGroups = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.article_group?.group_name).filter(Boolean)
    ),
  ];
  const uniqueRoles = [
    "Tất cả",
    ...new Set(
      papers
        .flatMap((paper) => paper.author.map((a) => a.role))
        .map((role) => {
          const roleMapping = {
            MainAuthor: "Chính",
            CorrespondingAuthor: "Liên hệ",
            MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
            Participant: "Tham gia",
          };
          return roleMapping[role] || "Không xác định";
        })
        .filter(Boolean)
    ),
  ];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => paper.department?.department_name).filter(Boolean)
    ),
  ];
  const uniqueStatuses = [
    "Tất cả",
    ...new Set(
      papers.map((paper) => {
        const statusMapping = {
          approved: "Đã duyệt",
          refused: "Từ chối",
          pending: "Chờ duyệt",
          revision: "Chờ chỉnh sửa",
        };
        return statusMapping[paper.status] || "Không xác định";
      })
    ),
  ];

  // Filter papers based on all criteria
  const filteredPapers = papers.filter((paper) => {
    // Active tab filter
    if (activeTab !== "all" && paper.status !== activeTab) {
      return false;
    }

    // Paper type filter
    if (
      !filterPaperType.includes("Tất cả") &&
      !filterPaperType.includes(paper.article_type?.type_name)
    ) {
      return false;
    }

    // Group filter
    if (
      !filterGroup.includes("Tất cả") &&
      !filterGroup.includes(paper.article_group?.group_name)
    ) {
      return false;
    }

    // Paper title filter
    if (
      filterPaperTitle &&
      !paper.title_vn?.toLowerCase().includes(filterPaperTitle.toLowerCase())
    ) {
      return false;
    }

    // Author name filter
    if (
      filterAuthorName &&
      !paper.author.some((a) =>
        a.author_name_vi?.toLowerCase().includes(filterAuthorName.toLowerCase())
      )
    ) {
      return false;
    }

    // Author count filter
    if (
      filterAuthorCountFrom &&
      (paper.author_count < parseInt(filterAuthorCountFrom) ||
        isNaN(paper.author_count))
    ) {
      return false;
    }
    if (
      filterAuthorCountTo &&
      (paper.author_count > parseInt(filterAuthorCountTo) ||
        isNaN(paper.author_count))
    ) {
      return false;
    }

    // Role filter
    const roleMapping = {
      MainAuthor: "Chính",
      CorrespondingAuthor: "Liên hệ",
      MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
      Participant: "Tham gia",
    };
    if (
      !filterRole.includes("Tất cả") &&
      !paper.author.some((a) =>
        filterRole.includes(roleMapping[a.role] || "Không xác định")
      )
    ) {
      return false;
    }

    // Institution filter
    if (
      !filterInstitution.includes("Tất cả") &&
      !filterInstitution.includes(paper.department?.department_name)
    ) {
      return false;
    }

    // Status filter
    const statusMapping = {
      approved: "Đã duyệt",
      refused: "Từ chối",
      pending: "Chờ duyệt",
      revision: "Chờ chỉnh sửa",
    };
    if (
      !filterStatus.includes("Tất cả") &&
      !filterStatus.includes(statusMapping[paper.status] || "Không xác định")
    ) {
      return false;
    }

    return true;
  });

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

  const handleRowClick = (record) => {
    navigate(`/admin/management/ariticle/detail/${record._id}`);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "paper_id",
      key: "paper_id",
      render: (text, record, index) => index + 1,
      width: 65,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "article_type",
      key: "article_type",
      ellipsis: { showTitle: false },
      render: (article_type) => (
        <Tooltip placement="topLeft" title={article_type?.type_name}>
          {article_type?.type_name}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "article_group",
      key: "article_group",
      ellipsis: { showTitle: false },
      render: (article_group) => (
        <Tooltip placement="topLeft" title={article_group?.group_name}>
          {article_group?.group_name}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title_vn",
      key: "title_vn",
      ellipsis: { showTitle: false },
      render: (title_vn) => (
        <Tooltip placement="topLeft" title={title_vn}>
          {title_vn}
        </Tooltip>
      ),
      width: 300,
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "author",
      key: "author",
      ellipsis: { showTitle: false },
      render: (author) => (
        <Tooltip
          placement="topLeft"
          title={author.map((a) => a.author_name_vi).join(", ")}
        >
          {author.map((a) => a.author_name_vi).join(", ")}
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "author_count",
      key: "author_count",
      ellipsis: { showTitle: false },
      render: (author_count) => (
        <Tooltip placement="topLeft" title={author_count}>
          {author_count}
        </Tooltip>
      ),
      width: 100,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "author",
      key: "role",
      ellipsis: { showTitle: false },
      render: (author) => {
        const roleMapping = {
          MainAuthor: "Chính",
          CorrespondingAuthor: "Liên hệ",
          MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
          Participant: "Tham gia",
        };
        return (
          <Tooltip
            placement="topLeft"
            title={author
              .map((a) => roleMapping[a.role] || "Không xác định")
              .join(", ")}
          >
            {author
              .map((a) => roleMapping[a.role] || "Không xác định")
              .join(", ")}
          </Tooltip>
        );
      },
      width: 150,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      ellipsis: { showTitle: false },
      render: (department) => (
        <Tooltip
          placement="topLeft"
          title={department?.department_name || "Không xác định"}
        >
          {department?.department_name || "Không xác định"}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publish_date",
      key: "publish_date",
      ellipsis: { showTitle: false },
      render: (publish_date) => {
        const formattedDate = new Date(publish_date).toLocaleDateString(
          "vi-VN"
        );
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
          <button className="hover:underline">Xem link</button>
          <button className="hover:underline">Xem file</button>
        </div>
      ),
      width: 150,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusText =
          {
            approved: "Đã duyệt",
            refused: "Từ chối",
            pending: "Chờ duyệt",
            revision: "Chờ chỉnh sửa",
          }[status.toString()] || "Không xác định";
        const statusColor =
          {
            approved: "text-green-600",
            refused: "text-red-600",
            pending: "text-yellow-600",
            revision: "text-orange-600",
          }[status.toString()] || "text-gray-600";
        return <span className={statusColor}>{statusText}</span>;
      },
      ellipsis: { showTitle: false },
      width: 150,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "createdAt",
      key: "createdAt",
      ellipsis: { showTitle: false },
      render: (createdAt) => {
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

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto flex-grow">
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
            <span className="text-gray-400"> </span>
            <span className="font-semibold text-sm text-sky-900">
              Bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex justify-between items-center">
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
                Tất cả ({filteredPapers.length})
              </button>
              <button
                className={`px-4 py-2 text-center text-xs ${
                  activeTab === "approved"
                    ? "bg-[#00A3FF] text-white"
                    : "bg-white text-gray-700"
                } rounded-lg`}
                onClick={() => setActiveTab("approved")}
              >
                Đã duyệt (
                {
                  filteredPapers.filter((paper) => paper.status === "approved")
                    .length
                }
                )
              </button>
              <button
                className={`px-4 py-2 text-center text-xs ${
                  activeTab === "pending"
                    ? "bg-[#00A3FF] text-white"
                    : "bg-white text-gray-700"
                } rounded-lg`}
                onClick={() => setActiveTab("pending")}
              >
                Chờ duyệt (
                {
                  filteredPapers.filter((paper) => paper.status === "pending")
                    .length
                }
                )
              </button>
              <button
                className={`px-4 py-2 text-center text-xs ${
                  activeTab === "revision"
                    ? "bg-[#00A3FF] text-white"
                    : "bg-white text-gray-700"
                } rounded-lg`}
                onClick={() => setActiveTab("revision")}
              >
                Chờ chỉnh sửa (
                {
                  filteredPapers.filter((paper) => paper.status === "revision")
                    .length
                }
                )
              </button>
              <button
                className={`px-4 py-2 text-center text-xs ${
                  activeTab === "refused"
                    ? "bg-[#00A3FF] text-white"
                    : "bg-white text-gray-700"
                } rounded-lg`}
                onClick={() => setActiveTab("refused")}
              >
                Từ chối (
                {
                  filteredPapers.filter((paper) => paper.status === "refused")
                    .length
                }
                )
              </button>
            </div>
            <div className="flex items-center">
              <select
                className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[110px]"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {academicYears.map((year) => (
                  <option key={year} value={year}>
                    {year === "Tất cả" ? "Tất cả" : `${year}`}
                  </option>
                ))}
              </select>
            </div>
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
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3 max-h-[500px] overflow-y-auto">
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
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex items-center justify-between"
                          >
                            <span className="truncate">
                              {filterPaperType.length === 0 ||
                              filterPaperType.includes("Tất cả")
                                ? "Tất cả"
                                : filterPaperType.join(", ")}
                            </span>
                            <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                          </button>
                          {showPaperTypeFilter && (
                            <div
                              ref={paperTypeFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 shadow-lg"
                              style={{
                                width: "300px",
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              <Checkbox
                                checked={
                                  filterPaperType.includes("Tất cả") ||
                                  filterPaperType.length === 0
                                }
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
                                  if (checkedValues.length === 0) {
                                    setFilterPaperType(["Tất cả"]);
                                  } else {
                                    setFilterPaperType(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-1 mt-1"
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
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex items-center justify-between"
                          >
                            <span className="truncate">
                              {filterGroup.includes("Tất cả") ||
                              filterGroup.length === 0
                                ? "Tất cả"
                                : filterGroup.join(", ")}
                            </span>
                            <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                          </button>
                          {showGroupFilter && (
                            <div
                              ref={groupFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 shadow-lg"
                              style={{
                                width: "300px",
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              <Checkbox
                                checked={
                                  filterGroup.includes("Tất cả") ||
                                  filterGroup.length === 0
                                }
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
                                  if (checkedValues.length === 0) {
                                    setFilterGroup(["Tất cả"]);
                                  } else if (
                                    checkedValues.length ===
                                    uniqueGroups.length - 1
                                  ) {
                                    setFilterGroup(["Tất cả"]);
                                  } else {
                                    setFilterGroup(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-1 mt-1"
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
                            onClick={() => setShowRoleFilter(!showRoleFilter)}
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex items-center justify-between"
                          >
                            <span className="truncate">
                              {filterRole.includes("Tất cả") ||
                              filterRole.length === 0
                                ? "Tất cả"
                                : filterRole.join(", ")}
                            </span>
                            <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                          </button>
                          {showRoleFilter && (
                            <div
                              ref={roleFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 shadow-lg"
                              style={{
                                width: "300px",
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              <Checkbox
                                checked={
                                  filterRole.includes("Tất cả") ||
                                  filterRole.length === 0
                                }
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
                                  if (checkedValues.length === 0) {
                                    setFilterRole(["Tất cả"]);
                                  } else if (
                                    checkedValues.length ===
                                    uniqueRoles.length - 1
                                  ) {
                                    setFilterRole(["Tất cả"]);
                                  } else {
                                    setFilterRole(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-1 mt-1"
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
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex items-center justify-between"
                          >
                            <span className="truncate">
                              {filterInstitution.includes("Tất cả") ||
                              filterInstitution.length === 0
                                ? "Tất cả"
                                : filterInstitution.join(", ")}
                            </span>
                            <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                          </button>
                          {showInstitutionFilter && (
                            <div
                              ref={institutionFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 shadow-lg"
                              style={{
                                width: "300px",
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              <Checkbox
                                checked={
                                  filterInstitution.includes("Tất cả") ||
                                  filterInstitution.length === 0
                                }
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
                                  if (checkedValues.length === 0) {
                                    setFilterInstitution(["Tất cả"]);
                                  } else if (
                                    checkedValues.length ===
                                    uniqueInstitutions.length - 1
                                  ) {
                                    setFilterInstitution(["Tất cả"]);
                                  } else {
                                    setFilterInstitution(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-1 mt-1"
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
                            onClick={() =>
                              setShowStatusFilter(!showStatusFilter)
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs text-left flex items-center justify-between"
                          >
                            <span className="truncate">
                              {filterStatus.includes("Tất cả") ||
                              filterStatus.length === 0
                                ? "Tất cả"
                                : filterStatus.join(", ")}
                            </span>
                            <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                          </button>
                          {showStatusFilter && (
                            <div
                              ref={statusFilterRef}
                              className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 p-2 shadow-lg"
                              style={{
                                width: "300px",
                                maxHeight: "200px",
                                overflowY: "auto",
                              }}
                            >
                              <Checkbox
                                checked={
                                  filterStatus.includes("Tất cả") ||
                                  filterStatus.length === 0
                                }
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
                                  .filter((status) => status !== "Tất cả")
                                  .map((status) => ({
                                    label: status,
                                    value: status,
                                  }))}
                                value={filterStatus.filter(
                                  (status) => status !== "Tất cả"
                                )}
                                onChange={(checkedValues) => {
                                  if (checkedValues.length === 0) {
                                    setFilterStatus(["Tất cả"]);
                                  } else if (
                                    checkedValues.length ===
                                    uniqueStatuses.length - 1
                                  ) {
                                    setFilterStatus(["Tất cả"]);
                                  } else {
                                    setFilterStatus(checkedValues);
                                  }
                                }}
                                className="flex flex-col gap-1 mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterPaperType([]);
                          setFilterGroup([]);
                          setFilterPaperTitle("");
                          setFilterAuthorName("");
                          setFilterAuthorCountFrom("");
                          setFilterAuthorCountTo("");
                          setFilterRole([]);
                          setFilterInstitution([]);
                          setFilterStatus([]);
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
                    <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3 max-h-[400px] overflow-y-auto">
                      <Checkbox
                        onChange={handleSelectAllColumns}
                        checked={checkedList.length === columns.length}
                      >
                        Chọn tất cả
                      </Checkbox>
                      <Checkbox.Group
                        options={options}
                        value={checkedList}
                        onChange={(value) => setCheckedList(value)}
                        className="flex flex-col gap-2 mt-2"
                      />
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              <Table
                columns={newColumns}
                dataSource={filteredPapers}
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total: filteredPapers.length,
                  onChange: (page) => setCurrentPage(page),
                  showSizeChanger: false,
                  position: ["bottomRight"],
                }}
                rowKey={(record) => record._id || record.key}
                className="text-sm"
                scroll={{
                  x: newColumns.reduce(
                    (total, col) => total + (col.width || 0),
                    0
                  ),
                }}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  style: { cursor: "pointer" },
                })}
                locale={{
                  emptyText: (
                    <div style={{ height: "35px" }}>Không có dữ liệu</div>
                  ),
                }}
                onChange={(pagination, filters, sorter) => {
                  setSortedInfo(sorter);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManagementAriticle;
