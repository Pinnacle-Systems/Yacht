import {
  FaQuestionCircle,
  FaUpload,
  FaWhatsapp,
  FaFileAlt,
} from "react-icons/fa";
import { HiOutlineRefresh } from "react-icons/hi";
import { FiSave, FiPrinter, FiShare2, FiChevronRight } from "react-icons/fi";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Select from "react-select";
import moment from "moment";
import { Country } from "country-state-city";
import Swal from "sweetalert2";
import { ReusableInput } from "./CommonInput";
import { ReusableDropdown } from "./CommonInput";
import CommonTable from "../common/CommonTable";
import { getCommonParams, params, renameFile } from "../../../Utils/helper";
import {
  useAddStyleSheetMutation,
  useUpdateStyleSheetMutation,
  useGetStyleSheetQuery,
  useGetStyleSheetByIdQuery,
  useDeleteStyleSheetMutation,
} from "../../../redux/services/StyleSheet";
import OrderItems from "./OrderItems";
import { Dropdown } from "react-multi-select-component";
import {
  DateInput,
  DisabledInput,
  DropdownInput,
  DropdownInputWithoutLabel,
  DropdownWithSearch,
  TextArea,
} from "../../../Inputs";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import {
  useAddOrderMutation,
  useGetOrderByIdQuery,
  useGetOrderItemsByIdQuery,
  useGetOrderQuery,
  useUpdateOrderMutation,
} from "../../../redux/uniformService/OrderService";
import { toast } from "react-toastify";
import { HiPlus } from "react-icons/hi";
import secureLocalStorage from "react-secure-storage";
import {
  useAddUnitOfMeasurementMasterMutation,
  useDeleteUnitOfMeasurementMasterMutation,
  useGetUnitOfMeasurementMasterByIdQuery,
  useGetUnitOfMeasurementMasterQuery,
  useUpdateUnitOfMeasurementMasterMutation,
} from "../../../redux/uniformService/UnitOfMeasurementServices";
import { getImageUrlPath } from "../../../Constants";
import { PrintButtonOnly } from "../../../Buttons";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "./printFormat-order";
import tw from "../../../Utils/tailwind-react-pdf";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import PDF from "./printFormat-order/PDF";

// import { color } from "html2canvas/dist/types/css/types/color";

const Manufacture = ({
  id,
  setId,
  readOnly,
  setReport,
  setSavedOrderData,
  setShowPo,
  allData,
  refetch,
}) => {
  const today = new Date();
  const [docId, setDocId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [open, setOpen] = useState(false);
  // const [readOnly, setReadOnly] = useState(false)
  const [uomId, setUomId] = useState("");
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [styleId, setStyleId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
  const [searchValue, setSearchValue] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [attachments, setAttachments] = useState([
    { date: today, filePath: "", log: "" },
  ]);

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  // const [supplierId, setSupplierId] = useState("")

  const [customerMobile, setCustomerMobile] = useState("");
  // const [supplierMobile, setSupplierMobile] = useState("")

  const [customerAddress, setCustomerAddress] = useState("");
  // const [supplierAddress, setSupplierAddress] = useState("")

  const [isPo, setIsPo] = useState(true);

  const [orderData, setOrderData] = useState([]);

  const fileInputRef = useRef(null);

  const { branchId } = getCommonParams();

  const params = {
    branchId,
  };

  const { data: styleData } = useGetStyleSheetQuery({ params });

  console.log(styleData, "styleData");

  const { data: colorData } = useGetColorMasterQuery({ params });

  const param = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  console.log(params, "params");

  const {
    data: uomData,
    isLoading,
    isFetching,
  } = useGetUnitOfMeasurementMasterQuery({ param, searchParams: searchValue });
  console.log(uomData, "uomData");
  const { data: singleuomData } = useGetUnitOfMeasurementMasterByIdQuery(
    uomId,
    { skip: !uomId }
  );

  const getNextDocId = useCallback(() => {
    if (id) return;
    if (allData?.nextDocId) {
      setDocId(allData?.nextDocId);
    }
  }, [allData, id]);

  useEffect(getNextDocId, [getNextDocId]);

  const { data: partyData } = useGetPartyQuery({ params });

  console.log("party data", partyData);

  console.log("allData", allData);

  const { data: singleStyleData } = useGetStyleSheetByIdQuery(styleId, {
    skip: !styleId,
  });

  const singleParam = {
    id: id,
    isPurchaseBool: false,
  };
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetOrderByIdQuery(id, { skip: !id });

  console.log("singleData", singleData);

  const [addData] = useAddOrderMutation();
  const [updateData] = useUpdateOrderMutation();
  const [deleteStyleSheet] = useDeleteStyleSheetMutation();

  const [orderDetails, setOrderDetails] = useState([]);

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) {
        setDocId(data?.docId);
        setDate(new Date().toISOString().split("T")[0]);
        setCustomerId(data?.customer?.id);
        // setSupplierId(data?.supplier.id)
        const mappedOrderDetails = (data?.orderBillItems || []).map((item) => ({
          fabCode: item?.fabCode || item?.styleSheet?.fabCode || "",
          styleSheetId: item?.styleSheet?.id || null,
          styleSheet: item?.styleSheet || null,
          isPurchased: item?.isPurchased ?? false,

          orderDetailsSubGrid: (item?.subGrid || []).map((sub) => ({
            fabType: sub?.fabType || "",
            fiberContent: sub?.fiberContent || "",
            weightGSM: sub?.weightGSM || "",
            widthFinished: sub?.widthFinished || "",
            priceFob: sub?.priceFob || 0,
            quantity: sub?.quantity || 0,
            surCharges: sub?.surCharges || 0,
            colorId: sub?.colorId ? String(sub.colorId) : "",
            uomId: sub?.uomId ? String(sub.uomId) : "",
          })),
        }));

        setOrderDetails(mappedOrderDetails);
      }
    },
    [id]
  );

  useEffect(() => {
    if (id && singleData?.data) {
      syncFormWithDb(singleData?.data);
      setAttachments(singleData?.data?.attachments);
      if (singleData?.data?.proformaImage) {
        const url = getImageUrlPath(singleData.data.proformaImage);
        console.log("Raw:", singleData.data.proformaImage);
        console.log("URL:", url);

        setImagePreview(url);
      } else if (
        singleData?.data?.attachments?.[0]?.filePath &&
        typeof singleData?.data?.attachments[0].filePath === "string"
      ) {
        setImagePreview(
          getImageUrlPath(singleData?.data?.attachments[0].filePath)
        );
      } else {
        setImagePreview(null);
      }
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData?.data]);

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      height: "32px",
      fontSize: "14px",
      borderColor: "#cbd5e1",
      "&:hover": {
        borderColor: "#94a3b8",
      },
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "32px",
      padding: "0 8px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "32px",
    }),
    option: (provided) => ({
      ...provided,
      fontSize: "14px",
      padding: "8px 12px",
    }),
  };
  const columns = [
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

  useEffect(() => {
    if (orderDetails?.length >= 1) return;
    setOrderDetails([
      {
        fabCode: "",
        styleSheetId: null,
        orderDetailsSubGrid: [],
      },
    ]);
  }, []);

  function addNewRow() {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setOrderDetails((prev) => [
      ...prev,

      {
        Sno: "",
        fabCode: "",
        fabType: "",
        fiberContent: "",
        weightGSM: "",
        widthFinished: "",
        priceFob: "",
        surCharges: "",
      },
    ]);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setImageFile(file);
      setImageRemoved(false);

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("Please select an image under 5MB.");
    }
  };

  const validateOrderDetails = () => {
    for (let i = 0; i < orderDetails.length; i++) {
      const row = orderDetails[i];

      if (!row.fabCode) {
        toast.error(` Please select a Fab Code`);
        return false;
      }

      if (!row.orderDetailsSubGrid || row.orderDetailsSubGrid.length === 0) {
        toast.error(` Subgrid is missing`);
        return false;
      }

      for (let j = 0; j < row.orderDetailsSubGrid.length; j++) {
        const sub = row.orderDetailsSubGrid[j];

        if (!sub.colorId) {
          toast.error(`Row ${i + 1}, Item ${j + 1}: Color is required`);
          return false;
        }
        if (!sub.uomId) {
          toast.error(`Row ${i + 1}, Item ${j + 1}: UOM is required`);
          return false;
        }
        if (!sub.quantity || sub.quantity <= 0) {
          toast.error(`Row ${i + 1}, Item ${j + 1}: Quantity is required`);
          return false;
        }
      }
    }
    return true;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitCustom = async (callback, data, text, po) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === "attachments") {
          formData.append(
            key,
            JSON.stringify(
              data[key].map((i) => ({
                ...i,
                filePath:
                  i.filePath instanceof File ? i.filePath.name : i.filePath,
              }))
            )
          );
          data[key].forEach((option) => {
            console.log("iprion", option);
            console.log(
              option?.filePath instanceof File,
              "option?.filePath instanceof File"
            );

            if (option?.filePath instanceof File) {
              formData.append("proformaImage", option.filePath);

              data.file = option?.filePath;
              console.log(data.file, "data.file");
            }
          });
        } else if (key === "orderDetails") {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, data[key]);
        }
      }
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData });
      } else {
        returnData = await callback(data);
      }

      if (po) {
        const dataToSend = returnData?.data?.data;

        setId(dataToSend?.id);

        setTimeout(() => {
          setShowPo(true);
        }, 100);
      } else {
        setId("");
        setReport(false);
      }

      refetch();
      setImageRemoved(false);

      Swal.fire({
        icon: "success",
        title: `${text || "saved"}   Successfully`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };
  function onDataClick(id) {
    setId(id);
    // setMode(type)
  }
  useEffect(() => {
    if (attachments?.length >= 1) return;

    setAttachments((prev) => [
      ...(prev || []),
      { date: today, filePath: "", log: "" },
    ]);
  }, [attachments]);

  function handleInputChange(value, index, field) {
    console.log(value, "value", index, "index", field, "field");

    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);

    if (field === "filePath") {
      if (value instanceof File) {
        setImagePreview(URL.createObjectURL(value));
      } else if (typeof value === "string") {
        setImagePreview(getImageUrlPath(value));
        console.log(value, "valuefrom");
      } else if (!value) {
        setImagePreview(null);
      }
    }
  }

  const data = {
    branchId,
    docId,
    date,
    id,
    // partyId: partyId ? Number(partyId) : null,
    customerId,
    // supplierId,
    contactMobile,
    address,
    orderDetails,
    attachments,
  };
  const resetForm = () => {
    setDocId("");
    setDate(moment.utc(today).format("YYYY-MM-DD"));
    setCustomerId("");
    // setSupplierId("");
    setCustomerMobile("");
    // setSupplierMobile("");
    setCustomerAddress("");
    // setSupplierAddress("");
    setStyleId("");
    setPartyId("");
    setContactMobile("");
    setAddress("");
    setOrderDetails([
      {
        fabCode: "",
        orderDetailsSubGrid: [],
      },
    ]);
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(false);
  };

  const saveData = (po) => {
    if (!validateOrderDetails()) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", po);
    } else {
      handleSubmitCustom(addData, data, "Added", po);
      if (!po) resetForm();
    }
  };

  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.isoCode,
      ...country,
    }));
  }, []);
  // console.log(styleData, "styleData")

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
  const handlePartyChange = (selectedId, field) => {
    const selectedParty = partyData?.data?.find(
      (p) => p.id === Number(selectedId)
    );

    // if (!selectedParty) {
    //   setPartyId("");
    //   setContactMobile("");
    //   setAddress("");
    //   setCustomerName("");
    //   return;
    // }

    // setPartyId(selectedParty.id);

    // setAddress(selectedParty.address || "");
    // setCustomerName(selectedParty.name || "");
    // console.log(selectedParty.address);
    if (field === "customer") {
      setCustomerId(selectedParty?.id);
      setCustomerAddress(selectedParty?.address);
      setCustomerMobile(selectedParty?.mobileNumber || "");
    }
    // if (field === "supplier") {
    //   setSupplierId(selectedParty.id)
    //   setSupplierAddress(selectedParty.address)
    //   setSupplierMobile(selectedParty.mobileNumber || "");

    // }
  };
  useEffect(() => {
    if (customerId) {
      handlePartyChange(customerId, "customer");
    }

    // if (supplierId) {
    //   handlePartyChange(supplierId, "supplier")
    // }
  }, [customerId, setCustomerId]);

  
  const DownloadOrderExcel = async (singleData) => {
    const data = singleData?.data;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Order");

    // ---- Title ----
    const titleRow = sheet.addRow(["ORDERSHEET"]);
    titleRow.font = { size: 20, bold: true, color: { argb: "FF000000" } };
    titleRow.alignment = { horizontal: "center", vertical: "middle" };
    sheet.mergeCells("A1:K1");
    titleRow.height = 30;
    sheet.addRow([]);

    // ---- Non-grid details ----
    const orderDate = new Date().toISOString().split("T")[0];
    const customer = data?.customer || {};
    const nonGridRows = [
      ["Order No", data?.docId || ""],
      ["Date", orderDate],
      ["Customer Name", customer?.name || ""],
      ["Customer Address", customer?.address || ""],
      ["Customer Phone", customer?.mobileNumber || ""],
    ];
    nonGridRows.forEach((row) => sheet.addRow(row));
    sheet.addRow([]);

    // ---- Grid headers ----
    const gridHeaders = [
      "Fabric Code",
      "Fabric Type",
      "Fiber Content",
      "Weight GSM",
      "Width",
      "Color",
      "Price",
      "Sur Charges",
      "Unit",
      "Quantity",
      "Fabric Cost",
    ];
      const borderStyle = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    const headerRow = sheet.addRow(gridHeaders);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
      headerRow.eachCell((cell) => {
      cell.border = borderStyle;
    });


    // ---- Set column widths ----
    const columnWidths = [40, 25, 55, 15, 10, 25, 15, 10, 10, 20, 25];
    columnWidths.forEach((w, i) => {
      sheet.getColumn(i + 1).width = w;
    });

    // ---- Process each order grid ----
    (data?.orderBillItems || []).forEach((item) => {
      if (item?.subGrid?.length) {
        let gridTotal = 0;
        const startRow = sheet.rowCount + 1;

        item.subGrid.forEach((sub) => {
          const price = sub?.priceFob || 0;
          const surCharges = sub?.surCharges || 0;
          const quantity = sub?.quantity || 0;
          const totalCost = (price + surCharges) * quantity;
          gridTotal += totalCost;

          const row = sheet.addRow([
            item?.fabCode || item?.styleSheet?.fabCode || "",
            sub?.fabType || "",
            sub?.fiberContent || "",
            sub?.weightGSM || "",
            sub?.widthFinished || "",
            sub?.color?.name || "",
            `$ ${price.toFixed(2)}`,
            `$ ${surCharges.toFixed(2)}`,
            sub?.UnitOfMeasurement?.name || "",
            `${quantity.toFixed(3)}`,
            `$ ${totalCost.toFixed(2)}`,
          ]);
          row.getCell(7).alignment = { horizontal: "right" };
          row.getCell(8).alignment = { horizontal: "right" };
          row.getCell(9).alignment = { horizontal: "center" };
          row.getCell(10).alignment = { horizontal: "right" };
          row.getCell(11).alignment = { horizontal: "right" };
          row.eachCell((cell) => {
            cell.border = borderStyle;
          });
        });

        // ---- Merge fabric code vertically ----
        const endRow = sheet.rowCount;
        if (item.subGrid.length > 1) {
          sheet.mergeCells(`A${startRow}:A${endRow}`);
          const mergedCell = sheet.getCell(`A${startRow}`);
          mergedCell.value = item?.fabCode || item?.styleSheet?.fabCode || "";
          mergedCell.alignment = { vertical: "middle", horizontal: "center" };
           mergedCell.border = borderStyle;
        }

        // ---- Add grand total row ----
        const totalRow = sheet.addRow([
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Grand Total",
          `$ ${gridTotal.toFixed(2)}`,
        ]);
        totalRow.font = { bold: true };
        totalRow.alignment = { horizontal: "right" };
           totalRow.eachCell((cell) => {
          cell.border = borderStyle;
        });
        sheet.addRow([]);
      }
    });

    // ---- Browser download ----
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "OrderSheet.xlsx";
    link.click();
  };

  return (
    <>
      {/* perfroma invoice print  */}
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat
            singleData={id ? singleData?.data : "null"}
            docId={docId ? docId : ""}
            orderDetails={orderDetails}
            styleData={styleData?.data}
          />
        </PDFViewer>
      </Modal>

      {/* pdf print  */}
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PDF singleData={ singleData?.data} />
        </PDFViewer>
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Order Information
          </h1>
          <button
            onClick={() => {
              setReport(false);
              setId("");
            }}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* Basic Information Card */}
              <div className="md:col-span-1 border border-slate-200  p-2 pl-3 bg-white rounded-md shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium text-slate-700 text-base">
                    Order Details
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="w-32">
                    <ReusableInput
                      name="doc Id"
                      value={docId}
                      required={true}
                      disabled={true}
                      label="Order No"
                    />
                  </div>
                  <div className="w-28">
                    <ReusableInput
                      value={date}
                      type="date"
                      required={true}
                      disabled={true}
                      label="Date"
                    />
                  </div>
                </div>
              </div>
              {/* customer details */}
              <div className="md:col-span-2 border border-slate-200 p-2 pl-3  bg-white rounded-md shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-medium text-slate-700 text-base">
                    Customer Details
                  </h2>
                </div>

                <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
                  <ReusableDropdown
                    label="Name"
                    options={partyData?.data?.filter(
                      (cl) => cl.isClient === true
                    )}
                    value={customerId}
                    setValue={setCustomerId}
                    disabled={readOnly}
                    nameField={"name"}
                    className="[&>input]:py-1.5 w-[285px]"
                  />

                  <div className="w-28">
                    <ReusableInput
                      type="number"
                      label="Mobile"
                      value={customerMobile}
                    />
                  </div>

                  <div className="w-[400px]">
                    <label className="block text-xs text-black mb-1" htmlFor="">
                      Address
                      <textarea
                        className="w-full h-[40px] text-xs border p-1 border-gray-300 rounded-lg
                                          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                                          transition-all duration-150 shadow-sm "
                        name=""
                        id=""
                        value={customerAddress}
                        spellCheck={false}
                      ></textarea>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 p-2  bg-white rounded-md shadow-sm max overflow-auto md:col-span-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-medium text-slate-700">List Of Items</h2>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => {
                      addNewRow();
                    }}
                    disabled={readOnly}
                    className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                  >
                    <HiPlus className="w-3 h-3 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[300px]">
                <table className="w-full border-collapse table-fixed">
                  <thead className="bg-gray-200 text-gray-800">
                    <tr>
                      <th className="w-12 px-4 py-2 text-center font-medium text-[12px]">
                        S.No
                      </th>
                      <th className="w-12 px-4 py-2 text-center font-medium text-[12px]">
                        Fabrictype
                      </th>
                      <th className="w-44 px-4 py-2 text-center font-medium text-[12px]">
                        Fiber Content
                      </th>
                      <th className="w-16 px-4 py-2 text-center font-medium text-[12px]">
                        GSM
                      </th>
                      <th className="w-6 px-3 py-2 text-center font-medium text-[12px]">
                        Width
                      </th>
                      <th className="w-20 px-3 py-2 text-center font-medium text-[12px]">
                        Color
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        Price
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        Surcharges
                      </th>

                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        Unit
                      </th>
                      <th className="w-12 px-3 py-2 text-center font-medium text-[12px]">
                        Quantity
                      </th>
                      <th className="w-16 px-3 py-2 text-center font-medium text-[12px]">
                        Fabric Cost
                      </th>
                      <th className="w-8 px-3 py-2 text-left font-medium text-[11px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails?.map((item, index) => {
                      return (
                        <OrderItems
                          key={index}
                          index={index}
                          item={item}
                          orderDetails={orderDetails}
                          setOrderDetails={setOrderDetails}
                          styleId={styleId}
                          setStyleId={setStyleId}
                          styleData={styleData?.data || []}
                          colorData={colorData?.data}
                          singleData={singleData}
                          singleStyleData={singleStyleData}
                          id={id}
                          readOnly={readOnly}
                          uomData={uomData}
                          singleuomData={singleuomData}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => saveData()}
                  className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {id ? "Update" : "Save"}
                </button>
                {/* <button className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm">
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Save & Next
                </button> */}
                {id ? (
                  ""
                ) : (
                  <button
                    onClick={() => saveData(isPo)}
                    className="bg-indigo-600 text-white px-4 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
                  >
                    <HiOutlineRefresh className="w-4 h-4 mr-2" />
                    {"Save & Create PO"}
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  {id ? (
                    <button
                      onClick={id ? () => setPrintModalOpen(true) : null}
                      className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                    >
                      <FiPrinter className="w-4 h-4 mr-2" />
                      Proforma InVoice
                    </button>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {id ? (
                    <button
                      onClick={id ? () => setPrintModalOpen(true) : null}
                      className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                    >
                      <FiPrinter className="w-4 h-4 mr-2" />
                      InVoice
                    </button>
                  ) : (
                    ""
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  
                  {id ? (
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
                            onClick={() => setPdfOpen(true)}
                          >
                            <FiPrinter className="w-4 h-4 mr-2" />
                            Print PDF
                          </button>
                          <button
                            className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                            onClick={() => DownloadOrderExcel(singleData)}
                          >
                            <FiPrinter className="w-4 h-4 mr-2" />
                            Download Excel
                          </button>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Manufacture;
