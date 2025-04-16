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
import Header from "../../../components/Header";
import Footer from "../../../components/footer";
import userApi from "../../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const { Option } = Select;
const { TabPane } = Tabs;

const EditScientificPaperPage = () => {
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
  const [titleVn, setTitleVn] = useState("");
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
  const { id } = useParams(); // Get the paper ID from the URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, groups, departmentsData] = await Promise.all([
          userApi.getAllPaperTypes(),
          userApi.getAllPaperGroups(),
          userApi.getAllDepartments(),
        ]);

        setPaperTypes(types);
        setPaperGroups(groups);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        const paperData = await userApi.getScientificPaperById(id); // Fetch paper data by ID
        setTitleVn(paperData.title_vn || "");
        setTitleEn(paperData.title_en || "");
        setPublishDate(moment(paperData.publish_date)); // Use moment for date formatting
        setMagazineVi(paperData.magazine_vi || "");
        setMagazineEn(paperData.magazine_en || "");
        setMagazineType(paperData.magazine_type || "");
        setPageCount(paperData.page || 0);
        setIssnIsbn(paperData.issn_isbn || "");
        setOrderNo(paperData.order_no || true);
        setFeatured(paperData.featured || true);
        setKeywords(paperData.keywords || "");
        setSummary(paperData.summary || "");
        setSelectedDepartment(paperData.department || "");
        setDoi(paperData.doi || "");
        setCoverImage(paperData.cover_image || "");
        setSelectedFile(paperData.file || "");
        setSelectedPaperType(paperData.article_type?._id || ""); // Handle nested object
        setSelectedPaperGroup(paperData.article_group?._id || ""); // Handle nested object
        setAuthors(
          paperData.author.map((author, index) => ({
            id: index + 1,
            mssvMsgv: author.user_id || "",
            full_name: author.author_name_vi || "",
            full_name_eng: author.author_name_en || "",
            role: author.role || "",
            institution: author.work_unit_id?.name_vi || "",
          }))
        );
        setLink(paperData.link || "");
      } catch (error) {
        console.error("Error fetching paper details:", error);
        message.error("Không thể tải dữ liệu bài báo.");
      }
    };

    if (id) {
      fetchPaperDetails();
    }
  }, [id]);

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

      // Prepare JSON payload
      const payload = {
        article_type: selectedPaperType || "",
        article_group: selectedPaperGroup || "",
        title_vn: titleVn || "",
        title_en: titleEn || "",
        author_count: authorCount,
        authors: authors.map((author) => ({
          user_id: author.mssvMsgv || "",
          author_name_vi: author.full_name || "",
          author_name_en: author.full_name_eng || "",
          role: author.role || "",
          work_unit_id: author.institution || "",
          degree: "Bachelor",
          point: 0,
        })), // Ensure this is an array of objects
        publish_date: publishDate || "",
        magazine_vi: magazineVi || "",
        magazine_en: magazineEn || "",
        magazine_type: magazineType || "",
        page: pageCount || 0,
        issn_isbn: issnIsbn || "",
        file: selectedFile || "",
        link: link || "",
        doi: doi || "",
        status: "revision",
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
      const response = await userApi.updateScientificPaperById(id, payload); // Updated API call
      message.success("Bài báo đã được cập nhật thành công!");
      console.log("Response:", response);
    } catch (error) {
      console.error(
        "Error updating scientific paper:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        message.error(`Lỗi từ server: ${error.response.data.message}`);
      } else {
        message.error("Không thể cập nhật bài báo. Vui lòng thử lại.");
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
              Cập nhật bài báo khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 mt-4">
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              {/* Khối "Nhập thông tin" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-3">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin
                </h2>
                <div className="flex gap-4">
                  {/*Ảnh img bài báo */}
                  <div className="flex justify-center">
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
                        className="w-[260px] h-[315px] object-cover border border-gray-300 rounded-lg shadow-md hover:brightness-90 transition duration-300"
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
                  {/* Các input bên cạnh ảnh */}
                  <div className="w-full grid grid-cols-1 pl-4">
                    {/* Loại bài báo */}
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
                        placeholder="Chọn loại bài báo"
                        required
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={selectedPaperType}
                        onChange={(value) => setSelectedPaperType(value)}
                      >
                        {paperTypes.map((type) => (
                          <Option key={type._id} value={type._id}>
                            {type.type_name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    {/* Nhóm bài báo */}
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
                        placeholder="Chọn nhóm bài báo"
                        required
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={selectedPaperGroup}
                        onChange={(value) => setSelectedPaperGroup(value)}
                      >
                        {paperGroups.map((group) => (
                          <Option key={group._id} value={group._id}>
                            {group.group_name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    {/* Tên(Vn) bài báo */}
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
                        placeholder="Nhập tên bài báo (Tiếng Việt)"
                        rows={2}
                        required
                        onChange={(e) => setTitleVn(e.target.value)}
                        value={titleVn}
                      />
                    </div>
                    {/* Tên(En) bài báo */}
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
                        placeholder="Tên bài báo (Tiếng Anh)"
                        rows={2} // Adjust the number of rows as needed
                        onChange={(e) => setTitleEn(e.target.value)}
                        value={titleEn}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  {/* Bên dưới ảnh: 4 input xếp dọc (bằng ảnh) */}
                  <div className="flex flex-col w-[260px] gap-4">
                    {/* Ngày cô bố */}
                    <div className="">
                      <label
                        htmlFor="publishDate"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Ngày công bố <span style={{ color: "red" }}>*</span>
                      </label>
                      <DatePicker
                        id="publishDate"
                        className="w-full h-10"
                        placeholder="Ngày công bố"
                        value={publishDate ? moment(publishDate) : null}
                        onChange={(date, dateString) =>
                          setPublishDate(dateString)
                        }
                      />
                    </div>
                    {/* Số trang */}
                    <div className="">
                      <label
                        htmlFor="pageCount"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số trang <span style={{ color: "red" }}>*</span>
                      </label>
                      <InputNumber
                        id="pageCount"
                        className="w-full h-10"
                        placeholder="Số trang"
                        min={1}
                        value={pageCount}
                        onChange={(value) => setPageCount(value)}
                      />
                    </div>
                    {/* Thứ tự */}
                    <div className="pb-7">
                      <label
                        htmlFor="orderNo"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Thứ tự
                      </label>
                      <InputNumber
                        id="orderNo"
                        className="w-full h-10"
                        placeholder="Thứ tự"
                        min={1}
                        value={orderNo}
                        onChange={(value) => setOrderNo(value)}
                      />
                    </div>
                    {/* Bài tiêu biểu */}
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
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          value={featured}
                        />
                      </div>
                    </div>
                    {/* Số ISSN / ISBN */}
                    <div className="">
                      <label
                        htmlFor="issnIsbn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số ISSN / ISBN <span style={{ color: "red" }}>*</span>
                      </label>
                      <Input
                        id="issnIsbn"
                        className="w-full h-10"
                        placeholder="Số ISSN / ISBN"
                        onChange={(e) => setIssnIsbn(e.target.value)}
                        value={issnIsbn}
                      />
                    </div>
                  </div>

                  {/* Bên phải ảnh: 4 input xếp dọc (bằng ID ở trên) */}
                  <div className="flex flex-col gap-4 w-full pl-4">
                    {/* Tên tạp chí / kỷ yếu (Vn) */}
                    <div className="">
                      <label
                        htmlFor="magazineVi"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí / kỷ yếu (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Input
                        id="magazineVi"
                        className="w-full h-10"
                        placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt)"
                        onChange={(e) => setMagazineVi(e.target.value)}
                        value={magazineVi}
                      />
                    </div>
                    {/* Tên tạp chí / kỷ yếu (En) */}
                    <div className="">
                      <label
                        htmlFor="magazineEn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí / kỷ yếu (Tiếng Anh)
                      </label>
                      <Input
                        id="magazineEn"
                        className="w-full h-10"
                        placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh)"
                        onChange={(e) => setMagazineEn(e.target.value)}
                        value={magazineEn}
                      />
                    </div>
                    {/* Tập / quyển */}
                    <div className="">
                      <label
                        htmlFor="magazineType"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tập / quyển (nếu có)
                      </label>
                      <Input
                        id="magazineType"
                        className="w-full h-10"
                        placeholder="Tập / quyển (nếu có)"
                        onChange={(e) => setMagazineType(e.target.value)}
                        value={magazineType}
                      />
                    </div>
                    {/* Khoa / viện */}
                    <div className="">
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Khoa / Viện <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="department"
                        className="w-full h-10"
                        placeholder="Chọn Khoa / Viện"
                        required
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={selectedDepartment}
                        onChange={(value) => setSelectedDepartment(value)}
                      >
                        {departments.map((department) => (
                          <Option key={department._id} value={department._id}>
                            {department.department_name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    {/* Từ khóa */}
                    <div className="pb-2">
                      <label
                        htmlFor="keywords"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Từ khóa <span style={{ color: "red" }}>*</span>
                      </label>
                      <TextArea
                        id="keywords"
                        placeholder="Nhập từ khóa"
                        rows={2}
                        onChange={(e) => setKeywords(e.target.value)}
                        value={keywords}
                      />
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

                <div className="mt-4">
                  <label
                    htmlFor="summary"
                    className="block text-sm font-medium text-black pb-1"
                  >
                    Tóm tắt <span style={{ color: "red" }}>*</span>
                  </label>
                  <TextArea
                    id="summary"
                    placeholder="Nhập tóm tắt"
                    rows={4}
                    onChange={(e) => setSummary(e.target.value)}
                    value={summary}
                  />
                </div>
              </section>
            </div>

            <div className="w-full">
              {/* Khối "Nhập thông tin tác giả" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-3">
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
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        {/* Mã số SV /GV */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`mssvMsgv-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Mã số SV/GV <span style={{ color: "red" }}>*</span>
                          </label>
                          <Input
                            id={`mssvMsgv-${index}`}
                            placeholder="MSSV/MSGV"
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
                        </div>
                        {/* Tên SV /GV Vn */}
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
                            placeholder="Tên sinh viên / giảng viên"
                            value={author.full_name}
                            readOnly
                          />
                        </div>
                        {/* Tên SV /GV En */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullNameEng-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên sinh viên / giảng viên (English)
                          </label>
                          <Input
                            id={`fullNameEng-${index}`}
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
                        </div>
                        {/* Button xóa */}
                        <div className="col-span-1 flex items-center justify-end pt-5">
                          <Button
                            icon={<MinusOutlined />}
                            onClick={() => handleRemoveAuthor(index)}
                            size="small"
                          />
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        <div className="col-span-3"></div>
                        {/* Vai trò */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`role-${index}`}
                            className="block text-sm font-medium text-blackpb-1"
                          >
                            Vai trò <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id={`role-${index}`}
                            className="w-full"
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
                        </div>
                        {/* CQ công tác */}
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
                            placeholder="CQ công tác"
                            value={author.institution}
                            onChange={(value) =>
                              handleAuthorChange(index, "institution", value)
                            }
                            required
                          >
                            {author.institutions?.map((institution) => (
                              <Option
                                key={institution._id}
                                value={institution._id}
                              >
                                {institution.name}
                              </Option>
                            ))}
                          </Select>
                        </div>
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
                {/*File*/}
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
                </div>
                {/* Link và DOI */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Link công bố bài báo */}
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
                      placeholder="Link công bố bài báo (http://...)"
                      required
                      onChange={(e) => setLink(e.target.value)}
                      value={link}
                    />
                  </div>
                  {/* Số DOI */}
                  <div>
                    <label
                      htmlFor="doi"
                      className="block text-sm font-medium text-black pb-1"
                    >
                      Số DOI
                    </label>
                    <Input
                      id="doi"
                      placeholder="Số DOI (vd: http://doi.org/10.1155.2019)"
                      onChange={(e) => setDoi(e.target.value)}
                      value={doi}
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-black">
                  Minh chứng cần file upload full bài báo và link bài báo. Hệ
                  thống chỉ hỗ trợ file PDF và có kích thước nhỏ hơn 3.5MB.
                  Trường hợp có nhiều hơn 1 file sử dụng nén thành file Zip hoặc
                  file Rar trước khi upload.
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                  {/*Button xóa trắng*/}
                  <Button type="default" onClick={handleClear}>
                    Xóa trắng
                  </Button>
                  <Button type="primary" onClick={handleSave}>
                    Cập nhật
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

export default EditScientificPaperPage;
