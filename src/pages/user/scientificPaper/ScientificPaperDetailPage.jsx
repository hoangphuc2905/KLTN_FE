import Header from "../../../components/Header";
import { Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import userApi from "../../../api/api";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { QRCodeSVG } from "qrcode.react";
import PDFViewer from "../../../components/PDFViewer";
import { throttle } from "lodash";
import { Modal, Spin } from "antd";
import Footer from "../../../components/Footer";

const ScientificPaperDetailPage = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [citation, setCitation] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState("APA");
  const [copySuccess, setCopySuccess] = useState(false);
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [authorsWithEmails, setAuthorsWithEmails] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]); // Update to handle multiple selections
  const navigate = useNavigate();
  const location = useLocation();
  const user_id = localStorage.getItem("user_id");
  const user_type = localStorage.getItem("user_type");
  const paperRef = useRef(null);
  const modalContentRef = useRef(null);
  const hasTrackedView = useRef(false);
  const hasScrolledRef = useRef(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const currentUrl = window.location.origin + location.pathname;
  const [downloadAttempts, setDownloadAttempts] = useState(0);
  const [isDownloadBlocked, setIsDownloadBlocked] = useState(false);

  const roleMapping = {
    MainAuthor: "Tác giả chính",
    CorrespondingAuthor: "Tác giả liên hệ",
    MainAndCorrespondingAuthor: "Tác giả vừa chính vừa liên hệ",
    Participant: "Tác giả tham gia",
  };

  useEffect(() => {
    if (paperRef.current) {
      paperRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    hasTrackedView.current = false;
  }, [id]);

  const fetchDownloadCount = async (paperId) => {
    try {
      const response = await userApi.getDownloadCountByPaperId(paperId);
      return response.download_count || 0;
    } catch (error) {
      console.error(
        `Error fetching download count for paper ${paperId}:`,
        error
      );
      return 0;
    }
  };

  const fetchViewCount = async (paperId) => {
    try {
      const response = await userApi.getViewCountByPaperId(paperId);
      return response.viewCount || 0;
    } catch (error) {
      console.error(`Error fetching view count for paper ${paperId}:`, error);
      return 0;
    }
  };

  const getRecommendations = async (paperId) => {
    try {
      const response = await userApi.getRecommendations(paperId);
      const transformedRecommendations = await Promise.all(
        response.data.map(async (item) => {
          let departmentName = "Không có dữ liệu";
          let views = 0;
          let downloads = 0;

          if (item.department) {
            try {
              const departmentData = await userApi.getDepartmentById(
                item.department
              );
              departmentName =
                departmentData.department_name || "Không có dữ liệu";
            } catch (error) {
              console.error(
                `Error fetching department for paper ${item._id}:`,
                error
              );
            }
          }

          try {
            const viewData = await userApi.getViewCountByPaperId(item._id);
            views = viewData.viewCount || 0;
          } catch (error) {
            console.error(
              `Error fetching view count for paper ${item._id}:`,
              error
            );
          }

          try {
            const downloadData = await userApi.getDownloadCountByPaperId(
              item._id
            );
            downloads = downloadData.download_count || 0;
          } catch (error) {
            console.error(
              `Error fetching download count for paper ${item._id}:`,
              error
            );
          }

          return {
            id: item._id,
            title: item.title_vn || "Không có tiêu đề",
            author:
              item.author?.map((a) => a.author_name_vi).join(", ") ||
              "Không có dữ liệu",
            department: departmentName,
            description: item.summary || "Không có mô tả",
            thumbnail: item.cover_image || "/placeholder.svg",
            views,
            downloads,
            date: new Date(item.publish_date).toLocaleDateString("vi-VN"),
          };
        })
      );
      return transformedRecommendations;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  };

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await userApi.getScientificPaperById(id);
        let departmentName = "Đang load dữ liệu...";
        if (data.department) {
          try {
            const departmentData = await userApi.getDepartmentById(
              data.department
            );
            departmentName =
              departmentData.department_name || "Không có dữ liệu";
          } catch (error) {
            console.error("Error fetching department details:", error);
          }
        }

        const downloadCount = await fetchDownloadCount(id);
        const viewCount = await fetchViewCount(id);

        const transformedPaper = {
          title: data.title_vn || "Không có tiêu đề",
          description: data.summary || "Không có mô tả",
          type: data.article_type?.type_name || "Không có dữ liệu",
          group: data.article_group?.group_name || "Không có dữ liệu",
          authors: data.author?.map((a) => a.author_name_vi) || [],
          authorCount: data.author_count || "Không có dữ liệu",
          publishDate: new Date(data.publish_date).toLocaleDateString("vi-VN"),
          pageCount: data.page || "Không có dữ liệu",
          keywords: data.keywords?.split(",").map((k) => k.trim()) || [],
          researchArea: data.department || "Không có dữ liệu",
          thumbnail: data.cover_image || "/placeholder.svg",
          views: viewCount,
          downloads: downloadCount,
          cover_image: data.cover_image || "/placeholder.svg",
          department: departmentName,
          magazine_vi: data.magazine_vi || "Không có dữ liệu",
          doi: data.doi || null,
          link: "https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/5036",
          fileUrl: data.file || null,
          submitter: data.author?.[0]?.author_name_vi || "Không có dữ liệu",
          institution: data.author?.[0]?.departmentName || "Không có dữ liệu",
          author: data.author || [],
        };

        setPaper(transformedPaper);

        if (data.doi) {
          fetchCitationByFormat(data.doi, "apa");
        }

        const recommendations = await getRecommendations(id);
        setRelatedPapers(recommendations);
      } catch (error) {
        console.error("Error fetching scientific paper:", error);
      }
    };

    fetchPaper();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (paper && paper.pageCount) {
        const currentPage = Math.ceil(window.scrollY / window.innerHeight) + 1;
        const totalPages = paper.pageCount;
        const scrolledPercentage = (currentPage / totalPages) * 100;
        setScrollPercent(scrolledPercentage);

        if (scrolledPercentage >= 50 && !hasTrackedView.current) {
          userApi
            .createPaperView({
              paper_id: id,
              user_id: localStorage.getItem("user_id"),
              user_type: localStorage.getItem("user_type"),
            })
            .then(() => {
              hasTrackedView.current = true;
            })
            .catch((err) => {
              console.error("Error saving view:", err);
            });
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [paper, id]);

  useEffect(() => {
    const handleScroll = () => {
      if (paperRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = paperRef.current;
        const scrolledPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100;
        if (scrolledPercentage >= 50) {
          hasScrolledRef.current = true;
        }
      }
    };

    const paperEl = paperRef.current;
    if (paperEl) {
      paperEl.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (paperEl) {
        paperEl.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleModalScroll = () => {
    if (!modalContentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
    const scrolledPercentage =
      (scrollTop / (scrollHeight - clientHeight)) * 100;
    if (scrolledPercentage >= 50) {
      modalContentRef.current.hasScrolled50Percent = true;
    }
  };

  const startModalTimer = () => {
    if (modalContentRef.current?.timer) return;
    modalContentRef.current.timer = setTimeout(() => {
      if (modalContentRef.current?.hasScrolled50Percent) {
        userApi
          .createPaperView({
            paper_id: id,
            user_id: localStorage.getItem("user_id"),
            user_type: localStorage.getItem("user_type"),
            view_time: new Date(),
          })
          .then(() => {})
          .catch((err) => {
            console.error("Error saving modal view:", err);
          });
      }
    }, 30000);
  };

  const resetModalTimer = () => {
    if (modalContentRef.current?.timer) {
      clearTimeout(modalContentRef.current.timer);
      modalContentRef.current.timer = null;
    }
  };

  useEffect(() => {
    const modalElement = modalContentRef.current;
    const options = { passive: true };
    if (isModalVisible && modalElement) {
      modalElement.addEventListener("scroll", handleModalScroll);
      modalElement.addEventListener("mousemove", startModalTimer);
      modalElement.addEventListener("touchmove", startModalTimer, options);
    }
    return () => {
      if (modalElement) {
        modalElement.removeEventListener("scroll", handleModalScroll);
        modalElement.removeEventListener("mousemove", startModalTimer);
        modalElement.removeEventListener("touchmove", startModalTimer, options);
      }
      resetModalTimer();
    };
  }, [isModalVisible]);

  const fetchCitationByFormat = async (doi, format = "apa") => {
    if (!doi) {
      alert("Vui lòng nhập DOI!");
      return;
    }
    const headers = { Accept: `text/x-bibliography; style=${format}` };
    try {
      const response = await fetch(`https://doi.org/${doi}`, { headers });
      if (!response.ok) throw new Error("Không tìm thấy DOI");
      let text = await response.text();
      if (format.toLowerCase() === "mla") {
        text = text.replace(/Crossref,/g, "");
      }
      setCitation((prev) => ({ ...prev, [format]: text }));
    } catch (error) {
      setCitation((prev) => ({ ...prev, [format]: "Lỗi khi lấy trích dẫn!" }));
    }
  };

  const handlePreview = () => {
    if (paper.fileUrl) {
      setIsModalVisible(true);
    } else {
      message.error(
        "Không có file để xem trước! Vui lòng liên hệ với quản trị viên."
      );
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    hasTrackedView.current = false;
    resetModalTimer();
  };

  const fetchAuthorsEmails = async () => {
    if (!paper?.author) return;
    try {
      const authors = await Promise.all(
        paper.author.map(async (author) => {
          let email = "Không có dữ liệu";
          try {
            if (author.user_id.trim().startsWith("0")) {
              // Fetch as lecturer
              const lecturerData = await userApi.getLecturerById(
                author.user_id.trim()
              );
              email = lecturerData?.email || "Không có dữ liệu";
            } else {
              // Fetch as student
              const studentData = await userApi.getStudentById(
                author.user_id.trim()
              );
              email = studentData?.email || "Không có dữ liệu";
            }
          } catch (error) {
            console.error(
              `Error fetching email for ${author.author_name_vi}:`,
              error
            );
          }
          return { ...author, email };
        })
      );
      setAuthorsWithEmails(authors);
    } catch (error) {
      console.error("Error fetching authors' emails:", error);
      message.error("Không thể tải thông tin tác giả!");
    }
  };

  const handleAuthorSelection = (author) => {
    setSelectedAuthors(
      (prev) =>
        prev.includes(author)
          ? prev.filter((a) => a !== author) // Deselect if already selected
          : [...prev, author] // Add to selection
    );
  };

  const handleFeedbackSubmit = () => {
    if (selectedAuthors.length > 0) {
      const recipientEmails = selectedAuthors
        .map((author) => author.email)
        .filter((email) => email !== "Không có dữ liệu")
        .join(",");
      if (recipientEmails) {
        const subject = `Gửi ý kiến cho bài báo: ${
          paper.title || "Không có tiêu đề"
        }`;
        const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          recipientEmails
        )}&su=${encodeURIComponent(subject)}`;
        window.open(mailtoLink, "_blank");
        message.success("Gửi ý kiến thành công!");
        setIsFeedbackModalVisible(false);
        setSelectedAuthors([]);
      } else {
        message.error("Không có email hợp lệ để gửi!");
      }
    } else {
      message.error("Vui lòng chọn ít nhất một tác giả để gửi ý kiến!");
    }
  };

  const handleDownload = async () => {
    if (isDownloadBlocked) {
      message.error(
        "Bạn đã tải xuống quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau."
      );
      return;
    }

    if (paper.fileUrl) {
      const link = document.createElement("a");
      link.href = paper.fileUrl;
      link.download = paper.title
        ? `${paper.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`
        : "scientific_paper.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      try {
        await userApi.createPaperDownload({
          paper_id: id,
          user_id: user_id,
          user_type: user_type,
          download_time: new Date().toISOString(),
        });
        message.success("Tải file thành công!");
      } catch (error) {
        console.error("Error logging download:", error);
      }

      setDownloadAttempts((prev) => prev + 1);

      if (downloadAttempts + 1 >= 5) {
        setIsDownloadBlocked(true);
        setTimeout(() => {
          setIsDownloadBlocked(false);
          setDownloadAttempts(0);
        }, 60000); // Reset after 1 minute
      }
    } else {
      message.error("Không có file để tải về!");
    }
  };

  if (!paper) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      ref={paperRef}
      className="overflow-y-auto px-4 py-2 bg-[#E7ECF0] min-h-screen"
    >
      <Header />
      <div className="flex flex-col pt-[80px] pb-7 mx-auto w-full max-w-[1563px] px-4 md:px-8 lg:px-24">
        {/* Breadcrumb */}
        <div className="px-4 mt-4">
          <div className="flex items-center gap-2 text-gray-600 flex-wrap text-sm">
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
            <span className="font-semibold text-sky-900">
              Chi tiết bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 mt-4">
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Section: Image, QR Code, Buttons */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                  <img
                    src={paper.cover_image}
                    alt="Form illustration"
                    className="hidden sm:block w-[120px] h-[150px] sm:w-[160px] sm:h-[200px] max-w-[180px] max-h-[250px] rounded-lg object-cover"
                  />
                  <div className="flex flex-col items-center mt-2 mb-2">
                    <QRCodeSVG
                      value={currentUrl}
                      size={100}
                      className="sm:size-140"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 bg-[#00A3FF] text-white text-xs sm:text-sm px-2 py-1 rounded-lg w-[70px] sm:w-[80px] h-[30px] justify-center"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                      Tải
                    </button>
                    <button
                      className="flex items-center gap-2 bg-[#FFA500] text-white text-xs sm:text-sm px-2 py-1 rounded-lg w-[70px] sm:w-[80px] h-[30px] justify-center"
                      onClick={handlePreview}
                    >
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/709/709612.png"
                        alt="Preview Icon"
                        className="w-4 h-4"
                      />
                      Xem
                    </button>
                  </div>
                </div>

                {/* Right Section: Paper Details & Citation */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Paper Details */}
                    <div className="flex-1">
                      <h1 className="text-lg sm:text-xl font-bold text-sky-900 mb-4 break-words">
                        {paper.title || "Không có tiêu đề"}
                      </h1>
                      <p className="text-gray-600 mb-4 text-sm sm:text-base text-justify">
                        {paper.description || "Không có mô tả"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Loại bài báo:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371] truncate">
                            {paper.type || "Không có dữ liệu"}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Thuộc nhóm:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371] truncate">
                            {paper.group || "Không có dữ liệu"}
                          </p>
                        </div>
                        <div className="flex items-start">
                          <p className="text-sm text-gray-500 flex-shrink-0 mt-[2px]">
                            Tên tác giả:
                          </p>
                          <div className="ml-2 text-sm font-medium text-[#174371] flex flex-wrap">
                            {paper.authors?.length > 0
                              ? paper.authors.map((author, index) => (
                                  <span key={index} className="mr-1">
                                    {author}
                                    {index < paper.authors.length - 1
                                      ? ","
                                      : ""}
                                  </span>
                                ))
                              : "Không có dữ liệu"}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Số tác giả:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371]">
                            {paper.authorCount}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Ngày công bố:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371]">
                            {paper.publishDate}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Số trang:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371]">
                            {paper.pageCount}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Khoa:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371] truncate">
                            {paper.department}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500">Tạp chí:</p>
                          <p className="text-sm ml-2 font-medium text-[#174371] truncate">
                            {paper.magazine_vi}
                          </p>
                        </div>
                      </div>
                      <div className="flex mt-4 items-start">
                        <p className="text-sm text-gray-500 flex-shrink-0 mr-2">
                          Từ khóa:
                        </p>
                        <p className="text-sm font-medium text-[#174371] break-words">
                          {paper.keywords?.join(", ") || "Không có dữ liệu"}
                        </p>
                      </div>
                    </div>

                    {/* Citation Box */}
                    <div className="bg-[#F4F7FE] rounded-lg p-4 w-full lg:w-[300px] flex flex-col relative">
                      <button
                        className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                        onClick={() => {
                          const textToCopy =
                            citation?.[selectedFormat.toLowerCase()] ||
                            "Không có dữ liệu để sao chép!";
                          navigator.clipboard.writeText(textToCopy).then(() => {
                            setCopySuccess(true);
                            setTimeout(() => setCopySuccess(false), 300);
                          });
                        }}
                      >
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/10146/10146565.png"
                          alt="Copy Icon"
                          className="w-4 h-4"
                        />
                      </button>
                      {copySuccess && (
                        <span
                          className="absolute top-2 right-12 text-xs text-white bg-green-500 px-2 py-1 rounded shadow-md transition-opacity duration-500"
                          style={{ opacity: copySuccess ? 1 : 0 }}
                        >
                          Copy thành công
                        </span>
                      )}
                      <div className="text-center font-bold text-[#00A3FF]">
                        Trích dẫn
                      </div>
                      <div
                        className="text-sm mt-2 break-words leading-relaxed overflow-y-auto"
                        style={{ maxHeight: "250px", width: "100%" }}
                      >
                        {citation?.[selectedFormat.toLowerCase()] ? (
                          <div
                            className="gs_citr"
                            dangerouslySetInnerHTML={{
                              __html: citation[selectedFormat.toLowerCase()],
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Spin size="small" />
                          </div>
                        )}
                      </div>
                      <div className="mt-auto border-t pt-2">
                        <label className="text-xs font-medium block mb-1">
                          Chọn định dạng trích dẫn:
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <select
                            className="text-sm border rounded p-1 w-full sm:w-1/2"
                            onChange={(e) => {
                              const format = e.target.value;
                              setSelectedFormat(format);
                              fetchCitationByFormat(paper.doi, format);
                            }}
                          >
                            <option value="apa">APA</option>
                            <option value="ieee">IEEE</option>
                            <option value="mla">MLA</option>
                          </select>
                          <button
                            className="text-sm bg-[#00A3FF] text-white px-3 py-1 rounded w-full sm:w-1/2"
                            onClick={() => {
                              const citationText =
                                citation?.[selectedFormat.toLowerCase()];
                              if (citationText) {
                                const blob = new Blob([citationText], {
                                  type: "application/x-research-info-systems",
                                });
                                const link = document.createElement("a");
                                const sanitizedTitle = paper.title.replace(
                                  /[^a-zA-Z0-9]/g,
                                  "_"
                                );
                                link.href = URL.createObjectURL(blob);
                                link.download = `${sanitizedTitle}.${selectedFormat.toLowerCase()}.ris`;
                                link.click();
                              } else {
                                alert("Không có dữ liệu để tải!");
                              }
                            }}
                          >
                            Tải về trích dẫn
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paper Stats */}
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 it">
                <div>
                  <p>
                    Người đăng tải:{" "}
                    <span className="text-[#174371] font-bold">
                      {paper.submitter}
                    </span>
                  </p>
                  <div className="mt-2 flex items-center">
                    <p className="mr-2">Đóng góp ý kiến:</p>
                    <button
                      className="bg-[#00A3FF] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#007ACC]"
                      onClick={() => {
                        fetchAuthorsEmails();
                        setIsFeedbackModalVisible(true);
                      }}
                    >
                      Gửi ý kiến
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span>
                      Tổng số lượt xem:{" "}
                      <span className="text-[#174371] font-bold">
                        {paper.views}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>
                      Tổng số lượt tải về:{" "}
                      <span className="text-[#174371] font-bold">
                        {paper.downloads}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Papers */}
        <div className="px-4 mt-4">
          <h2 className="text-lg font-semibold text-sky-900 mb-4">
            Các bài nghiên cứu liên quan
          </h2>
          <div className="space-y-4">
            {relatedPapers.length > 0 ? (
              relatedPapers.map((paper, index) => (
                <div
                  key={paper.id || index}
                  className="bg-white rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/scientific-paper/${paper.id}`)}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={paper.thumbnail}
                      alt="Form illustration"
                      className="hidden sm:block w-[80px] h-[120px] sm:w-[100px] sm:h-[150px] object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h2 className="pb-1 text-sm sm:text-base font-bold break-words line-clamp-2 max-h-[40px] sm:max-h-[48px] overflow-hidden">
                        {paper.title || paper.title_en || "No Title"}
                      </h2>
                      <p className="pb-1 text-sm text-gray-600">
                        {paper.author}
                      </p>
                      <p className="text-sm text-neutral-800 break-words line-clamp-2">
                        {paper.description}
                      </p>
                      <p className="pt-2 text-sm text-sky-900">
                        {paper.department}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                          className="object-contain w-4 aspect-square"
                          alt="Views icon"
                        />
                        <div className="text-xs text-orange-500">
                          {paper.views}
                        </div>
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                          className="object-contain w-4 aspect-[1.2]"
                          alt="Downloads icon"
                        />
                        <div className="text-xs">{paper.downloads}</div>
                      </div>
                      <p className="text-sm text-gray-500">
                        Ngày đăng: {paper.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Không có bài nghiên cứu liên quan.</p>
            )}
          </div>
        </div>

        {/* Modal for Preview */}
        {isModalVisible && (
          <Modal
            title="Xem trước bài báo"
            open={isModalVisible}
            onCancel={handleModalClose}
            footer={null}
            centered
            width="100%"
            styles={{ body: { height: "80vh", padding: 0 } }}
            className="max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw]"
            destroyOnClose
          >
            <div ref={modalContentRef} className="h-full overflow-y-auto">
              <PDFViewer
                fileUrl={paper.fileUrl?.replace(/^http:/, "https:")}
                isModalVisible={isModalVisible}
                onScroll={(percentage) => {
                  if (percentage >= 50 && !hasTrackedView.current) {
                    userApi
                      .createPaperView({
                        paper_id: id,
                        user_id: localStorage.getItem("user_id"),
                        user_type: localStorage.getItem("user_type"),
                      })
                      .then(() => {
                        hasTrackedView.current = true;
                      })
                      .catch((err) => {
                        console.error("Error saving PDF view:", err);
                      });
                  }
                }}
              />
            </div>
          </Modal>
        )}

        {/* Feedback Modal */}
        {isFeedbackModalVisible && (
          <Modal
            title={
              <h2 className="text-lg font-semibold text-sky-900">Gửi ý kiến</h2>
            }
            open={isFeedbackModalVisible}
            onCancel={() => {
              setIsFeedbackModalVisible(false);
              setSelectedAuthors([]); // Clear selection on cancel
            }}
            onOk={handleFeedbackSubmit}
            okText="Gửi"
            cancelText="Hủy"
            centered
            className="max-w-[600px]"
          >
            <p className="text-gray-600 mb-4">Chọn tác giả để gửi ý kiến:</p>
            <div className="max-h-[300px] overflow-y-auto">
              {authorsWithEmails.map((author, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg hover:shadow-md transition-shadow flex items-start gap-3 cursor-pointer ${
                    selectedAuthors.includes(author)
                      ? "bg-blue-50 border-blue-400"
                      : ""
                  }`}
                  onClick={() => handleAuthorSelection(author)} // Handle click on the container
                >
                  <input
                    type="checkbox"
                    className="mt-1 cursor-pointer"
                    checked={selectedAuthors.includes(author)}
                    onChange={() => handleAuthorSelection(author)} // Keep this for accessibility
                  />
                  <div>
                    <p className="text-sm">
                      <strong className="text-gray-700">Tên:</strong>{" "}
                      {author.author_name_vi}
                    </p>
                    <p className="text-sm">
                      <strong className="text-gray-700">Vai trò:</strong>{" "}
                      {roleMapping[author.role] || "Không có dữ liệu"}
                    </p>
                    <p className="text-sm">
                      <strong className="text-gray-700">Email:</strong>{" "}
                      {author.email || "Không có dữ liệu"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ScientificPaperDetailPage;
