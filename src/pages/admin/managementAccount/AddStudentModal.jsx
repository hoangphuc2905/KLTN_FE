import React, { useEffect, useState } from "react";
import { Input, Button, Form, message, Select, DatePicker, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import userApi from "../../../api/api";

const { Option } = Select;

const AddStudentModal = ({ onClose, studentData = {} }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]); // State to store department data

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await userApi.getAllDepartments(); // Fetch departments
        setDepartments(response); // Set the department data
      } catch (error) {
        console.error("Error fetching departments:", error);
        message.error("Không thể tải danh sách khoa!");
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (values) => {
    try {
      // Extract the avatar file
      const avatarFile = values.avatar?.[0]?.originFileObj;
      if (!avatarFile) {
        throw new Error("Vui lòng chọn ảnh đại diện hợp lệ!");
      }

      // Upload the avatar to the cloud and get the URL
      const uploadResponse = await userApi.uploadImage(avatarFile);
      const avatarUrl = uploadResponse.url; // Extract the URL from the response

      // Ensure the role is always "student" and set score_year to 0
      const studentDataWithRole = {
        ...values,
        avatar: avatarUrl, // Use the uploaded image URL
        role: "student",
        score_year: 0, // Explicitly set score_year to 0
      };

      // Call the createStudent API
      await userApi.createStudent(studentDataWithRole);

      message.success("Thêm sinh viên thành công!");
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error adding student:", error);
      message.error(error.message || "Thêm sinh viên thất bại!");
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-6 bg-white rounded-lg shadow-md">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...studentData,
          isActive: true,
          role: "student",
          score_year: 0,
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
            <Option value="other">Khác</Option>
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
          rules={[{ required: true, message: "Vui lòng chọn khoa!" }]}
        >
          <Select placeholder="Chọn khoa" className="rounded-md">
            {departments.map((dept) => (
              <Option key={dept._id} value={dept._id}>
                {dept.department_name}
              </Option>
            ))}
          </Select>
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
        <Form.Item label="Học vị" name="degree" rules={[{ required: false }]}>
          <Select placeholder="Chọn học vị" className="rounded-md">
            <Option value="Bachelor">Cử nhân</Option>
            <Option value="Master">Thạc sĩ</Option>
            <Option value="Doctor">Tiến sĩ</Option>
            <Option value="Egineer">Kỹ sư</Option>
            <Option value="Professor">Giáo sư</Option>
            <Option value="Ossociate_Professor">Phó giáo sư</Option>
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
