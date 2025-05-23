import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import { Settings, X, Filter } from "lucide-react";
import {
  Button,
  Modal,
  message,
  InputNumber,
  Input,
  DatePicker,
  Table,
  Spin,
} from "antd";
import { MathJaxContext } from "better-react-mathjax";
import EditScoringFormulaPage from "./EditScoringFormulaPage";
import userApi from "../../../api/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddScoringFormulaPage from "./AddScoringFormulaPage";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const ItemTypes = {
  ATTRIBUTE: "attribute",
};

const attributeNames = {
  article_group: "Nhóm bài báo",
  author_role: "Vai trò tác giả",
  institution_count: "Số cơ quan đứng tên",
  doi: "Doi",
  featured: "Tiêu biểu",
};

const DraggableAttribute = ({ attribute, onSettingsClick, onDeleteClick }) => {
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
        <button
          className="p-1 rounded-full text-red-500 hover:bg-red-50"
          onClick={() => onDeleteClick(attribute)}
        >
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
    useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [confirmSaveModalVisible, setConfirmSaveModalVisible] = useState(false);
  const [pendingFormulaData, setPendingFormulaData] = useState(null);
  const [overlappingFormula, setOverlappingFormula] = useState(null);
  const [deleteAttributeModalVisible, setDeleteAttributeModalVisible] =
    useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState(null);
  const [isSubmittingAttribute, setIsSubmittingAttribute] = useState(false); // Thêm trạng thái để ngăn gọi nhiều lần
  const isSubmittingAttributeRef = useRef(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const filterRef = useRef(null);

  const filteredFormulas = recentFormulas.filter((formula) => {
    const startDateMatch =
      !filterStartDate ||
      (formula.startDate &&
        dayjs(formula.startDate).isSameOrAfter(filterStartDate, "day"));
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
    // Kiểm tra trùng tên thuộc tính trước khi gửi API
    const existed = attributes.some(
      (attr) => attr && attr.name === newAttribute.name
    );
    if (existed) {
      message.error("Thuộc tính này đã tồn tại!");
      return;
    }
    if (isSubmittingAttribute || isSubmittingAttributeRef.current) {
      console.log("Đang gửi yêu cầu thêm thuộc tính, bỏ qua yêu cầu mới");
      return;
    }
    setIsSubmittingAttribute(true);
    isSubmittingAttributeRef.current = true;
    try {
      console.log(
        "Calling handleAddAttribute with data:",
        JSON.stringify(newAttribute, null, 2)
      );
      const response = await userApi.createAttribute(newAttribute);
      setAttributes((prevAttributes) => [...prevAttributes, response]);
      message.success("Thêm thuộc tính thành công!");
      setAddAttributeModalVisible(false); // Đóng modal sau khi thêm thành công
    } catch (error) {
      // Log the full error object for debugging
      console.error("Error adding attribute:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      }
      const errorMessage =
        error.response?.data?.message || "Lỗi khi thêm thuộc tính.";
      message.error(errorMessage);
    } finally {
      setIsSubmittingAttribute(false);
      isSubmittingAttributeRef.current = false;
    }
  };

  const isDateRangeOverlapping = (startDate, endDate) => {
    const overlapping = recentFormulas.find((formula) => {
      const formulaStart = dayjs(formula.startDate);
      const formulaEnd = formula.endDate ? dayjs(formula.endDate) : null;

      const isOverlapping =
        (!formulaEnd || dayjs(startDate).isSameOrBefore(formulaEnd, "day")) &&
        (!endDate || dayjs(endDate).isAfter(formulaStart, "day"));

      return isOverlapping;
    });

    if (overlapping) {
      setOverlappingFormula(overlapping);
      return true;
    }

    setOverlappingFormula(null);
    return false;
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

    if (
      startDate &&
      endDate &&
      dayjs(endDate).isSameOrBefore(startDate, "day")
    ) {
      message.error("Ngày kết thúc phải lớn hơn ngày bắt đầu.");
      return;
    }

    if (isDateRangeOverlapping(startDate, endDate)) {
      setPendingFormulaData({
        formula: currentFormula,
        startDate,
        endDate,
      });
      setConfirmSaveModalVisible(true);
      return;
    }

    await saveFormulaToServer({
      formula: currentFormula,
      startDate,
      endDate,
    });
  };

  const saveFormulaToServer = async (formulaData) => {
    try {
      const response = await userApi.createFormula(formulaData);

      const updatedFormula = await Promise.all(
        response.formula.map(async (slot) => {
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

      const updatedResponse = { ...response, formula: updatedFormula };

      console.log("Saved Formula:", updatedResponse);
      message.success("Lưu công thức thành công!");

      setRecentFormulas((prevFormulas) => [...prevFormulas, updatedResponse]);
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
      const response = await userApi.getAttributeById(attributeId);
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
      setIsLoading(true);
      try {
        const response = await userApi.getAllFormula();
        const formulasWithNames = await attachAttributeNames(response || []);
        setRecentFormulas(formulasWithNames);
      } catch (error) {
        console.error("Error fetching all formulas:", error);
        setRecentFormulas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllFormulas();
  }, []);

  useEffect(() => {
    const fetchDefaultFormula = async () => {
      try {
        const response = await userApi.getAllFormula();
        const formulasWithNames = await attachAttributeNames(response || []);

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
        const response = await userApi.getAllAttributes();
        setAttributes(response || []);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        setAttributes([]);
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
    setFilterStartDate(date);
    if (filterEndDate && date && date.isAfter(filterEndDate)) {
      setFilterEndDate(null);
    }
  };

  const handleFilterEndDateChange = (date) => {
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
      render: (text) => (text ? formatDate(text) : formatDate(new Date())),
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

  const handleDeleteAttributeClick = (attribute) => {
    setAttributeToDelete(attribute);
    setDeleteAttributeModalVisible(true);
  };

  const handleConfirmDeleteAttribute = async () => {
    if (!attributeToDelete) return;
    try {
      const isUsedInFormula = recentFormulas.some((formula) =>
        formula.formula.some(
          (slot) =>
            slot?.attribute?._id === attributeToDelete._id ||
            slot?.attribute === attributeToDelete._id
        )
      );
      if (isUsedInFormula) {
        message.error(
          "Không thể xóa thuộc tính đang được sử dụng trong công thức điểm."
        );
        return;
      }
      if (!attributeToDelete.name) {
        message.error("Không tìm thấy tên thuộc tính để xóa.");
        return;
      }
      await userApi.deleteAttributeByName(attributeToDelete.name);
      setAttributes((prev) =>
        prev.filter((a) => a._id !== attributeToDelete._id)
      );
      message.success("Xóa thuộc tính thành công!");
    } catch (error) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
        console.error("Error deleting attribute:", error.response.data);
      } else if (typeof error === "object") {
        message.error("Lỗi khi xóa thuộc tính.");
        console.error("Error deleting attribute:", error);
      } else {
        message.error(String(error));
      }
    } finally {
      setDeleteAttributeModalVisible(false);
      setAttributeToDelete(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <MathJaxContext>
        <div className="bg-[#E7ECF0] min-h-screen flex flex-col">
          <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto flex-grow max-lg:max-w-full max-lg:px-4">
            <div className="w-full bg-white">
              <Header />
            </div>

            <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4">
              <div className="flex items-center gap-2 text-gray-600 max-sm:flex-wrap">
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
                <span className="font-semibold text-sm text-sky-900">
                  Quản lý công thức điểm
                </span>
              </div>
            </div>

            <div className="self-center w-full max-w-[1563px] px-6 mt-4 max-lg:px-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attributes Section */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-semibold text-gray-700 text-sm md:text-base">
                      CÁC THUỘC TÍNH TÍNH ĐIỂM ĐÓNG GÓP
                    </h2>
                    <Button
                      className="bg-blue-500 text-white hover:bg-blue-600 text-xs md:text-sm"
                      onClick={() => setAddAttributeModalVisible(true)}
                      disabled={isSubmittingAttribute} // Vô hiệu hóa nút khi đang gửi
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
                            onDeleteClick={handleDeleteAttributeClick}
                          />
                        )
                    )}
                  </div>
                </div>

                {/* Formula Section */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <h2 className="font-semibold text-gray-700 text-sm md:text-base">
                        CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP
                        {startDate && (
                          <span className="text-xs md:text-sm text-gray-500 ml-2">
                            ({formatDate(startDate)} đến{" "}
                            {formatDate(endDate || new Date())})
                          </span>
                        )}
                      </h2>
                      <Button
                        className="bg-blue-500 text-white hover:bg-blue-600 text-xs md:text-sm mt-2 md:mt-0"
                        onClick={isEditing ? handleSaveFormula : toggleEditMode}
                      >
                        {isEditing ? "Lưu" : "Chỉnh sửa"}
                      </Button>
                    </div>
                    {isEditing && (
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 text-xs md:text-sm mb-1">
                            Ngày bắt đầu:
                          </label>
                          <DatePicker
                            value={startDate ? dayjs(startDate) : null}
                            onChange={(date) =>
                              setStartDate(date ? date.toISOString() : null)
                            }
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-xs md:text-sm mb-1">
                            Ngày kết thúc:
                          </label>
                          <DatePicker
                            value={endDate ? dayjs(endDate) : null}
                            onChange={(date) =>
                              setEndDate(date ? date.toISOString() : null)
                            }
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                      <h2 className="font-semibold text-gray-700 text-sm md:text-base">
                        TẤT CẢ CÔNG THỨC TÍNH ĐIỂM ĐÓNG GÓP QUA CÁC KỲ
                      </h2>
                      <div className="relative mt-2 md:mt-0">
                        <button
                          className="flex items-center gap-2 text-gray-600 px-2 py-1 rounded-lg border text-xs md:text-sm"
                          onClick={() => setShowFilter(!showFilter)}
                        >
                          <Filter className="w-4 h-4" />
                          <span className="text-xs md:text-sm">Bộ lọc</span>
                        </button>
                        {showFilter && (
                          <div
                            ref={filterRef}
                            className="absolute top-full mt-2 z-50 shadow-lg max-sm:w-full"
                          >
                            <form className="relative px-4 py-5 bg-white w-[200px] max-md:px-3 max-md:py-4 max-sm:px-2 max-sm:py-3">
                              <div className="mb-3">
                                <label className="block text-gray-700 text-xs">
                                  Ngày bắt đầu:
                                </label>
                                <DatePicker
                                  value={filterStartDate}
                                  onChange={handleFilterStartDateChange}
                                  className="w-full date-picker"
                                  format="DD-MM-YYYY"
                                  placeholder="Chọn ngày bắt đầu"
                                  getPopupContainer={(triggerNode) =>
                                    triggerNode.parentNode
                                  }
                                />
                                <label className="block text-gray-700 text-xs mt-2">
                                  Ngày kết thúc:
                                </label>
                                <DatePicker
                                  value={filterEndDate}
                                  onChange={handleFilterEndDateChange}
                                  className="w-full date-picker"
                                  format="DD-MM-YYYY"
                                  placeholder="Chọn ngày kết thúc"
                                  disabledDate={(current) =>
                                    filterStartDate &&
                                    current &&
                                    current.isBefore(filterStartDate, "day")
                                  }
                                  getPopupContainer={(triggerNode) =>
                                    triggerNode.parentNode
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (filterStartDate || filterEndDate) {
                                      setFilterStartDate(null);
                                      setFilterEndDate(null);
                                      message.success("Đã xóa bộ lọc");
                                    }
                                  }}
                                  className="w-full bg-gray-200 text-gray-700 py-1 rounded-md text-xs hover:bg-gray-300"
                                >
                                  Xóa bộ lọc
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowFilter(false)}
                                  className="w-full bg-blue-500 text-white py-1 rounded-md text-xs hover:bg-blue-600"
                                >
                                  Áp dụng
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                    {isLoading ? (
                      <div className="flex justify-center items-center min-h-[300px]">
                        <Spin size="large" />
                      </div>
                    ) : (
                      <Table
                        columns={columns}
                        dataSource={filteredFormulas}
                        scroll={{ x: "max-content" }}
                        pagination={{ pageSize: 5 }}
                      />
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

          <Modal
            title="Xác nhận lưu công thức"
            open={confirmSaveModalVisible}
            onCancel={() => setConfirmSaveModalVisible(false)}
            onOk={async () => {
              if (pendingFormulaData) {
                await saveFormulaToServer(pendingFormulaData);
                setPendingFormulaData(null);
              }
              setConfirmSaveModalVisible(false);
            }}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <p>Khoảng thời gian này đã có công thức tồn tại:</p>
            {overlappingFormula && (
              <div className="mb-4">
                <p>
                  <strong>Ngày bắt đầu:</strong>{" "}
                  {formatDate(overlappingFormula.startDate)}
                </p>
                <p>
                  <strong>Ngày kết thúc:</strong>{" "}
                  {overlappingFormula.endDate
                    ? formatDate(overlappingFormula.endDate)
                    : "Hiện tại"}
                </p>
                <p>
                  <strong>Công thức:</strong>
                </p>
                <div className="flex flex-wrap items-center space-x-2">
                  <span className="text-base font-semibold text-cyan-500">
                    Điểm đóng góp =
                  </span>
                  {overlappingFormula.formula.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {attributeNames[slot?.attribute?.name] ||
                          slot?.attribute?.name}
                      </span>
                      <span className="text-lg font-semibold">×</span>
                      <span className="text-sm font-medium">
                        {slot?.weight}
                      </span>
                      {index < overlappingFormula.formula.length - 1 && (
                        <span className="text-lg font-semibold">+</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p>Bạn có chắc chắn muốn lưu công thức mới không?</p>
          </Modal>

          <Modal
            title="Xác nhận xóa thuộc tính"
            open={deleteAttributeModalVisible}
            onOk={handleConfirmDeleteAttribute}
            onCancel={() => setDeleteAttributeModalVisible(false)}
            okText="Xóa"
            cancelText="Hủy"
            centered
            closable={false}
          >
            <p>
              Bạn có chắc chắn muốn xóa thuộc tính{" "}
              <span className="font-semibold text-red-500">
                {attributeNames[attributeToDelete?.name] ||
                  attributeToDelete?.name ||
                  ""}
              </span>{" "}
              không?
            </p>
          </Modal>

          <Footer />
        </div>
      </MathJaxContext>
    </DndProvider>
  );
};

export default ManagementFormulas;
