import { Button, Input, Select, DatePicker, InputNumber, message } from "antd";
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

const AddScientificPaperPage = () => {
  const [authors, setAuthors] = useState([
    { id: 1, mssvMsgv: "", name: "", role: "", institution: "" },
    { id: 2, mssvMsgv: "", name: "", role: "", institution: "" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application";
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
        name: "",
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
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  // xóa trắng
  const handleClear = () => {};
  const handleSave = () => {
    message.success("Lưu thành công");
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
                  <div className="w-1/3">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/0563f14b44500ff5b83245fb9a6af2b57eb332ec4bbe05eafafe76a4e02af753?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                      alt="Form illustration"
                      className=" w-[180px] h-[200px] max-w-[180px] max-h-[250px] pl-4"
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
                      <Option value="type1">Type 1</Option>
                      <Option value="type2">Type 2</Option>
                    </Select>
                    <Select
                      className="w-full h-10"
                      placeholder="Thuộc nhóm"
                      required
                    >
                      <Option value="group1">Group 1</Option>
                      <Option value="group2">Group 2</Option>
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
                      className="grid grid-cols-5 gap-4 col-span-2"
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
                        placeholder="Tên sinh viên / giảng viên"
                        value={author.name}
                        onChange={(e) =>
                          handleAuthorChange(index, "name", e.target.value)
                        }
                        required
                      />
                      <Select
                        placeholder="Vai trò"
                        value={author.role}
                        onChange={(value) =>
                          handleAuthorChange(index, "role", value)
                        }
                        required
                      >
                        <Option value="role1">Role 1</Option>
                        <Option value="role2">Role 2</Option>
                      </Select>
                      <Input
                        placeholder="CQ công tác"
                        value={author.institution}
                        onChange={(e) =>
                          handleAuthorChange(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        required
                      />
                      <Button
                        icon={<MinusOutlined />}
                        onClick={() => handleRemoveAuthor(index)}
                        size="small"
                      />
                    </div>
                  ))}
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
