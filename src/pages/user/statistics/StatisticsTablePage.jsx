import { useState } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import {
  Input,
  Table,
  Tooltip,
  Modal,
  Checkbox,
  Divider,
} from "antd";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const ManagementTable = () => {
  const papers = [
    {
      id: 1,
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q1",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q3",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q4",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q1",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "3 (0-0-1-2)",
      role: "Vừa chính vừa liên hệ",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đã duyệt",
      dateAdded: "12/12/2024",
    },
    {
      id: 6,
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q3",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đang chờ",
      dateAdded: "19/12/2024",
    },
    {
      id: 7,
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      id: 8,
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q4",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đang chờ",
      dateAdded: "19/12/2024",
    },
    {
      id: 9,
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q1",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q3",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
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
      paperType: "Bài báo đăng kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q4",
      title:
        "Công nghệ thông tin dùng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 1155 của bộ luật phóng sự",
      authors: "Nguyễn Văn A, Nguyễn Duy Thanh, Huỳnh Hoàng Phúc",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      status: "Đang chờ",
      dateAdded: "19/12/2024",
    },
  ];

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const itemsPerPage = 10;

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

  const handleRowClick = (record) => {
    setModalContent(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      width: 75,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "paperType",
      key: "paperType",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.paperType.localeCompare(b.paperType),
      render: (paperType) => (
        <Tooltip placement="topLeft" title={paperType}>
          {paperType}
        </Tooltip>
      ),
      width: 150,
    },
    {
      title: "NHÓM",
      dataIndex: "group",
      key: "group",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.group.localeCompare(b.group),
      render: (group) => (
        <Tooltip placement="topLeft" title={group}>
          {group}
        </Tooltip>
      ),
      width: 100,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.title.localeCompare(b.title),
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
      sorter: (a, b) => a.authors.localeCompare(b.authors),
      render: (authors) => (
        <Tooltip placement="topLeft" title={authors}>
          {authors}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.authorCount.localeCompare(b.authorCount),
      render: (authorCount) => (
        <Tooltip placement="topLeft" title={authorCount}>
          {authorCount}
        </Tooltip>
      ),
      width: 120,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => (
        <Tooltip placement="topLeft" title={role}>
          {role}
        </Tooltip>
      ),
      width: 110,
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => a.institution.localeCompare(b.institution),
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
      sorter: (a, b) =>
        new Date(a.publicationDate) - new Date(b.publicationDate),
      render: (publicationDate) => (
        <Tooltip placement="topLeft" title={publicationDate}>
          {publicationDate}
        </Tooltip>
      ),
      width: 160,
    },
    {
      title: "NGÀY THÊM",
      dataIndex: "dateAdded",
      key: "dateAdded",
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => new Date(a.dateAdded) - new Date(b.dateAdded),
      render: (dateAdded) => (
        <Tooltip placement="topLeft" title={dateAdded}>
          {dateAdded}
        </Tooltip>
      ),
      width: 150,
    },
  ];

  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.map((col) => col.key)
  );

  const columnOptions = columns.map((col) => ({
    label: col.title,
    value: col.key,
  }));

  const checkedList = columns.map((col) => col.key);

  const newColumns = columns.filter((item) => checkedList.includes(item.key));

  const handleColumnVisibilityChange = (selectedColumns) => {
    setVisibleColumns(selectedColumns);
  };

  const filteredColumns = columns.filter((col) =>
    visibleColumns.includes(col.key)
  );

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

  const handleDownload = () => {
    const tableData = filteredPapers.map((paper, index) => {
      const rowData = { STT: index + 1 };
      visibleColumns.forEach((col) => {
        switch (col) {
          case "paperType":
            rowData["Loại bài báo"] = paper.paperType;
            break;
          case "group":
            rowData["Nhóm"] = paper.group;
            break;
          case "title":
            rowData["Tên bài báo nghiên cứu khoa học"] = paper.title;
            break;
          case "authors":
            rowData["Tác giả"] = paper.authors;
            break;
          case "authorCount":
            rowData["Số tác giả"] = paper.authorCount;
            break;
          case "role":
            rowData["Vai trò"] = paper.role;
            break;
          case "institution":
            rowData["CQ đứng tên"] = paper.institution;
            break;
          case "publicationDate":
            rowData["Ngày công bố"] = paper.publicationDate;
            break;
          case "dateAdded":
            rowData["Ngày thêm"] = paper.dateAdded;
            break;
          default:
            break;
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Papers");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "papers.xlsx");
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
            <span className="font-semibold text-sm text-sky-900">Thống kê</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Dạng bảng
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4">
            <select className="p-1 border rounded-lg bg-[#00A3FF] text-white h-[35px] text-base w-[85px]">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <button
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg"
              onClick={handleDownload}
            >
              Download
            </button>
            <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-lg">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2358/2358854.png"
                alt="Print Icon"
                className="w-4 h-4"
              />
              Print
            </button>
          </div>
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
                        options={columnOptions}
                        value={visibleColumns}
                        onChange={handleColumnVisibilityChange}
                        className="flex flex-col gap-2"
                      />
                      <Divider className="mt-4" />
                    </div>
                  </div>
                )}
              </div>
              <Table
                columns={filteredColumns}
                dataSource={filteredPapers}
                pagination={{
                  current: currentPage,
                  pageSize: itemsPerPage,
                  total: filteredPapers.length,
                  onChange: (page) => setCurrentPage(page),
                }}
                rowKey="id"
                className="text-sm"
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                scroll={{
                  x: filteredColumns.reduce(
                    (total, col) => total + (col.width || 0),
                    0
                  ),
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        title="Chi tiết"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <p>
          <strong>Loại bài báo:</strong> {modalContent.paperType}
        </p>
        <p>
          <strong>Thuộc nhóm:</strong> {modalContent.group}
        </p>
        <p>
          <strong>Tên bài báo nghiên cứu khoa học:</strong> {modalContent.title}
        </p>
        <p>
          <strong>Tác giả:</strong> {modalContent.authors}
        </p>
        <p>
          <strong>Số tác giả:</strong> {modalContent.authorCount}
        </p>
        <p>
          <strong>Vai trò:</strong> {modalContent.role}
        </p>
        <p>
          <strong>CQ đứng tên:</strong> {modalContent.institution}
        </p>
        <p>
          <strong>Ngày công bố:</strong> {modalContent.publicationDate}
        </p>
        <p>
          <strong>Ngày thêm:</strong> {modalContent.dateAdded}
        </p>
        {modalContent.note && (
          <p>
            <strong>Ghi chú:</strong> {modalContent.note}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default ManagementTable;
