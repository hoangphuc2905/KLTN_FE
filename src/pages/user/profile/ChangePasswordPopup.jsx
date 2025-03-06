import { useState } from "react";
import authApi from "../../../api/authApi";

// eslint-disable-next-line react/prop-types
const ChangePasswordPopup = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    try {
      const user_id = localStorage.getItem("user_id");
      const data = {
        user_id,
        oldPassword: currentPassword,
        newPassword,
      };

      await authApi.changePassword(data);
      alert("Đổi mật khẩu thành công");
      onClose();
    } catch (err) {
      setError(err.message || "Đổi mật khẩu thất bại");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-blue-600 text-center mb-4 text-sm">
          ĐỔI MẬT KHẨU
        </h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium text-sm">
              Mật khẩu cũ <span className="text-red-500">(*)</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Nhập mật khẩu cũ"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium text-sm">
              Mật khẩu mới <span className="text-red-500">(*)</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium text-sm">
              Xác nhận mật khẩu <span className="text-red-500">(*)</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              placeholder="Xác nhận lại mật khẩu"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPopup;
