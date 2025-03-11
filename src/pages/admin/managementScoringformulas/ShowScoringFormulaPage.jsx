import { Select, Input, Button, Form } from "antd";
import { useState, useEffect } from "react";
import { CloseOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

const { Option } = Select;

const ShowScoringFormulaPage = ({ onClose, data }) => {
  const [formData, setFormData] = useState({
    criterion: "",
    percentage: "",
    coefficient: "",
  });

  const [additionalFields, setAdditionalFields] = useState([
    { percentage: "", coefficient: "" },
  ]);

  useEffect(() => {
    if (data) {
      setFormData({
        criterion: data.criterion,
        percentage: data.percentage,
        coefficient: data.coefficient,
      });
      setAdditionalFields(data.additionalFields || []);
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, criterion: value });
  };

  const handleAddField = () => {
    setAdditionalFields([
      ...additionalFields,
      { percentage: "", coefficient: "" },
    ]);
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
      console.log("Submitted Data:", { ...formData, additionalFields });
      onClose();
    } catch (error) {
      console.error("Error submitting data:", error);
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
          HIỂN THỊ CÔNG THỨC TÍNH ĐIỂM
        </h2>

        <Form onFinish={handleSubmit}>
          <div className="space-y-4 pt-4">
            {/* Tiêu chí */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên tiêu chí <span className="text-red-500">(*)</span>
              </label>
              <Select
                name="criterion"
                value={formData.criterion}
                onChange={handleSelectChange}
                placeholder="Chọn tiêu chí"
                className="w-full"
              >
                <Option value="journal">NHÓM TẠP CHÍ</Option>
                <Option value="role">VAI TRÒ</Option>
                <Option value="organization">CƠ ĐỨNG TÊN</Option>
                <Option value="doi">DOI</Option>
                <Option value="exemplary">TIÊU BIỂU</Option>
              </Select>
            </div>

            {/* Phần trăm đóng góp */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Phần trăm đóng góp <span className="text-red-500">(*)</span>
              </label>
              <Input
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="Nhập phần trăm đóng góp"
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
                    name="percentage"
                    value={field.percentage}
                    onChange={(e) => handleAdditionalFieldChange(index, e)}
                    placeholder="Thành phần"
                    className="w-1/2"
                  />
                  <Input
                    name="coefficient"
                    value={field.coefficient}
                    onChange={(e) => handleAdditionalFieldChange(index, e)}
                    placeholder="Hệ số"
                    className="w-1/2"
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
              <Button type="default" onClick={() => setFormData({})}>
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
