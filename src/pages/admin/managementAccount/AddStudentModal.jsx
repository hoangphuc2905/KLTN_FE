import React from "react";
import { Input, Button, Form, message, Select, DatePicker, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Option } = Select;

const AddStudentModal = ({ onClose, studentData = {} }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Ensure the role is always "student"
      const studentDataWithRole = { ...values, role: "student" };
      console.log("Student data submitted:", studentDataWithRole);
      message.success("Thêm sinh viên thành công!");
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error adding student:", error);
      message.error("Thêm sinh viên thất bại!");
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-6 bg-white rounded-lg shadow-md">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...studentData,
          score_year: 0, // Default score_year to 0
          isActive: true, // Default isActive to true
        }}
        onFinish={handleSubmit}
        className="max-w-xl mx-auto"
      >
        <Form.Item
          label="Mã số sinh viên"
          name="student_id"
          rules={[
            { required: true, message: "Vui lòng nhập mã số sinh viên!" },
          ]}
        >
          <Input placeholder="Nhập mã số sinh viên" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Họ và tên"
          name="full_name"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập họ và tên" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Giới tính"
          name="gender"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select placeholder="Chọn giới tính" className="rounded-md">
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Ngày sinh"
          name="date_of_birth"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker className="w-full rounded-md" />
        </Form.Item>
        <Form.Item
          label="CCCD"
          name="cccd"
          rules={[{ required: true, message: "Vui lòng nhập CCCD!" }]}
        >
          <Input placeholder="Nhập CCCD" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input placeholder="Nhập địa chỉ" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Ngày bắt đầu"
          name="start_date"
          rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
        >
          <DatePicker className="w-full rounded-md" />
        </Form.Item>
        <Form.Item
          label="Khoa"
          name="department"
          rules={[{ required: true, message: "Vui lòng nhập khoa!" }]}
        >
          <Input placeholder="Nhập khoa" className="rounded-md" />
        </Form.Item>
        <Form.Item
          label="Ảnh đại diện"
          name="avatar"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          rules={[{ required: true, message: "Vui lòng chọn ảnh đại diện!" }]}
        >
          <Upload
            name="avatar"
            listType="picture"
            maxCount={1}
            beforeUpload={() => false} // Prevent automatic upload
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="Học vị"
          name="degree"
          rules={[{ required: true, message: "Vui lòng chọn học vị!" }]}
        >
          <Select placeholder="Chọn học vị" className="rounded-md">
            <Option value="Bachelor">Cử nhân</Option>
            <Option value="Master">Thạc sĩ</Option>
            <Option value="Doctor">Tiến sĩ</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <div className="flex justify-end gap-4">
            <Button onClick={onClose} className="bg-gray-200 hover:bg-gray-300">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Thêm
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddStudentModal;
