import {
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Table,
  Modal,
} from "antd";
import {
  CloseCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const { Option } = Select;

const DetailArticlePage = () => {
  const [authors, setAuthors] = useState([
    { id: 1, mssvMsgv: "", full_name: "", role: "", institution: "" },
    { id: 2, mssvMsgv: "", full_name: "", role: "", institution: "" },
    { id: 3, mssvMsgv: "", full_name: "", role: "", institution: "" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [requestContent, setRequestContent] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = (e) => {
      const file = e.target.files[0];
      setSelectedFile(file.name);
    };
    input.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        id: authors.length + 1,
        mssvMsgv: "",
        full_name: "",
        role: "",
        institution: "",
      },
    ]);
  };

  const handleRemoveAuthor = (index) => {
    const newAuthors = authors.filter((_, i) => i !== index);
    setAuthors(newAuthors);
  };

  const handleAuthorChange = (index, field, value) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index][field] = value;
    setAuthors(updatedAuthors);
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "MSSV/MSGV",
      dataIndex: "mssvMsgv",
      key: "mssvMsgv",
    },
    {
      title: "Tên SV/GV",
      dataIndex: "full_name",
      key: "full_name",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "CQ công tác",
      dataIndex: "institution",
      key: "institution",
    },
  ];

  const showEditModal = () => {
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleEditSend = () => {
    // Handle send request logic here
    console.log("Request content:", requestContent);
    setIsEditModalVisible(false);
  };

  const showRejectModal = () => {
    setIsRejectModalVisible(true);
  };

  const handleRejectCancel = () => {
    setIsRejectModalVisible(false);
  };

  const handleRejectSend = () => {
    // Handle send rejection logic here
    console.log("Reject reason:", rejectReason);
    setIsRejectModalVisible(false);
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
            <span>Trang chủ</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">
              Thêm bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 mt-4">
          <div className="flex gap-4">
            {/* Left Column */}
            <div className="w-1/2">
              {/* Khối "Nhập thông tin" */}
              <section className="flex flex-col bg-white rounded-lg p-4 mb-4">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4 pl-[210px]">
                  Nhập thông tin
                </h2>

                <div className="flex gap-4">
                  <div className="w-1/3 flex justify-center">
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer relative"
                    >
                      <img
                        src={
                          coverImage ||
                          "https://via.placeholder.com/180x200?text=Bìa+Bài+Báo"
                        }
                        alt="Bìa bài báo"
                        className="w-[180px] h-[200px] object-cover border border-gray-300 rounded-lg shadow-md"
                      />
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      disabled
                      className="hidden"
                    />
                  </div>

                  <div className="w-2/3 grid grid-cols-1">
                    <Input
                      className="w-full h-10"
                      placeholder="ID"
                      required
                      readOnly
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Loại bài báo"
                      required
                      readOnly
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Thuộc nhóm"
                      required
                      readOnly
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên bài báo (Tiếng Việt)"
                      required
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4 ml-3">
                  {/* Bên dưới ảnh: 4 input xếp dọc (bằng ảnh) */}
                  <div className="flex flex-col w-[180px] gap-4">
                    <Input
                      className="w-full h-10"
                      placeholder="Ngày công bố"
                      readOnly
                    />

                    <InputNumber
                      className="w-full h-10"
                      placeholder="Số trang"
                      min={1}
                      readOnly
                    />

                    <InputNumber
                      className="w-full h-10"
                      placeholder="Thứ tự"
                      min={1}
                      readOnly
                    />

                    <Input
                      className="w-full h-10"
                      placeholder="Số ISSN / ISBN"
                      readOnly
                    />
                  </div>

                  {/* Bên phải ảnh: 4 input xếp dọc (bằng ID ở trên) */}
                  <div className="flex flex-col gap-4 w-2/3">
                    <Input
                      className="w-full h-10"
                      placeholder="Tên bài báo (Tiếng Anh)"
                      readOnly
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt) "
                      readOnly
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh) "
                      readOnly
                    />

                    <Input
                      className="w-full h-10"
                      placeholder="Tập / quyển (nếu có)"
                      readOnly
                    />
                  </div>
                </div>

                {/* Lưu ý */}
                <div className="mt-2 p-2 text-xs text-gray-700 italic">
                  (<span className="font-bold">LƯU Ý</span>: KHÔNG CẦN đánh chữ
                  <span className="font-bold"> ISSN </span> vào. Với các
                  <span className="font-bold"> TẠP CHÍ </span>, bắt buộc điền
                  chỉ số
                  <span className="font-bold"> ISSN</span>. Cung cấp số
                  <span className="font-bold"> ISSN</span> để việc tra cứu và
                  duyệt nội dung)
                </div>

                <div className="mt-4 ml-3">
                  <TextArea placeholder="Tóm tắt" rows={4} readOnly />
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="w-1/2">
              {/* Khối "Nhập thông tin tác giả" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-4">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Thông tin tác giả
                </h2>
                <div className="mb-4">
                  <Input
                    value={`Số lượng tác giả: ${authors.length}`}
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

              {/* Khối "Nhập thông tin minh chứng" */}
              <section className="flex flex-col bg-white rounded-lg p-9 mb-4 ">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin Minh chứng
                </h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Upload file..."
                    value={selectedFile || ""}
                    readOnly
                  />
                  {selectedFile && (
                    <Button
                      icon={<CloseCircleOutlined />}
                      onClick={handleRemoveFile}
                      danger
                      disabled
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Link công bố bài báo (http://...)"
                    required
                    readOnly
                  />
                  <Input
                    placeholder="Số DOI (vd: http://doi.org/10.1155.2019)"
                    readOnly
                  />
                </div>
                <p className="mt-4 text-xs leading-5 text-black">
                  Minh chứng cần file upload full bài báo và link bài báo. Hệ
                  thống chỉ hỗ trợ file PDF và có kích thước nhỏ hơn 3.5MB.
                  Trường hợp có nhiều hơn 1 file sử dụng nén thành file Zip hoặc
                  file Rar trước khi upload.
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    style={{ backgroundColor: "#FFD700", color: "black" }}
                    onClick={showEditModal}
                  >
                    Yêu cầu chỉnh sửa
                  </Button>
                  <Button
                    style={{ backgroundColor: "#FF0000", color: "white" }}
                    onClick={showRejectModal}
                  >
                    Từ chối
                  </Button>
                  <Button
                    style={{ backgroundColor: "#008000", color: "white" }}
                  >
                    Duyệt bài
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Modal
        title={<div style={{ textAlign: "center" }}>Yêu cầu chỉnh sửa</div>}
        visible={isEditModalVisible}
        onCancel={handleEditCancel}
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
        title={<div style={{ textAlign: "center" }}>Yêu cầu từ chối</div>}
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
  );
};

export default DetailArticlePage;
