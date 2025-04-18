import { useEffect, useState } from "react";
import { Input, Button, Form, message, Select, DatePicker, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import userApi from "../../../api/api";

const { Option } = Select;

const AddLecturerModal = ({ onClose, lecturerData = {} }) => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const departmentId = localStorage.getItem("department");

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

      // Ensure the role is always the specific role ID
      const lecturerDataWithRole = {
        ...values,
        avatar: avatarUrl,
        roles: "67e0033fad59fbe6e1602a4c", // Updated to use the role ID
        department: departmentId,
        score_year: 0,
        isActive: true,
      };

      // Call the createLecturer API
      await userApi.createLecturer(lecturerDataWithRole);

      message.success("Thêm giảng viên thành công!");
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error adding lecturer:", error);
      message.error(error.message || "Thêm giảng viên thất bại!");
    }
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-6 bg-white rounded-lg shadow-md">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...lecturerData,
          isActive: true,
          role: "lecturer",
        }}
        onFinish={handleSubmit}
        className="max-w-xl mx-auto"
      >
        <Form.Item
          label="Mã số giảng viên"
          name="lecturer_id"
          rules={[
            { required: true, message: "Vui lòng nhập mã số giảng viên!" },
          ]}
        >
          <Input placeholder="Nhập mã số giảng viên" className="rounded-md" />
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
            <Option value="Engineer">Kỹ sư</Option>
            <Option value="Professor">Giáo sư</Option>
            <Option value="Associate_Professor">Phó giáo sư</Option>
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

export default AddLecturerModal;
