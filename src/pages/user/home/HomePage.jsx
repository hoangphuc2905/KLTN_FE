import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Link } from "react-router-dom";
import { Modal, Button, Input, message, Spin, Select } from "antd";
import userApi from "../../../api/api";
import { FaArchive, FaRegFileArchive } from "react-icons/fa";
import { FixedSizeList } from "react-window";
import Cytoscape from 'react-cytoscapejs';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>
            Đã xảy ra lỗi: {this.state.error?.message || "Lỗi không xác định"}
          </h1>
          <p>Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const HomePage = () => {
  const [recentPapers, setRecentPapers] = useState([]);
  const [featuredPapers, setFeaturedPapers] = useState([]);
  const [researchPapers, setResearchPapers] = useState([]);
  const [topPapers, setTopPapers] = useState([]);
  const [cyElements, setCyElements] = useState([]);
  const cyRef = useRef(null);
  const [authors, setAuthors] = useState({});
  const [departments, setDepartments] = useState({});
  const [departmentsList, setDepartmentsList] = useState([]);
  const [activeTab, setActiveTab] = useState("recent");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [archivedPapers, setArchivedPapers] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [collections, setCollections] = useState([]);
  const userId = localStorage.getItem("user_id");
  const userType = localStorage.getItem("user_type");
  const [currentPage, setCurrentPage] = useState(1);
  const [papersPerPage, setPapersPerPage] = useState(10);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [paperToRemove, setPaperToRemove] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [relatedPapers, setRelatedPapers] = useState([]);

  const scrollRef = useRef(null);
  const papersListRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
    setAvailableYears(years);
  }, []);

  const filteredPapers = useMemo(() => {
    return researchPapers.filter((paper) => {
      const departmentMatch = selectedDepartment
        ? paper.department === selectedDepartment
        : true;
      return departmentMatch;
    });
  }, [researchPapers, selectedDepartment]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDepartment, papersPerPage]);

  const currentPapers = useMemo(() => {
    return filteredPapers
      .slice((currentPage - 1) * papersPerPage, currentPage * papersPerPage)
      .map((paper) => {
        const departmentName =
          paper.department_name ||
          (paper.department && paper.department.department_name) ||
          departments[paper.department] ||
          departments[paper.departmentId] ||
          paper.departmentName ||
          "Khoa không xác định";
        return {
          ...paper,
          author: Array.isArray(paper.author)
            ? paper.author
                .map(
                  (a) =>
                    a.author_name_vi ||
                    a.author_name_en ||
                    "Tác giả không xác định"
                )
                .join(", ")
            : typeof paper.author === "object"
            ? paper.author.author_name_vi ||
              paper.author.author_name_en ||
              "Tác giả không xác định"
            : paper.author || "Tác giả không xác định",
          departmentName,
        };
      });
  }, [filteredPapers, currentPage, departments, papersPerPage]);

  const displayedPapers = useMemo(() => {
    return activeTab === "recent"
      ? recentPapers
      : activeTab === "featured"
      ? featuredPapers
      : researchPapers;
  }, [activeTab, recentPapers, featuredPapers, researchPapers]);

  const mapPaperData = async (paper) => {
    const departmentName = await getDepartmentById(paper.department);
    return {
      id: paper._id,
      paperId: paper.paper_id || "",
      title: paper.title_vn || paper.title_en || "Không có tiêu đề",
      author: paper.author
        ? paper.author
            .map(
              (a) =>
                a.author_name_vi || a.author_name_en || "Tác giả không xác định"
            )
            .join(", ")
        : "Tác giả không xác định",
      department: paper.department || "Khoa không xác định",
      departmentId: paper.department || "",
      departmentName: departmentName || "Khoa không xác định",
      thumbnailUrl: paper.cover_image || "",
      summary: paper.summary || "Không có tóm tắt",
      publish_date: paper.publish_date || "",
      magazine:
        paper.magazine_vi || paper.magazine_en || "Tạp chí không xác định",
      magazineType: paper.magazine_type || "",
      page: paper.page || "",
      issnIsbn: paper.issn_isbn || "",
      file: paper.file || "",
      link: paper.link || "",
      doi: paper.doi || "",
      status: paper.status || "",
      keywords: paper.keywords || [],
      articleType: paper.article_type?.type_name || "",
      articleGroup: paper.article_group?.group_name || "",
      featured: paper.featured || false,
    };
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingRecent(true);
        setIsLoadingFeatured(true);
        setIsLoadingPapers(true);

        const userId = localStorage.getItem("user_id");

        const storedDepartments = localStorage.getItem("departments");
        const storedDepartmentsList = localStorage.getItem("departmentsList");
        const storedRecentPapers = localStorage.getItem("recentPapers");
        const storedFeaturedPapers = localStorage.getItem("featuredPapers");

        let departmentsData = storedDepartments
          ? JSON.parse(storedDepartments)
          : null;
        let departmentsListData = storedDepartmentsList
          ? JSON.parse(storedDepartmentsList)
          : null;
        let recentPapersData = storedRecentPapers
          ? JSON.parse(storedRecentPapers)
          : null;
        let featuredPapersData = storedFeaturedPapers
          ? JSON.parse(storedFeaturedPapers)
          : null;

        if (!departmentsData || !departmentsListData) {
          const departmentsResponse = await userApi.getAllDepartments();
          departmentsData = departmentsResponse.reduce((acc, department) => {
            acc[department._id] = department.department_name;
            return acc;
          }, {});
          departmentsListData = departmentsResponse;

          localStorage.setItem("departments", JSON.stringify(departmentsData));
          localStorage.setItem(
            "departmentsList",
            JSON.stringify(departmentsListData)
          );
        }

        if (!recentPapersData || !featuredPapersData) {
          const [recentPapersResponse, featuredPapersResponse] =
            await Promise.all([
              userApi.getTop5NewestScientificPapers(),
              userApi.getTop5MostViewedAndDownloadedPapers(),
            ]);

          recentPapersData = recentPapersResponse?.papers
            ? await Promise.all(recentPapersResponse.papers.map(mapPaperData))
            : [];
          featuredPapersData = featuredPapersResponse?.papers
            ? await Promise.all(featuredPapersResponse.papers.map(mapPaperData))
            : [];

          localStorage.setItem(
            "recentPapers",
            JSON.stringify(recentPapersData)
          );
          localStorage.setItem(
            "featuredPapers",
            JSON.stringify(featuredPapersData)
          );
        }

        setDepartments(departmentsData);
        setDepartmentsList(departmentsListData);
        setRecentPapers(recentPapersData);
        setFeaturedPapers(featuredPapersData);

        const [
          recommendationsResponse,
          allPapersResponse,
          collectionsResponse,
        ] = await Promise.all([
          userId
            ? userApi.getRecommendationsByUserHistory(userId)
            : Promise.resolve({ data: [] }),
          userApi.getAllScientificPapers(),
          userApi.getCollectionsByUserId(userId),
        ]);

        console.log("recommendationsResponse:", recommendationsResponse);
        console.log("allPapersResponse:", allPapersResponse);

        const hasRecommendations =
          recommendationsResponse?.data &&
          recommendationsResponse.data.length > 0 &&
          recommendationsResponse.message !== "No data found";

        const papers = hasRecommendations
          ? recommendationsResponse.data
          : allPapersResponse?.scientificPapers || [];

        console.log("Papers to display:", papers);

        if (!papers.length) {
          console.warn("No papers found to display.");
          setResearchPapers([]);
          message.warning("Không tìm thấy bài báo nào.");
          return;
        }

        const mappedPapers = await Promise.all(
          papers.map(async (paper) => {
            try {
              return await mapPaperData(paper);
            } catch (error) {
              console.error("Lỗi trong mapPaperData:", error, paper);
              return null;
            }
          })
        );

        console.log("Mapped papers:", mappedPapers);

        const validPapers = mappedPapers.filter((paper) => paper !== null);
        const approvedPapers = validPapers.filter(
          (paper) => paper.status === "approved"
        );

        console.log("Approved papers:", approvedPapers);

        if (!approvedPapers.length && validPapers.length > 0) {
          console.warn("Không có bài báo nào có trạng thái approved");
          message.warning("Không có bài báo được phê duyệt.");
        }

        setResearchPapers(approvedPapers);
        setCollections(collectionsResponse || []);

        if (papers.length > 0) {
          saveTopPapersToLocal(approvedPapers);
        }

        setIsLoadingRecent(false);
        setIsLoadingFeatured(false);
        setIsLoadingPapers(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu ban đầu:", error);
        message.error("Lỗi khi tải dữ liệu. Vui lòng thử lại sau.");

        setIsLoadingRecent(false);
        setIsLoadingFeatured(false);
        setIsLoadingPapers(false);
      }
    };

    fetchInitialData();
  }, []);

  const getDepartmentById = async (departmentId) => {
    if (
      !departmentId ||
      typeof departmentId !== "string" ||
      departmentId.length !== 24
    ) {
      return "Khoa không xác định";
    }
    try {
      const response = await userApi.getDepartmentById(departmentId);
      return response.department_name || "Khoa không xác định";
    } catch (error) {
      console.error(`Lỗi khi lấy khoa với ID ${departmentId}:`, error);
      return "Khoa không xác định";
    }
  };

  const fetchDownloadCount = async (paperId) => {
    if (!paperId) {
      console.error("Lỗi: paperId không xác định.");
      return 0;
    }
    try {
      const response = await userApi.getDownloadCountByPaperId(paperId);
      return response.download_count || 0;
    } catch (error) {
      console.error(`Lỗi khi lấy số lượt tải cho bài báo ${paperId}:`, error);
      return 0;
    }
  };

  const fetchViewCount = async (paperId) => {
    if (!paperId) {
      console.error("Lỗi: paperId không xác định.");
      return 0;
    }
    try {
      const response = await userApi.getViewCountByPaperId(paperId);
      return response.viewCount || 0;
    } catch (error) {
      console.error(`Lỗi khi lấy số lượt xem cho bài báo ${paperId}:`, error);
      return 0;
    }
  };

  const fetchCountsForCurrentPapers = async () => {
    try {
      const papersToFetch = filteredPapers
        .slice((currentPage - 1) * papersPerPage, currentPage * papersPerPage)
        .filter((paper) => paper.id && !paper.views && !paper.downloads);

      if (papersToFetch.length === 0) return;

      const updatedPapers = await Promise.all(
        papersToFetch.map(async (paper) => {
          const [viewCount, downloadCount] = await Promise.all([
            fetchViewCount(paper.id),
            fetchDownloadCount(paper.id),
          ]);
          return { ...paper, views: viewCount, downloads: downloadCount };
        })
      );

      setResearchPapers((prev) =>
        prev.map((paper) => {
          const updated = updatedPapers.find((p) => p.id === paper.id);
          return updated || paper;
        })
      );
    } catch (error) {
      console.error("Lỗi khi lấy số lượt xem/tải:", error);
    }
  };

  useEffect(() => {
    fetchCountsForCurrentPapers();
  }, [filteredPapers, currentPage, papersPerPage]);

  useEffect(() => {
    const fetchMetadataForCurrentPapers = async () => {
      const papersToFetch = filteredPapers
        .slice((currentPage - 1) * papersPerPage, currentPage * papersPerPage)
        .filter((paper) => paper.id && !authors[paper.id]);

      if (papersToFetch.length === 0) {
        return;
      }

      try {
        const authorsData = await Promise.all(
          papersToFetch.map(async (paper) => {
            const authorsData = await userApi.getAuthorsByPaperId(paper.id);
            const authorNames = authorsData.map(
              (author) => author.author_name_vi || author.author_name_en
            );
            return {
              paperId: paper.id,
              authors:
                authorNames.length > 0
                  ? authorNames.join(", ")
                  : "Tác giả không xác định",
            };
          })
        );

        const newAuthors = authorsData.reduce((acc, { paperId, authors }) => {
          acc[paperId] = authors;
          return acc;
        }, {});
        setAuthors((prev) => ({ ...prev, ...newAuthors }));
      } catch (error) {
        console.error("Lỗi khi lấy thông tin tác giả:", error);
      }
    };

    fetchMetadataForCurrentPapers();
  }, [filteredPapers, currentPage, authors, papersPerPage]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePapersPerPageChange = useCallback((e) => {
    setPapersPerPage(Number(e.target.value));
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      message.warning("Vui lòng nhập từ khóa tìm kiếm.");
      return;
    }
    setIsSearching(true);
    try {
      console.log("Thông tin tìm kiếm:", {
        searchQuery,
        selectedDepartment,
        selectedCriteria,
        timestamp: new Date().toISOString()
      });

      const response = await userApi.semanticSearch(
        searchQuery,
        selectedDepartment,
        selectedCriteria
      );
      console.log("Kết quả tìm kiếm:", {
        totalResults: response?.results?.length || 0,
        searchTime: new Date().toISOString(),
        response
      });

      if (!response || !response.results) {
        throw new Error("Phản hồi API không chứa dữ liệu kết quả.");
      }

      const papers = response.results.map((result) => {
        console.log("Chi tiết kết quả:", {
          id: result.paper._id,
          title: result.paper.title_vn || result.paper.title_en,
          score: result.score,
          department: result.paper.department
        });
        
        return {
          id: result.paper._id,
          title: result.paper.title_vn || result.paper.title_en || "Không có tiêu đề",
          author: result.paper.author
            ?.map((a) => a.author_name_vi || a.author_name_en)
            .join(", ") || "Tác giả không xác định",
          department: result.paper.department || "Khoa không xác định",
          departmentName: departments[result.paper.department] || "Khoa không xác định",
          thumbnailUrl: result.paper.cover_image || "",
          summary: result.paper.summary || "Không có tóm tắt",
          publish_date: result.paper.publish_date || "",
          keywords: result.paper.keywords || [],
          file: result.paper.file || "",
          doi: result.paper.doi || "",
          status: result.paper.status || "",
          score: result.score || 1
        };
      });

      console.log("Kết quả đã xử lý:", {
        totalPapers: papers.length,
        firstPaper: papers[0],
        lastPaper: papers[papers.length - 1]
      });

      setResearchPapers(papers);
      setCurrentPage(1);

      // Cập nhật top papers và biểu đồ
      const top10Papers = papers.slice(0, 10);
      await saveTopPapersToLocal(top10Papers);
      
      // Lấy bài báo liên quan cho top 10
      const relatedPapersResult = await fetchRelatedPapers(top10Papers);
      
      // Cập nhật biểu đồ với câu truy vấn mới
      updateCytoscapeElements(top10Papers, searchQuery, relatedPapersResult);

      if (papers.length === 0) {
        message.warning("Không tìm thấy bài báo phù hợp.");
      } else {
        message.success(`Tìm thấy ${papers.length} bài báo.`);
      }
    } catch (error) {
      console.error("Chi tiết lỗi tìm kiếm:", {
        error,
        searchQuery,
        selectedDepartment,
        selectedCriteria,
        timestamp: new Date().toISOString()
      });
      message.error(`Lỗi khi tìm kiếm: ${error.message || "Vui lòng thử lại."}`);
      setResearchPapers([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, selectedDepartment, selectedCriteria, departments]);

  const handleResetSearch = useCallback(async () => {
    setSearchQuery("");
    setSelectedCriteria("");
    setIsSearching(true);
    try {
      const userId = localStorage.getItem("user_id");
      const response = userId
        ? await userApi.getRecommendationsByUserHistory(userId)
        : await userApi.getAllScientificPapers();

      const papers = response?.data || response?.scientificPapers || [];
      const mappedPapers = await Promise.all(
        papers.map(async (paper) => {
          try {
            return {
              ...paper,
              departmentName:
                departments[paper.department] || "Khoa không xác định",
            };
          } catch (error) {
            return null;
          }
        })
      );

      const validPapers = mappedPapers.filter((paper) => paper !== null);
      const approvedPapers = validPapers.filter(
        (paper) => paper.status === "approved"
      );

      setResearchPapers(approvedPapers);
      setCurrentPage(1);

      // Cập nhật top papers và biểu đồ khi reset
      const top10Papers = approvedPapers.slice(0, 10);
      await saveTopPapersToLocal(top10Papers);
      
      // Lấy bài báo liên quan cho top 10
      const relatedPapersResult = await fetchRelatedPapers(top10Papers);
      
      // Cập nhật biểu đồ với trạng thái reset (không có câu truy vấn)
      updateCytoscapeElements(top10Papers, "", relatedPapersResult);

      message.success("Đã reset kết quả tìm kiếm.");
    } catch (error) {
      console.error("Lỗi khi reset tìm kiếm:", error);
      message.error("Lỗi khi reset tìm kiếm. Vui lòng thử lại.");
    } finally {
      setIsSearching(false);
    }
  }, [departments]);

  const isPaperInCollection = async (userId, paperId) => {
    if (!userId || !paperId) {
      console.error("Lỗi: userId hoặc paperId không xác định.");
      return false;
    }
    try {
      const response = await userApi.isPaperInCollection(userId, paperId);
      return response.exists;
    } catch (error) {
      console.error(
        `Lỗi khi kiểm tra bài báo trong bộ sưu tập cho bài ${paperId}:`,
        error
      );
      return false;
    }
  };

  useEffect(() => {
    const checkArchivedPapers = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("Lỗi: userId không xác định.");
        return;
      }
      try {
        const archivedStatuses = await Promise.all(
          researchPapers
            .filter((paper) => paper.id)
            .map(async (paper) => {
              const isArchived = await isPaperInCollection(userId, paper.id);
              return { paperId: paper.id, isArchived };
            })
        );

        setArchivedPapers(
          archivedStatuses
            .filter((status) => status.isArchived)
            .map((status) => status.paperId)
        );
      } catch (error) {
        console.error("Lỗi khi kiểm tra bài báo lưu trữ:", error);
      }
    };

    if (researchPapers.length > 0) {
      checkArchivedPapers();
    }
  }, [researchPapers]);

  const removePaperFromCollection = async (paperId) => {
    try {
      const userId = localStorage.getItem("user_id");
      const userCollections = await userApi.getCollectionsByUserId(userId);
      setCollections(userCollections);

      const collection = userCollections.find((col) =>
        col.papers.some((paper) =>
          typeof paper === "string" ? paper === paperId : paper._id === paperId
        )
      );

      if (!collection || !collection._id) {
        console.error("Không tìm thấy bộ sưu tập cho bài báo ID:", paperId);
        message.error("Không tìm thấy danh mục chứa bài báo này.");
        return;
      }

      const payload = {
        collection_id: collection._id,
        paper_id: paperId,
      };

      await userApi.removePaperFromCollection(payload);
      setArchivedPapers((prev) => prev.filter((id) => id !== paperId));

      setCollections((prev) =>
        prev.map((col) =>
          col._id === collection._id
            ? {
                ...col,
                papers: col.papers.filter((paper) =>
                  typeof paper === "string"
                    ? paper !== paperId
                    : paper._id !== paperId
                ),
              }
            : col
        )
      );

      message.success("Bài nghiên cứu đã được xóa khỏi danh mục lưu trữ!");
    } catch (error) {
      console.error("Lỗi khi xóa bài nghiên cứu khỏi bộ sưu tập:", error);
      message.error("Lỗi khi xóa bài nghiên cứu khỏi danh mục.");
    }
  };

  const showModal = async (paper) => {
    if (archivedPapers.includes(paper.id)) {
      await removePaperFromCollection(paper.id);
      return;
    }

    setSelectedPaper(paper);
    setIsModalVisible(true);
    setNewCategory("");
    setSelectedCategory("");
    setIsAddingCategory(false);

    try {
      const userId = localStorage.getItem("user_id");
      const userCollections = await userApi.getCollectionsByUserId(userId);
      setCollections(userCollections);
      setCategories(userCollections.map((collection) => collection.name));
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCategory.trim()) {
      message.error("Tên danh mục không được để trống.");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      message.error("Tên danh mục đã tồn tại. Vui lòng chọn tên khác.");
      return;
    }

    try {
      if (!userId || !userType) {
        throw new Error(
          "User ID hoặc User Type bị thiếu. Vui lòng đăng nhập lại."
        );
      }

      const payload = {
        user_id: localStorage.getItem("user_id"),
        user_type: localStorage.getItem("user_type"),
        name: newCategory,
      };

      const response = await userApi.createCollection(payload);

      if (
        !response ||
        !response.collection ||
        !response.collection._id ||
        !response.collection.name
      ) {
        throw new Error("Phản hồi API thiếu các trường cần thiết.");
      }

      const newCollection = response.collection;

      if (selectedPaper) {
        const addPaperPayload = {
          collection_id: newCollection._id,
          paper_id: selectedPaper.id,
        };
        await userApi.addPaperToCollection(addPaperPayload);
      }

      setCollections((prev) => [...prev, newCollection]);
      setCategories((prev) => [...prev, newCollection.name]);
      setSelectedCategory(newCollection.name);
      if (selectedPaper) {
        setArchivedPapers((prev) => [...prev, selectedPaper.id]);
      }
      setNewCategory("");
      setIsAddingCategory(false);
      setIsModalVisible(false);
      message.success("Danh mục mới đã được tạo và bài báo đã được lưu!");
    } catch (error) {
      if (
        error.response?.data?.message ===
        "Collection with this name already exists."
      ) {
        message.error(
          "Danh mục với tên này đã tồn tại. Vui lòng chọn tên khác."
        );
      } else {
        console.error("Lỗi khi tạo danh mục:", error);
        message.error(error.message || "Lỗi kết nối đến server");
      }
    }
  };

  const handleAddPaperToCollection = async (category) => {
    console.log("handleAddPaperToCollection được gọi");
    console.log("Danh mục được chọn:", category);

    if (!category) {
      message.error("Vui lòng chọn danh mục trước khi lưu.");
      return;
    }
    if (!selectedPaper || !selectedPaper.id) {
      console.log("Bài báo được chọn:", selectedPaper);
      message.error("Không tìm thấy bài nghiên cứu để lưu.");
      return;
    }

    const collection = collections.find((col) => col.name === category);

    if (!collection || !collection._id) {
      console.error("Không tìm thấy danh mục:", category);
      message.error("Không tìm thấy danh mục phù hợp. Vui lòng thử lại.");
      return;
    }

    if (collection.papers.some((paper) => paper === selectedPaper.id)) {
      message.warning("Bài nghiên cứu đã tồn tại trong danh mục này.");
      return;
    }

    try {
      const payload = {
        collection_id: collection._id,
        paper_id: selectedPaper.id,
      };
      console.log("Payload gửi đến API:", payload);

      const response = await userApi.addPaperToCollection(payload);
      console.log("Phản hồi từ API:", response);

      if (
        response &&
        response.message === "Paper added to collection successfully."
      ) {
        setArchivedPapers((prev) => [...prev, selectedPaper.id]);
        setIsModalVisible(false);
        message.success("Bài nghiên cứu đã được thêm vào danh mục lưu trữ!");
      } else if (
        response &&
        response.message === "Paper already exists in the collection."
      ) {
        console.warn("Bài báo đã tồn tại trong bộ sưu tập:", response);
        message.warning("Bài nghiên cứu đã tồn tại trong danh mục này.");
      } else {
        const errorMessage =
          response?.message || "API không trả về kết quả thành công.";
        console.error("Lỗi từ API:", errorMessage);
        message.error(errorMessage);
      }
    } catch (error) {
      console.error("Lỗi khi thêm bài nghiên cứu vào danh mục:", error);
      message.error(
        error.message || "Lỗi khi thêm bài nghiên cứu vào danh mục."
      );
    }
  };

  const handleCategoryChange = useCallback((e) => {
    const newCategory = e.target.value;
    console.log("Danh mục thay đổi thành:", newCategory);
    setSelectedCategory(newCategory);
  }, []);

  const handleOk = useCallback(() => {
    console.log("handleOk được gọi");
    if (newCategory.trim() && !categories.includes(newCategory)) {
      handleCreateCollection();
    } else {
      handleAddPaperToCollection(selectedCategory);
    }
  }, [newCategory, categories, selectedCategory]);

  const handleCancel = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleAddCategoryClick = useCallback(() => {
    setIsAddingCategory(true);
  }, []);

  const PaperItem = ({ index, style, data }) => {
    const paper = data[index];
    if (!paper.id) {
      console.error("Bài báo thiếu id:", paper);
      return null;
    }
    return (
      <div
        style={{
          ...style,
          height: window.innerWidth <= 768 ? 160 : style.height,
          marginBottom: window.innerWidth <= 768 ? 0 : 0,
        }}
      >
        <Link
          to={`/scientific-paper/${paper.id}`}
          key={paper.id}
          className="w-full block"
        >
          <article
            className={`grid grid-cols-[auto,1fr] gap-6 px-4 py-4 bg-white rounded-xl shadow-sm max-md:grid-cols-1 max-md:px-4 max-md:py-2 max-md:w-full ${
              index > 0 ? "mt-0 max-md:mt-0" : ""
            }`}
          >
            <div className="flex justify-center w-fit lg:block max-lg:hidden">
              <img
                src={paper.thumbnailUrl}
                className="object-cover align-middle rounded-md w-auto max-w-full md:max-w-[150px] h-[180px] aspect-[4/3] max-md:aspect-[16/9] max-md:h-[100px] max-md:max-w-[80px] m-0 border border-gray-200"
                alt={paper.title_vn || "Không có tiêu đề"}
              />
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-md:gap-1 max-md:overflow-hidden relative">
              <div className="flex justify-between items-start">
                <h2 className="text-sm font-bold break-words max-w-[70%] line-clamp-2 max-md:max-w-full max-md:text-xs max-md:w-full">
                  {paper.title || paper.title_en || "Không có tiêu đề"}
                </h2>

                <div className="flex flex-col items-end text-xs text-neutral-500 max-md:text-[10px] max-md:hidden ml-2 flex-shrink-0">
                  <div className="flex items-center gap-2 max-md:gap-1">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                      className="object-contain w-4 aspect-square max-md:w-2"
                      alt="Biểu tượng lượt xem"
                    />
                    <div className="text-orange-500">
                      {typeof paper.views === "number" ? paper.views : 0}
                    </div>
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                      className="object-contain w-4 aspect-[1.2] max-md:w-2"
                      alt="Biểu tượng lượt tải"
                    />
                    <div>
                      {typeof paper.downloads === "number"
                        ? paper.downloads
                        : 0}
                    </div>
                  </div>
                  <div>
                    {paper.publish_date
                      ? new Date(paper.publish_date).toLocaleDateString()
                      : "Không có ngày"}
                  </div>
                </div>
              </div>

              <div className="text-sm text-sky-900 max-md:text-[10px]">
                {paper.author || "Không có thông tin tác giả"}
              </div>
              <p className="text-sm text-neutral-800 break-words w-full line-clamp-2 max-md:text-[10px] max-md:line-clamp-1">
                {paper.summary || "Không có thông tin tóm tắt"}
              </p>
              <div className="text-sm text-sky-900 max-md:text-[10px]">
                {paper.departmentName || "Không có thông tin khoa"}
              </div>
              <div className="flex justify-between items-center">
                <div className="hidden max-md:flex max-md:items-center max-md:gap-1 max-md:text-[10px] text-neutral-500">
                  <div className="flex items-center gap-1">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                      className="object-contain w-3 aspect-square"
                      alt="Biểu tượng lượt xem"
                    />
                    <div className="text-orange-500">
                      {typeof paper.views === "number" ? paper.views : 0}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                      className="object-contain w-3 aspect-[1.2]"
                      alt="Biểu tượng lượt tải"
                    />
                    <div>
                      {typeof paper.downloads === "number"
                        ? paper.downloads
                        : 0}
                    </div>
                  </div>
                  <div className="ml-2">
                    {paper.publish_date
                      ? new Date(paper.publish_date).toLocaleDateString()
                      : "Không có ngày"}
                  </div>
                </div>
                <div className="ml-auto">
                  {archivedPapers.includes(paper.id) ? (
                    <FaArchive
                      className="w-5 h-5 cursor-pointer text-yellow-500 max-md:w-4 max-md:h-4"
                      onClick={(e) => {
                        e.preventDefault();
                        confirmRemovePaper(paper);
                      }}
                    />
                  ) : (
                    <FaRegFileArchive
                      className="w-5 h-5 cursor-pointer text-gray-500 hover:text-yellow-500 max-md:w-4 max-md:h-4"
                      onClick={(e) => {
                        e.preventDefault();
                        showModal(paper);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </article>
        </Link>
      </div>
    );
  };

  const confirmRemovePaper = (paper) => {
    setPaperToRemove(paper);
    setIsRemoveModalVisible(true);
  };

  const handleRemovePaper = async () => {
    if (paperToRemove) {
      await removePaperFromCollection(paperToRemove.id);
    }
    setIsRemoveModalVisible(false);
    setPaperToRemove(null);
  };

  const fetchRelatedPapers = async (papers) => {
    try {
      console.log('Starting to fetch related papers for:', papers);
      
      const recommendationsPromises = papers.map(paper => {
        console.log('Fetching recommendations for paper:', paper.id);
        return userApi.getRecommendations(paper.id);
      });
      
      const recommendationsResults = await Promise.all(recommendationsPromises);
      console.log('Recommendations results:', recommendationsResults);
      
      // Log the structure of first result to debug
      if (recommendationsResults.length > 0) {
        console.log('First result structure:', JSON.stringify(recommendationsResults[0], null, 2));
      }
      
      const allRelatedPapers = recommendationsResults.flatMap(result => {
        // Log each result structure
        console.log('Processing result:', result);
        
        // If result is an array, use it directly
        if (Array.isArray(result)) {
          return result;
        }
        
        // If result has data property that is an array, use it
        if (result && Array.isArray(result.data)) {
          return result.data;
        }
        
        // If result has recommendations property that is an array, use it
        if (result && Array.isArray(result.recommendations)) {
          return result.recommendations;
        }
        
        // If result is an object with papers property, use it
        if (result && Array.isArray(result.papers)) {
          return result.papers;
        }
        
        // If none of the above, try to extract any array we find
        if (result && typeof result === 'object') {
          const possibleArrays = Object.values(result).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            // Use the longest array found
            return possibleArrays.reduce((a, b) => a.length > b.length ? a : b);
          }
        }
        
        return [];
      });

      console.log('All related papers before filtering:', allRelatedPapers);

      const uniquePapersMap = new Map();
      allRelatedPapers.forEach(paper => {
        // Skip if paper is null or undefined
        if (!paper) return;
        
        // Log paper structure to debug
        console.log('Processing paper:', paper);
        
        const paperId = paper._id || paper.id;
        if (!paperId) {
          console.log('Paper missing ID:', paper);
          return;
        }

        // Skip if this paper is already in our top papers
        if (papers.some(p => p.id === paperId)) {
          console.log('Skipping duplicate paper:', paperId);
          return;
        }

        // Only add if not already in our map
        if (!uniquePapersMap.has(paperId)) {
          const mappedPaper = {
            id: paperId,
            title: paper.title_vn || paper.title_en || paper.title || "Không có tiêu đề",
            author: Array.isArray(paper.author) 
              ? paper.author.map(a => a.author_name_vi || a.author_name_en || a.name || a).join(", ")
              : typeof paper.author === 'string' 
                ? paper.author
                : paper.author?.author_name_vi || paper.author?.author_name_en || "Tác giả không xác định",
            departmentName: paper.department_name || paper.departmentName || "Khoa không xác định",
            score: paper.score || paper.similarity || 1,
            summary: paper.summary || paper.abstract || "Không có tóm tắt",
            publish_date: paper.publish_date || paper.publishDate || null,
            keywords: paper.keywords || []
          };
          
          console.log('Adding mapped paper:', mappedPaper);
          uniquePapersMap.set(paperId, mappedPaper);
        }
      });

      const uniqueRelatedPapers = Array.from(uniquePapersMap.values());
      console.log('Final unique related papers:', uniqueRelatedPapers);
      
      localStorage.setItem('relatedPapers', JSON.stringify(uniqueRelatedPapers));
      setRelatedPapers(uniqueRelatedPapers);
      return uniqueRelatedPapers;
    } catch (error) {
      console.error('Error fetching related papers:', error);
      message.error('Lỗi khi tải bài báo liên quan');
      return [];
    }
  };

  const saveTopPapersToLocal = async (papers) => {
    try {
      const top10Papers = papers.slice(0, 10).map(paper => {
        let authorString = "";
        if (Array.isArray(paper.author)) {
          authorString = paper.author
            .map(a => a.author_name_vi || a.author_name_en || "")
            .filter(Boolean)
            .join(", ");
        } else if (typeof paper.author === 'object' && paper.author !== null) {
          authorString = paper.author.author_name_vi || paper.author.author_name_en || "Tác giả không xác định";
        } else if (typeof paper.author === 'string') {
          authorString = paper.author;
        } else {
          authorString = "Tác giả không xác định";
        }

        return {
          id: paper.id || paper._id,
          title: paper.title || paper.title_vn || paper.title_en || "Không có tiêu đề",
          author: authorString,
          score: paper.score || 1,
          departmentName: paper.departmentName || paper.department_name || "Khoa không xác định",
          summary: paper.summary || "Không có tóm tắt",
          publish_date: paper.publish_date || null,
          keywords: paper.keywords || []
        };
      });
      
      localStorage.setItem('topPapers', JSON.stringify(top10Papers));
      setTopPapers(top10Papers);

      // Fetch related papers
      console.log('Fetching related papers for top10:', top10Papers);
      const relatedPapersResult = await fetchRelatedPapers(top10Papers);
      console.log('Got related papers:', relatedPapersResult);

      // Update cytoscape elements with both top papers and related papers
      updateCytoscapeElements(top10Papers, searchQuery, relatedPapersResult);
    } catch (error) {
      console.error('Error in saveTopPapersToLocal:', error);
      message.error('Có lỗi xảy ra khi xử lý dữ liệu');
    }
  };

  const updateCytoscapeElements = (papers, query, relatedPapers = []) => {
    console.log('Updating cytoscape elements with:', { papers, query, relatedPapers });
    const elements = [];
    
    // Add query node at center
    elements.push({
      data: {
        id: 'query',
        label: query || 'Không có câu truy vấn',
        shortLabel: (query || 'Không có câu truy vấn').substring(0, 15) + '...',
        type: 'query',
        fontSize: 12
      },
      position: { x: 0, y: 0 },
      locked: true
    });

    // Add top papers in inner circle
    papers.forEach((paper, index) => {
      const angle = (2 * Math.PI * index) / papers.length;
      const radius = 200;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      elements.push({
        data: {
          id: paper.id,
          label: paper.title,
          shortLabel: paper.title.substring(0, 15) + '...',
          type: 'paper',
          fullData: paper,
          size: 25,
          fontSize: 10
        },
        position: { x, y },
        locked: true
      });

      // Edge from query to top paper
      elements.push({
        data: {
          id: `edge-query-${paper.id}`,
          source: 'query',
          target: paper.id,
          weight: 2
        }
      });
    });

    // Add related papers in outer circle
    if (relatedPapers && relatedPapers.length > 0) {
      console.log('Adding related papers to graph:', relatedPapers);
      relatedPapers.forEach((paper, index) => {
        if (!paper || !paper.id) {
          console.warn('Invalid related paper:', paper);
          return;
        }

        const angle = (2 * Math.PI * index) / relatedPapers.length;
        const radius = 400; // Larger radius for outer circle
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        // Add related paper node
        elements.push({
          data: {
            id: paper.id,
            label: paper.title,
            shortLabel: paper.title.substring(0, 15) + '...',
            type: 'related',
            fullData: paper,
            size: 20,
            fontSize: 8
          },
          position: { x, y },
          locked: true
        });

        // Connect to most similar top papers
        papers.forEach(topPaper => {
          // Calculate similarity score (simple text matching for now)
          const similarity = calculateSimilarity(paper.title, topPaper.title);
          if (similarity > 0.3) { // Add edge only if similarity is above threshold
            elements.push({
              data: {
                id: `edge-related-${paper.id}-${topPaper.id}`,
                source: paper.id,
                target: topPaper.id,
                weight: similarity,
                type: 'related'
              }
            });
          }
        });
      });
    }

    console.log('Final cytoscape elements:', elements);
    setCyElements(elements);
  };

  // Helper function to calculate text similarity
  const calculateSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;
    
    // Convert to lowercase and remove special characters
    const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words1 = normalize(text1).split(/\s+/);
    const words2 = normalize(text2).split(/\s+/);
    
    // Count common words
    const common = words1.filter(word => words2.includes(word));
    
    // Calculate Jaccard similarity
    const union = new Set([...words1, ...words2]);
    return common.length / union.size;
  };

  const cyStyle = [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(shortLabel)',
        'text-wrap': 'wrap',
        'text-max-width': '80px',
        'font-size': 'data(fontSize)',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 'data(size)',
        'height': 'data(size)',
        'opacity': 1,
        'transition-property': 'opacity, background-color, width, height',
        'transition-duration': '0.2s'
      }
    },
    {
      selector: 'node[type="query"]',
      style: {
        'background-color': '#e74c3c',
        'width': '50px',
        'height': '50px',
        'font-size': '12px',
        'font-weight': 'bold'
      }
    },
    {
      selector: 'node[type="related"]',
      style: {
        'background-color': '#3498db', // Change color to make it more visible
        'border-width': '2px',
        'border-color': '#2980b9'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 'data(weight)',
        'line-color': '#95a5a6',
        'curve-style': 'straight',
        'opacity': 1,
        'transition-property': 'opacity, width',
        'transition-duration': '0.2s'
      }
    },
    {
      selector: 'edge[type="related"]',
      style: {
        'line-style': 'dashed',
        'line-color': '#3498db'
      }
    },
    {
      selector: '.faded',
      style: {
        'opacity': 0.2
      }
    },
    {
      selector: '.highlighted',
      style: {
        'opacity': 1,
        'background-color': '#e67e22',
        'z-index': 9999
      }
    },
    {
      selector: '.highlighted-edge',
      style: {
        'opacity': 1,
        'line-color': '#e67e22',
        'z-index': 9999,
        'width': function(ele) {
          return parseFloat(ele.data('weight')) + 2;
        }
      }
    }
  ];

  const cyLayout = {
    name: 'concentric',
    concentric: function(node) {
      return node.data('type') === 'query' ? 2 : 1;
    },
    levelWidth: function() { return 1; },
    minNodeSpacing: 80,
    animate: true,
    animationDuration: 500,
    fit: true,
    padding: 50,
    spacingFactor: 1.5,
    stop: function() {
      if (cyRef.current) {
        const zoom = cyRef.current.zoom();
        const pan = cyRef.current.pan();
        cyRef.current._private.currentZoom = zoom;
        cyRef.current._private.currentPan = pan;
      }
    }
  };

  const handleCytoscapeEvents = (cy) => {
    const resetAllElements = () => {
      cy.elements().removeClass('faded highlighted highlighted-edge');
    };

    const highlightNode = (nodeId) => {
      resetAllElements();
      if (nodeId && nodeId !== 'query') {
        cy.elements().addClass('faded');
        cy.$(`#${nodeId}`).removeClass('faded').addClass('highlighted');
        cy.edges(`[source = "${nodeId}"]`).removeClass('faded').addClass('highlighted-edge');
        cy.$('#query').removeClass('faded');
      }
    };

    let lastZoom = cy.zoom();
    let lastPan = cy.pan();

    cy.on('zoom', () => {
      lastZoom = cy.zoom();
    });

    cy.on('pan', () => {
      lastPan = cy.pan();
    });

    cy.on('layoutstop', () => {
      if (lastZoom && lastPan) {
        cy.viewport({
          zoom: lastZoom,
          pan: lastPan
        });
      }
    });

    cy.on('tap', 'node', function(evt) {
      const node = evt.target;
      const nodeId = node.id();
      
      if (nodeId === 'query') {
        resetAllElements();
        setSelectedNodeId(null);
        setSelectedPaper(null);
        return;
      }

      if (nodeId === selectedNodeId) {
        resetAllElements();
        setSelectedNodeId(null);
        setSelectedPaper(null);
      } else {
        setSelectedNodeId(nodeId);
        setSelectedPaper(node.data('fullData'));
        highlightNode(nodeId);
      }
    });

    cy.on('mouseover', 'node', function(evt) {
      const node = evt.target;
      const nodeId = node.id();
      
      if (nodeId === 'query') return;

      if (!selectedNodeId) {
        node.addClass('highlighted');
        cy.edges(`[source = "${nodeId}"]`).addClass('highlighted-edge');
      }
    });

    cy.on('mouseout', 'node', function(evt) {
      const node = evt.target;
      const nodeId = node.id();
      
      if (nodeId === 'query') return;

      if (!selectedNodeId) {
        node.removeClass('highlighted');
        cy.edges(`[source = "${nodeId}"]`).removeClass('highlighted-edge');
      }
    });

    cy.on('tap', function(evt) {
      if (evt.target === cy) {
        resetAllElements();
        setSelectedNodeId(null);
        setSelectedPaper(null);
      }
    });
  };

  const handlePaperClick = (paper) => {
    if (selectedPaper?.id === paper.id) {
      setSelectedPaper(null);
      setSelectedNodeId(null);
      if (cyRef.current) {
        cyRef.current.elements().removeClass('faded highlighted highlighted-edge');
      }
    } else {
      setSelectedPaper(paper);
      setSelectedNodeId(paper.id);
      if (cyRef.current) {
        const cy = cyRef.current;
        cy.elements().removeClass('faded highlighted highlighted-edge');
        cy.elements().addClass('faded');
        cy.$(`#${paper.id}`).removeClass('faded').addClass('highlighted');
        cy.edges(`[source = "${paper.id}"]`).removeClass('faded').addClass('highlighted-edge');
        cy.$('#query').removeClass('faded');
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="bg-[#E7ECF0] min-h-screen">
        <style>
          {`
            .custom-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .custom-scrollbar::-webkit-scrollbar {
              width: 0;
            }
            .custom-scrollbar:hover {
              scrollbar-width: thin;
            }
            .custom-scrollbar:hover::-webkit-scrollbar {
              width: 8px;
            }
            @media (max-width: 640px) {
              body {
                min-width: 320px;
              }
            }
          `}
        </style>
        <div className="flex flex-col pb-7 mx-auto w-full max-w-[1563px] px-4 md:px-8 lg:px-24">
          <div className="w-full bg-white">
            <Header />
          </div>
          <div className="self-center w-full max-w-[1563px] pt-[80px] sticky top-0 bg-[#E7ECF0] z-20 max-md:static max-md:pt-[60px]">
            <div className="flex items-center gap-2 text-gray-600 text-sm max-md:text-xs">
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
                alt="Biểu tượng Trang chủ"
                className="w-5 h-5 max-md:w-3 max-md:h-3"
              />
              <span>Trang chủ</span>
              <span className="text-gray-400"> &gt; </span>
              <span className="font-semibold text-sky-900">Tìm kiếm</span>
            </div>
            <div className="flex gap-4 rounded-lg items-center mt-4 mb-3 max-md:flex-col max-md:gap-1.5">
              <select
                className="p-2 border rounded-lg w-60 text-sm max-md:w-full max-md:p-1.5 max-md:text-xs"
                value={selectedCriteria}
                onChange={(e) => setSelectedCriteria(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="title">Tiêu đề</option>
                <option value="author">Tác giả</option>
                <option value="year">Năm xuất bản</option>
                <option value="keywords">Từ khóa</option>
              </select>
              <div className="relative flex-1 max-md:w-full">
                {selectedCriteria === "year" ? (
                  <select
                    className="p-2 border rounded-lg w-full text-sm max-md:w-full max-md:p-1.5 max-md:text-xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  >
                    <option value="">Chọn năm</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="p-2 border rounded-lg w-full text-sm max-md:w-full max-md:p-1.5 max-md:text-xs"
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                )}
              </div>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm max-md:w-full max-md:py-1.5 max-md:text-xs max-md:h-[32px] hover:bg-blue-600"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? "Đang tìm..." : "Tìm kiếm"}
              </button>
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm max-md:w-full max-md:py-1.5 max-md:text-xs max-md:h-[32px] hover:bg-gray-600"
                onClick={handleResetSearch}
              >
                Làm mới
              </button>
            </div>
          </div>
          <div className="self-center mt-6 w-full max-w-[1563px] max-md:max-w-full">
            <div className="flex gap-4 items-center mb-4">
              <span className="text-sm text-gray-600">Chế độ xem:</span>
              <button 
                className={`px-4 py-1.5 rounded-lg text-sm ${viewMode === "list" ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setViewMode("list")}
              >
                Dạng bảng
              </button>
              <button 
                className={`px-4 py-1.5 rounded-lg text-sm ${viewMode === "graph" ? "bg-sky-500 text-white" : "bg-gray-200 text-gray-700"}`}
                onClick={() => setViewMode("graph")}
              >
                Dạng biểu đồ
              </button>
            </div>

            <div className="flex gap-5 max-md:flex-col">
              {viewMode === "list" ? (
                <>
                  <section className="w-[71%] max-md:w-full" ref={papersListRef}>
                    <div className="flex flex-col w-full max-md:mt-2 max-md:max-w-full">
                      {isLoadingPapers ? (
                        <div className="flex justify-center items-center min-h-[300px] max-md:min-h-[200px]">
                          <Spin size="large" />
                        </div>
                      ) : filteredPapers.length === 0 ? (
                        <div className="flex justify-center items-center min-h-[300px] max-md:min-h-[200px]">
                          <p>Không tìm thấy bài báo nào.</p>
                        </div>
                      ) : (
                        <FixedSizeList
                          height={window.innerWidth <= 768 ? 500 : 600}
                          width="100%"
                          itemCount={currentPapers.length}
                          itemSize={window.innerWidth <= 768 ? 150 : 220}
                          itemData={currentPapers}
                          className="max-md:!h-[500px]"
                        >
                          {PaperItem}
                        </FixedSizeList>
                      )}
                      <div className="flex justify-center items-center mt-6 gap-2 max-md:mt-3 max-md:flex-wrap">
                        <div className="flex items-center">
                          <Select
                            value={papersPerPage}
                            onChange={(value) => {
                              setPapersPerPage(value);
                              setCurrentPage(1);
                            }}
                            style={{ width: 120, marginRight: 16 }}
                            options={[
                              { value: 10, label: "10 / trang" },
                              { value: 20, label: "20 / trang" },
                              { value: 30, label: "30 / trang" },
                              { value: 50, label: "50 / trang" },
                            ]}
                          />
                          <span>{`${
                            (currentPage - 1) * papersPerPage + 1
                          }-${Math.min(
                            currentPage * papersPerPage,
                            filteredPapers.length
                          )} của ${filteredPapers.length} mục`}</span>
                        </div>

                        <button
                          className="px-3 py-1 border rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-2 max-md:py-0.5 max-med:text-xs"
                          disabled={currentPage === 1 || isSearching}
                          onClick={() =>
                            handlePageChange(Math.max(currentPage - 1, 1))
                          }
                        >
                          Trước
                        </button>
                        {[
                          ...Array(
                            Math.ceil(filteredPapers.length / papersPerPage)
                          ),
                        ].map((_, i) => (
                          <button
                            key={i}
                            className={`px-3 py-1 border rounded-md max-md:px-2 max-md:py-0.5 max-md:text-xs ${
                              currentPage === i + 1
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                            }`}
                            onClick={() => handlePageChange(i + 1)}
                            disabled={isSearching}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          className="px-3 py-1 border rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed max-md:px-2 max-md:py-0.5 max-md:text-xs"
                          disabled={
                            currentPage ===
                              Math.ceil(filteredPapers.length / papersPerPage) ||
                            filteredPapers.length === 0 ||
                            isSearching
                          }
                          onClick={() =>
                            handlePageChange(
                              Math.min(
                                currentPage + 1,
                                Math.ceil(filteredPapers.length / papersPerPage)
                              )
                            )
                          }
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  </section>
                  <div className="ml-5 w-[29%] max-md:ml-0 max-md:w-full max-md:mt-3">
                    <section className="sticky top-[195px] z-10 max-md:static">
                      <aside className="overflow-hidden px-4 py-6 mx-auto w-full bg-white rounded-xl shadow-md max-md:px-3 max-md:py-4 max-md:mt-2 max-md:max-w-full">
                        <div className="flex gap-4 justify-between items-start max-w-full text-xs font-bold tracking-tight leading-loose w-[362px] max-md:w-full max-md:text-[10px] max-md:gap-2">
                          <button
                            className={`flex-1 px-4 pt-1.5 pb-1.5 rounded-lg text-center max-md:px-2 max-md:py-1 ${
                              activeTab === "recent"
                                ? "text-white bg-sky-500"
                                : "bg-white text-neutral-500"
                            }`}
                            onClick={() => setActiveTab("recent")}
                          >
                            Bài nghiên cứu mới
                          </button>
                          <button
                            className={`flex-1 px-4 pt-1.5 pb-1.5 rounded-lg text-center max-md:px-2 max-md:py-1 ${
                              activeTab === "featured"
                                ? "text-white bg-sky-500"
                                : "bg-white text-neutral-500"
                            }`}
                            onClick={() => setActiveTab("featured")}
                          >
                            Bài nghiên cứu nổi bật
                          </button>
                        </div>
                        <div className="flex flex-col gap-4 mt-5 max-md:gap-3 max-md:mt-3">
                          {activeTab === "recent" && isLoadingRecent ? (
                            <div className="flex justify-center items-center min-h-[200px]">
                              <Spin size="large" />
                            </div>
                          ) : activeTab === "featured" && isLoadingFeatured ? (
                            <div className="flex justify-center items-center min-h-[200px]">
                              <Spin size="large" />
                            </div>
                          ) : (
                            Array.isArray(displayedPapers) &&
                            displayedPapers.map((paper, index) => (
                              <article
                                key={`paper-${index}`}
                                className="w-full flex gap-4 max-md:gap-2"
                              >
                                <div className="lg:block max-lg:hidden">
                                  <Link to={`/scientific-paper/${paper.id}`}>
                                    <img
                                      src={paper.thumbnailUrl}
                                      className="object-contain rounded-md aspect-[0.72] w-[72px] border border-gray-200"
                                      alt={paper.title}
                                    />
                                  </Link>
                                </div>
                                <div className="flex flex-col text-sm tracking-tight leading-none text-slate-400 w-fit max-md:text-xs">
                                  <Link to={`/scientific-paper/${paper.id}`}>
                                    <div className="paper-details-container flex flex-col gap-2 pt-0 max-md:gap-1">
                                      <h3 className="text-black h-[40px] font-bold text-sm line-clamp-2 pb-2 w-[220px] max-md:text-xs max-md:h-[34px] max-md:pb-1 max-md:w-full">
                                        {paper.title
                                          ? paper.title.split(" ").length > 18
                                            ? paper.title
                                                .split(" ")
                                                .slice(0, 19)
                                                .join(" ") + "..."
                                            : paper.title
                                          : "Không có tiêu đề"}
                                      </h3>
                                      <div className="text-gray-600 text-xs pt-0.5 max-md:text-[10px]">
                                        {paper.author
                                          ? paper.author.length > 30
                                            ? paper.author.substring(0, 35) + "..."
                                            : paper.author
                                          : "Tác giả không xác định"}
                                      </div>
                                      <div className="text-gray-500 text-xs pb-1 max-md:text-[10px] max-md:pb-1 min-h-[20px] max-md:min-h-[16px]">
                                        {paper.departmentName ||
                                          "Khoa không xác định"}
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </article>
                            ))
                          )}
                        </div>
                      </aside>
                    </section>
                  </div>
                </>
              ) : (
                <section className="w-full mb-8">
                  <div className="grid grid-cols-[auto,1fr,auto] gap-4 h-[calc(100vh-400px)] min-h-[500px] max-h-[700px] max-md:grid-cols-1 max-md:h-auto">
                    <div className={`transition-all duration-300 ease-in-out ${
                      leftPanelCollapsed ? 'w-[40px]' : 'w-[300px]'
                    } overflow-hidden border rounded-lg bg-white p-2 max-md:h-[200px] relative flex flex-col`}>
                      <button 
                        className="absolute right-2 top-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                      >
                        {leftPanelCollapsed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                          </svg>
                        )}
                      </button>
                      
                      {!leftPanelCollapsed && (
                        <>
                          <h3 className="font-bold text-sm mb-2 text-sky-900 flex-shrink-0">Top 10 bài báo</h3>
                          <div className="overflow-y-auto flex-grow custom-scrollbar">
                            {topPapers.map((paper) => (
                              <div 
                                key={paper.id}
                                className={`p-2 border-b cursor-pointer hover:bg-gray-50 transition-all duration-200 ${
                                  selectedPaper?.id === paper.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                } ${selectedNodeId && selectedNodeId !== paper.id ? 'opacity-20' : ''}`}
                                onClick={() => handlePaperClick(paper)}
                                onMouseEnter={() => {
                                  if (cyRef.current && !selectedNodeId) {
                                    const cy = cyRef.current;
                                    cy.$(`#${paper.id}`).addClass('highlighted');
                                    cy.edges(`[source = "${paper.id}"]`).addClass('highlighted-edge');
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (cyRef.current && !selectedNodeId) {
                                    const cy = cyRef.current;
                                    cy.$(`#${paper.id}`).removeClass('highlighted');
                                    cy.edges(`[source = "${paper.id}"]`).removeClass('highlighted-edge');
                                  }
                                }}
                              >
                                <h3 className="font-semibold text-sm line-clamp-2">{paper.title}</h3>
                                <p className="text-xs text-gray-500">{paper.author}</p>
                                <p className="text-xs text-gray-400">
                                  {paper.publish_date ? new Date(paper.publish_date).toLocaleDateString() : "Không có ngày"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="border rounded-lg bg-white p-4 overflow-hidden">
                      <div className="w-full h-full relative">
                        <Cytoscape
                          elements={cyElements}
                          style={{ width: '100%', height: '100%' }}
                          stylesheet={cyStyle}
                          layout={cyLayout}
                          cy={(cy) => {
                            cyRef.current = cy;
                            handleCytoscapeEvents(cy);
                            cy.userZoomingEnabled(true);
                            cy.userPanningEnabled(true);
                            cy.minZoom(0.1);
                            cy.maxZoom(3);
                            cy.zoom({
                              level: 1,
                              position: { x: 0, y: 0 }
                            });
                            // Remove custom wheel handling and use default zoom behavior
                          }}
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            onClick={() => {
                              const cy = cyRef.current;
                              if (cy) {
                                const currentZoom = cy.zoom();
                                const newZoom = currentZoom * 1.2;
                                if (newZoom <= cy.maxZoom()) {
                                  cy.animate({
                                    zoom: newZoom,
                                    duration: 200
                                  });
                                }
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            onClick={() => {
                              const cy = cyRef.current;
                              if (cy) {
                                const currentZoom = cy.zoom();
                                const newZoom = currentZoom / 1.2;
                                if (newZoom >= cy.minZoom()) {
                                  cy.animate({
                                    zoom: newZoom,
                                    duration: 200
                                  });
                                }
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button
                            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                            onClick={() => {
                              const cy = cyRef.current;
                              if (cy) {
                                cy.fit({
                                  padding: 50,
                                  duration: 200
                                });
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={`transition-all duration-300 ease-in-out ${
                      rightPanelCollapsed ? 'w-[40px]' : 'w-[300px]'
                    } border rounded-lg bg-white p-4 max-md:h-[300px] relative flex flex-col overflow-hidden`}>
                      <button 
                        className="absolute left-2 top-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                      >
                        {rightPanelCollapsed ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>

                      {!rightPanelCollapsed && (
                        <div className="overflow-y-auto flex-grow custom-scrollbar">
                          {selectedPaper ? (
                            <>
                              <h2 className="text-lg font-bold mb-2">{selectedPaper.title}</h2>
                              <p className="text-sm text-gray-600 mb-2">{selectedPaper.author}</p>
                              <p className="text-xs text-gray-500 mb-4">
                                {selectedPaper.departmentName} • 
                                {selectedPaper.publish_date 
                                  ? new Date(selectedPaper.publish_date).toLocaleDateString() 
                                  : "Không có ngày"}
                              </p>
                              <p className="text-sm">{selectedPaper.summary}</p>
                              
                              {selectedPaper.keywords && Array.isArray(selectedPaper.keywords) && selectedPaper.keywords.length > 0 && (
                                <div className="mt-4">
                                  <p className="font-semibold">Từ khóa:</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {selectedPaper.keywords.map((keyword, index) => (
                                      <span key={index} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                        {keyword}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-4 flex gap-2">
                                <Link to={`/scientific-paper/${selectedPaper.id}`}>
                                  <Button type="primary" size="small">Xem chi tiết</Button>
                                </Link>
                                <Button 
                                  type={archivedPapers.includes(selectedPaper.id) ? "default" : "primary"} 
                                  size="small"
                                  icon={archivedPapers.includes(selectedPaper.id) ? <FaArchive /> : <FaRegFileArchive />}
                                  onClick={() => showModal(selectedPaper)}
                                >
                                  {archivedPapers.includes(selectedPaper.id) ? 'Đã lưu' : 'Lưu trữ'}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <p className="text-gray-500 text-center mt-10">
                              Chọn một bài báo để xem chi tiết
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
        <Footer />
        <Modal
          title="Thêm vào Lưu trữ"
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button
              key="back"
              onClick={handleCancel}
              className="h-[40px] max-md:h-[32px] max-md:text-xs"
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleOk}
              className="h-[40px] max-md:h-[32px] max-md:text-xs"
            >
              Thêm vào mục lưu
            </Button>,
          ]}
          className="max-md:w-[95%]"
        >
          <p className="max-md:text-sm">
            Bài nghiên cứu khoa học: {selectedPaper?.title_vn}
          </p>
          <p className="max-md:text-sm">Các danh mục lưu trữ:</p>
          {isAddingCategory ? (
            <Input
              placeholder="Nhập tên danh mục mới"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="max-md:text-xs"
            />
          ) : (
            <select
              className="p-2 border rounded-lg w-full text-sm max-md:text-xs max-md:p-1.5"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
          <div className="mt-4 max-md:mt-2">
            {!isAddingCategory && (
              <Button
                type="primary"
                className="mt-2 h-[40px] max-md:h-[32px] max-md:text-xs max-md:mt-1"
                onClick={handleAddCategoryClick}
              >
                Thêm danh mục mới
              </Button>
            )}
          </div>
        </Modal>
        <Modal
          title="Xác nhận xóa"
          open={isRemoveModalVisible}
          onOk={handleRemovePaper}
          onCancel={() => setIsRemoveModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsRemoveModalVisible(false)}
              className="h-[40px] max-md:h-[32px] max-md:text-xs"
            >
              Hủy
            </Button>,
            <Button
              key="confirm"
              type="primary"
              danger
              onClick={handleRemovePaper}
              className="h-[40px] max-md:h-[32px] max-md:text-xs"
            >
              Xóa
            </Button>,
          ]}
        >
          <p>Bạn có chắc chắn muốn xóa bài nghiên cứu này khỏi bộ sưu tập?</p>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;