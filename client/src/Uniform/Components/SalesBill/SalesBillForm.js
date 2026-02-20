import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { DropdownInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
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
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import tw from "../../../Utils/tailwind-react-pdf";
// import PDF from "./PrintFormat/PDF";
import { useDispatch } from "react-redux";
import { Loader } from "../../../Basic/components";
import {
  useAddSalesBillMutation,
  useGetSalesBillByIdQuery,
  useUpdateSalesBillMutation,
} from "../../../redux/services/SalesBillService";
import SalesBillItems from "./SalesBillItems";
import SalesBillSummary from "./SalesBillSummary";
import CustomerSearchComponent from "./CustomerSearchComponent";
import { useGetCustomerByIdQuery } from "../../../redux/services/CustomerMasterService";
import purchaseBillApi from "../../../redux/services/PurchaseBillService";
import showroomStockApi from "../../../redux/uniformService/ShowroomStockService";
import OpeningStockSRApi from "../../../redux/uniformService/OpeningStockSRServices";
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
}) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
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
  const [cardAmount, setCardAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
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
    if (!data?.customerId || !data?.customerName || !data?.taxTemplateId) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    // 2️⃣ At least one item required
    if (!data?.salesBillItems || data.salesBillItems.length === 0) {
      toast.info("Please add at least one item...!", {
        position: "top-center",
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
      toast.info("Please fill all required items details...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    // 4️⃣ Duplicate check
    // 4️⃣ Duplicate check
    const duplicatesGoods = findDuplicateGoodss(filledGoodsItems);
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

    return true;
  };

  const data = {
    id,
    docDate,
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
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
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
      setCardAmount(data?.cardAmount || 0);
      setUpiAmount(data?.upiAmount || 0);
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
        dispatch(purchaseBillApi.util.invalidateTags(["PurchaseBill"]));
        dispatch(showroomStockApi.util.invalidateTags(["showroomStock"]));
        dispatch(OpeningStockSRApi.util.invalidateTags(["OpeningStockSR"]));
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

  const calculateNetAmount = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const taxPercent = parseFloat(item.taxPercent) || 0;
    const discountValue = parseFloat(item.discountValue) || 0;
    const discountType = item.discountType || "";

    // Gross amount
    const grossAmount = qty * price;

    // GST Subtracted
    const amountAfterGST = grossAmount - (grossAmount * taxPercent) / 100;

    // Apply Discount
    let discountAmt = 0;
    if (discountType === "Flat") discountAmt = discountValue;
    else if (discountType === "Percent")
      discountAmt = (amountAfterGST * discountValue) / 100;

    // Final net amount
    const netAmount = amountAfterGST - discountAmt;

    return netAmount.toFixed(2);
  };

  const totalNetAmount = useMemo(() => {
    return salesBillItems
      .reduce((sum, row) => sum + (parseFloat(calculateNetAmount(row)) || 0), 0)
      .toFixed(2);
  }, [salesBillItems]);

  useEffect(() => {
    if (!taxTemplateId && taxTypeList?.data?.length > 0) {
      setTaxTemplateId(taxTypeList.data[0].id);
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
                <div className="grid grid-cols-3 gap-1">
                  <ReusableInput label="Sales Bill No" readOnly value={docId} />
                  <ReusableInput
                    label="Sales Bill Date"
                    value={docDate}
                    type={"date"}
                    required={true}
                    readOnly={true}
                    disabled
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
                </div>
              </div>
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
                    autoFocus={id ? false : true}
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
                </div>
              </div>
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
              />
            </fieldset>
            <div className="grid grid-cols-3 gap-2">
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
                <h2 className="font-medium text-slate-700 mb-1 text-base">
                  Terms and Condition
                </h2>
                <textarea
                  readOnly={readOnly}
                  value={termsAndCondition}
                  onChange={(e) => {
                    setTermsAndCondition(e.target.value);
                  }}
                  className="w-full overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Terms Details..."
                  disabled={readOnly}
                />
              </div>

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
                  className="w-full  overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Additional remarks..."
                  disabled={readOnly}
                />
              </div>

              <div className="border border-slate-200 p-2 bg-white flex h-auto items-center rounded-md shadow-sm">
                <h2 className="font-bold text-slate-800 mb-2 text-base">
                  Sales Bill Summary
                </h2>

                <button
                  className="text-sm bg-sky-500 text-white font-semibold hover:bg-sky-800 transition p-1 ml-5 rounded"
                  onClick={() => {
                    if (!taxTemplateId) {
                      toast.info("Please Select Tax Template !", {
                        position: "top-center",
                      });
                      return;
                    }
                    setSummary(true);
                  }}
                >
                  View Summary
                </button>
              </div>
            </div>
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
                <button
                  className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                  disabled={!id}
                  onClick={() => {
                    setPdfOpen(true);
                  }}
                >
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
