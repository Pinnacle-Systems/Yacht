import { useCallback, useEffect, useState } from "react";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { DropdownInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import {
  getCommonParams,
  isGridDatasValid,
  params,
} from "../../../Utils/helper";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import ReadyGoods from "./ReadyGoods.js";
import {
  useAddOpeningStockMutation,
  useGetOpeningStockByIdQuery,
  useGetOpeningStockQuery,
  useLazyGetOpeningStockQuery,
  usePrintBarcodeMutation,
  useUpdateOpeningStockMutation,
} from "../../../redux/uniformService/OpeningStockService.js";
import moment from "moment";
import Modal from "../../../UiComponents/Modal/index.js";
import BarCodePrintFormat from "./BarcodePrintFormat.jsx";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import StyleMasterApi from "../../../redux/uniformService/StyleMasterService.js";

export default function OpeningStockForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  setShowForm,
}) {
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [term, setTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [storeId, setStoreId] = useState("");
  const [openingStockItems, setOpeningStockItems] = useState([]);
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [barCodePerPage, setBarCodePerPage] = useState(18);
  const [barcodeItems, setBarcodeItems] = useState([]);

  const dispatch = useDispatch();

  const { companyId, userId, finYearId, branchId } = getCommonParams();

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetOpeningStockByIdQuery(id, { skip: !id });

  const [trigger, { data: allDataLazy, isFetchingLazy }] =
    useLazyGetOpeningStockQuery();

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetOpeningStockQuery({
    params: {
      branchId,
    },
  });

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setOpeningStockItems(
        data?.OpeningStockItems ? data.OpeningStockItems : []
      );
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : "");
      setStoreId(data?.storeId ? data.storeId : "");
      setNotes(data?.notes ? data?.notes : "");
      setTerm(data?.term ? data?.term : "");
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

  const [addData] = useAddOpeningStockMutation();
  const [updateData] = useUpdateOpeningStockMutation();
  const [printBarcode] = usePrintBarcodeMutation();

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
        dispatch(StyleMasterApi.util.invalidateTags(["StyleMaster"]));
      } else {
        toast.error(returnData?.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const hasDuplicates = (items) => {
    const seen = new Set();

    for (const row of items) {
      // Create a unique key using all fields you want to check
      const key = [row.styleId || "", row.sizeId || "", row.colorId || ""].join(
        "-"
      );

      if (seen.has(key)) return true; // duplicate found
      seen.add(key);
    }
    return false;
  };

  const validateData = (data) => {
    const items = data?.openingStockItems || [];

    // remove blank rows
    const filledItems = items.filter(
      (item) => item.styleId || item.styleItemId || item.fabricId
    );

    // duplicate check
    if (hasDuplicates(filledItems)) {
      toast.info("Duplicate items found!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }

    return (
      data?.openingStockItems.length > 0 &&
      data.storeId &&
      isGridDatasValid(
        data?.openingStockItems.filter((item) => item.styleId),
        false,
        ["qty"]
      )
    );
  };

  const saveData = (nextProcess) => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (nextProcess == "draft" && !id) {
      const existingItems =
        allData?.data?.flatMap((d) => d.OpeningStockItems || []) || [];
      const newItems = openingStockItems || [];
      const duplicate = newItems.some((newItem) =>
        existingItems.some(
          (existing) =>
            existing.styleNo === newItem.styleNo &&
            existing.sizeId === newItem.sizeId &&
            existing.colorId === newItem.colorId
        )
      );
      if (duplicate) {
        Swal.fire({
          icon: "warning",
          title: "This item already exists",
          text: "Cannot Create items in opening stock.",
        });
        return;
      }
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
      const existingItems =
        allData?.data?.flatMap((d) => d.OpeningStockItems || []) || [];
      const newItems = openingStockItems || [];
      const duplicate = newItems.some((newItem) =>
        existingItems.some(
          (existing) =>
            existing.styleNo === newItem.styleNo &&
            existing.sizeId === newItem.sizeId &&
            existing.colorId === newItem.colorId
        )
      );
      if (duplicate) {
        Swal.fire({
          icon: "warning",
          title: "This item already exists",
          text: "Cannot Create items in opening stock.",
        });
        return;
      }
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  const data = {
    id,
    docDate,
    branchId,
    storeId,
    openingStockItems: openingStockItems?.filter((item) => item?.styleId),
    userId,
    finYearId,
    locationId,
    term,
    notes,
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold text-gray-800">
            Opening Stock Details
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
            <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Opening Stock No" readOnly value={docId} />
              <ReusableInput
                label="Opening Stock Date"
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
                readOnly={readOnly}
                autoFocus={true}
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
                readOnly={readOnly}
              />
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2"></h2>

            <div className="grid grid-cols-2 gap-1"></div>
          </div>
        </div>
        <fieldset>
          <ReadyGoods
            openingStockItems={openingStockItems}
            setOpeningStockItems={setOpeningStockItems}
            readOnly={readOnly}
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
                const allStockRows = openingStockItems.flatMap(
                  (item) => item.Stock
                );
                setBarcodeItems(allStockRows);
                setBarcodePrintOpen(true);
                // printBarcode({barcodeDetails:allStockRows.filter((i) => i?.styleId),
                // labelsPerRow: 4,
                // })
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
      {/* {barcodePrintOpen && (
        <BarCodePrintThermalRoll
          data={barcodeItems.filter((i) => i?.styleId)}
          autoPrint={true}
        />
      )} */}
    </div>
  );
}
