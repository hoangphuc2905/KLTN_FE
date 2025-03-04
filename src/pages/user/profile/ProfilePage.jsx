import { useEffect, useState } from "react";
import Header from "../../../components/header";
import userApi from "../../../api/api";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        console.error("Thiếu user_id");
        return;
      }

      try {
        const response = await userApi.getUserInfo(user_id);
        setUser(response);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const translateGender = (gender) => {
    if (gender === "male") return "Nam";
    if (gender === "female") return "Nữ";
    return "Khác";
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
              Thông tin cá nhân
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <section className="flex flex-wrap items-start max-md:max-w-full">
            <section className="flex flex-col self-stretch py-6 pr-px pl-11 bg-white rounded-lg max-md:pl-5 max-md:max-w-full">
              <div className="flex items-start gap-10 flex-nowrap max-md:flex-wrap">
                <img
                  src={user?.avatar}
                  className="object-contain shrink-0 self-start max-w-full aspect-[0.8] rounded-full w-[150px]"
                  alt="Profile photo"
                />

                <div className="flex flex-col w-[calc(100%-220px)] max-w-full">
                  <h2 className="text-xl font-medium leading-none text-black">
                    THÔNG TIN LÝ LỊCH KHOA HỌC
                  </h2>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/e1340e03f93cbe05a478b97d870f324a7e2e7240dd6f7d2313088d4a181f448a?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                    className="object-contain self-stretch mt-3 w-full aspect-[200] max-md:max-w-full"
                    alt="Divider"
                  />

                  <div className="mt-6 max-w-full w-[1110px]">
                    <div className="flex gap-5 max-md:flex-col">
                      <div className="w-[32%] max-md:ml-0 max-md:w-full">
                        <div className="flex flex-col grow text-xl font-medium leading-none text-black max-md:mt-10">
                          <div className="mr-7 max-md:mr-2.5">
                            Mã số sinh viên:{" "}
                            <span className="font-bold">{user?.user_id}</span>
                          </div>
                          <div className="mt-8">
                            Họ và tên:{" "}
                            <span className="font-bold">{user?.full_name}</span>
                          </div>
                          <div className="self-start mt-6">
                            Giới tính:{" "}
                            <span className="font-bold">
                              {translateGender(user?.gender)}
                            </span>
                          </div>
                          <div className="mt-7">
                            Ngày vào trường:{" "}
                            <span className="font-bold">
                              {formatDate(user?.start_date)}
                            </span>
                          </div>
                          <div className="self-start mt-6">
                            Khoa:{" "}
                            <span className="font-bold">{user?.faculty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-5 w-[68%] max-md:ml-0 max-md:w-full">
                        <div className="flex flex-col grow items-start text-xl font-medium leading-none text-black max-md:mt-10 max-md:max-w-full">
                          <div>
                            Ngày sinh:{" "}
                            <span className="font-bold">
                              {formatDate(user?.date_of_birth)}
                            </span>
                          </div>
                          <div className="mt-7">
                            Số CCCD:{" "}
                            <span className="font-bold">{user?.cccd}</span>
                          </div>
                          <div className="mt-7">
                            Email:{" "}
                            <span className="font-bold">{user?.email}</span>
                          </div>
                          <div className="mt-6">
                            Số điện thoại:{" "}
                            <span className="font-bold">{user?.phone}</span>
                          </div>
                          <div className="self-stretch mt-6 max-md:max-w-full">
                            Địa chỉ liên hệ:{" "}
                            <span className="font-bold">{user?.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="self-center mt-8 text-xl font-medium leading-none text-black">
                TRAO ĐỔI GẦN ĐÂY
              </h2>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/cd7a1c5982e8462259a3e3d76e113a6e43984c17d2b1cd85ca3d67dc1eb29529?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                className="object-contain mt-3.5 ml-3 w-full aspect-[500] max-md:max-w-full"
                alt="Divider"
              />

              <div className="mt-4 mr-9 max-md:mr-2.5 max-md:max-w-full">
                <div className="flex gap-5 max-md:flex-col">
                  <div className="w-[28%] max-md:ml-0 max-md:w-full">
                    <div className="flex flex-col pt-7 w-full max-md:mt-10">
                      <div className="flex z-10 gap-2.5 items-center self-end pr-10 pl-3 mt-7 mr-7 max-w-full text-base font-bold leading-none text-black whitespace-nowrap rounded-md border border-solid bg-zinc-100 border-gray-300 h-[19px] w-[116px] max-md:pr-5 max-md:mr-2.5">
                        <div className="flex-1 shrink gap-2 self-stretch my-auto basis-0">
                          2024
                        </div>
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/2dbe78d7da985da06a374ee05556861ce3348cb29278d0bb2f1a0191f4bd13f4?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                          className="object-contain shrink-0 self-stretch my-auto w-2.5 aspect-[2] fill-stone-900"
                          alt="Dropdown icon"
                        />
                      </div>
                      <div className="flex flex-col items-center px-6 pt-6 pb-1.5 mt-0 bg-white rounded-3xl border border-black min-h-[474px] max-md:px-5">
                        <h3 className="text-lg font-bold leading-none text-black">
                          Thành tích đóng góp
                        </h3>
                        <div className="mt-6 max-w-full min-h-[402px] w-[355px]">
                          <div className="flex flex-col items-center w-full">
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/a85564bf2d993b2f5f5e6338fad61fc05c6ae7fb53a9eb0683310e68382b8e5b?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                              className="object-contain max-w-full aspect-square w-[200px]"
                              alt="Statistics chart"
                            />
                          </div>
                          <div className="mt-12 w-full text-sm leading-loose text-gray-800 max-w-[355px] min-h-[154px] max-md:mt-10">
                            <div className="flex gap-6 items-start px-8 w-full max-md:px-5">
                              <div className="flex flex-1 shrink gap-2 items-center whitespace-nowrap rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-green-500 rounded"></div>
                                <div className="flex-1 shrink self-stretch my-auto basis-0">
                                  Done
                                </div>
                              </div>
                              <div className="flex flex-1 shrink gap-2 items-center text-right rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-red-500 rounded"></div>
                                <div className="self-stretch my-auto">
                                  Overdue work
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-6 items-start px-8 mt-4 w-full text-right max-md:px-5">
                              <div className="flex flex-1 shrink gap-2 items-center rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-orange-400 rounded"></div>
                                <div className="self-stretch my-auto">
                                  Work finished late
                                </div>
                              </div>
                              <div className="flex flex-1 shrink gap-2 items-center whitespace-nowrap rounded-lg basis-0">
                                <div className="flex shrink-0 self-stretch my-auto w-4 h-4 bg-blue-500 rounded"></div>
                                <div className="self-stretch my-auto">
                                  Processing
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-5 w-[72%] max-md:ml-0 max-md:w-full">
                    <div className="mt-2.5 w-full text-xl text-black max-md:mt-10 max-md:max-w-full">
                      <div className="flex flex-wrap gap-8 mt-7">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/aed835d36a2dd64ee06f5306c36e2c710acd8eb301ba94120a7c5fc6b7e141b0?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                          className="object-contain shrink-0 my-auto aspect-[0.98] rounded-full w-[43px]"
                          alt="Profile"
                        />
                        <div className="relative flex-wrap flex-auto gap-5 px-6 py-3.5 rounded-lg min-h-[67px] shadow-md w-[700px] max-md:px-5 max-md:max-w-full">
                          <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/221b7eae7f2cffa306700803709341925ca582e0d8a3fd22387980a74a5c3341?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                            className="object-cover absolute inset-0 size-full"
                            alt="Background"
                          />
                          <div className="relative font-medium leading-5 w-[622px]">
                            <span className="font-bold">Admin</span>
                            <br />
                            Duyệt thông tin bài báo
                          </div>
                          <div className="relative my-auto leading-none">
                            2 tháng
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-8 mt-7">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/aed835d36a2dd64ee06f5306c36e2c710acd8eb301ba94120a7c5fc6b7e141b0?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                          className="object-contain shrink-0 my-auto aspect-[0.98] rounded-full w-[43px]"
                          alt="Profile"
                        />
                        <div className="relative flex-wrap flex-auto gap-5 px-6 py-3.5 rounded-lg min-h-[67px] shadow-md w-[700px] max-md:px-5 max-md:max-w-full">
                          <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/42fc73bb4a1bb0b00570d85304b9c4474bec9ad763e797096f1dbeb375cb18ef?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                            className="object-cover absolute inset-0 size-full"
                            alt="Background"
                          />
                          <div className="relative font-medium leading-5 w-[622px]">
                            <span className="font-bold">Admin</span>
                            <br />
                            Duyệt thông tin bài báo
                          </div>
                          <div className="relative my-auto leading-none">
                            2 tháng
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-8 mt-7">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/aed835d36a2dd64ee06f5306c36e2c710acd8eb301ba94120a7c5fc6b7e141b0?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                          className="object-contain shrink-0 my-auto aspect-[0.98] rounded-full w-[43px]"
                          alt="Profile"
                        />
                        <div className="relative flex-wrap flex-auto gap-5 px-6 py-3.5 rounded-lg min-h-[67px] shadow-md w-[700px] max-md:px-5 max-md:max-w-full">
                          <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/5478de77fea7cb18b11e95c7036d93fccba1959e97234cf32e5ab2bf0648abd1?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                            className="object-cover absolute inset-0 size-full"
                            alt="Background"
                          />
                          <div className="relative font-medium leading-5 w-[622px]">
                            <span className="font-bold">Admin</span>
                            <br />
                            Duyệt thông tin bài báo
                          </div>
                          <div className="relative my-auto leading-none">
                            2 tháng
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
