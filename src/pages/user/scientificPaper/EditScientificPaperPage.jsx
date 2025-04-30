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
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const { Option } = Select;
const { TabPane } = Tabs;

const EditScientificPaperPage = () => {
  const [authors, setAuthors] = useState([
    {
      id: 1,
      mssvMsgv: "",
      full_name: "",
      full_name_eng: "",
      role: "",
      institution: "",
      institutions: [],
      customInstitution: "",
    },
    {
      id: 2,
      mssvMsgv: "",
      full_name: "",
      full_name_eng: "",
      role: "",
      institution: "",
      institutions: [],
      customInstitution: "",
    },
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [paperTypes, setPaperTypes] = useState([]);
  const [paperGroups, setPaperGroups] = useState([]);
  const [departments, setDepartments] = useState([]); // State for departments
  const [isIconModalVisible, setIsIconModalVisible] = useState(false); // State for icon modal visibility
  const [link, setLink] = useState(""); // State for link input
  const [uploadedImage, setUploadedImage] = useState(null); // State for uploaded image
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false); // State for help modal visibility
  const [selectedPaperType, setSelectedPaperType] = useState(""); // State for selected paper type
  const [selectedPaperGroup, setSelectedPaperGroup] = useState(""); // State for selected paper group
  const [titleVn, setTitleVn] = useState("");
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
  const [scores, setScores] = useState({
    total: 0,
    perAuthor: {},
  });
  const [originalFileName, setOriginalFileName] = useState(""); // State for original file name
  const [fileError, setFileError] = useState(""); // State for file error
  const [fileTouched, setFileTouched] = useState(false); // State for file touched
  const navigate = useNavigate();
  const { id } = useParams();
  const [authorErrors, setAuthorErrors] = useState([]);
  // Get the paper ID from the URL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [types, groups, departmentsData] = await Promise.all([
          userApi.getAllPaperTypes(),
          userApi.getAllPaperGroups(),
          userApi.getAllDepartments(),
        ]);

        setPaperTypes(types);
        setPaperGroups(groups);
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Không thể tải dữ liệu.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchPaperDetails = async () => {
      try {
        // Fetch paper details
        const paperData = await userApi.getScientificPaperById(id);

        // Set basic paper details
        setTitleVn(paperData.title_vn || "");
        setTitleEn(paperData.title_en || "");
        setPublishDate(moment(paperData.publish_date));
        setMagazineVi(paperData.magazine_vi || "");
        setMagazineEn(paperData.magazine_en || "");
        setMagazineType(paperData.magazine_type || "");
        setPageCount(paperData.page || 0);
        setIssnIsbn(paperData.issn_isbn || "");
        setOrderNo(paperData.order_no || true);
        setFeatured(paperData.featured || "");
        setKeywords(paperData.keywords || "");
        setSummary(paperData.summary || "");
        setSelectedDepartment(paperData.department || "");
        setDoi(paperData.doi || "");
        setCoverImage(paperData.cover_image || "");
        setSelectedFile(paperData.file || "");
        setLink(paperData.link || "");

        // Set paper type and group
        setSelectedPaperType(paperData.article_type?._id || "");
        setSelectedPaperGroup(paperData.article_group?._id || "");

        // Process authors with more details
        const authorsWithDetails = await Promise.all(
          paperData.author.map(async (author, index) => {
            let institutions = [];

            // If author has user_id, fetch their institutions
            if (author.user_id) {
              try {
                const institutionsResponse = await userApi.getUserWorksByUserId(
                  author.user_id
                );

                if (
                  institutionsResponse &&
                  Array.isArray(institutionsResponse) &&
                  institutionsResponse.length > 0
                ) {
                  // Map the institution IDs to fetch their details
                  institutions = await Promise.all(
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
                      } catch (error) {
                        console.error(
                          "Error fetching work unit details:",
                          error
                        );
                        return {
                          _id: item.work_unit_id,
                          name: "Unknown Institution",
                        };
                      }
                    })
                  );
                } else {
                  // Fallback: fetch all work units
                  const allWorkUnits = await userApi.getAllWorkUnits();
                  institutions = allWorkUnits.map((unit) => ({
                    _id: unit._id,
                    name: unit.name_vi || unit.name || "Unknown",
                  }));
                }
              } catch (error) {
                console.error("Error fetching institutions for author:", error);
                // Fallback: fetch all work units
                try {
                  const allWorkUnits = await userApi.getAllWorkUnits();
                  institutions = allWorkUnits.map((unit) => ({
                    _id: unit._id,
                    name: unit.name_vi || unit.name || "Unknown",
                  }));
                } catch (fallbackError) {
                  console.error("Fallback error:", fallbackError);
                  institutions = [];
                }
              }
            }

            return {
              id: index + 1,
              mssvMsgv: author.user_id || "",
              full_name: author.author_name_vi || "",
              full_name_eng: author.author_name_en || "",
              role: author.role || "",
              institution: author.work_unit_id?._id || "",
              institutions: institutions,
              point: author.point || 0,
              customInstitution: "",
            };
          })
        );

        setAuthors(authorsWithDetails);

        // Tính điểm sau khi đã có đầy đủ thông tin
        setTimeout(() => {
          handleFieldChange({
            article_type: paperData.article_type?._id || "",
            article_group: paperData.article_group?._id || "",
            doi: paperData.doi || false,
            featured: paperData.featured || false,
            authors: authorsWithDetails.map((author, index) => ({
              id: `author_${index + 1}`,
              role: author.role,
              degree: "Bachelor",
              point: author.point || 0,
              institutions: author.institutions || [],
            })),
          });
        }, 500);
      } catch (error) {
        console.error("Error fetching paper details:", error);
        message.error("Không thể tải dữ liệu bài báo.");
      }
    };

    if (id) {
      fetchPaperDetails();
    }
  }, [id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await userApi.uploadImage(file); // Call uploadImage function
        setCoverImage(response.url); // Use the uploaded image's URL
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
          const response = await userApi.uploadFile(file);
          setSelectedFile(response.url); // Save the Cloudinary URL for backend
          setOriginalFileName(file.name); // Use the uploaded file's name
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
        full_name_eng: "",
        role: "",
        institution: "",
        institutions: [],
        customInstitution: "",
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
      updatedAuthors[index][field] = value; // Ensure this is ObjectId (_id)
    } else {
      updatedAuthors[index][field] = value;
    }

    if (field === "role") {
      handleFieldChange({
        authors: updatedAuthors.map((author, i) => ({
          id: `author_${i + 1}`,
          role: i === index ? value : author.role,
          degree: "Bachelor",
          point: 0,
          institutions: author.institutions || [],
        })),
      });
    }

    if (field === "mssvMsgv" && value.trim() !== "") {
      try {
        const lecturerData = await userApi
          .getLecturerById(value)
          .catch((error) => {
            console.log("Error fetching lecturer:", error.message);
            return null;
          });

        const studentData = await userApi
          .getStudentById(value)
          .catch((error) => {
            console.log("Error fetching student:", error.message);
            return null;
          });

        const userData = lecturerData || studentData;

        if (userData) {
          updatedAuthors[index].full_name =
            userData.full_name || userData.name || "";

          try {
            const institutionsResponse = await userApi.getUserWorksByUserId(
              value
            );
            console.log("User works response:", institutionsResponse);

            if (
              institutionsResponse &&
              Array.isArray(institutionsResponse) &&
              institutionsResponse.length > 0
            ) {
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

              if (institutions.length > 0) {
                updatedAuthors[index].institution = institutions[0]._id;
              }

              console.log("Fetched institutions:", institutions);
            } else {
              console.log(
                "No institutions found, fetching all work units as fallback"
              );
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

          if (updatedAuthors[index].full_name) {
            const nameParts = updatedAuthors[index].full_name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .split(" ");
            const firstName = nameParts.shift();
            updatedAuthors[index].full_name_eng = [...nameParts, firstName]
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ");
          }
        } else {
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
          } catch (error) {
            console.error("Error fetching all work units:", error);
            updatedAuthors[index].institutions = [];
          }
        }
      } catch (error) {
        console.error("Error in handleAuthorChange:", error);
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

  const handleAddCustomInstitution = async (index) => {
    const customInstitution = authors[index].customInstitution?.trim();
    if (customInstitution) {
      try {
        const response = await userApi.createWorkUnit({
          name_vi: customInstitution,
          name_en: customInstitution,
          address_vi: "Unknown Address",
          address_en: "Unknown Address",
        });
        const updatedAuthors = [...authors];
        updatedAuthors[index].institution = response._id;
        updatedAuthors[index].institutions.push({
          _id: response._id,
          name: customInstitution,
        });
        updatedAuthors[index].customInstitution = "";
        setAuthors(updatedAuthors);
        message.success("Cơ quan công tác đã được thêm thành công!");
      } catch (error) {
        console.error("Error saving custom institution:", error);
        message.error("Không thể thêm cơ quan công tác. Vui lòng thử lại.");
      }
    } else {
      message.error("Vui lòng nhập tên cơ quan công tác!");
    }
  };

  const calculateAndSetScore = async (inputData) => {
    try {
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

  const handleFieldChange = (updatedField) => {
    const updatedInput = {
      article_type: selectedPaperType,
      article_group: selectedPaperGroup,
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

  const handleClear = () => {
    setAuthors([
      {
        id: 1,
        mssvMsgv: "",
        full_name: "",
        full_name_eng: "",
        role: "",
        institution: "",
        institutions: [],
        customInstitution: "",
      },
      {
        id: 2,
        mssvMsgv: "",
        full_name: "",
        full_name_eng: "",
        role: "",
        institution: "",
        institutions: [],
        customInstitution: "",
      },
    ]);
    setSelectedFile(null);
    setCoverImage(null);
    message.info("Đã xóa trắng thông tin.");
  };

  const handleSave = async () => {
    try {
      if (!titleVn) {
        message.error("Vui lòng nhập tên bài báo (Tiếng Việt)");
        return;
      }

      if (!selectedPaperType) {
        message.error("Vui lòng chọn loại bài báo");
        return;
      }

      if (!selectedPaperGroup) {
        message.error("Vui lòng chọn nhóm bài báo");
        return;
      }

      if (
        authors.some(
          (author) =>
            !author.mssvMsgv ||
            !author.full_name ||
            !author.role ||
            !author.institution
        )
      ) {
        message.error("Vui lòng điền đầy đủ thông tin tác giả");
        return;
      }

      const randomUUID = () => {
        return "xxxxxxxxxxxx".replace(/[x]/g, function () {
          return (Math.random() * 16) | 0;
        });
      };

      const updatedAuthors = await Promise.all(
        authors.map(async (author) => {
          if (
            !/^[a-f\d]{24}$/i.test(author.institution) &&
            author.institution
          ) {
            try {
              const response = await userApi.createWorkUnit({
                work_unit_id: randomUUID(),
                name_vi: author.institution,
                name_en: author.institution,
                address_vi: "Unknown Address",
                address_en: "Unknown Address",
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

      const payload = {
        article_type: selectedPaperType || "",
        article_group: selectedPaperGroup || "",
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

      console.log("Payload:", payload);

      const response = await userApi.updateScientificPaperById(id, payload);
      message.success("Bài báo đã được cập nhật thành công!");
      navigate("/scientific-paper");
      console.log("Response:", response);
    } catch (error) {
      console.error(
        "Error updating scientific paper:",
        error.response?.data || error.message
      );
      if (error.response?.data?.message) {
        message.error(`Lỗi từ server: ${error.response.data.message}`);
      } else {
        message.error("Không thể cập nhật bài báo. Vui lòng thử lại.");
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
      <div className="flex flex-col pb-7 pt-[80px] max-w-[calc(100%-220px)] mx-auto">
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
              Cập nhật bài báo khoa học
            </span>
          </div>
        </div>

        <div className="self-center w-full max-w-[1563px] px-4 mt-4">
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              <section className="flex flex-col bg-white rounded-lg p-6 mb-3">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin
                </h2>
                <div className="flex gap-4">
                  <div className="flex justify-center">
                    <label
                      htmlFor="cover-upload"
                      className="cursor-pointer relative"
                    >
                      <img
                        src={
                          coverImage ||
                          "https://via.placeholder.com/180x200?text=Bìa+Bài+Báo"
                        }
                        alt="Bìa bài báo"
                        className="w-[260px] h-[315px] object-cover border border-gray-300 rounded-lg shadow-md hover:brightness-90 transition duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 text-white font-semibold text-sm rounded-lg transition duration-300">
                        Chọn ảnh
                      </div>
                    </label>
                    <input
                      id="cover-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="w-full grid grid-cols-1 pl-4">
                    <div className="mb-2">
                      <label
                        htmlFor="paperType"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Loại bài báo <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="paperType"
                        className="w-full h-10"
                        placeholder="Chọn loại bài báo"
                        required
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={selectedPaperType}
                        onChange={(value) => setSelectedPaperType(value)}
                      >
                        {paperTypes.map((type) => (
                          <Option key={type._id} value={type._id}>
                            {type.type_name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="mb-2">
                      <label
                        htmlFor="paperGroup"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Thuộc nhóm <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="paperGroup"
                        className="w-full h-10"
                        placeholder="Chọn nhóm bài báo"
                        required
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={selectedPaperGroup}
                        onChange={(value) => setSelectedPaperGroup(value)}
                      >
                        {paperGroups.map((group) => (
                          <Option key={group._id} value={group._id}>
                            {group.group_name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="mb-2">
                      <label
                        htmlFor="titleVn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên bài báo (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <TextArea
                        id="titleVn"
                        className="w-full"
                        placeholder="Nhập tên bài báo (Tiếng Việt)"
                        rows={2}
                        required
                        onChange={(e) => setTitleVn(e.target.value)}
                        value={titleVn}
                      />
                    </div>
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
                        rows={2}
                        onChange={(e) => setTitleEn(e.target.value)}
                        value={titleEn}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <div className="flex flex-col w-[260px] gap-4">
                    <div className="">
                      <label
                        htmlFor="publishDate"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Ngày công bố <span style={{ color: "red" }}>*</span>
                      </label>
                      <DatePicker
                        id="publishDate"
                        className="w-full h-10"
                        placeholder="Ngày công bố"
                        value={publishDate ? moment(publishDate) : null}
                        onChange={(date, dateString) =>
                          setPublishDate(dateString)
                        }
                      />
                    </div>
                    <div className="">
                      <label
                        htmlFor="pageCount"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số trang <span style={{ color: "red" }}>*</span>
                      </label>
                      <InputNumber
                        id="pageCount"
                        className="w-full h-10"
                        placeholder="Số trang"
                        min={1}
                        value={pageCount}
                        onChange={(value) => setPageCount(value)}
                      />
                    </div>
                    {/* <div className="pb-7">
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
                        value={orderNo}
                        onChange={(value) => setOrderNo(value)}
                      />
                    </div> */}
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
                          checked={!!featured} // Ensure it reflects the boolean value correctly
                          onChange={(e) => setFeatured(e.target.checked)}
                        />
                      </div>
                    </div>
                    <div className="">
                      <label
                        htmlFor="issnIsbn"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Số ISSN / ISBN <span style={{ color: "red" }}>*</span>
                      </label>
                      <Input
                        id="issnIsbn"
                        className="w-full h-10"
                        placeholder="Số ISSN / ISBN"
                        onChange={(e) => setIssnIsbn(e.target.value)}
                        value={issnIsbn}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 w-full pl-4">
                    <div className="">
                      <label
                        htmlFor="magazineVi"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Tên tạp chí / kỷ yếu (Tiếng Việt){" "}
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <Input
                        id="magazineVi"
                        className="w-full h-10"
                        placeholder="Tên tạp chí / kỷ yếu (Tiếng Việt)"
                        onChange={(e) => setMagazineVi(e.target.value)}
                        value={magazineVi}
                      />
                    </div>
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
                        value={magazineEn}
                      />
                    </div>
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
                        value={magazineType}
                      />
                    </div>
                    <div className="">
                      <label
                        htmlFor="department"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Khoa / Viện <span style={{ color: "red" }}>*</span>
                      </label>
                      <Select
                        id="department"
                        className="w-full h-10"
                        placeholder="Chọn Khoa / Viện"
                        required
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                          option?.children
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        value={selectedDepartment}
                        onChange={(value) => setSelectedDepartment(value)}
                      >
                        {departments.map((department) => (
                          <Option key={department._id} value={department._id}>
                            {department.department_name}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    <div className="pb-2">
                      <label
                        htmlFor="keywords"
                        className="block text-sm font-medium text-black pb-1"
                      >
                        Từ khóa <span style={{ color: "red" }}>*</span>
                      </label>
                      <TextArea
                        id="keywords"
                        placeholder="Nhập từ khóa"
                        rows={2}
                        onChange={(e) => setKeywords(e.target.value)}
                        value={keywords}
                      />
                    </div>
                  </div>
                </div>

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
                  <TextArea
                    id="summary"
                    placeholder="Nhập tóm tắt"
                    rows={4}
                    onChange={(e) => setSummary(e.target.value)}
                    value={summary}
                  />
                </div>
              </section>
            </div>

            <div className="w-full">
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
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        <div className="col-span-3">
                          <label
                            htmlFor={`mssvMsgv-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Mã số SV/GV <span style={{ color: "red" }}>*</span>
                          </label>
                          <Input
                            id={`mssvMsgv-${index}`}
                            placeholder="MSSV/MSGV"
                            value={author.mssvMsgv}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "mssvMsgv",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullName-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên SV/GV (Tiếng Việt){" "}
                            <span style={{ color: "red" }}>*</span>
                          </label>
                          <Input
                            id={`fullName-${index}`}
                            placeholder="Tên sinh viên / giảng viên"
                            value={author.full_name}
                            onChange={(e) =>
                              handleAuthorChange(
                                index,
                                "full_name",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                        <div className="col-span-4">
                          <label
                            htmlFor={`fullNameEng-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            Tên SV/GV (Tiếng Anh)
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
                        <div className="col-span-1 flex items-center justify-end pt-5">
                          <Button
                            icon={<MinusOutlined />}
                            onClick={() => handleRemoveAuthor(index)}
                            size="small"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 col-span-12 items-center">
                        <div className="col-span-3">
                          <label
                            htmlFor={`role-${index}`}
                            className="block text-sm font-medium text-blackpb-1"
                          >
                            Vai trò <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id={`role-${index}`}
                            className="w-full"
                            placeholder="Vai trò"
                            value={author.role}
                            onChange={(value) =>
                              handleAuthorChange(index, "role", value)
                            }
                            required
                          >
                            <Option value="MainAuthor">Chính</Option>
                            <Option value="CorrespondingAuthor">Liên hệ</Option>
                            <Option value="MainAndCorrespondingAuthor">
                              Vừa chính vừa liên hệ
                            </Option>
                            <Option value="Participant">Tham gia</Option>
                          </Select>
                        </div>
                        <div className="col-span-4">
                          <label
                            htmlFor={`institution-${index}`}
                            className="block text-sm font-medium text-black pb-1"
                          >
                            CQ công tác <span style={{ color: "red" }}>*</span>
                          </label>
                          <Select
                            id={`institution-${index}`}
                            className="w-full"
                            placeholder="CQ công tác"
                            value={author.institution}
                            onChange={(value) =>
                              handleAuthorChange(index, "institution", value)
                            }
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
                                        authors[index].institutionInput?.trim();
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
                        </div>
                        <div className="col-span-3">
                          <label
                            htmlFor={`contribution-${index}`}
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

              <section className="flex flex-col bg-white rounded-lg p-6 mb-4">
                <h2 className="text-sm font-medium leading-none text-black uppercase mb-4">
                  Nhập thông tin Minh chứng
                </h2>
                <div className="mb-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-black pb-1"
                  >
                    Tải lên file <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="file-upload"
                      placeholder="Upload file..."
                      value={originalFileName || ""} // Display the original file name
                      readOnly
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="link"
                      className="block text-sm font-medium text-black pb-1"
                    >
                      Link công bố bài báo{" "}
                      <span style={{ color: "red" }}>*</span>
                    </label>
                    <Input
                      id="link"
                      placeholder="Link công bố bài báo (http://...)"
                      required
                      onChange={(e) => setLink(e.target.value)}
                      value={link}
                    />
                  </div>
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
                      value={doi}
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
                  <Button type="default" onClick={handleClear}>
                    Xóa trắng
                  </Button>
                  <Button type="primary" onClick={handleSave}>
                    Cập nhật
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <Modal
        title="Sử dụng AI để nhận diện thông tin"
        visible={isIconModalVisible}
        onOk={handleIconModalOk}
        onCancel={handleIconModalCancel}
        footer={[
          <Button key="confirm" type="primary" onClick={handleIconModalOk}>
            Xác nhận
          </Button>,
        ]}
      >
        <div className="relative">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Upload hình ảnh" key="1">
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
                  return false;
                }}
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
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
            <TabPane tab="Nhập link" key="2">
              <Input
                placeholder="Nhập link"
                value={link}
                onChange={handleLinkChange}
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
            className="absolute top-0 right-0 w-6 h-6 m-2 cursor-pointer"
            onClick={showHelpModal}
          />
        </div>
      </Modal>

      <Modal
        title="Hướng dẫn"
        visible={isHelpModalVisible}
        onOk={handleHelpModalOk}
        onCancel={handleHelpModalCancel}
        footer={[
          <Button key="confirm" type="primary" onClick={handleHelpModalOk}>
            Đóng
          </Button>,
        ]}
      >
        <p>Đây là hướng dẫn sử dụng hệ thống.</p>
        <p>Vui lòng làm theo các bước sau để hoàn thành việc nhập thông tin.</p>
      </Modal>
    </div>
  );
};

export default EditScientificPaperPage;
