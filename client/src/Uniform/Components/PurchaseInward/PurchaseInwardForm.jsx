
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { poTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DateInput,
  DropdownInput,
  TextInput,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import {
  useGetPartyByIdQuery,
  useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import FabricItems from "./FabricItems";
import AccessoryInwardItems from "./AccessoryItems";
import { useAddPurchaseInwardEntryMutation, useDeletePurchaseInwardEntryMutation, useGetPurchaseInwardEntryByIdQuery, useUpdatePurchaseInwardEntryMutation } from "../../../redux/uniformService/PurchaseInwardEntry";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import PDF from "./PrintFormat/PDF";
import tw from "../../../Utils/tailwind-react-pdf";
const PurchaseInwardForm = ({ onClose, id, setId, readOnly, setReadOnly }) => {
  const [docId, setDocId] = useState("New");
  const [inwardType, setInwardType] = useState("Fabric");
  const [dcNo, setDcNo] = useState("");
  const [dcDate, setDcDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [invNo, setInvNo] = useState("")
  const [fabricInwardItems, setFabricInwardItems] = useState([]);
  const [docDate, setDocDate] = useState("")
  const { branchId, companyId, userId, finYearId } = getCommonParams();
  const branchIdFromApi = useRef(branchId);
  const [pdfOpen, setPdfOpen] = useState(false);
  const params = {
    branchId,
    companyId,
  };

  const { data: partyList } = useGetPartyQuery({ params: { ...params } });
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

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPurchaseInwardEntryByIdQuery(id, { skip: !id });

  const [addData] = useAddPurchaseInwardEntryMutation();
  const [updateData] = useUpdatePurchaseInwardEntryMutation();
  const [removeData] = useDeletePurchaseInwardEntryMutation();

  const isFabric = inwardType === "Fabric"

  const data = {
    docId,
    docDate,
    inwardType,
    supplierId,
    dcDate,
    branchId,
    id,
    userId,
    storeId,
    fabricInwardItems: isFabric ?
      fabricInwardItems?.filter((item) => item.styleId) : fabricInwardItems?.filter((item) => item.accessoryId)
    ,
    dcNo,
    finYearId,
    locationId,
    vehicleNo,
    remarks,
    invNo
  };

  function getTotalQty() {
    let qty = 0;
    if (inwardType.toLowerCase().includes("fabric")) {
      qty = fabricInwardItems?.reduce((acc, curr) => {
        const qtyValue = parseFloat(curr?.noOfPcs) || 0; // safer parsing
        return acc + qtyValue;
      }, 0);
    } else {
      qty = fabricInwardItems?.reduce((acc, curr) => {
        const qtyValue = parseFloat(curr?.qty) || 0;
        return acc + qtyValue;
      }, 0);
    }

    return qty || 0; // ensure it returns 0 if undefined or NaN
  }

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setInwardType(data?.inwardType ? data.inwardType : "Fabric");
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setDcDate(
        data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : ""
      );
      setDcNo(data?.dcNo ? data.dcNo : "");
      setLocationId(data?.Store ? data.Store.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      if (data?.branchId) {
        branchIdFromApi.current = data?.branchId;
      }
      setFabricInwardItems(data?.fabricInwardItems ? data.fabricInwardItems : []);
      setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
      setRemarks(data?.remarks ? data.remarks : "");
      setInvNo(data?.invNo ? data?.invNo : "")
    },
    [id]
  );

  const handleSubmitCustom = async (callback, data, text, nextProcess) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === 'fabricInwardItems') {
          formData.append(key, JSON.stringify(data[key].map(i => ({ ...i, filePath: (i.filePath instanceof File) ? i.filePath.name : "" }))));
          data[key].forEach(option => {
            if (option?.filePath instanceof File) {
              formData.append('images', option.filePath);
              console.log(formData?.images, "formData")
            }
          });
        } else {
          formData.append(key, data[key]);
        }
      }
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
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

  const hasDuplicates = (items) => {
    const seen = new Set();

    for (const row of items) {
      const key = [
        row.styleId || "",
        row.portionId || "",
        row.accessoryId || "",
        row.sizeId || ""
      ].join("-");

      if (seen.has(key)) {
        return true; // duplicate found
      }

      seen.add(key);
    }

    return false;
  };


  const validateData = (data) => {
    const items = data?.fabricInwardItems || [];
    const filledItems = items.filter(
      (item) =>
        item.styleId ||
        item.fabricId ||
        item.accessoryId
    );
    if (hasDuplicates(filledItems)) {
      toast.info("Duplicate items found!", {
        position: "top-center",
        autoClose: 2000,
      });
      return false;
    }
    if (!(data?.storeId && data?.supplierId && data?.invNo && (isFabric ? isGridDatasValid(data?.fabricInwardItems.filter((item) => item?.styleId), false, ["fabricId", "fabWidth", "fabMeter", "portionId"]) : isGridDatasValid(data?.fabricInwardItems.filter((item) => item?.accessoryId), false, ["sizeId", "qty"]))
      && data?.fabricInwardItems.length > 0)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return false
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
  };

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PDF singleData={singleData?.data} branchList={branchList} />
        </PDFViewer>
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold text-gray-800">Purchase Inward</h1>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-700"
            title="Open Report"
          >
            <FaFileAlt className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="space-y-3  mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Basic Details</h2>
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Purchase Inward No" readOnly value={docId} />
              <ReusableInput
                label="Purchase Inward Date"
                value={docDate}
                type={"date"}
                required={true}
                readOnly={true}
                disabled
              />
              <DropdownInput
                name="Inward Type"
                options={poTypes}
                value={inwardType}
                setValue={setInwardType}
                required={true}
                readOnly={id}
                beforeChange={() => {
                  setFabricInwardItems([]);
                }}
                autoFocus={true}
              />
              <TextInput
                name={"Invoice No"}
                value={invNo}
                setValue={setInvNo}
                readOnly={readOnly}
                required
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">Supplier Details</h2>
            <div className="grid grid-cols-2 gap-1">
              <TextInput
                name={"Dc No"}
                value={dcNo}
                setValue={setDcNo}
                readOnly={readOnly}
                required
              />
              <DateInput
                name="Dc Date"
                value={dcDate}
                setValue={setDcDate}
                required={true}
                readOnly={readOnly}
              />
              <DropdownInput
                name="Supplier"
                options={
                  partyList
                    ? dropDownListObject(
                      id
                        ? partyList?.data
                        : partyList?.data?.filter((item) => item.isSupplier),
                      "name",
                      "id"
                    )
                    : []
                }
                value={supplierId}
                setValue={(value) => {
                  setSupplierId(value);
                }}
                required={true}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <div className="grid grid-cols-1 gap-1">
              <h2 className="font-medium text-slate-700 mb-2">Location Details</h2>
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
                />
              </div>
            </div>
          </div>
        </div>
        <fieldset>
          {
            inwardType.toLowerCase().includes("fabric") ? (
              <FabricItems
                id={id}
                inwardType={inwardType}
                params={params}
                fabricInwardItems={fabricInwardItems}
                setFabricInwardItems={setFabricInwardItems}
                readOnly={readOnly}
              />
            ) : (
              <AccessoryInwardItems
                id={id}
                inwardType={inwardType}
                params={params}
                fabricInwardItems={fabricInwardItems}
                setFabricInwardItems={setFabricInwardItems}
                readOnly={readOnly}
              />
            )}
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-medium text-slate-700 mb-2 text-base">
              Vehicle No
            </h2>
            <textarea
              readOnly={readOnly}
              value={vehicleNo}
              onChange={(e) => {
                setVehicleNo(e.target.value);
              }}
              className="w-full overflow-auto h-14 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Vehicle Details..."
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
              className="w-full  overflow-auto h-14 px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional remarks..."
              disabled={readOnly}
            />
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md  shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-2 text-base">
              Summary
            </h2>

            <div className="space-y-1.5">
              {inwardType === "Fabric" && (
                <div className="flex justify-between  text-sm">
                  <span className="text-slate-600">Total Meters</span>
                  <span className="font-medium">
                    {fabricInwardItems.reduce(
                      (sum, row) => sum + (Number(row.fabMeter) || 0),
                      0
                    ).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between  text-sm">
                <span className="text-slate-600">{inwardType === "Fabric" ? "Total Rolls" : "Total Qty"}</span>
                <span className="font-medium">
                  {parseInt(getTotalQty()).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 justify-between mt-4">
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
            {/* <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
              <FiShare2 className="w-4 h-4 mr-2" />
              Email
            </button> */}
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
  );
};

export default PurchaseInwardForm;
