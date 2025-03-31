import Header from "../../../components/header";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Table, Button, Modal, message } from "antd";
import userApi from "../../../api/api";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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
          content: `Yêu cầu chỉnh sửa bài báo "${paper.title_vn}": ${requestContent}`,
          isread: false,
          time: new Date(),
        };

        await userApi.createMessage(messageData);
      });

      message.success("Yêu cầu chỉnh sửa đã được gửi thành công!");
      setIsEditModalVisible(false);
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
    return <div>Loading...</div>;
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
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-5 h-5"
            />
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500"
            >
              Trang chủ
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">Kiểm tra bài báo</span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="col-span-1">
              <div className="bg-white rounded-xl p-6">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <img
                      src={paper.cover_image}
                      alt="Form illustration"
                      className="w-[160px] h-[200px] max-w-[180px] max-h-[250px] rounded-lg"
                    />
                  </div>

                  <div className="flex-1 ml-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-xl font-bold text-sky-900 mb-4">
                          Tên bài báo (Tiếng Việt) : {paper.title_vn}
                        </h1>
                        <h2 className="text-lg font-medium text-gray-600 mb-4">
                          Tên bài báo (Tiếng Anh) : {paper.title_en}
                        </h2>
                        <p className="text-gray-600 mb-4 text-sm w-[96%] text-justify leading-6">
                          <span className="font-semibold text-gray-800">
                            Tóm tắt:
                          </span>{" "}
                          {paper.summary}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">ID bài báo:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.paper_id || "Không có dữ liệu"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Loại bài báo:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.article_type}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Nhóm bài báo:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.article_group}
                            </p>
                          </div>

                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">Số trang:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.page}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Tạp chí (VN):
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.magazine_vi}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Tạp chí (EN):
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.magazine_en}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Ngày công bố:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.publish_date}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">Khoa:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.department}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">
                              Loại tạp chí:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.magazine_type}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">ISSN/ISBN:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.issn_isbn}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-gray-500">Khoa:</p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex mt-4 items-center flex-nowrap overflow-hidden whitespace-nowrap">
                          <p className="text-sm text-gray-500 flex-shrink-0">
                            Từ khóa:
                          </p>
                          <p className="text-sm ml-2 font-medium text-[#174371] truncate">
                            {paper.keywords?.join(", ") || "Không có dữ liệu"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin tác giả */}
              <div className="bg-white rounded-xl p-4 mt-6">
                <section className="flex flex-col bg-white rounded-lg p-6 mb-6">
                  <h2 className="text-sm font-medium leading-none text-black uppercase mb-6">
                    Thông tin tác giả
                  </h2>
                  <div className="mb-6">
                    <Input
                      value={`Số lượng tác giả: ${paper.author_count}`}
                      readOnly
                      className="w-[200px]"
                    />
                  </div>
                  <Table
                    columns={columns}
                    dataSource={authors}
                    pagination={false}
                    rowKey="id"
                  />
                </section>
              </div>

              {/* Thông tin minh chứng + 3 button :yêu cầu chỉnh sửa, từ chối, duyệt bài */}
              <div className="bg-white rounded-xl p-4 mt-6">
                <section className="flex flex-col bg-white rounded-lg p-9 mb-6">
                  <h2 className="text-sm font-medium leading-none text-black uppercase mb-6">
                    Nhập thông tin Minh chứng
                  </h2>

                  <div>
                    <div className="flex items-center mb-4">
                      <p className="text-sm text-gray-500">File:</p>
                      <p className="text-sm ml-2 font-medium text-[#174371]">
                        {paper.file}
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p className="text-sm text-gray-500">Link công bố:</p>
                      <a
                        href={paper.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm ml-2 font-medium text-[#174371] hover:underline"
                      >
                        {paper.link || "Không có dữ liệu"}
                      </a>
                    </div>
                    <div className="flex items-center mb-4">
                      <p className="text-sm text-gray-500">Số DOI:</p>
                      <a
                        href={paper.doi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm ml-2 font-medium text-[#174371] hover:underline"
                      >
                        {paper.doi || "Không có dữ liệu"}
                      </a>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute right-1 flex justify-end space-x-4">
                      {paper.status === "pending" && (
                        <>
                          <Button
                            style={{
                              backgroundColor: "#FFD700",
                              color: "black",
                            }}
                            onClick={showEditModal}
                          >
                            Yêu cầu chỉnh sửa
                          </Button>
                          <Button
                            style={{
                              backgroundColor: "#FF0000",
                              color: "white",
                            }}
                            onClick={showRejectModal}
                          >
                            Từ chối
                          </Button>
                          <Button
                            style={{
                              backgroundColor: "#008000",
                              color: "white",
                            }}
                            onClick={() =>
                              updateScientificPaperStatus("approved")
                            } // Update status to approved
                          >
                            Duyệt bài
                          </Button>
                        </>
                      )}
                      {paper.status === "approved" && (
                        <Button
                          style={{ backgroundColor: "#FFD700", color: "black" }}
                          onClick={showEditModal}
                        >
                          Yêu cầu chỉnh sửa
                        </Button>
                      )}
                      {paper.status === "refused" && (
                        <Button
                          style={{ backgroundColor: "#FFD700", color: "black" }}
                          onClick={showEditModal}
                        >
                          Yêu cầu chỉnh sửa
                        </Button>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <Modal
                title={
                  <div style={{ textAlign: "center" }}>Yêu cầu chỉnh sửa</div>
                }
                visible={isEditModalVisible}
                onCancel={handleEditCancel}
                // centered
                footer={[
                  <Button
                    key="cancel"
                    onClick={handleEditCancel}
                    style={{ backgroundColor: "#FF0000", color: "white" }}
                  >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleEditSend}
                    style={{ backgroundColor: "#008000", color: "white" }}
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

              <Modal
                title={
                  <div style={{ textAlign: "center" }}>Yêu cầu từ chối</div>
                }
                visible={isRejectModalVisible}
                onCancel={handleRejectCancel}
                footer={[
                  <Button
                    key="cancel"
                    onClick={handleRejectCancel}
                    style={{ backgroundColor: "#FF0000", color: "white" }}
                  >
                    Hủy
                  </Button>,
                  <Button
                    key="submit"
                    type="primary"
                    onClick={handleRejectSend}
                    style={{ backgroundColor: "#008000", color: "white" }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailArticlePage;
