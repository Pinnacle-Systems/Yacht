import { useCallback, useEffect, useState } from "react";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { DropdownInput, DropdownNew } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import moment from "moment";
import Modal from "../../../UiComponents/Modal/index.js";
import { toast } from "react-toastify";
import {
  useAddStockInwardMutation,
  useGetStockInwardByIdQuery,
  useUpdateStockInwardMutation,
} from "../../../redux/uniformService/StockInwardService.js";
import BarCodePrintFormat from "../OpeningStock/BarcodePrintFormat.jsx";
import StockInwardItems from "./StockInwardItems.js";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService.js";
import { useLazyGetProductionDetailQuery } from "../../../redux/uniformService/ProductionStockServices.js";
import { useDispatch } from "react-redux";
import CuttingDeliveryApi from "../../../redux/uniformService/CuttingDeliveryServices.js";
import SalesEntryApi from "../../../redux/uniformService/SalesEntryService.js";
import { Loader } from "../../../Basic/components/index.js";

export default function StockInwardForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  setShowForm,
  isSingleFetching,
  isSingleLoading,
  singleData,
}) {
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stockInwardItems, setStockInwardItems] = useState([]);
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [barCodePerPage, setBarCodePerPage] = useState(10);
  const [barcodeItems, setBarcodeItems] = useState([]);
  const [styleId, setStyleId] = useState("");
  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const params = {
    branchId,
    companyId,
  };
  const { data: styleList } = useGetStyleMasterQuery({ params });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const [getProductionStyleDetail] = useLazyGetProductionDetailQuery();
  const dispatch = useDispatch();

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });

  // const {
  //   data: singleData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetStockInwardByIdQuery(id, { skip: !id });

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setStockInwardItems(data?.StockInwardItems ? data.StockInwardItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setStyleId(data?.styleId ? data?.styleId : "");
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

  const [addData] = useAddStockInwardMutation();
  const [updateData] = useUpdateStockInwardMutation();

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId)
      )
    : [];

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
        // setId(returnData?.data?.id);
        // setShowForm(false);
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
        toast.error(returnData?.message, {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("handle");
    }
  };

  // const validateData = (data) => {
  //   if (
  //     stockInwardItems?.length > 0 &&
  //     data.storeId &&
  //     isGridDatasValid(
  //       data?.stockInwardItems.filter((item) => item.styleId),
  //       false,
  //       ["qty"]
  //     )
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };

  const hasMismatchQty = (items) => {
    // group by styleId + sizeId
    const map = {};

    items.forEach((item) => {
      const key = `${item.styleId}-${item.sizeId}`;

      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(item);
    });

    // check mismatch inside each group
    for (const key in map) {
      const group = map[key];

      if (group.length > 1) {
        const qtySet = new Set(group.map((i) => Number(i.qty)));

        if (qtySet.size > 1) {
          return true; // mismatch found
        }
      }
    }

    return false;
  };

  const hasDuplicates = (items) => {
    const seen = new Set();

    for (const row of items) {
      const key = [
        row.styleId || "",
        row.portionId || "",
        row.sizeId || "",
      ].join("-");

      if (seen.has(key)) {
        return true; // duplicate found
      }

      seen.add(key);
    }

    return false;
  };

  const validateData = (data) => {
    const items = data?.stockInwardItems?.filter((item) => item.styleId) || [];

    if (items.length === 0) return false;

    // 🔥 new qty mismatch validation
    if (hasMismatchQty(items)) {
      toast.info("Please enter same Qty for Top and Bottom!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    const filledItems = items.filter(
      (item) => item.styleId || item.fabricId || item.portionID
    );
    if (hasDuplicates(filledItems)) {
      toast.info("Duplicate items found!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    // normal validations
    if (!(data.storeId && isGridDatasValid(items, false, ["qty"]))) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return false;
    }

    return true;
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
    dispatch(CuttingDeliveryApi.util.invalidateTags(["CuttingDelivery"]));
    dispatch(SalesEntryApi.util.invalidateTags(["SalesEntry"]));
  };

  const data = {
    id,
    docDate,
    branchId,
    storeId,
    stockInwardItems: stockInwardItems?.filter?.((item) => item?.styleId),
    userId,
    finYearId,
    locationId,
    styleId,
  };

  const handleStyleChange = async (newValue) => {
    if (!storeId) {
      toast.info("Please select Location and Store...!", {
        position: "top-center",
      });
      return;
    }
    if (!newValue) return;
    const isFirstTime = stockInwardItems.every((row) => !row.styleId);
    if (!isFirstTime) {
      // const hasEmpty = stockInwardItems.some((row) => !row.qty);
      const hasEmpty = stockInwardItems.some((row) => {
        const hasStyle =
          row.styleId !== "" &&
          row.styleId !== null &&
          row.styleId !== undefined;

        return hasStyle && !row.qty;
      });
      if (hasEmpty) {
        toast.info("Please fill all required fields...!", {
          position: "top-center",
        });
        return;
      }
    }
    try {
      const { data: styleData } = await getProductionStyleDetail({
        params: {
          styleId: newValue,
          branchId: branchId,
        },
      });
      const styleItems = styleData.data || [];
      if (!styleItems) return;
      if (styleData.statusCode === 1) {
        toast.info(styleData?.message, {
          position: "top-center",
          autoClose: 2000,
        });
      }
      setStockInwardItems((prev) => {
        const updated = [...prev];

        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) => !row.styleId && !row.sizeId && !row.styleNo && !row.fabricId
        );
        if (startIndex === -1) startIndex = updated.length;

        styleItems.forEach((row, i) => {
          const cloned = structuredClone(row);
          if (startIndex + i < updated.length) {
            updated[startIndex + i] = cloned;
          } else {
            updated.push(cloned); // append if no empty slot
          }
        });

        // Ensure at least 6 rows
        while (updated.length < 6) {
          updated.push({
            styleNo: "",
            fabricId: "",
            styleId: "",
            sizeId: "",
            qty: "",
            remarks: "",
            styleItemId: "",
            colorId: "",
            selected: false,
            stkQty: "",
          });
        }

        return updated;
      });
    } catch (error) {
      console.error("Error adding row:", error);
    }
    setStyleId(newValue);
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
        <div onKeyDown={handleKeyDown}>
          <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-xl font-bold text-gray-800">
                Finished Goods Inward Details
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
                    label="Goods Inward No"
                    readOnly
                    value={docId}
                  />
                  <ReusableInput
                    label="Goods Inward Date"
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
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Style Details
                </h2>

                <div className="grid grid-cols-2 gap-1">
                  <DropdownNew
                    name="Style No"
                    dataList={
                      id
                        ? styleList?.data
                        : styleList?.data?.filter((item) => item.active)
                    }
                    value={styleId}
                    setValue={handleStyleChange}
                    required={true}
                    readOnly={readOnly}
                    placeholder={"Select Style"}
                    otherField={"sku"}
                    disabled={readOnly}
                    clear={true}
                    onKeyDown={(e) => {
                      // if (e.key === "Enter") {
                      //   e.preventDefault();
                      // }
                    }}
                  />
                </div>
              </div>
            </div>
            <fieldset>
              <StockInwardItems
                stockInwardItems={stockInwardItems}
                setStockInwardItems={setStockInwardItems}
                readOnly={readOnly}
                branchId={branchId}
                params={params}
                styleList={styleList}
              />
            </fieldset>
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
                <button
                  onClick={() => saveData("draft")}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Draft Save
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
                <button
                  className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                  onClick={() => {
                    const allStockRows = stockInwardItems.flatMap(
                      (item) => item.Stock
                    );
                    setBarcodeItems(allStockRows);
                    setBarcodePrintOpen(true);
                  }}
                  disabled={!id}
                >
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Barcode
                </button>
              </div>
            </div>
          </div>
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
        </div>
      )}
    </>
  );
}
