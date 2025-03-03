import React from "react";
import Header from "../../../components/Header";

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
        "Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols. Tổng hợp xanh nano kim loại quý bằng dịch chiết thực vật, ứng dụng làm vật liệu xúc tác xử lý nitrophenols",
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
  ];

  const [activeTab, setActiveTab] = React.useState("recent");

  const displayedPapers =
    activeTab === "recent" ? recentPapers : featuredPapers;

  return (
    <div className="flex flex-col pb-7 bg-slate-200 pt-[80px]">
      <div className="w-full bg-white">
        <Header user={user} />
      </div>

      <div className="self-center mt-6 w-full max-w-[1563px] px-6 max-md:max-w-full">
        <div className="flex gap-5 max-md:flex-col">
          <section className="w-[71%] max-md:ml-0 max-md:w-full">
            <div className="flex flex-col w-full max-md:mt-4 max-md:max-w-full">
              {researchPapers.map((paper, index) => (
                <article
                  key={paper.id}
                  className={`flex flex-wrap gap-10 px-6 py-4 bg-white rounded-xl shadow-sm max-md:px-5 ${
                    index > 0 ? "mt-3" : ""
                  }`}
                >
                  <img
                    src={paper.thumbnailUrl}
                    className="object-contain shrink-0 self-start mt-2 max-w-full rounded-md aspect-[0.85] w-[150px]"
                    alt={paper.title}
                  />
                  <div className="flex flex-col grow shrink-0 basis-0 w-fit max-md:max-w-full">
                    <div className="flex flex-wrap gap-5 justify-between items-start max-md:max-w-full">
                      <div className="flex flex-col mt-1 text-sky-900 max-md:max-w-full">
                        <div className="flex items-center justify-between">
                          <h2 className="text-xl font-bold max-w-[80%] break-words">
                            {paper.title}
                          </h2>
                          <div className="flex gap-3 text-orange-500 ml-4">
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/87fb9c7b3922853af65bc057e6708deb4040c10fe982c630a5585932d65a17da?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                              className="object-contain shrink-0 w-6 aspect-square"
                              alt="Views icon"
                            />
                            <div className="my-auto">{paper.viewCount}</div>
                            <img
                              src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0161c9148a33f73655f05930afc1a30c84052ef573d5ac5f01cb4e7fc703c72?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                              className="object-contain shrink-0 w-6 aspect-[1.2]"
                              alt="Comments icon"
                            />
                            <div>{paper.commentCount}</div>
                          </div>
                        </div>
                        <div className="self-start mt-5 text-base">
                          {paper.author}
                        </div>
                      </div>
                      <div className="flex flex-col text-base">
                        <div className="mt-3.5 italic text-neutral-800">
                          Ngày đăng: {paper.publishDate}
                        </div>
                      </div>
                    </div>
                    <p className="mt-6 mr-12 text-base text-neutral-800 max-md:mr-2.5 max-md:max-w-full">
                      {paper.description}
                    </p>
                    <div className="self-start mt-7 text-base text-sky-900">
                      {paper.department}
                    </div>
                  </div>
                </article>
              ))}

              <div className="flex gap-10 self-end mt-4 text-xs font-semibold tracking-wide text-slate-500 max-md:mr-2.5">
                <div className="basis-auto">Rows per page: 5</div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/8e29a0ad94996b532b19cd0e968585b8ceb69861260ed667891dc4df2486e74d?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                  className="object-contain shrink-0 my-auto w-2 aspect-[1.6] fill-slate-500"
                  alt="Dropdown icon"
                />
                <div className="flex gap-7 items-start">
                  <div className="self-stretch">1-2 of 250</div>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/50a83fa7ebc907e098614dc0c26babcadb79777ed3870782579f5c757a43f365?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                    className="object-contain shrink-0 w-1.5 aspect-[0.6] fill-slate-500"
                    alt="Previous page"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/1422d2fb88e649dbd9e98e5e0ae1f3d31fe1cf5c52730537f0c558eb14410c87?placeholderIfAbsent=true&apiKey=8e7c4b8b7304489d881fbe06845d5e47"
                    className="object-contain shrink-0 w-1.5 aspect-[0.6] fill-slate-500"
                    alt="Next page"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="ml-5 w-[29%] max-md:ml-0 max-md:w-full">
            <aside className="overflow-hidden px-5 py-7 mx-auto w-full bg-white rounded-xl max-md:px-5 max-md:mt-4 max-md:max-w-full">
              <div className="flex gap-5 justify-between items-start max-w-full text-xs font-bold tracking-tight leading-loose w-[362px]">
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

              <div className="flex gap-5 mt-5">
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
                        className={`self-stretch text-base font-bold tracking-tight leading-4 text-blue-950 ${
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
  );
};

export default HomePage;
