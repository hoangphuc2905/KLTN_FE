import { useState } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Input, Select, Table, Checkbox, Tooltip, Modal } from "antd"; // Added Tooltip and Modal import
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const ManagementPoint = () => {
  const papers = [
    {
      id: 1,
      type: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q1",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authorCount: "3 (0-0-1-2)",
      role: "Vừa chính vừa liên hệ",
      institution: "IUH",
      publicationDate: "25/11/2024",
      featured: true,
      points: 8,
    },
    {
      id: 2,
      type: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q3",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      featured: true,
      points: 5,
    },
    {
      id: 3,
      type: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      featured: true,
      points: 3,
    },
    {
      id: 4,
      type: "Bài báo đăng ký yêu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
      group: "Q2",
      title:
        "Công nghệ thông tin dụng trong các cơ quan khoa học ứng dụng tại các địa phương theo tiêu chí 115S của bộ luật phòng sự",
      authorCount: "5 (1-1-0-3)",
      role: "T/g chính",
      institution: "IUH",
      publicationDate: "25/11/2024",
      featured: true,
      points: 2,
    },
  ];

  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "checkbox",
    "id",
    "type",
    "group",
    "title",
    "authorCount",
    "role",
    "institution",
    "publicationDate",
    "points",
    "action",
  ]);

  const columnOptions = [
    { label: "STT", value: "id" },
    { label: "Loại bài báo", value: "type" },
    { label: "Nhóm", value: "group" },
    { label: "Tiêu đề", value: "title" },
    { label: "Số lượng tác giả", value: "authorCount" },
    { label: "Vai trò", value: "role" },
    { label: "Cơ quan", value: "institution" },
    { label: "Ngày xuất bản", value: "publicationDate" },
    { label: "Điểm", value: "points" },
    { label: "Xem chi tiết", value: "action" },
  ];

  const handleColumnVisibilityChange = (checkedValues) => {
    setVisibleColumns(checkedValues);
  };

  const [filterAuthorName, setFilterAuthorName] = useState("");
  const [filterRole, setFilterRole] = useState("Tất cả");
  const [filterInstitution, setFilterInstitution] = useState("Tất cả");
  const [filterTotalPapersFrom, setFilterTotalPapersFrom] = useState("");
  const [filterTotalPapersTo, setFilterTotalPapersTo] = useState("");
  const [filterPaperType, setFilterPaperType] = useState("Tất cả");
  const [filterTotalPointsFrom, setFilterTotalPointsFrom] = useState("");
  const [filterTotalPointsTo, setFilterTotalPointsTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const uniqueRoles = ["Tất cả", ...new Set(papers.map((paper) => paper.role))];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.institution)),
  ];
  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.type)),
  ];

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterAuthorName === "" || paper.author.includes(filterAuthorName)) &&
      (filterRole === "Tất cả" || paper.role === filterRole) &&
      (filterInstitution === "Tất cả" ||
        paper.institution === filterInstitution) &&
      (filterTotalPapersFrom === "" ||
        paper.totalPapers >= parseInt(filterTotalPapersFrom)) &&
      (filterTotalPapersTo === "" ||
        paper.totalPapers <= parseInt(filterTotalPapersTo)) &&
      (filterPaperType === "Tất cả" || paper.type === filterPaperType) &&
      (filterTotalPointsFrom === "" ||
        paper.points >= parseInt(filterTotalPointsFrom)) &&
      (filterTotalPointsTo === "" ||
        paper.points <= parseInt(filterTotalPointsTo))
    );
  });

  const [sortedInfo, setSortedInfo] = useState({});

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});

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
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      width: 75,
    },
    {
      title: "LOẠI BÀI BÁO",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" ? sortedInfo.order : null,
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (type) => (
        <Tooltip placement="topLeft" title={type}>
          {type}
        </Tooltip>
      ),
    },
    {
      title: "THUỘC NHÓM",
      dataIndex: "group",
      key: "group",
      sorter: (a, b) => a.group.localeCompare(b.group),
      sortOrder: sortedInfo.columnKey === "group" ? sortedInfo.order : null,
      width: 150,
    },
    {
      title: "TÊN BÀI BÁO NGHIÊN CỨU KHOA HỌC",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
    },
    {
      title: "SỐ T/GIẢ",
      dataIndex: "authorCount",
      key: "authorCount",
      sorter: (a, b) => a.authorCount.localeCompare(b.authorCount),
      sortOrder:
        sortedInfo.columnKey === "authorCount" ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      sortOrder: sortedInfo.columnKey === "role" ? sortedInfo.order : null,
      width: 120,
      ellipsis: {
        showTitle: false,
      },
      render: (role) => (
        <Tooltip placement="topLeft" title={role}>
          {role}
        </Tooltip>
      ),
    },
    {
      title: "CQ ĐỨNG TÊN",
      dataIndex: "institution",
      key: "institution",
      sorter: (a, b) => a.institution.localeCompare(b.institution),
      sortOrder:
        sortedInfo.columnKey === "institution" ? sortedInfo.order : null,
      width: 160,
    },
    {
      title: "NGÀY CÔNG BỐ",
      dataIndex: "publicationDate",
      key: "publicationDate",
      sorter: (a, b) =>
        new Date(a.publicationDate) - new Date(b.publicationDate),
      sortOrder:
        sortedInfo.columnKey === "publicationDate" ? sortedInfo.order : null,
      width: 160,
    },
    {
      title: "ĐIỂM",
      dataIndex: "points",
      key: "points",
      sorter: (a, b) => a.points - b.points,
      sortOrder: sortedInfo.columnKey === "points" ? sortedInfo.order : null,
      width: 130,
    },
    {
      title: "Xem chi tiết",
      key: "action",
      render: (text, record) => (
        <a href={`/details/${record.id}`} className="text-blue-500">
          Xem chi tiết
        </a>
      ),
      width: 130,
    },
  ].filter((column) => visibleColumns.includes(column.key));

  const downloadExcel = () => {
    const selectedColumns = columns.map((col) => col.dataIndex).filter(Boolean);
    const filteredData = filteredPapers.map((paper) => {
      const filteredPaper = {};
      selectedColumns.forEach((col) => {
        filteredPaper[col] = paper[col];
      });
      return filteredPaper;
    });
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "table_data.xlsx");
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
              Thống kê điểm đóng góp
            </span>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex justify-end gap-4 mb-4">
            <select className="p-2 border rounded-lg bg-[#00A3FF] text-white h-[40px] text-lg w-[85px]">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Download
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg">
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
              <div className="flex justify-end mb-4 relative">
                <button
                  className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                  onClick={() => setShowFilter(!showFilter)}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs">Bộ lọc</span>
                </button>
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
                    </div>
                  </div>
                )}
                {showFilter && (
                  <div className="absolute top-full mt-2 z-50 shadow-lg">
                    <form className="relative px-4 py-5 w-full bg-white max-w-[500px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Tên tác giả:
                        </label>
                        <Input
                          type="text"
                          value={filterAuthorName}
                          onChange={(e) => setFilterAuthorName(e.target.value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Chức vụ:
                        </label>
                        <Select
                          value={filterRole}
                          onChange={(value) => setFilterRole(value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
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
                          Khoa:
                        </label>
                        <Select
                          value={filterInstitution}
                          onChange={(value) => setFilterInstitution(value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniqueInstitutions.map((institution) => (
                            <Select.Option
                              key={institution}
                              value={institution}
                            >
                              {institution}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3 flex gap-2">
                        <div>
                          <label className="block text-gray-700 text-sm">
                            Tổng bài từ:
                          </label>
                          <Input
                            type="number"
                            value={filterTotalPapersFrom}
                            onChange={(e) =>
                              setFilterTotalPapersFrom(
                                Math.max(0, e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
                            min={0}
                            max={Number.MAX_SAFE_INTEGER}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm">
                            Tổng bài đến:
                          </label>
                          <Input
                            type="number"
                            value={filterTotalPapersTo}
                            onChange={(e) =>
                              setFilterTotalPapersTo(
                                Math.max(0, e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
                            min={0}
                            max={Number.MAX_SAFE_INTEGER}
                            defaultValue={Number.MAX_SAFE_INTEGER}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Loại tạp chí:
                        </label>
                        <Select
                          value={filterPaperType}
                          onChange={(value) => setFilterPaperType(value)}
                          className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        >
                          {uniquePaperTypes.map((type) => (
                            <Select.Option key={type} value={type}>
                              {type}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>

                      <div className="mb-3 flex gap-2">
                        <div>
                          <label className="block text-gray-700 text-sm">
                            Tổng điểm từ:
                          </label>
                          <Input
                            type="number"
                            value={filterTotalPointsFrom}
                            onChange={(e) =>
                              setFilterTotalPointsFrom(
                                Math.max(0, e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
                            min={0}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm">
                            Tổng điểm đến:
                          </label>
                          <Input
                            type="number"
                            value={filterTotalPointsTo}
                            onChange={(e) =>
                              setFilterTotalPointsTo(
                                Math.max(0, e.target.value)
                              )
                            }
                            className="px-2 py-1 bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
                            min={0}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFilterAuthorName("");
                          setFilterRole("Tất cả");
                          setFilterInstitution("Tất cả");
                          setFilterTotalPapersFrom("");
                          setFilterTotalPapersTo("");
                          setFilterPaperType("Tất cả");
                          setFilterTotalPointsFrom("");
                          setFilterTotalPointsTo("");
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
                onChange={handleChange}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                })}
                scroll={{
                  x: columns.reduce(
                    (total, col) => total + (col.width || 0),
                    0
                  ),
                }} // Added horizontal scroll
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
          <strong>Loại bài báo:</strong> {modalContent.type}
        </p>
        <p>
          <strong>Thuộc nhóm:</strong> {modalContent.group}
        </p>
        <p>
          <strong>Tên bài báo nghiên cứu khoa học:</strong> {modalContent.title}
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
          <strong>Điểm:</strong> {modalContent.points}
        </p>
      </Modal>
    </div>
  );
};

export default ManagementPoint;
