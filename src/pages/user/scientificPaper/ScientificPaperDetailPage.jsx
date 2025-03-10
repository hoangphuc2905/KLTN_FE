import { Button, Descriptions } from "antd";
import { useParams, useLocation } from "react-router-dom"; // Import useLocation
import { useState, useEffect } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";

const ScientificPaperDetailPage = () => {
  const { id } = useParams();
  const location = useLocation(); // Get location object
  const [paperDetails, setPaperDetails] = useState(
    location.state?.paperDetails || null
  ); // Use default data from location state
  const [loading, setLoading] = useState(!paperDetails); // Set loading based on initial data

  useEffect(() => {
    if (!paperDetails) {
      const fetchPaperDetails = async () => {
        setLoading(true);
        const response = await fetch(`/api/scientific-papers/${id}`);
        const data = await response.json();
        setPaperDetails(data);
        setLoading(false);
      };

      fetchPaperDetails();
    }
  }, [id, paperDetails]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
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
              Chi tiết bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 mt-4">
          <section className="flex flex-col bg-white rounded-lg p-6 mb-6">
            <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
              Chi tiết bài báo
            </h2>
            <Descriptions bordered>
              <Descriptions.Item label="ID">
                {paperDetails.id}
              </Descriptions.Item>
              <Descriptions.Item label="Tên bài báo (Tiếng Việt)">
                {paperDetails.titleVietnamese}
              </Descriptions.Item>
              <Descriptions.Item label="Tên bài báo (Tiếng Anh)">
                {paperDetails.titleEnglish}
              </Descriptions.Item>
              <Descriptions.Item label="Loại bài báo">
                {paperDetails.type}
              </Descriptions.Item>
              <Descriptions.Item label="Thuộc nhóm">
                {paperDetails.group}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày công bố">
                {paperDetails.publicationDate}
              </Descriptions.Item>
              <Descriptions.Item label="Số trang">
                {paperDetails.pageCount}
              </Descriptions.Item>
              <Descriptions.Item label="Thứ tự">
                {paperDetails.order}
              </Descriptions.Item>
              <Descriptions.Item label="Số ISSN / ISBN">
                {paperDetails.issnIsbn}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tạp chí / kỷ yếu (Tiếng Việt)">
                {paperDetails.journalVietnamese}
              </Descriptions.Item>
              <Descriptions.Item label="Tên tạp chí / kỷ yếu (Tiếng Anh)">
                {paperDetails.journalEnglish}
              </Descriptions.Item>
              <Descriptions.Item label="Tập / quyển">
                {paperDetails.volume}
              </Descriptions.Item>
              <Descriptions.Item label="Tóm tắt">
                {paperDetails.abstract}
              </Descriptions.Item>
              <Descriptions.Item label="Link công bố bài báo">
                <a
                  href={paperDetails.publicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {paperDetails.publicationLink}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Số DOI">
                {paperDetails.doi}
              </Descriptions.Item>
            </Descriptions>
            <div className="flex justify-end space-x-4 mt-6">
              <Button type="primary">Chỉnh sửa</Button>
              <Button danger>Xóa</Button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScientificPaperDetailPage;
