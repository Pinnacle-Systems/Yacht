import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useAddPoMutation,
  useDeletePoMutation,
  useUpdatePoMutation,
  useGetPoQuery,
  useGetPoByIdQuery,
} from "../../../redux/uniformService/PoServices";
import {
  useGetPartyQuery,
  useGetPartyByIdQuery,
} from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import {
  DisabledInput,
  DropdownInput,
  DateInput,
  ReusableLabeledInput,
  TextArea,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { poTypes } from "../../../Utils/DropdownData";
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import moment from "moment";
import PrintFormat from "./PrintFormat-PO/index";
import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useReactToPrint } from "@etsoo/reactprint";
import PrintFormatGreyYarnPurchaseOrder from "../PrintFormat-PurchaseOrder";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import { deliveryTypes } from "../../../Utils/DropdownData";

import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  renameFile,
} from "../../../Utils/helper";
import Consolidation from "./Cosolidation";
import { ReusableDropdown, ReusableInput } from "../NewOrder/CommonInput";

import EntryForm from "./EntryForm";
import {
  useGetFilterOrderByIdQuery,
  useGetOrderByIdQuery,
  useGetOrderQuery,
  useLazyGetFilterOrderByIdQuery,
} from "../../../redux/uniformService/OrderService";
import Grid from "./Grid";
import {
  useGetStyleSheetByIdQuery,
  useGetStyleSheetQuery,
} from "../../../redux/services/StyleSheet";
import { FiChevronRight, FiPrinter, FiSave, FiShare2 } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import {
  FaFileAlt,
  FaPlus,
  FaQuestionCircle,
  FaUpload,
  FaWhatsapp,
} from "react-icons/fa";
import CommonTable from "../common/CommonTable";
import POFormComments from "./POFormComments";
import Swal from "sweetalert2";

import { SavedSearch } from "@mui/icons-material";
import { getImageUrlPath } from "../../../Constants";
import { singleQuote } from "pdf-lib";
import "./PartyInfo";
import PartyInfo from "./PartyInfo";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import PDF from "./PrintFormat-PO/PDF";
import ArtDesignReport from "../ArtDesign/ArtDesignReport";

const MODEL = "PURCHASE ORDER";

export default function PoForm({ orderId, showPo }) {
  const today = new Date();
  const componentRef = useRef();

  const [summary, setSummary] = useState(false);

  const [poItems, setPoItems] = useState([]);
  const [docId, setDocId] = useState("");
  // const [podocId, setPodocId] = useState("")
  const [id, setId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [poReport, setPoReport] = useState(false);
  const [transType, setTransType] = useState("DyedFabric");
  const [customerId, setCustomerId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [open, setOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [supplierMobile, setSupplierMobile] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [orderDetails, setOrderDetails] = useState([]);

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const [singleOrderID, setSingleOrderID] = useState("");

  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [deliveryType, setDeliveryType] = useState("");
  const [deliveryToId, setDeliveryToId] = useState("");
  const [modalType, setModalType] = useState(null);
  const [ordId, setOrdId] = useState("");
  const [showImageTooltip, setShowImageTooltip] = useState(false);
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [shipName, setShipName] = useState("");
  const [shipMobile, setShipMobile] = useState("");
  const [shipAddress, setShipAddress] = useState("");
  const [customerPoNumber, setCustomerPoNumber] = useState("");
  const [revisedDate, setRevisedDate] = useState(null);
  const [quantityAllowance, setQuantityAllowance] =
    useState("0 to +5 % Maximum");
  const [shippingMark, setShippingMark] = useState("As per Mill Shipping Mark");
  const [paymentTerms, setPaymentTerms] = useState("BEFORE TELEX");
  const [shipmentMode, setShipmentMode] = useState("TBC");
  const [shipDate, setShipdate] = useState(null);
  const [deliveryTerm, setDeliveryTerm] = useState("");
  const [portOrigin, setPortOrigin] = useState("");
  const [finalDestination, setFinalDestination] = useState("BEFORE TELEX");
  const [readOnly, setReadOnly] = useState(false);
  const [isOrderChange, setIsOrderChange] = useState(false);
  const [attachments, setAttachments] = useState([
    { date: today, filePath: "", log: "" },
  ]);
  const [orderDocId, setOrderDocId] = useState("");
  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams();

  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId,
    companyId,
    finYearId,
    value: true,
  };

  const params_ignore_filter = {
    branchId,
    companyId,
    finYearId,
  };

  const { data: partydata } = useGetPartyQuery({ params });

  const singleParam = {
    id: orderId,
    isPurchaseBool: true,
  };
  const { data: allOrderdata } = useGetOrderQuery({ params_ignore_filter });

  const { data: orderData, refetch: orderRefetch } = useGetOrderQuery({
    params,
  });

  const { data: singleOrderDataFromProps } = useGetOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  // const { data : singleOrderData} = useGetFilterOrderByIdQuery(singleOrderID, { skip: !singleOrderID})
  const [trigger, { data: singleOrderData }] = useLazyGetFilterOrderByIdQuery();

  console.log(singleOrderID, singleOrderData, "singleOrderId ,singleOrderData");

  // const { data: singleOrderData, refetch: singleOrderDataRefetch } = useGetOrderByIdQuery(singleOrderID, { skip: !singleOrderID });

  const { data: styledata } = useGetStyleSheetQuery({ params });

  const { data: poData } = useGetPoQuery({ params });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPoByIdQuery(id, { skip: !id });

  const syncPoWithDb = useCallback((data) => {
    if (!data || !data.data) return;

    const savedData = data.data;

    setDocId(savedData?.docId);
    // setSingleOrderID(savedData?.orderId)

    setCustomerId(savedData?.customerId);
    setCustomerAddress(savedData?.customer?.address);
    setCustomerName(savedData?.customer?.name);
    setCustomerMobile(savedData?.customer?.mobileNumber);
    // setOrderDetails(savedData?.poGrid);
    const formattedPoGrid = savedData?.poGrid?.map((item) => ({
      gridId: item?.id,
      fabCode: item?.styleSheet?.fabCode || "",
      styleSheetId: item?.styleSheet?.id || null,
      ...item,
      poSubGrid: (item?.poSubGrid || []).map((sub) => ({
        ...sub,
        subgridId: sub?.subgridId,
        colorId: sub?.color?.id || "",
        colorName: sub?.color?.name || "",
        uomId: sub?.UnitOfMeasurement?.id || "",
        uomName: sub?.UnitOfMeasurement?.name || "",
      })),
    }));
    setOrderDetails(formattedPoGrid);

    setSupplierId(savedData?.supplierId);
    setSupplierName(savedData?.supplier?.name);
    setSupplierMobile(savedData?.supplier?.mobileNumber);
    setSupplierAddress(savedData?.supplier?.address);

    setDate(
      savedData?.date
        ? new Date(savedData.date).toISOString().split("T")[0]
        : ""
    );
    setShipName(savedData?.shipName);
    setShipMobile(savedData?.shipMobile);
    setShipAddress(savedData?.shipAddress);
    setRevisedDate(
      savedData?.revisedDate
        ? new Date(savedData.revisedDate).toISOString().split("T")[0]
        : ""
    );
    setQuantityAllowance(savedData?.quantityAllowance);
    setShippingMark(savedData?.shippingMark);
    setPaymentTerms(savedData?.paymentTerms);
    setShipmentMode(savedData?.shipmentMode);
    // setShipdate(
    //   savedData?.shipDate?.trim()
    //     ? new Date(savedData.shipDate).toISOString().split("T")[0]
    //     : ""
    // );
    setShipdate(
      savedData?.shipDate
        ? new Date(savedData?.shipDate).toISOString().split("T")[0]
        : ""
    );

    setDeliveryTerm(savedData?.deliveryTerm);
    setPortOrigin(savedData?.portOrigin);
    setFinalDestination(savedData?.finalDestination);
  }, []);

  const syncOrderWithDb = useCallback((data) => {
    if (!data || !data.data) return;
    const savedData = data.data;

    setSingleOrderID(savedData?.id);

    setCustomerId(savedData?.customerId);
    setCustomerAddress(savedData?.customer?.address);
    setCustomerName(savedData?.customer?.name);
    setCustomerMobile(savedData?.customer?.mobileNumber);
    const formattedOrderDetails = savedData?.orderBillItems?.map((item) => ({
      id: item?.id,
      gridId: item?.id,

      orderId: item?.orderId,
      fabCode: item?.styleSheet?.fabCode || "",
      styleSheetId: item?.styleSheet?.id || null,
      // isPurchased: item?.isPurchased ?? false,
      orderDetailsSubGrid: (item?.subGrid || [])?.map((sub) => ({
        ...sub,
        subgridId: sub?.id,
        colorId: sub.color?.id || "",
        colorName: sub.color?.name || "",
        uomId: sub.UnitOfMeasurement?.id || "",
        uomName: sub.UnitOfMeasurement?.name || "",
      })),
    }));

    setOrderDetails(formattedOrderDetails);
    console.log(formattedOrderDetails, "formattedOrderDetails");
  }, []);

  useEffect(() => {
    if (id && singleData) {
      // syncFormWithDb(singleData);
      console.log(singleData, "singleData");

      syncPoWithDb(singleData);
      const formattedAttachments = (singleData?.data?.attachments || []).map(
        (item) => ({
          id: item?.id,
          url: getImageUrlPath(item?.filePath), // generate URL for preview
          type: item?.filePath?.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
          name: item?.filePath, 
          filePath: item?.filePath, 
          log: item?.log || item?.comments || "", 
          comments: item?.comments || item?.log || "",
          date: item?.date ? new Date(item?.date) : undefined,
        })
      );

      setAttachments(formattedAttachments);
    }
  }, [isSingleFetching, isSingleLoading, id, syncPoWithDb, singleData]);

  const columns = [
    {
      header: "S.No",
      accessor: (_item, index) => index + 1,
      cellClass: () => "",
      className: "font-medium text-gray-900 w-[60px]  text-center",
    },
    {
      header: "Po No",
      accessor: (item) => item.docId,
      // cellClass: () => '',
      className: "text-gray-800 text-center uppercase w-28",
    },
    {
      header: "Order No",
      accessor: (item) =>
        findFromList(item.orderId, allOrderdata?.data, "docId"),
      className: "text-gray-800 text-center uppercase w-28",
    },
    {
      header: "Date",
      accessor: (item) => new Date(item.date).toISOString().split("T")[0],
      className: "text-gray-800 text-center uppercase w-20",
    },
    {
      header: "Supplier",
      accessor: (item) =>
        findFromList(item.supplierId, partydata?.data, "name"),
      // cellClass: () => 'text-center'
      className: "text-gray-800 text-center uppercase w-60",
    },
    {
      header: "Delivery Date",
      // accessor: (item) => new Date(item.shipDate).toISOString().split("T")[0],
      accessor: (item) =>
        item.shipDate
          ? new Date(item.shipDate).toISOString().split("T")[0]
          : "—",
      // cellClass: () => 'text-center'
      className: "text-gray-800 text-center uppercase w-28",
    },
    {
      header: "",
      accessor: (_) => "",
      // cellClass: () => 'font-medium text-gray-900',
      className: "text-gray-800 uppercase w-[25%]",
    },
  ];

  useEffect(() => {
    if (orderId) {
      setSingleOrderID(orderId);

      setPoReport(true);
      console.log("First Effect");
      console.log("Set ID from props:", orderId);
    }
  }, [orderId]);

  useEffect(() => {
    if (singleOrderDataFromProps?.data) {
      console.log("Calling non-filtered API from props");
      syncOrderWithDb(singleOrderDataFromProps);
    }
  }, [singleOrderDataFromProps]);

  useEffect(() => {
    if (!singleOrderID) return;
    if (singleOrderID && singleOrderData?.data) {
      if (singleOrderData?.data?.isPurchased) {
        return;
      }
      console.log("Second Effect");
      syncOrderWithDb(singleOrderData);
    }
  }, [singleOrderData, singleOrderID]);

  const [addData] = useAddPoMutation();
  const [updateData] = useUpdatePoMutation();
  const [removeData] = useDeletePoMutation();

  useEffect(() => {
    if (attachments?.length >= 1) return;

    setAttachments((prev) => [
      ...(prev || []),
      { date: today, filePath: "", log: "" },
    ]);
  }, [attachments]);

  const handleChange = (setter) => (e) => {
    const value = e.target.value;
    setter(value === "" ? null : value);
  };
  const handlePartyChange = (selectedId, field) => {
    const selectedParty = partydata?.data?.find(
      (p) => p.id === Number(selectedId)
    );

    if (field === "supplier") {
      setSupplierId(selectedParty.id);
      setSupplierAddress(selectedParty.address);
      setSupplierMobile(selectedParty.mobileNumber);
    }
  };
  useEffect(() => {
    if (supplierId) {
      handlePartyChange(supplierId, "supplier");
    }
  }, [supplierId, setSupplierId]);

  function handleInputChange(value, index, field) {
    console.log(value, "value", index, "index", field, "field");

    const newBlend = structuredClone(attachments);
    newBlend[index][field] = value;
    setAttachments(newBlend);

    if (field === "filePath") {
      if (value instanceof File) {
        // setImagePreview(URL.createObjectURL(value));
        setImagePreview({
          url: URL.createObjectURL(value),
          type: value.type, // key addition
          name: value.name,
        });
        setImageRemoved(false);
      } else if (typeof value === "string") {
        // setImagePreview(getImageUrlPath(value));
        setImagePreview({
          url: getImageUrlPath(value),
          type: value.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
          name: value,
        });
        setImageRemoved(false);
        console.log(value, "valuefrom");
      } else if (!value) {
        setImagePreview(null);
        setImageRemoved(true);
      }
    }
  }

  const data = {
    branchId,
    customerId,
    id,
    shipName,
    shipAddress,
    shipMobile,
    supplierId,

    orderId: singleOrderID,
    docId,
    customerPoNumber,
    date,
    revisedDate,
    quantityAllowance,
    shippingMark,
    paymentTerms,
    shipmentMode,
    shipDate,
    deliveryTerm,
    portOrigin,
    finalDestination,
    orderDetails,
    attachments,
  };

  const getNextDocId = useCallback(() => {
    if (id) return;
    if (!id && poData?.nextDocId) {
      setDocId(poData?.nextDocId);
    }
  }, [poData, id]);

  useEffect(getNextDocId, [getNextDocId]);

  const handleSubmitCustom = async (callback, data, text) => {
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
            if (option?.filePath instanceof File) {
              formData.append("file", option.filePath);
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }

      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
        if (returnData?.statusCode === 0) {
          orderRefetch();
        }
      }

      // if (returnData.statusCode === 1) {
      //   console.log(returnData.message);

      //   return;
      // }

      setId("");
      setSingleOrderID("");
      setPoReport(false);

      Swal.fire({
        icon: "success",
        title: `${text || "Updated"} Successfully`,

        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.log("handle");
      console.log("erroe", error);

      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  const validateForm = () => {
    // if (!singleOrderID) {
    //   toast.error("Please select an order before saving.");
    //   return false;
    // }
    if (!supplierId) {
      toast.error("Please select a supplier name.");
      return false;
    }
    if (!supplierMobile || supplierMobile.trim() === "") {
      toast.error("Supplier mobile number is required.");
      return false;
    }
    if (!supplierAddress || supplierAddress.trim() === "") {
      toast.error("Supplier address is required.");
      return false;
    }

    return true;
  };

  const saveData = () => {
    if (!validateForm()) return;
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
    resetForm();
  };

  const resetForm = () => {
    setId("");

    setPoReport(true);
    setCustomerId("");
    setCustomerName("");
    setCustomerMobile("");
    setCustomerAddress("");
    setSupplierId("");
    setSupplierMobile("");
    setSupplierAddress("");
    setShipName("");
    setShipMobile("");
    setShipAddress("");
    setCustomerPoNumber("");
    setRevisedDate("");
    // setQuantityAllowance("");
    setQuantityAllowance("0 to +5 % Maximum");

    setShippingMark("As per Mill Shipping Mark");
    setPaymentTerms("BEFORE TELEX");
    setShipmentMode("TBC");
    setShipdate("");
    setDeliveryTerm("");
    setPortOrigin("");
    setFinalDestination("India");
    setOrderDetails([]);
    setAttachments([{ date: today, filePath: "", log: "" }]);
    setImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id);
        setId("");
        orderRefetch();

        Swal.fire({
          icon: "success",
          title: `${"Deleted"} Successfully`,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
      }
    }
  };

  function onDataClick(id) {
    setId(id);
    setPoReport(true);
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
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    console.log(imageFile, "Imagefile");
  };
  useEffect(() => {
    if (!id) {
      // Reset to today's date for new form
      setDate(moment.utc().format("YYYY-MM-DD"));
    }
  }, [id]);

  const OnNew = () => {
    setSingleOrderID("");
    setId("");

    setPoReport(false);
    setOrderDetails([]);

    // setSupplierName("")
  };

  const DownloadOrderExcel = async (singleData) => {
    const data = singleData?.data;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Purchase Order");

    // ---- Title ----
    const titleRow = sheet.addRow(["PURCHASE ORDER"]);
    titleRow.font = { size: 20, bold: true, color: { argb: "FF000000" } };
    titleRow.alignment = { horizontal: "center", vertical: "middle" };
    sheet.mergeCells("A1:K1");
    titleRow.height = 30;
    sheet.addRow([]);

    // ---- Non-grid details ----
    const orderDate = new Date().toISOString().split("T")[0];
    const customer = data?.customer || {};
    const supplier = data?.supplier || {};
    // Add section titles with merged cells
    const addSectionTitle = (title) => {
      const titleRow = sheet.addRow([title]);
      sheet.mergeCells(`A${titleRow.number}:B${titleRow.number}`);
      titleRow.font = { bold: true, size: 12 };
      titleRow.alignment = { vertical: "middle", horizontal: "center" };
      return titleRow;
    };

    // Add PO and Order Details (before customer details)
    sheet.addRow(["Po No", data?.docId || ""]);
    sheet.addRow(["Date", orderDate]);
    sheet.addRow([
      "Order No",
      findFromList(data?.orderId, allOrderdata?.data, "docId") || "",
    ]);
    sheet.addRow(["Revised On", data?.revisedDate || ""]);
    sheet.addRow(["Quantity Allowance", data?.quantityAllowance || ""]);
    sheet.addRow(["Shipping Mark", data?.shippingMark || ""]);
    sheet.addRow(["Payment Terms", data?.paymentTerms || ""]);
    sheet.addRow(["Mode of Shipment", data?.shipmentMode || ""]);

    // Customer Details
    addSectionTitle("Customer Details");
    sheet.addRow(["Customer Name", customer?.name || ""]);
    sheet.addRow(["Customer Address", customer?.address || ""]);
    sheet.addRow(["Customer Phone", customer?.mobileNumber || ""]);

    // Supplier Details
    addSectionTitle("Supplier Details");
    sheet.addRow(["Supplier Name", supplier?.name || ""]);
    sheet.addRow(["Supplier Address", supplier?.address || ""]);
    sheet.addRow(["Supplier Phone", supplier?.mobileNumber || ""]);

    // Shipping Details
    addSectionTitle("Shipping Details");

    sheet.addRow(["Delivery Date", data?.shipDate || ""]);
    sheet.addRow(["Delivery Term", data?.deliveryTerm || ""]);
    sheet.addRow(["Port of Origin", data?.portOrigin || ""]);
    sheet.addRow(["Final Destination", data?.finalDestination || ""]);

    // Ship to Address
    addSectionTitle("Ship to Address");
    sheet.addRow(["Name", data?.shipName || ""]);
    sheet.addRow(["Mobile", data?.shipMobile || ""]);
    sheet.addRow(["Address", data?.shipAddress || ""]);

    sheet.addRow([]); // Add empty row at end

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
    (data?.poGrid || []).forEach((item) => {
      if (item?.poSubGrid?.length) {
        let gridTotal = 0;
        const startRow = sheet.rowCount + 1;

        item.poSubGrid.forEach((sub) => {
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
        if (item.poSubGrid.length > 1) {
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
    link.download = "PurchaseOrder.xlsx";
    link.click();
  };

  return (
    <>
      {poReport ? (
        <>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            widthClass={"w-[50%] h-[50%]"}
          >
            <PartyInfo
              type={modalType}
              customerName={customerName}
              customerMobile={customerMobile}
              customerAddress={customerAddress}
              supplierName={supplierName}
              supplierAddress={supplierAddress}
              supplierMobile={supplierMobile}
            />
          </Modal>
          <Modal
            isOpen={pdfOpen}
            onClose={() => setPdfOpen(false)}
            widthClass={"w-[90%] h-[90%]"}
          >
            <PDFViewer style={tw("w-full h-full")}>
              <PDF
                singleData={singleData?.data}
                allOrderdata={allOrderdata?.data}
              />
            </PDFViewer>
          </Modal>

          <Modal
            isOpen={formReport}
            onClose={() => setFormReport(false)}
            widthClass={"px-2 h-[90%] w-[70%]"}
          >
            <ArtDesignReport
              setFormReport={setFormReport}
              tableWidth="100%"
              formReport={formReport}
              setAttachments={setAttachments}
              attachments={attachments}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
            />
          </Modal>

          <div className="w-full  mx-auto rounded-md px-2 py-1 overflow-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Purchase Order
              </h1>
              <button
                onClick={OnNew}
                className="text-indigo-600 hover:text-indigo-700"
                title="Open Report"
              >
                <FaFileAlt className="w-5 h-5" />
              </button>
            </div>
            {/* Order Details */}
            <div className="flex mt-2  gap-2">
              <div className="w-[67%] border border-slate-200 p-2 pl-4 bg-white rounded-md shadow-sm">
                <h2 className="text-base font-medium text-slate-700 mb-2">
                  Basic Details
                </h2>
                <div className="flex flex-wrap gap-2">
                  <div className="w-36">
                    <ReusableInput
                      label="Purchase Order Number"
                      value={docId}
                      placeholder="PO No."
                      className="[&>input]:py-1.5"
                    />
                  </div>
                  <div className="w-28 ml-9">
                    <ReusableInput
                      label="Date"
                      type="date"
                      placeholder="Select date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="[&>input]:py-1.5"
                    />
                  </div>
                  <div className="w-36 ml-9">
                    <label className="block text-xs text-black mb-1">
                      List of orders
                    </label>
                    {id ? (
                      <ReusableInput
                        value={findFromList(
                          singleData?.data?.orderId,
                          allOrderdata?.data,
                          "docId"
                        )}
                      />
                    ) : (
                      <select
                        className="w-full px-2 h-[22px] text-[12px] border border-slate-300 rounded-md 
                    focus:border-indigo-300 focus:outline-none transition-all duration-200
                     hover:border-slate-400"
                        value={singleOrderID}
                        onChange={(e) => {
                          setSingleOrderID(e.target.value);

                          if (e.target.value) trigger(e.target.value);
                        }}
                        disabled={readOnly}
                      >
                        <option value="">Select order</option>

                        {console.log(orderData?.data, "dropdown")}

                        {orderData?.data?.map((doc) => (
                          <option value={doc?.id} key={doc.id}>
                            {doc.docId}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="w-28 ml-9">
                    <ReusableInput
                      label="Revised On"
                      type="date"
                      disabled={readOnly}
                      placeholder="Enter revised date"
                      value={revisedDate}
                      onChange={handleChange(setRevisedDate)}
                      className="[&>input]:py-1.5"
                    />
                  </div>
                  <div className="w-36 ml-9">
                    <ReusableInput
                      label="Quantity Allowance"
                      disabled={readOnly}
                      placeholder="Enter quantity allowed"
                      value={quantityAllowance}
                      onChange={handleChange(setQuantityAllowance)}
                      className="[&>input]:py-1.5"
                    />
                  </div>

                  <div className="w-[230px]">
                    <label className="block text-xs text-black mb-1" htmlFor="">
                      Shipping Mark
                    </label>
                    <input
                      type="text"
                      className="w-full h-[30px] text-xs border p-1 border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm "
                      value={shippingMark}
                      disabled={readOnly}
                      onChange={handleChange(setShippingMark)}
                      spellCheck={false}
                      name=""
                      id=""
                    />
                  </div>
                  <div className="w-[230px] ml-6">
                    <label className="block text-xs text-black mb-1" htmlFor="">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      className="w-full h-[30px] text-xs border p-1 border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm "
                      value={paymentTerms}
                      disabled={readOnly}
                      onChange={handleChange(setPaymentTerms)}
                      spellCheck={false}
                      name=""
                      id=""
                    />
                  </div>
                  <div className="w-[230px] ml-6">
                    <label className="block text-xs text-black mb-1" htmlFor="">
                      Mode of shipment
                    </label>
                    <textarea
                      type="text"
                      className="w-full h-[30px] text-xs border p-1 border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm "
                      value={shipmentMode}
                      disabled={readOnly}
                      onChange={handleChange(setShipmentMode)}
                      spellCheck={false}
                      name=""
                      id=""
                    ></textarea>
                  </div>
                </div>
              </div>

              {/*  Customer / Supplier Details*/}
              <div className="w-[33%] border-slate-200 p-2 bg-white rounded-md shadow-sm">
                <h2 className="text-base font-medium text-slate-700 mb-2">
                  Customer / Supplier Details
                </h2>

                <div className="flex mt-6">
                  <label className="block text-xs text-black mb-1">
                    Customer Name <span className="text-xs">:</span>
                  </label>

                  <div className="w-[282px] ml-3 -mt-1">
                    <ReusableInput type="name" value={customerName} />
                  </div>
                  <button
                    className="text-blue-600 -mt-3 ml-2   rounded"
                    onClick={() => {
                      setModalType("customer");
                      setModalOpen(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex mt-3">
                  <label className="block text-xs text-black ">
                    Supplier Name <span className="text-xs  ml-2">:</span>
                  </label>

                  <div className="ml-3 -mt-1">
                    <ReusableDropdown
                      options={partydata?.data?.filter(
                        (cl) => cl.isSupplier === true
                      )}
                      value={supplierId}
                      setValue={(val) => {
                        setSupplierId(val);
                      }}
                      disabled={readOnly}
                      nameField={"name"}
                      className="[&>input]:py-1.5"
                    />
                  </div>
                  {console.log(supplierId, "val")}
                  <button
                    className="text-blue-600 -mt-3 ml-2   rounded"
                    onClick={() => {
                      setModalType("supplier");
                      setModalOpen(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* image */}
              {/* <div
                className={`border w-[10%] border-slate-200 md:col-span-1 bg-white rounded-md shadow-sm ${
                  !id ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                <div className=" rounded-md p-3 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-small text-black text-xs">
                      Proforma Invoice
                    </h4>
                    <div
                      className="relative"
                      onMouseEnter={() => setShowImageTooltip(true)}
                      onMouseLeave={() => setShowImageTooltip(false)}
                    >
                      <FaQuestionCircle className="text-slate-400 text-xs cursor-help" />
                      {showImageTooltip && (
                        <div className="absolute z-10 right-0 top-full mt-1 w-40 bg-slate-800 text-white text-xs rounded p-2 shadow-lg">
                          Upload Proforma Invoice (max 5MB)
                          <div className="absolute -top-1 right-2 w-2.5 h-2.5 bg-slate-800 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`border border-dashed border-slate-300 rounded-md p-2 flex flex-col items-center mt-2 ${
                      !id ? "pointer-events-none" : ""
                    }`}
                  >
                    {imagePreview ? (
                      <>
                      
                        {imagePreview?.type?.includes("pdf") ? (
                          <a
                            href={imagePreview?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            PDF
                          </a>
                        ) : (
                          <img
                            src={imagePreview?.url}
                            alt="Invoice Preview"
                            className="w-20 h-14 object-cover rounded cursor-pointer"
                            onClick={() => setShowModal(true)}
                            disabled={readOnly}
                          />
                        )}

                        <button
                          onClick={() => {
                            handleRemoveImage();
                            console.log("Image removed");
                          }}
                          className="text-[10px] text-red-600 hover:text-red-800 mt-1"
                          disabled={readOnly}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <FaUpload className="text-slate-400 text-lg mb-1" />
                        <label
                          className={`cursor-pointer bg-indigo-500 text-white px-3 py-0.5 rounded-md hover:bg-indigo-600 flex items-center text-[10px] ${
                            !id
                              ? "cursor-not-allowed bg-gray-300 hover:bg-gray-300"
                              : ""
                          }`}
                        >
                          Choose
                          <input
                            type="file"
                            className="hidden"
                            name="proformaImage"
                            accept="application/pdf,image/*"
                            // onChange={handleImageUpload}
                            onChange={(e) =>
                              e.target.files[0]
                                ? handleInputChange(
                                    renameFile(e.target.files[0]),
                                    0,
                                    "filePath"
                                  )
                                : () => {}
                            }
                            disabled={readOnly}
                            ref={fileInputRef}
                          />
                        </label>
                      </>
                    )}
                  </div>

                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                      <div className="bg-white p-3 rounded shadow-lg max-w-full">
                        <img
                          src={imagePreview?.url}
                          disabled={readOnly}
                          alt="Full preview"
                          className="max-w-[80vw] max-h-[80vh] object-contain"
                        />
                        <button
                          onClick={() => setShowModal(false)}
                          className="block mt-3 mx-auto text-xs text-blue-600 hover:text-blue-800"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div> */}
            </div>

            {/* table  */}

            <div className="border border-slate-200 p-2  bg-white rounded-md shadow-sm max overflow-auto mt-2">
              <h2 className="font-medium text-slate-700">List Of Items</h2>
              <div className="overflow-x-auto mt-2 max-h-72 ">
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
                      <th className="w-8 px-3 py-2 text-center font-medium text-[12px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderDetails?.map((value, index) => {
                      return (
                        <Grid
                          id={id}
                          value={value}
                          readOnly={readOnly}
                          index={index}
                          orderDetails={orderDetails}
                          setOrderDetails={setOrderDetails}
                          styledata={styledata?.data}
                          isOrderChange={isOrderChange}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shipping Details */}

            <div className="flex">
              <div className="w-[55%] mt-2 border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                <h2 className="text-base font-medium text-slate-700 mb-2">
                  Shipping Details
                </h2>
                <div className="flex flex-wrap gap-2">
                  <div className="w-28">
                    <ReusableInput
                      label="Delivery Date"
                      type="date"
                      placeholder="Select date"
                      value={shipDate || ""}
                      disabled={readOnly}
                      onChange={handleChange(setShipdate)}
                      className="[&>input]:py-1.5"
                    />
                  </div>
                  <div className="ml-2 w-[140px]">
                    {/* <ReusableInput
                    label="Delivery Term"
                    value={deliveryTerm}
                    disabled={readOnly}
                    onChange={handleChange(setDeliveryTerm)}
                    placeholder="Enter delivery term"
                    className="[&>input]:py-1.5"
                  /> */}
                    <label
                      className="block text-xs text-black mb-1"
                      htmlFor="deliveryTerm"
                    >
                      Delivery Term
                    </label>
                    <select
                      id="deliveryTerm"
                      value={deliveryTerm}
                      disabled={readOnly}
                      onChange={handleChange(setDeliveryTerm)}
                      className="w-full text-xs  border border-gray-300 rounded-lg
    focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
    transition-all duration-150 shadow-sm h-6"
                    >
                      <option value="">Select delivery term</option>
                      <option value="FOB Shangai">FOB Shangai</option>
                      <option value="FOB shangshi">FOB shangshi</option>
                      <option value="CIF chennai">CIF chennai</option>
                    </select>
                  </div>

                  <div className="w-[140px] ml-2">
                    {/* <label className="block text-xs text-black mb-1" htmlFor="">
                    Port of Origin
                  </label>
                  <textarea
                    className="w-full h-[40px] text-xs border p-1 border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm "
                    value={portOrigin}
                    disabled={readOnly}
                    onChange={handleChange(setPortOrigin)}
                    name=""
                    id=""
                  ></textarea> */}
                    <label
                      className="block text-xs text-black mb-1"
                      htmlFor="portOrigin"
                    >
                      Port of Origin
                    </label>
                    <select
                      id="portOrigin"
                      value={portOrigin}
                      disabled={readOnly}
                      onChange={handleChange(setPortOrigin)}
                      className="w-full text-xs border  border-gray-300 rounded-lg
  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
  transition-all duration-150 shadow-sm h-6 "
                    >
                      <option value="">Select Port</option>
                      <option value="Shanghai, China">Shanghai, China</option>
                      <option value="Shangshi, China">Shangshi, China</option>
                    </select>
                  </div>
                  <div className="w-[250px] ml-2">
                    <label className="block text-xs text-black mb-1" htmlFor="">
                      Final Destination
                    </label>
                    <textarea
                      className="w-full h-[26px] text-xs border p-1 border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm "
                      spellCheck={false}
                      disabled={readOnly}
                      value={finalDestination}
                      onChange={handleChange(setFinalDestination)}
                      name=""
                      id=""
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="border w-[45%] mt-2 ml-2 border-slate-200 p-2 bg-white rounded-md shadow-sm">
                <div className="  mb-2">
                  <h2 className="font-medium text-slate-700 text-base">
                    Ship to Address
                  </h2>

                  <div className="flex gap-x-3 mt-1">
                    <div className=" w-[245px]">
                      <ReusableInput
                        type="name"
                        label="Name"
                        disabled={readOnly}
                        value={shipName}
                        onChange={handleChange(setShipName)}
                      />
                    </div>

                    <div className="ml-30">
                      <ReusableInput
                        type="number"
                        label="Mobile"
                        disabled={readOnly}
                        value={shipMobile}
                        onChange={handleChange(setShipMobile)}
                      />
                    </div>
                    <div className=" w-72 sm:col-span-3">
                      <label
                        className="block text-xs text-black mb-1"
                        htmlFor=""
                      >
                        Address
                      </label>
                      <textarea
                        className="w-full h-[40px] text-xs border p-1 border-gray-300 rounded-lg
          focus:outline-none  shadow-sm "
                        value={shipAddress}
                        onChange={handleChange(setShipAddress)}
                        disabled={readOnly}
                        name=""
                        id=""
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <POFormComments /> */}
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
                <div className="flex gap-2 flex-wrap">
                  {id ? (
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                        onClick={() => setFormReport(true)}
                      >
                        Attachements
                      </button>
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
        </>
      ) : (
        <div className="p-2 bg-[#F1F1F0] min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between bg-white py-0.5 px-1 items-start sm:items-center mb-3 gap-4 rounded-tl-lg rounded-tr-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
              <select
                // value={selectedPeriod}
                // onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-0.5 border rounded-md text-sm"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
              </select>
              <select
                // value={selectedFinYear}
                // onChange={(e) => setSelectedFinYear(e.target.value)}
                className="px-3 py-0.5 border rounded-md text-sm"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
              <select
                // value={selectedStatus}
                // onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-0.5 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
              </select>
            </div>
            <button
              className="hover:bg-green-700 bg-white border border-green-700 hover:text-white text-green-800 px-4 py-0.5 rounded-md flex items-center gap-2 text-sm"
              onClick={() => {
                resetForm();
                setPoReport(true);
                setReadOnly(false);
                setId("");
                setSingleOrderID("");
              }}
            >
              <FaPlus /> Create New
            </button>
          </div>

          <CommonTable
            columns={columns}
            data={poData?.data}
            onDataClick={onDataClick}
            readOnly={readOnly}
            setReadOnly={setReadOnly}
            setPoReport={setPoReport}
            handleDelete={handleDelete}
            itemsPerPage={10}
          />
        </div>
      )}
    </>
  );
}
