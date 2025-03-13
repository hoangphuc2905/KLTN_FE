import { useState } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Input, Select, Table, Checkbox, Divider, Tooltip } from "antd";

const ManagementAriticle = () => {
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
    {
      id: 7,
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
      id: 8,
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
      id: 9,
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
      id: 10,
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
      id: 11,
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
      id: 12,
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
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState("Tất cả");
  const [filterGroup, setFilterGroup] = useState("Tất cả");
  const [filterPaperTitle, setFilterPaperTitle] = useState("");
  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterAuthorCount, setFilterAuthorCount] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [filterInstitution, setFilterInstitution] = useState("Tất cả");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

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
      width: 65,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "paperType",
      key: "paperType",
      ellipsis: {
        showTitle: false,
      },
      render: (paperType) => (
        <Tooltip placement="topLeft" title={paperType}>
          {paperType}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "group",
      key: "group",
      ellipsis: {
        showTitle: false,
      },
      render: (group) => (
        <Tooltip placement="topLeft" title={group}>
          {group}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
      width: 300,
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "authors",
      key: "authors",
      ellipsis: {
        showTitle: false,
      },
      render: (authors) => (
        <Tooltip placement="topLeft" title={authors}>
          {authors}
        </Tooltip>
      ),
      width: 200,
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      ellipsis: {
        showTitle: false,
      },
      render: (authorCount) => (
        <Tooltip placement="topLeft" title={authorCount}>
          {authorCount}
        </Tooltip>
      ),
      width: 100,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      ellipsis: {
        showTitle: false,
      },
      render: (role) => (
        <Tooltip placement="topLeft" title={role}>
          {role}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
      ellipsis: {
        showTitle: false,
      },
      render: (institution) => (
        <Tooltip placement="topLeft" title={institution}>
          {institution}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publicationDate",
      key: "publicationDate",
      ellipsis: {
        showTitle: false,
      },
      render: (publicationDate) => (
        <Tooltip placement="topLeft" title={publicationDate}>
          {publicationDate}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "MINH CHỨNG",
      key: "evidence",
      render: (text, record) => (
        <div className="flex-col text-[#00A3FF]">
          <button className="hover:underline">Xem link|</button>
          <button className="hover:underline">Xem file</button>
        </div>
      ),
      width: 150,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`${getStatusColor(status)}`}>{status}</span>
      ),
      ellipsis: {
        showTitle: false,
      },
      width: 150,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "dateAdded",
      key: "dateAdded",
      ellipsis: {
        showTitle: false,
      },
      render: (dateAdded) => (
        <Tooltip placement="topLeft" title={dateAdded}>
          {dateAdded}
        </Tooltip>
      ),
      width: 150,
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
      width: 100,
    },
    {
      title: "GHI CHÚ",
      dataIndex: "note",
      key: "note",
      render: (note) => <span className="text-red-600">{note}</span>,
      ellipsis: {
        showTitle: false,
      },
      width: 200,
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

  const [checkedList, setCheckedList] = useState(
    columns.map((item) => item.key)
  );
  const options = columns.map(({ key, title }) => ({
    label: title,
    value: key,
  }));
  const newColumns = columns.filter((item) => checkedList.includes(item.key));

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
              Bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div
            className="flex border-b"
            style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}
          >
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "all"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả ({papers.length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Đã duyệt"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Đã duyệt")}
            >
              Đã duyệt (
              {papers.filter((paper) => paper.status === "Đã duyệt").length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Đang chờ"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Đang chờ")}
            >
              Chờ duyệt (
              {papers.filter((paper) => paper.status === "Đang chờ").length})
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "Từ chối"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("Từ chối")}
            >
              Từ chối (
              {papers.filter((paper) => paper.status === "Từ chối").length})
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-end mb-4 relative gap-2">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => {
                    setShowFilter(!showFilter);
                    setShowColumnFilter(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg">
                    <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Loại bài báo:
                        </label>
                        <select
                          value={filterPaperType}
                          onChange={(e) => setFilterPaperType(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        >
                          {uniquePaperTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Thuộc nhóm:
                        </label>
                        <select
                          value={filterGroup}
                          onChange={(e) => setFilterGroup(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        >
                          {uniqueGroups.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Tên bài báo:
                        </label>
                        <Input
                          type="text"
                          value={filterPaperTitle}
                          onChange={(e) => setFilterPaperTitle(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Tên tác giả:
                        </label>
                        <Input
                          type="text"
                          value={filterAuthorName}
                          onChange={(e) => setFilterAuthorName(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Số tác giả:
                        </label>
                        <Input
                          type="text"
                          value={filterAuthorCount}
                          onChange={(e) => setFilterAuthorCount(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Vai trò:
                        </label>
                        <select
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        >
                          {uniqueRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          CQ đứng tên:
                        </label>
                        <select
                          value={filterInstitution}
                          onChange={(e) => setFilterInstitution(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        >
                          {uniqueInstitutions.map((institution) => (
                            <option key={institution} value={institution}>
                              {institution}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 text-xs">
                          Trạng thái:
                        </label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        >
                          {uniqueStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
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
                        className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
                      >
                        Bỏ lọc tất cả
                      </button>
                    </form>
                  </div>
                )}
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => {
                    setShowColumnFilter(!showColumnFilter);
                    setShowFilter(false);
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Chọn cột</span>
                </button>
                {showColumnFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg border border-gray-200">
                    <div className="px-4 py-5 w-full max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <Checkbox.Group
                        options={options}
                        value={checkedList}
                        onChange={(value) => {
                          setCheckedList(value);
                        }}
                        className="flex flex-col gap-2"
                      />
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              <Table
                columns={newColumns}
                dataSource={filteredPapers}
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total: filteredPapers.length,
                  onChange: (page) => setCurrentPage(page),
                }}
                rowKey="id"
                className="text-sm"
                scroll={{
                  x: newColumns.reduce(
                    (total, col) => total + (col.width || 0),
                    0
                  ),
                }} // Thêm dòng này để tạo thanh kéo ngang
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementAriticle;
