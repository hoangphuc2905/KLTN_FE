import React, { useState, useEffect } from "react";
import Header from "../../../components/header";
import { Filter } from "lucide-react";
import { Button, Table, Input, Form, Modal, message } from "antd"; // Import necessary components from antd

const ManagementData = () => {
  const [activeTab, setActiveTab] = useState("type");
  const [paperTypes, setPaperTypes] = useState([
    {
      id: 1,
      name: "Bài báo trên Tạp chí khoa học quốc tế khác (có chỉ số ISSN)",
    },
    {
      id: 2,
      name: "Bài báo trên Tạp chí khoa học và công nghệ (IUH)",
    },
    {
      id: 3,
      name: "Kỷ yếu hội nghị SCOPUS (chung)",
    },
    {
      id: 4,
      name: "Tạp chí ESCI",
    },
    {
      id: 5,
      name: "Bài báo đăng Kỷ yếu Hội nghị KH Việt Nam (toàn văn, có ISBN)",
    },
  ]);

  const [paperGroups, setPaperGroups] = useState([
    { id: 1, name: "Q1" },
    { id: 2, name: "Q2" },
    { id: 3, name: "Q3" },
    { id: 4, name: "Q4" },
    { id: 5, name: "Q5" },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setIsEditMode(false);
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({ name: record.name });
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (isEditMode) {
        if (activeTab === "type") {
          setPaperTypes((prev) =>
            prev.map((item) =>
              item.id === currentRecord.id
                ? { ...item, name: values.name }
                : item
            )
          );
        } else {
          setPaperGroups((prev) =>
            prev.map((item) =>
              item.id === currentRecord.id
                ? { ...item, name: values.name }
                : item
            )
          );
        }
        message.success("Chỉnh sửa thành công!");
      } else {
        if (activeTab === "type") {
          const newType = { id: paperTypes.length + 1, name: values.name };
          setPaperTypes([...paperTypes, newType]);
        } else {
          const newGroup = { id: paperGroups.length + 1, name: values.name };
          setPaperGroups([...paperGroups, newGroup]);
        }
        message.success("Thêm thành công!");
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const typeColumns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "TÊN LOẠI BÀI BÁO/TẠP CHÍ",
      dataIndex: "name",
      key: "name",
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
      dataIndex: "id",
      key: "id",
    },
    {
      title: "TÊN NHÓM BÀI BÁO",
      dataIndex: "name",
      key: "name",
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
          <div className="flex border-b">
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "type"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("type")}
            >
              Loại bài báo
            </button>
            <button
              className={`px-8 py-3 text-center text-sm ${
                activeTab === "group"
                  ? "bg-[#00A3FF] text-white"
                  : "bg-white text-gray-700"
              } rounded-t-lg`}
              onClick={() => setActiveTab("group")}
            >
              Nhóm bài báo
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="flex justify-end gap-4 mb-4 p-4">
              <Button
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleAdd}
              >
                Thêm
              </Button>
              <button className="flex items-center gap-2 text-gray-600 px-3 py-0.5 rounded-lg border">
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "type" ? (
                <Table
                  columns={typeColumns}
                  dataSource={paperTypes}
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
                />
              ) : (
                <Table
                  columns={groupColumns}
                  dataSource={paperGroups}
                  pagination={{ pageSize: 5 }}
                  rowKey="id"
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
            <Input placeholder="Nhập tên" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagementData;
