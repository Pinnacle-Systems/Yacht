import { useState, useCallback, useEffect } from "react";
import { DropdownInput, TextInput } from "../../../Inputs";
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
import AdjustItems from "./AdjustItems";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import {
  useAddStockAdjustmentMutation,
  useGetStockAdjustmentByIdQuery,
  useUpdateStockAdjustmentMutation,
} from "../../../redux/uniformService/StockAdjustmentService";
import Modal from "../../../UiComponents/Modal";
import BarCodePrintFormat from "../OpeningStock/BarcodePrintFormat";
import { useDispatch } from "react-redux";
import OpeningStockApi from "../../../redux/uniformService/OpeningStockService";
import SalesEntryApi from "../../../redux/uniformService/SalesEntryService";
import { Loader } from "../../../Basic/components";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import purchaseInwardEntryApi from "../../../redux/uniformService/PurchaseInwardEntry";
import purchaseReturnApi from "../../../redux/services/PurchaseReturnService";
import { UserPermissions } from "../../../Utils/UserPermissions";

export default function StockAdjustmentForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  isSingleFetching,
  isSingleLoading,
  singleData,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stockAdjustmentItems, setStockAdjustmentItems] = useState([]);
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState([]);
  const dispatch = useDispatch();
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const { hasPermission } = UserPermissions();

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });
  const { data: colorList } = useGetColorMasterQuery({ params: { companyId } });

  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId)
      )
    : [];

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [row.styleId || "", row.sizeId || "", row.colorId || ""].join(
        "-"
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
    const items = data?.stockAdjustmentItems || [];

    // remove blank rows
    const filledItems = items.filter(
      (item) => item.styleId || item.styleItemId || item.fabricId
    );

    const duplicates = findDuplicates(filledItems);
    // duplicate check
    if (duplicates.length > 0) {
      const dup = duplicates[0]; // show first duplicate
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item Found",
        html: `
    Style - ${findFromList(dup?.styleId, styleList?.data, "sku")},
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
        data?.stockAdjustmentItems.length > 0 &&
        data?.storeId &&
        isGridDatasValid(
          data?.stockAdjustmentItems.filter((item) => item.styleId),
          false,
          ["adjType", "adjQty"]
        )
      )
    ) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return false;
    }

    return true;
  };

  const data = {
    id,
    docDate,
    branchId,
    storeId,
    stockAdjustmentItems: stockAdjustmentItems?.filter((item) => item?.styleId),
    userId,
    finYearId,
    locationId,
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setStockAdjustmentItems(
        data?.StockAdjustmentItems ? data.StockAdjustmentItems : []
      );
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
    },
    [id]
  );

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const [addData] = useAddStockAdjustmentMutation();
  const [updateData] = useUpdateStockAdjustmentMutation();

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
        nextProcess
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        { ...data, draftSave: true },
        "Updated",
        nextProcess
      );
    } else if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
    dispatch(OpeningStockApi.util.invalidateTags(["OpeningStock"]));
    dispatch(SalesEntryApi.util.invalidateTags(["SalesEntry"]));
    dispatch(
      purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"])
    );
    dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  return (
    <>
      {isLoadingIndicator ? (
        <Loader />
      ) : (
        <div className="" onKeyDown={handleKeyDown}>
          <Modal
            isOpen={barcodePrintOpen}
            onClose={() => setBarcodePrintOpen(false)}
            widthClass={"px-2 h-[90%] w-[90%]"}
          >
            <BarCodePrintFormat
              data={barcodeItems.filter((i) => i?.styleId)}
              // barCodePerPage={barCodePerPage}
            />
          </Modal>
          <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-xl font-bold text-gray-800">
                Stock Adjustment
              </h1>
              <button
                onClick={onClose}
                className="text-indigo-600 hover:text-indigo-700"
                title="Open Report"
              >
                <FaFileAlt className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Basic Details
                </h2>
                <div className="grid grid-cols-2 gap-1">
                  <ReusableInput
                    label="Stock Adjustment No"
                    readOnly
                    value={docId}
                  />
                  <ReusableInput
                    label="Stock Adjustment Date"
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
                  Location Details
                </h2>
                <div className="grid grid-cols-2 gap-1">
                  <DropdownInput
                    name="Branch"
                    options={
                      branchList
                        ? dropDownListObject(
                            id
                              ? branchList?.data
                              : branchList?.data?.filter((item) => item.active),
                            "branchName",
                            "id"
                          )
                        : []
                    }
                    value={locationId}
                    setValue={(value) => {
                      setLocationId(value);
                      setStoreId("");
                    }}
                    required={true}
                    readOnly={id}
                  />
                  <DropdownInput
                    name="Location"
                    options={dropDownListObject(
                      id
                        ? storeOptions
                        : storeOptions?.filter((item) => item.active),
                      "storeName",
                      "id"
                    )}
                    value={storeId}
                    setValue={setStoreId}
                    required={true}
                    readOnly={id}
                    autoFocus={true}
                  />
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1"></div>
            </div>
            <fieldset className="w-full  min-w-[1200px]">
              <AdjustItems
                stockAdjustmentItems={stockAdjustmentItems}
                setStockAdjustmentItems={setStockAdjustmentItems}
                readOnly={readOnly}
                branchId={branchId}
                storeId={storeId}
              />
            </fieldset>
            <div className="flex flex-col md:flex-row gap-2 justify-between pt-2">
              <div className="flex gap-2 flex-wrap">
                <button
                                  disabled={readOnly}

                  onClick={() => saveData("new")}
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
                {/* <button
                  onClick={() => saveData("draft")}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Draft Save
                </button> */}
              </div>
              <div className="flex gap-2 flex-wrap">
                 {
                                    readOnly && (
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
                </button>)}
                <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
                <button
                  className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                  disabled={!id}
                  onClick={() => {
                    const allStockRows = stockAdjustmentItems.flatMap(
                      (item) => item.Stock
                    );
                    setBarcodeItems(allStockRows);
                    setBarcodePrintOpen(true);
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
