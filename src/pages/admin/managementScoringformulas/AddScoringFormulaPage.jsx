import { Select, Input, Button, Form, message, DatePicker } from "antd";
import { useState, useCallback } from "react";
import { CloseOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";

const { Option } = Select;

const CRITERIA_OPTIONS = {
  doi: [
    { label: "Có", value: "true" },
    { label: "Không", value: "false" },
  ],
  featured: [
    { label: "Có", value: "true" },
    { label: "Không", value: "false" },
  ],
  article_group: [
    { label: "Q1", value: "Q1" },
    { label: "Q2", value: "Q2" },
    { label: "Q3", value: "Q3" },
    { label: "Q4", value: "Q4" },
    { label: "None", value: "None" },
  ],
  author_role: [
    { label: "Tác giả chính", value: "MainAuthor" },
    { label: "Tham gia", value: "Participant" },
    { label: "Vừa chính vừa liên hệ", value: "MainAndCorrespondingAuthor" },
    { label: "Liên hệ", value: "CorrespondingAuthor" },
  ],
};

const AddScoringFormulaPage = ({ onClose, selectedYear, onAddAttribute }) => {
  const [formData, setFormData] = useState({
    name: "",
    startDate: null,
    endDate: null,
  });
  const [additionalFields, setAdditionalFields] = useState([
    { key: "", value: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Thay đổi hàm này để xử lý cả Select và Input
  const handleAdditionalFieldChange = (index, eOrValue, isSelect = false) => {
    const newFields = [...additionalFields];
    if (isSelect) {
      newFields[index]["key"] = eOrValue;
    } else {
      newFields[index][eOrValue.target.name] = eOrValue.target.value;
    }
    setAdditionalFields(newFields);
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      console.log("Đang gửi yêu cầu, bỏ qua submit mới");
      return;
    }
    setIsSubmitting(true);
    try {
      const values = additionalFields.reduce((acc, field) => {
        let key = field.key;
        // Xử lý giá trị lưu cho từng loại tiêu chí
        if (formData.name === "doi" || formData.name === "featured") {
          if (key === "true" || key === "false") key = key === "true";
        }
        // author_role: đã là tiếng Anh
        // article_group: giữ nguyên
        if (
          field.key !== "" &&
          field.value !== "" &&
          !isNaN(Number(field.value)) &&
          Number(field.value) >= 0 &&
          // Nếu là boolean thì bỏ qua /^\d+$/ check
          (typeof key === "boolean" || !/^\d+$/.test(field.key))
        ) {
          acc[key] = parseFloat(field.value);
        }
        return acc;
      }, {});

      if (!formData.name) {
        message.error("Vui lòng chọn tiêu chí!");
        setIsSubmitting(false);
        return;
      }
      if (!formData.startDate) {
        message.error("Vui lòng chọn ngày bắt đầu!");
        setIsSubmitting(false);
        return;
      }
      if (Object.keys(values).length === 0) {
        message.error("Vui lòng nhập ít nhất một thành phần và hệ số hợp lệ!");
        setIsSubmitting(false);
        return;
      }

      const attributeData = {
        name: formData.name,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        values: values,
      };

      console.log(
        "Final attributeData before sending:",
        JSON.stringify(attributeData, null, 2)
      );

      // Gọi onAddAttribute, KHÔNG gọi API ở đây nữa
      await onAddAttribute(attributeData);

      // Đóng modal
      onClose();
    } catch (error) {
      message.error("Có lỗi khi gửi dữ liệu. Vui lòng kiểm tra lại!");
      console.error("Error submitting data:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, additionalFields, isSubmitting, onAddAttribute, onClose]);

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
          THÊM THUỘC TÍNH TÍNH ĐIỂM
        </h2>

        <Form onFinish={handleSubmit} disabled={isSubmitting}>
          <div className="space-y-4 pt-4">
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
                disabled={isSubmitting}
              >
                <Option value="article_group">Nhóm bài báo</Option>
                <Option value="author_role">Vai trò tác giả</Option>
                <Option value="doi">Doi</Option>
                <Option value="featured">Tiêu biểu</Option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày bắt đầu <span className="text-red-500">(*)</span>
              </label>
              <DatePicker
                value={formData.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                className="w-full"
                format="YYYY-MM-DD"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ngày kết thúc</label>
              <DatePicker
                value={formData.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                className="w-full"
                format="YYYY-MM-DD"
                disabled={isSubmitting}
              />
            </div>

            {additionalFields.map((field, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium">
                  Thành phần - Hệ số <span className="text-red-500">(*)</span>
                </label>
                <div className="flex gap-4">
                  {/* Nếu tiêu chí có option thì dùng Select, không thì Input */}
                  {CRITERIA_OPTIONS[formData.name] ? (
                    <Select
                      name="key"
                      value={field.key}
                      onChange={(value) =>
                        handleAdditionalFieldChange(index, value, true)
                      }
                      placeholder="Thành phần"
                      className="w-1/2"
                      disabled={isSubmitting}
                      allowClear
                    >
                      {CRITERIA_OPTIONS[formData.name].map((opt) => (
                        <Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      name="key"
                      value={field.key}
                      onChange={(e) =>
                        handleAdditionalFieldChange(index, e, false)
                      }
                      placeholder="Thành phần"
                      className="w-1/2"
                      disabled={isSubmitting}
                    />
                  )}
                  <Input
                    name="value"
                    value={field.value}
                    onChange={(e) =>
                      handleAdditionalFieldChange(index, e, false)
                    }
                    placeholder="Hệ số"
                    className="w-1/2"
                    type="number"
                    min={0}
                    disabled={isSubmitting}
                  />
                  <Button
                    icon={<MinusOutlined />}
                    onClick={() => handleRemoveField(index)}
                    size="small"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}

            <Button
              type="dashed"
              onClick={handleAddField}
              className="w-full flex items-center justify-center"
              icon={<PlusOutlined />}
              disabled={isSubmitting}
            >
              Thêm cặp giá trị
            </Button>

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
                disabled={isSubmitting}
              >
                Xóa trắng
              </Button>
              <Button type="primary" htmlType="submit" disabled={isSubmitting}>
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
