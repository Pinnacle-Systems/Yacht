import {
  FaQuestionCircle,
  FaUpload,
  FaWhatsapp,
  FaFileAlt,
} from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import {
  FiSave,
  FiPrinter,
  FiShare2,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Select from "react-select";
import { Country } from "country-state-city";
import Swal from "sweetalert2";
import { ReusableInput } from "./CommonInput";
import CommonTable from "../common/CommonTable";
import Modal from "../../../UiComponents/Modal";
import { params } from "../../../Utils/helper";
import {
  useAddStyleSheetMutation,
  useUpdateStyleSheetMutation,
  useGetStyleSheetQuery,
  useGetStyleSheetByIdQuery,
  useDeleteStyleSheetMutation,
} from "../../../redux/services/StyleSheet";
import { toast } from "react-toastify";
import { getImageUrlPath } from "../../../Constants";

import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./PrintFormat-CD";
import tw from "../../../Utils/tailwind-react-pdf";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

const Manufacture = ({
  id,
  setId,
  setReport,
  readOnly,
  allData,
  onDataClick,
}) => {
  const [formData, setFormData] = useState({
    fdsDate: "",
    fabCode: "",
    materialCode: "",
    fabType: "",
    countryOriginFabric: null,
    countryOriginYarn: null,
    countryOriginFiber: null,
    smsMcq: "One roll",
    smsMoq: "One roll",
    smsLeadTime: "",
    bulkMcq: "",
    bulkMoq: "",
    bulkLeadTime: "",
    surCharges: "",
    priceFob: "",
    construction: "",
    fiberContent: "",
    yarnDetails: "",
    weightGSM: "",
    weightOpposite: "",
    weftWalesCount: "",
    widthFinished: "",
    widthCuttale: "",
    wrapCoursesCount: "",
    dyeName: "",
    dyedMethod: "",
    printingMethod: "",
    surfaceFinish: "",
    otherPerformanceFunction: "",
  });
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  // const [readOnly, setReadOnly] = useState(false)
  // const [id, setId] = useState("");
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [mode, setMode] = useState('view')
  const fileInputRef = useRef(null);
  const syncFormWithDb = useCallback((data) => {
    if (!data) return;

    setFormData({
      // fdsDate: data.fdsDate || '',
      fdsDate: data.fdsDate
        ? new Date(data.fdsDate).toISOString().slice(0, 10)
        : "",

      fabCode: data.fabCode || "",
      materialCode: data.materialCode || "",
      fabType: data.fabType || "",
      // countryOriginFabric: data.countryOriginFabric || null,
      // countryOriginYarn: data.countryOriginYarn || null,
      // countryOriginFiber: data.countryOriginFiber || null,
      countryOriginFabric:
        typeof data.countryOriginFabric === "string"
          ? countryOptions.find(
              (c) =>
                c.label === data.countryOriginFabric ||
                c.value === data.countryOriginFabric
            )
          : data.countryOriginFabric || null,

      countryOriginYarn:
        typeof data.countryOriginYarn === "string"
          ? countryOptions.find(
              (c) =>
                c.label === data.countryOriginYarn ||
                c.value === data.countryOriginYarn
            )
          : data.countryOriginYarn || null,

      countryOriginFiber:
        typeof data.countryOriginFiber === "string"
          ? countryOptions.find(
              (c) =>
                c.label === data.countryOriginFiber ||
                c.value === data.countryOriginFiber
            )
          : data.countryOriginFiber || null,
      smsMcq: data.smsMcq || "",
      smsMoq: data.smsMoq || "",
      smsLeadTime: data.smsLeadTime || "",
      bulkMcq: data.bulkMcq || "",
      bulkMoq: data.bulkMoq || "",
      bulkLeadTime: data.bulkLeadTime || "",
      surCharges: data.surCharges || "",
      priceFob: data.priceFob || "",
      construction: data.construction || "",
      fiberContent: data.fiberContent || "",
      yarnDetails: data.yarnDetails || "",
      weightGSM: data.weightGSM || "",
      weightOpposite: data.weightOpposite || "",
      weftWalesCount: data.weftWalesCount || "",
      widthFinished: data.widthFinished || "",
      widthCuttale: data.widthCuttale || "",
      wrapCoursesCount: data.wrapCoursesCount || "",
      dyeName: data.dyeName || "",
      dyedMethod: data.dyedMethod || "",
      printingMethod: data.printingMethod || "",
      surfaceFinish: data.surfaceFinish || "",
      otherPerformanceFunction: data.otherPerformanceFunction || "",
    });

    // if (data.fabricImage) {
    //   setImagePreview(`data:image/jpeg;base64,${data.fabricImage}`);
    // } else {
    //   setImagePreview(null);
    // }
    if (data?.fabricImage) {
      // setImagePreview(`${BASE_URL}/uploads/${encodeURIComponent(data.fabricImage)}`)
      setImagePreview(getImageUrlPath(data.fabricImage));

      setImageFile(getImageUrlPath(data.fabricImage));
      console.log(
        getImageUrlPath(data.fabricImage),
        "getImageUrlPath(data.fabricImage)"
      );
    } else {
      setImagePreview(null);
    }
    console.log("data.fabricImage", data.fabricImage);

    // setReadOnly(mode === 'view');
  }, []);
  const { data: styleData } = useGetStyleSheetQuery({ params });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStyleSheetByIdQuery(id, { skip: !id });

  const [addData] = useAddStyleSheetMutation();
  const [updateData] = useUpdateStyleSheetMutation();
  const [deleteStyleSheet] = useDeleteStyleSheetMutation();

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);
  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "22px",
      height: "22px",
      fontSize: "12px",
      borderColor: "#cbd5e1",
      "&:hover": {
        borderColor: "#94a3b8",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "22px",
      padding: "0 8px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "22px",
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "14px",
      padding: "8px 12px",
    }),
  };
  const columns = [
    {
      header: "S.No",
      accessor: (_item, index) => index + 1,
      cellClass: () => "",
      className: "font-medium text-gray-900 w-[60px]  text-center",
    },
    {
      header: "ID",
      accessor: (item) => item.id,
      cellClass: () => "font-medium text-gray-900 text-center",
    },
    {
      header: "FDS Date",
      accessor: (item) => new Date(item.fdsDate).toLocaleDateString(),
      cellClass: () => "text-center",
    },
    {
      header: "Fab Code",
      accessor: (item) => item.fabCode,
      cellClass: () => "text-center",
    },
    {
      header: "Material Code",
      accessor: (item) => item.materialCode,
      cellClass: () => "text-center",
    },
    {
      header: "Fabric Type",
      accessor: (item) => item.fabType,
      cellClass: () => "text-center",
    },
    {
      header: "SMS MCQ",
      accessor: (item) => item.smsMcq,
      cellClass: () => "text-center",
    },
    {
      header: "SMS MOQ",
      accessor: (item) => item.smsMoq,
      cellClass: () => "text-center",
    },
    {
      header: "Price FOB",
      accessor: (item) => item.priceFob,
      cellClass: () => "text-center",
    },
  ];

  const validateBasicInformation = () => {
    if (!formData.fdsDate) {
      toast.error("FDS Date is required");
      return false;
    }

    if (!formData.materialCode?.trim()) {
      toast.error("Customer Material Code is required");
      return false;
    }

    if (!formData.fabCode?.trim()) {
      toast.error("Fab Code is required");
      return false;
    }

    if (!formData.fabType?.trim()) {
      toast.error("Fab Type is required");
      return false;
    }

    if (!formData.countryOriginFabric) {
      toast.error("Country of Origin (Fabric) is required");
      return false;
    }

    return true;
  };

  // Event handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (field, selectedOption) => {
    setFormData((prev) => ({ ...prev, [field]: selectedOption }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setImageFile(file);
      console.log(imageFile, "Imageset");
      setImageRemoved(false);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image under 5MB.");
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    console.log(imageFile, "Image file");
  };

  // const handleSubmitCustom = async (callback, data, text) => {
  //   try {
  //     const formData = new FormData();
  //     for (let key in data) formData.append(key, data[key]);

  //     if (imageFile instanceof File) formData.append("fabricImage", imageFile);
  //     if (imageRemoved) formData.append("removeImage", "true");

  //     let returnData;
  //     if (text === "Updated") {
  //       returnData = await callback(data);
  //     } else {
  //       returnData = await callback(formData);
  //     }

  //     for (let pair of formData.entries()) {
  //       console.log(`${pair[0]}:`, pair[1]);
  //     }

  //     setId(returnData?.data?.id);
  //     setImageRemoved(false);

  //     Swal.fire({
  //       icon: 'success',
  //       title: `${text || 'Updated'} Successfully`,

  //       showConfirmButton: false,
  //       timer: 2000
  //     });

  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     Swal.fire({
  //       icon: 'error',
  //       title: 'Submission error',
  //       text: error.data?.message || 'Something went wrong!',
  //     });
  //   }
  // };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const formData = new FormData();

      for (let key in data) {
        let value = data[key];

        if (
          key === "countryOriginFabric" ||
          key === "countryOriginYarn" ||
          key === "countryOriginFiber"
        ) {
          formData.append(key, value ? JSON.stringify(value) : "");
        } else {
          formData.append(key, value);
        }
      }

      if (imageFile instanceof File) formData.append("fabricImage", imageFile);
      if (imageRemoved) formData.append("removeImage", true);

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData });
      } else {
        returnData = await callback(formData);
      }

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
      setReport(false);
      setId(returnData?.data?.id);
      setImageRemoved(false);

      Swal.fire({
        icon: "success",
        title: `${text || "Updated"} Successfully`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  function onDataClick(id) {
    setId(id);
    // setMode(type)
  }

  const saveData = () => {
    const isAllFieldsEmpty = Object.values(formData).every(
      (value) =>
        value === null ||
        value === "" ||
        (typeof value === "string" && value.trim() === "")
    );

    if (isAllFieldsEmpty) {
      alert("Please fill at least one field before submitting.");
      return;
    }
    if (!validateBasicInformation()) return;
    if (id) {
      handleSubmitCustom(updateData, formData, "Updated");
    } else {
      handleSubmitCustom(addData, formData, "Added");
    }
    setFormData({
      fdsDate: "",
      fabCode: "",
      materialCode: "",
      fabType: "",
      countryOriginFabric: null,
      countryOriginYarn: null,
      countryOriginFiber: null,
      smsMcq: "One roll",
      smsMoq: "One roll",
      smsLeadTime: "",
      bulkMcq: "",
      bulkMoq: "",
      bulkLeadTime: "",
      surCharges: "",
      priceFob: "",
      construction: "",
      fiberContent: "",
      yarnDetails: "",
      weightGSM: "",
      weightOpposite: "",
      weftWalesCount: "",
      widthFinished: "",
      widthCuttale: "",
      wrapCoursesCount: "",
      dyedMethod: "",
      printingMethod: "",
      surfaceFinish: "",
      otherPerformanceFunction: "",
    });

    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(false);
    setId("");
  };

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.isoCode,
      ...country,
    }));
  }, []);
  console.log(styleData, "styleData");

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirm) return;

    try {
      await deleteStyleSheet(id).unwrap();
      Swal.fire({
        icon: "success",
        title: "Deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: err?.data?.message || "Something went wrong!",
      });
    }
  };

  //   const DownloadExcel = async (singleData) => {
  //     const data = singleData?.data;
  //     const arrayData = Array.isArray(data) ? data : [data];
  //     const ignoreFields = ["id", "createdAt", "updatedAt", "surCharges"];

  //     const workbook = new ExcelJS.Workbook();
  //     const sheet = workbook.addWorksheet("Fabric Description");

  //     // Title row
  //     const titleRow = sheet.addRow(["Fabric Description"]);
  //     titleRow.font = { size: 20, bold: true, color: { argb: "FF000000" } };
  //     titleRow.alignment = { horizontal: "center", vertical: "middle" };
  //     sheet.mergeCells(`A1:B1`);
  //     titleRow.height = 30;
  //     // titleRow.fill = {
  //     //   type: "pattern",
  //     //   pattern: "solid",
  //     //   // fgColor: { argb: "FF4472C4" },
  //     // };

  //     sheet.addRow([]);

  //     let rowIndex = 3;

  //     arrayData.forEach((item) => {
  //       Object.entries(item).forEach(([key, value]) => {
  //         if (!ignoreFields.includes(key)) {
  //           const capitalizedKey = key
  //             .replace(/([A-Z])/g, " $1")
  //             .replace(/^./, (str) => str.toUpperCase());

  //           const row = sheet.addRow([capitalizedKey, value || ""]);
  //           row.getCell(1).font = { bold: true };
  //           row.getCell(1).alignment = { horizontal: "left" };
  //           row.getCell(2).alignment = { horizontal: "left" };

  //           // if (rowIndex % 2 === 1) {
  //           //   row.fill = {
  //           //     type: "pattern",
  //           //     pattern: "solid",
  //           //     fgColor: { argb: "FFF2F2F2" },
  //           //   };
  //           // }

  //           rowIndex++;
  //         }
  //       });

  //       sheet.addRow([]);
  //       rowIndex++;
  //     });

  //     sheet.getColumn(1).width = 30;
  //     sheet.getColumn(2).width = 50;

  //     // ---- Browser download ----
  //     const buffer = await workbook.xlsx.writeBuffer(); // create buffer
  //     const blob = new Blob([buffer], {
  //       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });
  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = "FabricDescriptionSheet.xlsx";
  //     link.click();
  //   };

  // import ExcelJS from "exceljs";

  const DownloadExcel = async (singleData) => {
    const data = singleData?.data;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Fabric Description Sheet");

    // Title
    sheet.mergeCells("A1:B1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "Fabric Sheet Details";
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Non-grid data (your provided fields)
    const fields = [
      ["FDS Date", data?.fdsDate || ""],
      ["Fabric Code", data?.fabCode || ""],
      ["Material Code", data?.materialCode || ""],
      ["Fabric Type", data?.fabType || ""],
      ["Country Origin (Fabric)", data?.countryOriginFabric || ""],
      ["Country Origin (Yarn)", data?.countryOriginYarn || ""],
      ["Country Origin (Fiber)", data?.countryOriginFiber || ""],
      ["SMS MCQ", data?.smsMcq || ""],
      ["SMS MOQ", data?.smsMoq || ""],
      ["SMS Lead Time", data?.smsLeadTime || ""],
      ["Bulk MCQ", data?.bulkMcq || ""],
      ["Bulk MOQ", data?.bulkMoq || ""],
      ["Bulk Lead Time", data?.bulkLeadTime || ""],

      ["Price", data?.priceFob || ""],
      ["Construction", data?.construction || ""],
      ["Fiber Content", data?.fiberContent || ""],
      ["Yarn Details", data?.yarnDetails || ""],
      ["Weight (GSM)", data?.weightGSM || ""],

      ["Weft/Wales Count", data?.weftWalesCount || ""],
      ["Width Finished", data?.widthFinished || ""],

      ["Wrap/Courses Count", data?.wrapCoursesCount || ""],
      ["Dye Name", data?.dyeName || ""],
      ["Dyed Method", data?.dyedMethod || ""],
      ["Printing Method", data?.printingMethod || ""],
      ["Surface Finish", data?.surfaceFinish || ""],
      ["Other Performance Function", data?.otherPerformanceFunction || ""],
    ];

    // Add rows
    fields.forEach((row) => sheet.addRow(row));

    // Style columns
    sheet.columns = [
      { key: "field", width: 35 },
      { key: "value", width: 50 },
    ];

    // Add border to all cells
    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", wrapText: true };
      });
    });

    if (data?.fabricImage) {
      try {
        let imageId;
        const imageUrl = getImageUrlPath(data.fabricImage); // Ensure correct URL path
        const isBase64 = imageUrl.startsWith("data:image");
        const extension = isBase64
          ? imageUrl.includes("png")
            ? "png"
            : "jpeg"
          : "png"; // default for URL

        if (isBase64) {
          // Directly add Base64 image
          imageId = workbook.addImage({
            base64: imageUrl,
            extension,
          });
        } else {
          // Fetch image from URL and convert to ArrayBuffer
          const response = await fetch(imageUrl);
          const arrayBuffer = await response.arrayBuffer();
          imageId = workbook.addImage({
            buffer: arrayBuffer,
            extension,
          });
        }

        // Add image to the sheet
        sheet.addImage(imageId, {
          tl: { col: 2.8, row: 1.8 }, // Adjust image position
          ext: { width: 200, height: 120 }, // Adjust dimensions
        });
      } catch (error) {
        console.error("Failed to add fabric image:", error);
      }
    }

    // Export the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FabricDescriptionSheet.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat
            flattenedData={allData}
            singleData={id ? singleData?.data : undefined}
          />
        </PDFViewer>
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Fabric Description Sheet
          </h1>
          <button
            onClick={() => {
              onDataClick(setId);
              setReport(false);
            }}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            {/* Basic Information Card */}
            <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-slate-700 text-base">
                  Basic Information
                </h2>
                {/* <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  Required fields
                </div> */}
              </div>

              <div className="flex">
                <div className="w-28">
                  <ReusableInput
                    name="FDS Date"
                    label="FDS Date"
                    type="date"
                    value={formData.fdsDate}
                    disabled={readOnly}
                    required={true}
                    onChange={(e) =>
                      handleInputChange("fdsDate", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-48 ml-3">
                  <ReusableInput
                    name="Customer Material Code"
                    label="Customer Material Code"
                    placeholder="Enter Fabric code"
                    value={formData.materialCode}
                    required={true}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("materialCode", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-72 ml-3">
                  <ReusableInput
                    name="Fab Code"
                    label="Fab Code"
                    required={true}
                    placeholder="Enter fabric code"
                    value={formData.fabCode}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("fabCode", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="ml-3">
                  <ReusableInput
                    name="Fab Type"
                    label="Fab Type"
                    required={true}
                    placeholder="Enter fabric Type"
                    value={formData.fabType}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("fabType", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                </div>

                <div className="ml-3 w-40">
                  <label className="block text-xs font-medium text-black mb-1">
                    Country Of Origin (Fabric)
                  </label>
                  <Select
                    styles={customSelectStyles}
                    options={countryOptions}
                    value={formData.countryOriginFabric}
                    isDisabled={readOnly}
                    onChange={(option) =>
                      handleCountryChange("countryOriginFabric", option)
                    }
                    placeholder="Select Country"
                    className="text-xs h-[22px]"
                  />
                </div>

                <div className="ml-3 w-40">
                  <label className="block text-xs font-medium text-black mb-1">
                    Country Of Origin (Yarn)
                  </label>
                  <Select
                    styles={customSelectStyles}
                    options={countryOptions}
                    value={formData.countryOriginYarn}
                    isDisabled={readOnly}
                    onChange={(option) =>
                      handleCountryChange("countryOriginYarn", option)
                    }
                    placeholder="Select Country"
                    className="text-xs h-[22px]"
                  />
                </div>

                <div className="ml-3 w-40">
                  <label className="block text-xs font-medium text-black mb-1">
                    Country Of Origin (Fiber)
                  </label>
                  <Select
                    styles={customSelectStyles}
                    options={countryOptions}
                    value={formData.countryOriginFiber}
                    isDisabled={readOnly}
                    onChange={(option) =>
                      handleCountryChange("countryOriginFiber", option)
                    }
                    placeholder="Select Country"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
            {/* Capacity / Lead Times Card */}
            <div className="flex">
              <div className="border border-slate-200  p-2 pl-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-slate-700 text-base">
                    Capacity / Lead Times
                  </h2>
                  {/* <div className="text-xs text-slate-500">In days</div> */}
                </div>

                <div className="flex gap-x-6">
                  <ReusableInput
                    name="SMS MOQ"
                    label="SMS MOQ"
                    placeholder="Enter MOQ"
                    value={formData.smsMoq}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("smsMoq", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    name="SMS MCQ"
                    label="SMS MCQ"
                    placeholder="Enter MCQ"
                    value={formData.smsMcq}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("smsMcq", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />

                  <ReusableInput
                    name="SMS Lead Time"
                    label="SMS Lead Time"
                    placeholder="Enter lead time"
                    value={formData.smsLeadTime}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("smsLeadTime", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    name="BULK MOQ"
                    label="BULK MOQ"
                    placeholder="Enter MOQ"
                    value={formData.bulkMoq}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("bulkMoq", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />
                  <ReusableInput
                    name="BULK MCQ"
                    label="BULK MCQ"
                    placeholder="Enter MCQ"
                    value={formData.bulkMcq}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("bulkMcq", e.target.value)
                    }
                    className="[&>input]:py-1.5"
                  />

                  <div className="w-44">
                    <label className="block text-xs text-black mb-1">
                      BULK Lead Time
                    </label>
                    <textarea
                      label="BULK Lead Time"
                      // placeholder="Enter lead time"
                      value={formData.bulkLeadTime}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("bulkLeadTime", e.target.value)
                      }
                      className="[&>input]:py-1.5 text-[12px] p-1 border w-full border-slate-300 rounded-md"
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>

              {/* Image  */}
              <div className="border border-slate-200 w-44 p-2  ml-2  bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-xs text-slate-700">
                    Fabric Image Upload
                  </h3>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowImageTooltip(true)}
                    onMouseLeave={() => setShowImageTooltip(false)}
                  >
                    <FaQuestionCircle className="text-slate-400 text-sm cursor-help" />
                    {showImageTooltip && (
                      <div className="absolute z-10  ml-1 -top-16 -left-40 w-44 bg-slate-800 text-white text-xs rounded p-2 shadow-lg">
                        Upload high-quality fabric images (max 5MB)
                        {/* <div className="absolute -left-1 top-2 w-2.5 h-2.5 bg-slate-800 transform rotate-45"></div> */}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-2 border-dashed mt-2  border-slate-200 rounded-lg p-2 flex flex-col items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Fabric preview"
                        className="h-12 object-contain mb-2 cursor-pointer"
                        onClick={() => setShowModal(true)}
                        disabled={readOnly}
                      />
                      <button
                        onClick={() => {
                          handleRemoveImage();
                          console.log("Image removed");
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                        disabled={readOnly}
                      >
                        Remove Image
                      </button>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-slate-400 text-2xl mb-2" />
                      <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-0.5 rounded transition-colors">
                        Choose File
                        <input
                          type="file"
                          className="hidden"
                          name="fabricImage"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={readOnly}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        JPEG, PNG (max 5MB)
                      </p>
                    </>
                  )}
                </div>

                {showModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full">
                      <img
                        src={imagePreview}
                        disabled={readOnly}
                        alt="Full preview"
                        className="max-h-[80vh] max-w-[90vw] object-contain"
                      />
                      <button
                        onClick={() => setShowModal(false)}
                        className="block mt-4 mx-auto text-sm text-blue-600 hover:text-blue-800"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Construction Details & Finishing */}

            <div className="border  border-slate-200 p-2  bg-white rounded-lg shadow-sm">
              <h2 className="font-medium text-slate-700 text-base mb-4">
                Construction Details
              </h2>

              <div className="flex flex-wrap ml-3">
                <div className="w-[26rem]">
                  <ReusableInput
                    label="Construction"
                    name="construction"
                    value={formData.construction}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("construction", e.target.value)
                    }
                    placeholder="Enter construction details"
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-[26rem] ml-3">
                  <ReusableInput
                    label="Fiber Content"
                    name="fiberContent"
                    value={formData.fiberContent}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("fiberContent", e.target.value)
                    }
                    placeholder="Enter fiber content"
                    className="[&>input]:py-1.5"
                  />
                </div>

                <div className="w-[26rem] ml-3">
                  <ReusableInput
                    label="Yarn Details"
                    name="yarnDetails"
                    value={formData.yarnDetails}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("yarnDetails", e.target.value)
                    }
                    placeholder="Enter yarn details"
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="gap-x-12 flex mt-2">
                  <div className="">
                    <ReusableInput
                      label="Weight (GSM)"
                      name="weightGSM"
                      value={formData.weightGSM}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("weightGSM", e.target.value)
                      }
                      placeholder="Enter GSM"
                      type="text"
                      className="[&>input]:py-1.5"
                    />
                  </div>

                  <div className="">
                    <ReusableInput
                      label="Width"
                      name="widthFinished"
                      value={formData.widthFinished}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("widthFinished", e.target.value)
                      }
                      placeholder="Enter width"
                      className="[&>input]:py-1.5 w-1/2"
                    />
                  </div>

                  {/* <div className="">
                    <ReusableInput
                      label="Width (Cuttable)"
                      name="widthCuttale"
                      value={formData.widthCuttale}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("widthCuttale", e.target.value)
                      }
                      placeholder="Enter cuttale width"
                      className="[&>input]:py-1.5"
                    />
                  </div> */}
                  <div>
                    <ReusableInput
                      label="Weft/Wales Count"
                      name="weftWalesCount"
                      value={formData.weftWalesCount}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("weftWalesCount", e.target.value)
                      }
                      placeholder="Enter count"
                      className="[&>input]:py-1.5"
                    />
                  </div>
                  <div>
                    <ReusableInput
                      label="Warp/Count"
                      name="wrapCoursesCount"
                      value={formData.wrapCoursesCount}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("wrapCoursesCount", e.target.value)
                      }
                      placeholder="Enter count"
                      className="[&>input]:py-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Process Finishing  */}
            <div className="border border-slate-200 w-full p-2 pl-4 bg-white rounded-lg shadow-sm">
              <h2 className="font-medium text-slate-700 text-base mb-4">
                Process Finishing
              </h2>

              <div className="flex gap-x-12">
                <div className="w-52">
                  <ReusableInput
                    label="Dye Name"
                    name="dyeName"
                    value={formData.dyeName}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("dyeName", e.target.value)
                    }
                    placeholder="Enter Dye Name"
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-52">
                  <ReusableInput
                    label="Dyed Method"
                    name="dyedMethod"
                    value={formData.dyedMethod}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("dyedMethod", e.target.value)
                    }
                    placeholder="Enter Dyed Method"
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-52">
                  <ReusableInput
                    label="Printing Method"
                    name="printingMethod"
                    value={formData.printingMethod}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("printingMethod", e.target.value)
                    }
                    placeholder="Enter Printing Method"
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-52">
                  <ReusableInput
                    label="Surface Finish"
                    name="surfaceFinish"
                    value={formData.surfaceFinish}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange("surfaceFinish", e.target.value)
                    }
                    placeholder="Enter Surface Finish"
                    className="[&>input]:py-1.5"
                  />
                </div>
                <div className="w-52">
                  <ReusableInput
                    label="Other Performance Function"
                    name="otherPerformanceFunction"
                    value={formData.otherPerformanceFunction}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange(
                        "otherPerformanceFunction",
                        e.target.value
                      )
                    }
                    placeholder="Enter other functions"
                    className="[&>input]:py-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Development Details Card */}
            {/* <div className="border border-slate-200 p-4 bg-white rounded-lg shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="flex flex-col gap-4">
                    <h2 className="font-medium text-slate-700 text-base mb-4">
                      Development Details
                    </h2>

                     <ReusableInput
                      label="Sur Charges $"
                      value={formData.surCharges}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("surCharges", e.target.value)
                      }
                      className="[&>input]:py-1.5"
                      placeholder="Enter sur charges"
                    /> 

                    <ReusableInput
                      label="Price $"
                      value={formData.priceFob}
                      disabled={readOnly}
                      onChange={(e) =>
                        handleInputChange("priceFob", e.target.value)
                      }
                      className="[&>input]:py-1.5"
                      placeholder="Enter Price"
                    />
                  </div> 

               <div>
                    <div className="flex items-center  gap-2 mb-2">
                      <h3 className="font-medium text-slate-700">
                        Fabric Image Upload
                      </h3>
                      <div
                        className="relative"
                        onMouseEnter={() => setShowImageTooltip(true)}
                        onMouseLeave={() => setShowImageTooltip(false)}
                      >
                        <FaQuestionCircle className="text-slate-400 text-sm cursor-help" />
                        {showImageTooltip && (
                          <div className="absolute z-10 left-full ml-2 w-48 bg-slate-800 text-white text-xs rounded p-2 shadow-lg">
                            Upload high-quality fabric images (max 5MB)
                            <div className="absolute -left-1 top-2 w-2.5 h-2.5 bg-slate-800 transform rotate-45"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Fabric preview"
                            className="h-48 object-contain mb-2 cursor-pointer"
                            onClick={() => setShowModal(true)}
                            disabled={readOnly}
                          />
                          <button
                            onClick={() => {
                              handleRemoveImage();
                              console.log("Image removed");
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                            disabled={readOnly}
                          >
                            Remove Image
                          </button>
                        </>
                      ) : (
                        <>
                          <FaUpload className="text-slate-400 text-2xl mb-2" />
                          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded transition-colors">
                            Choose File
                            <input
                              type="file"
                              className="hidden"
                              name="fabricImage"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={readOnly}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="text-xs text-slate-500 mt-1">
                            JPEG, PNG (max 5MB)
                          </p>
                        </>
                      )}
                    </div>

                    {showModal && (
                      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded shadow-lg max-w-full max-h-full">
                          <img
                            src={imagePreview}
                            disabled={readOnly}
                            alt="Full preview"
                            className="max-h-[80vh] max-w-[90vw] object-contain"
                          />
                          <button
                            onClick={() => setShowModal(false)}
                            className="block mt-4 mx-auto text-sm text-blue-600 hover:text-blue-800"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
              </div>
            </div> */}
          </div>

          <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={saveData}
                className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
              >
                <FiSave className="w-4 h-4 mr-2" />
                {id ? "Update" : "Save"}
              </button>
              <button className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                <HiOutlineRefresh className="w-4 h-4 mr-2" />
                {id ? "Update & Next" : "Save & Next"}
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                onClick={() => setOpen(!open)}
              >
                <FiPrinter className="w-4 h-4 mr-2" />
                Download
                <FiChevronRight className="w-4 h-4 ml-2" />
              </button>
              {open && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                    onClick={() => setPrintModalOpen(true)}
                  >
                    <FiPrinter className="w-4 h-4 mr-2" />
                    Print PDF
                  </button>
                  <button
                    className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                    onClick={() => DownloadExcel(singleData)}
                  >
                    <FiPrinter className="w-4 h-4 mr-2" />
                    Download Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Manufacture;
