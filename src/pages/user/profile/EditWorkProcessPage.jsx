import { useState, useEffect } from "react";
import userApi from "../../../api/api";
import { message } from "antd";

const EditWorkProcessPage = ({ onClose, refreshData, workProcess }) => {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    workplaceVi: "",
    workplaceEn: "",
    addressVi: "",
    addressEn: "",
    roleVi: "",
    roleEn: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (workProcess) {
      setFormData({
        fromDate: workProcess.start_date || "",
        toDate: workProcess.end_date || "",
        workplaceVi: workProcess.name_vi || "",
        workplaceEn: workProcess.name_en || "",
        addressVi: workProcess.address_vi || "",
        addressEn: workProcess.address_en || "",
        roleVi: workProcess.role_vi || "",
        roleEn: workProcess.role_en || "",
      });
    }
  }, [workProcess]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fromDate) newErrors.fromDate = true;
    if (!formData.workplaceVi) newErrors.workplaceVi = true;
    if (!formData.workplaceEn) newErrors.workplaceEn = true;
    if (!formData.addressVi) newErrors.addressVi = true;
    if (!formData.addressEn) newErrors.addressEn = true;
    if (!formData.roleVi) newErrors.roleVi = true;
    if (!formData.roleEn) newErrors.roleEn = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "roleVi") {
      const roleEn =
        value === "Giảng viên"
          ? "Lecturer"
          : value === "Sinh viên"
          ? "Student"
          : "";
      setFormData({ ...formData, roleVi: value, roleEn });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      message.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      await userApi.updateWorkUnit({
        work_unit_id: workProcess.work_unit_id,
        name_vi: formData.workplaceVi,
        name_en: formData.workplaceEn,
        address_vi: formData.addressVi,
        address_en: formData.addressEn,
      });

      await userApi.updateUserWork({
        work_unit_id: workProcess.work_unit_id,
        user_id: localStorage.getItem("user_id"),
        start_date: formData.fromDate || "",
        end_date: formData.toDate,
        role_vi: formData.roleVi,
        role_en: formData.roleEn,
        department: formData.roleEn,
      });

      message.success("Cập nhật quá trình công tác thành công!");
      refreshData(); // Call the refresh function to reload the table
      onClose();
    } catch (error) {
      console.error("Error updating data:", error);
      message.error("Cập nhật quá trình công tác thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] border-2">
        <h2 className="text-lg font-semibold text-blue-600 text-center mb-4">
          CHỈNH SỬA QUÁ TRÌNH CÔNG TÁC
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Thời gian */}
          <div className="mb-3 flex items-center">
            <label className="w-1/3 text-sm text-gray-700">
              Thời gian <span className="text-red-500">(*)</span>
            </label>
            <div className="w-2/3 flex space-x-2">
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className={`w-1/2 p-1 border rounded-md text-sm ${
                  errors.fromDate ? "border-red-500" : ""
                }`}
              />
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className={`w-1/2 p-1 border rounded-md text-sm ${
                  errors.toDate ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>

          {/* Cơ quan công tác */}
          {[
            {
              label: "Cơ quan công tác",
              nameVi: "workplaceVi",
              nameEn: "workplaceEn",
            },
            {
              label: "Địa chỉ cơ quan",
              nameVi: "addressVi",
              nameEn: "addressEn",
            },
            { label: "Vai trò", nameVi: "roleVi", nameEn: "roleEn" },
          ].map(({ label, nameVi, nameEn }) => (
            <div key={nameVi} className="mb-3 flex items-center">
              <label className="w-1/3 text-sm text-gray-700">
                {label} <span className="text-red-500">(*)</span>
              </label>
              <div className="w-2/3">
                {nameVi === "roleVi" ? (
                  <>
                    <select
                      name="roleVi"
                      value={formData.roleVi}
                      onChange={handleChange}
                      className={`w-full p-1 border rounded-md text-sm mb-1 ${
                        errors.roleVi ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Chọn vai trò</option>
                      <option value="Giảng viên">Giảng viên</option>
                      <option value="Sinh viên">Sinh viên</option>
                    </select>
                    <input
                      type="text"
                      name="roleEn"
                      value={formData.roleEn}
                      readOnly
                      placeholder="Role (English)"
                      className={`w-full p-1 border rounded-md text-sm ${
                        errors.roleEn ? "border-red-500" : ""
                      }`}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      name={nameVi}
                      value={formData[nameVi]}
                      onChange={handleChange}
                      placeholder={`${label} (Tiếng Việt)`}
                      className={`w-full p-1 border rounded-md text-sm mb-1 ${
                        errors[nameVi] ? "border-red-500" : ""
                      }`}
                    />
                    <input
                      type="text"
                      name={nameEn}
                      value={formData[nameEn]}
                      onChange={handleChange}
                      placeholder={`${label} (Tiếng Anh)`}
                      className={`w-full p-1 border rounded-md text-sm ${
                        errors[nameEn] ? "border-red-500" : ""
                      }`}
                    />
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkProcessPage;
