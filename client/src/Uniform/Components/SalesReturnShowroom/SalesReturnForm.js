import { useState, useCallback, useEffect, useRef } from "react";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
} from "../../../Utils/helper";
import { ReusableInput } from "../../../Utils/CommonInput";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { useDispatch } from "react-redux";
import { Loader } from "../../../Basic/components";
import SalesReturnItems from "./SalesReturnItems";
import {
  useAddSalesReturnSRMutation,
  useGetSalesReturnSRByIdQuery,
  useGetSalesReturnSRQuery,
  useUpdateSalesReturnSRMutation,
} from "../../../redux/uniformService/SalesReturnShowroom.service";
import {
  useGetSalesBillQuery,
  useLazyGetSalesBillDetailQuery,
} from "../../../redux/services/SalesBillService";
import { CommaInput, DropdownInput, DropdownNew } from "../../../Inputs";
import salesBillApi from "../../../redux/services/SalesBillService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";
import purchaseBillApi from "../../../redux/services/PurchaseBillService";
import { ReturnTypeDatas } from "../../../Utils/DropdownData";
import SalesExchangeItems from "./SalesExchangeItems";
import { groupBy } from "lodash";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
export function SalesReturnForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  sizeList,
  styleItemList,
  colorList,
  uomList,
  styleList,
  isHo,
  branchList,
}) {
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [salesReturnItems, setSalesReturnItems] = useState([]);
  const [tempItems, setTempItems] = useState([]);

  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [remarks, setRemarks] = useState("");
  const [billNo, setBillNo] = useState("");
  const [returnType, setReturnType] = useState("");
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [salesExchangeItems, setsalesExchangeItems] = useState([]);
  const [isCash, setIsCash] = useState(true);
  const [isCard, setIsCard] = useState(false);
  const [isUpI, setIsUpI] = useState(false);
  const [cardAmount, setCardAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [deliveryToId, setDeliveryToId] = useState("");

  const paidAmount =
    Number(cashAmount || 0) + Number(cardAmount || 0) + Number(upiAmount || 0);

  const dispatch = useDispatch();
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesReturnSRByIdQuery(id, { skip: !id });
  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetSalesReturnSRQuery({
    params: {
      branchId,
      finYearId,
    },
  });

  const { data: salesList } = useGetSalesBillQuery({
    params: { branchId },
  });

  const netAmountBill = salesReturnItems.reduce(
    (sum, row) => sum + (Number(row.netAmount) || 0),
    0,
  );
  const roundedBill = Math.round(netAmountBill);
  const roundOffBill = roundedBill - netAmountBill;
  const totalAmountBill = netAmountBill + Number(roundOffBill || 0);

  const grossAmount = salesExchangeItems.reduce(
    (sum, row) =>
      sum + (Number(row.exchangeQty) || 0) * (Number(row.rate) || 0),
    0,
  );

  const netAmount = salesExchangeItems.reduce(
    (sum, row) => sum + (Number(row.netAmount) || 0),
    0,
  );
  const rounded = Math.round(netAmount);
  const roundOff = rounded - netAmount;
  const totalAmount = netAmount + Number(roundOff || 0) - totalAmountBill;

  const taxGroupWise = groupBy(salesExchangeItems, "taxPercent");

  const taxRows = Object.entries(taxGroupWise)
    .filter(([taxPercent]) => Number(taxPercent) > 0)
    .map(([taxPercent, items]) => {
      const taxable = items.reduce(
        (sum, item) => sum + (Number(item.taxable) || 0),
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

  const isLoadingIndicator = isSingleFetching || isSingleLoading;

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

  const validateData = (data) => {
    if (!isHo) {
      if (!data?.customerName || !data?.billNo) {
        toast.info("Please fill all required fields...!", {
          position: "top-center",
          autoClose: 2000,
        });
        return false;
      }
    }
    if (!data?.salesReturnItems || data.salesReturnItems.length === 0) {
      toast.info("Please add at least one return item...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    if (returnType === "Exchange") {
      if (!data?.salesExchangeItems || data.salesExchangeItems.length === 0) {
        toast.info("Please add Exchange item...!", {
          position: "top-center",
          autoClose: 2000,
        });
        return false;
      }
    }
    const filledGoodsItems = data.salesReturnItems.filter(
      (item) => item?.styleItemId,
    );
    if (
      !isGridDatasValid(filledGoodsItems, false, ["returnQty", "barcodeId"])
    ) {
      toast.info("Please fill all required items details...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    const filledeExchangeItems = data.salesExchangeItems.filter(
      (item) => item?.styleItemId,
    );
    if (
      !isGridDatasValid(filledeExchangeItems, false, [
        "exchangeQty",
        "barcodeId",
        "rate",
      ])
    ) {
      toast.info("Please fill all required items details...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    const duplicatesGoods = findDuplicateGoodss(filledGoodsItems);
    const duplicateExchangeItems = findDuplicateGoodss(filledeExchangeItems);
    if (duplicatesGoods.length > 0) {
      const dup = duplicatesGoods[0];
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item Found",
        html: `
                   Barcode - ${dup?.barcodeNo},
                   Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
                 `,
      });
      return false;
    }
    if (duplicateExchangeItems.length > 0) {
      const dup = duplicateExchangeItems[0];
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item Found",
        html: `
                   Barcode - ${dup?.barcodeNo},
                   Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
                 `,
      });
      return false;
    }
    if (returnType === "Exchange") {
      if (netAmount < totalAmountBill) {
        Swal.fire({
          title: "Payment Failed",
          text: "Please average Return items and Exchange items Net Amount..!",
          icon: "error",
        });
        return false;
      }
      if (paidAmount > totalAmount) {
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: "Paid amount cannot be greater than Total amount",
        });
        return false; // stop further execution
      }
      if (paidAmount < totalAmount) {
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: "Paid amount cannot be Less than Total amount",
        });
        return false; // stop further execution
      }
    }

    return true;
  };

  const [getSalesBillDetail] = useLazyGetSalesBillDetailQuery();

  const data = {
    id,
    docDate,
    branchId,
    salesReturnItems: salesReturnItems?.filter((item) => item?.styleItemId),
    userId,
    finYearId,
    customerId,
    customerName,
    mobileNo,
    termsAndCondition,
    remarks,
    billNo,
    salesExchangeItems: salesExchangeItems?.filter((item) => item?.barcodeId),
    returnType,
    taxTemplateId,
    isCash,
    isCard,
    isUpI,
    cardAmount,
    upiAmount,
    cashAmount,
    deliveryToId,
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setSalesReturnItems(
        data?.salesReturnSRItems ? data.salesReturnSRItems : [],
      );
      setsalesExchangeItems(
        data?.salesExchangeItems ? data?.salesExchangeItems : [],
      );
      setBillNo(data?.billNo ? data.billNo : "");
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setCustomerId(data?.customerId ? data?.customerId : "");
      setMobileNo(data?.mobileNo ? data?.mobileNo : "");
      setCustomerName(data?.customerName ? data?.customerName : "");
      setTermsAndCondition(
        data?.termsAndCondition ? data.termsAndCondition : "",
      );
      setRemarks(data?.remarks ? data.remarks : "");
      setReturnType(
        data?.returnType ? data?.returnType : isHo ? "General" : "Exchange",
      );
      setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
      setIsCash(data?.isCash || true);
      setIsCard(data?.isCard || false);
      setIsUpI(data?.isUpI || false);
      setCardAmount(data?.cardAmount || "");
      setUpiAmount(data?.upiAmount || "");
      setCashAmount(data?.cashAmount || "");
      setDeliveryToId(data?.deliveryToId ? data?.deliveryToId : "");
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

  const [addData] = useAddSalesReturnSRMutation();
  const [updateData] = useUpdateSalesReturnSRMutation();

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 0) {
        if (nextProcess == "new") {
          setId(0);
          setDocId("New");
          syncFormWithDb(undefined);
        } else {
          onClose();
        }
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
        dispatch(salesBillApi.util.invalidateTags(["SalesBill"]));
        dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
        dispatch(purchaseBillApi.util.invalidateTags(["PurchaseBill"]));
      } else {
        toast.error(returnData?.message);
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      return;
    }
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.find(
          (item) =>
            item.billNo?.trim().toLowerCase() === billNo?.trim().toLowerCase(),
        );
    } else {
      foundItem = allData?.data?.find(
        (item) =>
          item.billNo?.trim().toLowerCase() === billNo?.trim().toLowerCase(),
      );
    }
    if (foundItem) {
      const hasDuplicateGoods = foundItem.salesReturnSRItems?.find((existing) =>
        salesReturnItems?.some(
          (current) => Number(current.barcodeId) === Number(existing.barcodeId),
        ),
      );
      if (hasDuplicateGoods) {
        Swal.fire({
          text: `Barcode No ${hasDuplicateGoods.barcodeNo} is already return.`,
          icon: "warning",
          timer: 2000,
          showConfirmButton: false,
        });
        return false;
      }
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

  const handleAddRow = async (newValue) => {
    setBillNo(newValue);
    setSalesReturnItems([]);
    try {
      const { data: salesData } = await getSalesBillDetail({
        params: {
          billNo: newValue,
          branchId,
          companyId,
        },
      });
      setCustomerId(salesData?.data?.customerId);
      setCustomerName(salesData?.data?.customerName);
      setMobileNo(salesData?.data?.mobileNo);
      setTaxTemplateId(salesData?.data?.taxTemplateId);
      setDeliveryToId(salesData?.data?.deliveryToId);
      const salesItems = salesData?.data?.salesBillItems;
      if (!salesItems) return;
      setTempItems(salesItems);
    } catch (error) {
      console.error("Error Fetching Data:", error);
    }
  };

  return (
    <>
      {isLoadingIndicator ? (
        <Loader />
      ) : (
        <div className="" onKeyDown={handleKeyDown}>
          <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-xl font-bold text-gray-800">Sales Return</h1>
              <button
                onClick={onClose}
                className="text-indigo-600 hover:text-indigo-700"
                title="Open Report"
              >
                <FaFileAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-2 mt-1.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Basic Details
                </h2>
                <div className="grid grid-cols-2 gap-1">
                  <ReusableInput
                    label="Sales Return No"
                    readOnly
                    value={docId}
                  />
                  <ReusableInput
                    label="Sales Return Date"
                    value={docDate}
                    type={"date"}
                    required={true}
                    readOnly={true}
                    disabled
                  />
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Sales Bill Details
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <DropdownInput
                    name="Return Type"
                    options={
                      isHo
                        ? ReturnTypeDatas.filter(
                            (item) => item.value !== "Exchange",
                          )
                        : ReturnTypeDatas
                    }
                    value={returnType}
                    setValue={setReturnType}
                    required={true}
                    readOnly={id}
                    beforeChange={() => {
                      setsalesExchangeItems([]);
                      setSalesReturnItems([]);
                    }}
                    autoFocus={true}
                  />
                  {!isHo && (
                    <DropdownNew
                      name="Sales Bill No"
                      dataList={salesList?.data}
                      value={billNo}
                      setValue={handleAddRow}
                      required={true}
                      readOnly={readOnly}
                      placeholder={"Select Sales"}
                      otherField={"docId"}
                      otherValue={"docId"}
                      disabled={id}
                    />
                  )}
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                {!isHo && (
                  <h2 className="font-medium text-slate-700 mb-2">
                    Customer Details
                  </h2>
                )}
                {!isHo && (
                  <div className="grid grid-cols-2 gap-2">
                    <ReusableInput
                      label="Customer Name"
                      value={customerName}
                      setValue={setCustomerName}
                      type={"text"}
                      readOnly={true}
                      required={true}
                    />
                    <ReusableInput
                      label="Contact No"
                      value={mobileNo}
                      setValue={setMobileNo}
                      type={"text"}
                      readOnly={true}
                      required={true}
                    />
                  </div>
                )}
                {/* {isHo && (
                  <div className="grid grid-cols-2 gap-2">
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
                      disabled={true}
                      otherField={"branchName"}
                      placeholder={"Select Showroom"}
                      autoFocus={true}
                    />
                  </div>
                )} */}
              </div>
            </div>
            <fieldset className="w-full  min-w-[1200px]">
              <SalesReturnItems
                salesReturnItems={salesReturnItems}
                setSalesReturnItems={setSalesReturnItems}
                readOnly={readOnly}
                branchId={branchId}
                sizeList={sizeList}
                styleItemList={styleItemList}
                colorList={colorList}
                uomList={uomList}
                tempItems={tempItems}
                setTempItems={setTempItems}
                billNo={billNo}
                styleList={styleList}
                id={id}
                returnType={returnType}
                isHo={isHo}
                branchList={branchList}
              />
            </fieldset>
            {returnType === "Exchange" && (
              <fieldset className="w-full  min-w-[1200px]">
                <SalesExchangeItems
                  salesExchangeItems={salesExchangeItems}
                  setSalesExchangeItems={setsalesExchangeItems}
                  readOnly={readOnly}
                  branchId={branchId}
                  sizeList={sizeList}
                  styleItemList={styleItemList}
                  colorList={colorList}
                  uomList={uomList}
                  taxTemplateId={taxTemplateId}
                  billNo={billNo}
                  id={id}
                  isHo={isHo}
                />
              </fieldset>
            )}
            {returnType !== "Exchange" && (
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                  <h2 className="font-medium text-slate-700 mb-1 text-base">
                    Remarks
                  </h2>
                  <textarea
                    readOnly={readOnly}
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                    }}
                    className={`w-full  overflow-auto  h-9 px-2.5 py-2 text-xs border border-slate-400 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500`}
                    placeholder="Additional remarks..."
                    disabled={readOnly}
                  />
                </div>
                <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                  <h2 className="font-medium text-slate-700 mb-2 text-base">
                    Terms and Condition
                  </h2>
                  <textarea
                    readOnly={readOnly}
                    value={termsAndCondition}
                    onChange={(e) => {
                      setTermsAndCondition(e.target.value);
                    }}
                    className="w-full overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-400 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                    placeholder="Terms Details..."
                    disabled={readOnly}
                  />
                </div>
                <div className="border border-slate-200 p-2 bg-white rounded-md  shadow-sm">
                  <h2 className="font-semibold text-slate-800 mb-2 text-base">
                    Summary
                  </h2>
                  <div className="space-y-1.5">
                    <div className="flex justify-between  text-sm">
                      <span className="text-slate-600">Total Return Qty</span>
                      <span className="font-medium">
                        {salesReturnItems
                          .reduce(
                            (sum, row) => sum + (Number(row.returnQty) || 0),
                            0,
                          )
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {returnType === "Exchange" && (
              <Accordion
                disableGutters
                elevation={0}
                square
                sx={{
                  "&:before": { display: "none" }, // remove top divider line
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    minHeight: "40px",
                    "& .MuiAccordionSummary-content": {
                      margin: "8px 0",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{ color: "#334155", fontWeight: 500 }} // slate-700 color
                  >
                    Other Details
                  </Typography>{" "}
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    paddingTop: 0,
                    // backgroundColor: "#f1f1f0", // ✅ correct
                    paddingX: 1,
                  }}
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white rounded-md shadow-sm">
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
                    <div className=" bg-white rounded-md shadow-sm ">
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
                                value={cashAmount}
                                setValue={setCashAmount}
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
                    </div>
                    <div className=" bg-white rounded-md shadow-sm">
                      <fieldset className="w-full text-slate-700 border h-full p-3 border-slate-400 rounded-md">
                        <legend className="font-medium px-2">Summary</legend>

                        <div className="grid grid-cols-2 gap-4 text-xs">
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
                              <span>Roundoff</span>
                              <span>{roundOff.toFixed(2)}</span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between font-bold text-base border-t pt-2 text-indigo-600">
                              <span>Total</span>
                              <span>
                                {Number(totalAmount || 0).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                </AccordionDetails>
              </Accordion>
            )}

            <div className="flex flex-col md:flex-row gap-2 justify-between">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => saveData("new")}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  Save & New
                </button>
                <button
                  onClick={() => saveData("close")}
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
                    onClick={() => setReadOnly(false)}
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
