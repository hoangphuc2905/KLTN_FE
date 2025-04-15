import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Link } from "react-router-dom";
// import { StepBackwardOutlined, StepForwardOutlined } from "@ant-design/icons";
import { Modal, Button, Input, message } from "antd";
import userApi from "../../../api/api";
import { FaArchive, FaRegFileArchive } from "react-icons/fa";

const HomePage = () => {
  const [recentPapers, setRecentPapers] = useState([]);
  const [featuredPapers, setFeaturedPapers] = useState([]); // Replace hardcoded array with state

  const [researchPapers, setResearchPapers] = useState([]);
  const [authors, setAuthors] = useState({});
  const [departments, setDepartments] = useState({});
  const [activeTab, setActiveTab] = useState("recent");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [archivedPapers, setArchivedPapers] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState([]);
  const userId = localStorage.getItem("user_id");
  const userType = localStorage.getItem("user_type");
  const [currentPage, setCurrentPage] = useState(1);
  const papersPerPage = 7;

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    const fetchResearchPapers = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const response = await userApi.getRecommendationsByUserHistory(userId);

        // Log the API response to verify its structure
        console.log("API Response for Recommended Papers:", response);

        // Extract and process the data
        const papers = response?.data || [];
        if (!Array.isArray(papers)) {
          console.error("Invalid data format for recommended papers:", papers);
          return;
        }

        const approvedPapers = papers.filter(
          (paper) => paper.status === "approved"
        ); // Only include approved papers

        setResearchPapers(approvedPapers); // Set the approved papers to state
        console.log("Recommended research papers:", approvedPapers);
      } catch (error) {
        console.error("Error fetching recommended research papers:", error);
      }
    };

    fetchResearchPapers();
  }, []); // Fetch recommended papers on page load

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        const userCollections = await userApi.getCollectionsByUserId(userId);
        setCollections(userCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const fetchRecentPapers = async () => {
      try {
        const response = await userApi.getTop5NewestScientificPapers();
        if (response && response.papers) {
          const papers = await Promise.all(
            response.papers.map(async (paper) => ({
              id: paper._id,
              title: paper.title_vn || paper.title_en || "No Title",
              author: paper.author
                .map((a) => a.author_name_vi || a.author_name_en)
                .join(", "),
              department: await getDepartmentById(paper.department),
              thumbnailUrl: paper.cover_image || "",
              summary: paper.summary || "No Summary",
              publish_date: paper.publish_date,
            }))
          );
          setRecentPapers(papers);
        }
      } catch (error) {
        console.error("Error fetching recent papers:", error);
      }
    };

    fetchRecentPapers();
  }, []);

  useEffect(() => {
    const fetchFeaturedPapers = async () => {
      try {
        const response = await userApi.getTop5MostViewedAndDownloadedPapers();
        if (response && response.papers) {
          const papers = await Promise.all(
            response.papers.map(async (paper) => ({
              id: paper._id,
              title: paper.title_vn || paper.title_en || "No Title",
              author: paper.author
                .map((a) => a.author_name_vi || a.author_name_en)
                .join(", "),
              department: await getDepartmentById(paper.department),
              thumbnailUrl: paper.cover_image || "",
            }))
          );
          setFeaturedPapers(papers);
        }
      } catch (error) {
        console.error("Error fetching featured papers:", error);
      }
    };

    fetchFeaturedPapers();
  }, []);

  const fetchAuthors = async (paperId) => {
    if (authors[paperId]) return; // Skip if authors are already fetched

    try {
      const authorsData = await userApi.getAuthorsByPaperId(paperId);
      const authorNames = authorsData.map(
        (author) => author.author_name_vi || author.author_name_en
      );
      setAuthors((prevAuthors) => ({
        ...prevAuthors,
        [paperId]:
          authorNames.length > 0
            ? authorNames.join(", ")
            : "No authors available",
      }));
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`No authors found for paper ${paperId}`);
        setAuthors((prevAuthors) => ({
          ...prevAuthors,
          [paperId]: "No authors available",
        }));
      } else {
        console.error(`Error fetching authors for paper ${paperId}:`, error);
        setAuthors((prevAuthors) => ({
          ...prevAuthors,
          [paperId]: "Error fetching authors",
        }));
      }
    }
  };

  const getDepartmentById = async (departmentId) => {
    try {
      const response = await userApi.getDepartmentById(departmentId);
      return response.department_name || "Unknown Department";
    } catch (error) {
      console.error(`Error fetching department for ID ${departmentId}:`, error);
      return "Unknown Department"; // Fallback in case of error
    }
  };

  const fetchDepartment = async (departmentId) => {
    if (!departmentId || departments[departmentId]) return; // Skip if already fetched or no ID

    try {
      const departmentData = await userApi.getDepartmentById(departmentId);
      setDepartments((prevDepartments) => ({
        ...prevDepartments,
        [departmentId]: departmentData.department_name,
      }));
      console.log(`Fetched department for ID ${departmentId}:`, departmentData);
    } catch (error) {
      console.error(`Error fetching department for ID ${departmentId}:`, error);
      setDepartments((prevDepartments) => ({
        ...prevDepartments,
        [departmentId]: "Unknown Department", // Fallback for errors
      }));
    }
  };

  const fetchDownloadCount = async (paperId) => {
    try {
      const response = await userApi.getDownloadCountByPaperId(paperId);
      return response.download_count || 0;
    } catch (error) {
      console.error(
        `Error fetching download count for paper ${paperId}:`,
        error
      );
      return 0; // Fallback to 0 in case of an error
    }
  };

  const fetchViewCount = async (paperId) => {
    try {
      const response = await userApi.getViewCountByPaperId(paperId);
      return response.viewCount || 0; // Return view count or fallback to 0
    } catch (error) {
      console.error(`Error fetching view count for paper ${paperId}:`, error);
      return 0; // Fallback to 0 in case of an error
    }
  };

  const filteredPapers = researchPapers.filter((paper) => {
    const departmentMatch = selectedDepartment
      ? departments[paper.department] === selectedDepartment
      : true;

    // Updated search matching logic to safely handle all possible search cases
    const searchMatch = searchQuery
      ? paper.title_vn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (authors[paper._id] &&
          authors[paper._id]
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (paper.publish_date &&
          paper.publish_date.toString().includes(searchQuery)) ||
        (paper.keywords &&
          Array.isArray(paper.keywords) &&
          paper.keywords.some((keyword) =>
            keyword.toLowerCase().includes(searchQuery.toLowerCase())
          )) ||
        (paper.summary &&
          paper.summary.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    return departmentMatch && searchMatch;
  });

  console.log("All research papers:", researchPapers.length);
  console.log("After filtering:", filteredPapers.length);
  console.log("selectedDepartment:", selectedDepartment);
  console.log("searchQuery:", searchQuery);

  const displayedPapers =
    activeTab === "recent"
      ? recentPapers
      : activeTab === "featured"
      ? featuredPapers
      : researchPapers; // Default to recommended papers

  useEffect(() => {
    const fetchCountsForCurrentPapers = async () => {
      try {
        const updatedPapers = await Promise.all(
          filteredPapers.map(async (paper) => {
            const [viewCount, downloadCount] = await Promise.all([
              fetchViewCount(paper._id),
              fetchDownloadCount(paper._id),
            ]);
            return { ...paper, views: viewCount, downloads: downloadCount };
          })
        );

        setResearchPapers((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(updatedPapers)) {
            return prev;
          }
          return updatedPapers;
        });
      } catch (error) {
        console.error("Error fetching counts for current papers:", error);
      }
    };

    if (filteredPapers.length > 0) {
      fetchCountsForCurrentPapers();
    }
  }, [JSON.stringify(filteredPapers)]); // Using filteredPapers instead of currentPapers

  useEffect(() => {
    const fetchAuthorsForCurrentPapers = async () => {
      for (const paper of filteredPapers) {
        if (!authors[paper._id]) {
          await fetchAuthors(paper._id); // Fetch authors only if not already fetched
        }
      }
    };

    fetchAuthorsForCurrentPapers();
  }, [JSON.stringify(filteredPapers), JSON.stringify(authors)]);

  useEffect(() => {
    const fetchDepartmentsForCurrentPapers = async () => {
      for (const paper of filteredPapers) {
        if (paper.department && !departments[paper.department]) {
          await fetchDepartment(paper.department); // Fetch department using 'department' field
        }
      }
    };

    fetchDepartmentsForCurrentPapers();
  }, [JSON.stringify(filteredPapers), JSON.stringify(departments)]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await userApi.getAllDepartments();
        const departmentMapping = departments.reduce((acc, department) => {
          acc[department.id] = department.department_name;
          return acc;
        }, {});
        setDepartments((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(departmentMapping))
            return prev;
          return departmentMapping;
        });
        setDepartmentsList((prevList) => {
          if (JSON.stringify(prevList) === JSON.stringify(departments))
            return prevList;
          return departments;
        });
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    // Reset current page when filters change
    setCurrentPage(1);
  }, [searchQuery, selectedDepartment]);

  // Create a ref for the papers section to scroll to
  const papersListRef = useRef(null);

  // Function to handle page change and scroll to top
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredPapers.length / papersPerPage);
  const indexOfLastPaper = currentPage * papersPerPage;
  const indexOfFirstPaper = indexOfLastPaper - papersPerPage;
  const currentPapers = filteredPapers.slice(
    indexOfFirstPaper,
    indexOfLastPaper
  );

  const createPaperView = async (paperId) => {
    try {
      console.log(`Creating view for paperId: ${paperId}`);
      await userApi.createPaperView({
        paper_id: paperId,
        user_id: localStorage.getItem("user_id"),
        user_type: localStorage.getItem("user_type"),
      });
      console.log(`View created for paper ${paperId}`);
    } catch (error) {
      console.error(
        `Error creating view for paper ${paperId}:`,
        error.response?.data || error
      );
    }
  };

  const isPaperInCollection = async (userId, paperId) => {
    try {
      const response = await userApi.isPaperInCollection(userId, paperId); // Call API to check
      return response.exists; // Return true if the paper exists in a collection
    } catch (error) {
      console.error(`Error checking paper in collection:`, error);
      return false; // Default to false in case of an error
    }
  };

  useEffect(() => {
    const checkArchivedPapers = async () => {
      const userId = localStorage.getItem("user_id");
      const archivedStatuses = await Promise.all(
        researchPapers.map(async (paper) => {
          const isArchived = await isPaperInCollection(userId, paper._id);
          return { paperId: paper._id, isArchived };
        })
      );

      setArchivedPapers(
        archivedStatuses
          .filter((status) => status.isArchived)
          .map((status) => status.paperId)
      );
    };

    if (researchPapers.length > 0) {
      checkArchivedPapers();
    }
  }, [JSON.stringify(researchPapers)]);

  const removePaperFromCollection = async (paperId) => {
    try {
      // Ensure collections are up-to-date
      const userId = localStorage.getItem("user_id");
      const userCollections = await userApi.getCollectionsByUserId(userId);
      setCollections(userCollections);

      // Debug: Log collections to verify structure
      console.log("Fetched collections:", userCollections);

      // Find the collection containing the paper
      const collection = userCollections.find((col) => {
        // Log the papers array for debugging
        console.log(`Checking collection: ${col.name}`, col.papers);

        // Check if papers array contains the paper ID
        return col.papers.some((paper) =>
          typeof paper === "string" ? paper === paperId : paper._id === paperId
        );
      });

      if (!collection || !collection._id) {
        console.error("Collection not found for paper ID:", paperId);
        message.error("Không tìm thấy danh mục chứa bài báo này.");
        return;
      }

      const payload = {
        collection_id: collection._id,
        paper_id: paperId,
      };

      await userApi.removePaperFromCollection(payload); // Call API to remove the paper
      setArchivedPapers((prev) => prev.filter((id) => id !== paperId)); // Remove paper from archived list

      // Update the collections state to reflect the removal
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
      console.error("Error removing paper from collection:", error);
      message.error("Lỗi khi xóa bài nghiên cứu khỏi danh mục.");
    }
  };

  const showModal = async (paper) => {
    if (archivedPapers.includes(paper._id)) {
      // If the paper is already archived, remove it
      await removePaperFromCollection(paper._id);
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
      setCategories(userCollections.map((collection) => collection.name)); // Update categories
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCategory.trim()) {
      message.error("Tên danh mục không được để trống.");
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

      const response = await userApi.createCollection(payload); // Call API to create the collection

      // Validate the API response
      if (
        !response ||
        !response.collection ||
        !response.collection._id ||
        !response.collection.name
      ) {
        throw new Error("API response is missing essential fields.");
      }

      const newCollection = response.collection;

      if (selectedPaper) {
        const addPaperPayload = {
          collection_id: newCollection._id,
          paper_id: selectedPaper._id,
        };
        await userApi.addPaperToCollection(addPaperPayload);
      }

      setCollections((prev) => [...prev, newCollection]);
      setCategories((prev) => [...prev, newCollection.name]);
      setSelectedCategory(newCollection.name);
      if (selectedPaper) {
        setArchivedPapers((prev) => [...prev, selectedPaper._id]); // Mark paper as archived
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
        console.error("Error creating collection:", error);
        message.error(error.message || "Lỗi kết nối đến server");
      }
    }
  };

  const handleAddPaperToCollection = async () => {
    if (!selectedCategory) {
      console.error("Error: No category selected.");
      return;
    }
    if (!selectedPaper || !selectedPaper._id) {
      console.error("Error: No paper selected or paper ID is missing.");
      return;
    }

    const collection = collections.find((col) => col.name === selectedCategory);

    if (!collection || !collection._id) {
      console.error(
        `Error: No matching collection found for the selected category: ${selectedCategory}`
      );
      message.error("Không tìm thấy danh mục phù hợp. Vui lòng thử lại.");
      return;
    }

    try {
      const payload = {
        collection_id: collection._id,
        paper_id: selectedPaper._id,
      };

      await userApi.addPaperToCollection(payload);
      setArchivedPapers((prev) => [...prev, selectedPaper._id]); // Mark paper as archived
      setIsModalVisible(false);
      message.success("Bài nghiên cứu đã được thêm vào danh mục lưu trữ!");
    } catch (error) {
      console.error(
        "Error adding paper to collection:",
        error.response?.data || error
      );
    }
  };

  // Ensure selectedCategory is updated when the user selects a category
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleOk = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      handleCreateCollection(); // Create new collection
    } else {
      handleAddPaperToCollection();
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddCategoryClick = () => {
    setIsAddingCategory(true); // Enable the input field for adding a new category
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <style>
        {`
          .custom-scrollbar {
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* Internet Explorer 10+ */
          }

          .custom-scrollbar::-webkit-scrollbar {
            width: 0; /* Safari and Chrome */
          }

          .custom-scrollbar:hover {
            scrollbar-width: thin; /* Firefox */
          }

          .custom-scrollbar:hover::-webkit-scrollbar {
            width: 8px; /* Safari and Chrome */
          }

          @media (max-width: 640px) {
            body {
              min-width: 320px;
            }
          }
        `}
      </style>
      <div className="flex flex-col pb-7 max-w-[calc(100%-220px)] mx-auto max-sm:max-w-[calc(100%-32px)]">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 pt-[80px] sticky top-0 bg-[#E7ECF0] z-20">
          <div className="flex items-center gap-2 text-gray-600 max-md:text-sm">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-5 h-5 max-md:w-4 max-md:h-4"
            />
            <span>Trang chủ</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">Tìm kiếm</span>
          </div>

          <div className="flex gap-4 rounded-lg items-center mt-4 mb-3 max-md:flex-col max-md:gap-3">
            <select
              className="p-2 border rounded-lg w-60 text-sm max-md:w-full max-md:max-w-[95%] max-md:p-3 max-md:text-base"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <option value="">Chọn Khoa</option>
              {departmentsList.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.department_name}
                </option>
              ))}
            </select>
            <select className="p-2 border rounded-lg w-60 text-sm max-md:w-full max-md:max-w-[95%] max-md:p-3 max-md:text-base">
              <option value="">Tất cả</option>
              <option value="title">Tiêu đề</option>
              <option value="author">Tác giả</option>
              <option value="publish_date">Năm xuất bản</option>
              <option value="keywords">Từ khóa</option>
            </select>

            <input
              type="text"
              className="p-2 border rounded-lg flex-1 text-sm max-md:w-full max-md:max-w-[95%] max-md:p-3 max-md:text-base"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm max-md:w-full max-md:max-w-[95%] max-md:py-3 max-md:text-base max-md:h-[44px] hover:bg-blue-600">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full max-sm:px-4">
          <div className="flex gap-5 max-md:flex-col">
            <section className="w-[71%] max-md:w-full" ref={papersListRef}>
              <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
                {currentPapers.map((paper, index) => (
                  <Link
                    to={`/scientific-paper/${paper._id}`}
                    key={paper._id}
                    onClick={() => createPaperView(paper._id)}
                    className="w-full block"
                  >
                    <article
                      key={paper._id}
                      className={`grid grid-cols-[auto,1fr] gap-6 px-4 py-4 bg-white rounded-xl shadow-sm max-md:grid-cols-1 max-md:px-4 max-md:py-4 max-md:w-full ${
                        index > 0 ? "mt-3" : ""
                      }`}
                    >
                      {/* Paper content remains unchanged */}
                      <div className="flex justify-center w-fit lg:block max-lg:hidden">
                        <img
                          src={paper.cover_image}
                          className="object-cover align-middle rounded-md w-auto max-w-full md:max-w-[150px] h-[180px] aspect-[4/3] max-md:aspect-[16/9] max-md:h-[120px] max-md:max-w-[100px] m-0"
                          alt={paper.title_vn || "No Title"}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2 w-full max-md:overflow-hidden">
                        {/* Title */}
                        <div className="grid grid-cols-[auto,1fr] items-center text-sky-900 w-full max-md:flex max-md:flex-col max-md:items-start max-md:w-full">
                          <h2 className="text-sm font-bold break-words max-w-[500px] line-clamp-2 max-md:max-w-full max-md:text-[16px] max-md:w-full">
                            {paper.title_vn || "No Title"}
                          </h2>
                          <div className="flex flex-col items-center ml-auto max-md:ml-0 max-md:mt-2 max-md:w-full">
                            <div className="flex items-center gap-2">
                              <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                                className="object-contain w-4 aspect-square max-md:w-3"
                                alt="Views icon"
                              />
                              <div className="text-xs text-orange-500 max-md:text-sm">
                                {typeof paper.views === "number"
                                  ? paper.views
                                  : 0}
                              </div>
                              <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                                className="object-contain w-4 aspect-[1.2] max-md:w-3"
                                alt="Downloads icon"
                              />
                              <div className="text-xs max-md:text-sm">
                                {typeof paper.downloads === "number"
                                  ? paper.downloads
                                  : 0}
                              </div>
                            </div>
                            <div className="text-xs text-neutral-500 mt-1 max-md:text-sm">
                              {paper.publish_date
                                ? new Date(
                                    paper.publish_date
                                  ).toLocaleDateString()
                                : "No Date"}
                            </div>
                          </div>
                        </div>
                        {/* Authors */}
                        <div className="text-sm text-sky-900 max-md:text-[14px]">
                          {authors[paper._id] || "Loading authors..."}
                        </div>
                        {/* Summary */}
                        <p className="text-sm text-neutral-800 break-words w-full line-clamp-2 max-md:text-[14px]">
                          {paper.summary || "No Summary"}
                        </p>
                        {/* Department */}
                        <div className="text-sm text-sky-900 max-md:text-[14px]">
                          {departments[paper.department] ||
                            "Loading department..."}
                        </div>
                        {/* Archive Icon */}
                        <div className="flex justify-end">
                          {archivedPapers.includes(paper._id) ? (
                            <FaArchive
                              className="w-5 h-5 cursor-pointer text-yellow-500 max-md:w-5 max-md:h-5"
                              onClick={(e) => {
                                e.preventDefault();
                                showModal(paper);
                              }}
                            />
                          ) : (
                            <FaRegFileArchive
                              className="w-5 h-5 cursor-pointer text-gray-500 hover:text-yellow-500 max-md:w-5 max-md:h-5"
                              onClick={(e) => {
                                e.preventDefault();
                                showModal(paper);
                              }}
                            />
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}

                {/* Pagination Controls */}
                <div className="flex justify-center mt-6 gap-2">
                  <button
                    className="px-3 py-1 border rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                  >
                    Trước
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`px-3 py-1 border rounded-md ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-white"
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    className="px-3 py-1 border rounded-md bg-white shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() =>
                      handlePageChange(Math.min(currentPage + 1, totalPages))
                    }
                  >
                    Sau
                  </button>
                </div>
              </div>
            </section>

            <div className="ml-5 w-[29%] max-md:ml-0 max-md:w-full">
              <section className="sticky top-[195px] z-10">
                <aside className="overflow-hidden px-4 py-6 mx-auto w-full bg-white rounded-xl shadow-md max-md:px-5 max-md:mt-4 max-md:max-w-full">
                  <div className="flex gap-4 justify-between items-start max-w-full text-xs font-bold tracking-tight leading-loose w-[362px]">
                    <button
                      className={`px-4 pt-1.5 pb-3.5 rounded-lg ${
                        activeTab === "recent"
                          ? "text-white bg-sky-500"
                          : "bg-white text-neutral-500"
                      }`}
                      onClick={() => setActiveTab("recent")}
                    >
                      Bài nghiên cứu mới đăng
                    </button>
                    <button
                      className={`px-1.5 pt-1 pb-3.5 rounded-lg ${
                        activeTab === "featured"
                          ? "text-white bg-sky-500"
                          : "bg-white text-neutral-500"
                      }`}
                      onClick={() => setActiveTab("featured")}
                    >
                      Bài nghiên cứu nổi bật
                    </button>
                  </div>

                  <div
                    className="flex gap-4 mt-5 overflow-y-auto max-h-[400px] custom-scrollbar"
                    ref={scrollRef}
                  >
                    <div className="lg:block max-lg:hidden">
                      {Array.isArray(displayedPapers) &&
                        displayedPapers.map((paper, index) => (
                          <Link
                            to={`/scientific-paper/${paper.id}`}
                            key={`thumbnail-${index}`}
                            onClick={() => createPaperView(paper.id)}
                          >
                            <img
                              src={paper.thumbnailUrl}
                              className={`object-contain rounded-md aspect-[0.72] w-[72px] ${
                                index > 0 ? "mt-5" : ""
                              }`}
                              alt={paper.title}
                            />
                          </Link>
                        ))}
                    </div>

                    <div className="flex flex-col grow shrink-0 items-start text-sm tracking-tight leading-none basis-0 text-slate-400 w-fit">
                      {Array.isArray(displayedPapers) &&
                        displayedPapers.map((paper, index) => (
                          <article
                            key={`details-${index}`}
                            className="w-full block"
                          >
                            <Link
                              to={`/scientific-paper/${paper.id}`}
                              onClick={() => createPaperView(paper.id)}
                            >
                              <React.Fragment>
                                <div className="paper-details-container flex flex-col gap-2 pt-0">
                                  <h3 className="text-black h-[40px] font-bold text-sm line-clamp-2 pb-2 w-[220px]">
                                    {paper.title
                                      ? paper.title.split(" ").length > 18
                                        ? paper.title
                                            .split(" ")
                                            .slice(0, 18)
                                            .join(" ") + "..."
                                        : paper.title
                                      : "No Title"}
                                  </h3>
                                  <div className="text-gray-600 text-xs pt-0.5">
                                    {paper.author || "Unknown Author"}
                                  </div>
                                  <div className="text-gray-500 text-xs pb-8">
                                    {paper.department || "Unknown Department"}
                                  </div>
                                </div>
                              </React.Fragment>
                            </Link>
                          </article>
                        ))}
                    </div>
                  </div>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal for adding to archive */}
      <Modal
        title="Thêm vào Lưu trữ"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="back"
            onClick={handleCancel}
            className="h-[40px] max-md:text-base"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="h-[40px] max-md:text-base"
          >
            Thêm vào mục lưu
          </Button>,
        ]}
        className="max-md:w-[95%]"
      >
        <p>Bài nghiên cứu khoa học: {selectedPaper?.title_vn}</p>
        <p>Các danh mục lưu trữ:</p>
        {isAddingCategory ? (
          <Input
            placeholder="Nhập tên danh mục mới"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
        ) : (
          <select
            className="p-2 border rounded-lg w-full text-sm"
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
        <div className="mt-4">
          {!isAddingCategory && (
            <Button
              type="primary"
              className="mt-2 h-[40px] max-md:text-base"
              onClick={handleAddCategoryClick}
            >
              Thêm danh mục mới
            </Button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;
