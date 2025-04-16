const Footer = () => {
  return (
    <footer className="bg-white text-gray-700 text-xs mt-10 border-t border-gray-300">
      {/* New Section */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 lg:px-8 flex flex-wrap">
          {/* Logo and Welcome Message */}
          <div className="w-full md:w-1/3 px-4 text-center md:text-left">
            <a href="#">
              <img
                src="//lms.iuh.edu.vn/pluginfile.php/1/theme_academi/logo/1697014882/Logo_IUH.png"
                width="100"
                height="100"
                alt="Academi"
              />
            </a>
            <p className="mt-4 text-sm">
              Chào mừng các bạn đến với Hệ thống quản lý bài nghiên cứu khoa học
              của trường Đại học Công nghiệp TP.HCM, hệ thống thông tin cung cấp
              các bài nghiên cứu của sinh viên và giảng viên đã được kiểm duyệt
              và đăng lên hệ thống.
            </p>
          </div>

          {/* Links */}
          <div className="w-full md:w-1/3 px-4 text-center md:text-left pl-12">
            <h3 className="font-bold text-red-600 text-sm pb-3">Liên kết</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="http://iuh.edu.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  Website Nhà Trường
                </a>
              </li>
              <li>
                <a
                  href="https://csm.iuh.edu.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  Website Trung tâm QTHT
                </a>
              </li>
              <li>
                <a
                  href="https://sv.iuh.edu.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  Cổng Thông Tin Sinh Viên
                </a>
              </li>
              <li>
                <a
                  href="https://lms.iuh.edu.vn/course/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  Các Khóa Học
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="w-full md:w-1/3 px-4 text-center md:text-left">
            <h3 className="font-bold text-red-600 text-sm pb-2">Liên hệ</h3>
            <p className="text-sm">
              Trung tâm Quản trị Hệ thống - Trường Đại học Công nghiệp TP.HCM
            </p>
            <p className="text-sm">
              <i className="fa fa-phone-square"></i> Phone: 0283.8940 390 - ext
              838
            </p>
            <p className="text-sm">
              <i className="fa fa-envelope"></i> E-mail:{" "}
              <a href="mailto:csm@iuh.edu.vn" className="text-blue-600">
                csm@iuh.edu.vn
              </a>
            </p>
            <div className="mt-4">
              <h6 className="text-sm">Follow us</h6>
              <ul className="flex space-x-4">
                <li>
                  <a
                    href="https://www.facebook.com/csm.iuh.edu.vn"
                    className="text-blue-600"
                  >
                    <i className="fa fa-facebook-square text-xl"></i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
