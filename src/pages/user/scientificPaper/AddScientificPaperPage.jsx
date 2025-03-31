import {
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
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
import { useEffect, useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { TabPane } = Tabs;

const AddScientificPaperPage = () => {
  const [authors, setAuthors] = useState([
    { id: 1, mssvMsgv: "", full_name: "", role: "", institution: "" },
    { id: 2, mssvMsgv: "", full_name: "", role: "", institution: "" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);
  const [departments, setDepartments] = useState([]); // State for departments
  const [isIconModalVisible, setIsIconModalVisible] = useState(false); // State for icon modal visibility
  const [link, setLink] = useState(""); // State for link input
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // State for help modal visibility
  const [selectedPaperType, setSelectedPaperType] = useState(""); // State for selected paper type
  const [selectedPaperGroup, setSelectedPaperGroup] = useState(""); // State for selected paper group
  const [titleVn, setTitleVn] = useState(""); // State for title in Vietnamese
  const [titleEn, setTitleEn] = useState(""); // State for title in English
  const [publishDate, setPublishDate] = useState(""); // State for publish date
  const [magazineVi, setMagazineVi] = useState(""); // State for magazine name in Vietnamese
  const [magazineEn, setMagazineEn] = useState(""); // State for magazine name in English
  const [magazineType, setMagazineType] = useState(""); // State for magazine type
  const [pageCount, setPageCount] = useState(0); // State for page count
  const [issnIsbn, setIssnIsbn] = useState(""); // State for ISSN/ISBN
  const [orderNo, setOrderNo] = useState(true); // State for order number
  const [featured, setFeatured] = useState(true); // State for featured status
  const [keywords, setKeywords] = useState(""); // State for keywords
  const [summary, setSummary] = useState(""); // State for summary
  const [selectedDepartment, setSelectedDepartment] = useState(""); // State for selected department
  const [doi, setDoi] = useState(""); // State for DOI
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const types = await userApi.getAllPaperTypes();
        const groups = await userApi.getAllPaperGroups();
        const departmentsData = await userApi.getAllDepartments(); // Fetch departments

        setPaperTypes(types);
        setPaperGroups(groups);
        setDepartments(departmentsData); // Set departments
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu.");
      }
    };

    fetchPaperData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await userApi.uploadImage(file); // Call uploadImage function
        setCoverImage(response.url); // Use the uploaded image's URL
        message.success("Ảnh bìa đã được tải lên thành công!");
        console.log("Uploaded image response:", response);
      } catch (error) {
        console.error(
          "Error uploading image:",
          error.response?.data || error.message
        );
        message.error("Không thể tải ảnh bìa lên. Vui lòng thử lại.");
      }
    }
  };

  const handleFileChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const response = await userApi.uploadFile(file); // Call uploadFile function
          setSelectedFile(response.url); // Use the uploaded file's URL
          message.success("File đã được tải lên thành công!");
          console.log("Uploaded file response:", response);
        } catch (error) {
          console.error(
            "Error uploading file:",
            error.response?.data || error.message
          );
          message.error("Không thể tải file lên. Vui lòng thử lại.");
        }
      }
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

  const handleAuthorChange = async (index, field, value) => {
    const updatedAuthors = [...authors];
    updatedAuthors[index][field] = value;

    if (field === "mssvMsgv" && value.trim() !== "") {
      try {
        let userData;

        if (value.startsWith("GV") || value.length === 8) {
          userData = await userApi.getLecturerById(value);
        } else {
          userData = await userApi.getStudentById(value);
        }

        updatedAuthors[index].full_name =
          userData.full_name || userData.name || "";
        updatedAuthors[index].institution =
          userData.department || "Không xác định";
      } catch (error) {
        console.error("Không tìm thấy thông tin:", error);
        updatedAuthors[index].full_name = "";
        updatedAuthors[index].institution = "";
      }
    }

    setAuthors(updatedAuthors);
  };

  const handleClear = () => {
    setAuthors([
      { id: 1, mssvMsgv: "", full_name: "", role: "", institution: "" },
      { id: 2, mssvMsgv: "", full_name: "", role: "", institution: "" },
    ]);
    setSelectedFile(null);
    setCoverImage(null);
    message.info("Đã xóa trắng thông tin.");
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      const requiredFields = {
        coverImage,
        selectedFile,
        authors,
        selectedDepartment,
        summary,
        keywords,
        selectedPaperType,
        selectedPaperGroup,
        titleVn,
        titleEn,
        publishDate,
        magazineVi,
        magazineEn,
        magazineType,
        pageCount,
        issnIsbn,
        doi,
        link,
      };

      const missingFields = Object.entries(requiredFields)
        .filter(
          ([key, value]) =>
            value === null ||
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
        )
        .map(([key]) => key);

      if (missingFields.length > 0) {
        message.error(`Thiếu các trường bắt buộc: ${missingFields.join(", ")}`);
        return;
      }

      // Format author_count
      const roleCounts = {
        primary: 0,
        corresponding: 0,
        primaryCorresponding: 0,
        contributor: 0,
      };
      authors.forEach((author) => {
        if (author.role && roleCounts.hasOwnProperty(author.role)) {
          roleCounts[author.role]++;
        }
      });
      const authorCount = `${authors.length}(${roleCounts.primary},${roleCounts.corresponding},${roleCounts.primaryCorresponding},${roleCounts.contributor})`;

      console.log("Authors:", authors);
      console.log("Selected Department:", selectedDepartment);
      // Prepare JSON payload
      const payload = {
        article_type: selectedPaperType || "",
        article_group: selectedPaperGroup || "",
        title_vn: titleVn || "",
        title_en: titleEn || "",
        author_count: authorCount,
        author: authors.map((author) => ({
          user_id: author.mssvMsgv || "",
          author_name_vi: author.full_name || "",
          author_name_en: author.full_name_eng || "",
          role: author.role || "",
          work_unit_id: author.institution || "",
          degree: "Bachelor",
          point: 0,
        })),
        publish_date: publishDate || "",
        magazine_vi: magazineVi || "",
        magazine_en: magazineEn || "",
        magazine_type: magazineType || "",
        page: pageCount || 0,
        issn_isbn: issnIsbn || "",
        file: selectedFile || "",
        link: link || "",
        doi: doi || "",
        status: "pending",
        order_no: orderNo,
        featured: featured,
        keywords: keywords || "",
        summary: summary || "",
        department: selectedDepartment || "",
        cover_image: coverImage || "",
      };

      // Debugging: Log payload
      console.log("Payload:", payload);

      // Send data to the backend
      const response = await userApi.createScientificPaper(payload);
      message.success("Bài báo đã được lưu thành công!");
      console.log("Response:", response);
    } catch (error) {
      console.error(
        "Error saving scientific paper:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        message.error(`Lỗi từ server: ${error.response.data.message}`);
      } else {
        message.error("Không thể lưu bài báo. Vui lòng thử lại.");
      }
    }
  };

  const showIconModal = () => {
    setIsIconModalVisible(true);
  };

  const handleIconModalOk = () => {
    setIsIconModalVisible(false);
  };

  const handleIconModalCancel = () => {
    setIsIconModalVisible(false);
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
  };

  const handleImageUpload = (info) => {
    if (info.file.status === "done") {
      setUploadedImage(info.file.originFileObj);
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const showHelpModal = () => {
    setIsHelpModalVisible(true);
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
            <span className="font-semibold text-sky-900">
              Thêm bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 mt-4">
          <div className="flex gap-4">
            {/* Left Column */}
            <div className="w-1/2 relative">
              {/* Icon */}
              <img
                src="https://cdn-icons-png.flaticon.com/512/16921/16921785.png"
                alt="AI Technology Icon"
                className="absolute top-0 right-0 w-5 h-5 m-3 cursor-pointer"
                onClick={showIconModal}
              />
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
                        className="w-[180px] h-[200px] object-cover border border-gray-300 rounded-lg shadow-md hover:brightness-90 transition duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 text-white font-semibold text-sm rounded-lg transition duration-300">
                        Chọn ảnh
                      </div>
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="w-2/3 grid grid-cols-1">
                    <Select
                      className="w-full h-10"
                      placeholder="Loại bài báo"
                      required
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) => setSelectedPaperType(value)} // Lưu `_id` vào state
                    >
                      {paperTypes.map((type) => (
                        <Option key={type._id} value={type._id}>
                          {" "}
                          {/* Sử dụng `_id` làm value */}
                          {type.type_name}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      className="w-full h-10"
                      placeholder="Thuộc nhóm"
                      required
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children
                          ?.toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onChange={(value) => setSelectedPaperGroup(value)} // Lưu `_id` vào state
                    >
                      {paperGroups.map((group) => (
                        <Option key={group._id} value={group._id}>
                          {" "}
                          {/* Sử dụng `_id` làm value */}
                          {group.group_name}
                        </Option>
                      ))}
                    </Select>
                    <Input
                      className="w-full h-10"
                      placeholder="Tên bài báo (Tiếng Việt)"
                      suffix={<span style={{ color: "red" }}>*</span>}
                      required
                      onChange={(e) => setTitleVn(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4 ml-3">
                  {/* Bên dưới ảnh: 4 input xếp dọc (bằng ảnh) */}
                  <div className="flex flex-col w-[180px] gap-4">
                    <DatePicker
                      className="w-full h-10"
                      placeholder="Ngày công bố"
                      onChange={(date, dateString) =>
                        setPublishDate(dateString)
                      }
                    />

                    <InputNumber
                      className="w-full h-10"
                      placeholder="Số trang"
                      suffix={<span style={{ color: "red" }}>*</span>}
                      min={1}
                      onChange={(value) => setPageCount(value)}
                    />

                    <InputNumber
                      className="w-full h-10"
                      placeholder="Thứ tự"
                      min={1}
                      onChange={(value) => setOrderNo(value)}
                    />

                    <Input
                      className="w-full h-10"
                      placeholder="Số ISSN / ISBN"
                      suffix={<span style={{ color: "red" }}>*</span>}
                      onChange={(e) => setIssnIsbn(e.target.value)}
                    />
                  </div>

                  {/* Bên phải ảnh: 4 input xếp dọc (bằng ID ở trên) */}
                  <div className="flex flex-col gap-4 w-2/3">
                    <Input
                      className="w-full h-10"
                      placeholder="Tên bài báo (Tiếng Anh)"
                      onChange={(e) => setTitleEn(e.target.value)}
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt) "
                      suffix={<span style={{ color: "red" }}>*</span>}
                      onChange={(e) => setMagazineVi(e.target.value)}
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh) "
                      onChange={(e) => setMagazineEn(e.target.value)}
                    />

                    <Input
                      className="w-full h-10"
                      placeholder="Tập / quyển (nếu có)"
                      onChange={(e) => setMagazineType(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 ml-3">
                  <Select
                    className="w-full h-10"
                    placeholder="Khoa / Viện"
                    required
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option?.children
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(value) => setSelectedDepartment(value)} // Lưu `_id` vào state
                  >
                    {departments.map((department) => (
                      <Option key={department._id} value={department._id}>
                        {" "}
                        {/* Sử dụng `_id` làm value */}
                        {department.department_name}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="mt-4 ml-3">
                  <TextArea
                    placeholder="Từ khóa"
                    rows={1}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
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
                  <TextArea
                    placeholder="Tóm tắt"
                    rows={4}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="w-1/2">
              {/* Khối "Nhập thông tin tác giả" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-3 h-[480px] overflow-y-auto">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin TÁC GIẢ
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center">
                    <Input
                      className="w-20 bg-gray-200 text-center"
                      value={(() => {
                        const counts = {
                          primary: 0,
                          corresponding: 0,
                          primaryCorresponding: 0,
                          contributor: 0,
                        };
                        if (authors.length > 0) {
                          authors.forEach((author) => {
                            if (author.role === "MainAuthor") counts.primary++;
                            if (author.role === "CorrespondingAuthor")
                              counts.corresponding++;
                            if (author.role === "MainAndCorrespondingAuthor")
                              counts.primaryCorresponding++;
                            if (author.role === "Participant")
                              counts.contributor++;
                          });
                        }
                        return `${authors.length}(${counts.primary},${counts.corresponding},${counts.primaryCorresponding},${counts.contributor})`;
                      })()}
                      readOnly
                    />
                  </div>
                  {authors.map((author, index) => (
                    <div
                      key={author.id || index}
                      className="grid grid-cols-6 gap-4 col-span-2"
                    >
                      {/* Row 1 */}
                      <div className="grid grid-cols-6 gap-4 col-span-6">
                        <Input
                          placeholder="MSSV/MSGV"
                          suffix={<span style={{ color: "red" }}>*</span>}
                          value={author.mssvMsgv}
                          onChange={(e) =>
                            handleAuthorChange(
                              index,
                              "mssvMsgv",
                              e.target.value
                            )
                          }
                          required
                        />
                        <Input
                          className="col-span-2"
                          placeholder="Tên sinh viên / giảng viên"
                          value={author.full_name}
                          suffix={<span style={{ color: "red" }}>*</span>}
                          readOnly
                        />
                        <Input
                          className="col-span-2"
                          placeholder="Tên sinh viên / giảng viên (English)"
                          value={author.full_name_eng}
                          onChange={(e) =>
                            handleAuthorChange(
                              index,
                              "full_name_eng",
                              e.target.value
                            )
                          }
                        />
                        <Button
                          icon={<MinusOutlined />}
                          onClick={() => handleRemoveAuthor(index)}
                          size="small"
                        />
                      </div>
                      {/* Row 2 */}
                      <div className="grid grid-cols-5 gap-4 col-span-6 mt-2 ml-24">
                        <Select
                          className="col-span-2"
                          placeholder="Vai trò"
                          value={author.role}
                          onChange={(value) =>
                            handleAuthorChange(index, "role", value)
                          }
                          required
                        >
                          <Option value="MainAuthor">Chính</Option>
                          <Option value="CorrespondingAuthor">Liên hệ</Option>
                          <Option value="MainAndCorrespondingAuthor">
                            Vừa chính vừa liên hệ
                          </Option>
                          <Option value="Participant">Tham gia</Option>
                        </Select>
                        <Input
                          className="col-span-2"
                          placeholder="CQ công tác"
                          suffix={<span style={{ color: "red" }}>*</span>}
                          value={author.institution}
                          readOnly
                        />
                      </div>
                    </div>
                  ))}
                  <h2 className="col-span-2 text-xs text-red-700 italic">
                    (Nếu tác giả không có MSSV/MSGV, vui lòng điền CCCD)
                  </h2>
                  <Button icon={<PlusOutlined />} onClick={handleAddAuthor}>
                    Thêm tác giả
                  </Button>
                </div>
              </section>

              {/* Khối "Nhập thông tin minh chứng" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-4">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin Minh chứng
                </h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Upload file..."
                    value={selectedFile || ""}
                    readOnly
                  />
                  <Button type="primary" onClick={handleFileChange}>
                    Choose
                  </Button>
                  {selectedFile && (
                    <Button
                      icon={<CloseCircleOutlined />}
                      onClick={handleRemoveFile}
                      danger
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Link công bố bài báo (http://...)"
                    required
                    onChange={(e) => setLink(e.target.value)}
                  />
                  <Input
                    placeholder="Số DOI (vd: http://doi.org/10.1155.2019)"
                    onChange={(e) => setDoi(e.target.value)}
                  />
                </div>
                <p className="mt-4 text-xs leading-5 text-black">
                  Minh chứng cần file upload full bài báo và link bài báo. Hệ
                  thống chỉ hỗ trợ file PDF và có kích thước nhỏ hơn 3.5MB.
                  Trường hợp có nhiều hơn 1 file sử dụng nén thành file Zip hoặc
                  file Rar trước khi upload.
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button type="primary" onClick={handleClear}>
                    Xóa trắng
                  </Button>
                  <Button type="primary" onClick={handleSave}>
                    Lưu
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
        title="Sử dụng AI để nhận diện thông tin"
        visible={isIconModalVisible}
        onOk={handleIconModalOk}
        onCancel={handleIconModalCancel}
        footer={[
          <Button key="confirm" type="primary" onClick={handleIconModalOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <div className="relative">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Upload hình ảnh" key="1">
              <Upload
                name="image"
                listType="picture"
                showUploadList={false}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setUploadedImage(event.target.result);
                  };
                  reader.readAsDataURL(file);
                  return false; // Prevent upload
                }}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  style={{ marginTop: 16, width: "100%" }}
                />
              )}
              <div className="mt-4 text-xs text-red-700">
                <span className="font-bold">LƯU Ý:</span> Hệ thống chỉ hỗ trợ
                file hình ảnh có định dạng JPG, PNG và kích thước nhỏ hơn 5MB.
              </div>
            </TabPane>
            <TabPane tab="Nhập link" key="2">
              <Input
                placeholder="Nhập link"
                value={link}
                onChange={handleLinkChange}
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
            className="absolute top-0 right-0 w-6 h-6 m-2 cursor-pointer"
            onClick={showHelpModal}
          />
        </div>
      </Modal>

      <Modal
        title="Hướng dẫn"
        visible={isHelpModalVisible}
        onOk={handleHelpModalOk}
        onCancel={handleHelpModalCancel}
        footer={[
          <Button key="confirm" type="primary" onClick={handleHelpModalOk}>
            Đóng
          </Button>,
        ]}
      >
        <p>Đây là hướng dẫn sử dụng hệ thống.</p>
        <p>Vui lòng làm theo các bước sau để hoàn thành việc nhập thông tin.</p>
        {/* Add more instructions as needed */}
      </Modal>
    </div>
  );
};

export default AddScientificPaperPage;
