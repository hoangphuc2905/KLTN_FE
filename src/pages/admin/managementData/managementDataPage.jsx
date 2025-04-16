import React, { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Button, Table, Input, Form, Modal, message } from "antd";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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

    const fetchPaperGroups = async () => {
      try {
        const response = await userApi.getAllPaperGroups();
        setPaperGroups(response);
      } catch (error) {
        console.error("Error fetching paper groups:", error);
        message.error("Lỗi khi lấy danh sách nhóm bài báo.");
      }
    };

    fetchPaperTypes();
    fetchPaperGroups();
  }, []);

  const handleAdd = () => {
    setIsEditMode(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({ name: record.type_name || record.group_name });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      if (isEditMode) {
        if (activeTab === "type") {
          try {
            await userApi.updatePaperType({
              _id: currentRecord._id,
              type_name: values.name,
            });
            setPaperTypes((prev) =>
              prev.map((item) =>
                item._id === currentRecord._id
                  ? { ...item, type_name: values.name }
                  : item
              )
            );
            message.success("Chỉnh sửa thành công!");
          } catch (error) {
            console.error("Error updating paper type:", error);
            message.error("Lỗi khi chỉnh sửa loại bài báo.");
          }
        } else {
          try {
            await userApi.updatePaperGroup({
              _id: currentRecord._id,
              group_name: values.name,
            });
            setPaperGroups((prev) =>
              prev.map((item) =>
                item._id === currentRecord._id
                  ? { ...item, group_name: values.name }
                  : item
              )
            );
            message.success("Chỉnh sửa thành công!");
          } catch (error) {
            console.error("Error updating paper group:", error);
            message.error("Lỗi khi chỉnh sửa nhóm bài báo.");
          }
        }
      } else {
        if (activeTab === "type") {
          try {
            const newType = await userApi.createPaperType({
              type_name: values.name,
            });
            setPaperTypes([...paperTypes, newType]);
            message.success("Thêm thành công!");
          } catch (error) {
            console.error("Error creating paper type:", error);
            message.error("Lỗi khi thêm loại bài báo.");
          }
        } else {
          try {
            const newGroup = await userApi.createPaperGroup({
              group_name: values.name,
            });
            setPaperGroups([...paperGroups, newGroup]);
            message.success("Thêm thành công!");
          } catch (error) {
            console.error("Error creating paper group:", error);
            message.error("Lỗi khi thêm nhóm bài báo.");
          }
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
      width: 80,
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
      width: 120,
      align: "center",
    },
  ];

  const groupColumns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      render: (text, record, index) => index + 1,
      width: 80,
    },
    {
      title: "TÊN NHÓM BÀI BÁO",
      dataIndex: "group_name",
      key: "group_name",
      sorter: (a, b) => a.group_name.length - b.group_name.length,
      sortOrder:
        sortedInfo.columnKey === "group_name" ? sortedInfo.order : null,
    },
    {
      title: "CHỈNH SỬA",
      key: "edit",
      render: (text, record) => (
        <button className="text-blue-500" onClick={() => handleEdit(record)}>
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
      width: 120,
      align: "center",
    },
  ];

  const filteredPaperTypes = paperTypes.filter((type) =>
    type.type_name
      ? type.type_name.toLowerCase().includes(filterPaperType.toLowerCase())
      : false
  );

  const filteredPaperGroups = paperGroups.filter((group) =>
    group.group_name
      ? group.group_name.toLowerCase().includes(filterGroup.toLowerCase())
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
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500"
            >
              Trang chủ
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sm text-sky-900">
              Quản lý dữ liệu
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
                className="bg-blue-500 text-white hover:bg-blue-600 text-xs"
                onClick={handleAdd}
              >
                Thêm
              </Button>
              <button
                className="flex items-center gap-2 text-gray-600 px-3 py-0.5 rounded-lg border text-xs"
                onClick={() => setShowFilter(!showFilter)}
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
                          onChange={(e) => setFilterPaperType(e.target.value)}
                          className="px-2 py-1  bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
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
                          className="px-2 py-1  bg-white rounded-md border border-solid border-zinc-300 h-[25px] w-[300px] max-md:w-full max-md:max-w-[300px] max-sm:w-full text-xs"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setFilterPaperType("");
                        setFilterGroup("");
                      }}
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
                  pagination={{ pageSize: 10 }}
                  rowKey="_id"
                  onChange={handleChange}
                  scroll={{
                    x: typeColumns.reduce(
                      (total, col) => total + (col.width || 0),
                      0
                    ),
                  }}
                  locale={{
                    emptyText: <div style={{ height: "35px" }}></div>,
                  }}
                  style={{
                    height: "525px",
                    minHeight: "525px",
                  }}
                />
              ) : (
                <Table
                  columns={groupColumns}
                  dataSource={filteredPaperGroups}
                  pagination={{ pageSize: 10 }}
                  rowKey="_id"
                  onChange={handleChange}
                  scroll={{
                    x: groupColumns.reduce(
                      (total, col) => total + (col.width || 0),
                      0
                    ),
                  }}
                  locale={{
                    emptyText: <div style={{ height: "35px" }}></div>,
                  }}
                  style={{
                    height: "525px",
                    minHeight: "525px",
                  }}
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
            name="name"
            label={
              activeTab === "type"
                ? "Tên Loại Bài Báo/Tạp Chí"
                : "Tên Nhóm Bài Báo"
            }
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên" className="text-xs" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagementData;
