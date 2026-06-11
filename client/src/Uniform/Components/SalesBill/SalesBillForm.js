import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  CommaInput,
  DateInput,
  DropdownInput,
  DropdownNew,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { ReusableInput } from "../../../Utils/CommonInput";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import tw from "../../../Utils/tailwind-react-pdf";
// import PDF from "./PrintFormat/PDF";
import { useDispatch } from "react-redux";
import { Loader } from "../../../Basic/components";
import {
  useAddSalesBillMutation,
  useGetSalesBillByIdQuery,
  useSendSalesBillMsgMutation,
  useUpdateSalesBillMutation,
} from "../../../redux/services/SalesBillService";
import SalesBillItems from "./SalesBillItems";
import SalesBillSummary from "./SalesBillSummary";
import CustomerSearchComponent from "./CustomerSearchComponent";
import { useGetCustomerByIdQuery } from "../../../redux/services/CustomerMasterService";
import purchaseBillApi from "../../../redux/services/PurchaseBillService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";
import OpeningStockSRApi from "../../../redux/uniformService/OpeningStockSRServices";
import PDF from "./PrintFormat/PDF";
import { groupBy } from "lodash";
import PosReceipt from "./PrintFormat/PosReceipt";
import { useReactToPrint } from "@etsoo/reactprint";
import EditIcon from "@mui/icons-material/Edit";
import { adjTypeData } from "../../../Utils/DropdownData";
import { Button } from "@mui/material";
import { useGetReferenceMasterByIdQuery } from "../../../redux/uniformService/ReferenceMasterService";
import { UserPermissions } from "../../../Utils/UserPermissions";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import { useSalesBillRefetch } from "../../../CustomHooks/SalesBill";

export function SalesBillForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  sizeList,
  styleItemList,
  colorList,
  uomList,
  taxTypeList,
  styleList,
  singleDataBranch,
  isHo,
  branchList,
  salesPersonList,
  referenceList,
}) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [transDate, setTransDate] = useState("");
  const [salesBillItems, setSalesBillItems] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentValue, setPaymentValue] = useState("");
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [summary, setSummary] = useState(false);
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [remarks, setRemarks] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState();
  const [isCash, setIsCash] = useState(true);
  const [isCard, setIsCard] = useState(false);
  const [isUpI, setIsUpI] = useState(false);
  const [cardAmount, setCardAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [deliveryToId, setDeliveryToId] = useState("");
  const [roundOffType, setRoundOffType] = useState("PLUS");
  const [roundOffValue, setRoundOffValue] = useState("");
  const [roundOffOpen, setRoundOffOpen] = useState("");
  const [savedData, setSavedData] = useState("");
  const [salesPersonId, setSalesPersonId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [sendSalesBillSMS] = useSendSalesBillMsgMutation();
  const [smsSending, setSmsSending] = useState(false);

  useSalesBillRefetch();
  const receiptRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });
  const dispatch = useDispatch();
  const customerNameRef = useRef(null);
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesBillByIdQuery(id, { skip: !id });

  const {
    data: singleCustomerData,
    isFetching: isSingleCustomerFetching,
    isLoading: isSingleCustomerLoading,
  } = useGetCustomerByIdQuery(customerId, { skip: !customerId });

  const { data: referenceData } = useGetReferenceMasterByIdQuery(referenceId);
  const { data: userData } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });
  const isLoadingIndicator = isSingleFetching || isSingleLoading;
  const { hasPermission } = UserPermissions();
  const isUserAdmin = userData?.data.isAdmin;

  const findDuplicateGoodss = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = row?.barcodeId;

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          barcodeId: row.barcodeId,
          barcodeNo: row.barcodeNo,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  // const validateData = (data) => {
  //   if (!isHo) {
  //     if (
  //       !data?.docDate ||
  //       !data?.customerId ||
  //       !data?.customerName ||
  //       !data?.taxTemplateId ||
  //       !data?.salesPersonId
  //     ) {
  //       toast.info("Please fill all required fields...!", {
  //         position: "top-center",
  //         autoClose: 2000,
  //       });
  //       return false;
  //     }
  //   } else {
  //     if (!data?.docDate || !data?.deliveryToId || !data?.taxTemplateId) {
  //       toast.info("Please fill all required fields...!", {
  //         position: "top-center",
  //         autoClose: 2000,
  //       });
  //       return false;
  //     }
  //   }

  //   // 2️⃣ At least one item required
  //   if (!data?.salesBillItems || data.salesBillItems.length === 0) {
  //     toast.info("Please add at least one item...!", {
  //       position: "top-center",
  //     });
  //     return false;
  //   }

  //   const filledGoodsItems = data.salesBillItems.filter(
  //     (item) => item?.styleItemId,
  //   );
  //   if (
  //     !isGridDatasValid(filledGoodsItems, false, [
  //       "qty",
  //       "rate",
  //       "barcodeId",
  //       "sizeId",
  //       "styleId",
  //     ])
  //   ) {
  //     toast.info("Please fill all required items details...!", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     });
  //     return false;
  //   }

  //   // 4️⃣ Duplicate check
  //   // 4️⃣ Duplicate check
  //   const duplicatesGoods = findDuplicateGoodss(filledGoodsItems);
  //   if (duplicatesGoods.length > 0) {
  //     const dup = duplicatesGoods[0];
  //     Swal.fire({
  //       icon: "warning",
  //       title: "Duplicate Item Found",
  //       html: `
  //              Barcode - ${dup?.barcodeNo},
  //              Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
  //            `,
  //     });
  //     return false;
  //   }
  //   if (!isHo) {
  //     if (paidAmount > totalAmount) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Payment Error",
  //         text: "Paid amount cannot be greater than Total amount",
  //       });
  //       return false; // stop further execution
  //     }
  //     if (paidAmount < totalAmount) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Payment Error",
  //         text: "Paid amount cannot be Less than Total amount",
  //       });
  //       return false; // stop further execution
  //     }
  //   }

  //   return true;
  // };

  const validateData = (data) => {
    const requiredFields = [];

    if (!isHo) {
      if (!data?.docDate) {
        requiredFields.push("Bill Date");
      }
      if (!data?.taxTemplateId) {
        requiredFields.push("Tax Template");
      }
      if (!data?.salesPersonId) {
        requiredFields.push("Sales Person");
      }
      if (!data?.customerId) {
        requiredFields.push("Customer No");
      }

      if (!data?.customerName) {
        requiredFields.push("Customer Name");
      }

      if (!isCash && !isCard && !isUpI) {
        requiredFields.push("Any One Payment Mode (Cash / Card / UPI)");
      }
    } else {
      if (!data?.docDate) {
        requiredFields.push("Bill Date");
      }

      if (!data?.deliveryToId) {
        requiredFields.push("Delivery To");
      }

      if (!data?.taxTemplateId) {
        requiredFields.push("Tax Template");
      }
    }

    if (requiredFields.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields Missing",
        html: `
        <div style="text-align:left">
          ${requiredFields.map((field) => `• ${field}`).join("<br/>")}
        </div>
      `,
        confirmButtonColor: "#3085d6",
      });

      return false;
    }

    // 2️⃣ At least one item required
    if (!data?.salesBillItems || data.salesBillItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Items Missing",
        text: "Please add at least one item",
      });

      return false;
    }

    const filledGoodsItems = data.salesBillItems.filter(
      (item) => item?.styleItemId,
    );

    if (
      !isGridDatasValid(filledGoodsItems, false, [
        "qty",
        "rate",
        "barcodeId",
        "sizeId",
        "styleId",
      ])
    ) {
      Swal.fire({
        icon: "warning",
        title: "Item Details Missing",
        text: "Please fill all required item details",
      });

      return false;
    }

    // Duplicate check
    const duplicatesGoods = findDuplicateGoodss(filledGoodsItems);

    if (duplicatesGoods.length > 0) {
      const dup = duplicatesGoods[0];

      Swal.fire({
        icon: "warning",
        title: "Duplicate Item Found",
        html: `
        Barcode - ${dup?.barcodeNo}<br/>
        Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
      `,
      });

      return false;
    }

    if (!isHo) {
      if (paidAmount > totalAmount) {
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: "Paid amount cannot be greater than Total amount",
        });

        return false;
      }

      if (paidAmount < totalAmount) {
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: "Paid amount cannot be Less than Total amount",
        });

        return false;
      }
    }

    return true;
  };

  const data = {
    id,
    docDate,
    transDate,
    branchId,
    salesBillItems: salesBillItems?.filter((item) => item?.styleItemId),
    userId,
    finYearId,
    customerId,
    customerName,
    paymentType,
    termsAndCondition,
    discountType,
    discountValue,
    paymentValue,
    taxTemplateId,
    remarks,
    isCash,
    isCard,
    isUpI,
    cardAmount,
    upiAmount,
    deliveryToId,
    roundOffType,
    roundOffValue,
    salesPersonId,
    referenceId,
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setTransDate(
        id && (data?.transDate === "" || data?.transDate === null)
          ? ""
          : data?.transDate
            ? moment.utc(data.transDate).format("YYYY-MM-DD")
            : moment.utc(today).format("YYYY-MM-DD"),
      );
      setSalesBillItems(data?.salesBillItems ? data.salesBillItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setCustomerId(data?.customerId ? data?.customerId : "");
      setCustomerName(data?.customerName ? data?.customerName : "");
      setPaymentType(data?.paymentType ? data?.paymentType : "");
      setTermsAndCondition(
        data?.termsAndCondition ? data.termsAndCondition : "",
      );
      setRemarks(data?.remarks ? data.remarks : "");
      setDiscountType(data?.discountType || "Flat");
      setDiscountValue(data?.discountValue || "0");
      setPaymentType(data?.paymentValue ? data?.paymentValue : "");
      setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
      setPaymentValue(data?.paymentValue ? data?.paymentValue : "");
      setPaymentType(data?.paymentType ? data?.paymentType : "");
      setIsCash(data?.isCash || true);
      setIsCard(data?.isCard || false);
      setIsUpI(data?.isUpI || false);
      setCardAmount(data?.cardAmount || "");
      setUpiAmount(data?.upiAmount || "");
      setDeliveryToId(data?.deliveryToId ? data?.deliveryToId : "");
      setRoundOffType(data?.roundOffType ? data?.roundOffType : "PLUS");
      setRoundOffValue(data?.roundOffValue ? data?.roundOffValue : "");
      setSalesPersonId(data?.salesPersonId ? data?.salesPersonId : "");
      setReferenceId(data?.referenceId ? data?.referenceId : "");
    },
    [id],
  );

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const [addData] = useAddSalesBillMutation();
  const [updateData] = useUpdateSalesBillMutation();

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 0) {
        setSavedData(returnData?.data);
        setTimeout(() => {
          if (nextProcess == "new") {
            if (!isHo) {
              handlePrint();
            }
            setId(0);
            setDocId("New");
            syncFormWithDb(undefined);
          } else {
            if (!isHo) {
              handlePrint();
            }
            onClose();
          }
        }, 100);
        Swal.fire({
          title: text + "  " + "Successfully",
          icon: "success",
          draggable: true,
          timer: 1000,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        dispatch(purchaseBillApi.util.invalidateTags(["PurchaseBill"]));
        dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
        dispatch(OpeningStockSRApi.util.invalidateTags(["OpeningStockSR"]));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: returnData?.message,
        });
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        { ...data, draftSave: true },
        "Added",
        nextProcess,
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess,
      );
    } else if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };
  const calculateTaxableAmt = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discountValue = parseFloat(item.discountValue) || 0;
    const discountType = item.discountType || "";
    const taxPercent = item.taxPercent || 0;
    // Gross amount
    const grossAmount = qty * rate;
    let discountAmount = 0;
    if (discountType) {
      if (discountType === "Flat") {
        discountAmount = discountValue;
      } else {
        discountAmount = (grossAmount * discountValue) / 100;
      }
    }
    const netAmount = grossAmount - discountAmount;
    const taxable = netAmount / (1 + taxPercent / 100);
    return taxable;
  };

  const grossAmount = salesBillItems.reduce(
    (sum, row) => sum + (calculateTaxableAmt(row) || 0),
    0,
  );
  const taxGroupWise = groupBy(salesBillItems, "taxPercent");

  const taxRows = Object.entries(taxGroupWise)
    .filter(([taxPercent]) => Number(taxPercent) > 0)
    .map(([taxPercent, items]) => {
      const taxable = items.reduce(
        (sum, item) => sum + (calculateTaxableAmt(item) || 0),
        0,
      );

      const taxRate = Number(taxPercent);
      const halfTax = taxRate / 2;

      return {
        taxPercent: taxRate,
        halfTax,
        sgstAmount: (taxable * halfTax) / 100,
        cgstAmount: (taxable * halfTax) / 100,
      };
    });

  const netAmount = salesBillItems.reduce(
    (sum, row) => sum + (Number(row.netAmount) || 0),
    0,
  );
  const totalAmount =
    netAmount +
    (roundOffType === "PLUS"
      ? Number(roundOffValue || 0)
      : -Number(roundOffValue || 0));
  const paidAmount =
    Number(paymentValue || 0) +
    Number(cardAmount || 0) +
    Number(upiAmount || 0);

  const defaultId = taxTypeList?.data?.find((item) => item.name === "DEFAULT");

  useEffect(() => {
    if (!taxTemplateId && taxTypeList?.data?.length > 0) {
      setTaxTemplateId(defaultId?.id ?? 0);
    }
  }, [taxTypeList, taxTemplateId]);

  useEffect(() => {
    if (!customerId) return;

    if (id) return;

    if (singleCustomerData?.data?.name) {
      setCustomerName(singleCustomerData?.data?.name);
    } else {
      setCustomerName(singleCustomerData?.data?.name);
    }
  }, [customerId, singleCustomerData]);

  const handlePrintClick = () => {
    if (isHo) {
      setPdfOpen(true);
    } else {
      handlePrint();
    }
  };

  const handleSendWhatsApp = async () => {
    if (!id) {
      toast.info("Please save the bill first!", { position: "top-center" });
      return;
    }

    const mobileNo = singleCustomerData?.data?.mobileNo;
    if (!mobileNo) {
      toast.info("Customer mobile number not found!", {
        position: "top-center",
      });
      return;
    }

    setSmsSending(true);
    try {
      const result = await sendSalesBillSMS({
        messageData: {
          customerName,
          docId,
          docDate,
          totalAmount,
          paymentType: isCash ? "Cash" : isCard ? "Card" : "UPI",
          branchName: singleDataBranch?.data?.branchName,
          branchPhone: singleDataBranch?.data?.company?.contactMobile,
          items: salesBillItems?.filter((i) => i?.styleItemId),
          mobileNo,
        },
      }).unwrap();

      if (result.success === true) {
        toast.success("SMS sent successfully to customer!", {
          position: "top-center",
        });
      } else {
        toast.error(result.message || "Failed to send SMS");
      }
    } catch (error) {
      toast.error("Failed to send SMS");
    } finally {
      setSmsSending(false);
    }
  };

  return (
    <>
      {isLoadingIndicator ? (
        <Loader />
      ) : (
        <div className="" onKeyDown={handleKeyDown}>
          <Modal
            isOpen={summary}
            onClose={() => setSummary(false)}
            widthClass={"p-10"}
          >
            <SalesBillSummary
              remarks={remarks}
              setRemarks={setRemarks}
              discountType={discountType}
              setDiscountType={setDiscountType}
              discountValue={discountValue}
              setDiscountValue={setDiscountValue}
              salesBillItems={salesBillItems}
              taxTypeId={taxTemplateId}
              readOnly={readOnly}
              isCard={isCard}
              setIsCard={setIsCard}
              setIsCash={setIsCash}
              setIsUpI={setIsUpI}
              setPaymentValue={setPaymentValue}
              setCardAmount={setCardAmount}
              setUpiAmount={setUpiAmount}
              isCash={isCash}
              isUpI={isUpI}
              cardAmount={cardAmount}
              upiAmount={upiAmount}
              paymentValue={paymentValue}
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
                styleList={styleList}
                styleItemList={styleItemList}
                colorList={colorList}
                sizeList={sizeList}
                uomList={uomList}
                singleDataBranch={singleDataBranch}
                grossAmount={grossAmount}
                netAmount={totalAmount}
                roundOff={roundOffValue}
                taxRows={taxRows}
                salesBillItems={salesBillItems}
                roundOffType={roundOffType}
              />
            </PDFViewer>
          </Modal>
          <Modal
            isOpen={roundOffOpen}
            onClose={() => setRoundOffOpen(false)}
            widthClass={"w-[16%] h-[36%]"}
          >
            <h1 className="text-center font-medium text-lg mb-2">Round Off</h1>
            <div className="flex flex-col gap-1.5">
              <DropdownNew
                name="Type"
                dataList={adjTypeData}
                value={roundOffType}
                setValue={(value) => {
                  setRoundOffType(value);
                }}
                placeholder={"Select Type"}
                otherValue={"show"}
                otherField={"show"}
                autoFocus={true}
              />
              <ReusableInput
                label="Value"
                value={roundOffValue}
                setValue={setRoundOffValue}
                type={"number"}
              />
              <div className="flex justify-end mt-2">
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => setRoundOffOpen(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setRoundOffOpen(false);
                    }
                  }}
                >
                  Ok
                </Button>
              </div>
            </div>
          </Modal>
          <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-xl font-bold text-gray-800">Sales Bill</h1>
              <button
                onClick={onClose}
                className="text-indigo-600 hover:text-indigo-700"
                title="Open Report"
              >
                <FaFileAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-1.5 mt-1.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Basic Details
                </h2>
                <div className="grid grid-cols-5 gap-1">
                  <ReusableInput label="Sales Bill No" readOnly value={docId} />
                  <ReusableInput
                    label="Transaction Date"
                    value={transDate}
                    type={"date"}
                    readOnly={true}
                    disabled
                  />
                  <DateInput
                    name="Sales Bill Date"
                    value={docDate}
                    setValue={setDocDate}
                    required={true}
                    readOnly={readOnly}
                  />
                  <DropdownInput
                    name="Tax Type"
                    options={dropDownListObject(
                      taxTypeList ? taxTypeList?.data : [],
                      "name",
                      "id",
                    )}
                    value={taxTemplateId}
                    setValue={setTaxTemplateId}
                    required={true}
                    readOnly={readOnly || id}
                    // autoFocus={true}
                  />
                  {!isHo && (
                    <DropdownInput
                      name="Sales Person"
                      options={dropDownListObject(
                        salesPersonList ? salesPersonList?.data : [],
                        "firstName",
                        "id",
                      )}
                      value={salesPersonId}
                      setValue={setSalesPersonId}
                      required={true}
                      readOnly={readOnly}
                      autoFocus={!isHo ? true : false}
                    />
                  )}
                </div>
              </div>
              {!isHo && (
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                  <h2 className="font-medium text-slate-700 mb-2">
                    Customer Details
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    <CustomerSearchComponent
                      setCustomerId={setCustomerId}
                      customerId={customerId}
                      name="Contact No"
                      readOnly={readOnly}
                      id={id}
                      // autoFocus={id ? false : true}
                      focusNext={() => customerNameRef.current?.focus()}
                    />
                    <ReusableInput
                      ref={customerNameRef}
                      label="Customer Name"
                      value={customerName}
                      setValue={setCustomerName}
                      type={"text"}
                      readOnly={readOnly}
                      required={true}
                    />
                    {!isHo && (
                      <DropdownNew
                        name="Reference"
                        dataList={referenceList?.data}
                        value={referenceId}
                        setValue={(value) => setReferenceId(value)}
                        disabled={readOnly}
                        placeholder={"Select Reference"}
                        clear={true}
                      />
                    )}
                  </div>
                </div>
              )}
              {isHo && (
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                  <h2 className="font-medium text-slate-700 mb-2">
                    Delivery To
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                    <DropdownNew
                      name="Showroom / Franchisee"
                      dataList={branchList?.data?.filter(
                        (item) => item.id !== branchId,
                      )}
                      value={deliveryToId}
                      setValue={(value) => {
                        setDeliveryToId(value);
                      }}
                      required={true}
                      disabled={readOnly || id}
                      otherField={"branchName"}
                      placeholder={"Select Showroom"}
                      autoFocus={isHo ? true : false}
                    />
                  </div>
                </div>
              )}
            </div>
            <fieldset className="w-full  min-w-[1200px]">
              <SalesBillItems
                salesBillItems={salesBillItems}
                setSalesBillItems={setSalesBillItems}
                readOnly={readOnly}
                branchId={branchId}
                sizeList={sizeList}
                styleItemList={styleItemList}
                colorList={colorList}
                uomList={uomList}
                taxTemplateId={taxTemplateId}
                styleList={styleList}
                referenceId={referenceId}
                referenceData={referenceData}
                isHo={isHo}
                isUserAdmin={isUserAdmin}
              />
            </fieldset>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white border border-slate-200 rounded-md p-2 shadow-sm">
                <fieldset className="w-full text-slate-700 border h-full p-1 px-2 border-slate-400 rounded-md">
                  <legend className="font-medium px-2">Remarks</legend>

                  <textarea
                    readOnly={readOnly}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full h-32  text-xs   resize-none focus:outline-none"
                    placeholder="Additional remarks..."
                    disabled={readOnly}
                  />
                </fieldset>
              </div>

              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                {!isHo && (
                  <fieldset className="w-full text-slate-700 border h-full p-2 border-slate-400 rounded-md">
                    <legend className="font-medium">Payment Details</legend>
                    <div className="gap-3 items-center text-xs">
                      <div className="flex gap-10 items-center">
                        <div className="flex gap-2 items-center">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              className="h-4 w-4 align-middle"
                              checked={isCash}
                              disabled={readOnly}
                              onChange={(e) => setIsCash(e.target.checked)}
                            />
                            Cash
                          </label>
                          <CommaInput
                            value={paymentValue}
                            setValue={setPaymentValue}
                            comma={true}
                            disabled={readOnly || !isCash}
                            width={28}
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              className="h-4 w-4 align-middle"
                              checked={isCard}
                              disabled={readOnly}
                              onChange={(e) => setIsCard(e.target.checked)}
                            />
                            Card
                          </label>
                          <CommaInput
                            value={cardAmount}
                            setValue={setCardAmount}
                            comma={true}
                            disabled={readOnly || !isCard}
                            width={28}
                          />
                        </div>
                      </div>
                      <div className="items-center text-xs">
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={isUpI}
                              className="h-4 w-4 align-middle"
                              disabled={readOnly}
                              onChange={(e) => setIsUpI(e.target.checked)}
                            />
                            UPI
                          </label>
                          <CommaInput
                            value={upiAmount}
                            setValue={setUpiAmount}
                            comma={true}
                            disabled={readOnly || !isUpI}
                            width={28}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t pt-2 text-indigo-600">
                      <span>Total Paid Amount </span>
                      <span>
                        {Number(paidAmount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </fieldset>
                )}
              </div>

              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                <fieldset className="w-full text-slate-700 border h-full px-2 pt-1 border-slate-400 rounded-md">
                  <legend className="font-medium px-2">Summary</legend>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* LEFT SIDE — TAX DETAILS */}
                    <div className="space-y-2 border-r pr-4">
                      {taxRows.length === 0 && (
                        <div className="text-slate-400">No Tax</div>
                      )}

                      {taxRows.map((tax, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <span>SGST @{tax.halfTax}%</span>
                            <span>{tax.sgstAmount.toFixed(2)}</span>
                          </div>

                          <div className="flex justify-between">
                            <span>CGST @{tax.halfTax}%</span>
                            <span>{tax.cgstAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT SIDE — AMOUNT SUMMARY */}
                    <div className="space-y-2 pl-4">
                      {/* Gross */}
                      <div className="flex justify-between">
                        <span>Gross</span>
                        <span>{grossAmount.toFixed(2)}</span>
                      </div>

                      {/* Net */}
                      <div className="flex justify-between">
                        <span>Net</span>
                        <span>{netAmount.toFixed(2)}</span>
                      </div>

                      {/* Roundoff */}
                      <div className="flex justify-between items-center">
                        <div
                          className="flex gap-1.5 items-center cursor-pointer "
                          onClick={() => setRoundOffOpen(true)}
                        >
                          <span>Roundoff</span>
                          <EditIcon
                            sx={{ fontSize: 16 }}
                            className="text-slate-500 "
                          />
                        </div>
                        <span>
                          {roundOffType === "PLUS" ? "+" : "-"}{" "}
                          {Number(roundOffValue || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="flex justify-between font-bold text-base border-t pt-2 text-indigo-600">
                        <span>Total</span>
                        <span>
                          {Number(totalAmount || 0).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 justify-between">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => saveData("new")}
                  disabled={readOnly}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Save & New
                </button>
                <button
                  onClick={() => saveData("close")}
                  disabled={readOnly}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Save & Close
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {readOnly && (
                  <button
                    className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                    onClick={() => {
                      if (
                        !hasPermission(() => {
                          setReadOnly(false);
                        }, "edit")
                      )
                        return;
                    }}
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                {/* Replace your existing WhatsApp button */}
                <button
                  className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 
             flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendWhatsApp}
                  disabled={!id || smsSending}
                >
                  {smsSending ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaWhatsapp className="w-4 h-4 mr-2" />
                      WhatsApp
                    </>
                  )}
                </button>
                <button
                  className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                  disabled={!id}
                  onClick={handlePrintClick}
                >
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
              <div className="bg-white" style={{ display: "none" }}>
                <PosReceipt
                  ref={receiptRef}
                  singleData={singleData?.data}
                  branchData={singleDataBranch?.data}
                  taxRows={taxRows}
                  grossAmount={grossAmount}
                  roundOffValue={roundOffValue}
                  roundOffType={roundOffType}
                  totalNetAmt={totalAmount}
                  salesBillItems={salesBillItems?.filter(
                    (item) => item?.styleItemId,
                  )}
                  savedData={savedData}
                  sizeList={sizeList}
                  styleItemList={styleItemList}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
