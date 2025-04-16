import { useState } from "react";
import userApi from "../../../api/api";
import { message } from "antd";

// eslint-disable-next-line react/prop-types
const AddWorkProcessPage = ({ onClose }) => {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const workUnitId = Date.now();

      const workUnitResponse = await userApi.createWorkUnit({
        work_unit_id: workUnitId,
        name_vi: formData.workplaceVi,
        name_en: formData.workplaceEn,
        address_vi: formData.addressVi,
        address_en: formData.addressEn,
      });

      await userApi.createUserWork({
        work_unit_id: workUnitResponse.work_unit_id,
        user_id: localStorage.getItem("user_id"),
        start_date: formData.fromDate,
        end_date: formData.toDate,
        role_vi: formData.roleVi,
        role_en: formData.roleEn,
        department: formData.roleEn, 
      });

      console.log("Submitted Data:", formData);
      message.success("Thêm quá trình công tác thành công!");
      onClose();
    } catch (error) {
      console.error("Error submitting data:", error);
      message.error("Thêm quá trình công tác thất bại!");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] border-2">
        <h2 className="text-lg font-semibold text-blue-600 text-center mb-4">
          THÊM QUÁ TRÌNH CÔNG TÁC
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
                className="w-1/2 p-1 border rounded-md text-sm"
              />
              <input
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="w-1/2 p-1 border rounded-md text-sm"
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
                <input
                  type="text"
                  name={nameVi}
                  value={formData[nameVi]}
                  onChange={handleChange}
                  placeholder={`${label} (Tiếng Việt)`}
                  className="w-full p-1 border rounded-md text-sm mb-1"
                />
                <input
                  type="text"
                  name={nameEn}
                  value={formData[nameEn]}
                  onChange={handleChange}
                  placeholder={`${label} (Tiếng Anh)`}
                  className="w-full p-1 border rounded-md text-sm"
                />
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

export default AddWorkProcessPage;
