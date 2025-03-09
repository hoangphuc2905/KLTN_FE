import { Button, Input, Upload, Select, DatePicker, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import  { useState } from "react";
import Header from "../../../components/header";

const AddScientificPaperPage = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [authors, setAuthors] = useState([
    { id: 1, mssvMsgv: "", name: "", role: "", institution: "" },
  ]);

  const handleUploadChange = (info) => {
    if (info.file.status === "done") {
      const url = URL.createObjectURL(info.file.originFileObj);
      setImageUrl(url);
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
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

  const handleAuthorChange = (index, field, value) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

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

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex gap-6">
            {/* Khối "Nhập thông tin" */}
            <div className="w-1/3 bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
              <div className="flex justify-center items-start">
                <Upload
                  name="bookCover"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  onChange={handleUploadChange}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Book Cover"
                      className="w-[250px] h-[320px] object-cover rounded-lg"
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input placeholder="ID" readOnly />
                <Select placeholder="Loại bài báo" className="w-full" />
                <Select placeholder="Thuộc nhóm" className="w-full" />
                <Input placeholder="Tên bài báo (Tiếng Việt)" required />
                <Input placeholder="Tên bài báo (Tiếng Anh)" />
                <Input
                  placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt)"
                  required
                />
                <Input placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh)" />
                <DatePicker placeholder="Ngày công bố" className="w-full" />
                <Input placeholder="Số trang" type="number" />
                <Select placeholder="Thư mục" className="w-full" />
                <Input placeholder="Số ISSN / ISBN" />
                <Input placeholder="Tập / quyển (nếu có)" />
              </div>
              <TextArea placeholder="Tóm tắt" className="h-24" />
            </div>

            {/* Khối "Nhập thông tin tác giả" */}
            <div className="w-1/3 bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
              <h3 className="font-semibold mb-2">Nhập thông tin tác giả</h3>
              <Input placeholder="Số tác giả" type="number" required />
              {authors.map((author, index) => (
                <div key={author.id} className="grid grid-cols-1 gap-4 mt-4">
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
                  />
                  <Select
                    placeholder="Vai trò"
                    value={author.role}
                    onChange={(value) =>
                      handleAuthorChange(index, "role", value)
                    }
                    required
                  />
                  <Select
                    placeholder="Cơ quan công tác"
                    value={author.institution}
                    onChange={(value) =>
                      handleAuthorChange(index, "institution", value)
                    }
                    required
                  />
                </div>
              ))}
              <Button type="dashed" onClick={handleAddAuthor} className="mt-4">
                Thêm tác giả
              </Button>
            </div>

            {/* Khối "Nhập thông tin minh chứng" */}
            <div className="w-1/3 bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
              <h3 className="font-semibold mb-2">Nhập thông tin minh chứng</h3>
              <div className="grid grid-cols-1 gap-4">
                <Upload>
                  <Button>Chọn file</Button>
                </Upload>
                <Input
                  placeholder="Link công bố bài báo (http://...)"
                  required
                />
                <Input
                  placeholder="Số DOI (vd: https://doi.org/10/1155.2019)"
                  required
                />
              </div>
              <p className="mt-4 text-xs text-gray-500">
                Chỉ hỗ trợ file PDF, dung lượng tối đa 3.5MB, tối đa 1 file.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <Button danger>Xóa trắng</Button>
            <Button type="primary">Lưu</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddScientificPaperPage;
