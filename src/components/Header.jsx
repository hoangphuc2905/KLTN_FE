import Logo from "../assets/logoLogin.png";

const Header = () => {
  return (
    <header className="flex items-center justify-between h-[70px] px-6 w-full bg-white shadow-md">
      <div className="flex items-center">
        <img src={Logo} alt="Logo" className="h-12 w-auto" />
      </div>

      <h1 className="text-lg font-bold text-black text-center">
        HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
        CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
      </h1>

      <div className="flex items-center gap-2">
        <button className="text-gray-500 hover:text-gray-700">🔔</button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>{" "}
          <div className="flex flex-col">
            <span className="text-blue-500 font-bold">NGUYỄN VĂN A</span>
            <span className="text-gray-500 text-sm">USER</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
