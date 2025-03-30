import Header from "../../../components/header";
import { Download, Eye, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import userApi from "../../../api/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ScientificPaperDetailPage = () => {
  const { id } = useParams(); // Extract the _id from the URL
  const [paper, setPaper] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await userApi.getScientificPaperById(id); // Fetch data from API

        let departmentName = "Không có dữ liệu";
        if (data.department) {
          try {
            const departmentData = await userApi.getDepartmentById(
              data.department
            ); // Call API to get department details
            departmentName =
              departmentData.department_name || "Không có dữ liệu";
          } catch (error) {
            console.error("Error fetching department details:", error);
          }
        }
        // Transform the API response to match the expected structure
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
          views: data.views?.view_id?.length || 0,
          downloads: data.downloads?.download_id?.length || 0,
          cover_image: data.cover_image || "/placeholder.svg",
          department: departmentName,
          magazine_vi: data.magazine_vi || "Không có dữ liệu",
        };

        setPaper(transformedPaper);
      } catch (error) {
        console.error("Error fetching scientific paper:", error);
      }
    };
    fetchPaper();
  }, [id]); // Add id as a dependency

  if (!paper) {
    return <div>Loading...</div>;
  }

  const citation = {
    text: 'Thông, Phạm Lê, và Nguyễn Thị Thiện Hảo. 2014. "LÒNG TRUNG THÀNH CỦA KHÁCH HÀNG Ở THÀNH PHỐ CẦN THƠ ĐỐI VỚI DỊCH VỤ ĐIỆN THOẠI DI ĐỘNG TRẢ SAU VINAPHONE: MÔ HÌNH THỜI GIAN", Tạp Chí Khoa học Đại học Cần Thơ, số p.h 33 (Tháng Mười):58-64. https://ctujsvn.ctu.edu.vn/index.php/ctujsvn/article/view/1479.',
  };

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
      comments: 27,
      date: "20/02/2025",
    },
    // ... similar objects for other related papers
  ];

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
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
            <span className="font-semibold text-sky-900">
              Chi tiết bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-3">
              <div className="bg-white rounded-xl p-6">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={paper.cover_image}
                      alt="Form illustration"
                      className="w-[160px] h-[200px] max-w-[180px] max-h-[250px] rounded-lg"
                    />

                    <button className="flex items-center gap-2 bg-[#00A3FF] text-white px-4 py-2 rounded-lg">
                      <Download className="w-4 h-4" />
                      Tải về
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-xl font-bold text-sky-900 mb-4">
                          {paper.title || "Không có tiêu đề"}
                        </h1>
                        <p className="text-gray-600 mb-4 text-sm w-[96%] text-justify">
                          {paper.description || "Không có mô tả"}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Loại bài báo:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.type || "Không có dữ liệu"}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                              Thuộc nhóm:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371] truncate overflow-hidden whitespace-nowrap">
                              {paper.group || "Không có dữ liệu"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Tên tác giả:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
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

                        <div className="flex mt-4 items-center flex-nowrap overflow-hidden whitespace-nowrap">
                          <p className="text-sm text-gray-500 flex-shrink-0">
                            Từ khóa:
                          </p>
                          <p className="text-sm ml-2 font-medium text-[#174371] truncate">
                            {paper.keywords?.join(", ") || "Không có dữ liệu"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#F4F7FE] rounded-lg p-4 w-[250px] h-[350px] flex flex-col">
                        {/* Tiêu đề */}
                        <div className="text-center font-bold text-[#00A3FF]">
                          Trích dẫn
                        </div>

                        {/* Nội dung trích dẫn */}
                        <p className="text-sm mt-2 break-words">
                          {citation?.text || "Không có dữ liệu"}
                        </p>

                        {/* Các định dạng trích dẫn */}
                        <div className="mt-auto">
                          <div className="border-t mt-2 pt-2">
                            <label className="text-xs font-medium block mb-1">
                              Các định dạng trích dẫn:
                            </label>
                            <select
                              className="w-full p-2 border rounded-lg text-xs"
                              defaultValue={
                                citation?.formats?.[0] || "Không có định dạng"
                              }
                            >
                              {(citation?.formats || []).length > 0 ? (
                                citation.formats.map((format, index) => (
                                  <option key={index} value={format}>
                                    {format}
                                  </option>
                                ))
                              ) : (
                                <option>Không có định dạng</option>
                              )}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 mt-4">
                <div className="grid grid-cols-2 gap-6 ml-52">
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
        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <h2 className="text-lg font-semibold text-sky-900 mb-4">
            Các bài nghiên cứu liên quan
          </h2>
          <div className="space-y-4">
            {relatedPapers.map((paper) => (
              <div key={paper.id} className="bg-white rounded-xl p-4">
                <div className="flex gap-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/0563f14b44500ff5b83245fb9a6af2b57eb332ec4bbe05eafafe76a4e02af753?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                    alt="Form illustration"
                    className="w-[100px] h-[150px] object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sky-900 mb-2">
                      {paper.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{paper.author}</p>
                    <p className="text-sm text-gray-600 mb-4">
                      {paper.description}
                    </p>
                    <p className="text-sm  text-sky-900">{paper.department}</p>
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
                    <p className="text-sm text-gray-500">
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
