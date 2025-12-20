import { useState, useCallback, useEffect } from "react";
import { DropdownInput, DropdownNew, TextInput } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { ReusableInput } from "../../../Utils/CommonInput";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import BillItems from "./SalesEntrytems";
import {
  useAddSalesEntryMutation,
  useGetSalesEntryByIdQuery,
  useGetSalesEntryQuery,
  useUpdateSalesEntryMutation,
} from "../../../redux/uniformService/SalesEntryService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { useGetTaxTemplateQuery } from "../../../redux/services/TaxTemplateServices";
import { PDFViewer } from "@react-pdf/renderer";
import Modal from "../../../UiComponents/Modal";
import tw from "../../../Utils/tailwind-react-pdf";
import PDF from "./PrintFormat/PDF";
import { salesTypes } from "../../../Utils/DropdownData";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import { useDispatch } from "react-redux";
import OpeningStockApi from "../../../redux/uniformService/OpeningStockService";
import StockAdjustmentApi from "../../../redux/uniformService/StockAdjustmentService";
import { Loader } from "../../../Basic/components";

export function SalesBillForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
  isSingleFetching,
  isSingleLoading,
  singleData,
}) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [salesEntryItems, setSalesEntryItems] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [salesType, setSalesType] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const dispatch = useDispatch();
  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: partyList } = useGetPartyQuery({
    params: { companyId },
    searchParams: searchValue,
  });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });

  const { data: cityList } = useGetCityQuery({
    params: { companyId },
  });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId)
      )
    : [];

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
    const items = data?.salesEntryItems || [];

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
    if (
      !(
        data?.storeId &&
        data?.customerId &&
        data?.destinationId &&
        data?.salesType &&
        data?.salesEntryItems.length > 0 &&
        isGridDatasValid(
          data?.salesEntryItems.filter((item) => item?.styleId),
          false,
          ["qty"]
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

  // const {
  //   data: singleData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetSalesEntryByIdQuery(id, { skip: !id });

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetSalesEntryQuery({
    params: {
      branchId,
    },
  });

  const data = {
    id,
    docDate,
    branchId,
    storeId,
    salesEntryItems: salesEntryItems?.filter((item) => item?.styleId),
    userId,
    finYearId,
    locationId,
    customerId,
    contactPerson,
    contactNumber,
    destinationId,
    salesType,
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setSalesEntryItems(data?.SalesEntryItems ? data.SalesEntryItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setCustomerId(data?.customerId ? data?.customerId : "");
      setContactNumber(data?.contactNumber ? data?.contactNumber : "");
      setContactPerson(data?.contactPerson ? data?.contactPerson : "");
      setDestinationId(data?.destinationId ? data?.destinationId : "");
      setSalesType(data?.salesType ? data?.salesType : "");
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

  const [addData] = useAddSalesEntryMutation();
  const [updateData] = useUpdateSalesEntryMutation();

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
    dispatch(StockAdjustmentApi.util.invalidateTags(["StockAdjustment"]));
  };

  const handlePartyChange = (selectedId, field) => {
    const selectedParty = partyList?.data?.find(
      (p) => p.id === Number(selectedId)
    );

    if (field === "customer") {
      setCustomerId(selectedParty?.id);
      setContactNumber(selectedParty?.contactNumber);
      setContactPerson(selectedParty?.contactPersonName || "");
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

  return (
    <>
      {isLoadingIndicator ? (
        <Loader />
      ) : (
        <div className="" onKeyDown={handleKeyDown}>
          <Modal
            isOpen={pdfOpen}
            onClose={() => setPdfOpen(false)}
            widthClass={"w-[90%] h-[90%]"}
          >
            <PDFViewer style={tw("w-full h-full")}>
              <PDF singleData={singleData?.data} allData={allData?.data} />
            </PDFViewer>
          </Modal>
          <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-xl font-bold text-gray-800">
                Sales Delivery
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
                    label="Sales Delivery No"
                    readOnly
                    value={docId}
                  />
                  <ReusableInput
                    label="Sales Delivery Date"
                    value={docDate}
                    type={"date"}
                    required={true}
                    readOnly={true}
                    disabled
                  />
                  <DropdownInput
                    name="Sales Type"
                    options={salesTypes}
                    value={salesType}
                    setValue={setSalesType}
                    required={true}
                    readOnly={readOnly}
                    autoFocus={true}
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
                    dataList={partyList?.data?.filter((item) => item.active)}
                    value={customerId}
                    setValue={(value) => {
                      setCustomerId(value);
                    }}
                    required={true}
                    disabled={readOnly}
                    placeholder={"Select Contact Person"}
                  />
                  <ReusableInput
                    label="Contact Person"
                    value={contactPerson}
                    type={"text"}
                    readOnly={true}
                    disabled
                  />
                  <ReusableInput
                    label="Contact Number"
                    value={contactNumber}
                    type={"text"}
                    readOnly={true}
                    disabled
                  />
                  <DropdownNew
                    name="Destination"
                    dataList={cityList?.data?.filter((item) => item.active)}
                    value={destinationId}
                    setValue={(value) => {
                      setDestinationId(value);
                    }}
                    required={true}
                    disabled={readOnly}
                    placeholder={"Select Destination"}
                  />
                </div>
              </div>
            </div>
            <fieldset className="w-full  min-w-[1200px]">
              <BillItems
                salesEntryItems={salesEntryItems}
                setSalesEntryItems={setSalesEntryItems}
                readOnly={readOnly}
                branchId={branchId}
                storeId={storeId}
                // taxTemplateId={taxTemplateId}
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
