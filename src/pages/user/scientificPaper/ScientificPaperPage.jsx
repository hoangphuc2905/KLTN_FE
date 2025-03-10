import React from "react";
import { Filter } from "lucide-react";
import { Button, Table } from "antd";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const ScientificPaperPage = () => {
  const [activeTab, setActiveTab] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 3;

  const papers = [
    {
      id: 1,
      paperType: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q1",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "3 (0-0-1-2)",
      role: "Vừa chính vừa liên hệ",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đã duyệt",
      dateAdded: "12/12/2024",
    },
    {
      id: 2,
      paperType: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q3",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đang chờ",
      dateAdded: "19/12/2024",
    },
    {
      id: 3,
      paperType: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Từ chối",
      dateAdded: "19/12/2024",
      note: "Ảnh không phù hợp. Tên bài nghiên cứu viết sai",
    },
    {
      id: 4,
      paperType: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Từ chối",
      dateAdded: "19/12/2024",
      note: "Ảnh không phù hợp. Tên bài nghiên cứu viết sai",
    },
    {
      id: 5,
      paperType: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q3",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đang chờ",
      dateAdded: "19/12/2024",
    },
    {
      id: 6,
      paperType: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q1",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "3 (0-0-1-2)",
      role: "Vừa chính vừa liên hệ",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đã duyệt",
      dateAdded: "12/12/2024",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã duyệt":
        return "text-green-600";
      case "Đang chờ":
        return "text-yellow-600";
      case "Từ chối":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredPapers = papers.filter((paper) => {
    if (activeTab === "all") return true;
    return paper.status === activeTab;
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      align: "center",
      className: "text-sm",
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "paperType",
      key: "paperType",
      className: "text-sm",
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "group",
      key: "group",
      align: "center",
      className: "text-sm",
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      className: "text-sm",
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "authors",
      key: "authors",
      className: "text-sm",
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      align: "center",
      className: "text-sm",
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      className: "text-sm",
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
      className: "text-sm",
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publicationDate",
      key: "publicationDate",
      className: "text-sm",
    },
    {
      title: "MINH CHỨNG",
      key: "proof",
      render: () => (
        <div className="flex-col text-[#00A3FF]">
          <button className="hover:underline">Xem link |</button>
          <button className="hover:underline">Xem file</button>
        </div>
      ),
      className: "text-sm",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`${getStatusColor(status)} text-sm`}>{status}</span>
      ),
      className: "text-sm",
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "dateAdded",
      key: "dateAdded",
      className: "text-sm",
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (_, record) =>
        record.status === "Đang chờ" && (
          <Button className="text-[#00A3FF]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.7167 7.51667L12.4833 8.28333L4.93333 15.8333H4.16667V15.0667L11.7167 7.51667ZM14.7167 2.5C14.5083 2.5 14.2917 2.58333 14.1333 2.74167L12.6083 4.26667L15.7333 7.39167L17.2583 5.86667C17.5833 5.54167 17.5833 5.01667 17.2583 4.69167L15.3083 2.74167C15.1417 2.575 14.9333 2.5 14.7167 2.5ZM11.7167 5.15833L2.5 14.375V17.5H5.625L14.8417 8.28333L11.7167 5.15833Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        ),
      className: "text-sm",
    },
    {
      title: "GHI CHÚ",
      dataIndex: "note",
      key: "note",
      className: "text-sm text-red-600",
    },
  ];

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
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
            <span>Trang chủ</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">
              Bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex border-b">
            <button
              className={`px-8 py-3 text-center ${
                activeTab === "all"
                  ? "border-b-2 border-[#00A3FF] text-[#00A3FF]"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`px-8 py-3 text-center ${
                activeTab === "Đã duyệt"
                  ? "border-b-2 border-[#00A3FF] text-[#00A3FF]"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("Đã duyệt")}
            >
              Đã duyệt
            </button>
            <button
              className={`px-8 py-3 text-center ${
                activeTab === "Đang chờ"
                  ? "border-b-2 border-[#00A3FF] text-[#00A3FF]"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("Đang chờ")}
            >
              Chờ duyệt
            </button>
            <button
              className={`px-8 py-3 text-center ${
                activeTab === "Từ chối"
                  ? "border-b-2 border-[#00A3FF] text-[#00A3FF]"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveTab("Từ chối")}
            >
              Từ chối
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-end mb-4">
              <button className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg border">
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
              </button>
            </div>

            <Table
              columns={columns}
              dataSource={filteredPapers}
              pagination={{
                current: currentPage,
                pageSize: itemsPerPage,
                total: filteredPapers.length,
                onChange: (page) => setCurrentPage(page),
              }}
              rowKey="id"
              className="text-sm"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScientificPaperPage;
