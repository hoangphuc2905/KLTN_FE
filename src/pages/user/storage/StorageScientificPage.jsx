import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { StepBackwardOutlined, StepForwardOutlined } from "@ant-design/icons";
import { Modal, Button, Input } from "antd";
import { useSwipeable } from "react-swipeable";

const StorageScientificPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const user = {
    name: "NGUYEN VAN A",
    role: "User",
  };

  const researchPapers = [
    {
      id: "1",
      title:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa học",
      publishDate: "20/02/2025",
      description:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 100,
      commentCount: 27,
    },
    {
      id: "2",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa học",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "3",
      title: "Ứng dụng công nghệ sinh học trong nông nghiệp",
      author: "Trần Thị C",
      department: "Khoa học",
      publishDate: "10/03/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng công nghệ sinh học trong nông nghiệp, nhằm cải thiện năng suất và chất lượng sản phẩm.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 200,
      commentCount: 40,
    },
    {
      id: "4",
      title: "Phát triển hệ thống điều khiển tự động",
      author: "Lê Văn D",
      department: "Kỹ thuật",
      publishDate: "05/04/2025",
      description:
        "Nghiên cứu này tập trung vào việc phát triển hệ thống điều khiển tự động, nhằm nâng cao hiệu quả sản xuất công nghiệp.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 250,
      commentCount: 50,
    },
    {
      id: "5",
      title: "Ứng dụng công nghệ IoT trong nhà thông minh",
      author: "Phạm Thị E",
      department: "Kỹ thuật",
      publishDate: "20/05/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng công nghệ IoT trong nhà thông minh, nhằm nâng cao tiện ích và an toàn cho người sử dụng.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 300,
      commentCount: 60,
    },
    {
      id: "6",
      title: "Phát triển công nghệ pin năng lượng mặt trời",
      author: "Nguyễn Văn F",
      department: "Kỹ thuật",
      publishDate: "30/06/2025",
      description:
        "Nghiên cứu này tập trung vào việc phát triển công nghệ pin năng lượng mặt trời, nhằm nâng cao hiệu suất và giảm chi phí sản xuất.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 350,
      commentCount: 70,
    },
    {
      id: "7",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "8",
      title:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa CNHH",
      publishDate: "20/02/2025",
      description:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 100,
      commentCount: 27,
    },
    {
      id: "9",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "10",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "11",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "12",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "13",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "14",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
  ];

  const initialCategories = ["Khoa học", "Kỹ thuật"];
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [papers, setPapers] = useState(researchPapers);

  const [activeTab, setActiveTab] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState(currentPage);
  const itemsPerPage = 5;

  const indexOfLastPaper = currentPage * itemsPerPage;
  const indexOfFirstPaper = indexOfLastPaper - itemsPerPage;

  const filteredPapers = selectedCategory
    ? papers.filter((paper) => paper.department === selectedCategory) // Fix category filtering
    : papers;

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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setNewCategory("");
    setIsModalVisible(false);
  };

  const handleDelete = (id) => {
    setPapers((prevPapers) => {
      const newPapers = prevPapers.filter((paper) => paper.id !== id);
      const newTotalPages = Math.ceil(newPapers.length / itemsPerPage);

      // If currentPage is greater than total pages, set it to the last page
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
        setInputPage(newTotalPages);
      }

      return newPapers;
    });
  };

  const handleMouseEnter = (event) => {
    const element = event.target.closest(".swipeable");
    if (element) {
      element.style.transform = "translateX(-100px)";
    }
  };

  const handleMouseLeave = (event) => {
    const element = event.target.closest(".swipeable");
    if (element) {
      element.style.transform = "translateX(0)";
    }
  };

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
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header user={user} />
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
            <span className="font-semibold text-sky-900">Danh mục lưu trữ</span>
          </div>

          <div className="flex gap-4 rounded-lg items-center mt-4 mb-3">
            <select
              className="p-2 border rounded-lg w-60 text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              className="p-2 border rounded-lg w-40 text-sm bg-blue-500 text-white hover:bg-blue-600"
              onClick={showModal}
            >
              Tạo danh mục mới
            </button>

            <input
              type="text"
              className="p-2 border rounded-lg flex-1 text-sm"
              placeholder="Nhập từ khóa tìm kiếm..."
            />

            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <section className="w-full max-md:ml-0 max-md:w-full">
              <div
                className="flex flex-col w-full max-md:mt-4 max-md:max-w-full overflow-y-auto"
                ref={categoryScrollRefs[selectedCategory]}
                style={{ overflowX: "hidden" }} // Hide horizontal scrollbar
              >
                {currentPapers.map((paper, index) => (
                  <div
                    key={paper.id}
                    {...handlers}
                    className={`relative grid grid-cols-[auto,1fr] gap-6 px-4 py-4 bg-white rounded-xl shadow-sm max-md:grid-cols-1 swipeable ${
                      index > 0 ? "mt-3" : ""
                    }`}
                    style={{ transition: "transform 0.3s ease" }}
                    onClick={() => navigate(`/scientific-paper/${paper.id}`)} // Add onClick event
                    onMouseEnter={handleMouseEnter} // Add onMouseEnter event
                    onMouseLeave={handleMouseLeave} // Add onMouseLeave event
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent div click event
                        handleDelete(paper.id);
                      }}
                      className="absolute right-0 top-0 bottom-0 bg-red-500 text-white px-4 py-2 rounded-l-xl transition-transform duration-200"
                      style={{ transform: "translateX(100%)" }}
                    >
                      Hủy lưu
                    </button>

                    <div className="flex justify-center w-fit">
                      <img
                        src={paper.thumbnailUrl}
                        className="object-cover align-middle rounded-md w-auto max-w-full md:max-w-[150px] h-[180px] aspect-[4/3] max-md:aspect-[16/9] m-0"
                        alt={paper.title}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 w-full">
                      {/* Hàng 1: Tiêu đề + Thông tin lượt xem */}
                      <div className="grid grid-cols-[auto,1fr] items-center text-sky-900 w-full">
                        {/* Tiêu đề */}
                        <h2 className="text-sm font-bold break-words max-w-[500px] line-clamp-2">
                          {paper.title}
                        </h2>

                        {/* Lượt xem + Bình luận */}
                        <div className="flex flex-col items-center ml-auto">
                          <div className="flex items-center gap-2 text-orange-500">
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                              className="object-contain w-4 aspect-square"
                              alt="Views icon"
                            />
                            <div className="text-xs">{paper.viewCount}</div>
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                              className="object-contain w-4 aspect-[1.2]"
                              alt="Comments icon"
                            />
                            <div className="text-xs">{paper.commentCount}</div>
                          </div>

                          {/* Ngày đăng */}
                          <div className="text-xs text-neutral-500 mt-1">
                            {paper.publishDate}
                          </div>
                        </div>
                      </div>

                      {/* Hàng 2: Tác giả */}
                      <div className="text-sm text-sky-900">{paper.author}</div>

                      {/* Hàng 3: Mô tả */}
                      <p className="text-sm text-neutral-800 break-words w-full line-clamp-2">
                        {paper.description}
                      </p>

                      {/* Hàng 4: Bộ phận */}
                      <div className="text-sm text-sky-900">
                        {paper.department}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPapers.length > itemsPerPage && (
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
          onChange={(e) => setNewCategory(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default StorageScientificPage;
