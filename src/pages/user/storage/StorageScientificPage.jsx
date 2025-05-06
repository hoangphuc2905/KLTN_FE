import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useNavigate } from "react-router-dom";
import {
  StepBackwardOutlined,
  StepForwardOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Modal, Button, Input, Dropdown, Menu, message, Spin } from "antd";
import { useSwipeable } from "react-swipeable";
import userApi from "../../../api/api";

const StorageScientificPage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]); // Initialize as empty array
  const [selectedCategory, setSelectedCategory] = useState("");
  const [papers, setPapers] = useState([]);
  const user_id = localStorage.getItem("user_id");
  const user_type = localStorage.getItem("user_type");

  const [activeTab, setActiveTab] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage);
  const itemsPerPage = 5;

  const indexOfLastPaper = currentPage * itemsPerPage;
  const indexOfFirstPaper = indexOfLastPaper - itemsPerPage;

  const filteredPapers = selectedCategory
    ? papers.filter((paper) => paper.categoryName === selectedCategory)
    : papers; // Hiển thị tất cả nếu không chọn danh mục

  const currentPapers = filteredPapers.slice(
    indexOfFirstPaper,
    indexOfLastPaper
  );

  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);

  const scrollRef = useRef(null);
  const categoryScrollRefs = {
    "Khoa học": useRef(null),
    "Kỹ thuật": useRef(null),
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryError, setNewCategoryError] = useState(false); // Add error state

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryError, setEditCategoryError] = useState(false); // Add error state
  const [isLoading, setIsLoading] = useState(false); // Thêm state cho loading

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!newCategory.trim()) {
      setNewCategoryError(true); // Show error if input is empty
      return;
    }
    if (categories.some((category) => category.name === newCategory.trim())) {
      message.error("Tên danh mục đã tồn tại!"); // Show error if name is duplicate
      return;
    }
    try {
      await userApi.createCollection({
        name: newCategory.trim(),
        user_id: user_id,
        user_type: user_type,
      });
      await reloadPageData(); // Reload categories and papers
      setNewCategory("");
      setNewCategoryError(false); // Reset error state
      setIsModalVisible(false);
      message.success("Tạo danh mục thành công!");
    } catch (error) {
      console.error("Failed to create collection:", error);
      message.error("Tạo danh mục thất bại!");
    }
  };

  const handleCancel = () => {
    setNewCategory("");
    setIsModalVisible(false);
  };

  const showEditModal = (categoryId, currentName) => {
    setEditCategoryId(categoryId);
    setEditCategoryName(currentName);
    setIsEditModalVisible(true);
  };

  const reloadPageData = async () => {
    try {
      const fetchedCategories = await userApi.getCollectionsByUserId(user_id);
      setCategories(
        fetchedCategories.map((category) => ({
          id: category._id,
          name: category.name,
        }))
      );
      setPapers(
        fetchedCategories.flatMap((category) =>
          category.papers.map((paper) => ({
            id: paper._id,
            title: paper.title_vn,
            author: paper.author.map((a) => a.author_name_vi).join(", "),
            department: paper.department.department_name,
            categoryName: category.name,
            collectionId: category._id,
            publishDate: new Date(paper.publish_date).toLocaleDateString(
              "vi-VN"
            ),
            description: paper.summary,
            thumbnailUrl: paper.cover_image,
            viewCount: paper.views || 0,
            commentCount: paper.downloads || 0,
          }))
        )
      );
    } catch (error) {
      console.error("Failed to reload data:", error);
      message.error("Không thể tải lại dữ liệu. Vui lòng thử lại sau.");
    }
  };

  const handleEditOk = async () => {
    if (!editCategoryName.trim()) {
      setEditCategoryError(true); // Show error if input is empty
      return;
    }
    if (
      categories.some(
        (category) =>
          category.name === editCategoryName.trim() &&
          category.id !== editCategoryId
      )
    ) {
      message.error("Tên danh mục đã tồn tại!"); // Show error if name is duplicate
      return;
    }
    try {
      await userApi.updateCollection(editCategoryId, {
        name: editCategoryName.trim(),
      });
      message.success("Cập nhật danh mục thành công!");
      setIsEditModalVisible(false);
      setEditCategoryError(false); // Reset error state
      await reloadPageData(); // Reload data after update
    } catch (error) {
      console.error("Error updating collection:", error);
      message.error(error || "Cập nhật danh mục thất bại!");
    }
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditCategoryName("");
  };

  const handleDeleteCategory = async (categoryId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa danh mục này?",
      okText: "Xóa",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await userApi.deleteCollection(categoryId);
          message.success("Xóa danh mục thành công!");
          await reloadPageData(); // Reload data after deletion
        } catch (error) {
          console.error("Error deleting collection:", error);
          message.error(error || "Xóa danh mục thất bại!");
        }
      },
    });
  };

  const handleDelete = async (paperId, collectionId) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn hủy lưu bài viết này?",
      okText: "Hủy lưu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          console.log(
            "Attempting to remove paper with ID:",
            paperId,
            "from collection ID:",
            collectionId
          ); // Debug log
          await userApi.removePaperFromCollection({
            collection_id: collectionId,
            paper_id: paperId,
          });
          message.success("Hủy lưu thành công!");
          await reloadPageData(); // Reload data after paper removal
        } catch (error) {
          console.error(
            "Failed to remove paper from collection:",
            error.response?.data || error
          );
          message.error(
            error.response?.data?.message ||
              "Hủy lưu thất bại! Vui lòng thử lại."
          );
        }
      },
    });
  };

  const handleMenuClick = (e, paperId, collectionId) => {
    e.domEvent.stopPropagation(); // Prevent event propagation
    if (e.key === "1") {
      handleDelete(paperId, collectionId); // Pass both paperId and collectionId
    }
  };

  const menu = (paperId, collectionId) => (
    <Menu onClick={(e) => handleMenuClick(e, paperId, collectionId)}>
      <Menu.Item key="1">Hủy lưu</Menu.Item>
    </Menu>
  );

  const categoryMenu = (categoryId, categoryName) => (
    <Menu>
      <Menu.Item
        key="rename"
        onClick={() => showEditModal(categoryId, categoryName)}
      >
        Đổi tên
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDeleteCategory(categoryId)}>
        Xóa
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    if (categoryScrollRefs[selectedCategory]?.current) {
      categoryScrollRefs[selectedCategory].current.scrollTop = 0;
    }
  }, [activeTab, selectedCategory]);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const fetchedCategories = await userApi.getCollectionsByUserId(user_id);
        setCategories(
          fetchedCategories.map((category) => ({
            id: category._id,
            name: category.name,
          }))
        ); // Extract id and name
        setPapers(
          fetchedCategories.flatMap((category) =>
            category.papers.map((paper) => ({
              id: paper._id,
              title: paper.title_vn,
              author: paper.author.map((a) => a.author_name_vi).join(", "), // Combine author names
              department: paper.department.department_name,
              categoryName: category.name,
              collectionId: category._id, // Include collectionId
              publishDate: new Date(paper.publish_date).toLocaleDateString(
                "vi-VN"
              ),
              description: paper.summary,
              thumbnailUrl: paper.cover_image,
              viewCount: paper.views || 0, // Handle null views
              commentCount: paper.downloads || 0, // Handle null downloads
            }))
          )
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchCategories();
  }, []); // Fetch categories and papers on component mount

  useEffect(() => {
    if (selectedCategory) {
      setCurrentPage(1); // Reset to the first page when a category is selected
    }
  }, [selectedCategory]);

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const element = eventData.event.target.closest(".swipeable");
      if (element) {
        element.style.transform = "translateX(-100px)";
      }
    },
    onSwipedRight: (eventData) => {
      const element = eventData.event.target.closest(".swipeable");
      if (element) {
        element.style.transform = "translateX(0)";
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="flex flex-col pb-7 max-w-[calc(100%-220px)] mx-auto max-md:max-w-full">
          <div className="w-full bg-white">
            <Header />
          </div>

          <div className="self-center w-full max-w-[1563px] px-6 pt-[80px] sticky top-3 bg-[#E7ECF0] z-10 max-md:px-4">
            <div className="flex items-center gap-2 text-gray-600 max-md:text-sm">
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
                alt="Home Icon"
                className="w-5 h-5 max-md:w-4 max-md:h-4"
              />
              <span
                onClick={() => navigate("/home")}
                className="cursor-pointer hover:text-blue-500"
              >
                Trang chủ
              </span>
              <span className="text-gray-400"> &gt; </span>
              <span className="font-semibold text-sky-900">
                Danh mục lưu trữ
              </span>
            </div>

            <div className="flex gap-4 rounded-lg items-center mt-4 mb-3 max-md:flex-col max-md:gap-2">
              <select
                className="p-2 border rounded-lg w-60 text-sm max-md:w-full"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                className="p-2 border rounded-lg w-40 text-sm bg-blue-500 text-white hover:bg-blue-600 max-md:w-full"
                onClick={showModal}
              >
                Tạo danh mục mới
              </button>

              <input
                type="text"
                className="p-2 border rounded-lg flex-1 text-sm max-md:w-full"
                placeholder="Nhập từ khóa tìm kiếm..."
              />

              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm max-md:w-full">
                Tìm kiếm
              </button>

              {selectedCategory && (
                <Dropdown
                  overlay={categoryMenu(
                    categories.find(
                      (category) => category.name === selectedCategory
                    )?.id,
                    selectedCategory
                  )}
                  trigger={["click"]}
                >
                  <MoreOutlined className="cursor-pointer text-lg max-md:text-base" />
                </Dropdown>
              )}
            </div>
          </div>

          <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full max-md:px-4">
            <div className="flex gap-5 max-md:flex-col">
              <section className="w-full max-md:ml-0 max-md:w-full">
                <div
                  className="flex flex-col w-full max-md:mt-4 max-md:max-w-full overflow-y-auto"
                  ref={categoryScrollRefs[selectedCategory]}
                  style={{ overflowX: "hidden" }}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                      <Spin size="large" />
                    </div>
                  ) : currentPapers.length > 0 ? (
                    currentPapers.map((paper, index) => (
                      <div
                        key={paper.id}
                        {...handlers}
                        className={`relative grid grid-cols-[auto,1fr] gap-6 px-4 py-4 bg-white rounded-xl shadow-sm max-md:grid-cols-1 swipeable ${
                          index > 0 ? "mt-3" : ""
                        }`}
                        style={{ transition: "transform 0.3s ease" }}
                        onClick={(e) => {
                          if (!e.target.closest(".three-dots-icon")) {
                            navigate(`/scientific-paper/${paper.id}`);
                          }
                        }}
                      >
                        <div className="flex justify-center w-fit">
                          <img
                            src={paper.thumbnailUrl}
                            className="object-cover align-middle rounded-md w-auto max-w-full md:max-w-[150px] h-[180px] aspect-[4/3] max-md:aspect-[16/9] max-md:h-auto"
                            alt={paper.title}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-2 w-full">
                          <div className="grid grid-cols-[auto,1fr] items-center text-sky-900 w-full max-md:text-sm">
                            <h2 className="text-sm font-bold break-words max-w-[900px] line-clamp-2 max-md:max-w-full">
                              {paper.title}
                            </h2>
                            <div className="flex flex-col items-center ml-auto">
                              <div className="flex items-center gap-2">
                                <img
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                                  className="object-contain w-4 aspect-square max-md:w-3"
                                  alt="Views icon"
                                />
                                <div className="text-xs text-orange-500">
                                  {paper.viewCount}
                                </div>
                                <img
                                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                                  className="object-contain w-4 aspect-[1.2] max-md:w-3"
                                  alt="Comments icon"
                                />
                                <div className="text-xs">
                                  {paper.commentCount}
                                </div>
                              </div>
                              <div className="text-xs text-neutral-500 mt-1">
                                {paper.publishDate}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-sky-900 max-md:text-xs">
                            {paper.author}
                          </div>
                          <p className="text-sm text-justify text-neutral-800 break-words w-full line-clamp-2 h-11 max-md:text-xs max-md:h-auto">
                            {paper.description}
                          </p>
                          <div className="text-sm text-sky-900 max-md:text-xs">
                            {paper.department}
                          </div>
                        </div>
                        <Dropdown
                          overlay={menu(paper.id, paper.collectionId)}
                          trigger={["click"]}
                        >
                          <MoreOutlined
                            className="absolute top-2 right-2 text-lg cursor-pointer three-dots-icon max-md:text-base"
                            style={{ fontSize: "16px", right: "1px" }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Dropdown>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 mt-6">
                      Không có lưu trữ nào trong danh mục này.
                    </div>
                  )}

                  {filteredPapers.length > itemsPerPage && (
                    <div className="flex justify-end mt-4 max-md:justify-center">
                      <StepBackwardOutlined
                        className={`px-2 py-2 text-black rounded-lg text-sm cursor-pointer ${
                          currentPage === 1
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage((prev) => Math.max(prev - 1, 1));
                            window.scrollTo(0, 0);
                          }
                        }}
                      />
                      <input
                        type="text"
                        className="px-4 py-2 text-sm border rounded-lg w-16 text-center max-md:w-12"
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
                            window.scrollTo(0, 0);
                          }
                        }}
                      />
                      <span className="px-4 py-2 text-sm max-md:text-xs">
                        / {totalPages}
                      </span>
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
                            window.scrollTo(0, 0);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Modal
        title="Tạo danh mục"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="create" type="primary" onClick={handleOk}>
            Tạo
          </Button>,
        ]}
      >
        <Input
          placeholder="Nhập tên danh mục"
          value={newCategory}
          onChange={(e) => {
            setNewCategory(e.target.value);
            setNewCategoryError(false); // Reset error state on input change
          }}
        />
        {newCategoryError && (
          <div style={{ color: "red", marginTop: "8px" }}>
            Vui lòng nhập tên danh mục!
          </div>
        )}
      </Modal>
      <Modal
        title="Đổi tên danh mục"
        visible={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        footer={[
          <Button key="cancel" onClick={handleEditCancel}>
            Hủy
          </Button>,
          <Button key="rename" type="primary" onClick={handleEditOk}>
            Lưu
          </Button>,
        ]}
      >
        <Input
          placeholder="Nhập tên danh mục mới"
          value={editCategoryName}
          onChange={(e) => {
            setEditCategoryName(e.target.value);
            setEditCategoryError(false); // Reset error state on input change
          }}
        />
        {editCategoryError && (
          <div style={{ color: "red", marginTop: "8px" }}>
            Vui lòng nhập tên danh mục mới!
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StorageScientificPage;
