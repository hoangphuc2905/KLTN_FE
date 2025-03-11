import { useState, useEffect } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Settings, X } from "lucide-react";
import { Button, Modal, message } from "antd";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import ShowScoringFormulaPage from "./ShowScoringFormulaPage";
import userApi from "../../../api/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  CRITERION: "criterion",
};

const DraggableCriterion = ({ criterion }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CRITERION,
    item: { criterion },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex items-center justify-between p-2 border rounded-lg ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span className="text-xs">{criterion.name}</span>
      <div className="flex gap-1">
        <button className="p-1 rounded-full text-red-500 hover:bg-red-50">
          <X className="w-4 h-4" />
        </button>
        <button className="p-1 rounded-full text-gray-500 hover:bg-gray-50">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const DroppableFormulaArea = ({ formula, setFormula }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CRITERION,
    drop: (item) => addCriterionToFormula(item.criterion),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addCriterionToFormula = (criterion) => {
    setFormula((prevFormula) => [...prevFormula, criterion]);
  };

  return (
    <div
      ref={drop}
      className={`h-[200px] border rounded-lg flex items-center justify-center p-4 ${
        isOver ? "bg-blue-100" : ""
      }`}
    >
      {formula.length > 0 ? (
        <MathJax>{`$$${formula.map((c) => c.name).join(" + ")}$$`}</MathJax>
      ) : (
        <span className="text-gray-400">
          Kéo các tiêu chí vào đây để tạo công thức
        </span>
      )}
    </div>
  );
};

const ManagementFormulas = () => {
  const [showAddFormulasPopup, setShowAddFormulasPopup] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [recentFormulas, setRecentFormulas] = useState([]);
  const [currentFormula, setCurrentFormula] = useState([]);

  const getFormulas = async (year) => {
    try {
      const response = await userApi.getFormulas(year);
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching formulas:", error);
      throw error.response?.data || "Lỗi kết nối đến server";
    }
  };

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const data = await getFormulas(selectedYear);
        setCriteria(data.formula);
        setRecentFormulas([data]); // Assuming the API returns a single formula object for the selected year
      } catch (error) {
        console.error("Error fetching criteria:", error);
        message.error("Lỗi kết nối đến server hoặc không tìm thấy dữ liệu");
      }
    };

    fetchCriteria();
  }, [selectedYear]);

  const handleSettingsClick = (criterion) => {
    setSelectedData(criterion);
    setShowAddFormulasPopup(true);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MathJaxContext>
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
                  Quản lý công thức điểm
                </span>
              </div>
            </div>

            <div className="self-center w-full max-w-[1563px] px-6 mt-6">
              <div className="flex justify-end mb-4">
                <select
                  className="p-2 px-4 border rounded-lg bg-[#00A3FF] text-white"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Formula Section */}
                <div className="col-span-2 space-y-6">
                  <div className="bg-white rounded-xl p-6">
                    <h2 className="font-semibold text-gray-700 mb-4">
                      CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP
                    </h2>
                    <DroppableFormulaArea
                      formula={currentFormula}
                      setFormula={setCurrentFormula}
                    />
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
                              {item.formula.map((f) => (
                                <div key={f._id}>
                                  <strong>{f.name}</strong>: {f.description}{" "}
                                  (Weight: {f.weight})
                                  <ul>
                                    {Object.entries(f.values).map(
                                      ([key, value]) => (
                                        <li key={key}>
                                          {key}: {value}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Criteria Section */}
                <div className="bg-white rounded-xl p-6">
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
                    {criteria.map((criterion) => (
                      <DraggableCriterion
                        key={criterion._id}
                        criterion={criterion}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Modal
            title="Hiển thị công thức tính điểm"
            open={showAddFormulasPopup}
            onCancel={() => setShowAddFormulasPopup(false)}
            footer={null}
            centered
            width={600}
            closable={false}
          >
            <ShowScoringFormulaPage
              onClose={() => setShowAddFormulasPopup(false)}
              data={selectedData}
            />
          </Modal>

          <Footer />
        </div>
      </MathJaxContext>
    </DndProvider>
  );
};

export default ManagementFormulas;
