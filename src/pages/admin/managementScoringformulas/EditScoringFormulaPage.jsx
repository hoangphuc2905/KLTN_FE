import { Select, Input, Button, Form, message, DatePicker } from "antd";
import { useState, useEffect } from "react";
import { CloseOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import userApi from "../../../api/api"; // Import API
import moment from "moment";

const { Option } = Select;

const ShowScoringFormulaPage = ({ onClose, data }) => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "", // Add startDate
    endDate: "", // Add endDate
  });

  const [additionalFields, setAdditionalFields] = useState([]);

  // Cập nhật form khi có dữ liệu mới
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        startDate: data.startDate || "", // Initialize startDate
        endDate: data.endDate || "", // Initialize endDate
      });
      setAdditionalFields(
        Object.entries(data.values || {}).map(([key, value]) => ({
          key,
          value,
        }))
      );
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, name: value });
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

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async () => {
    try {
      const values = additionalFields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});
      const updatedData = { ...formData, values };
      await userApi.updateAttribute(data.year, updatedData);
      message.success("Cập nhật công thức tính điểm thành công!");
      console.log("Submitted Data:", updatedData);
      onClose();
    } catch (error) {
      message.error("Cập nhật công thức tính điểm thất bại!");
      console.error("Error submitting data:", error);
    }
  };

  // Thay đổi div chứa toàn bộ modal
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-[600px] md:max-w-[600px] border-2 relative max-h-[70vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <CloseOutlined />
        </button>

        <h2 className="text-lg font-semibold text-blue-600 text-center mb-4">
          HIỂN THỊ CÔNG THỨC TÍNH ĐIỂM
        </h2>

        <Form onFinish={handleSubmit} className="overflow-y-auto pr-1">
          <div className="space-y-4 pt-4">
            {/* Ngày bắt đầu */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày bắt đầu <span className="text-red-500">(*)</span>
              </label>
              <DatePicker
                value={formData.startDate ? moment(formData.startDate) : null}
                disabled
                className="w-full"
              />
            </div>

            {/* Ngày kết thúc */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày kết thúc <span className="text-red-500">(*)</span>
              </label>
              <DatePicker
                value={formData.endDate ? moment(formData.endDate) : null}
                onChange={(date, dateString) =>
                  handleDateChange("endDate", dateString)
                }
                className="w-full"
              />
            </div>

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
                <Option value="institution_count">CƠ ĐỨNG TÊN</Option>
                <Option value="doi">DOI</Option>
                <Option value="exemplary_paper">TIÊU BIỂU</Option>
              </Select>
            </div>

            {/* Cặp giá trị Thành phần - Hệ số */}
            {additionalFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium">
                  Thành phần - Hệ số <span className="text-red-500">(*)</span>
                </label>
                <div className="flex gap-2">
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
                  />
                  <Button
                    icon={<MinusOutlined />}
                    onClick={() => handleRemoveField(index)}
                    size="small"
                    className="flex-shrink-0"
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

export default ShowScoringFormulaPage;
