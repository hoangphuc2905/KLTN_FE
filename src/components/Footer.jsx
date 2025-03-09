const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 text-sm mt-10 border-t border-gray-300">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-wrap justify-between">
        {/* Liên hệ */}
        <div className="w-full md:w-1/3 px-4 text-center md:text-left">
          <h3 className="font-bold text-red-600">LIÊN HỆ</h3>
          <p>HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC</p>
          <p>CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM</p>
          <p>
            Địa chỉ: Số 12 Nguyễn Văn Bảo, Phường 1, Quận Gò Vấp, TP. Hồ Chí
            Minh
          </p>
          <p>
            Điện thoại: <span className="text-blue-600">0283.8940 390</span>
          </p>
          <p>
            Email:{" "}
            <a href="mailto:dhcn@iuh.edu.vn" className="text-blue-600">
              dhcn@iuh.edu.vn
            </a>
          </p>
        </div>

        {/* Hoạt động khác */}
        <div className="w-full md:w-1/3 px-4 text-center md:text-left">
          <h3 className="font-bold text-red-600">HOẠT ĐỘNG KHÁC</h3>
          <ul className="space-y-2">
            <li>Hoạt động phục vụ cộng đồng</li>
            <li>Sinh viên tình nguyện</li>
            <li>CLB/Đội/Nhóm sinh viên</li>
            <li>Kết nối doanh nghiệp</li>
          </ul>
        </div>

        {/* Thông tin mở rộng */}
        <div className="w-full md:w-1/3 px-4 text-center md:text-left">
          <h3 className="font-bold text-red-600">THÔNG TIN MỞ RỘNG</h3>
          <ul className="space-y-2">
            <li>Báo chí viết về IUH</li>
            <li>Khám phá IUH</li>
            <li>Kỹ năng mềm</li>
            <li>Bộ sưu tập</li>
            <li>Dịch vụ sinh viên</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
