import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Button, Table, Input, Form, Modal, message } from "antd";
import userApi from "../../../api/api"; // Import userApi

const ManagementData = () => {
  const [activeTab, setActiveTab] = useState("type");
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();
  const [showFilter, setShowFilter] = useState(false);
  const [filterPaperType, setFilterPaperType] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  const filterRef = useRef(null);
  const [sortedInfo, setSortedInfo] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterRef]);

  useEffect(() => {
    const fetchPaperTypes = async () => {
      try {
        const response = await userApi.getAllPaperTypes();
        setPaperTypes(response);
      } catch (error) {
        console.error("Error fetching paper types:", error);
        message.error("Lỗi khi lấy danh sách loại bài báo.");
      }
    };

    fetchPaperTypes();
  }, []);

  const handleAdd = () => {
    setIsEditMode(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({ type_name: record.type_name });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      if (isEditMode) {
        if (activeTab === "type") {
          setPaperTypes((prev) =>
            prev.map((item) =>
              item._id === currentRecord._id
                ? { ...item, type_name: values.type_name }
                : item
            )
          );
        } else {
          setPaperGroups((prev) =>
            prev.map((item) =>
              item._id === currentRecord._id
                ? { ...item, type_name: values.type_name }
                : item
            )
          );
        }
        message.success("Chỉnh sửa thành công!");
      } else {
        if (activeTab === "type") {
          try {
            const newType = await userApi.createPaperType({
              type_name: values.type_name,
            });
            setPaperTypes([...paperTypes, newType]);
            message.success("Thêm thành công!");
          } catch (error) {
            console.error("Error creating paper type:", error);
            message.error("Lỗi khi thêm loại bài báo.");
          }
        } else {
          const newGroup = {
            _id: paperGroups.length + 1,
            type_name: values.type_name,
          };
          setPaperGroups([...paperGroups, newGroup]);
          message.success("Thêm thành công!");
        }
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const clearAll = () => {
    setSortedInfo({});
  };

  const typeColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (text, record, index) => index + 1,
    },
    {
      title: "TÊN LOẠI BÀI BÁO/TẠP CHÍ",
      dataIndex: "type_name",
      key: "type_name",
      sorter: (a, b) => a.type_name.length - b.type_name.length,
      sortOrder: sortedInfo.columnKey === "type_name" ? sortedInfo.order : null,
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (text, record) => (
        <button className="text-blue-500" onClick={() => handleEdit(record)}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png"
            alt="Edit"
            className="w-5 h-5"
          />
        </button>
      ),
      align: "right",
    },
  ];

  const groupColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (text, record, index) => index + 1,
    },
    {
      title: "TÊN NHÓM BÀI BÁO",
      dataIndex: "type_name",
      key: "type_name",
      sorter: (a, b) => a.type_name.length - b.type_name.length,
      sortOrder: sortedInfo.columnKey === "type_name" ? sortedInfo.order : null,
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (text, record) => (
        <button className="text-blue-500" onClick={() => handleEdit(record)}>
          <img
            src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png"
            alt="Edit"
            className="w-5 h-5"
          />
        </button>
      ),
      align: "right",
    },
  ];

  const filteredPaperTypes = paperTypes.filter((type) =>
    type.type_name
      ? type.type_name.toLowerCase().includes(filterPaperType.toLowerCase())
      : false
  );

  const filteredPaperGroups = paperGroups.filter((group) =>
    group.type_name
      ? group.type_name.toLowerCase().includes(filterGroup.toLowerCase())
      : false
  );

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
              Quản lý data
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
                activeTab === "type"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("type")}
            >
              Loại bài báo
            </button>
            <button
              className={`px-4 py-2 text-center text-xs ${
                activeTab === "group"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-lg`}
              onClick={() => setActiveTab("group")}
            >
              Nhóm bài báo
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex justify-end gap-4 mb-4 p-4 relative">
              {" "}
              {/* Add relative class */}
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleAdd}
              >
                Thêm
              </Button>
              <button
                className="flex items-center gap-2 text-gray-600 px-3 py-0.5 rounded-lg border"
                onClick={() => setShowFilter(!showFilter)} // Add this line
              >
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
              </button>
              {showFilter && (
                <div
                  ref={filterRef}
                  className="absolute top-full mt-2 z-50 shadow-lg"
                >
                  {" "}
                  {/* Adjust position */}
                  <form className="relative px-4 py-5 w-full bg-white max-w-[400px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                    {activeTab === "type" ? (
                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Tên Loại Bài Báo:
                        </label>
                        <Input
                          type="text"
                          value={filterPaperType}
                          onChange={(e) => setFilterPaperType(e.target.value)} // Fix this line
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label className="block text-gray-700 text-xs">
                          Tên Nhóm Bài Báo:
                        </label>
                        <Input
                          type="text"
                          value={filterGroup}
                          onChange={(e) => setFilterGroup(e.target.value)}
                          className="px-2 py-1 text-base bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setFilterPaperType("");
                        setFilterGroup("");
                      }} // Fix this line
                      className="w-full mt-4 bg-blue-500 text-white py-1 rounded-md text-xs"
                    >
                      Xóa trắng
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              {activeTab === "type" ? (
                <Table
                  columns={typeColumns}
                  dataSource={filteredPaperTypes}
                  pagination={{ pageSize: 5 }}
                  rowKey="_id"
                  onChange={handleChange} // Add this line
                />
              ) : (
                <Table
                  columns={groupColumns}
                  dataSource={filteredPaperGroups}
                  pagination={{ pageSize: 5 }}
                  rowKey="_id"
                  onChange={handleChange} // Add this line
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={
          activeTab === "type"
            ? isEditMode
              ? "Chỉnh sửa Loại Bài Báo/Tạp Chí"
              : "Thêm Loại Bài Báo/Tạp Chí"
            : isEditMode
            ? "Chỉnh sửa Nhóm Bài Báo"
            : "Thêm Nhóm Bài Báo"
        }
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type_name"
            label={
              activeTab === "type"
                ? "Tên Loại Bài Báo/Tạp Chí"
                : "Tên Nhóm Bài Báo"
            }
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagementData;
