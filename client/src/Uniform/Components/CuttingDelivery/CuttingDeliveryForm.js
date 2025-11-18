import { useCallback, useEffect, useState } from "react";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { DropdownInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { getCommonParams, params } from "../../../Utils/helper";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import StyleMasterApi from "../../../redux/uniformService/StyleMasterService.js";
import { useLazyGetFabricDetailQuery } from "../../../redux/services/MaterialStockService.js";
import {
  useAddCuttingOrderMutation,
  useGetCuttingOrderByIdQuery,
  useGetCuttingOrderQuery,
  useUpdateCuttingOrderMutation,
} from "../../../redux/uniformService/CuttingOrderService.js";
import CuttingDeliveryItem from "./CuttingDeliveryItem.jsx";
export default function CuttingDeliveryForm({
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
  const [cuttingDeliveryItems, setCuttingDeliveryItems] = useState([]);
  const [styleNo, setStyleNo] = useState("");
  const [orderNo, setOrderNo] = useState("");

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
      if (id) {
        setReadOnly(true);
      } else {
        setReadOnly(false);
      }
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setCuttingDeliveryItems(
        data?.cuttingDeliveryItems ? data.cuttingDeliveryItems : []
      );
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : "");
      setStoreId(data?.storeId ? data.storeId : "");
      setStyleNo(data?.styleNo ? data?.styleNo : "");
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
    if (cuttingDeliveryItems?.length > 0 && data.storeId && data.styleNo) {
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
        allData?.data?.flatMap((d) => d.cuttingDeliveryItems || []) || [];
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
    storeId,
    cuttingDeliveryItems: cuttingDeliveryItems?.filter?.(
      (item) => item?.styleNo && item?.fabricId
    ),
    userId,
    finYearId,
    locationId,
    styleNo,
  };

  const handleAddRow = async () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
    } else {
      try {
        const { data: fabricData } = await getFabricDetail({
          params: {
            styleNo: styleNo,
            storeId,
            branchId,
          },
        });
        const fabricItems = fabricData?.data;
        if (!fabricItems) return;

        setCuttingDeliveryItems((prev) => {
          const updated = [...prev];
          // Find first empty slot index
          let startIndex = updated.findIndex(
            (row) =>
              !row.styleNo &&
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
          while (updated.length < 6) {
            updated.push({
              styleNo: "",
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
            Cutting Delivery Details
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
              <ReusableInput
                label="Cutting Delivery No"
                readOnly
                value={docId}
              />
              <ReusableInput
                label="Cutting Delivery Date"
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
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Style Details</h2>

            <div className="grid grid-cols-2 gap-1">
              <ReusableInput
                label="Style No"
                value={styleNo}
                setValue={setStyleNo}
                type={"text"}
                required={true}
                readOnly={readOnly}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    handleAddRow();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput
                label="Cutting Order"
                value={orderNo}
                setValue={setOrderNo}
                type={"text"}
                required={true}
                readOnly={true}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    handleAddRow();
                  }
                }}
              />
              {/* {!readOnly && (
                <button
                  className="p-0.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white -ml-6"
                  onClick={() => {
                    if (!styleId || !supplierId) {
                      toast.info("Please Select StyleId and SupplierId ", {
                        position: "top-center",
                      });
                      return;
                    }
                    setCuttingOrderFillGrid(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setCuttingOrderFillGrid(true);
                    }
                  }}
                >
                  Select
                </button>
              )} */}
            </div>
          </div>
        </div>
        <fieldset className="w-full  min-w-[1200px]">
          <CuttingDeliveryItem
            cuttingDeliveryItems={cuttingDeliveryItems}
            setCuttingDeliveryItems={setCuttingDeliveryItems}
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
