const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 text-xs mt-10 border-t border-gray-300">
      {/* New Section */}
      <div className="bg-gray-100 py-6 sm:py-8">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:flex-wrap space-y-8 md:space-y-0">
            {/* Logo and Welcome Message */}
            <div className="w-full md:w-1/3 px-2 md:px-4 text-center md:text-left">
              <a href="#" className="inline-block">
                <img
                  src="//lms.iuh.edu.vn/pluginfile.php/1/theme_academi/logo/1697014882/Logo_IUH.png"
                  width="100"
                  height="100"
                  alt="Academi"
                  className="mx-auto md:mx-0"
                />
              </a>
              <p className="mt-4 text-sm px-2 sm:px-0">
                Chào mừng đến với hệ thống bài nghiên cứu khoa học của Đại học
                Công nghiệp TP.HCM, nơi lưu trữ các bài nghiên cứu đã kiểm
                duyệt.
              </p>
            </div>

            {/* Links */}
            <div className="w-full md:w-1/3 px-4 text-center md:text-left md:pl-28">
              <h3 className="font-bold text-red-600 text-sm pb-2">Liên kết</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="http://iuh.edu.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website Nhà Trường
                  </a>
                </li>
                <li>
                  <a
                    href="https://csm.iuh.edu.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website Trung tâm QTHT
                  </a>
                </li>
                <li>
                  <a
                    href="https://sv.iuh.edu.vn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Cổng Thông Tin Sinh Viên
                  </a>
                </li>
                <li>
                  <a
                    href="https://lms.iuh.edu.vn/course/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Các Khóa Học
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="w-full md:w-1/3 px-4 text-center md:text-left">
              <h3 className="font-bold text-red-600 text-sm pb-2">Liên hệ</h3>
              <p className="text-sm pb-1">
                Địa chỉ: 12 Nguyễn Văn Bảo, Q. Gò Vấp, TP. Hồ Chí Minh Khoa Công
                nghệ Thông tin - Lầu 1 - Nhà H
              </p>
              <p className="text-sm pb-1">
                <i className="fa fa-phone-square"></i>Phone: 0868434509 (Thanh)
                - 0368564833 (Phúc)
              </p>
              <p className="text-sm">
                <i className="fa fa-envelope"></i>E-mail:{" "}
                <a
                  href="mailto:csm@iuh.edu.vn"
                  className="text-blue-600 hover:underline"
                >
                  hethongnckhiuh@gmail.com
                </a>
              </p>
              <div className="mt-1">
                <h6 className="text-sm">
                  © 2024 Khoa Công nghệ thông tin - Kỹ thuật phần mềm
                </h6>
                <ul className="flex justify-center md:justify-start space-x-4 mt-2">
                  <li>
                    <a
                      href="https://www.facebook.com/csm.iuh.edu.vn"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <i className="fa fa-facebook-square text-xl"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
