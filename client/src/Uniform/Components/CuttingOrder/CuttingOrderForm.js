import { useCallback, useEffect, useRef, useState } from "react";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { DropdownInput, DropdownNew } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { getCommonParams, params } from "../../../Utils/helper";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import StyleMasterApi from "../../../redux/uniformService/StyleMasterService.js";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import CuttingOrderItems from "./CuttingOrderItems.js";
import { useLazyGetFabricDetailQuery } from "../../../redux/services/MaterialStockService.js";
import {
  useAddCuttingOrderMutation,
  useGetCuttingOrderByIdQuery,
  useGetCuttingOrderQuery,
  useUpdateCuttingOrderMutation,
} from "../../../redux/uniformService/CuttingOrderService.js";
import { event } from "jquery";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices.js";
export default function CuttingOrderForm({
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
  const [storeId, setStoreId] = useState("");
  const [cuttingOrderItems, setCuttingOrderItems] = useState([]);
  const [styleId, setStyleId] = useState("");
  const firstUpdate = useRef(true);
  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();
  const dispatch = useDispatch();

  const { companyId, userId, finYearId, branchId } = getCommonParams();

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({
    params: { companyId },
  });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCuttingOrderByIdQuery(id, { skip: !id });

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetCuttingOrderQuery({
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
      setCuttingOrderItems(
        data?.cuttingOrderItems ? data.cuttingOrderItems : []
      );
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : "");
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

  const [addData] = useAddCuttingOrderMutation();
  const [updateData] = useUpdateCuttingOrderMutation();
  const [getFabricDetail] = useLazyGetFabricDetailQuery();

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
        toast.error(returnData?.message);
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const validateData = (data) => {
    if (cuttingOrderItems?.length > 0) {
      return true;
    }
    return false;
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
        allData?.data?.flatMap((d) => d.cuttingOrderItems || []) || [];
      console.log(allData?.data, "allData");
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
  };

  const data = {
    id,
    docDate,
    branchId,
    // storeId,
    cuttingOrderItems: cuttingOrderItems?.filter?.(
      (item) => item?.styleId && item?.fabricId
    ),
    userId,
    finYearId,
    // locationId,
    styleId,
  };

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return; // skip on first render
    }
    // Call the function whenever styleId changes
    if (id) return;

    // 🚫 block when readOnly mode
    if (readOnly) return;
    handleAddRow();
  }, [styleId,id,readOnly]);

  const handleAddRow = async () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
    } else {
      try {
        const { data: fabricData } = await getFabricDetail({
          params: {
            styleId: styleId,
            storeId,
            branchId,
          },
        });
        const fabricItems = fabricData?.data;
        if (!fabricItems) return;

        setCuttingOrderItems((prev) => {
          const updated = [...prev];
          // Find first empty slot index
          let startIndex = updated.findIndex(
            (row) =>
              !row.styleId &&
              !row.styleItemId &&
              !row.fabricId &&
              !row.colorId &&
              !row.fabWidth &&
              !row.fabMeter &&
              !row.portionId &&
              !row.sizeId &&
              !row.orderQty &&
              !row.remarks
          );
          if (startIndex === -1) startIndex = updated.length;

          // Fill in sizeRows starting at first empty slot
          fabricItems.forEach((row, i) => {
            const cloned = structuredClone(row);
            if (startIndex + i < updated.length) {
              updated[startIndex + i] = cloned;
            } else {
              updated.push(cloned); // append if no empty slot
            }
          });

          // Ensure at least 6 rows
          while (updated.length < 5) {
            updated.push({
              styleId: "",
              styleItemId: "",
              fabricId: "",
              colorId: "",
              fabWidth: "",
              fabMeter: "",
              portionId: "",
              sizeId: "",
              orderQty: "",
              remarks: "",
              selected: false,
              uomId: "",
              sizeDetails: [],
            });
          }
          return updated;
        });
      } catch (error) {
        console.error("Error adding row:", error);
      }
    }
  };

  return (
    <>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold text-gray-800">
            Cutting Plan Details
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
              <ReusableInput label="Cutting Plan No" readOnly value={docId} />
              <ReusableInput
                label="Cutting Plan Date"
                value={docDate}
                type={"date"}
                required={true}
                readOnly={true}
                disabled
              />
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Style Details</h2>

            <div className="grid grid-cols-2 gap-1">
              {/* <ReusableInput
                label="Style No"
                value={styleId}
                setValue={setStyleId}
                type={"text"}
                required={true}
                readOnly={readOnly}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    handleAddRow();
                  }
                }}
              /> */}
              <DropdownNew
                name="Style No"
                dataList={
                  id
                    ? styleList?.data
                    : styleList?.data?.filter((item) => item.active)
                }
                value={styleId}
                setValue={setStyleId}
                required={true}
                readOnly={readOnly}
                placeholder={"Select Style"}
                otherField={"sku"}
                autoFocus={true}
                disabled={id}
                clear={true}
              />
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            {/* <h2 className="font-medium text-slate-700 mb-2">
              Location Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <DropdownInput
                name="Location"
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
              />
              <DropdownInput
                name="Store"
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
            </div> */}
          </div>
        </div>
        <fieldset className="w-full  min-w-[1200px]">
          <CuttingOrderItems
            styleId={styleId}
            styleList={styleList}
            cuttingOrderItems={cuttingOrderItems}
            setCuttingOrderItems={setCuttingOrderItems}
            readOnly={readOnly}
            styleTemplateDetail={styleTemplateDetail}
            uomList={uomList}
            id={id}
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
              disabled={!id}
            >
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
