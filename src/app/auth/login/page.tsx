"use client";

import React, { useState } from "react";

const LoginPage: React.FC = () => {
  const [mssv, setMSSV] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("MSSV:", mssv, "Password:", password);
    // Thêm logic xử lý đăng nhập với MSSV tại đây
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Đăng nhập - IUH
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          {/* MSSV Input */}
          <div>
            <label
              htmlFor="mssv"
              className="block text-sm font-medium text-gray-700"
            >
              Mã số sinh viên (MSSV)
            </label>
            <input
              type="text"
              id="mssv"
              placeholder="21036541"
              value={mssv}
              onChange={(e) => setMSSV(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Quên mật khẩu?{" "}
            <a
              href="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Khôi phục ngay
            </a>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Hoặc{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Đăng ký tài khoản mới
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
