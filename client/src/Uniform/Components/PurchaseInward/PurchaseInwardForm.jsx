import React from "react";
import Modal from "../../../UiComponents/Modal";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { directOrPo, poTypes } from "../../../Utils/DropdownData";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DateInput,
  DropdownInput,
  ReusableSearchableInput,
  TextInput,
} from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import {
  useGetPartyByIdQuery,
  useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { getCommonParams } from "../../../Utils/helper";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh, HiX } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import {
  useAddDirectInwardOrReturnMutation,
  useDeleteDirectInwardOrReturnMutation,
  useUpdateDirectInwardOrReturnMutation,
} from "../../../redux/uniformService/DirectInwardOrReturnServices";

const PurchaseInwardForm = ({ onClose, id, setId }) => {
  const [docId, setDocId] = useState("");
  const [date, setDate] = useState("");
  const [readOnly, setReadOnly] = useState("");
  const [transType, setTransType] = useState("GreyYarn");
  const [dcNo, setDcNo] = useState("");
  const [dcDate, setDcDate] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] =
    useState("DirectInward");
  const [inwardItemSelection, setInwardItemSelection] = useState(false);
  const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
  const [term, setTerm] = useState("");
  const [notes, setNotes] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [partyId, setPartyId] = useState("");
  const [suppliers, setSuppliers] = useState([
    "Supplier One",
    "Supplier Two",
    "Supplier Three",
  ]);

  const { branchId, companyId, userId, finYearId } = getCommonParams();
  const branchIdFromApi = useRef(branchId);

  const params = {
    branchId,
    companyId,
  };
  const { data: payTermList } = useGetPaytermMasterQuery({
    params: { ...params },
  });
  const { data: supplierList } = useGetPartyQuery({ params: { ...params } });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });
  const { data: supplierDetails } = useGetPartyByIdQuery(supplierId, {
    skip: !supplierId,
  });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId)
      )
    : [];

  const [addData] = useAddDirectInwardOrReturnMutation();
  const [updateData] = useUpdateDirectInwardOrReturnMutation();
  const [removeData] = useDeleteDirectInwardOrReturnMutation();

  const data = {
    docId,
    poType: transType,
    poInwardOrDirectInward,
    supplierId,
    dcDate,
    payTermId,
    branchId,
    id,
    userId,
    storeId,
    directInwardReturnItems,
    dcNo,
    finYearId,
  };

  const handleAddSupplier = (newName) => {
    if (!suppliers.includes(newName)) {
      setSuppliers([...suppliers, newName]);
    }
  };

  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU";
    }
    return false;
  }

  function getTotalQty() {
    let qty = directInwardReturnItems?.reduce((acc, curr) => {
      const qtyValue = parseFloat(curr?.qty) || 0; // safer parsing
      return acc + qtyValue;
    }, 0);

    return qty || 0; // ensure it returns 0 if undefined or NaN
  }
  function getTotalAmt() {
    let amt = directInwardReturnItems?.reduce((acc, item) => {
      const price = parseFloat(item?.price) || 0;
      const qty = parseFloat(item?.qty) || 0;
      return acc + price * qty;
    }, 0);
    return amt || 0;
  }

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      if (id) {
        setReadOnly(true);
      } else {
        setReadOnly(false);
      }
      setTransType(data?.poType ? data.poType : "GreyYarn");
      setPoInwardOrDirectInward(
        data?.poInwardOrDirectInward
          ? data?.poInwardOrDirectInward
          : "DirectInward"
      );
      setDate(
        data?.createdAt
          ? moment.utc(data.createdAt).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setDirectInwardReturnItems(data?.DirectItems ? data.DirectItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      if (data?.date) setDate(data?.date);
      setPayTermId(data?.payTermId ? data?.payTermId : "");
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setDcDate(
        data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : ""
      );
      setDcNo(data?.dcNo ? data.dcNo : "");
      setLocationId(data?.Store ? data.Store.locationId : "");
      setStoreId(data?.storeId ? data.storeId : "");
      if (data?.branchId) {
        branchIdFromApi.current = data?.branchId;
      }
    },
    [id]
  );

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      if (returnData.statusCode === 1) {
        toast.error(returnData.message);
      } else {
        toast.success(text + "Successfully");
        setId("");
        syncFormWithDb(undefined);
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = (nextProcess) => {
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (nextProcess == "draft" && !id) {
      handleSubmitCustom(
        addData,
        (data = { ...data, draftSave: true }),
        "Added",
        nextProcess
      );
    } else if (id && nextProcess == "draft") {
      handleSubmitCustom(
        updateData,
        (data = { ...data, draftSave: true }),
        "Updated",
        nextProcess
      );
    } else if (id) {
      handleSubmitCustom(updateData, data, "Updated", nextProcess);
    } else {
      handleSubmitCustom(addData, data, "Added", nextProcess);
    }
  };

  return (
    <>
      <Modal
        isOpen={inwardItemSelection}
        onClose={() => setInwardItemSelection(false)}
        widthClass={"w-[95%] h-[90%] py-10"}
      >
        {/* <PoItemsSelection
          setInwardItemSelection={setInwardItemSelection}
          transtype={transType}
          supplierId={supplierId}
          inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems}
        /> */}
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-2xl font-bold text-gray-800">Purchse Inward </h1>
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
            <div className="grid grid-cols-2 gap-1">
              <ReusableInput label="Doc. Id" readOnly value={docId} />
              <ReusableInput
                label="Doc Date"
                value={date}
                type={"date"}
                required={true}
                readOnly={true}
                disabled
              />
              <DropdownInput
                name="Inward Type"
                beforeChange={() => {
                  setDirectInwardReturnItems([]);
                }}
                options={directOrPo}
                value={poInwardOrDirectInward}
                setValue={setPoInwardOrDirectInward}
                required={true}
                readOnly={readOnly}
              />
              <DropdownInput
                name="Po Type"
                options={poTypes}
                value={transType}
                setValue={setTransType}
                required={true}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2"></h2>
            <div className="grid grid-cols-2 gap-1">
              <TextInput
                name={"Dc No."}
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
                name="Pay Terms"
                options={dropDownListObject(
                  payTermList ? payTermList?.data : [],
                  "name",
                  "id"
                )}
                value={payTermId}
                setValue={(value) => {
                  setPayTermId(value);
                }}
                required={true}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2"></h2>
            <div className="grid grid-cols-1 gap-1">
              <div className="grid grid-cols-1">
                <ReusableSearchableInput
                  label="Supplier Id"
                  component="PartyMaster"
                  placeholder="Search Customer Id..."
                  optionList={supplierList?.data}
                  onAddItem={handleAddSupplier}
                  // onDeleteItem={onDeleteItem}
                  setSearchTerm={setSupplierId}
                  searchTerm={supplierId}
                />
              </div>
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
                  // readOnly={ readOnly}
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
                  // readOnly={id || readOnly}
                />
              </div>
              {!readOnly && poInwardOrDirectInward == "PurchaseInward" && (
                <div className="mt-5">
                  <button
                    className="p-1.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
                    onClick={() => {
                      // if (!supplierId) {
                      //     toast.info("Please Select Suppplier", { position: "top-center" })
                      //     return
                      // }
                      setInwardItemSelection(true);
                    }}
                  >
                    Select Items
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <fieldset>
          {poInwardOrDirectInward == "DirectInward" &&
            (transType.toLowerCase().includes("fabric") ? (
              <FabricPoItems
                id={id}
                transType={transType}
                params={params}
                poItems={directInwardReturnItems}
                setPoItems={setDirectInwardReturnItems}
                readOnly={readOnly}
                isSupplierOutside={isSupplierOutside()}
              />
            ) : (
              //   <AccessoryPoItems
              //     poItems={directInwardReturnItems}
              //     setPoItems={setDirectInwardReturnItems}
              //     //  id={id} transType={transType}  params={params}  readOnly={readOnly} isSupplierOutside={isSupplierOutside()}
              //   />
              <></>
            ))}

          {/* {poInwardOrDirectInward == "PurchaseInward" &&
            (transType.toLowerCase().includes("yarn") ? (
              <YarnInwardPoItems
                inwardItems={directInwardReturnItems}
                setInwardItems={setDirectInwardReturnItems}
                removeItem={removeItem}
                transType={transType}
                purchaseInwardId={id}
                params={params}
                readOnly={readOnly}
                isSupplierOutside={isSupplierOutside()}
              />
            ) : transType.toLowerCase().includes("fabric") ? (
              // <FabricPoItems
              // greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()}
              // />
              <></>
            ) : (
              <AccessoryInwardItems
                inwardItems={directInwardReturnItems}
                setInwardItems={setDirectInwardReturnItems}
                readOnly={readOnly}
                //  id={id} transType={transType} taxTypeId={taxTemplateId} params={params}  isSupplierOutside={isSupplierOutside()}
              />
            ))} */}
        </fieldset>

        <div className="grid grid-cols-3 gap-3">
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm">
            <h2 className="font-medium text-slate-700 mb-2 text-base">
              Terms & Conditions
            </h2>
            <textarea
              readOnly={readOnly}
              value={term}
              onChange={(e) => {
                setTerm(e.target.value);
              }}
              className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm ">
            <h2 className="font-medium text-slate-700 mb-2 text-base">
              Remarks
            </h2>
            <textarea
              readOnly={readOnly}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
              }}
              className="w-full h-20 overflow-auto px-2.5 py-2 text-xs border border-slate-300 rounded-md  focus:ring-1 focus:ring-indigo-200 focus:border-indigo-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="border border-slate-200 p-2 bg-white rounded-md  shadow-sm">
            <h2 className="font-semibold text-slate-800 mb-2 text-base">
              Summary
            </h2>

            <div className="space-y-1.5">
              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-600">Total Qty</span>
                <span className="font-medium">
                  {parseInt(getTotalQty()).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between py-1 text-sm">
                <span className="text-slate-600">Total Amt</span>
                <span className="font-medium">
                  {parseInt(getTotalAmt()).toFixed(2)}
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
            <button className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm">
              <FiPrinter className="w-4 h-4 mr-2" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchaseInwardForm;
