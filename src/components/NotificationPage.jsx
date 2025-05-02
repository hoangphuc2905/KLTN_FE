import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Spin } from "antd"; // Import Spin from Ant Design
import userApi from "../api/api";
import Header from "./Header";
import Footer from "./Footer";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false); // Add state to toggle view
  const [activeTab, setActiveTab] = useState("all"); // Add state for active tab
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate(); // Initialize navigate

  const translateMessageType = (messageType) => {
    switch (messageType) {
      case "Request for Edit":
        return "Yêu cầu chỉnh sửa";
      case "Feedback":
        return "Phản hồi";
      case "Approved":
        return "Đã phê duyệt";
      case "Request for Approval":
        return "Yêu cầu phê duyệt";
      default:
        return "Thông báo";
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true); // Set loading to true
      const user_id = localStorage.getItem("user_id");
      const user_role = localStorage.getItem("current_role");
      if (!user_id) {
        console.error("Thiếu user_id");
        setLoading(false); // Stop loading
        return;
      }

      try {
        const [notificationsResponse, messagesResponse] = await Promise.all([
          userApi.getMessagesByReceiverId(user_id),
        ]);

        console.log("Thông báo chưa đọc:", notificationsResponse);
        console.log("Thông báo đã đọc:", messagesResponse);

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

        if (user_role === "lecturer") {
          allNotifications = allNotifications.filter(
            (notification) =>
              notification.message_type !== "Request for Approval"
          );
        }

        setNotifications(
          allNotifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (error) {
        console.error("Lỗi khi lấy thông tin thông báo:", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notification) => {
    if (notification.paper_id) {
      try {
        if (notification.message_type === "Request for Edit") {
          navigate(`/scientific-paper/edit/${notification.paper_id._id}`);
        } else if (notification.message_type === "Request for Approval") {
          navigate(
            `/admin/management/ariticle/detail/${notification.paper_id._id}`
          );
        } else {
          navigate(`/scientific-paper/${notification.paper_id._id}`);
        }
        await userApi.markMessageAsRead(notification._id);
        console.log("Đã đánh dấu thông báo là đã đọc:", notification._id);
      } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái thông báo:", error);
      }
    } else {
      console.error("Missing paper_id for notification:", notification);
    }
  };

  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((notification) => !notification.isread)
      : activeTab === "read"
      ? notifications.filter((notification) => notification.isread)
      : notifications;

  return (
    <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
      <div className="flex-grow">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Header />
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Thông báo
          </h2>
          <div className="flex space-x-4 mb-6">
            <button
              className={`px-6 py-2 rounded-full transition-colors duration-300 ${
                activeTab === "all"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("all")}
            >
              Tất cả
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-colors duration-300 ${
                activeTab === "unread"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("unread")}
            >
              Chưa đọc
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-colors duration-300 ${
                activeTab === "read"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab("read")}
            >
              Đã đọc
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {(showAll
                ? filteredNotifications
                : filteredNotifications.slice(0, 5)
              ).map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg shadow-md cursor-pointer ${
                    notification.isread ? "bg-white" : "bg-blue-100"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {translateMessageType(notification.message_type)}
                  </h3>
                  <p className="text-gray-600 mb-2">{notification.content}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(notification.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              ))}
              {!showAll && filteredNotifications.length > 5 && (
                <button
                  className="text-blue-500 mt-4"
                  onClick={() => setShowAll(true)}
                >
                  Xem thêm
                </button>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Không có thông báo nào.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationPage;
