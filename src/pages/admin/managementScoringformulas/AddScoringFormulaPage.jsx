import { Select, Input, Button, Form, message, DatePicker } from "antd";
import { useState } from "react";
import { CloseOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import userApi from "../../../api/api";

const { Option } = Select;

const AddScoringFormulaPage = ({ onClose, selectedYear, onAddAttribute }) => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
  });

  const [additionalFields, setAdditionalFields] = useState([
    { key: "", value: "" },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, name: value });
  };

  const handleDateChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddField = () => {
    setAdditionalFields([...additionalFields, { key: "", value: "" }]);
  };

  const handleRemoveField = (index) => {
    const newFields = additionalFields.filter((_, i) => i !== index);
    setAdditionalFields(newFields);
  };

  const handleAdditionalFieldChange = (index, e) => {
    const newFields = [...additionalFields];
    newFields[index][e.target.name] = e.target.value;
    setAdditionalFields(newFields);
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.startDate ||
        formData.startDate.isBefore(new Date(), "day")
      ) {
        message.error("Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại!");
        return;
      }

      const values = additionalFields.reduce((acc, field) => {
        if (field.key && field.value) {
          acc[field.key] = parseFloat(field.value);
        }
        return acc;
      }, {});

      const attributeData = {
        year: selectedYear,
        name: formData.name,
        startDate: formData.startDate.format("YYYY-MM-DD"),
        endDate: formData.endDate
          ? formData.endDate.format("YYYY-MM-DD")
          : null,
        values: values,
      };

      console.log("Submitting Data:", attributeData); // Log the data being sent

      // Create a new attribute
      const response = await userApi.createAttribute(attributeData);
      console.log("Submitted Data:", response.data);
      message.success("Lưu thuộc tính thành công!");

      // Gọi hàm callback để cập nhật danh sách thuộc tính
      onAddAttribute(response.data);

      onClose();
    } catch (error) {
      console.error("Error submitting data:", error.response?.data || error);
      message.error("Thuộc tính đã tồn tại!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] border-2 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <CloseOutlined />
        </button>

        <h2 className="text-lg font-semibold text-blue-600 text-center mb-4">
          THÊM THUỘC TÍNH TÍNH ĐIỂM
        </h2>

        <Form onFinish={handleSubmit}>
          <div className="space-y-4 pt-4">
            {/* Tên tiêu chí */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên tiêu chí <span className="text-red-500">(*)</span>
              </label>
              <Select
                name="name"
                value={formData.name}
                onChange={handleSelectChange}
                placeholder="Chọn tiêu chí"
                className="w-full"
              >
                <Option value="journal_group">NHÓM TẠP CHÍ</Option>
                <Option value="author_role">VAI TRÒ</Option>
                <Option value="institution_count">CƠ QUAN ĐỨNG TÊN</Option>
                <Option value="doi">DOI</Option>
                <Option value="exemplary_paper">TIÊU BIỂU</Option>
              </Select>
            </div>

            {/* Ngày bắt đầu */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày bắt đầu <span className="text-red-500">(*)</span>
              </label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                className="w-full"
                format="YYYY-MM-DD"
              />
            </div>

            {/* Ngày kết thúc */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <DatePicker
                value={formData.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                className="w-full"
                format="YYYY-MM-DD"
              />
            </div>

            {/* Cặp giá trị Thành phần - Hệ số */}
            {additionalFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium">
                  Thành phần - Hệ số <span className="text-red-500">(*)</span>
                </label>
                <div className="flex gap-4">
                  <Input
                    name="key"
                    value={field.key}
                    onChange={(e) => handleAdditionalFieldChange(index, e)}
                    placeholder="Thành phần"
                    className="w-1/2"
                  />
                  <Input
                    name="value"
                    value={field.value}
                    onChange={(e) => handleAdditionalFieldChange(index, e)}
                    placeholder="Hệ số"
                    className="w-1/2"
                    type="number"
                  />
                  <Button
                    icon={<MinusOutlined />}
                    onClick={() => handleRemoveField(index)}
                    size="small"
                  />
                </div>
              </div>
            ))}

            {/* Nút thêm cặp giá trị */}
            <Button
              type="dashed"
              onClick={handleAddField}
              className="w-full flex items-center justify-center"
              icon={<PlusOutlined />}
            >
              Thêm cặp giá trị
            </Button>

            {/* Nút Xóa trắng và Lưu */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="default"
                onClick={() =>
                  setFormData({
                    name: "",
                    startDate: null,
                    endDate: null,
                  })
                }
              >
                Xóa trắng
              </Button>
              <Button type="primary" htmlType="submit">
                Lưu
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AddScoringFormulaPage;
