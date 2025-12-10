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
import {
  useAddSalesReturnMutation,
  useGetSalesReturnByIdQuery,
  useUpdateSalesReturnMutation,
} from "../../../redux/uniformService/SalesReturnService";
import SalesItems from "./SalesItems";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import Modal from "../../../UiComponents/Modal";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import PDF from "./PrintFormat/PDF";
import {
  useGetSalesEntryQuery,
  useLazyGetSalesInvDetailQuery,
} from "../../../redux/uniformService/SalesEntryService";
export default function SalesReturnForm({
  onClose,
  id,
  setId,
  readOnly,
  setReadOnly,
}) {
  const [searchValue, setSearchValue] = useState("");
  const [docId, setDocId] = useState("New");
  const [docDate, setDocDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [salesReturnItems, setSalesReturnItems] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [pdfOpen, setPdfOpen] = useState("");
  const [invNo, setInvNo] = useState("");
  const [getSalesInvDetail] = useLazyGetSalesInvDetailQuery();

  const { companyId, userId, finYearId, branchId } = getCommonParams();

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });

  const { data: partyList } = useGetPartyQuery({ params: { companyId } });
  const { data: salesList } = useGetSalesEntryQuery({
    params: { companyId, branchId },
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
    const items = data?.salesReturnItems || [];

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
        data?.salesReturnItems.length > 0 &&
        isGridDatasValid(
          data?.salesReturnItems.filter((item) => item?.styleId),
          false,
          ["returnQty"]
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
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetSalesReturnByIdQuery(id, { skip: !id });

  const data = {
    id,
    docDate,
    branchId,
    storeId,
    salesReturnItems: salesReturnItems?.filter((item) => item?.styleId),
    userId,
    finYearId,
    locationId,
    customerId,
    invNo,
  };

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      setSalesReturnItems(data?.salesReturnItems ? data.salesReturnItems : []);
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setCustomerId(data?.customerId ? data?.customerId : "");
      setInvNo(data?.invNo ? data?.invNo : "");
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

  const [addData] = useAddSalesReturnMutation();
  const [updateData] = useUpdateSalesReturnMutation();

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
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const handleAddRow = async (newValue) => {
    setInvNo(newValue);
    if (!storeId) {
      toast.info("Please Choose Location...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    try {
      const { data: salesData } = await getSalesInvDetail({
        params: {
          invNo: newValue,
          storeId,
          branchId,
        },
      });
      setCustomerId(salesData?.data?.customerId);
      const salesItems = salesData?.data?.SalesEntryItems;
      if (!salesItems) return;
      setSalesReturnItems((prev) => {
        const updated = [...prev];
        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) =>
            !row.styleId &&
            !row.sizeId &&
            !row.styleNo &&
            !row.fabricId &&
            !row.barcode
        );
        if (startIndex === -1) startIndex = updated.length;

        // Fill in sizeRows starting at first empty slot
        salesItems.forEach((row, i) => {
          if (startIndex + i < updated.length) {
            updated[startIndex + i] = row;
          } else {
            updated.push(row); // append if no empty slot
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
            stkQty: "",
            barcode: "",
            styleItemId: "",
            colorId: "",
            selected: false,
          });
        }

        return updated;
      });
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  return (
    <div className="" onKeyDown={handleKeyDown}>
      <Modal
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PDF singleData={singleData?.data} />
        </PDFViewer>
      </Modal>
      <div className="w-full bg-[#f1f1f0] mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto">
        <div className="flex justify-between items-center mb-1">
          <h1 className="text-xl font-bold text-gray-800">Sales Return</h1>
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
              <ReusableInput label="Sales Return no" readOnly value={docId} />
              <ReusableInput
                label="Sales Return Date"
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
              <DropdownNew
                name="Branch"
                dataList={branchList?.data?.filter((item) => item.active)}
                value={locationId}
                setValue={(value) => {
                  setLocationId(value);
                  setStoreId("");
                }}
                required={true}
                disabled={id}
                otherField={"branchName"}
                placeholder={"Select Branch"}
              />
              <DropdownNew
                name="Location"
                dataList={storeOptions?.filter((item) => item.active)}
                value={storeId}
                setValue={setStoreId}
                required={true}
                disabled={id}
                otherField={"storeName"}
                placeholder={"Select Location"}
                autoFocus={true}
              />
            </div>
          </div>
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
            <h2 className="font-medium text-slate-700 mb-2">
              Sales Delivery Details
            </h2>
            <div className="grid grid-cols-2 gap-1">
              <DropdownNew
                name="Sales Delivery No"
                dataList={salesList?.data}
                value={invNo}
                setValue={handleAddRow}
                required={true}
                readOnly={readOnly}
                placeholder={"Select Sales"}
                otherField={"docId"}
                otherValue={"docId"}
                disabled={id}
              />
              <DropdownNew
                name="Customer"
                dataList={partyList?.data?.filter((item) => item.active)}
                value={customerId}
                setValue={(value) => {
                  setCustomerId(value);
                }}
                required={true}
                disabled={id}
                placeholder={"Select Customer"}
                clear={true}
              />
            </div>
          </div>
        </div>
        <fieldset className="w-full  min-w-[1200px]">
          <SalesItems
            salesReturnItems={salesReturnItems}
            setSalesReturnItems={setSalesReturnItems}
            readOnly={readOnly}
            branchId={branchId}
            storeId={storeId}
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
  );
}
