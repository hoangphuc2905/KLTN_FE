import { useState } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Home, Settings, X } from "lucide-react";
import { Button, Modal } from "antd";
import ShowScoringFormulaPage from "./ShowScoringFormulaPage";

const ManagementFormulas = () => {
  const [showAddFormulasPopup, setShowAddFormulasPopup] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const criteria = [
    { id: 1, name: "NHÓM TẠP CHÍ" },
    { id: 2, name: "VAI TRÒ" },
    { id: 3, name: "CƠ ĐỨNG TÊN" },
    { id: 4, name: "DOI" },
    { id: 5, name: "TIÊU BIỂU" },
  ];

  const recentFormulas = [
    {
      year: 2025,
      formula:
        "((NHÓM TẠP CHÍ * 10) + (VAI TRÒ * 30) + (CƠ ĐỨNG TÊN * 20) + (DOI * 20))",
    },
    {
      year: 2024,
      formula:
        "((NHÓM TẠP CHÍ * 10) + (VAI TRÒ * 30) + (CƠ ĐỨNG TÊN * 20) + (DOI * 20))",
    },
    {
      year: 2023,
      formula:
        "((NHÓM TẠP CHÍ * 10) + (VAI TRÒ * 30) + (CƠ ĐỨNG TÊN * 20) + (DOI * 20))",
    },
    {
      year: 2022,
      formula:
        "((NHÓM TẠP CHÍ * 10) + (VAI TRÒ * 30) + (CƠ ĐỨNG TÊN * 20) + (DOI * 20))",
    },
  ];

  const handleSettingsClick = (criterion) => {
    setSelectedData(criterion);
    setShowAddFormulasPopup(true);
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
        <div className="w-full bg-white">
          <Header />
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Home className="w-5 h-5 text-[#00A3FF]" />
            <span>Quản lý công thức điểm</span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-6 mt-6">
          <div className="flex justify-end mb-4">
            <select className="p-2 px-4 border rounded-lg bg-[#00A3FF] text-white">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {" "}
            {/* Changed to 3 columns grid */}
            {/* Formula Section */}
            <div className="col-span-2 space-y-6">
              {" "}
              {/* Span 2 columns (65%) */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-semibold text-gray-700 mb-4">
                  CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP
                </h2>
                <div className="h-[200px] border rounded-lg"></div>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-semibold text-gray-700 mb-4">
                  CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP GẦN ĐÂY
                </h2>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F7FB]">
                      <th className="px-4 py-3 text-left text-gray-700">
                        NĂM (HỌC KÌ)
                      </th>
                      <th className="px-4 py-3 text-left text-gray-700">
                        CÔNG THỨC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFormulas.map((item) => (
                      <tr key={item.year} className="border-t">
                        <td className="px-4 py-3">{item.year}</td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {item.formula}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Criteria Section */}
            <div className="bg-white rounded-xl p-6">
              {" "}
              {/* Span 1 column (35%) */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700">
                  CÁC TIÊU CHÍ TÍNH ĐIỂM ĐÓNG GÓP
                </h2>
                <Button
                  className="bg-[#00A3FF]"
                  onClick={() => setShowAddFormulasPopup(true)}
                >
                  Thêm
                </Button>
              </div>
              <div className="space-y-2">
                {" "}
                {/* Reduced space between criteria */}
                {criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-center justify-between p-2 border rounded-lg" // Reduced padding
                  >
                    <span className="text-xs">{criterion.name}</span>{" "}
                    {/* Reduced font size */}
                    <div className="flex gap-1">
                      {" "}
                      {/* Reduced gap between buttons */}
                      <button className="p-1 rounded-full text-red-500 hover:bg-red-50">
                        <X className="w-4 h-4" /> {/* Reduced icon size */}
                      </button>
                      <button
                        className="p-1 rounded-full text-gray-500 hover:bg-gray-50"
                        onClick={() => handleSettingsClick(criterion)}
                      >
                        <Settings className="w-4 h-4" />{" "}
                        {/* Reduced icon size */}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal để hiển thị popup chính giữa */}
      <Modal
        title="Hiển thị công thức tính điểm"
        open={showAddFormulasPopup}
        onCancel={() => setShowAddFormulasPopup(false)}
        footer={null}
        centered
        width={600}
        closable={false} // Ẩn nút đóng mặc định của Modal
      >
        <ShowScoringFormulaPage
          onClose={() => setShowAddFormulasPopup(false)}
          data={selectedData}
        />
      </Modal>

      <Footer />
    </div>
  );
};

export default ManagementFormulas;
