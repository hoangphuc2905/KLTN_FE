import { Button, Input, Select, DatePicker, InputNumber, message } from "antd";
import {
  CloseCircleOutlined,
  MinusOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import userApi from "../../../api/api";

const { Option } = Select;

const AddScientificPaperPage = () => {
  const [authors, setAuthors] = useState([
    { id: 1, mssvMsgv: "", full_name: "", role: "", institution: "" },
    { id: 2, mssvMsgv: "", full_name: "", role: "", institution: "" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);

  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const types = await userApi.getAllPaperTypes();
        const groups = await userApi.getAllPaperGroups();

        setPaperTypes(types);
        setPaperGroups(groups);
      } catch (error) {
        console.error("Error fetching paper types or groups:", error);
        message.error("Không thể tải dữ liệu loại bài báo hoặc nhóm bài báo.");
      }
    };

    fetchPaperData();
  }, []);

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

  const handleSave = () => {
    console.log("Danh sách tác giả:", authors);
    console.log("File đã chọn:", selectedFile);
    message.success("Lưu thành công!");
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
                    <Input
                      className="w-full h-10 bg-gray-200"
                      placeholder="ID"
                      required
                      readOnly
                    />
                    <Select
                      className="w-full h-10"
                      placeholder="Loại bài báo"
                      required
                    >
                      {paperTypes.map((type) => (
                        <Option key={type.id} value={type.id}>
                          {type.type_name}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      className="w-full h-10"
                      placeholder="Thuộc nhóm"
                      required
                    >
                      {paperGroups.map((group) => (
                        <Option key={group.id} value={group.id}>
                          {group.group_name}
                        </Option>
                      ))}
                    </Select>
                    <Input
                      className="w-full h-10"
                      placeholder="Tên bài báo (Tiếng Việt)"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-4 ml-3">
                  {/* Bên dưới ảnh: 4 input xếp dọc (bằng ảnh) */}
                  <div className="flex flex-col w-[180px] gap-4">
                    <DatePicker
                      className="w-full h-10"
                      placeholder="Ngày công bố"
                    />

                    <InputNumber
                      className="w-full h-10"
                      placeholder="Số trang"
                      min={1}
                    />

                    <InputNumber
                      className="w-full h-10"
                      placeholder="Thứ tự"
                      min={1}
                    />

                    <Input
                      className="w-full h-10"
                      placeholder="Số ISSN / ISBN"
                    />
                  </div>

                  {/* Bên phải ảnh: 4 input xếp dọc (bằng ID ở trên) */}
                  <div className="flex flex-col gap-4 w-2/3">
                    <Input
                      className="w-full h-10"
                      placeholder="Tên bài báo (Tiếng Anh)"
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt) "
                    />
                    <Input
                      className="w-full h-10"
                      placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh) "
                    />

                    <Input
                      className="w-full h-10"
                      placeholder="Tập / quyển (nếu có)"
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
                  <TextArea placeholder="Tóm tắt" rows={4} />
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="w-1/2">
              {/* Khối "Nhập thông tin tác giả" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-4 h-[370px]">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin TÁC GIẢ
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {authors.map((author, index) => (
                    <div
                      key={author.id}
                      className="grid grid-cols-6 gap-4 col-span-2"
                    >
                      <Input
                        placeholder="MSSV/MSGV"
                        value={author.mssvMsgv}
                        onChange={(e) =>
                          handleAuthorChange(index, "mssvMsgv", e.target.value)
                        }
                        required
                      />
                      <Input
                        className="col-span-2"
                        placeholder="Tên sinh viên / giảng viên"
                        value={author.full_name}
                        readOnly
                      />

                      <Select
                        placeholder="Vai trò"
                        value={author.role}
                        onChange={(value) =>
                          handleAuthorChange(index, "role", value)
                        }
                        required
                      >
                        <Option value="primary">Chính</Option>
                        <Option value="corresponding">Liên hệ</Option>
                        <Option value="primaryCorresponding">
                          Vừa chính vừa liên hệ
                        </Option>
                        <Option value="contributor">Tham gia</Option>
                      </Select>
                      <Input
                        placeholder="CQ công tác"
                        value={author.institution}
                        readOnly
                      />
                      <Button
                        icon={<MinusOutlined />}
                        onClick={() => handleRemoveAuthor(index)}
                        size="small"
                      />
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
                  />
                  <Input placeholder="Số DOI (vd: http://doi.org/10.1155.2019)" />
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
    </div>
  );
};

export default AddScientificPaperPage;
