import React, { useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Link } from "react-router-dom";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const HomePage = () => {
  const user = {
    name: "NGUYEN VAN A",
    role: "User",
  };

  const researchPapers = [
    {
      id: "1",
      title:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa CNHH",
      publishDate: "20/02/2025",
      description:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 100,
      commentCount: 27,
    },
    {
      id: "2",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "3",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "4",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "5",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "6",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "7",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "8",
      title:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa CNHH",
      publishDate: "20/02/2025",
      description:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 100,
      commentCount: 27,
    },
    {
      id: "9",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "10",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "11",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "12",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "13",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "14",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "15",
      title:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
      author: "Đoàn Văn Đạt",
      department: "Khoa CNHH",
      publishDate: "20/02/2025",
      description:
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 100,
      commentCount: 27,
    },
    {
      id: "16",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "17",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "18",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "19",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "20",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
    {
      id: "21",
      title: "Nghiên cứu về ứng dụng của AI trong giáo dục",
      author: "Nguyễn Văn B",
      department: "Khoa CNTT",
      publishDate: "15/01/2025",
      description:
        "Nghiên cứu này tập trung vào việc ứng dụng trí tuệ nhân tạo trong giáo dục, nhằm cải thiện chất lượng giảng dạy và học tập.",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/a04d6d485480099550615127de58c6d07737c012442ce3910711c9780504ac0e?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
      viewCount: 150,
      commentCount: 35,
    },
  ];

  const recentPapers = [
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
  ];

  const featuredPapers = [
    {
      id: "1",
      title: "Featured Research Paper 1",
      author: "Author Name",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "2",
      title: "Featured Research Paper 1",
      author: "Author Name",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
    {
      id: "1",
      title: "The DA Vince Code The DA Vince Code AI Plus",
      author: "Dan Brown",
      department: "Khoa Công nghệ thông tin",
      thumbnailUrl:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/b4958f67927f8fdc0ae0ebda3f620b0e7c4664399fd5bf71176c81b26b41ed07?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47",
    },
  ];

  const [activeTab, setActiveTab] = React.useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastPaper = currentPage * itemsPerPage;
  const indexOfFirstPaper = indexOfLastPaper - itemsPerPage;
  const currentPapers = researchPapers.slice(
    indexOfFirstPaper,
    indexOfLastPaper
  );

  const totalPages = Math.ceil(researchPapers.length / itemsPerPage);

  const displayedPapers =
    activeTab === "recent" ? recentPapers : featuredPapers;

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header user={user} />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 pt-[80px] sticky top-3 bg-[#E7ECF0] z-10">
          <div className="flex items-center gap-2 text-gray-600">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-5 h-5"
            />
            <span>Trang chủ</span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">Tìm kiếm</span>
          </div>

          <div className="flex gap-4 rounded-lg items-center mt-4 mb-3">
            <select className="p-2 border rounded-lg w-60 text-sm">
              <option value="">Chọn danh mục</option>
              <option value="cnnt">Công nghệ thông tin</option>
              <option value="hoa-hoc">Hóa học</option>
            </select>
            <select className="p-2 border rounded-lg w-60 text-sm">
              <option value="">Chọn loại tài liệu</option>
              <option value="luan-van">Luận văn</option>
              <option value="bai-bao">Bài báo</option>
            </select>

            <input
              type="text"
              className="p-2 border rounded-lg flex-1 text-sm"
              placeholder="Nhập từ khóa tìm kiếm..."
            />

            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
          <div className="flex gap-5 max-md:flex-col">
            <section className="w-[71%] max-md:ml-0 max-md:w-full">
              <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
                {currentPapers.map((paper, index) => (
                  <Link to={`/scientific-paper/${paper.id}`} key={paper.id}>
                    <article
                      key={paper.id}
                      className={`grid grid-cols-[auto,1fr] gap-6 px-4 py-4 bg-white rounded-xl shadow-sm max-md:grid-cols-1 ${
                        index > 0 ? "mt-3" : ""
                      }`}
                    >
                      <div className="flex justify-center w-fit">
                        <img
                          src={paper.thumbnailUrl}
                          className="object-cover align-middle rounded-md w-auto max-w-full md:max-w-[150px] h-[180px] aspect-[4/3] max-md:aspect-[16/9] m-0"
                          alt={paper.title}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-2 w-full">
                        {/* Hàng 1: Tiêu đề + Thông tin lượt xem */}
                        <div className="grid grid-cols-[auto,1fr] items-center text-sky-900 w-full">
                          {/* Tiêu đề */}
                          <h2 className="text-sm font-bold break-words max-w-[500px] line-clamp-2">
                            {paper.title}
                          </h2>

                          {/* Lượt xem + Bình luận */}
                          <div className="flex flex-col items-center ml-auto">
                            <div className="flex items-center gap-2 text-orange-500">
                              <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da"
                                className="object-contain w-4 aspect-square"
                                alt="Views icon"
                              />
                              <div className="text-xs">{paper.viewCount}</div>
                              <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72"
                                className="object-contain w-4 aspect-[1.2]"
                                alt="Comments icon"
                              />
                              <div className="text-xs">
                                {paper.commentCount}
                              </div>
                            </div>

                            {/* Ngày đăng */}
                            <div className="text-xs text-neutral-500 mt-1">
                              {paper.publishDate}
                            </div>
                          </div>
                        </div>

                        {/* Hàng 2: Tác giả */}
                        <div className="text-sm text-sky-900">
                          {paper.author}
                        </div>

                        {/* Hàng 3: Mô tả */}
                        <p className="text-sm text-neutral-800 break-words w-full line-clamp-2">
                          {paper.description}
                        </p>

                        {/* Hàng 4: Bộ phận */}
                        <div className="text-sm text-sky-900">
                          {paper.department}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}

                {researchPapers.length > itemsPerPage && (
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                        window.scrollTo(0, 0); // Cuộn lên đầu trang
                      }}
                      disabled={currentPage === 1}
                    >
                      <LeftOutlined />
                    </button>
                    <span className="px-4 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                      onClick={() => {
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        );
                        window.scrollTo(0, 0); // Cuộn lên đầu trang
                      }}
                      disabled={currentPage === totalPages}
                    >
                      <RightOutlined />
                    </button>
                  </div>
                )}
              </div>
            </section>

            <div className="ml-5 w-[29%] max-md:ml-0 max-md:w-full">
              <section className="sticky top-[195px] z-9">
                <aside className="overflow-hidden px-4 py-6 mx-auto w-full bg-white rounded-xl max-md:px-5 max-md:mt-4 max-md:max-w-full">
                  <div className="flex gap-4 justify-between items-start max-w-full text-xs font-bold tracking-tight leading-loose w-[362px]">
                    <button
                      className={`px-4 pt-1.5 pb-3.5 rounded-lg ${
                        activeTab === "recent"
                          ? "text-white bg-sky-500"
                          : "bg-white text-neutral-500"
                      }`}
                      onClick={() => setActiveTab("recent")}
                    >
                      Bài nghiên cứu mới đăng
                    </button>
                    <button
                      className={`px-1.5 pt-1 pb-3.5 rounded-lg ${
                        activeTab === "featured"
                          ? "text-white bg-sky-500"
                          : "bg-white text-neutral-500"
                      }`}
                      onClick={() => setActiveTab("featured")}
                    >
                      Bài nghiên cứu nổi bật
                    </button>
                  </div>

                  <div className="flex gap-4 mt-5">
                    <div className="max-md:hidden">
                      {displayedPapers.map((paper, index) => (
                        <img
                          key={index}
                          src={paper.thumbnailUrl}
                          className={`object-contain rounded-md aspect-[0.72] w-[72px] ${
                            index > 0 ? "mt-5" : ""
                          }`}
                          alt={paper.title}
                        />
                      ))}
                    </div>

                    <div className="flex flex-col grow shrink-0 items-start text-sm tracking-tight leading-none basis-0 text-slate-400 w-fit">
                      {displayedPapers.map((paper, index) => (
                        <React.Fragment key={index}>
                          <h3
                            className={`self-stretch text-sm font-bold tracking-tight leading-4 text-blue-950 ${
                              index > 0 ? "mt-8" : ""
                            }`}
                          >
                            {paper.title}
                          </h3>
                          <div className="mt-3">{paper.author}</div>
                          <div className="mt-6">{paper.department}</div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </aside>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
