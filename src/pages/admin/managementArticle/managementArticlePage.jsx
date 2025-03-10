import { useState } from "react";
import Header from "../../../components/header";
import { Filter} from "lucide-react";
import { Input, Select, Table } from "antd";

const ManagementPapers = () => {
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
      id: 5,
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

  const [activeTab, setActiveTab] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState("Tất cả");
  const [filterGroup, setFilterGroup] = useState("Tất cả");
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorCount, setFilterAuthorCount] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [filterInstitution, setFilterInstitution] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.paperType)),
  ];
  const uniqueGroups = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.group)),
  ];
  const uniqueRoles = ["Tất cả", ...new Set(papers.map((paper) => paper.role))];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.institution)),
  ];
  const uniqueStatuses = ["Tất cả", "Đã duyệt", "Đang chờ", "Từ chối"];

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterPaperType === "Tất cả" || paper.paperType === filterPaperType) &&
      (filterGroup === "Tất cả" || paper.group === filterGroup) &&
      (filterPaperTitle === "" || paper.title.includes(filterPaperTitle)) &&
      (filterAuthorName === "" || paper.authors.includes(filterAuthorName)) &&
      (filterAuthorCount === "" ||
        paper.authorCount.includes(filterAuthorCount)) &&
      (filterRole === "Tất cả" || paper.role === filterRole) &&
      (filterInstitution === "Tất cả" ||
        paper.institution === filterInstitution) &&
      (filterStatus === "Tất cả" || paper.status === filterStatus) &&
      (activeTab === "all" || paper.status === activeTab)
    );
  });

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "paperType",
      key: "paperType",
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "group",
      key: "group",
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "authors",
      key: "authors",
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publicationDate",
      key: "publicationDate",
    },
    {
      title: "MINH CHỨNG",
      key: "evidence",
      render: (text, record) => (
        <div className="flex-col text-[#00A3FF]">
          <button className="hover:underline">Xem link |</button>
          <button className="hover:underline">Xem file</button>
        </div>
      ),
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`${getStatusColor(status)}`}>{status}</span>
      ),
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "dateAdded",
      key: "dateAdded",
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (text, record) => (
        <button className="text-[#00A3FF]">
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
        </button>
      ),
    },
    {
      title: "GHI CHÚ",
      dataIndex: "note",
      key: "note",
      render: (note) => <span className="text-red-600">{note}</span>,
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
            <span className="font-semibold text-sm text-sky-900">
              Bài báo NCKH
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex border-b">
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "all"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "Đã duyệt"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("Đã duyệt")}
            >
              Đã duyệt
            </button>
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "Đang chờ"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("Đang chờ")}
            >
              Chờ duyệt
            </button>
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "Từ chối"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("Từ chối")}
            >
              Từ chối
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative">
                <button
                  className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg border"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Bộ lọc</span>
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg">
                    <form className="relative px-4 py-5 w-full bg-white max-w-[500px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Loại bài báo:
                        </label>
                        <Select
                          value={filterPaperType}
                          onChange={(value) => setFilterPaperType(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniquePaperTypes.map((type) => (
                            <Select.Option key={type} value={type}>
                              {type}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Thuộc nhóm:
                        </label>
                        <Select
                          value={filterGroup}
                          onChange={(value) => setFilterGroup(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueGroups.map((group) => (
                            <Select.Option key={group} value={group}>
                              {group}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Tên bài báo:
                        </label>
                        <Input
                          type="text"
                          value={filterPaperTitle}
                          onChange={(e) => setFilterPaperTitle(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Tên tác giả:
                        </label>
                        <Input
                          type="text"
                          value={filterAuthorName}
                          onChange={(e) => setFilterAuthorName(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Số tác giả:
                        </label>
                        <Input
                          type="text"
                          value={filterAuthorCount}
                          onChange={(e) => setFilterAuthorCount(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Vai trò:
                        </label>
                        <Select
                          value={filterRole}
                          onChange={(value) => setFilterRole(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueRoles.map((role) => (
                            <Select.Option key={role} value={role}>
                              {role}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          CQ đứng tên:
                        </label>
                        <Select
                          value={filterInstitution}
                          onChange={(value) => setFilterInstitution(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueInstitutions.map((institution) => (
                            <Select.Option key={institution} value={institution}>
                              {institution}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Trạng thái:
                        </label>
                        <Select
                          value={filterStatus}
                          onChange={(value) => setFilterStatus(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueStatuses.map((status) => (
                            <Select.Option key={status} value={status}>
                              {status}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterPaperType("Tất cả");
                          setFilterGroup("Tất cả");
                          setFilterPaperTitle("");
                          setFilterAuthorName("");
                          setFilterAuthorCount("");
                          setFilterRole("Tất cả");
                          setFilterInstitution("Tất cả");
                          setFilterStatus("Tất cả");
                        }}
                        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md text-sm"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
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
      </div>
    </div>
  );
};

export default ManagementPapers;