import { useEffect, useState } from "react";
import userApi from "../api/api";
import Header from "./header";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("Thiếu user_id");
        return;
      }

      try {
        const response = await userApi.getNotifications(user_id);
        setNotifications(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin thông báo:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thông báo</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          {notifications.length > 0 ? (
            <ul>
              {notifications.map((notification, index) => (
                <li key={index} className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {notification.title}
                  </h3>
                  <p className="text-gray-600">{notification.message}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(notification.date).toLocaleDateString("vi-VN")}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Không có thông báo nào.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
