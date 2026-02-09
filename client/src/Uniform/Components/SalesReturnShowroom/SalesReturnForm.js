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
  useUpdateSalesReturnSRMutation,
} from "../../../redux/uniformService/SalesReturnShowroom.service";
import { useGetSalesBillQuery } from "../../../redux/services/SalesBillService";
import { DropdownNew } from "../../../Inputs";

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
  taxTypeList,
}) {
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [salesReturnItems, setSalesReturnItems] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const [termsAndCondition, setTermsAndCondition] = useState("");
  const [remarks, setRemarks] = useState("");
  const [invNo, setInvNo] = useState("");

  const dispatch = useDispatch();
  const customerNameRef = useRef(null);
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesReturnSRByIdQuery(id, { skip: !id });

  const { data: salesList } = useGetSalesBillQuery({
    params: { branchId },
  });

  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [
        row.styleItemId || "",
        row.sizeId || "",
        row.colorId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          styleItemId: row.styleItemId,
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
    const items = data?.salesReturnItems || [];

    // remove blank rows
    const filledItems = items.filter(
      (item) => item.styleId || item.styleItemId || item.sizeId,
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
        data?.customerId &&
        data?.customerName &&
        data?.salesReturnItems.length > 0 &&
        isGridDatasValid(
          data?.salesReturnItems.filter((item) => item?.styleItemId),
          false,
          ["retuenQty"],
        )
      )
    ) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    return true;
  };

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
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setSalesReturnItems(data?.salesReturnItems ? data.salesReturnItems : []);
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

  const handleAddRow = async (newValue) => {
    setInvNo(newValue);
    const hasUnfilledRequired = salesReturnItems.some((row) => {
      return row.styleItemId && !row.returnQty;
    });

    if (hasUnfilledRequired) {
      toast.info("Please fill all required fields before adding...!", {
        position: "top-center",
      });
      return;
    }
    // try {
    //   const { data: salesData } = await getSalesInvDetail({
    //     params: {
    //       invNo: newValue,
    //       branchId,
    //     },
    //   });
    //   setCustomerId(salesData?.data?.customerId);
    // const salesItems = salesData?.data?.SalesEntryItems;
    // if (!salesItems) return;
    // setSalesReturnItems((prev) => {
    //   const updated = [...prev];
    //   // Find first empty slot index
    //   let startIndex = updated.findIndex(
    //     (row) =>
    //       !row.styleId &&
    //       !row.sizeId &&
    //       !row.styleNo &&
    //       !row.fabricId &&
    //       !row.barcode
    //   );
    //   if (startIndex === -1) startIndex = updated.length;

    //   // Fill in sizeRows starting at first empty slot
    //   salesItems.forEach((row, i) => {
    //     if (startIndex + i < updated.length) {
    //       updated[startIndex + i] = row;
    //     } else {
    //       updated.push(row); // append if no empty slot
    //     }
    //   });

    //   // Ensure at least 6 rows
    //   while (updated.length < 6) {
    //     updated.push({
    //       styleNo: "",
    //       fabricId: "",
    //       styleId: "",
    //       sizeId: "",
    //       qty: "",
    //       remarks: "",
    //       stkQty: "",
    //       barcode: "",
    //       styleItemId: "",
    //       colorId: "",
    //       selected: false,
    //     });
    //   }

    //   return updated;
    // });
    // } catch (error) {
    //   console.error("Error adding row:", error);
    // }
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
          <div className="space-y-2 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Basic Details
                </h2>
                <div className="grid grid-cols-3 gap-1">
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
                  <DropdownNew
                    name="Sales Bill No"
                    dataList={salesList?.data}
                    value={invNo}
                    setValue={handleAddRow}
                    required={true}
                    readOnly={readOnly}
                    placeholder={"Select Sales"}
                    otherField={"docId"}
                    otherValue={"docId"}
                    disabled={id}
                  />
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Customer Details
                </h2>
                <div className="grid grid-cols-3 gap-2">
                  <ReusableInput
                    label="Customer Name"
                    value={customerName}
                    setValue={setCustomerName}
                    type={"text"}
                    readOnly={readOnly}
                    required={true}
                  />
                  <ReusableInput
                    label="Contact No"
                    value={mobileNo}
                    setValue={setMobileNo}
                    type={"text"}
                    readOnly={readOnly}
                    required={true}
                  />
                </div>
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
                  className="w-full overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
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
                  className="w-full  overflow-auto h-9 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
                  placeholder="Additional remarks..."
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
                        .reduce((sum, row) => sum + (Number(row.returnQty) || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
