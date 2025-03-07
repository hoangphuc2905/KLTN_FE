import React from "react";
import Header from "../../../components/header";
import { Filter, Home, ChevronRight, FileText } from "lucide-react";
import { Input, Select } from "antd";

const ManagementPapers = () => {
  const user = {
    name: "NGUYEN VAN B",
    role: "Admin",
  };

  const [activeTab, setActiveTab] = React.useState("user");
  const [showFilter, setShowFilter] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 3;

  const [filterPaperType, setFilterPaperType] = React.useState("Tất cả");
  const [filterGroup, setFilterGroup] = React.useState("Tất cả");
  const [filterPaperTitle, setFilterPaperTitle] = React.useState("");
  const [filterAuthorName, setFilterAuthorName] = React.useState("");
  const [filterAuthorCount, setFilterAuthorCount] = React.useState("");
  const [filterRole, setFilterRole] = React.useState("Tất cả");
  const [filterInstitution, setFilterInstitution] = React.useState("Tất cả");
  const [filterStatus, setFilterStatus] = React.useState("Tất cả");

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

  const getStatusColor = (status: string) => {
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
      (filterStatus === "Tất cả" || paper.status === filterStatus)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPapers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Home className="w-5 h-5" />
            <span>Trang chủ</span>
            <ChevronRight className="w-4 h-4" />
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00A3FF]" />
              <span className="font-semibold text-[#00A3FF]">Bài báo NCKH</span>
            </div>
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
              <button
                className="flex items-center gap-2 text-gray-600 px-4 py-2 rounded-lg border"
                onClick={() => setShowFilter(!showFilter)}
              >
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
              </button>
              {showFilter && (
                <div className="absolute top-full mt-2 z-50 shadow-lg w-full max-w-[500px]">
                  <form className="relative px-4 py-5 bg-white max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                    <div className="mb-3">
                      <label className="block text-gray-700">
                        Loại bài báo:
                      </label>
                      <Select
                        value={filterPaperType}
                        onChange={(value) => setFilterPaperType(value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      >
                        {uniquePaperTypes.map((type) => (
                          <Select.Option key={type} value={type}>
                            {type}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">Thuộc nhóm:</label>
                      <Select
                        value={filterGroup}
                        onChange={(value) => setFilterGroup(value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      >
                        {uniqueGroups.map((group) => (
                          <Select.Option key={group} value={group}>
                            {group}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">
                        Tên bài báo:
                      </label>
                      <Input
                        type="text"
                        value={filterPaperTitle}
                        onChange={(e) => setFilterPaperTitle(e.target.value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">
                        Tên tác giả:
                      </label>
                      <Input
                        type="text"
                        value={filterAuthorName}
                        onChange={(e) => setFilterAuthorName(e.target.value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">Số tác giả:</label>
                      <Input
                        type="text"
                        value={filterAuthorCount}
                        onChange={(e) => setFilterAuthorCount(e.target.value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">Vai trò:</label>
                      <Select
                        value={filterRole}
                        onChange={(value) => setFilterRole(value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      >
                        {uniqueRoles.map((role) => (
                          <Select.Option key={role} value={role}>
                            {role}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">
                        CQ đứng tên:
                      </label>
                      <Select
                        value={filterInstitution}
                        onChange={(value) => setFilterInstitution(value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
                      >
                        {uniqueInstitutions.map((institution) => (
                          <Select.Option key={institution} value={institution}>
                            {institution}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>

                    <div className="mb-3">
                      <label className="block text-gray-700">Trạng thái:</label>
                      <Select
                        value={filterStatus}
                        onChange={(value) => setFilterStatus(value)}
                        className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-full"
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
                      className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md"
                    >
                      Bỏ lọc tất cả
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F7FB] text-left">
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[50px] text-center">
                      STT
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[200px]">
                      LOẠI BÀI BÁO
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[100px] text-center">
                      THUỘC NHÓM
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[300px]">
                      TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[200px]">
                      TÁC GIẢ
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[100px] text-center">
                      SỐ T/GIẢ
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[100px]">
                      VAI TRÒ
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[150px]">
                      CQ ĐỨNG TÊN
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[150px]">
                      NGÀY CÔNG BỐ
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[150px]">
                      MINH CHỨNG
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[150px]">
                      TRẠNG THÁI
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[150px]">
                      NGÀY THÊM
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[150px]">
                      CHỈNH SỬA
                    </th>
                    <th className="px-4 py-3 text-gray-700 font-medium min-w-[250px]">
                      GHI CHÚ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((paper) => (
                    <tr key={paper.id} className="border-t">
                      <td className="px-4 py-3 min-w-[50px] text-center">
                        {paper.id}
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        {paper.paperType}
                      </td>
                      <td className="px-4 py-3 min-w-[100px] text-center">
                        {paper.group}
                      </td>
                      <td className="px-4 py-3 max-w-md min-w-[300px]">
                        {paper.title}
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        {paper.authors}
                      </td>
                      <td className="px-4 py-3 min-w-[100px] text-center">
                        {paper.authorCount}
                      </td>
                      <td className="px-4 py-3 min-w-[100px]">{paper.role}</td>
                      <td className="px-4 py-3 min-w-[150px]">
                        {paper.institution}
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        {paper.publicationDate}
                      </td>
                      <td className="px-4 py-3 min-w-[105px]">
                        <div className="flex-col text-[#00A3FF]">
                          <button className="hover:underline">
                            Xem link |
                          </button>
                          <button className="hover:underline">Xem file</button>
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        <span className={`${getStatusColor(paper.status)}`}>
                          {paper.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        {paper.dateAdded}
                      </td>
                      <td className="px-4 py-3 min-w-[150px]">
                        {paper.status === "Đang chờ" && (
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
                        )}
                      </td>
                      <td className="px-4 py-3 text-red-600 min-w-[250px]">
                        {paper.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-6 justify-end mt-4 text-xs font-semibold tracking-wide text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page: {itemsPerPage}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredPapers.length)} of{" "}
                  {filteredPapers.length}
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-gray-400"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(filteredPapers.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      Math.ceil(filteredPapers.length / itemsPerPage)
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPapers;
