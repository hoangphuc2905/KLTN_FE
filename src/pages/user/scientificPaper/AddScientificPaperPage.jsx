import {
  Button,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Modal,
  Tabs,
  Upload,
} from "antd";
import {
  CloseCircleOutlined,
  MinusOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import userApi from "../../../api/api";
import { useNavigate } from "react-router-dom";

const { Option } = Select;
const { TabPane } = Tabs;

const AddScientificPaperPage = () => {
  const [authors, setAuthors] = useState([
    { id: 1, mssvMsgv: "", full_name: "", role: "", institution: "" },
    { id: 2, mssvMsgv: "", full_name: "", role: "", institution: "" },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalFileName, setOriginalFileName] = useState(""); // State to store the original file name
  const [coverImage, setCoverImage] = useState(null);
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);
  const [departments, setDepartments] = useState([]); // State for departments
  const [isIconModalVisible, setIsIconModalVisible] = useState(false); // State for icon modal visibility
  const [link, setLink] = useState(""); // State for link input
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // State for help modal visibility
  const [selectedPaperType, setSelectedPaperType] = useState(""); // State for selected paper type
  const [paperTypeError, setPaperTypeError] = useState(""); // State for paper type error message
  const [paperTypeTouched, setPaperTypeTouched] = useState(false); // State to track if paper type field was touched
  const [selectedPaperGroup, setSelectedPaperGroup] = useState(""); // State for selected paper group
  const [titleVn, setTitleVn] = useState(""); // State for title in Vietnamese
  const [titleEn, setTitleEn] = useState(""); // State for title in English
  const [publishDate, setPublishDate] = useState(""); // State for publish date
  const [magazineVi, setMagazineVi] = useState(""); // State for magazine name in Vietnamese
  const [magazineEn, setMagazineEn] = useState(""); // State for magazine name in English
  const [magazineType, setMagazineType] = useState(""); // State for magazine type
  const [pageCount, setPageCount] = useState(0); // State for page count
  const [issnIsbn, setIssnIsbn] = useState(""); // State for ISSN/ISBN
  const [orderNo, setOrderNo] = useState(true); // State for order number
  const [featured, setFeatured] = useState(true); // State for featured status
  const [keywords, setKeywords] = useState(""); // State for keywords
  const [summary, setSummary] = useState(""); // State for summary
  const [selectedDepartment, setSelectedDepartment] = useState(""); // State for selected department
  const [doi, setDoi] = useState(""); // State for DOI
  const [coverImageError, setCoverImageError] = useState("");
  const [coverImageTouched, setCoverImageTouched] = useState(false);
  // Removed duplicate declarations of fileError and fileTouched
  const navigate = useNavigate();

  // State để lưu điểm
  const [scores, setScores] = useState({
    total: 0,
    perAuthor: {},
  });

  // Hàm gọi API để tính điểm
  const calculateAndSetScore = async (inputData) => {
    try {
      // Chuẩn hóa dữ liệu gửi lên API
      const payload = {
        createdAt: new Date().toISOString(),
        doi: inputData.doi || false,
        featured: inputData.featured || false,
        article_group: inputData.article_group || "",
        authors: inputData.authors.map((author) => ({
          role: author.role,
          degree: author.degree || "Bachelor",
          point: author.point || 0,
          institutions: author.institutions || [],
        })),
      };

      const response = await userApi.calculateScoreFromInput(payload);
      const { totalScore, authorScores } = response;

      console.log("✅ Điểm tổng:", totalScore);
      console.log("✅ Điểm từng tác giả:", authorScores);

      setScores({ total: totalScore, perAuthor: authorScores });
    } catch (err) {
      console.error("❌ Lỗi tính điểm:", err.response?.data || err.message);
      message.error("Không thể tính điểm. Vui lòng kiểm tra dữ liệu đầu vào.");
    }
  };

  // Hàm xử lý khi thay đổi các trường
  const handleFieldChange = (updatedField) => {
    const updatedInput = {
      article_type: selectedPaperType,
      article_group:
        paperGroups.find((group) => group.group_name === selectedPaperGroup)
          ?.group_name || "", // Sử dụng group_name để tính điểm
      authors: authors.map((author, index) => ({
        id: `author_${index + 1}`,
        role: author.role,
        degree: "Bachelor",
        point: 0,
        institutions: author.institutions || [],
      })),
      doi: doi || false,
      featured,
      ...updatedField,
    };

    calculateAndSetScore(updatedInput);
  };

  // Validation function for paper type
  const validatePaperType = () => {
    if (!selectedPaperType) {
      setPaperTypeError("Vui lòng chọn loại bài báo");
      return false;
    }
    setPaperTypeError("");
    return true;
  };

  // Validation function for paper img
  const validateCoverImage = () => {
    if (!coverImage) {
      setCoverImageError("Vui lòng tải lên ảnh bìa");
      return false;
    }
    setCoverImageError("");
    return true;
  };

  // Validation functions for other required fields
  const validatePaperGroup = () => {
    if (!selectedPaperGroup) {
      setPaperGroupError("Vui lòng chọn nhóm bài báo");
      return false;
    }
    setPaperGroupError("");
    return true;
  };

  const validateTitleVn = () => {
    if (!titleVn) {
      setTitleVnError("Vui lòng nhập tên bài báo tiếng Việt");
      return false;
    }
    setTitleVnError("");
    return true;
  };

  const validateDepartment = () => {
    if (!selectedDepartment) {
      setDepartmentError("Vui lòng chọn Khoa/Viện");
      return false;
    }
    setDepartmentError("");
    return true;
  };

  const validatePublishDate = () => {
    if (!publishDate) {
      setPublishDateError("Chọn ngày");
      return false;
    }

    // Check if publish date is in the future
    const selectedDate = new Date(publishDate);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to start of day

    if (selectedDate > currentDate) {
      setPublishDateError("< ngày hiện tại");
      return false;
    }

    setPublishDateError("");
    return true;
  };

  const validatePageCount = () => {
    if (!pageCount) {
      setPageCountError("Vui lòng nhập");
      return false;
    }
    setPageCountError("");
    return true;
  };

  const validateIssnIsbn = () => {
    if (!issnIsbn) {
      setIssnIsbnError("Vui lòng nhập");
      return false;
    }
    setIssnIsbnError("");
    return true;
  };

  const validateMagazineVi = () => {
    if (!magazineVi) {
      setMagazineViError("Vui lòng nhập tên tạp chí/kỷ yếu");
      return false;
    }
    setMagazineViError("");
    return true;
  };

  const validateKeywords = () => {
    if (!keywords) {
      setKeywordsError("Vui lòng nhập từ khóa");
      return false;
    }
    setKeywordsError("");
    return true;
  };

  const validateSummary = () => {
    if (!summary) {
      setSummaryError("Vui lòng nhập tóm tắt");
      return false;
    }
    setSummaryError("");
    return true;
  };

  const validateLink = () => {
    if (!link) {
      setLinkError("Vui lòng nhập link công bố bài báo");
      return false;
    }
    setLinkError("");
    return true;
  };

  // Validation function for authors
  const validateAuthors = () => {
    const newErrors = [...authorErrors];
    let isValid = true;

    authors.forEach((author, index) => {
      // Reset errors for this author
      newErrors[index] = {
        mssvMsgv: "",
        full_name: "",
        role: "",
        institution: "",
      };

      // Validate MSSV/MSGV
      if (!author.mssvMsgv) {
        newErrors[index].mssvMsgv = "Vui lòng nhập MSSV/MSGV";
        isValid = false;
      }

      // Validate full_name
      if (!author.full_name) {
        newErrors[index].full_name = "error"; // Just set to trigger red styling
        isValid = false;
      }

      // Validate role
      if (!author.role) {
        newErrors[index].role = "Vui lòng chọn vai trò";
        isValid = false;
      }

      // Validate institution
      if (!author.institution) {
        newErrors[index].institution = "Vui lòng chọn cơ quan";
        isValid = false;
      }
    });

    setAuthorErrors(newErrors);
    return isValid;
  };

  const validateFile = () => {
    if (!selectedFile) {
      setFileError("error"); // Chỉ đặt trạng thái để hiển thị viền đỏ
      return false;
    }
    setFileError("");
    return true;
  };

  // Add validation states for other required fields
  const [paperGroupError, setPaperGroupError] = useState("");
  const [paperGroupTouched, setPaperGroupTouched] = useState(false);

  const [titleVnError, setTitleVnError] = useState("");
  const [titleVnTouched, setTitleVnTouched] = useState(false);

  const [departmentError, setDepartmentError] = useState("");
  const [departmentTouched, setDepartmentTouched] = useState(false);

  const [publishDateError, setPublishDateError] = useState("");
  const [publishDateTouched, setPublishDateTouched] = useState(false);

  const [pageCountError, setPageCountError] = useState("");
  const [pageCountTouched, setPageCountTouched] = useState(false);

  const [issnIsbnError, setIssnIsbnError] = useState("");
  const [issnIsbnTouched, setIssnIsbnTouched] = useState(false);

  const [magazineViError, setMagazineViError] = useState("");
  const [magazineViTouched, setMagazineViTouched] = useState(false);

  const [keywordsError, setKeywordsError] = useState("");
  const [keywordsTouched, setKeywordsTouched] = useState(false);

  const [summaryError, setSummaryError] = useState("");
  const [summaryTouched, setSummaryTouched] = useState(false);

  const [linkError, setLinkError] = useState("");
  const [linkTouched, setLinkTouched] = useState(false);

  // Adding author fields validation states
  const [authorErrors, setAuthorErrors] = useState([]);
  const [authorTouched, setAuthorTouched] = useState([]);
  const [fileError, setFileError] = useState("");
  const [fileTouched, setFileTouched] = useState(false);

  // Initialize author validation states when authors change
  useEffect(() => {
    setAuthorErrors(
      authors.map(() => ({
        mssvMsgv: "",
        full_name: "", // Add validation for full_name
        role: "",
        institution: "",
        name_mismatch: false, // New flag to track name mismatches
      }))
    );

    setAuthorTouched(
      authors.map(() => ({
        mssvMsgv: false,
        full_name: false, // Add touched state for full_name
        role: false,
        institution: false,
      }))
    );
  }, [authors.length]);

  // Store original names from database for comparison
  const [originalNames, setOriginalNames] = useState([]);

  useEffect(() => {
    // Initialize original names array with empty strings for each author
    setOriginalNames(authors.map(() => ""));
  }, [authors.length]);

  useEffect(() => {
    const fetchPaperData = async () => {
      try {
        const types = await userApi.getAllPaperTypes();
        const groups = await userApi.getAllPaperGroups();
        const departmentsData = await userApi.getAllDepartments(); // Fetch departments

        setPaperTypes(types);
        setPaperGroups(groups);
        setDepartments(departmentsData); // Set departments
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu.");
      }
    };

    fetchPaperData();
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await userApi.uploadImage(file);
        setCoverImage(response.url);
        setCoverImageError(""); // Clear error when image is selected
        message.success("Ảnh bìa đã được tải lên thành công!");
        console.log("Uploaded image response:", response);
      } catch (error) {
        console.error(
          "Error uploading image:",
          error.response?.data || error.message
        );
        message.error("Không thể tải ảnh bìa lên. Vui lòng thử lại.");
      }
    }
  };

  const handleFileChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Check file size (limit to 3.5MB)
        const maxSize = 3.5 * 1024 * 1024; // 3.5MB in bytes
        if (file.size > maxSize) {
          message.error("Kích thước tệp vượt quá giới hạn 3.5MB.");
          return;
        }

        try {
          setOriginalFileName(file.name); // Save the original file name for display
          const response = await userApi.uploadFile(file);
          setSelectedFile(response.url); // Save the Cloudinary URL for backend
          setFileError(""); // Clear error when file is uploaded
          setFileTouched(true);
          message.success("File đã được tải lên thành công!");
          console.log("Uploaded file response:", response);
        } catch (error) {
          console.error(
            "Error uploading file:",
            error.response?.data || error.message
          );
          message.error("Không thể tải file lên. Vui lòng thử lại.");
          setOriginalFileName(""); // Reset original file name on error
          setSelectedFile(null); // Reset Cloudinary URL on error
        }
      } else {
        setFileTouched(true);
        validateFile();
      }
    };
    input.click();
  };

  const handleRemoveFile = () => {
    setOriginalFileName(""); // Clear the original file name
    setSelectedFile(null); // Clear the Cloudinary URL
    if (fileTouched) {
      setFileError("Vui lòng tải lên file");
    }
  };

  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        id: authors.length + 1,
        mssvMsgv: "",
        full_name: "",
        role: "",
        institution: "",
      },
    ]);
  };

  const handleRemoveAuthor = (index) => {
    const newAuthors = authors.filter((_, i) => i !== index);
    setAuthors(newAuthors);
  };

  const handleAuthorChange = async (index, field, value) => {
    const updatedAuthors = [...authors];

    if (field === "institution") {
      updatedAuthors[index][field] = value; // Ensure this is the ObjectId (_id)
    } else {
      updatedAuthors[index][field] = value;
    }

    if (field === "mssvMsgv" && value.trim() !== "") {
      try {
        // Gọi cả hai hàm để lấy dữ liệu từ giảng viên và sinh viên
        const lecturerData = await userApi
          .getLecturerById(value)
          .catch((error) => {
            console.log("Error fetching lecturer:", error.message);
            return null; // Trả về null nếu không tìm thấy giảng viên
          });

        const studentData = await userApi
          .getStudentById(value)
          .catch((error) => {
            console.log("Error fetching student:", error.message);
            return null; // Trả về null nếu không tìm thấy sinh viên
          });

        // Ưu tiên dữ liệu từ giảng viên nếu có, nếu không thì lấy từ sinh viên
        const userData = lecturerData || studentData;

        if (userData) {
          // Set name information if user data was found
          updatedAuthors[index].full_name =
            userData.full_name || userData.name || "";

          // Xóa lỗi cho full_name khi có dữ liệu
          const newErrors = [...authorErrors];
          if (!newErrors[index]) newErrors[index] = {};
          newErrors[index].full_name = "";
          setAuthorErrors(newErrors);

          try {
            // Fetch user workplaces
            const institutionsResponse = await userApi.getUserWorksByUserId(
              value
            );
            console.log("User works response:", institutionsResponse);

            if (
              institutionsResponse &&
              Array.isArray(institutionsResponse) &&
              institutionsResponse.length > 0
            ) {
              // Map the institution IDs to fetch their details
              const institutions = await Promise.all(
                institutionsResponse.map(async (item) => {
                  try {
                    const workUnit = await userApi.getWorkUnitById(
                      item.work_unit_id
                    );
                    return {
                      _id: workUnit._id,
                      name:
                        workUnit.name_vi ||
                        workUnit.name ||
                        "Unknown Institution",
                    };
                  } catch (workUnitError) {
                    console.error(
                      "Error fetching work unit details:",
                      workUnitError
                    );
                    return {
                      _id: item.work_unit_id,
                      name: "Unknown Institution",
                    };
                  }
                })
              );

              updatedAuthors[index].institutions = institutions;

              // If user has institutions, set the first one as default
              if (institutions.length > 0) {
                updatedAuthors[index].institution = institutions[0]._id;

                // Clear institution error when data is loaded from API
                const newErrors = [...authorErrors];
                if (!newErrors[index]) newErrors[index] = {};
                newErrors[index].institution = "";
                setAuthorErrors(newErrors);
              }

              console.log("Fetched institutions:", institutions);
            } else {
              console.log(
                "No institutions found, fetching all work units as fallback"
              );
              // Fallback: if no specific institutions, fetch all work units
              const allWorkUnits = await userApi.getAllWorkUnits();

              if (allWorkUnits && Array.isArray(allWorkUnits)) {
                updatedAuthors[index].institutions = allWorkUnits.map(
                  (unit) => ({
                    _id: unit._id,
                    name: unit.name_vi || unit.name || "Unknown",
                  })
                );
              } else {
                updatedAuthors[index].institutions = [];
                console.error("Failed to fetch work units:", allWorkUnits);
              }
            }
          } catch (institutionsError) {
            console.error("Error fetching institutions:", institutionsError);

            // Fallback: fetch all work units if specific user institutions failed
            try {
              const allWorkUnits = await userApi.getAllWorkUnits();
              if (allWorkUnits && Array.isArray(allWorkUnits)) {
                updatedAuthors[index].institutions = allWorkUnits.map(
                  (unit) => ({
                    _id: unit._id,
                    name: unit.name_vi || unit.name || "Unknown",
                  })
                );
              } else {
                updatedAuthors[index].institutions = [];
              }
            } catch (workUnitsError) {
              console.error("Error fetching all work units:", workUnitsError);
              updatedAuthors[index].institutions = [];
            }
          }

          // Generate English name from Vietnamese name
          if (updatedAuthors[index].full_name) {
            const nameParts = updatedAuthors[index].full_name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
              .split(" ");
            const firstName = nameParts.shift(); // Remove the first word
            updatedAuthors[index].full_name_eng = [...nameParts, firstName]
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ");
          }
        } else {
          // No user found - clear fields
          updatedAuthors[index].full_name = "";
          updatedAuthors[index].full_name_eng = "";

          // Still try to fetch all work units
          try {
            const allWorkUnits = await userApi.getAllWorkUnits();
            if (allWorkUnits && Array.isArray(allWorkUnits)) {
              updatedAuthors[index].institutions = allWorkUnits.map((unit) => ({
                _id: unit._id,
                name: unit.name_vi || unit.name || "Unknown",
              }));
            } else {
              updatedAuthors[index].institutions = [];
            }
          } catch (error) {
            console.error("Error fetching all work units:", error);
            updatedAuthors[index].institutions = [];
          }
        }
      } catch (error) {
        console.error("Error in handleAuthorChange:", error);
        // On any error, clear author name and try to fetch all work units
        updatedAuthors[index].full_name = "";
        updatedAuthors[index].full_name_eng = "";

        try {
          const allWorkUnits = await userApi.getAllWorkUnits();
          if (allWorkUnits && Array.isArray(allWorkUnits)) {
            updatedAuthors[index].institutions = allWorkUnits.map((unit) => ({
              _id: unit._id,
              name: unit.name_vi || unit.name || "Unknown",
            }));
          } else {
            updatedAuthors[index].institutions = [];
          }
        } catch (workUnitsError) {
          console.error("Error fetching all work units:", workUnitsError);
          updatedAuthors[index].institutions = [];
        }
      }
    }

    setAuthors(updatedAuthors);
  };

  const isNameEditable = (index) => {
    return !originalNames[index] || originalNames[index].trim() === "";
  };

  const handleClear = () => {
    setAuthors([
      { id: 1, mssvMsgv: "", full_name: "", role: "", institution: "" },
      { id: 2, mssvMsgv: "", full_name: "", role: "", institution: "" },
    ]);
    setSelectedFile(null);
    setOriginalFileName(""); // Clear the original file name
    setCoverImage(null);
    message.info("Đã xóa trắng thông tin.");
  };

  const handleSave = async () => {
    try {
      // Validate all required fields
      const isPaperTypeValid = validatePaperType();
      const isPaperGroupValid = validatePaperGroup();
      const isTitleVnValid = validateTitleVn();
      const isDepartmentValid = validateDepartment();
      const isPublishDateValid = validatePublishDate();
      const isPageCountValid = validatePageCount();
      const isIssnIsbnValid = validateIssnIsbn();
      const isMagazineViValid = validateMagazineVi();
      const isKeywordsValid = validateKeywords();
      const isSummaryValid = validateSummary();
      const isLinkValid = validateLink();
      const areAuthorsValid = validateAuthors();
      const isFileValid = validateFile();
      const isCoverImageValid = validateCoverImage();

      if (
        !isPaperTypeValid ||
        !isPaperGroupValid ||
        !isTitleVnValid ||
        !isDepartmentValid ||
        !isPublishDateValid ||
        !isPageCountValid ||
        !isIssnIsbnValid ||
        !isMagazineViValid ||
        !isKeywordsValid ||
        !isSummaryValid ||
        !isLinkValid ||
        !areAuthorsValid ||
        !isFileValid ||
        !isCoverImageValid
      ) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      const randomUUID = () => {
        return "xxxxxxxxxxxx".replace(/[x]/g, function () {
          return (Math.random() * 16) | 0;
        });
      };

      // Handle custom institutions
      const updatedAuthors = await Promise.all(
        authors.map(async (author) => {
          if (
            !/^[a-f\d]{24}$/i.test(author.institution) &&
            author.institution
          ) {
            // Save custom institution to the database
            try {
              const response = await userApi.createWorkUnit({
                work_unit_id: randomUUID(),
                name_vi: author.institution,
                name_en: author.institution,
                address_vi: "Không có địa chỉ",
                address_en: "No address",
              });
              return {
                ...author,
                institution: response._id,
              };
            } catch (error) {
              console.error("Error saving custom institution:", error);
              message.error(
                `Không thể lưu cơ quan công tác: ${author.institution}`
              );
              throw error;
            }
          }
          return author;
        })
      );

      // Compute author_count
      const counts = {
        primary: 0,
        corresponding: 0,
        primaryCorresponding: 0,
        contributor: 0,
      };
      updatedAuthors.forEach((author) => {
        if (author.role === "MainAuthor") counts.primary++;
        if (author.role === "CorrespondingAuthor") counts.corresponding++;
        if (author.role === "MainAndCorrespondingAuthor")
          counts.primaryCorresponding++;
        if (author.role === "Participant") counts.contributor++;
      });
      const authorCount = `${updatedAuthors.length}(${counts.primary},${counts.corresponding},${counts.primaryCorresponding},${counts.contributor})`;

      // Prepare JSON payload
      const payload = {
        article_type: selectedPaperType || "",
        article_group:
          paperGroups.find((group) => group.group_name === selectedPaperGroup)
            ?._id || "",
        title_vn: titleVn || "",
        ...(titleEn && { title_en: titleEn }),
        author_count: authorCount,
        author: updatedAuthors.map((author, index) => ({
          user_id: author.mssvMsgv || "",
          author_name_vi: author.full_name || "",
          author_name_en: author.full_name_eng || "",
          role: author.role || "",
          work_unit_id: author.institution,
          degree: "Bachelor",
          point: parseFloat(scores.perAuthor[`author_${index + 1}`]) || 0,
        })),
        publish_date: publishDate || "",
        magazine_vi: magazineVi || "",
        ...(magazineEn && { magazine_en: magazineEn }),
        ...(magazineType && { magazine_type: magazineType }),
        page: pageCount || 0,
        issn_isbn: issnIsbn || "",
        file: selectedFile || "",
        link: link || "",
        ...(doi && { doi: doi }),
        status: "pending",
        order_no: orderNo,
        featured: featured,
        keywords: keywords || "",
        summary: summary || "",
        department: selectedDepartment || "",
        cover_image: coverImage || "",
      };

      // Debugging: Log payload
      console.log("Payload:", payload);

      // Send data to the backend
      const response = await userApi.createScientificPaper(payload);
      message.success("Bài báo đã được lưu thành công!");
      navigate("/scientific-paper");
      console.log("Response:", response);
    } catch (error) {
      console.error(
        "Error saving scientific paper:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        message.error(`Lỗi từ server: ${error.response.data.message}`);
      } else {
        message.error("Không thể lưu bài báo. Vui lòng thử lại.");
      }
    }
  };

  const handleIconModalOk = () => {
    setIsIconModalVisible(false);
  };

  const handleIconModalCancel = () => {
    setIsIconModalVisible(false);
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
  };

  const handleImageUpload = (info) => {
    if (info.file.status === "done") {
      setUploadedImage(info.file.originFileObj);
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const showHelpModal = () => {
    setIsHelpModalVisible(true);
  };

  const handleHelpModalOk = () => {
    setIsHelpModalVisible(false);
  };

  const handleHelpModalCancel = () => {
    setIsHelpModalVisible(false);
  };

  return (
    <div className="bg-[#E7ECF0] min-h-screen">
      <Header />
      <div className="flex flex-col pb-7 pt-[80px] w-full md:max-w-[95%] lg:max-w-[calc(100%-100px)] xl:max-w-[calc(100%-220px)] mx-auto">
        <div className="self-center w-full max-w-[1563px] px-2 sm:px-4 md:px-6 mt-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25694.png"
              alt="Home Icon"
              className="w-4 h-4 sm:w-5 sm:h-5"
            />
            <span
              onClick={() => navigate("/home")}
              className="cursor-pointer hover:text-blue-500"
            >
              Trang chủ
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="font-semibold text-sky-900">
              Thêm bài báo nghiên cứu khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-2 sm:px-4 mt-4">
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              {/* Khối "Nhập thông tin" */}
              <section className="flex flex-col bg-white rounded-lg p-3 sm:p-4 md:p-6 mb-3 relative">
                <Button
                  type="link"
                  onClick={() => navigate("/scientific-paper-guide")}
                  className="absolute top-3 right-3 text-sky-500 hover:text-sky-700"
                >
                  Hướng dẫn thêm bài báo
                </Button>
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin
                </h2>

                <div className="flex flex-col md:flex-row gap-4">
                  {/*Ảnh img bài báo */}
                  <div className="flex flex-col w-full md:w-[260px] items-center md:items-start justify-center mb-4 md:mb-0">
                    <label
                      htmlFor="cover-upload"
                      className={`cursor-pointer relative ${
                        coverImageError
                          ? "border-2 border-red-500 rounded-lg"
                          : ""
                      }`}
                      aria-label="Upload cover image"
                    >
                      <img
                        src={
                          coverImage ||
                          "https://cdn-icons-png.flaticon.com/128/4904/4904233.png"
                        }
                        alt="Bìa bài báo"
                        className="w-[180px] h-[270px] sm:w-[210px] sm:h-[315px] object-contain border border-gray-300 rounded-lg shadow-md hover:brightness-90 transition duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 text-white font-semibold text-sm rounded-lg transition duration-300">
                        Chọn ảnh
                      </div>
                      {coverImageError && (
                        <div className="absolute top-0 right-0 bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                          {coverImageError}
                        </div>
                      )}
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      aria-hidden="true"
                    />
                    {coverImageError && (
                      <div className="text-red-500 text-xs mt-1">
                        {coverImageError}
                      </div>
                    )}
                  </div>
                  {/* Các input bên cạnh ảnh */}
                  <div className="w-full grid grid-cols-1 md:pl-4">
                    {/* Loại bài báo */}
                    <div className="mb-2">
                      <label
                        htmlFor="paperType"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Loại bài báo <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <Select
                          id="paperType"
                          className={`w-full h-10 ${
                            paperTypeError ? "border-red-500" : ""
                          }`}
                          placeholder="Chọn loại bài báo"
                          required
                          showSearch
                          status={paperTypeError ? "error" : ""}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option?.children
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          onChange={(value) => {
                            setSelectedPaperType(value);
                            setPaperTypeError("");
                            handleFieldChange({ article_type: value });
                          }}
                          onBlur={() => {
                            setPaperTypeTouched(true);
                            validatePaperType();
                          }}
                          onClick={() => {
                            if (!paperTypeTouched) {
                              setPaperTypeTouched(true);
                            }
                          }}
                        >
                          {paperTypes.map((type) => (
                            <Option key={type._id} value={type._id}>
                              {type.type_name}
                            </Option>
                          ))}
                        </Select>
                        {paperTypeError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {paperTypeError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Nhóm bài báo */}
                    <div className="mb-2">
                      <label
                        htmlFor="paperGroup"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Thuộc nhóm <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <Select
                          id="paperGroup"
                          className={`w-full h-10 ${
                            paperGroupError ? "border-red-500" : ""
                          }`}
                          placeholder="Chọn nhóm bài báo"
                          required
                          showSearch
                          status={paperGroupError ? "error" : ""}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option?.children
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          onChange={(value) => {
                            setSelectedPaperGroup(value); // Cập nhật giá trị nhóm bài báo (group_name)
                            setPaperGroupError("");
                            handleFieldChange({ article_group: value }); // Gửi giá trị nhóm bài báo (group_name)
                          }}
                          onBlur={() => {
                            setPaperGroupTouched(true);
                            validatePaperGroup();
                          }}
                          onClick={() => {
                            if (!paperGroupTouched) {
                              setPaperGroupTouched(true);
                            }
                          }}
                        >
                          {paperGroups.map((group) => (
                            <Option key={group._id} value={group.group_name}>
                              {group.group_name}
                            </Option>
                          ))}
                        </Select>
                        {paperGroupError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {paperGroupError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Tên(Vn) bài báo */}
                    <div className="mb-2">
                      <label
                        htmlFor="titleVn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên bài báo (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <TextArea
                          id="titleVn"
                          className={`w-full ${
                            titleVnError ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập tên bài báo (Tiếng Việt)"
                          rows={2}
                          required
                          status={titleVnError ? "error" : ""}
                          onChange={(e) => {
                            setTitleVn(e.target.value);
                            setTitleVnError("");
                          }}
                          onBlur={() => {
                            setTitleVnTouched(true);
                            validateTitleVn();
                          }}
                          onClick={() => {
                            if (!titleVnTouched) {
                              setTitleVnTouched(true);
                            }
                          }}
                        />
                        {titleVnError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {titleVnError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Tên(En) bài báo */}
                    <div className="mb-2">
                      <label
                        htmlFor="titleEn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên bài báo (Tiếng Anh)
                      </label>
                      <TextArea
                        id="titleEn"
                        className="w-full"
                        placeholder="Tên bài báo (Tiếng Anh)"
                        rows={2} // Adjust the number of rows as needed
                        onChange={(e) => setTitleEn(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  {/* Bên dưới ảnh: 4 input xếp dọc (bằng ảnh) */}
                  <div className="flex flex-col w-[260px] gap-4">
                    {/* Ngày công bố */}
                    <div className="">
                      <label
                        htmlFor="publishDate"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Ngày công bố <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <DatePicker
                          id="publishDate"
                          className={`w-full h-10 ${
                            publishDateError ? "border-red-500" : ""
                          }`}
                          placeholder="Ngày công bố"
                          onChange={(date, dateString) => {
                            setPublishDate(dateString);
                            setPublishDateTouched(true);

                            // Perform validation
                            if (date) {
                              const selectedDate = new Date(date);
                              const currentDate = new Date();
                              currentDate.setHours(0, 0, 0, 0);

                              if (selectedDate > currentDate) {
                                // Future date - show error
                                setPublishDateError("< ngày hiện tại");
                              } else {
                                // Valid date - clear error
                                setPublishDateError("");
                              }
                            } else {
                              // No date - show error
                              setPublishDateError("Vui lòng chọn ngày công bố");
                            }
                          }}
                          onBlur={() => {
                            if (!publishDateTouched) {
                              setPublishDateTouched(true);
                            }
                            // Keep existing error or validate if no date is selected
                            if (!publishDate && !publishDateError) {
                              setPublishDateError("Chọn ngày");
                            }
                          }}
                        />
                        {publishDateError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {publishDateError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Số trang */}
                    <div className="">
                      <label
                        htmlFor="pageCount"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số trang <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <InputNumber
                          id="pageCount"
                          className={`w-full h-10 ${
                            pageCountError ? "border-red-500" : ""
                          }`}
                          placeholder="Số trang"
                          status={pageCountError ? "error" : ""}
                          min={1}
                          onChange={(value) => {
                            setPageCount(value);
                            setPageCountError("");
                          }}
                          onBlur={() => {
                            setPageCountTouched(true);
                            validatePageCount();
                          }}
                          onClick={() => {
                            if (!pageCountTouched) {
                              setPageCountTouched(true);
                            }
                          }}
                        />
                        {pageCountError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {pageCountError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Thứ tự
                    <div className="pb-7">
                      <label
                        htmlFor="orderNo"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Thứ tự
                      </label>
                      <InputNumber
                        id="orderNo"
                        className="w-full h-10"
                        placeholder="Thứ tự"
                        min={1}
                        onChange={(value) => setOrderNo(value)}
                      />
                    </div> */}
                    {/* Bài tiêu biểu */}
                    <div className="pb-4">
                      <div className="flex items-center">
                        <label
                          htmlFor="featured"
                          className="text-sm font-medium text-black mr-2"
                        >
                          Bài tiêu biểu
                        </label>
                        <input
                          id="featured"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          checked={featured}
                          onChange={(e) => {
                            setFeatured(e.target.checked);
                            handleFieldChange({ featured: e.target.checked });
                          }}
                        />
                      </div>
                    </div>
                    {/* Số ISSN / ISBN */}
                    <div className="">
                      <label
                        htmlFor="issnIsbn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số ISSN / ISBN <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="issnIsbn"
                          className={`w-full h-10 ${
                            issnIsbnError ? "border-red-500" : ""
                          }`}
                          placeholder="Số ISSN / ISBN"
                          status={issnIsbnError ? "error" : ""}
                          onChange={(e) => {
                            setIssnIsbn(e.target.value);
                            setIssnIsbnError("");
                          }}
                          onBlur={() => {
                            setIssnIsbnTouched(true);
                            validateIssnIsbn();
                          }}
                          onClick={() => {
                            if (!issnIsbnTouched) {
                              setIssnIsbnTouched(true);
                            }
                          }}
                        />
                        {issnIsbnError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {issnIsbnError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bên phải ảnh: 4 input xếp dọc (bằng ID ở trên) */}
                  <div className="flex flex-col gap-4 w-full pl-4">
                    {/* Tên tạp chí / kỷ yếu (Vn) */}
                    <div className="">
                      <label
                        htmlFor="magazineVi"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí / kỷ yếu (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="magazineVi"
                          className={`w-full h-10 ${
                            magazineViError ? "border-red-500" : ""
                          }`}
                          placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt)"
                          status={magazineViError ? "error" : ""}
                          onChange={(e) => {
                            setMagazineVi(e.target.value);
                            setMagazineViError("");
                          }}
                          onBlur={() => {
                            setMagazineViTouched(true);
                            validateMagazineVi();
                          }}
                          onClick={() => {
                            if (!magazineViTouched) {
                              setMagazineViTouched(true);
                            }
                          }}
                        />
                        {magazineViError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {magazineViError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Tên tạp chí / kỷ yếu (En) */}
                    <div className="">
                      <label
                        htmlFor="magazineEn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí / kỷ yếu (Tiếng Anh)
                      </label>
                      <Input
                        id="magazineEn"
                        className="w-full h-10"
                        placeholder="Tên tạp chí / kỷ yếu (Tiếng Anh)"
                        onChange={(e) => setMagazineEn(e.target.value)}
                      />
                    </div>
                    {/* Tập / quyển */}
                    <div className="">
                      <label
                        htmlFor="magazineType"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tập / quyển (nếu có)
                      </label>
                      <Input
                        id="magazineType"
                        className="w-full h-10"
                        placeholder="Tập / quyển (nếu có)"
                        onChange={(e) => setMagazineType(e.target.value)}
                      />
                    </div>
                    {/* Khoa / viện */}
                    <div className="">
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Khoa / Viện <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <Select
                          id="department"
                          className={`w-full h-10 ${
                            departmentError ? "border-red-500" : ""
                          }`}
                          placeholder="Chọn Khoa / Viện"
                          required
                          showSearch
                          status={departmentError ? "error" : ""}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option?.children
                              ?.toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          onChange={(value) => {
                            setSelectedDepartment(value);
                            setDepartmentError("");
                          }}
                          onBlur={() => {
                            setDepartmentTouched(true);
                            validateDepartment();
                          }}
                          onClick={() => {
                            if (!departmentTouched) {
                              setDepartmentTouched(true);
                            }
                          }}
                        >
                          {departments.map((department) => (
                            <Option key={department._id} value={department._id}>
                              {department.department_name}
                            </Option>
                          ))}
                        </Select>
                        {departmentError && (
                          <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {departmentError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Từ khóa */}
                    <div className="pb-2">
                      <label
                        htmlFor="keywords"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Từ khóa <span style={{ color: "red" }}>*</span>
                      </label>
                      <div className="relative">
                        <TextArea
                          id="keywords"
                          className={`w-full ${
                            keywordsError ? "border-red-500" : ""
                          }`}
                          placeholder="Nhập từ khóa"
                          rows={2}
                          status={keywordsError ? "error" : ""}
                          onChange={(e) => {
                            setKeywords(e.target.value);
                            setKeywordsError("");
                          }}
                          onBlur={() => {
                            setKeywordsTouched(true);
                            validateKeywords();
                          }}
                          onClick={() => {
                            if (!keywordsTouched) {
                              setKeywordsTouched(true);
                            }
                          }}
                        />
                        {keywordsError && (
                          <div className="absolute right-0 top-0 h-10 flex items-center pr-2">
                            <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                              {keywordsError}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lưu ý */}
                <div className="mt-2 text-xs text-gray-700 italic">
                  (<span className="font-bold">LƯU Ý</span>: KHÔNG CẦN đánh chữ
                  <span className="font-bold"> ISSN </span> vào. Với các
                  <span className="font-bold"> TẠP CHÍ </span>, bắt buộc điền
                  chỉ số
                  <span className="font-bold"> ISSN</span>. Cung cấp số
                  <span className="font-bold"> ISSN</span> để việc tra cứu và
                  duyệt nội dung)
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="summary"
                    className="block text-sm font-medium text-black pb-1"
                  >
                    Tóm tắt <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="relative">
                    <TextArea
                      id="summary"
                      className={`w-full ${
                        summaryError ? "border-red-500" : ""
                      }`}
                      placeholder="Nhập tóm tắt"
                      rows={4}
                      status={summaryError ? "error" : ""}
                      onChange={(e) => {
                        setSummary(e.target.value);
                        setSummaryError("");
                      }}
                      onBlur={() => {
                        setSummaryTouched(true);
                        validateSummary();
                      }}
                      onClick={() => {
                        if (!summaryTouched) {
                          setSummaryTouched(true);
                        }
                      }}
                    />
                    {summaryError && (
                      <div className="absolute right-0 top-0 h-10 flex items-center pr-2">
                        <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                          {summaryError}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <div className="w-full">
              {/* Khối "Nhập thông tin tác giả" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-3">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin TÁC GIẢ
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center">
                    <Input
                      className="w-20 bg-gray-200 text-center"
                      value={(() => {
                        const counts = {
                          primary: 0,
                          corresponding: 0,
                          primaryCorresponding: 0,
                          contributor: 0,
                        };
                        if (authors.length > 0) {
                          authors.forEach((author) => {
                            if (author.role === "MainAuthor") counts.primary++;
                            if (author.role === "CorrespondingAuthor")
                              counts.corresponding++;
                            if (author.role === "MainAndCorrespondingAuthor")
                              counts.primaryCorresponding++;
                            if (author.role === "Participant")
                              counts.contributor++;
                          });
                        }
                        return `${authors.length}(${counts.primary},${counts.corresponding},${counts.primaryCorresponding},${counts.contributor})`;
                      })()}
                      readOnly
                    />
                  </div>
                  {authors.map((author, index) => (
                    <div
                      key={author.id || index}
                      className="grid grid-cols-6 gap-4 col-span-2"
                    >
                      {/* Row 1 */}
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        {/* Mã số SV /GV */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`mssvMsgv-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Mã số SV/GV <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="relative">
                            <Input
                              id={`mssvMsgv-${index}`}
                              placeholder="MSSV/MSGV"
                              value={author.mssvMsgv}
                              onChange={(e) => {
                                handleAuthorChange(
                                  index,
                                  "mssvMsgv",
                                  e.target.value
                                );
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                newErrors[index].mssvMsgv = "";
                                setAuthorErrors(newErrors);
                              }}
                              onBlur={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].mssvMsgv = true;
                                setAuthorTouched(newTouched);

                                // Validate on blur
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                if (!author.mssvMsgv) {
                                  newErrors[index].mssvMsgv =
                                    "Vui lòng nhập MSSV/MSGV";
                                } else {
                                  newErrors[index].mssvMsgv = "";
                                }
                                setAuthorErrors(newErrors);
                              }}
                              onClick={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].mssvMsgv = true;
                                setAuthorTouched(newTouched);
                              }}
                              required
                              status={
                                authorErrors[index]?.mssvMsgv ? "error" : ""
                              }
                              className={
                                authorErrors[index]?.mssvMsgv
                                  ? "border-red-500"
                                  : ""
                              }
                            />
                            {authorErrors[index]?.mssvMsgv && (
                              <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                                <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                                  {authorErrors[index].mssvMsgv}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Tên SV /GV Vn */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullName-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên SV/GV (Tiếng Việt){" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="relative">
                            <Input
                              id={`fullName-${index}`}
                              placeholder="Tên sinh viên / giảng viên"
                              value={author.full_name}
                              status={
                                authorErrors[index]?.full_name ? "error" : ""
                              }
                              onChange={(e) => {
                                handleAuthorChange(
                                  index,
                                  "full_name",
                                  e.target.value
                                );
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                newErrors[index].full_name = e.target.value
                                  ? ""
                                  : "error";
                                setAuthorErrors(newErrors);
                              }}
                              onBlur={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].full_name = true;
                                setAuthorTouched(newTouched);
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                newErrors[index].full_name = author.full_name
                                  ? ""
                                  : "error";
                                setAuthorErrors(newErrors);
                              }}
                              onClick={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].full_name = true;
                                setAuthorTouched(newTouched);
                              }}
                              required
                              disabled={!isNameEditable(index)}
                            />
                          </div>
                        </div>
                        {/* Tên SV /GV En */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullNameEng-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên sinh viên / giảng viên (English)
                          </label>
                          <Input
                            id={`fullNameEng-${index}`}
                            placeholder="Tên sinh viên / giảng viên (English)"
                            value={author.full_name_eng}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "full_name_eng",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        {/* Button xóa */}
                        <div className="col-span-1 flex items-center justify-end pt-5">
                          <Button
                            icon={<MinusOutlined />}
                            onClick={() => handleRemoveAuthor(index)}
                            size="small"
                          />
                        </div>
                      </div>
                      {/* Row 2 */}
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        {/* Vai trò */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`role-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Vai trò <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="relative">
                            <Select
                              id={`role-${index}`}
                              className={`w-full ${
                                authorErrors[index]?.role
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="Vai trò"
                              value={author.role}
                              status={authorErrors[index]?.role ? "error" : ""}
                              onChange={(value) => {
                                handleAuthorChange(index, "role", value);
                                handleFieldChange({
                                  authors: authors.map((a, i) =>
                                    i === index ? { ...a, role: value } : a
                                  ),
                                });
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                newErrors[index].role = "";
                                setAuthorErrors(newErrors);
                              }}
                              onBlur={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].role = true;
                                setAuthorTouched(newTouched);

                                // Validate on blur
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                if (!author.role) {
                                  newErrors[index].role =
                                    "Vui lòng chọn vai trò";
                                } else {
                                  newErrors[index].role = "";
                                }
                                setAuthorErrors(newErrors);
                              }}
                              onClick={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].role = true;
                                setAuthorTouched(newTouched);
                              }}
                              required
                            >
                              <Option value="MainAuthor">Chính</Option>
                              <Option value="CorrespondingAuthor">
                                Liên hệ
                              </Option>
                              <Option value="MainAndCorrespondingAuthor">
                                Vừa chính vừa liên hệ
                              </Option>
                              <Option value="Participant">Tham gia</Option>
                            </Select>
                            {authorErrors[index]?.role && (
                              <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                                <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                                  {authorErrors[index].role}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* CQ công tác */}
                        <div className="col-span-4">
                          <label
                            htmlFor={`institution-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            CQ công tác <span style={{ color: "red" }}>*</span>
                          </label>
                          <div className="relative">
                            <Select
                              id={`institution-${index}`}
                              className={`w-full ${
                                authorErrors[index]?.institution
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="CQ công tác"
                              value={author.institution}
                              status={
                                authorErrors[index]?.institution ? "error" : ""
                              }
                              onChange={(value) => {
                                handleAuthorChange(index, "institution", value);
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                newErrors[index].institution = "";
                                setAuthorErrors(newErrors);
                              }}
                              onBlur={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].institution = true;
                                setAuthorTouched(newTouched);

                                // Validate on blur
                                const newErrors = [...authorErrors];
                                if (!newErrors[index]) newErrors[index] = {};
                                if (!author.institution) {
                                  newErrors[index].institution =
                                    "Vui lòng chọn cơ quan";
                                } else {
                                  newErrors[index].institution = "";
                                }
                                setAuthorErrors(newErrors);
                              }}
                              onClick={() => {
                                const newTouched = [...authorTouched];
                                if (!newTouched[index]) newTouched[index] = {};
                                newTouched[index].institution = true;
                                setAuthorTouched(newTouched);
                              }}
                              required
                              dropdownRender={(menu) => (
                                <>
                                  {menu}
                                  <div className="p-2 flex items-center gap-2">
                                    <Input
                                      placeholder="Nhập cơ quan công tác"
                                      value={
                                        authors[index].institutionInput || ""
                                      }
                                      onChange={(e) => {
                                        handleAuthorChange(
                                          index,
                                          "institutionInput",
                                          e.target.value
                                        );
                                        const newErrors = [...authorErrors];
                                        if (!newErrors[index])
                                          newErrors[index] = {};
                                        newErrors[index].institution = "";
                                        setAuthorErrors(newErrors);
                                      }}
                                    />
                                    <Button
                                      type="primary"
                                      size="small"
                                      onClick={() => {
                                        const value =
                                          authors[
                                            index
                                          ].institutionInput?.trim();
                                        if (value) {
                                          handleAuthorChange(
                                            index,
                                            "institution",
                                            value
                                          );
                                          const newErrors = [...authorErrors];
                                          if (!newErrors[index])
                                            newErrors[index] = {};
                                          newErrors[index].institution = "";
                                          setAuthorErrors(newErrors);
                                          message.success(
                                            "Cơ quan công tác đã được thêm vào"
                                          );
                                        } else {
                                          message.error(
                                            "Vui lòng nhập cơ quan công tác!"
                                          );
                                        }
                                      }}
                                    >
                                      Thêm
                                    </Button>
                                  </div>
                                </>
                              )}
                            >
                              {author.institutions?.map((institution) => (
                                <Option
                                  key={institution._id}
                                  value={institution._id}
                                >
                                  {institution.name}
                                </Option>
                              ))}
                            </Select>
                            {authorErrors[index]?.institution && (
                              <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                                <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                                  {authorErrors[index].institution}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Điểm đóng góp */}
                        <div className="col-span-3">
                          <label
                            htmlFor={`role-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Điểm đóng góp:
                          </label>
                          <div className="relative">
                            <Input
                              className="w-1/2 text-center"
                              readOnly
                              id={`contribution-${index}`}
                              value={
                                scores.perAuthor[`author_${index + 1}`] || 0
                              }
                            ></Input>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <h2 className="col-span-2 text-xs text-red-700 italic">
                    (Nếu tác giả không có MSSV/MSGV, vui lòng điền CCCD)
                  </h2>
                  <Button icon={<PlusOutlined />} onClick={handleAddAuthor}>
                    Thêm tác giả
                  </Button>
                </div>
              </section>

              {/* Khối "Nhập thông tin minh chứng" */}
              <section className="flex flex-col bg-white rounded-lg p-6 mb-4">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin Minh chứng
                </h2>
                {/*File*/}
                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-black pb-1"
                  >
                    Tải lên file <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <Input
                        id="file-upload"
                        placeholder="Upload file..."
                        value={originalFileName || ""} // Display the original file name
                        readOnly
                        status={fileError ? "error" : ""}
                      />
                      <Button type="primary" onClick={handleFileChange}>
                        Choose
                      </Button>
                      {selectedFile && (
                        <Button
                          icon={<CloseCircleOutlined />}
                          onClick={handleRemoveFile}
                          danger
                        />
                      )}
                    </div>
                  </div>
                </div>
                {/* Link và DOI */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Link công bố bài báo */}
                  <div>
                    <label
                      htmlFor="link"
                      className="block text-sm font-medium text-black pb-1"
                    >
                      Link công bố bài báo{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="link"
                        className={`w-full ${
                          linkError ? "border-red-500" : ""
                        }`}
                        placeholder="Link công bố bài báo (http://...)"
                        required
                        status={linkError ? "error" : ""}
                        onChange={(e) => {
                          setLink(e.target.value);
                          setLinkError("");
                        }}
                        onBlur={() => {
                          setLinkTouched(true);
                          validateLink();
                        }}
                        onClick={() => {
                          if (!linkTouched) {
                            setLinkTouched(true);
                          }
                        }}
                      />
                      {linkError && (
                        <div className="absolute right-0 top-0 h-full flex items-center pr-2">
                          <div className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-sm border border-red-200 shadow-sm">
                            {linkError}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Số DOI */}
                  <div>
                    <label
                      htmlFor="doi"
                      className="block text-sm font-medium text-black pb-1"
                    >
                      Số DOI
                    </label>
                    <Input
                      id="doi"
                      placeholder="Số DOI (vd: http://doi.org/10.1155.2019)"
                      onChange={(e) => setDoi(e.target.value)}
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-black">
                  Minh chứng cần file upload full bài báo và link bài báo. Hệ
                  thống chỉ hỗ trợ file PDF và có kích thước nhỏ hơn 3.5MB.
                  Trường hợp có nhiều hơn 1 file sử dụng nén thành file Zip hoặc
                  file Rar trước khi upload.
                </p>
                <div className="flex justify-end space-x-4 mt-6">
                  <Button type="primary" onClick={handleClear}>
                    Xóa trắng
                  </Button>
                  <Button type="primary" onClick={handleSave}>
                    Lưu
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Modal for icon click */}
      <Modal
        title={
          <span className="text-sm sm:text-base">
            Sử dụng AI để nhận diện thông tin
          </span>
        }
        visible={isIconModalVisible}
        onOk={handleIconModalOk}
        onCancel={handleIconModalCancel}
        footer={[
          <Button
            key="confirm"
            type="primary"
            onClick={handleIconModalOk}
            size="middle"
            className="text-xs sm:text-sm"
          >
            Xác nhận
          </Button>,
        ]}
        className="responsive-modal"
      >
        <div className="relative">
          <Tabs defaultActiveKey="1">
            <TabPane
              tab={<span className="text-xs sm:text-sm">Upload hình ảnh</span>}
              key="1"
            >
              <Upload
                name="image"
                listType="picture"
                showUploadList={false}
                beforeUpload={(file) => {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setUploadedImage(event.target.result);
                  };
                  reader.readAsDataURL(file);
                  return false; // Prevent upload
                }}
              >
                <Button
                  icon={<UploadOutlined />}
                  className="text-xs sm:text-sm"
                >
                  Tải ảnh lên
                </Button>
              </Upload>
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  style={{ marginTop: 16, width: "100%" }}
                />
              )}
              <div className="mt-4 text-xs text-red-700">
                <span className="font-bold">LƯU Ý:</span> Hệ thống chỉ hỗ trợ
                file hình ảnh có định dạng JPG, PNG và kích thước nhỏ hơn 5MB.
              </div>
            </TabPane>
            <TabPane
              tab={<span className="text-xs sm:text-sm">Nhập link</span>}
              key="2"
            >
              <Input
                placeholder="Nhập link"
                value={link}
                onChange={handleLinkChange}
                className="text-xs sm:text-sm"
              />
              <div className="mt-4 text-xs text-red-700">
                <span className="font-bold">LƯU Ý:</span> Hệ thống chỉ hỗ trợ
                khi bạn truyền, nhập đúng đường dẫn bài nghiên cứu.
              </div>
            </TabPane>
          </Tabs>
          <img
            src="https://cdn-icons-png.flaticon.com/512/3409/3409542.png"
            alt="Help Icon"
            className="absolute top-0 right-0 w-4 h-4 sm:w-6 sm:h-6 m-2 cursor-pointer"
            onClick={showHelpModal}
          />
        </div>
      </Modal>

      <Modal
        title={<span className="text-sm sm:text-base">Hướng dẫn</span>}
        visible={isHelpModalVisible}
        onOk={handleHelpModalOk}
        onCancel={handleHelpModalCancel}
        footer={[
          <Button
            key="confirm"
            type="primary"
            onClick={handleHelpModalOk}
            size="middle"
            className="text-xs sm:text-sm"
          >
            Đóng
          </Button>,
        ]}
        className="responsive-modal"
      >
        <div className="text-xs sm:text-sm">
          <p>Đây là hướng dẫn sử dụng hệ thống.</p>
          <p>
            Vui lòng làm theo các bước sau để hoàn thành việc nhập thông tin.
          </p>
          {/* Add more instructions as needed */}
        </div>
      </Modal>
    </div>
  );
};

export default AddScientificPaperPage;
