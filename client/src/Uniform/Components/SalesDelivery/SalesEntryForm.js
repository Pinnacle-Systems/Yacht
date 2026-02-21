import { useState, useCallback, useEffect, useMemo } from "react";
import { DropdownInput, DropdownNew, TextInput } from "../../../Inputs";
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
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import { FaRegFilePdf } from "react-icons/fa";
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
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import purchaseInwardEntryApi from "../../../redux/uniformService/PurchaseInwardEntry";
import purchaseReturnApi from "../../../redux/services/PurchaseReturnService";
import BarCodePrintFormat from "./Barcode/BarcodePrintFormat";

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
  const [overAllDisc, setOverAllDisc] = useState("");
  const [roundOff, setRoundOff] = useState("");
  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const [barcodePrintOpen, setBarcodePrintOpen] = useState(false);
  const [barcodes, setBarcodes] = useState([]);
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

  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: sizeList } = useGetSizeMasterQuery({ params: { companyId } });
  const { data: colorList } = useGetColorMasterQuery({ params: { companyId } });

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId),
      )
    : [];

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [row.styleId || "", row.sizeId || "", row.colorId || ""].join(
        "-",
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
    const items = data?.salesEntryItems || [];

    // remove blank rows
    const filledItems = items.filter(
      (item) => item.styleId || item.styleItemId || item.fabricId,
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
        data?.storeId &&
        data?.customerId &&
        data?.destinationId &&
        data?.salesType &&
        data?.salesEntryItems.length > 0 &&
        isGridDatasValid(
          data?.salesEntryItems.filter((item) => item?.styleId),
          false,
          ["qty"],
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
    roundOff,
    overAllDisc,
    companyId,
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
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
      setOverAllDisc(data?.overAllDisc ? data?.overAllDisc : "");
      setRoundOff(data?.roundOff ? data?.roundOff : "");
      setBarcodes(data?.barcodes ? data?.barcodes : []);
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
    dispatch(OpeningStockApi.util.invalidateTags(["OpeningStock"]));
    dispatch(StockAdjustmentApi.util.invalidateTags(["StockAdjustment"]));
    dispatch(
      purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"]),
    );
    dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
  };

  const handlePartyChange = (selectedId, field) => {
    const selectedParty = partyList?.data?.find(
      (p) => p.id === Number(selectedId),
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

  const calculateNetAmount = (item) => {
    const qty = parseFloat(item.qty) || 0;
    const price = parseFloat(item.price) || 0;
    const taxPercent = parseFloat(item.taxPercent) || 0;
    const discountValue = parseFloat(item.discountValue) || 0;
    const discountType = item.discountType || "";

    // Gross amount
    const grossAmount = qty * price;

    // GST Subtracted
    const amountAfterGST = grossAmount - (grossAmount * taxPercent) / 100;

    // Apply Discount
    let discountAmt = 0;
    if (discountType === "Flat") discountAmt = discountValue;
    else if (discountType === "Percent")
      discountAmt = (amountAfterGST * discountValue) / 100;

    // Final net amount
    const netAmount = amountAfterGST - discountAmt;

    return netAmount.toFixed(2);
  };

  const totalNetAmount = useMemo(() => {
    return salesEntryItems
      .reduce((sum, row) => sum + (parseFloat(calculateNetAmount(row)) || 0), 0)
      .toFixed(2);
  }, [salesEntryItems]);

  const overallDiscAmt = useMemo(() => {
    const total = parseFloat(totalNetAmount) || 0;
    const disc = parseFloat(overAllDisc) || 0;

    return ((total * disc) / 100).toFixed(2);
  }, [totalNetAmount, overAllDisc]);

  const overallNetAmount = useMemo(() => {
    const total = parseFloat(totalNetAmount) || 0;
    const discAmt = parseFloat(overallDiscAmt) || 0;
    const round = parseFloat(roundOff) || 0;

    return (total - discAmt - round).toFixed(2);
  }, [totalNetAmount, overallDiscAmt, roundOff]);

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
          <Modal
            isOpen={barcodePrintOpen}
            onClose={() => setBarcodePrintOpen(false)}
            widthClass={"px-2 h-[90%] w-[90%]"}
          >
            <BarCodePrintFormat data={barcodes} />
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
          <div className="space-y-2 mt-3">
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
                    readOnly={id}
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
                            "id",
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
                      "id",
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
                    dataList={partyList?.data?.filter((item) => item.isClient)}
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
                overAllDisc={overAllDisc}
                setOverAllDisc={setOverAllDisc}
                roundOff={roundOff}
                setRoundOff={setRoundOff}
              />
            </fieldset>
            <fieldset className=" mt -0 flex gap-10 border border-slate-300 rounded-md px-3 py-1 bg-gray-50 h-16  font-medium text-slate-700 text-[14px]">
              <legend>Summary</legend>
              <div className="text-right flex gap-2 items-center">
                <p className="mb-1">Over All Disc % :</p>
                <div className="w-14 flex items-center">
                  <input
                    onKeyDown={(e) => {
                      if (
                        e.code === "Minus" ||
                        e.code === "NumpadSubtract" ||
                        e.code === 0
                      )
                        e.preventDefault();
                      if (e.key === "Delete") {
                        setOverAllDisc("");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 px-1 w-full border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400"
                    onFocus={(e) => e.target.select()}
                    value={overAllDisc}
                    onChange={(e) => setOverAllDisc(e.target.value)}
                    onBlur={(e) => {
                      setOverAllDisc(e.target.value);
                    }}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="text-right flex gap-2 items-center">
                <p className="">Discount Value :</p>
                <p className="font-semibold">{overallDiscAmt}</p>
              </div>

              <div className="text-right flex gap-2 items-center">
                <p className="">Overall Gross Amount :</p>
                <p className="font-semibold">
                  {totalNetAmount - overallDiscAmt}
                </p>
              </div>

              <div className="text-right flex gap-2 items-center">
                <p className="">Round Off :</p>
                <div className="w-24">
                  <input
                    onKeyDown={(e) => {
                      if (
                        e.code === "Minus" ||
                        e.code === "NumpadSubtract" ||
                        e.code === 0
                      )
                        e.preventDefault();
                      if (e.key === "Delete") {
                        setRoundOff("");
                      }
                    }}
                    min={"0"}
                    type="number"
                    className="text-right rounded py-1 px-1 w-full border border-slate-300 rounded-md 
          focus:border-indigo-300 focus:outline-none transition-all duration-200
          hover:border-slate-400"
                    onFocus={(e) => e.target.select()}
                    value={roundOff}
                    onChange={(e) => setRoundOff(e.target.value)}
                    onBlur={(e) => {
                      setRoundOff(e.target.value);
                    }}
                    disabled={readOnly}
                  />
                </div>
              </div>

              <div className="text-right flex gap-2 items-center">
                <p className="">Overall Net Amount :</p>
                <p className="font-semibold">{overallNetAmount}</p>
              </div>
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
                {/* <button
                  onClick={() => saveData("draft")}
                  className="bg-indigo-500 text-white px-4 py-1 rounded-md hover:bg-indigo-600 flex items-center text-sm"
                >
                  <HiOutlineRefresh className="w-4 h-4 mr-2" />
                  Draft Save
                </button> */}
              </div>
              <div className="flex gap-2 flex-wrap">
                {readOnly && (
                  <button
                    className="bg-yellow-600 text-white px-4 py-1 rounded-md hover:bg-yellow-700 flex items-center text-sm"
                    onClick={() => setReadOnly(false)}
                  >
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                <button
                  className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                  disabled={!id}
                  onClick={() => {
                    setPdfOpen(true);
                  }}
                >
                  <FaRegFilePdf className="w-4 h-4 mr-2" />
                  Pdf
                </button>
                {salesType === "RETAIL" && (
                  <button
                    className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm"
                    onClick={() => {
                      setBarcodePrintOpen(true);
                    }}
                    disabled={!id}
                  >
                    <FiPrinter className="w-4 h-4 mr-2" />
                    Barcode
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
