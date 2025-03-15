import { useState, useEffect } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Settings, X } from "lucide-react";
import { Button, Modal, message, InputNumber, Input } from "antd";
import { MathJaxContext } from "better-react-mathjax";
import EditScoringFormulaPage from "./EditScoringFormulaPage";
import userApi from "../../../api/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddScoringFormulaPage from "./AddScoringFormulaPage";

const ItemTypes = {
  ATTRIBUTE: "attribute",
};

const DraggableAttribute = ({ attribute, onSettingsClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ATTRIBUTE,
    item: { attribute },
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
      <span className="text-sm font-medium">{attribute.name}</span>
      <div className="flex gap-1">
        <button
          className="p-1 rounded-full text-gray-500 hover:bg-gray-50"
          onClick={() => onSettingsClick(attribute)}
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
    accept: ItemTypes.ATTRIBUTE,
    drop: (item) => addAttributeToSlot(item.attribute),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const addAttributeToSlot = (attribute) => {
    setFormula((prevFormula) => {
      const newFormula = [...prevFormula];

      // Ensure the array has enough elements
      while (newFormula.length < index + 1) {
        newFormula.push(null);
      }

      // Check if the attribute already exists
      if (
        !newFormula.some((slot) => slot && slot.attribute._id === attribute._id)
      ) {
        newFormula[index] = { attribute, weight: 1 };
        return newFormula;
      } else {
        message.error("Thuộc tính này đã được thêm vào công thức.");
        return prevFormula;
      }
    });
  };

  const removeAttribute = () => {
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
          <span className="text-sm font-medium">
            {formula[index].attribute.name}
          </span>
          {isEditing && (
            <button
              className="p-1 rounded-full text-red-500 hover:bg-red-50"
              onClick={removeAttribute}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </>
      ) : (
        <span className="text-gray-400">Kéo thuộc tính vào đây</span>
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

  const handleWeightChange = (index, value) => {
    const newFormula = [...formula];
    if (newFormula[index]) {
      newFormula[index].weight = value;
      setFormula(newFormula);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-wrap items-center space-x-2">
        <span className="text-base font-semibold text-cyan-500">
          Điểm đóng góp =
        </span>
        {formula.map((slot, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-sm font-medium">{slot?.attribute?.name}</span>
            <span className="text-lg font-semibold">×</span>
            <span className="text-sm font-medium">{slot?.weight}</span>
            {index < formula.length - 1 && (
              <span className="text-lg font-semibold">+</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center space-x-2">
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
            value={formula[index]?.weight || 1}
            onChange={(value) => handleWeightChange(index, value)}
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
          Thêm thuộc tính
        </Button>
      )}
    </div>
  );
};

const ManagementFormulas = () => {
  const [showAddFormulasPopup, setShowAddFormulasPopup] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [recentFormulas, setRecentFormulas] = useState([]);
  const [currentFormula, setCurrentFormula] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [years, setYears] = useState([2025, 2024, 2023, 2022, 2021, 2020]);
  const [newYear, setNewYear] = useState("");

  const getFormulas = async (year) => {
    try {
      const response = await userApi.getFormulaByYear(year);
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching formulas:", error);
      return null; // Return null if there's an error
    }
  };

  const getAttributes = async (year) => {
    try {
      const response = await userApi.getAttributeByYear(year);
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching attributes:", error);
      return []; // Return empty array if there's an error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attributesData = await getAttributes(selectedYear);
        const formulasData = await getFormulas(selectedYear);
        setAttributes(
          Array.isArray(attributesData) ? attributesData : [attributesData]
        );
        setRecentFormulas(
          Array.isArray(formulasData) ? formulasData : [formulasData]
        ); // Ensure recentFormulas is always an array
        setCurrentFormula(formulasData?.formula || []); // Initialize with weights from the API
      } catch (error) {
        console.error("Error fetching data:", error);
        setAttributes([]);
        setRecentFormulas([]);
        setCurrentFormula([]);
      }
    };

    fetchData();
  }, [selectedYear]);

  const handleSettingsClick = (attribute) => {
    setSelectedAttribute(attribute);
    setSettingsModalVisible(true);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleAddYear = () => {
    const year = parseInt(newYear, 10);
    if (!isNaN(year) && !years.includes(year)) {
      setYears([...years, year].sort((a, b) => b - a));
      setSelectedYear(year);
      setNewYear("");
      setAttributes([]);
      setRecentFormulas([]);
      setCurrentFormula([]);
    } else {
      message.error("Năm không hợp lệ hoặc đã tồn tại.");
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveAttribute = (updatedAttribute) => {
    setAttributes((prevAttributes) =>
      prevAttributes.map((a) =>
        a._id === updatedAttribute._id ? updatedAttribute : a
      )
    );
  };

  const handleAddAttribute = (newAttribute) => {
    setAttributes((prevAttributes) => [...prevAttributes, newAttribute]);
  };

  const handleSaveFormula = async () => {
    const totalWeight = currentFormula.reduce(
      (sum, slot) => sum + (slot?.weight || 0),
      0
    );
    if (totalWeight !== 100) {
      message.error("Tổng các hệ số phải bằng 100%");
      return;
    }

    try {
      const formulaData = {
        formula: currentFormula,
      };
      const existingFormula = await getFormulas(selectedYear);
      let response;
      if (existingFormula) {
        response = await userApi.updateFormula(selectedYear, formulaData);
      } else {
        response = await userApi.createFormula({
          year: selectedYear,
          ...formulaData,
        });
      }
      console.log("Saved Formula:", response);
      message.success("Lưu công thức thành công!");
      setRecentFormulas((prevFormulas) =>
        prevFormulas.map((f) => (f.year === selectedYear ? response : f))
      );
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving formula:", error);
      message.error("Lỗi khi lưu công thức.");
    }
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
              <div className="flex justify-end mb-4 gap-2">
                <select
                  className="p-2 px-4 border rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Thêm năm mới"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-32"
                />
                <Button
                  className="bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleAddYear}
                >
                  Thêm năm
                </Button>
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
                        onClick={isEditing ? handleSaveFormula : toggleEditMode}
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
                        {recentFormulas.map(
                          (item) =>
                            item && (
                              <tr key={item.year} className="border-t">
                                <td className="px-4 py-3">{item.year}</td>
                                <td className="px-4 py-3 font-mono text-sm">
                                  <div className="flex flex-wrap gap-1">
                                    {item.formula.map((f, index) => (
                                      <span key={f.attribute._id}>
                                        <strong>{f.attribute.name}</strong>:{" "}
                                        {f.weight}
                                        {index < item.formula.length - 1 && (
                                          <span className="mx-1">+</span>
                                        )}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attributes Section */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-gray-700">
                      CÁC THUỘC TÍNH TÍNH ĐIỂM ĐÓNG GÓP
                    </h2>
                    <Button
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => setShowAddFormulasPopup(true)}
                    >
                      Thêm
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {attributes.map(
                      (attribute) =>
                        attribute && (
                          <DraggableAttribute
                            key={attribute._id}
                            attribute={attribute}
                            onSettingsClick={handleSettingsClick}
                          />
                        )
                    )}
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
              selectedYear={selectedYear}
              onAddAttribute={handleAddAttribute}
            />
          </Modal>

          <Modal
            title="Chỉnh sửa thuộc tính"
            open={settingsModalVisible}
            onCancel={() => setSettingsModalVisible(false)}
            footer={null}
            centered
            width={600}
            closable={false}
          >
            <EditScoringFormulaPage
              onClose={() => setSettingsModalVisible(false)}
              data={selectedAttribute}
            />
          </Modal>

          <Footer />
        </div>
      </MathJaxContext>
    </DndProvider>
  );
};

export default ManagementFormulas;
