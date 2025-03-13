import { useState } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Input, Select, Table, Checkbox } from "antd";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const ManagementPoint = () => {
  const papers = [
    {
      id: 1,
      author: "Nguyễn Văn A",
      position: "Giảng viên",
      department: "CÔNG NGHỆ THÔNG TIN",
      totalPapers: 10,
      journalType: "Tất cả",
      totalPoints: 90,
    },
    {
      id: 2,
      author: "Nguyễn Duy Thanh",
      position: "Sinh viên",
      department: "QUẢN TRỊ KINH DOANH",
      totalPapers: 8,
      journalType: "Tất cả",
      totalPoints: 43,
    },
    {
      id: 3,
      author: "Huỳnh Hoàng Phúc",
      position: "Sinh viên",
      department: "TÀI CHÍNH KẾ TOÁN",
      totalPapers: 5,
      journalType: "Tất cả",
      totalPoints: 25,
    },
    {
      id: 4,
      author: "Nguyễn Văn B",
      position: "Giảng viên",
      department: "NGOẠI NGỮ",
      totalPapers: 3,
      journalType: "Tất cả",
      totalPoints: 12,
    },
    {
      id: 5,
      author: "Nguyễn Văn A",
      position: "Giảng viên",
      department: "CÔNG NGHỆ THÔNG TIN",
      totalPapers: 10,
      journalType: "Tất cả",
      totalPoints: 90,
    },
    {
      id: 6,
      author: "Nguyễn Duy Thanh",
      position: "Sinh viên",
      department: "QUẢN TRỊ KINH DOANH",
      totalPapers: 8,
      journalType: "Tất cả",
      totalPoints: 43,
    },
    {
      id: 7,
      author: "Huỳnh Hoàng Phúc",
      position: "Sinh viên",
      department: "TÀI CHÍNH KẾ TOÁN",
      totalPapers: 5,
      journalType: "Tất cả",
      totalPoints: 25,
    },
    {
      id: 8,
      author: "Nguyễn Văn B",
      position: "Giảng viên",
      department: "NGOẠI NGỮ",
      totalPapers: 3,
      journalType: "Tất cả",
      totalPoints: 12,
    },
    {
      id: 9,
      author: "Nguyễn Văn A",
      position: "Giảng viên",
      department: "CÔNG NGHỆ THÔNG TIN",
      totalPapers: 10,
      journalType: "Tất cả",
      totalPoints: 90,
    },
    {
      id: 10,
      author: "Nguyễn Duy Thanh",
      position: "Sinh viên",
      department: "QUẢN TRỊ KINH DOANH",
      totalPapers: 8,
      journalType: "Tất cả",
      totalPoints: 43,
    },
    {
      id: 11,
      author: "Huỳnh Hoàng Phúc",
      position: "Sinh viên",
      department: "TÀI CHÍNH KẾ TOÁN",
      totalPapers: 5,
      journalType: "Tất cả",
      totalPoints: 25,
    },
    {
      id: 12,
      author: "Nguyễn Văn B",
      position: "Trưởng khoa",
      department: "NGOẠI NGỮ",
      totalPapers: 3,
      journalType: "Tất cả",
      totalPoints: 12,
    },
  ];

  const [showFilter, setShowFilter] = useState(false);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    "checkbox",
    "id",
    "author",
    "position",
    "department",
    "totalPapers",
    "journalType",
    "totalPoints",
    "action",
  ]);

  const columnOptions = [
    { label: "STT", value: "id" },
    { label: "TÁC GIẢ", value: "author" },
    { label: "CHỨC VỤ", value: "position" },
    { label: "KHOA", value: "department" },
    { label: "TỔNG BÀI", value: "totalPapers" },
    { label: "LOẠI TẠP CHÍ", value: "journalType" },
    { label: "TỔNG ĐIỂM", value: "totalPoints" },
    { label: "XEM CHI TIẾT", value: "action" },
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

  const uniqueRoles = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.position)),
  ];
  const uniqueInstitutions = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.department)),
  ];
  const uniquePaperTypes = [
    "Tất cả",
    ...new Set(papers.map((paper) => paper.journalType)),
  ];

  const filteredPapers = papers.filter((paper) => {
    return (
      (filterAuthorName === "" || paper.author.includes(filterAuthorName)) &&
      (filterRole === "Tất cả" || paper.position === filterRole) &&
      (filterInstitution === "Tất cả" ||
        paper.department === filterInstitution) &&
      (filterTotalPapersFrom === "" ||
        paper.totalPapers >= parseInt(filterTotalPapersFrom)) &&
      (filterTotalPapersTo === "" ||
        paper.totalPapers <= parseInt(filterTotalPapersTo)) &&
      (filterPaperType === "Tất cả" || paper.journalType === filterPaperType) &&
      (filterTotalPointsFrom === "" ||
        paper.totalPoints >= parseInt(filterTotalPointsFrom)) &&
      (filterTotalPointsTo === "" ||
        paper.totalPoints <= parseInt(filterTotalPointsTo))
    );
  });

  const [sortedInfo, setSortedInfo] = useState({});

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      sorter: (a, b) => a.id - b.id,
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
      width: 65,
    },
    {
      title: "TÁC GIẢ",
      dataIndex: "author",
      key: "author",
      sorter: (a, b) => a.author.localeCompare(b.author),
      sortOrder: sortedInfo.columnKey === "author" ? sortedInfo.order : null,
      width: 250,
    },
    {
      title: "CHỨC VỤ",
      dataIndex: "position",
      key: "position",
      sorter: (a, b) => a.position.localeCompare(b.position),
      sortOrder: sortedInfo.columnKey === "position" ? sortedInfo.order : null,
      width: 150,
    },
    {
      title: "KHOA",
      dataIndex: "department",
      key: "department",
      sorter: (a, b) => a.department.localeCompare(b.department),
      sortOrder:
        sortedInfo.columnKey === "department" ? sortedInfo.order : null,
      width: 270,
    },
    {
      title: "TỔNG BÀI",
      dataIndex: "totalPapers",
      key: "totalPapers",
      sorter: (a, b) => a.totalPapers - b.totalPapers,
      sortOrder:
        sortedInfo.columnKey === "totalPapers" ? sortedInfo.order : null,
      width: 120,
    },
    {
      title: "LOẠI TẠP CHÍ",
      dataIndex: "journalType",
      key: "journalType",
      sorter: (a, b) => a.journalType.localeCompare(b.journalType),
      sortOrder:
        sortedInfo.columnKey === "journalType" ? sortedInfo.order : null,
      width: 140,
    },
    {
      title: "TỔNG ĐIỂM",
      dataIndex: "totalPoints",
      key: "totalPoints",
      sorter: (a, b) => a.totalPoints - b.totalPoints,
      sortOrder:
        sortedInfo.columnKey === "totalPoints" ? sortedInfo.order : null,
      width: 130,
    },
    {
      title: "XEM CHI TIẾT",
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
              Dạng bảng
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
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="block text-gray-700 text-sm">
                          Chức vụ:
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
                          Khoa:
                        </label>
                        <Select
                          value={filterInstitution}
                          onChange={(value) => setFilterInstitution(value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
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
                            className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
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
                            className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
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
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[350px] max-md:w-full max-md:max-w-[350px] max-sm:w-full text-sm"
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
                            className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
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
                            className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[35px] w-[170px] max-md:w-full max-md:max-w-[170px] max-sm:w-full text-sm"
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementPoint;
