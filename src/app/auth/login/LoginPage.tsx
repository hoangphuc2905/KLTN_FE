import React, { useState } from "react";
import authApi from "../../../api/authApi";
const Logo = new URL("../../../assets/logoLogin.png", import.meta.url).href;
const Image = new URL("../../../assets/background.png", import.meta.url).href;

const LoginPage = () => {
  const [user_id, setUser_id] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await authApi.login({ user_id, password });
      console.log("Login successful:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user_id", data.user_id);
      console.log("Login successful:", data);
      console.log("Token:", data.user_id);
      window.location.href = "/home";
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex overflow-hidden flex-col pb-24 bg-white max-md:pb-12">
      <header className="flex flex-col items-center h-[100px] px-20 w-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] max-md:px-5 max-md:max-w-full">
        <img
          src={Logo}
          alt="Logo"
          className="object-contain z-10 h-full max-w-full aspect-[7.19] w-[600px] max-md:w-[200px]"
        />
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

              {error && (
                <p className="text-red-500 mt-2 text-center">{error}</p>
              )}

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
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
