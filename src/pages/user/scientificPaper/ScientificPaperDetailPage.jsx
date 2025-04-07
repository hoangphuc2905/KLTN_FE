import Header from "../../../components/header";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import userApi from "../../../api/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const ScientificPaperDetailPage = () => {
  const { id } = useParams(); // Extract the _id from the URL
  const [paper, setPaper] = useState(null);
  const [citation, setCitation] = useState(null); // State for citation
  const [selectedFormat, setSelectedFormat] = useState("APA"); // State to track selected format
  const [copySuccess, setCopySuccess] = useState(false); // State to track copy success
  const navigate = useNavigate();
  const user_id = localStorage.getItem("user_id");
  const user_type = localStorage.getItem("user_type");

  const relatedPapers = [
    {
      id: 1,
      title:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa CNHH",
      description:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols. Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      thumbnail: "/placeholder.svg?height=150&width=100",
      views: 100,
      downloads: 50,
      date: "20/02/2025",
    },
    // Add more related papers as needed
  ];

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
      return response.viewCount || 0;
    } catch (error) {
      console.error(`Error fetching view count for paper ${paperId}:`, error);
      return 0; // Fallback to 0 in case of an error
    }
  };

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await userApi.getScientificPaperById(id); // Fetch data from API

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

        const downloadCount = await fetchDownloadCount(id); // Fetch download count
        const viewCount = await fetchViewCount(id); // Fetch view count

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
          views: viewCount, // Use dynamically fetched view count
          downloads: downloadCount, // Use dynamically fetched download count
          cover_image: data.cover_image || "/placeholder.svg",
          department: departmentName,
          magazine_vi: data.magazine_vi || "Không có dữ liệu",
          doi: data.doi || null,
          link: "https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/5036",
          fileUrl: data.file || null,
        };

        setPaper(transformedPaper);

        // Fetch citation for the default format (APA) if DOI exists
        if (data.doi) {
          fetchCitationByFormat(data.doi, "apa");
        }
      } catch (error) {
        console.error("Error fetching scientific paper:", error);
      }
    };

    fetchPaper();
  }, [id]);

  const fetchCitationByFormat = async (doi, format = "apa") => {
    if (!doi) {
      alert("Vui lòng nhập DOI!");
      return;
    }

    const headers = {
      Accept: `text/x-bibliography; style=${format}`,
    };

    try {
      const response = await fetch(`https://doi.org/${doi}`, { headers });
      if (!response.ok) throw new Error("Không tìm thấy DOI");

      let text = await response.text();
      if (format.toLowerCase() === "mla") {
        text = text.replace(/Crossref,/g, ""); // Remove "Crossref" for MLA format
      }

      setCitation((prev) => ({
        ...prev,
        [format]: text,
      }));
    } catch (error) {
      setCitation((prev) => ({
        ...prev,
        [format]: "Lỗi khi lấy trích dẫn!",
      }));
    }
  };

  if (!paper) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-16px)] mx-auto lg:max-w-[calc(100%-40px)]">
        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600 flex-wrap">
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

        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-1 lg:col-span-3">
              <div className="bg-white rounded-xl p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={paper.cover_image}
                      alt="Form illustration"
                      className="w-[120px] h-[160px] sm:w-[160px] sm:h-[200px] max-w-[180px] max-h-[250px] rounded-lg"
                    />
                    <button
                      className="flex items-center gap-2 bg-[#00A3FF] text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg"
                      onClick={async () => {
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
                        } else {
                          message.error(
                            "Không có file để tải về! Vui lòng liên hệ với quản trị viên."
                          );
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Tải về
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row justify-between items-start">
                      <div>
                        <h1 className="text-lg sm:text-xl font-bold text-sky-900 mb-4 break-words">
                          {paper.title || "Không có tiêu đề"}
                        </h1>
                        <p className="text-gray-600 mb-4 text-sm sm:text-base w-full lg:w-[96%] text-justify break-words">
                          {paper.description || "Không có mô tả"}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 sm:mt-6">
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                              Loại bài báo:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371] break-words">
                              {paper.type || "Không có dữ liệu"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                              Thuộc nhóm:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371] truncate overflow-hidden whitespace-normal">
                              {paper.group || "Không có dữ liệu"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                              Tên tác giả:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371] break-words">
                              {paper.authors?.join(", ") || "Không có dữ liệu"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">Số tác giả:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.authorCount}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Ngày công bố:
                            </p>
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
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.department}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">Tạp chí:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.magazine_vi}
                            </p>
                          </div>
                        </div>

                        <div className="flex mt-4 items-center flex-wrap gap-2">
                          <p className="text-sm text-gray-500 flex-shrink-0">
                            Từ khóa:
                          </p>
                          <p className="text-sm font-medium text-[#174371] break-words">
                            {paper.keywords?.join(", ") || "Không có dữ liệu"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#F4F7FE] rounded-lg p-4 w-full lg:w-[350px] flex flex-col relative mt-4 lg:mt-0">
                        {/* Nút copy */}
                        <button
                          className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:bg-gray-100"
                          onClick={() => {
                            const textToCopy =
                              citation?.[selectedFormat.toLowerCase()] ||
                              "Không có dữ liệu để sao chép!";
                            navigator.clipboard
                              .writeText(textToCopy)
                              .then(() => {
                                setCopySuccess(true); // Show success message
                                setTimeout(() => setCopySuccess(false), 300); // Hide after 1.5 seconds
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
                            className="absolute top-2 right-12 text-xs text-white bg-green-500 px-2 py-1 rounded shadow-md transition-opacity duration-500 ease-in-out"
                            style={{ opacity: copySuccess ? 1 : 0 }}
                          >
                            Copy thành công
                          </span>
                        )}

                        {/* Tiêu đề */}
                        <div className="text-center font-bold text-[#00A3FF]">
                          Trích dẫn
                        </div>
                        {/* Nội dung trích dẫn */}
                        <div
                          className="text-sm mt-2 break-words leading-relaxed"
                          style={{
                            height: "300px",
                            overflow: "hidden",
                            width: "250px",
                          }} // Set a consistent fixed height
                        >
                          {citation?.[selectedFormat.toLowerCase()] ? (
                            <div
                              className="gs_citr"
                              dangerouslySetInnerHTML={{
                                __html: citation[selectedFormat.toLowerCase()],
                              }}
                            />
                          ) : (
                            "Đang load dữ liệu..."
                          )}
                        </div>

                        {/* Các định dạng trích dẫn */}
                        <div className="mt-auto">
                          <div className="border-t mt-2 pt-2">
                            <label className="text-xs font-medium block mb-1">
                              Chọn định dạng trích dẫn:
                            </label>
                            <div className="flex items-center gap-2">
                              <select
                                className="text-sm border rounded p-1 w-1/2"
                                onChange={(e) => {
                                  const format = e.target.value;
                                  setSelectedFormat(format);
                                  fetchCitationByFormat(paper.doi, format); // Fetch citation for the selected format
                                }}
                              >
                                <option value="apa">APA</option>
                                <option value="ieee">IEEE</option>
                                <option value="mla">MLA</option>
                              </select>
                              <button
                                className="text-sm bg-[#00A3FF] text-white px-3 py-1 rounded w-1/2"
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
                                    ); // Sanitize title for file name
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
              </div>

              <div className="bg-white rounded-xl p-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Cột trái */}
                  <div>
                    <p>
                      Người đăng tải:{" "}
                      <span className="text-[#174371] font-bold">
                        {paper.submitter}
                      </span>
                    </p>
                    <p className="mt-2">
                      Cơ quan đứng tên:{" "}
                      <span className="text-[#174371] font-bold">
                        {paper.institution}
                      </span>
                    </p>
                  </div>

                  {/* Cột phải */}
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
        </div>

        {/* Related Papers */}
        <div className="self-center w-full max-w-[1563px] px-4 sm:px-6 mt-6">
          <h2 className="text-base sm:text-lg font-semibold text-sky-900 mb-4">
            Các bài nghiên cứu liên quan
          </h2>
          <div className="space-y-4">
            {relatedPapers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-xl p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={paper.thumbnail}
                    alt="Form illustration"
                    className="w-[80px] h-[120px] sm:w-[100px] sm:h-[150px] object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sky-900 mb-2 break-words">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 break-words">
                      {paper.author}
                    </p>
                    <p className="text-sm text-gray-600 mb-4 break-words">
                      {paper.description}
                    </p>
                    <p className="text-sm text-sky-900 break-words">
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
                        {typeof paper.views === "number" ? paper.views : 0}
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
                    <p className="text-sm text-gray-500 break-words">
                      Ngày đăng: {paper.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScientificPaperDetailPage;
