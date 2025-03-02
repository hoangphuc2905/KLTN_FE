import React, { useState } from "react";
import Logo from "../../../assets/logoLogin.png";
import Image from "../../../assets/background.png";

const LoginPage = () => {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt with:", {
      studentId,
      password,
    });
    window.location.href = "/home";
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

              <div className="flex gap-2 self-start mt-6">
                <span className="self-start text-sm font-bold text-red-500">
                  *
                </span>
                <label
                  htmlFor="student-id"
                  className="flex-auto text-lg font-medium text-zinc-800"
                >
                  Mã số sinh viên / Mã số giảng viên
                </label>
              </div>

              <input
                id="student-id"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Nhập mã sinh viên / Mã giảng viên"
                className="px-4 pt-2 pb-3 mt-4 text-lg rounded border border-blue-700 border-solid text-slate-500 max-md:pr-4 max-md:max-w-full"
              />

              <div className="flex gap-1 self-start mt-6 max-md:mt-6 max-md:ml-2">
                <span className="my-auto text-sm font-bold text-red-500">
                  *
                </span>
                <label
                  htmlFor="password"
                  className="text-lg font-medium text-zinc-800"
                >
                  Mật khẩu
                </label>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="px-4 py-3 mt-4 text-lg rounded border border-blue-700 border-solid text-slate-500 max-md:pr-4 max-md:max-w-full"
              />

              <button
                type="submit"
                className="self-end px-4 py-3 mt-12 text-lg font-bold text-center text-white bg-sky-500 rounded-xl max-md:mt-6 max-md:mr-1"
              >
                Đăng nhập
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
