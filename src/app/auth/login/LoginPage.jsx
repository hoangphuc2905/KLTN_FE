import { useState } from "react";
import { message } from "antd";
import authApi from "../../../api/authApi";
import defaultRoutes from "../../../configs/defaultRoutes";
const Logo = new URL("../../../assets/logo.png", import.meta.url).href;
const Image = new URL("../../../assets/background.png", import.meta.url).href;

const LoginPage = () => {
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authApi.login({ user_id, password });

      console.log("Login response:", data);

      const userId = data.userId || data._id;
      const userType = data.userType;
      const department = data.department;
      const email = data.email;

      if (!userId) {
        throw new Error("User ID is missing in the response");
      }

      // Xử lý roles
      let roles = Array.isArray(data.roles) ? data.roles : [data.roles];
      // Nếu roles là mảng đối tượng, lấy role_name
      roles = roles.map((role) =>
        typeof role === "object" && role.role_name ? role.role_name : role
      );

      // Lưu thông tin vào localStorage
      // localStorage.setItem("accessToken", data.accessToken);
      // localStorage.setItem("refreshToken", data.refreshToken);
      // localStorage.setItem("user_id", userId);
      // localStorage.setItem("roles", JSON.stringify(roles));
      // localStorage.setItem("email", email || "");
      // localStorage.setItem("user_type", userType || "");
      // localStorage.setItem("department", department || "");

      // Lưu current_role (vì chỉ có 1 vai trò)
      const currentRole = roles[0];
      if (!currentRole) {
        throw new Error("No role found in the response");
      }
      localStorage.setItem("current_role", currentRole);

      // Chuyển hướng
      if (roles.length > 1) {
        window.location.href = "/role-selection";
      } else {
        const defaultPath = defaultRoutes[currentRole] || "/home";
        window.location.href = defaultPath;
      }
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      message.error(error.message || "Thông tin đăng nhập không chính xác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex overflow-hidden flex-col pb-24 bg-white max-md:pb-12">
      <header className="flex items-center h-[60px] px-20 w-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5 max-md:max-w-full">
        <div className="flex items-center w-full">
          <div className="flex items-center">
            <img
              src={Logo}
              alt="Logo"
              className="object-contain h-full max-w-full  w-[100px] max-md:w-[50px]"
            />
          </div>
          <div className="flex-1 flex justify-center">
            <h1 className="text-sm font-bold text-center text-zinc-800 max-md:text-xs">
              HỆ THỐNG QUẢN LÝ CÁC BÀI BÁO NGHIÊN CỨU KHOA HỌC <br />
              CỦA TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TPHCM
            </h1>
          </div>
        </div>
      </header>

      <main className="self-center mt-10 w-full max-w-[1400px] max-md:mt-5 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col h-full">
          <section className="w-[80%] max-md:w-full flex items-center">
            <img
              src={Image}
              alt="Login illustration"
              className="object-contain w-full h-full rounded-xl max-md:mt-5 max-md:max-w-full"
            />
          </section>

          <section className="w-[50%] max-md:w-full flex items-center">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col px-6 pt-6 pb-10 mx-auto w-full h-full rounded-2xl bg-slate-100 max-md:px-4 max-md:mt-5 max-md:max-w-full"
            >
              <h1 className="self-center text-3xl font-bold text-zinc-800">
                Đăng nhập
              </h1>

              <p className="mt-6 ml-2 text-lg text-slate-500 max-md:mt-5 max-md:mr-1 max-md:max-w-full">
                Nhập tài khoản và mật khẩu để đăng nhập hệ thống
              </p>

              <label
                htmlFor="student-id"
                className="mt-6 text-lg font-medium text-zinc-800"
              >
                Mã số sinh viên / Mã số giảng viên{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="student-id"
                type="text"
                value={user_id}
                onChange={(e) => setUser_id(e.target.value)}
                placeholder="Nhập mã sinh viên / Mã giảng viên"
                className="px-4 py-2 mt-2 text-lg rounded border border-blue-700 text-slate-500"
              />

              <label
                htmlFor="password"
                className="mt-6 text-lg font-medium text-zinc-800"
              >
                Mật khẩu <span className="text-red-500">*</span>
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="px-4 py-2 mt-2 text-lg rounded border border-blue-700 text-slate-500"
              />

              <button
                type="submit"
                className="self-end px-4 py-3 mt-6 text-lg font-bold text-white bg-sky-500 rounded-xl disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>

              <p className="self-end mt-4 text-xl text-zinc-800">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  className="font-bold text-green-500 hover:underline"
                  onClick={() => (window.location.href = "/register")}
                >
                  Đăng ký
                </button>
              </p>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
