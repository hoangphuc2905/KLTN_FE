import Header from "../../../components/header";
import { Download } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Table, Select, Button, Modal } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

const DetailArticlePage = () => {
  const [paper, setPaper] = useState({
    article_type: "Báo khoa học trẻ Việt Nam",
    article_group: "Q2",
    title_vn:
      "TÁC ĐỘNG CỦA RỦI RO VỠ NỢ KHU VỰC BẤT ĐỘNG SẢN ĐẾN LỢI NHUẬN VÀ ỔN ĐỊNH NGÂN HÀNG: BẰNG CHỨNG TẠI VIỆT NAM",
    title_en:
      "THE IMPACT OF DEBT BANKRUPTCY RISK IN THE REAL PRODUCTS SECTOR ON BANKING PROFITS AND STABILITY: EVIDENCE FROM VIETNAM",
    publish_date: "01/01/2023",
    magazine_vi: "Tạp chí Khoa học và Công nghệ",
    magazine_en: "Science Magazine",
    magazine_type: "Tạp chí khoa học tổng hợp",
    page: 10,
    issn_isbn: "1234567890",
    keywords: [
      "Rủi ro vỡ nợ, bất động sản, lợi nhuận ngân hàng, ổn định tài chính, X-SCORE, Z-SCORE",
    ],
    summary:
      "Nghiên cứu này xem xét tác động của rủi ro vỡ nợ khu vực bất động sản đến lợinhuận và ổn định tài chính của các ngân hàng thương mại Việt Nam trong giai đoạn 2010-2023. Tác giả sử dụng tích hợp ba cách tiếp cận gồm các ước lượng dữ liệu bảng theo POLS, FEM, REM, 2S-GMM; hồi quy phân vị; PVAR & kiểm định nhân quả Granger và mô hình Zmijewski X-SCORE để đo lường rủi ro vỡ nợ khu vực bất động sản. Kết quả nghiên cứu cho thấy rủi ro vỡ nợ khu vực bất động sản có tác động tiêu cực đến lợi nhuận và ổn định ngân hàng, nhưng mức độ tác động khác nhautại các phân vị khác nhau. Bên cạnh đó, kết quả nghiên cứu còn cho thấylợi nhuận và ổn định ngân hàng có mối quan hệ tíchcực và nhân quả hai chiều.Ngoài ra, các biến kiểm soát đặc thù ngân hàng và vĩ mô đều có tác động đến lợi nhuận và/hoặc ổn định ngân hàng trên hàm hồi quy chung cũng như tất cả các phân vị được xét. Pháthiện của nghiên cứu có ý nghĩa quan trọng đối với các nhà quản lý doanh nghiệp, ngân hàng vàhoạch định chính sách.",
    department: "Công nghệ Thông tin",
    cover_image:
      "https://jst.iuh.edu.vn/public/journals/1/cover_issue_65_en_US.jpg",
    upload_file: "example.pdf",
    publication_link: "http://example.com/publication",
    doi: "http://doi.org/10.1234/example",
    file: "example.pdf",
    link: "http://example.com",
  });

  const [authors, setAuthors] = useState([
    {
      id: 1,
      mssvMsgv: "123456",
      full_name: "Nguyễn Văn A",
      full_name_eng: "Nguyen Van A",
      role: "primary",
      institution: "Trường Đại học A",
    },
    {
      id: 2,
      mssvMsgv: "654321",
      full_name: "Trần Thị B",
      full_name_eng: "Tran Thi B",
      role: "corresponding",
      institution: "Trường Đại học B",
    },
    {
      id: 3,
      mssvMsgv: "789012",
      full_name: "Lê Văn C",
      full_name_eng: "Le Van C",
      role: "contributor",
      institution: "Trường Đại học C",
    },
  ]);

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

  const handleAuthorChange = (index, field, value) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index][field] = value;
    setAuthors(updatedAuthors);
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [requestContent, setRequestContent] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const handleRemoveFile = () => setSelectedFile(null);
  const showEditModal = () => setIsEditModalVisible(true);
  const handleEditCancel = () => setIsEditModalVisible(false);
  const handleEditSend = () => {
    console.log("Edit Request Sent:", requestContent);
    setIsEditModalVisible(false);
  };
  const showRejectModal = () => setIsRejectModalVisible(true);
  const handleRejectCancel = () => setIsRejectModalVisible(false);
  const handleRejectSend = () => {
    console.log("Reject Reason Sent:", rejectReason);
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
                          {paper.title_vn}
                        </h1>
                        <h2 className="text-lg font-medium text-gray-600 mb-4">
                          {paper.title_en}
                        </h2>
                        <p className="text-gray-600 mb-4 text-sm w-[96%] text-justify leading-6">
                          {paper.summary}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-6">
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
                            <p className="text-sm text-gray-500">
                              Ngày công bố:
                            </p>
                            <p className="text-sm ml-2 font-medium text-[#174371]">
                              {paper.publish_date}
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
                      <p className="text-sm ml-2 font-medium text-[#174371]">
                        {paper.link}
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      <p className="text-sm text-gray-500">Số DOI:</p>
                      <p className="text-sm ml-2 font-medium text-[#174371]">
                        {paper.doi}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute right-1 flex justify-end space-x-4">
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
