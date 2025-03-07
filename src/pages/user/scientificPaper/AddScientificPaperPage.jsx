import { Button, Input, Upload, Select } from "antd";
import Header from "../../../components/header";
import TextArea from "antd/es/input/TextArea";

const AddScientificPaperPage = () => {
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
          <div className="flex bg-white p-6 rounded-lg shadow-md gap-6">
            {/* Hình ảnh */}
            <div className="w-1/3 flex flex-col items-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
                className="w-[200px] h-[280px] object-cover rounded-lg"
                alt="Book Cover"
              />
            </div>

            {/* Form nhập thông tin */}
            <div className="w-2/3 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="ID" />
                <Select placeholder="Loại bài báo" className="w-full" />
                <Select placeholder="Thuộc nhóm" className="w-full" />
                <Input placeholder="Tên bài báo (Tiếng Việt)" />
                <Input placeholder="Tên bài báo (Tiếng Anh)" />
                <Input placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt)" />
                <Input placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh)" />
                <Input placeholder="Số trang" />
                <Input placeholder="Thứ tự" />
                <Input placeholder="Số ISSN / ISBN" />
                <Input placeholder="Tập / quyển (nếu có)" />
              </div>
              <TextArea placeholder="Tóm tắt" className="h-24" />
            </div>
          </div>

          {/* Nhập thông tin tác giả */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Nhập thông tin tác giả</h3>
            <div className="grid grid-cols-4 gap-4">
              <Input placeholder="Số tác giả" />
              <Input placeholder="MSSV/MSGV" />
              <Input placeholder="Tên sinh viên / giảng viên" />
              <Input placeholder="Vai trò" />
            </div>
          </div>

          {/* Nhập thông tin minh chứng */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-semibold mb-2">Nhập thông tin minh chứng</h3>
            <div className="grid grid-cols-3 gap-4">
              <Upload>
                <Button>Chọn file</Button>
              </Upload>
              <Input placeholder="Link công bố bài báo (http://...)" />
              <Input placeholder="Số DOI (vd: https://doi.org/10/1155.2019)" />
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
