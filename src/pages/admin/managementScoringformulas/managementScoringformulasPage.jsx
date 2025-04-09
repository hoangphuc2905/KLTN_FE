import { useState, useEffect, useRef } from "react";
import Header from "../../../components/header";
import Footer from "../../../components/footer";
import { Settings, X, Filter } from "lucide-react";
import {
  Button,
  Modal,
  message,
  InputNumber,
  Input,
  DatePicker,
  Table,
} from "antd";
import { MathJaxContext } from "better-react-mathjax";
import EditScoringFormulaPage from "./EditScoringFormulaPage";
import userApi from "../../../api/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddScoringFormulaPage from "./AddScoringFormulaPage";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // Import dayjs for date handling

const ItemTypes = {
  ATTRIBUTE: "attribute",
};

const attributeNames = {
  journal_group: "NHÓM TẠP CHÍ",
  author_role: "VAI TRÒ",
  institution_count: "CƠ QUAN ĐỨNG TÊN",
  doi: "DOI",
  exemplary_paper: "TIÊU BIỂU",
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
      <span className="text-sm font-medium">
        {attributeNames[attribute.name] || attribute.name}
      </span>
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
            {attributeNames[formula[index].attribute.name] ||
              formula[index].attribute.name}
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
            <span className="text-sm font-medium">
              {attributeNames[slot?.attribute?.name] || slot?.attribute?.name}
            </span>
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
  const [attributes, setAttributes] = useState([]);
  const [recentFormulas, setRecentFormulas] = useState([]);
  const [currentFormula, setCurrentFormula] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [addAttributeModalVisible, setAddAttributeModalVisible] =
    useState(false); // State for modal visibility
  const [showFilter, setShowFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const navigate = useNavigate();

  const filterRef = useRef(null);

  const filteredFormulas = recentFormulas.filter((formula) => {
    const startDateMatch =
      !filterStartDate ||
      dayjs(formula.startDate).isSameOrAfter(filterStartDate, "day");
    const endDateMatch =
      !filterEndDate ||
      (formula.endDate &&
        dayjs(formula.endDate).isSameOrBefore(filterEndDate, "day"));
    return startDateMatch && endDateMatch;
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showFilter &&
        filterRef.current &&
        !filterRef.current.contains(event.target) &&
        !event.target.closest(".ant-picker-dropdown")
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const getFormulas = async (startDate, endDate) => {
    try {
      const response = await userApi.getFormulaByDateRange(startDate, endDate);
      console.log("API Response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching formulas:", error);
      return null;
    }
  };
  const handleSettingsClick = (attribute) => {
    setSelectedAttribute(attribute);
    setSettingsModalVisible(true);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      const defaultFormula = recentFormulas.find(
        (formula) => formula.endDate === null
      );
      if (defaultFormula) {
        setStartDate(defaultFormula.startDate);
        setEndDate(defaultFormula.endDate);
      }
    }
  };

  const handleSaveAttribute = (updatedAttribute) => {
    setAttributes((prevAttributes) =>
      prevAttributes.map((a) =>
        a._id === updatedAttribute._id ? updatedAttribute : a
      )
    );
  };

  const handleAddAttribute = async (newAttribute) => {
    try {
      const response = await userApi.createAttribute(newAttribute);
      setAttributes((prevAttributes) => [...prevAttributes, response]);
      message.success("Thêm thuộc tính thành công!");
    } catch (error) {
      console.error("Error adding attribute:", error);
      message.error("Lỗi khi thêm thuộc tính.");
    }
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
        startDate: startDate ? dayjs(startDate).toISOString() : null, // Save start date
        endDate: endDate ? dayjs(endDate).toISOString() : null, // Save end date
      };

      const response = await userApi.createFormula(formulaData);
      console.log("Saved Formula:", response);
      message.success("Lưu công thức thành công!");
      setRecentFormulas((prevFormulas) => [...prevFormulas, response]);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving formula:", error);
      message.error("Lỗi khi lưu công thức.");
    }
  };

  const formatDate = (isoDate) => {
    return dayjs(isoDate).format("DD-MM-YYYY");
  };

  const getAttributeNameById = async (attributeId) => {
    try {
      const response = await userApi.getAttributeById(attributeId); // Pass the ID directly
      console.log("Attribute Name Response:", response);
      return response.name;
    } catch (error) {
      console.error(
        `Error fetching attribute name for ID ${attributeId}:`,
        error.response?.data || error.message
      );
      return "Unknown";
    }
  };

  const attachAttributeNames = async (formulas) => {
    const updatedFormulas = await Promise.all(
      formulas.map(async (formula) => {
        const updatedFormula = await Promise.all(
          formula.formula.map(async (slot) => {
            const attributeName = await getAttributeNameById(slot.attribute);
            return {
              ...slot,
              attribute: {
                _id: slot.attribute,
                name: attributeName,
              },
            };
          })
        );
        return { ...formula, formula: updatedFormula };
      })
    );
    return updatedFormulas;
  };

  useEffect(() => {
    const fetchAllFormulas = async () => {
      try {
        const response = await userApi.getAllFormula();
        const formulasWithNames = await attachAttributeNames(response || []);
        setRecentFormulas(formulasWithNames);
      } catch (error) {
        console.error("Error fetching all formulas:", error);
        setRecentFormulas([]);
      }
    };

    fetchAllFormulas();
  }, []);

  useEffect(() => {
    const fetchDefaultFormula = async () => {
      try {
        const response = await userApi.getAllFormula();
        const formulasWithNames = await attachAttributeNames(response || []);

        // Select the formula with an endDate that hasn't passed or is null
        const defaultFormula = formulasWithNames.find(
          (formula) =>
            !formula.endDate || dayjs(formula.endDate).isAfter(dayjs(), "day")
        );

        setCurrentFormula(defaultFormula?.formula || []);
        setStartDate(defaultFormula?.startDate || null);
        setEndDate(defaultFormula?.endDate || null);
      } catch (error) {
        console.error("Error fetching default formula:", error);
        setCurrentFormula([]);
      }
    };

    fetchDefaultFormula();
  }, []);

  useEffect(() => {
    const fetchAllAttributes = async () => {
      try {
        const response = await userApi.getAllAttributes(); // Fetch all attributes
        setAttributes(response || []);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        setAttributes([]); // Clear attributes on error
      }
    };

    fetchAllAttributes();
  }, []);

  const defaultFormula = recentFormulas.find(
    (formula) => formula.endDate === null
  );
  useEffect(() => {
    if (defaultFormula) {
      setStartDate(defaultFormula.startDate);
      setEndDate(defaultFormula.endDate);
    }
  }, [recentFormulas]);

  const handleFilterStartDateChange = (date) => {
    console.log("Selected Start Date:", date?.format("YYYY-MM-DD")); // Debugging log
    if (filterEndDate && date && date.isSameOrAfter(filterEndDate, "day")) {
      message.error("Ngày bắt đầu phải trước ngày kết thúc.");
      return;
    }
    setFilterStartDate(date);
  };

  const handleFilterEndDateChange = (date) => {
    console.log("Selected End Date:", date?.format("YYYY-MM-DD")); // Debugging log
    if (
      filterStartDate &&
      date &&
      date.isSameOrBefore(filterStartDate, "day")
    ) {
      message.error("Ngày kết thúc phải sau ngày bắt đầu.");
      return;
    }
    setFilterEndDate(date);
  };

  const columns = [
    {
      title: "NGÀY BẮT ĐẦU",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => formatDate(text),
    },
    {
      title: "NGÀY KẾT THÚC",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => (text ? formatDate(text) : formatDate(new Date())), // Always format the date
    },
    {
      title: "CÔNG THỨC",
      dataIndex: "formula",
      key: "formula",
      render: (formula) => (
        <div className="flex flex-wrap items-center space-x-2">
          <span className="text-base font-semibold text-cyan-500">
            Điểm đóng góp =
          </span>
          {formula.map((slot, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                {attributeNames[slot?.attribute?.name] || slot?.attribute?.name}
              </span>
              <span className="text-lg font-semibold">×</span>
              <span className="text-sm font-medium">{slot?.weight}</span>
              {index < formula.length - 1 && (
                <span className="text-lg font-semibold">+</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const dataSource = recentFormulas.map((item, index) => ({
    key: index,
    startDate: item.startDate,
    endDate: item.endDate,
    formula: item.formula,
  }));

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
                <span
                  onClick={() => navigate("/home")}
                  className="cursor-pointer hover:text-blue-500"
                >
                  Trang chủ
                </span>
                <span className="text-gray-400"> &gt; </span>
                <span className="font-semibold text-sky-900">
                  Quản lý công thức điểm
                </span>
              </div>
            </div>

            <div className="self-center w-full max-w-[1563px] px-6 mt-4">
              <div className="grid grid-cols-3 gap-6">
                {/* Attributes Section */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-gray-700">
                      CÁC THUỘC TÍNH TÍNH ĐIỂM ĐÓNG GÓP
                    </h2>
                    <Button
                      className="bg-blue-500 text-white hover:bg-blue-600"
                      onClick={() => setAddAttributeModalVisible(true)}
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

                {/* Formula Section */}
                <div className="col-span-2 space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-gray-700">
                        CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP
                        {startDate && (
                          <span className="text-sm text-gray-500 ml-2">
                            ({formatDate(startDate)} đến{" "}
                            {formatDate(endDate || new Date())})
                          </span>
                        )}
                      </h2>
                      <Button
                        className="bg-blue-500 text-white hover:bg-blue-600"
                        onClick={isEditing ? handleSaveFormula : toggleEditMode}
                      >
                        {isEditing ? "Lưu" : "Chỉnh sửa"}
                      </Button>
                    </div>
                    {isEditing && (
                      <div className="flex gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 text-sm mb-1">
                            Ngày bắt đầu:
                          </label>
                          <DatePicker
                            value={startDate ? dayjs(startDate) : null} // Use dayjs object directly
                            onChange={(date) =>
                              setStartDate(date ? date.toISOString() : null)
                            } // Convert back to ISO string
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-sm mb-1">
                            Ngày kết thúc:
                          </label>
                          <DatePicker
                            value={endDate ? dayjs(endDate) : null} // Use dayjs object directly
                            onChange={(date) =>
                              setEndDate(date ? date.toISOString() : null)
                            } // Convert back to ISO string
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                    <DroppableFormulaArea
                      formula={currentFormula}
                      setFormula={setCurrentFormula}
                      isEditing={isEditing}
                    />
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-semibold text-gray-700">
                        TẤT CẢ CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP QUA CÁC KỲ
                      </h2>
                      <div className="relative">
                        <button
                          className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs"
                          onClick={() => setShowFilter(!showFilter)}
                        >
                          <Filter className="w-4 h-4" />
                          <span className="text-xs">Bộ lọc</span>
                        </button>
                        {showFilter && (
                          <div
                            ref={filterRef}
                            className="absolute top-full mt-2 z-50 shadow-lg bg-white rounded-lg right-0"
                          >
                            <form className="relative px-4 py-5 bg-white w-[200px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                              <div className="mb-3">
                                <label className="block text-gray-700 text-xs">
                                  Ngày bắt đầu:
                                </label>
                                <DatePicker
                                  value={filterStartDate} // Use dayjs object directly
                                  onChange={handleFilterStartDateChange}
                                  className="w-full date-picker"
                                  getPopupContainer={(triggerNode) =>
                                    triggerNode.parentNode
                                  }
                                />
                                <label className="block text-gray-700 text-xs">
                                  Ngày kết thúc:
                                </label>
                                <DatePicker
                                  value={filterEndDate} // Use dayjs object directly
                                  onChange={handleFilterEndDateChange}
                                  className="w-full date-picker"
                                  disabledDate={(current) =>
                                    filterStartDate &&
                                    current &&
                                    current.isSameOrBefore(
                                      filterStartDate,
                                      "day"
                                    )
                                  }
                                  getPopupContainer={(triggerNode) =>
                                    triggerNode.parentNode
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFilterStartDate(null);
                                  setFilterEndDate(null);
                                }}
                                className="w-full mt-2 bg-blue-500 text-white py-1 rounded-md text-xs"
                              >
                                Bỏ lọc tất cả
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                    <Table
                      columns={columns}
                      dataSource={filteredFormulas}
                      scroll={{ x: "max-content" }} // Enable horizontal scrolling
                      pagination={{ pageSize: 5 }} // Enable pagination with 5 rows per page
                    />
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
              selectedYear={null}
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

          <Modal
            title="Thêm thuộc tính"
            open={addAttributeModalVisible}
            onCancel={() => setAddAttributeModalVisible(false)}
            footer={null}
            centered
            width={600}
            closable={false}
          >
            <AddScoringFormulaPage
              onClose={() => setAddAttributeModalVisible(false)}
              selectedYear={null}
              onAddAttribute={handleAddAttribute}
            />
          </Modal>

          <Footer />
        </div>
      </MathJaxContext>
    </DndProvider>
  );
};

export default ManagementFormulas;
