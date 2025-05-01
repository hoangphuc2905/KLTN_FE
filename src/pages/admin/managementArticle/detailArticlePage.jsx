import Header from "../../../components/Header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Table, Button, Modal, message, Spin } from "antd";
import userApi from "../../../api/api";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { FilePdfOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const DetailArticlePage = () => {
  const [paper, setPaper] = useState(null);
  const [authors, setAuthors] = useState([]);
  const { id } = useParams();
  const user_id = localStorage.getItem("user_id");

  const columns = [
    {
      title: "MSSV/MSGV",
      dataIndex: "mssvMsgv",
      key: "mssvMsgv",
      width: 150,
      ellipsis: true,
    },
    {
      title: "Tên sinh viên/giảng viên (VI)",
      dataIndex: "full_name",
      key: "full_name",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Tên sinh viên/giảng viên (EN)",
      dataIndex: "full_name_eng",
      key: "full_name_eng",
      width: 300,
      ellipsis: true,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Cơ quan đứng tên",
      dataIndex: "institution",
      key: "institution",
      width: 150,
      ellipsis: true,
    },
  ];

  const navigate = useNavigate();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [requestContent, setRequestContent] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const showEditModal = () => setIsEditModalVisible(true);
  const handleEditCancel = () => setIsEditModalVisible(false);
  const handleEditSend = async () => {
    try {
      // Notify all authors about the edit request
      authors.forEach(async (author) => {
        const messageData = {
          message_id: uuidv4(),
          message_type: "Request for Edit",
          status: "Pending Response",
          sender_id: user_id,
          sender_model: "Lecturer",
          receiver_id: author.mssvMsgv,
          receiver_model: author.role === "Chính" ? "Lecturer" : "Student",
          paper_id: id,
          content: `Yêu cầu chỉnh sửa bài báo ${paper.title_vn}: ${requestContent}`,
          isread: false,
          time: new Date(),
        };

        await userApi.createMessage(messageData);
      });

      // Update the status of the article to "revision"
      await userApi.updateScientificPaperStatus(id, "revision");
      setPaper((prevPaper) => ({ ...prevPaper, status: "revision" }));

      message.success("Yêu cầu chỉnh sửa đã được gửi thành công!");
      setIsEditModalVisible(false);

      // Navigate to the "revision" tab
      navigate("/admin/management/ariticle");
    } catch (error) {
      console.error("Error sending edit request:", error);
      message.error("Gửi yêu cầu chỉnh sửa thất bại.");
    }
  };
  const showRejectModal = () => setIsRejectModalVisible(true);
  const handleRejectCancel = () => setIsRejectModalVisible(false);
  const handleRejectSend = async () => {
    try {
      // Update the status of the article to "refused"
      await userApi.updateScientificPaperStatus(id, "refused");
      setPaper((prevPaper) => ({ ...prevPaper, status: "refused" }));

      // Notify all authors about the rejection
      authors.forEach(async (author) => {
        const messageData = {
          message_id: uuidv4(),
          message_type: "Rejection",
          status: "Pending Response",
          sender_id: user_id,
          sender_model: "Lecturer",
          receiver_id: author.mssvMsgv,
          receiver_model: author.role === "Chính" ? "Lecturer" : "Student",
          paper_id: id,
          content: `Bài báo "${paper.title_vn}" đã bị từ chối. Lý do: ${rejectReason}`,
          isread: false,
          time: new Date(),
        };

        await userApi.createMessage(messageData);
      });

      message.success("Yêu cầu từ chối đã được gửi thành công!");
      setIsRejectModalVisible(false);
      navigate("/admin/management/ariticle");
    } catch (error) {
      console.error("Error sending rejection request:", error);
      message.error("Gửi yêu cầu từ chối thất bại.");
    }
  };

  const roleMapping = {
    MainAuthor: "Chính",
    CorrespondingAuthor: "Liên hệ",
    MainAndCorrespondingAuthor: "Vừa chính vừa liên hệ",
    Participant: "Tham gia",
  };

  const updateScientificPaperStatus = async (status) => {
    try {
      console.log("ID being sent to API:", id);
      console.log("Status being sent to API:", status);
      await userApi.updateScientificPaperStatus(id, status);
      setPaper((prevPaper) => ({ ...prevPaper, status }));

      if (status === "approved") {
        message.success("Bài báo đã được duyệt thành công!");
        // Notify all authors
        authors.forEach((author) => createMessage(author, id));
        navigate("/admin/management/ariticle");
      }
      if (status === "refused") {
        message.success("Bài báo đã bị từ chối thành công!");
      }
      if (status === "pending") {
        message.success("Bài báo đã được yêu cầu chỉnh sửa thành công!");
      }
    } catch (error) {
      console.error("Error updating paper status:", error);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
      }
      message.error(
        error.response?.data?.message || "Cập nhật trạng thái thất bại."
      );
    }
  };

  useEffect(() => {
    const fetchPaper = async () => {
      try {
        const data = await userApi.getScientificPaperById(id);

        let departmentName = "Không có dữ liệu";
        if (data.department) {
          try {
            const departmentData = await userApi.getDepartmentById(
              data.department
            ); // Call API to get department details
            departmentName =
              departmentData.department_name || "Không có dữ liệu"; // Use department_name
          } catch (error) {
            console.error("Error fetching department details:", error);
          }
        }

        const transformedAuthors =
          data.author?.map((author, index) => {
            const workUnitName =
              author.work_unit_id?.name_vi || "Không có dữ liệu";

            return {
              key: author._id || index, // Ensure a unique key for each row
              id: author._id,
              mssvMsgv: author.user_id || "Không có dữ liệu",
              full_name: author.author_name_vi || "Không có dữ liệu",
              full_name_eng: author.author_name_en || "Không có dữ liệu",
              role: roleMapping[author.role] || "Không có dữ liệu", // Map role to Vietnamese
              institution: workUnitName, // Use extracted work unit name
            };
          }) || [];

        // Transform the API response to match the expected structure
        const transformedPaper = {
          paper_id: data.paper_id || "Không có dữ liệu",
          article_type: data.article_type?.type_name || "Không có dữ liệu",
          article_group: data.article_group?.group_name || "Không có dữ liệu",
          title_vn: data.title_vn || "Không có tiêu đề",
          title_en: data.title_en || "Không có tiêu đề",
          publish_date: new Date(data.publish_date).toLocaleDateString("vi-VN"),
          magazine_vi: data.magazine_vi || "Không có dữ liệu",
          magazine_en: data.magazine_en || "Không có dữ liệu",
          magazine_type: data.magazine_type || "Không có dữ liệu",
          page: data.page || "Không có dữ liệu",
          issn_isbn: data.issn_isbn || "Không có dữ liệu",
          keywords: data.keywords?.split(",").map((k) => k.trim()) || [],
          summary: data.summary || "Không có mô tả",
          department: departmentName,
          cover_image: data.cover_image || "/placeholder.svg",
          file: data.file || "Không có dữ liệu",
          link: data.link || "Không có dữ liệu",
          doi: data.doi || "Không có dữ liệu",
          author_count: data.author_count || 0,
          status: data.status || "Không có dữ liệu",
          featured: data.featured || false,
        };

        setPaper(transformedPaper);
        setAuthors(transformedAuthors);
      } catch (error) {
        console.error("Error fetching scientific paper:", error);
      }
    };
    fetchPaper();
  }, [id]); // Add id as a dependency

  if (!paper) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const createMessage = async (author, paperId) => {
    try {
      // Kiểm tra nếu mssvMsgv bị thiếu
      if (!author.mssvMsgv) {
        console.warn(`Missing mssvMsgv for author: ${author.full_name}`);
        return;
      }

      // Tạo dữ liệu thông báo
      const messageData = {
        message_id: uuidv4(),
        message_type: "Approved",
        status: "Pending Response",
        sender_id: user_id,
        sender_model: "Lecturer",
        receiver_id: author.mssvMsgv,
        receiver_model: author.role === "Chính" ? "Lecturer" : "Student",
        paper_id: paperId,
        content: `Bài báo "${paper.title_vn}" đã được duyệt.`,
        isread: false,
        time: new Date(),
      };

      console.log("Sending message to:", author.mssvMsgv);
      console.log("Message data:", messageData);

      // Gửi thông báo qua API
      await userApi.createMessage(messageData);
      console.log(`Message sent successfully to mssvMsgv: ${author.mssvMsgv}`);
    } catch (error) {
      console.error(
        `Error sending message to mssvMsgv: ${author.mssvMsgv}`,
        error
      );
    }
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen overflow-y-auto">
      <Header />
      <div className="flex flex-col pt-[80px] pb-7 mx-auto w-full max-w-[1563px] px-4 md:px-8 lg:px-24">
        {/* Breadcrumb */}
        <div className="mt-4">
          <div className="flex items-center gap-2 text-gray-600 overflow-x-auto whitespace-nowrap pb-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-4 h-4 md:w-5 md:h-5"
            />
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500 text-sm md:text-base"
            >
              Trang chủ
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900 text-sm md:text-base">
              Kiểm tra bài báo
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-4">
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left Section: Image */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                  <img
                    src={paper.cover_image}
                    alt="Form illustration"
                    className="w-[120px] h-[160px] md:w-[160px] md:h-[200px] max-w-[180px] max-h-[250px] rounded-lg object-cover"
                  />
                  <div className="flex items-center gap-2">
                    {paper.file && (
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={() => window.open(paper.file, "_blank")}
                        className="bg-[#00A3FF]"
                      >
                        Xem File
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right Section: Paper Details */}
                <div className="flex-1">
                  <div className="w-full">
                    <h1 className="text-lg md:text-xl font-bold text-sky-900 mb-2 md:mb-4 break-words">
                      Tên bài báo (Tiếng Việt): {paper.title_vn}
                    </h1>
                    <h2 className="text-base md:text-lg font-medium text-gray-600 mb-2 md:mb-4 break-words">
                      Tên bài báo (Tiếng Anh): {paper.title_en}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-gray-600 text-xs md:text-sm w-full text-justify leading-5 md:leading-6">
                        <span className="font-semibold text-gray-800">
                          Tóm tắt:
                        </span>{" "}
                        {paper.summary}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mt-4">
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          ID bài báo:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.paper_id || "Không có dữ liệu"}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Loại bài báo:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.article_type}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Nhóm bài báo:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.article_group}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Số trang:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371]">
                          {paper.page}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Tạp chí (VN):
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.magazine_vi}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Tạp chí (EN):
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.magazine_en}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Ngày công bố:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371]">
                          {paper.publish_date}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Khoa:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.department}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Loại tạp chí:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.magazine_type}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          ISSN/ISBN:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] overflow-hidden text-ellipsis">
                          {paper.issn_isbn}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-xs md:text-sm text-gray-500">
                          Bài báo tiêu biểu:
                        </p>
                        <p className="text-xs md:text-sm ml-2 font-medium text-[#174371]">
                          {paper.featured ? (
                            <span className="font-semibold">Có</span>
                          ) : (
                            <span className="font-semibold">Không</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex mt-4 items-start flex-wrap">
                      <p className="text-xs md:text-sm text-gray-500 flex-shrink-0">
                        Từ khóa:
                      </p>
                      <p className="text-xs md:text-sm ml-2 font-medium text-[#174371] break-all">
                        {paper.keywords?.join(", ") || "Không có dữ liệu"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin tác giả */}
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <h2 className="text-sm font-medium leading-none text-sky-900 uppercase mb-6">
                Thông tin tác giả
              </h2>
              <div className="mb-6">
                <Input
                  value={`Số lượng tác giả: ${paper.author_count}`}
                  readOnly
                  className="w-[200px]"
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={authors}
                  pagination={false}
                  rowKey="id"
                  scroll={{ x: "max-content" }}
                  className="w-full"
                />
              </div>
            </div>

            {/* Thông tin minh chứng */}
            <div className="bg-white rounded-xl p-4 sm:p-6">
              <h2 className="text-sm font-medium leading-none text-sky-900 uppercase mb-6">
                Thông tin minh chứng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center mb-2">
                    <p className="text-sm text-gray-500 w-28">File:</p>
                    {paper.file ? (
                      <Button
                        type="link"
                        icon={
                          <FilePdfOutlined
                            style={{ fontSize: "18px", color: "#FF4D4F" }}
                          />
                        }
                        onClick={() => window.open(paper.file, "_blank")}
                      >
                        Xem File
                      </Button>
                    ) : (
                      <p className="text-sm ml-2 font-medium text-gray-500">
                        Không có dữ liệu
                      </p>
                    )}
                  </div>
                  <div className="flex items-center mb-2">
                    <p className="text-sm text-gray-500 flex-shrink-0 w-28">
                      Link công bố:
                    </p>
                    <div className="break-all">
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[#174371] hover:underline"
                      >
                        {paper.link || "Không có dữ liệu"}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <p className="text-sm text-gray-500 w-28">Số DOI:</p>
                    <a
                      href={paper.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-[#174371] hover:underline"
                    >
                      {paper.doi || "Không có dữ liệu"}
                    </a>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {/* Phần trạng thái đã được xóa */}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-end gap-4">
                {paper.status === "pending" && (
                  <>
                    <Button
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={showEditModal}
                    >
                      Yêu cầu chỉnh sửa
                    </Button>
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={showRejectModal}
                    >
                      Từ chối
                    </Button>
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => updateScientificPaperStatus("approved")}
                    >
                      Duyệt bài
                    </Button>
                  </>
                )}
                {paper.status === "approved" && (
                  <>
                    <Button
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={showEditModal}
                    >
                      Yêu cầu chỉnh sửa
                    </Button>
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={showRejectModal}
                    >
                      Từ chối
                    </Button>
                  </>
                )}
                {paper.status === "refused" && (
                  <>
                    <Button
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={showEditModal}
                    >
                      Yêu cầu chỉnh sửa
                    </Button>
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => updateScientificPaperStatus("approved")}
                    >
                      Duyệt bài
                    </Button>
                  </>
                )}
                {paper.status === "revision" && (
                  <>
                    <Button
                      className="bg-yellow-500 text-white hover:bg-yellow-600"
                      onClick={showEditModal}
                    >
                      Yêu cầu chỉnh sửa
                    </Button>
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={showRejectModal}
                    >
                      Từ chối
                    </Button>
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={() => updateScientificPaperStatus("approved")}
                    >
                      Duyệt bài
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal cho yêu cầu chỉnh sửa */}
      <Modal
        title={<div className="text-center">Yêu cầu chỉnh sửa</div>}
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={handleEditCancel}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleEditSend}
            className="bg-green-500 hover:bg-green-600"
          >
            Gửi
          </Button>,
        ]}
      >
        <TextArea
          placeholder="Nội dung yêu cầu chỉnh sửa"
          rows={4}
          value={requestContent}
          onChange={(e) => setRequestContent(e.target.value)}
        />
      </Modal>

      {/* Modal cho từ chối */}
      <Modal
        title={<div className="text-center">Yêu cầu từ chối</div>}
        open={isRejectModalVisible}
        onCancel={handleRejectCancel}
        centered
        footer={[
          <Button
            key="cancel"
            onClick={handleRejectCancel}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleRejectSend}
            className="bg-green-500 hover:bg-green-600"
          >
            Gửi
          </Button>,
        ]}
      >
        <TextArea
          placeholder="Lý do từ chối"
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default DetailArticlePage;
