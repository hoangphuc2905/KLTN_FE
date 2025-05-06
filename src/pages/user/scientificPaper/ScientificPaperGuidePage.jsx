import {
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Modal,
  Tabs,
  Upload,
} from "antd";
import {
  CloseCircleOutlined,
  MinusOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { TabPane } = Tabs;

const ScientificPaperGuidePage = () => {
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleIconModalOk = () => {
    setIsIconModalVisible(false);
  };

  const handleIconModalCancel = () => {
    setIsIconModalVisible(false);
  };

  const handleHelpModalOk = () => {
    setIsHelpModalVisible(false);
  };

  const handleHelpModalCancel = () => {
    setIsHelpModalVisible(false);
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="flex flex-col pb-7 pt-[80px] w-full md:max-w-[95%] lg:max-w-[calc(100%-100px)] xl:max-w-[calc(100%-220px)] mx-auto">
        <div className="self-center w-full max-w-[1563px] px-2 sm:px-4 md:px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500"
            >
              Trang chủ
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span
              onClick={() => navigate("/add-scientific-paper")}
              className="cursor-pointer hover:text-blue-500"
            >
              Thêm bài báo nghiên cứu khoa học
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">
              Hướng dẫn thêm bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-2 sm:px-4 mt-4">
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              {/* Khối "Hướng dẫn nhập thông tin" */}
              <section className="flex flex-col bg-white rounded-lg p-3 sm:p-4 md:p-6 mb-3">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Hướng dẫn nhập thông tin
                </h2>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Hướng dẫn ảnh bìa */}
                  <div className="flex flex-col w-full md:w-[260px] items-center md:items-start justify-center mb-4 md:mb-0">
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer relative"
                      aria-label="Upload cover image"
                    >
                      <img
                        src="http://res.cloudinary.com/dm82oo55u/image/upload/v1744787345/article_images/wwtfabrrmiq5yo5r6zwl.png"
                        alt="Bìa bài báo mẫu"
                        className="w-[180px] h-[270px] sm:w-[210px] sm:h-[315px] object-contain border border-gray-300 rounded-lg shadow-md hover:brightness-90 transition duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 text-white font-semibold text-sm rounded-lg transition duration-300">
                        Chọn ảnh
                      </div>
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      aria-hidden="true"
                      disabled
                    />
                    <div className="mt-2 text-sm text-gray-700">
                      <p>
                        <strong>Hướng dẫn:</strong> Tải lên ảnh bìa bài báo
                        (JPG/PNG, tối đa 5MB). Ví dụ: Trang bìa tạp chí, ảnh bìa
                        bài báo hoặc ảnh minh họa liên quan.
                      </p>
                    </div>
                  </div>
                  {/* Hướng dẫn các trường bên cạnh ảnh */}
                  <div className="w-full grid grid-cols-1 md:pl-4">
                    {/* Hướng dẫn Loại bài báo */}
                    <div className="mb-2">
                      <label
                        htmlFor="paperType"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Loại bài báo <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="paperType"
                        className="w-full h-10"
                        placeholder="Tạp chí khoa học kỹ thuật và công nghệ"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Chọn loại bài báo từ danh
                          sách. Ví dụ: "Tạp chí khoa học kỹ thuật và công nghệ".
                          Đảm bảo chọn đúng để tính điểm.
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Nhóm bài báo */}
                    <div className="mb-2">
                      <label
                        htmlFor="paperGroup"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Thuộc nhóm <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="paperGroup"
                        className="w-full h-10"
                        placeholder="Q1"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Chọn nhóm bài báo. Ví dụ:
                          "Q1, Q2, Q3, Q4, None". Nhóm bài báo sẽ ảnh hưởng đến
                          điểm đóng góp.
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Tên bài báo (Tiếng Việt) */}
                    <div className="mb-2">
                      <label
                        htmlFor="titleVn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên bài báo (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <TextArea
                        id="titleVn"
                        className="w-full"
                        placeholder="Nghiên cứu về trí tuệ nhân tạo trong y học"
                        rows={2}
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập tên bài báo tiếng
                          Việt đầy đủ. Ví dụ: "Nghiên cứu về trí tuệ nhân tạo
                          trong y học".
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Tên bài báo (Tiếng Anh) */}
                    <div className="mb-2">
                      <label
                        htmlFor="titleEn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên bài báo (Tiếng Anh)
                      </label>
                      <TextArea
                        id="titleEn"
                        className="w-full"
                        placeholder="Research on Artificial Intelligence in Medicine"
                        rows={2}
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập tên bài báo tiếng Anh
                          (nếu có). Ví dụ: "Research on Artificial Intelligence
                          in Medicine".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  {/* Hướng dẫn các trường bên dưới ảnh */}
                  <div className="flex flex-col w-[260px] gap-4">
                    {/* Hướng dẫn Ngày công bố */}
                    <div>
                      <label
                        htmlFor="publishDate"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Ngày công bố <span style={{ color: "red" }}>*</span>
                      </label>
                      <DatePicker
                        id="publishDate"
                        className="w-full h-10"
                        placeholder="2024-03-15"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Chọn ngày công bố (không
                          được trong tương lai). Ví dụ: 15/03/2025.
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Số trang */}
                    <div>
                      <label
                        htmlFor="pageCount"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số trang <span style={{ color: "red" }}>*</span>
                      </label>
                      <InputNumber
                        id="pageCount"
                        className="w-full h-10"
                        placeholder="15"
                        min={1}
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập số trang bài báo.
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Bài tiêu biểu */}
                    <div className="pb-4">
                      <div className="flex items-center">
                        <label
                          htmlFor="featured"
                          className="text-sm font-medium text-black mr-2"
                        >
                          Bài tiêu biểu
                        </label>
                        <input
                          id="featured"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          disabled
                        />
                      </div>
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Đánh dấu nếu bài báo nổi
                          bật.
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Số ISSN/ISBN */}
                    <div>
                      <label
                        htmlFor="issnIsbn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số ISSN/ISBN <span style={{ color: "red" }}>*</span>
                      </label>
                      <Input
                        id="issnIsbn"
                        className="w-full h-10"
                        placeholder="2525-2267"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập số ISSN/ISBN, không
                          nhập chữ "ISSN" hoặc "ISBN". Ví dụ:{" "}
                          <code className="bg-black text-white px-1 rounded">
                            1234-5678
                          </code>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hướng dẫn các trường bên phải */}
                  <div className="flex flex-col gap-4 w-full pl-4">
                    {/* Hướng dẫn Tên tạp chí/kỷ yếu (Tiếng Việt) */}
                    <div>
                      <label
                        htmlFor="magazineVi"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí/kỷ yếu (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Input
                        id="magazineVi"
                        className="w-full h-10"
                        placeholder="Tạp chí Khoa học Công nghệ"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập tên tạp chí/kỷ yếu
                          tiếng Việt. Ví dụ: "Tạp chí Khoa học Công nghệ".
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Tên tạp chí/kỷ yếu (Tiếng Anh) */}
                    <div>
                      <label
                        htmlFor="magazineEn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí/kỷ yếu (Tiếng Anh)
                      </label>
                      <Input
                        id="magazineEn"
                        className="w-full h-10"
                        placeholder="Journal of Science and Technology"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập tên tạp chí/kỷ yếu
                          tiếng Anh (nếu có). Ví dụ: "Journal of Science and
                          Technology".
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Tập/quyển */}
                    <div>
                      <label
                        htmlFor="magazineType"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tập/quyển (nếu có)
                      </label>
                      <Input
                        id="magazineType"
                        className="w-full h-10"
                        placeholder="T. 50 S. 02 (2021)"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập tập/quyển (nếu có).
                          Ví dụ: "T. 50 S. 02 (2021)". Nếu không có, để trống.
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Khoa/Viện */}
                    <div>
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Khoa/Viện <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="department"
                        className="w-full h-10"
                        placeholder="Khoa Công nghệ Thông tin"
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Chọn Khoa/Viện liên quan.
                          Ví dụ: "Khoa Công nghệ Thông tin".
                        </p>
                      </div>
                    </div>
                    {/* Hướng dẫn Từ khóa */}
                    <div className="pb-2">
                      <label
                        htmlFor="keywords"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Từ khóa <span style={{ color: "red" }}>*</span>
                      </label>
                      <TextArea
                        id="keywords"
                        className="w-full"
                        placeholder="Công cụ hỗ trợ, Học vụ, Ứng dụng web, Ứng dụng trên di động"
                        rows={2}
                        disabled
                      />
                      <div className="mt-1 text-sm text-gray-700">
                        <p>
                          <strong>Hướng dẫn:</strong> Nhập từ khóa, cách nhau
                          bằng dấu phẩy. Ví dụ: "Công cụ hỗ trợ, Học vụ, Ứng
                          dụng web, Ứng dụng trên di động".
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lưu ý */}
                <div className="mt-2 text-xs text-gray-700 italic">
                  (<span className="font-bold">LƯU Ý</span>: KHÔNG CẦN đánh chữ
                  <span className="font-bold"> ISSN </span> vào. Với các
                  <span className="font-bold"> TẠP CHÍ </span>, bắt buộc điền
                  chỉ số
                  <span className="font-bold"> ISSN</span>. Cung cấp số
                  <span className="font-bold"> ISSN</span> để việc tra cứu và
                  duyệt nội dung)
                </div>

                {/* Hướng dẫn Tóm tắt */}
                <div className="mt-4">
                  <label
                    htmlFor="summary"
                    className="block text-sm font-medium text-black pb-1"
                  >
                    Tóm tắt <span style={{ color: "red" }}>*</span>
                  </label>
                  <TextArea
                    id="summary"
                    className="w-full"
                    placeholder="Trường đại học Công nghiệp Tp.HCM là trường thuộc top 10 trường đại học hàng đầu của Việt Nam trong bảng xếp hạng QS năm 2021. Nơi đào tạo đa ngành nghề với cở sở hạ tầng đạt chuẩn và đội ngũ giảng viên có chuyên môn cao. Trường hiện nay có hơn 30,000 sinh viên đang học tập và nghiên cứu. Vì vậy, việc hỗ trợ các công tác học vụ cho sinh viên đang học tập và nghiên cứu tại đây là cấp thiết. Chúng tôi, đề xuất một công cụ có tên là AcadIUH nhằm hỗ trợ cho sinh viên thực hiện các nghiệp vụ học vụ tại trường. Công cụ này chúng tôi tập trung vào 2 phân hệ: Ứng dụng web và ứng dụng cho thiết bị di động. Hai phân hệ này chúng tôi triển khai đồng bộ với nhau nhằm tăng cường khả năng xử lý và truyền tải thông tin kịp thời đến sinh viên. Cả hai phân hệ này chúng tôi tập trung giải quyết các vấn đề như: Đăng ký học phần của sinh viên; Quản lý thời khóa biểu của sinh viên; Kế hoạch học tập của sinh viên; Quản lý kết quả học tập của sinh viên cũng như quản lý công nợ của sinh viên. Chúng tôi chọn lựa công nghệ để triển khai cho cả hai phân hệ trên là: Ngôn ngữ lập trình Java và Javascript, framework React Native, ReactJS, Nodejs và NPM, Spring Boot và Cloud Computing, cơ sở hạ tầng dưới dạng code bằng Terraform (HCL), các công cụ trong CI/CD. AcadIUH sẽ được triển khai cho các sinh viên thuộc bộ môn SE khoa CNTT của trường nhằm đánh giá mức độ hiệu quả của công cụ. Trong tương lai, chúng tôi cũng sẽ phát triển công cụ này với việc tích hợp chúng vào hệ thống PMT và mở rộng cho phạm vi đối tượng sử dụng của công cụ."
                    rows={4}
                    disabled
                  />
                  <div className="mt-1 text-sm text-gray-700">
                    <p>
                      <strong>Hướng dẫn:</strong> Viết tóm tắt ngắn gọn (100-200
                      từ). Ví dụ: "Bài báo nghiên cứu ứng dụng trí tuệ nhân tạo
                      trong chẩn đoán y khoa...".
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="w-full">
              {/* Khối "Hướng dẫn nhập thông tin tác giả" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-3">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Hướng dẫn nhập thông tin tác giả
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center">
                    <Input
                      className="w-20 bg-gray-200 text-center"
                      value="2(0,0,0,0)"
                      readOnly
                    />
                    <div className="ml-2 text-sm text-gray-700">
                      <p>
                        <strong>Hướng dẫn:</strong> Hệ thống tự động đếm số tác
                        giả và vai trò (Chính, Liên hệ, Vừa chính vừa liên hệ,
                        Tham gia).
                      </p>
                    </div>
                  </div>
                  {/* Mẫu hướng dẫn cho hai tác giả */}
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-4 col-span-2"
                    >
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        {/* Hướng dẫn Mã số SV/GV */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`mssvMsgv-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Mã số SV/GV <span style={{ color: "red" }}>*</span>
                          </label>
                          <Input
                            id={`mssvMsgv-${index}`}
                            placeholder="21036541"
                            disabled
                          />
                          <div className="mt-1 text-sm text-gray-700">
                            <p>
                              <strong>Hướng dẫn:</strong> Nhập MSSV/MSGV hoặc
                              CCCD. Ví dụ:{" "}
                              <code className="bg-black text-white px-1 rounded">
                                123456
                              </code>{" "}
                              hoặc{" "}
                              <code className="bg-black text-white px-1 rounded">
                                012345678901
                              </code>
                              .
                            </p>
                          </div>
                        </div>
                        {/* Hướng dẫn Tên SV/GV (Tiếng Việt) */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullName-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên SV/GV (Tiếng Việt){" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <Input
                            id={`fullName-${index}`}
                            placeholder="Huỳnh Hoàng Phúc"
                            disabled
                          />
                          <div className="mt-1 text-sm text-gray-700">
                            <p>
                              <strong>Hướng dẫn:</strong> Tên tự động điền từ
                              MSSV/MSGV. Ví dụ:{" "}
                              <code className="bg-black text-white px-1 rounded">
                                Nguyễn Văn A
                              </code>
                              .
                            </p>
                          </div>
                        </div>
                        {/* Hướng dẫn Tên SV/GV (Tiếng Anh) */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullNameEng-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên SV/GV (Tiếng Anh)
                          </label>
                          <Input
                            id={`fullNameEng-${index}`}
                            placeholder="Hoang Phuc Huynh"
                            disabled
                          />
                          <div className="mt-1 text-sm text-gray-700">
                            <p>
                              <strong>Hướng dẫn:</strong> Tên tiếng Anh tự động
                              tạo. Ví dụ: "Van A Nguyen".
                            </p>
                          </div>
                        </div>
                        {/* Button xóa */}
                        <div className="col-span-1 flex items-center justify-end pt-5">
                          <Button
                            icon={<MinusOutlined />}
                            size="small"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        {/* Hướng dẫn Vai trò */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`role-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Vai trò <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id={`role-${index}`}
                            className="w-full"
                            placeholder="Chính"
                            disabled
                          >
                            <Option value="MainAuthor">Chính</Option>
                            <Option value="CorrespondingAuthor">Liên hệ</Option>
                            <Option value="MainAndCorrespondingAuthor">
                              Vừa chính vừa liên hệ
                            </Option>
                            <Option value="Participant">Tham gia</Option>
                          </Select>
                          <div className="mt-1 text-sm text-gray-700">
                            <p>
                              <strong>Hướng dẫn:</strong> Chọn vai trò trong lựa
                              chọn
                            </p>
                          </div>
                        </div>
                        {/* Hướng dẫn CQ công tác */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`institution-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            CQ công tác <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id={`institution-${index}`}
                            className="w-full"
                            placeholder="IUH"
                            disabled
                          />
                          <div className="mt-1 text-sm text-gray-700">
                            <p>
                              <strong>Hướng dẫn:</strong> Chọn cơ quan công tác
                              hoặc thêm mới. Ví dụ: "IUH".
                            </p>
                          </div>
                        </div>
                        {/* Hướng dẫn Điểm đóng góp */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`contribution-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Điểm đóng góp
                          </label>
                          <Input
                            id={`contribution-${index}`}
                            className="w-1/2 text-center"
                            readOnly
                            value="6.5"
                          />
                          <div className="mt-1 text-sm text-gray-700">
                            <p>
                              <strong>Hướng dẫn:</strong> Hệ thống tự tính điểm.
                              Ví dụ: 2.5 điểm cho tác giả chính.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <h2 className="col-span-2 text-xs text-red-700 italic">
                    (Nếu tác giả không có MSSV/MSGV, vui lòng điền CCCD)
                  </h2>
                  <Button icon={<PlusOutlined />} disabled>
                    Thêm tác giả
                  </Button>
                </div>
              </section>

              {/* Khối "Hướng dẫn nhập thông tin minh chứng" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-4">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Hướng dẫn nhập thông tin minh chứng
                </h2>
                {/* Hướng dẫn Tải lên file */}
                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-black pb-1"
                  >
                    Tải lên file <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="file-upload"
                      placeholder="Bài báo nghiên cứu.pdf"
                      readOnly
                    />
                    <Button type="primary" disabled>
                      Choose
                    </Button>
                    <Button icon={<CloseCircleOutlined />} danger disabled />
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    <p>
                      <strong>Hướng dẫn:</strong> Tải lên file PDF (tối đa
                      3.5MB). Nén thành ZIP/RAR nếu có nhiều file. Ví dụ:
                      "research_paper.pdf".
                    </p>
                  </div>
                </div>
                {/* Hướng dẫn Link và DOI */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Hướng dẫn Link công bố */}
                  <div>
                    <label
                      htmlFor="link"
                      className="block text-sm font-medium text-black pb-1"
                    >
                      Link công bố bài báo{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Input
                      id="link"
                      placeholder="https://jst.iuh.edu.vn/index.php/jst-iuh/article/view/979"
                      disabled
                    />
                    <div className="mt-1 text-sm text-gray-700">
                      <p>
                        <strong>Hướng dẫn:</strong> Nhập link bài báo. Ví dụ:{" "}
                        <code className="bg-black text-white px-1 rounded">
                          http://journal.example.com/paper123
                        </code>
                        .
                      </p>
                    </div>
                  </div>
                  {/* Hướng dẫn Số DOI */}
                  <div>
                    <label
                      htmlFor="doi"
                      className="block text-sm font-medium text-black pb-1"
                    >
                      Số DOI
                    </label>
                    <Input
                      id="doi"
                      placeholder="https://doi.org/10.46242/jst-iuh.v50i08.979"
                      disabled
                    />
                    <div className="mt-1 text-sm text-gray-700">
                      <p>
                        <strong>Hướng dẫn:</strong> Nhập DOI (nếu có). Ví dụ:{" "}
                        <code className="bg-black text-white px-1 rounded">
                          http://doi.org/10.1155.2019
                        </code>
                        .
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-black">
                  Minh chứng cần file upload full bài báo và link bài báo. Hệ
                  thống chỉ hỗ trợ file PDF và có kích thước nhỏ hơn 3.5MB.
                  Trường hợp có nhiều hơn 1 file sử dụng nén thành file Zip hoặc
                  file Rar trước khi upload.
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    type="primary"
                    onClick={() => navigate("/add-scientific-paper")}
                  >
                    Bắt đầu thêm bài báo
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal for icon click */}
      <Modal
        title={
          <span className="text-sm sm:text-base">
            Sử dụng AI để nhận diện thông tin
          </span>
        }
        visible={isIconModalVisible}
        onOk={handleIconModalOk}
        onCancel={handleIconModalCancel}
        footer={[
          <Button
            key="confirm"
            type="primary"
            onClick={handleIconModalOk}
            size="middle"
            className="text-xs sm:text-sm"
          >
            Xác nhận
          </Button>,
        ]}
        className="responsive-modal"
      >
        <div className="relative">
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={<span className="text-xs sm:text-sm">Upload hình ảnh</span>}
              key="1"
            >
              <Upload
                name="image"
                listType="picture"
                showUploadList={false}
                disabled
              >
                <Button
                  icon={<UploadOutlined />}
                  className="text-xs sm:text-sm"
                  disabled
                >
                  Tải ảnh lên
                </Button>
              </Upload>
              <div className="mt-4 text-xs text-red-700">
                <span className="font-bold">LƯU Ý:</span> Hệ thống chỉ hỗ trợ
                file hình ảnh có định dạng JPG, PNG và kích thước nhỏ hơn 5MB.
              </div>
            </TabPane>
            <TabPane
              tab={<span className="text-xs sm:text-sm">Nhập link</span>}
              key="2"
            >
              <Input
                placeholder="Nhập link"
                className="text-xs sm:text-sm"
                disabled
              />
              <div className="mt-4 text-xs text-red-700">
                <span className="font-bold">LƯU Ý:</span> Hệ thống chỉ hỗ trợ
                khi bạn truyền, nhập đúng đường dẫn bài nghiên cứu.
              </div>
            </TabPane>
          </Tabs>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3409/3409542.png"
            alt="Help Icon"
            className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 m-2 cursor-pointer"
            onClick={() => setIsHelpModalVisible(true)}
          />
        </div>
      </Modal>

      <Modal
        title={<span className="text-sm sm:text-base">Hướng dẫn</span>}
        visible={isHelpModalVisible}
        onOk={handleHelpModalOk}
        onCancel={handleHelpModalCancel}
        footer={[
          <Button
            key="confirm"
            type="primary"
            onClick={handleHelpModalOk}
            size="middle"
            className="text-xs sm:text-sm"
          >
            Đóng
          </Button>,
        ]}
        className="responsive-modal"
      >
        <div className="text-xs sm:text-sm">
          <p>
            Nếu bạn cần thêm thông tin chi tiết, vui lòng liên hệ quản trị viên
            qua mục "Hỗ trợ" trong menu.
          </p>
          <p>Bạn cũng có thể gửi email đến support@example.com.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ScientificPaperGuidePage;
