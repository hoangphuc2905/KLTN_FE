import { useEffect, useState } from "react";
import userApi from "../api/api";
import Header from "./header";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const user_id = localStorage.getItem("user_id");
      const user_role = localStorage.getItem("current_role");
      if (!user_id) {
        console.error("Thiếu user_id");
        return;
      }

      try {
        const [notificationsResponse, messagesResponse] = await Promise.all([
          userApi.getMessagesByReceiverId(user_id),
        ]);

        let allNotifications = [
          ...(notificationsResponse || []),
          ...(messagesResponse || []),
        ];

        // Filter notifications based on user roles
        if (
          ![
            "head_of_department",
            "deputy_head_of_department",
            "department_in_charge",
          ].includes(user_role)
        ) {
          allNotifications = allNotifications.filter(
            (notification) =>
              notification.message_type !== "Request for Approval"
          );
        }

        setNotifications(allNotifications);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin thông báo:", error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Header />
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Thông báo</h2>
        {notifications.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {notifications.map((notification, index) => (
              <div key={index} className="p-4 rounded-lg shadow-md bg-white">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {notification.message_type === "Request for Approval"
                    ? "Yêu cầu phê duyệt"
                    : notification.message_type || "Thông báo"}
                </h3>
                <p className="text-gray-600 mb-2">{notification.content}</p>
                <p className="text-sm text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Không có thông báo nào.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
