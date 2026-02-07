import { useState, useCallback, useEffect, useMemo } from "react";
import { DropdownInput, DropdownNew, TextInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
} from "../../../Utils/helper";
import { ReusableInput } from "../../../Utils/CommonInput";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import tw from "../../../Utils/tailwind-react-pdf";
// import PDF from "./PrintFormat/PDF";
import { PaymentTypeData, paymentTypes } from "../../../Utils/DropdownData";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import { useDispatch } from "react-redux";
import OpeningStockApi from "../../../redux/uniformService/OpeningStockService";
import StockAdjustmentApi from "../../../redux/uniformService/StockAdjustmentService";
import { Loader } from "../../../Basic/components";
import {
  useAddSalesBillMutation,
  useGetSalesBillByIdQuery,
  useGetSalesBillQuery,
  useUpdateSalesBillMutation,
} from "../../../redux/services/SalesBillService";
import SalesBillItems from "./SalesBillItems";
import SalesBillSummary from "./SalesBillSummary";

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
}) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [salesBillItems, setSalesBillItems] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentValue, setpaymentValue] = useState("")
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [summary, setSummary] = useState(false);
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [remarks, setRemarks] = useState("");
  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState();
  const dispatch = useDispatch();

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesBillByIdQuery(id, { skip: !id });

  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: partyList } = useGetPartyQuery({
    params: { companyId },
    searchParams: searchValue,
  });

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [row.styleId || "", row.sizeId || "", row.colorId || ""].join(
        "-",
      );

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          styleId: row.styleId,
          sizeId: row.sizeId,
          colorId: row.colorId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  const validateData = (data) => {
    const items = data?.salesBillItems || [];

    // remove blank rows
    const filledItems = items.filter(
      (item) => item.styleId || item.styleItemId || item.fabricId,
    );

    const duplicates = findDuplicates(filledItems);
    // duplicate check
    if (duplicates.length > 0) {
      const dup = duplicates[0]; // show first duplicate
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item Found",
        html: `
       Style - ${findFromList(dup?.styleItemId, styleItemList?.data, "name")},
       Size - ${findFromList(dup?.sizeId, sizeList?.data, "name")},
       Color - ${findFromList(dup?.colorId, colorList?.data, "name")},
       Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
     `,
        confirmButtonText: "OK",
      });
      return false;
    }
    if (
      !(
        // data?.customerId &&
        data?.paymentType &&
        data?.paymentValue &&
        data?.taxTemplateId &&
        data?.salesBillItems.length > 0 
        &&
        isGridDatasValid(
          data?.salesBillItems.filter((item) => item?.styleItemId),
          false,
          ["qty","rate"],
        )
      )
    ) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
        autoClose: 2000
      });
      return false;
    }
    return true;
  };

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetSalesBillQuery({
    params: {
      branchId,
    },
  });

  const data = {
    id,
    docDate,
    branchId,
    salesBillItems: salesBillItems?.filter((item) => item?.styleItemId),
    userId,
    finYearId,
    customerId,
    customerName,
    mobileNo,
    paymentType,
    termsAndCondition,
    discountType,
    discountValue,
    paymentValue,
    taxTemplateId
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setSalesBillItems(data?.SalesBillItems ? data.SalesBillItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setCustomerId(data?.customerId ? data?.customerId : "");
      setMobileNo(data?.mobileNo ? data?.mobileNo : "");
      setCustomerName(data?.customerName ? data?.customerName : "");
      setPaymentType(data?.paymentType ? data?.paymentType : "");
      setTermsAndCondition(
        data?.termsAndCondition ? data.termsAndCondition : "",
      );
      setRemarks(data?.remarks ? data.remarks : "");
      setDiscountType(data?.discountType || "Flat");
      setDiscountValue(data?.discountValue || "0");
      setPaymentType(data?.paymentValue ? data?.paymentValue : "")
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

  const handlePartyChange = (selectedId, field) => {
    const selectedParty = partyList?.data?.find(
      (p) => p.id === Number(selectedId),
    );

    if (field === "customer") {
      setCustomerId(selectedParty?.id);
      setMobileNo(selectedParty?.mobileNo);
      setCustomerName(selectedParty?.customerNameName || "");
    }
  };

  useEffect(() => {
    if (customerId && partyList?.data?.length) {
      handlePartyChange(customerId, "customer");
    }
  }, [customerId, setCustomerId, partyList?.data]);

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
          <div className="space-y-2 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Basic Details
                </h2>
                <div className="grid grid-cols-2 gap-1">
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
                    readOnly={readOnly}
                    autoFocus={true}
                  />
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Payment Details
                </h2>
                <div className="grid grid-cols-2 gap-1">
                  <DropdownInput
                    name="Payment Type"
                    options={PaymentTypeData}
                    value={paymentType}
                    setValue={setPaymentType}
                    required={true}
                    readOnly={readOnly}
                  />
                  <TextInput
                    name={"Payment Value"}
                    value={paymentValue}
                    setValue={setpaymentValue}
                    readOnly={readOnly}
                    required
                    type="number"
                  />
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Customer Details
                </h2>
                <div className="grid grid-cols-2 gap-1">
                  <DropdownNew
                    name="Customer"
                    dataList={partyList?.data?.filter((item) => item.isClient)}
                    value={customerId}
                    setValue={(value) => {
                      setCustomerId(value);
                    }}
                    required={true}
                    disabled={readOnly}
                    placeholder={"Select Contact Person"}
                  />
                  <ReusableInput
                    label="Contact Number"
                    value={mobileNo}
                    setValue={setMobileNo}
                    type={"text"}
                    readOnly={readOnly}
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
              />
            </fieldset>
            <div className="grid grid-cols-3 gap-3">
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
                  className="w-full overflow-auto h-10 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Terms Details..."
                  disabled={readOnly}
                />
              </div>

              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
                <h2 className="font-medium text-slate-700 mb-2 text-base">
                  Remarks
                </h2>
                <textarea
                  readOnly={readOnly}
                  value={remarks}
                  onChange={(e) => {
                    setRemarks(e.target.value);
                  }}
                  className="w-full  overflow-auto h-10 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
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
            <div className="flex flex-col md:flex-row gap-2 justify-between pt-2">
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
                {/* <button
                  onClick={() => saveData("draft")}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Draft Save
                </button> */}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                  onClick={() => setReadOnly(false)}
                >
                  <FiEdit2 className="w-4 h-4 mr-2" />
                  Edit
                </button>
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
