import { useState, useEffect } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Settings, X } from "lucide-react";
import { Button, Modal, message, InputNumber } from "antd";
import { MathJaxContext } from "better-react-mathjax";
import ShowScoringFormulaPage from "./ShowScoringFormulaPage";
import userApi from "../../../api/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddScoringFormulaPage from "./AddScoringFormulaPage";

const ItemTypes = {
  CRITERION: "criterion",
};

const DraggableCriterion = ({ criterion, onSettingsClick }) => {
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
      className={`flex items-center justify-between p-2 border rounded-lg shadow-sm ${
        isDragging ? "opacity-50" : "bg-white"
      } hover:shadow-md transition-shadow`}
    >
      <span className="text-sm font-medium">{criterion.name}</span>
      <div className="flex gap-1">
        <button
          className="p-1 rounded-full text-gray-500 hover:bg-gray-50"
          onClick={() => onSettingsClick(criterion)}
        >
          <Settings className="w-4 h-4" />
        </button>
        <button className="p-1 rounded-full text-red-500 hover:bg-red-50">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const DroppableSlot = ({ index, formula, setFormula, isEditing }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CRITERION,
    drop: (item) => addCriterionToSlot(item.criterion),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addCriterionToSlot = (criterion) => {
    setFormula((prevFormula) => {
      const newFormula = [...prevFormula];

      // Ensure the array has enough elements
      while (newFormula.length < index + 1) {
        newFormula.push(null);
      }

      // Check if the criterion already exists
      if (!newFormula.some((slot) => slot && slot.name === criterion.name)) {
        newFormula[index] = { ...criterion, coefficient: 1 };
        return newFormula;
      } else {
        message.error("Tiêu chí này đã được thêm vào công thức.");
        return prevFormula;
      }
    });
  };

  const removeCriterion = () => {
    setFormula((prevFormula) => {
      const newFormula = [...prevFormula];
      if (newFormula[index]) {
        newFormula[index] = null;
      }
      return newFormula;
    });
  };

  return (
    <div
      ref={isEditing ? drop : null}
      className={`flex items-center justify-between p-2 border rounded-lg shadow-sm ${
        isOver ? "bg-blue-100" : "bg-white"
      } transition-colors`}
    >
      {formula[index] ? (
        <>
          <span className="text-sm font-medium">{formula[index].name}</span>
          {isEditing && (
            <button
              className="p-1 rounded-full text-red-500 hover:bg-red-50"
              onClick={removeCriterion}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </>
      ) : (
        <span className="text-gray-400">Kéo tiêu chí vào đây</span>
      )}
    </div>
  );
};

const DroppableFormulaArea = ({ formula, setFormula, isEditing }) => {
  const addSlot = () => {
    setFormula([...formula, null]);
  };

  const removeSlot = (index) => {
    const newFormula = [...formula];
    newFormula.splice(index, 1);
    setFormula(newFormula);
  };

  const handleCoefficientChange = (index, value) => {
    const newFormula = [...formula];
    if (newFormula[index]) {
      newFormula[index].coefficient = value;
      setFormula(newFormula);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {formula.map((slot, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-sm font-medium">{slot?.name}</span>
            <span className="text-lg font-semibold">×</span>
            <span className="text-sm font-medium">{slot?.coefficient}</span>
            {index < formula.length - 1 && (
              <span className="text-lg font-semibold">+</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {formula.map((slot, index) => (
        <div key={index} className="flex items-center space-x-2">
          <DroppableSlot
            index={index}
            formula={formula}
            setFormula={setFormula}
            isEditing={isEditing}
          />
          <span className="text-lg font-semibold">×</span>
          <InputNumber
            min={0}
            value={formula[index]?.coefficient || 1}
            onChange={(value) => handleCoefficientChange(index, value)}
            className="mx-2"
            disabled={!isEditing}
          />
          {index < formula.length - 1 && (
            <span className="text-lg font-semibold">+</span>
          )}
          {isEditing && (
            <button
              className="ml-2 p-1 rounded-full text-red-500 hover:bg-red-50"
              onClick={() => removeSlot(index)}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      {isEditing && (
        <Button
          onClick={addSlot}
          className="mt-4 bg-blue-500 text-white hover:bg-blue-600"
        >
          Thêm tiêu chí
        </Button>
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
  const [isEditing, setIsEditing] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState(null);

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
        setCurrentFormula(data.formula.map((f) => ({ ...f, coefficient: 1 }))); // Initialize with coefficients
      } catch (error) {
        console.error("Error fetching criteria:", error);
        message.error("Lỗi kết nối đến server hoặc không tìm thấy dữ liệu");
      }
    };

    fetchCriteria();
  }, [selectedYear]);

  const handleSettingsClick = (criterion) => {
    setSelectedCriterion(criterion);
    setSettingsModalVisible(true);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveCriterion = (updatedCriterion) => {
    setCriteria((prevCriteria) =>
      prevCriteria.map((c) =>
        c._id === updatedCriterion._id ? updatedCriterion : c
      )
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MathJaxContext>
        <div className="bg-[#E7ECF0] min-h-screen">
          <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
            <div className="w-full bg-white shadow-md">
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
                  className="p-2 px-4 border rounded-lg bg-blue-500 text-white hover:bg-blue-600"
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
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-gray-700">
                        CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP
                      </h2>
                      <Button
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={toggleEditMode}
                      >
                        {isEditing ? "Lưu" : "Chỉnh sửa"}
                      </Button>
                    </div>
                    <DroppableFormulaArea
                      formula={currentFormula}
                      setFormula={setCurrentFormula}
                      isEditing={isEditing}
                    />
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md">
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
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-gray-700">
                      CÁC TIÊU CHÍ TÍNH ĐIỂM ĐÓNG GÓP
                    </h2>
                    <Button
                      className="bg-blue-500 text-white hover:bg-blue-600"
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
                        onSettingsClick={handleSettingsClick}
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
            <AddScoringFormulaPage
              onClose={() => setShowAddFormulasPopup(false)}
              selectedYear={selectedYear} // Pass the selectedYear prop here
              data={selectedData}
            />
          </Modal>

          <Modal
            title="Chỉnh sửa tiêu chí"
            open={settingsModalVisible}
            onCancel={() => setSettingsModalVisible(false)}
            footer={null}
            centered
            width={600}
            closable={false}
          >
            <ShowScoringFormulaPage
              onClose={() => setSettingsModalVisible(false)}
              data={selectedCriterion}
            />
          </Modal>

          <Footer />
        </div>
      </MathJaxContext>
    </DndProvider>
  );
};

export default ManagementFormulas;
