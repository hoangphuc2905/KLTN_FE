import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Link } from "react-router-dom";
import { StepBackwardOutlined, StepForwardOutlined } from "@ant-design/icons";
import { Modal, Button, Input } from "antd";
import userApi from "../../../api/api";

const HomePage = () => {
  const recentPapers = [
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
  ];

  const featuredPapers = [
    {
      id: "1",
      title: "Featured Research Paper 1",
      author: "Author Name",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "2",
      title: "Featured Research Paper 1",
      author: "Author Name",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
  ];

  const [researchPapers, setResearchPapers] = useState([]);
  const [authors, setAuthors] = useState({});
  const [departments, setDepartments] = useState({});
  const [activeTab, setActiveTab] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [selectedPaper, setSelectedPaper] = useState(null); // State for selected paper
  const [archivedPapers, setArchivedPapers] = useState([]); // State for archived papers
  const [newCategory, setNewCategory] = useState(""); // State for new category
  const [isAddingCategory, setIsAddingCategory] = useState(false); // State to toggle input field
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected category
  const [categories, setCategories] = useState(["Khoa học", "Sinh học"]); // Initial categories
  const [departmentsList, setDepartmentsList] = useState([]); // State for departments list
  const [selectedDepartment, setSelectedDepartment] = useState(""); // State for selected department
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [collections, setCollections] = useState([]); // State for collections

  const itemsPerPage = 10;

  const indexOfLastPaper = currentPage * itemsPerPage;
  const indexOfFirstPaper = indexOfLastPaper - itemsPerPage;
  const currentPapers = researchPapers.slice(
    indexOfFirstPaper,
    indexOfLastPaper
  );

  const totalPages = Math.ceil(researchPapers.length / itemsPerPage);

  const displayedPapers =
    activeTab === "recent" ? recentPapers : featuredPapers;

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchResearchPapers = async () => {
      try {
        const papers = await userApi.getAllScientificPapers();
        const approvedPapers = papers.filter(
          (paper) => paper.status === "approved"
        ); // Only include approved papers
        setResearchPapers(approvedPapers);
      } catch (error) {
        console.error("Error fetching research papers:", error);
      }
    };

    fetchResearchPapers();
  }, []);

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

  useEffect(() => {
    const fetchCountsForCurrentPapers = async () => {
      try {
        const updatedPapers = await Promise.all(
          currentPapers.map(async (paper) => {
            const [viewCount, downloadCount] = await Promise.all([
              fetchViewCount(paper._id),
              fetchDownloadCount(paper._id),
            ]);
            return { ...paper, views: viewCount, downloads: downloadCount };
          })
        );

        setResearchPapers((prev) => {
          // Nếu không có thay đổi, không cập nhật state để tránh vòng lặp
          if (JSON.stringify(prev) === JSON.stringify(updatedPapers)) {
            return prev;
          }
          return updatedPapers;
        });
      } catch (error) {
        console.error("Error fetching counts for current papers:", error);
      }
    };

    if (currentPapers.length > 0) {
      fetchCountsForCurrentPapers();
    }
  }, [JSON.stringify(currentPapers)]); // Giảm thiểu vòng lặp bằng cách so sánh giá trị chuỗi

  useEffect(() => {
    const fetchAuthorsForCurrentPapers = async () => {
      for (const paper of currentPapers) {
        if (!authors[paper._id]) {
          await fetchAuthors(paper._id); // Fetch authors only if not already fetched
        }
      }
    };

    fetchAuthorsForCurrentPapers();
  }, [JSON.stringify(currentPapers), JSON.stringify(authors)]);

  useEffect(() => {
    const fetchDepartmentsForCurrentPapers = async () => {
      for (const paper of currentPapers) {
        if (paper.department && !departments[paper.department]) {
          await fetchDepartment(paper.department); // Fetch department using 'department' field
        }
      }
    };

    fetchDepartmentsForCurrentPapers();
  }, [JSON.stringify(currentPapers), JSON.stringify(departments)]);

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

  const showModal = async (paper) => {
    setSelectedPaper(paper);
    setIsModalVisible(true);
    setNewCategory(""); // Reset new category state
    setSelectedCategory(""); // Reset selected category state
    setIsAddingCategory(false); // Reset adding category state

    try {
      const userId = localStorage.getItem("user_id");
      const userCollections = await userApi.getCollectionsByUserId(userId);
      setCollections(userCollections); // Update collections state
      setCategories(userCollections.map((collection) => collection.name)); // Update categories
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCategory.trim()) return;

    try {
      const userId = localStorage.getItem("user_id");
      const newCollection = await userApi.createCollection({
        userId,
        name: newCategory,
      });
      setCollections((prev) => [...prev, newCollection]);
      setCategories((prev) => [...prev, newCategory]); // Update categories
      setNewCategory(""); // Reset input
      setIsAddingCategory(false);
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleAddPaperToCollection = async () => {
    if (!selectedCategory || !selectedPaper) {
      console.error("Selected category or paper is missing.");
      return;
    }

    try {
      const collection = collections.find(
        (col) => col.name === selectedCategory
      );

      if (!collection) {
        console.error(
          `No matching collection found for the selected category: ${selectedCategory}`
        );
        return;
      }

      console.log(
        `Adding paper ${selectedPaper.id} to collection ${collection.id}`
      );
      await userApi.addPaperToCollection(collection.id, selectedPaper.id);
      setArchivedPapers((prev) => [...prev, selectedPaper.id]); // Mark paper as archived
      setIsModalVisible(false); // Close modal
    } catch (error) {
      console.error("Error adding paper to collection:", error);
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
      handleAddPaperToCollection(); // Add paper to existing collection
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddCategoryClick = () => {
    setIsAddingCategory(true);
  };

  // Filter research papers by selected department and search query
  const filteredPapers = researchPapers.filter((paper) => {
    const departmentMatch = selectedDepartment
      ? departments[paper.department] === selectedDepartment
      : true;

    const searchMatch = searchQuery
      ? paper.title_vn?.toLowerCase().includes(searchQuery.toLowerCase()) || // Match title
        paper.authors?.some((author) =>
          author.toLowerCase().includes(searchQuery.toLowerCase())
        ) || // Match authors
        paper.publish_date?.toString().includes(searchQuery) || // Match year
        paper.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) // Match keywords
      : true;

    return departmentMatch && searchMatch;
  });

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
        `}
      </style>
      <div className="flex flex-col pb-7 max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 pt-[80px] sticky top-3 bg-[#E7ECF0] z-10">
          <div className="flex items-center gap-2 text-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-5 h-5"
            />
            <span>Trang chủ</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">Tìm kiếm</span>
          </div>

          <div className="flex gap-4 rounded-lg items-center mt-4 mb-3">
            <select
              className="p-2 border rounded-lg w-60 text-sm"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)} // Update selected department
            >
              <option value="">Chọn Khoa</option>
              {departmentsList.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.department_name}
                </option>
              ))}
            </select>
            <select className="p-2 border rounded-lg w-60 text-sm">
              <option value="">Tất cả</option>
              <option value="title">Tiêu đề</option>
              <option value="author">Tác giả</option>
              <option value="publish_date">Năm xuất bản</option>
              <option value="keywords">Từ khóa</option>
            </select>

            <input
              type="text"
              className="p-2 border rounded-lg flex-1 text-sm"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} // Update search query
            />

            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <section className="w-[71%] max-md:ml-0 max-md:w-full">
              <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
                {filteredPapers
                  .slice(indexOfFirstPaper, indexOfLastPaper)
                  .map((paper, index) => (
                    <Link
                      to={`/scientific-paper/${paper._id}`}
                      key={paper._id}
                      onClick={() => createPaperView(paper._id)} // Trigger view creation on click
                    >
                      <article
                        key={paper._id}
                        className={`grid grid-cols-[auto,1fr] gap-6 px-4 py-4 bg-white rounded-xl shadow-sm max-md:grid-cols-1 ${
                          index > 0 ? "mt-3" : ""
                        }`}
                      >
                        <div className="flex justify-center w-fit">
                          <img
                            src={paper.cover_image}
                            className="object-cover align-middle rounded-md w-auto max-w-full md:max-w-[150px] h-[180px] aspect-[4/3] max-md:aspect-[16/9] m-0"
                            alt={paper.title_vn || "No Title"}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full">
                          {/* Title */}
                          <div className="grid grid-cols-[auto,1fr] items-center text-sky-900 w-full">
                            <h2 className="text-sm font-bold break-words max-w-[500px] line-clamp-2">
                              {paper.title_vn || "No Title"}
                            </h2>
                            <div className="flex flex-col items-center ml-auto">
                              <div className="flex items-center gap-2">
                                <img
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                                  className="object-contain w-4 aspect-square"
                                  alt="Views icon"
                                />
                                <div className="text-xs text-orange-500">
                                  {typeof paper.views === "number"
                                    ? paper.views
                                    : 0}
                                </div>
                                <img
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                                  className="object-contain w-4 aspect-[1.2]"
                                  alt="Downloads icon"
                                />
                                <div className="text-xs">
                                  {typeof paper.downloads === "number"
                                    ? paper.downloads
                                    : 0}
                                </div>
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                {paper.publish_date
                                  ? new Date(
                                      paper.publish_date
                                    ).toLocaleDateString()
                                  : "No Date"}
                              </div>
                            </div>
                          </div>

                          {/* Authors */}
                          <div className="text-sm text-sky-900">
                            {authors[paper._id] || "Loading authors..."}
                          </div>

                          {/* Summary */}
                          <p className="text-sm text-neutral-800 break-words w-full line-clamp-2">
                            {paper.summary || "No Summary"}
                          </p>

                          {/* Department */}
                          <div className="text-sm text-sky-900">
                            {departments[paper.department] ||
                              "Loading department..."}
                          </div>

                          {/* Archive Icon */}
                          <div className="flex justify-end">
                            <img
                              src={
                                archivedPapers.includes(paper._id)
                                  ? "https://cdn-icons-png.flaticon.com/512/5668/5668020.png"
                                  : "https://cdn-icons-png.flaticon.com/512/5662/5662990.png"
                              }
                              alt="Save to Archive"
                              className={`w-5 h-5 cursor-pointer ${
                                archivedPapers.includes(paper._id)
                                  ? "text-blue-500"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                showModal(paper);
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}

                {researchPapers.length > itemsPerPage && (
                  <div className="flex justify-end mt-4">
                    <StepBackwardOutlined
                      className={`px-2 py-2 text-black rounded-lg text-sm cursor-pointer ${
                        currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage((prev) => Math.max(prev - 1, 1));
                          window.scrollTo(0, 0); // Cuộn lên đầu trang
                        }
                      }}
                    />
                    <input
                      type="text"
                      className="px-4 py-2 text-sm border rounded-lg w-16 text-center"
                      value={inputPage}
                      onChange={(e) => setInputPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const value = e.target.value;
                          const page =
                            value === ""
                              ? 1
                              : Math.max(
                                  1,
                                  Math.min(totalPages, Number(value))
                                );
                          setCurrentPage(page);
                          setInputPage(page);
                          window.scrollTo(0, 0); // Scroll to top
                        }
                      }}
                    />
                    <span className="px-4 py-2 text-sm">/ {totalPages}</span>
                    <StepForwardOutlined
                      className={`px-2 py-2 text-black rounded-lg text-sm cursor-pointer ${
                        currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          );
                          window.scrollTo(0, 0); // Cuộn lên đầu trang
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            <div className="ml-5 w-[29%] max-md:ml-0 max-md:w-full">
              <section className="sticky top-[195px] z-9">
                <aside className="overflow-hidden px-4 py-6 mx-auto w-full bg-white rounded-xl max-md:px-5 max-md:mt-4 max-md:max-w-full">
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
                    <div className="max-md:hidden">
                      {displayedPapers.map((paper, index) => (
                        <img
                          key={index}
                          src={paper.thumbnailUrl}
                          className={`object-contain rounded-md aspect-[0.72] w-[72px] ${
                            index > 0 ? "mt-5" : ""
                          }`}
                          alt={paper.title}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col grow shrink-0 items-start text-sm tracking-tight leading-none basis-0 text-slate-400 w-fit">
                      {displayedPapers.map((paper, index) => (
                        <React.Fragment key={index}>
                          <h3
                            className={`self-stretch text-sm font-bold tracking-tight leading-4 text-blue-950 ${
                              index > 0 ? "mt-8" : ""
                            }`}
                          >
                            {paper.title}
                          </h3>
                          <div className="mt-3">{paper.author}</div>
                          <div className="mt-6">{paper.department}</div>
                        </React.Fragment>
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
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Thêm vào mục lưu
          </Button>,
        ]}
      >
        <p>Title: {selectedPaper?.title}</p>egory
        <p>Các danh mục lưu trữ:</p>
        <select
          className="p-2 border rounded-lg w-full text-sm"
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Chọn danh mục</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div className="mt-4">
          {isAddingCategory ? (
            <Input
              placeholder="Nhập tên danh mục mới"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          ) : (
            <Button
              type="primary"
              className="mt-2"
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
