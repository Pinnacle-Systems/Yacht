import { useState, useCallback } from "react";
import { DropdownInput, TextInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { getCommonParams } from "../../../Utils/helper";
import { ReusableInput } from "../../../Utils/CommonInput";
import { useGetStockAdjustmentByIdQuery } from "../../../redux/uniformService/StockAdjustmentService";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { adjTypeData } from "../../../Utils/DropdownData";
import AdjustItems from "./AdjustItems";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";

export default function StockAdjustmentkForm({
  onClose,
  id,
  readOnly,
  setId,
  setReadOnly,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [barcodeNo, setBarcodeNo] = useState("");
  const [stockAdjustItems, setStockAdjustItems] = useState([]);

  const { companyId, userId, finYearId, branchId } = getCommonParams();

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId)
      )
    : [];

  const { data: styleList } = useGetStyleMasterQuery({
    params: {
      companyId,
    },
  });
  const { data: sizeList } = useGetSizeMasterQuery({
    params: {
      companyId,
    },
  });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStockAdjustmentByIdQuery(barcodeNo, { skip: !barcodeNo });

  const validateData = (data) => {
    if (stockAdjustItems?.length > 0 && data.storeId) {
      return true;
    }
    return false;
  };

  const data = {
    id,
    docDate,
    branchId,
    storeId,
    stockAdjustItems,
    userId,
    finYearId,
    locationId,
  };

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
      setStockAdjustItems(data?.stockAdjustItems ? data.stockAdjustItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : "");
      setStoreId(data?.storeId ? data.storeId : "");
    },
    [id]
  );

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
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    // if (nextProcess == "draft" && !id) {
    //   handleSubmitCustom(
    //     addData,
    //     { ...data, draftSave: true },
    //     "Added",
    //     nextProcess
    //   );
    // } else if (id && nextProcess == "draft") {
    //   handleSubmitCustom(
    //     updateData,
    //     { ...data, draftSave: true },
    //     "Updated",
    //     nextProcess
    //   );
    // } else if (id) {
    //   handleSubmitCustom(updateData, data, "Updated", nextProcess);
    // } else {
    //   handleSubmitCustom(addData, data, "Added", nextProcess);
    // }
  };

  return (
    <div className="">
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Stock Adjustment</h1>
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
              <ReusableInput label="Doc.Id" readOnly value={docId} />
              <ReusableInput
                label="Doc Date"
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
            {/* <h2 className="font-medium text-slate-700 mb-2">Barcode Details</h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput
                label="Barcode No"
                value={barcodeNo}
                type="text"
                readOnly={false}
                setValue={setBarcodeNo}
              />
            </div> */}
          </div>
        </div>
        <fieldset>
          <AdjustItems
            stockAdjustItems={stockAdjustItems}
            setStockAdjustItems={setStockAdjustItems}
            readOnly={readOnly}
          />
        </fieldset>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Stock Details</h2>
            <div className="grid grid-cols-3 gap-1">
              <DropdownInput
                name="Style"
                options={
                  styleList
                    ? dropDownListObject(
                        styleList?.data?.filter((item) => item.active),
                        "styleName",
                        "id"
                      )
                    : []
                }
                value={styleId}
                setValue={(value) => {
                  setStyleId(value);
                }}
                readOnly
              />
              <DropdownInput
                name="Size"
                options={
                  sizeList
                    ? dropDownListObject(
                        sizeList?.data?.filter((item) => item.active),
                        "sizeName",
                        "id"
                      )
                    : []
                }
                value={sizeId}
                setValue={(value) => {
                  setSizeId(value);
                }}
                readOnly
              />
              <TextInput name="Qty" type="text" value={qty} readOnly={true} />
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Stock Adjustment Details
            </h2>
            <div className="grid grid-cols-3 gap-1">
              <DropdownInput
                name="Adj Type"
                options={adjTypeData}
                value={adjType}
                setValue={(value) => {
                  setAdjType(value);
                }}
                readOnly={readOnly}
              />
              <TextInput
                label="Adj Qty"
                name="Adj Qty"
                value={adjQty}
                type="number"
                readOnly={readOnly}
                setValue={setAdjQty}
              />
              <TextInput
                name="New Qty"
                type="number"
                value={newQty}
                setValue={setNewQty}
                readOnly={true}
              />
            </div>
          </div>
        </div> */}
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
    </div>
  );
}
