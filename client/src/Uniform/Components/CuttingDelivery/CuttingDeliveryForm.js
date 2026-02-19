import { useCallback, useEffect, useRef, useState } from "react";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import { CustomDropdown, DropdownInput, DropdownNew } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
  isRowEmpty,
  params,
} from "../../../Utils/helper";
import { useGetLocationMasterQuery } from "../../../redux/uniformService/LocationMasterServices";
import { FiEdit2, FiPrinter, FiSave } from "react-icons/fi";
import Swal from "sweetalert2";
import { HiOutlineRefresh } from "react-icons/hi";
import moment from "moment";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import StyleMasterApi, {
  useGetStyleMasterQuery,
} from "../../../redux/uniformService/StyleMasterService.js";
import CuttingDeliveryItem from "./CuttingDeliveryItem.jsx";
import {
  useAddCuttingDeliveryMutation,
  useGetCuttingDeliveryByIdQuery,
  useGetCuttingDeliveryQuery,
  useUpdateCuttingDeliveryMutation,
} from "../../../redux/uniformService/CuttingDeliveryServices.js";
import { useLazyGetOrderDetailsQuery } from "../../../redux/uniformService/CuttingOrderService.js";
import { inHouseOutsideTypes } from "../../../Utils/DropdownData.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices.js";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useLazyGetFabricDetailQuery } from "../../../redux/services/MaterialStockService.js";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices.js";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService.js";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService.js";
import PDF from "./PrintFormat-CD/PDF.jsx";
import Modal from "../../../UiComponents/Modal/index.js";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf.js";
import { useGetProcessGroupMasterQuery } from "../../../redux/uniformService/ProcessGroupMasterServices.js";
import purchaseInwardEntryApi from "../../../redux/uniformService/PurchaseInwardEntry.js";
import purchaseReturnApi from "../../../redux/services/PurchaseReturnService.js";
import ProductionDeliveryApi from "../../../redux/uniformService/ProductionDeliveryServices.js";
import { Loader } from "../../../Basic/components/index.js";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService.js";

export default function CuttingDeliveryForm({
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
  const [cuttingDeliveryItems, setCuttingDeliveryItems] = useState([]);
  const [styleId, setStyleId] = useState("");
  const [cuttingNo, setCuttingNo] = useState("");
  const [productionType, setProductionType] = useState("");
  const [fromProcessId, setFromProcessId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();
  const firstUpdate = useRef(true);
  const [sizeTemplateId, setSizeTemplateId] = useState("");
  const [pdfOpen, setPdfOpen] = useState("");
  const [sizeColumns, setSizeColumns] = useState([]);
  const [processGroupId, setProcessGroupId] = useState("");
  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const dispatch = useDispatch();

  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const params = {
    branchId,
    companyId,
  };
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: processList } = useGetProcessMasterQuery({
    params: { companyId },
  });
  const { data: supplierList } = useGetPartyQuery({
    params: { companyId },
  });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({
    params: { companyId },
  });

  const { data: locationData } = useGetLocationMasterQuery({
    params: { branchId },
    searchParams: searchValue,
  });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: employeeList } = useGetEmployeeQuery({
    params: {
      companyId,
    },
  });
  const { data: processGroupList } = useGetProcessGroupMasterQuery({
    params: { companyId },
  });
  const { data: portionList } = useGetPortionMasterQuery({
    params: { companyId },
  });

  // const {
  //   data: singleData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetCuttingDeliveryByIdQuery(id, { skip: !id });

  const {
    data: allData,
    isFetching,
    isLoading,
  } = useGetCuttingDeliveryQuery({
    params: {
      branchId,
    },
  });

  const [getFabricDetail] = useLazyGetFabricDetailQuery();

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD"),
      );
      setCuttingDeliveryItems(
        data?.cuttingDeliveryItems ? data.cuttingDeliveryItems : [],
      );
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setLocationId(data?.locationId ? data?.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
      setStyleId(data?.styleId ? data?.styleId : "");
      setCuttingNo(data?.cuttingNo ? data?.cuttingNo : "");
      setProductionType(
        data?.productionType ? data?.productionType : "INHOUSE",
      );
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setFromProcessId(data?.fromProcessId ? data?.fromProcessId : "");
      setSizeTemplateId(data?.sizeTemplateId ? data?.sizeTemplateId : "");
      setEmployeeId(data?.employeeId ? data?.employeeId : "");
      setProcessGroupId(data?.processGroupId ? data?.processGroupId : "");
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

  const [addData] = useAddCuttingDeliveryMutation();
  const [updateData] = useUpdateCuttingDeliveryMutation();
  const [getOrderDetail] = useLazyGetOrderDetailsQuery();

  const storeOptions = locationData
    ? locationData.data.filter(
        (item) => parseInt(item.locationId) === parseInt(locationId),
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
        dispatch(
          purchaseInwardEntryApi.util.invalidateTags(["purchaseInwardEntry"]),
        );
        dispatch(purchaseReturnApi.util.invalidateTags(["PurchaseReturn"]));
        dispatch(
          ProductionDeliveryApi.util.invalidateTags(["ProductionDelivery"]),
        );
      } else {
        toast.error(returnData?.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.log("handle");
    }
  };

  // const validateData = (data) => {
  //   if (
  //     cuttingDeliveryItems?.length > 0 &&
  //     data.styleId &&
  //     data?.cuttingNo &&
  //     data?.productionType &&
  //     data?.fromProcessId
  //   ) {
  //     return true;
  //   }
  //   return false;
  // };

  const isOutside = productionType === "OUTSIDE";

  const validRows = cuttingDeliveryItems.filter((row) => !isRowEmpty(row));
  const data = {
    id,
    docDate,
    branchId,
    cuttingDeliveryItems: cuttingDeliveryItems?.filter((item) => item?.styleId),
    userId,
    finYearId,
    styleId,
    cuttingNo,
    productionType,
    supplierId,
    fromProcessId,
    sizeTemplateId,
    storeId,
    locationId,
    employeeId,
    processGroupId,
  };

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [row.portionId || ""].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          portionId: row.portionId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  const validateData = (data) => {
    const items = data?.cuttingDeliveryItems || [];
    const filledItems = items.filter(
      (item) =>
        item.styleId || item.fabricId || item.portionId || item.styleItemId,
    );
    const duplicates = findDuplicates(filledItems);
    // duplicate check
    if (duplicates.length > 0) {
      const dup = duplicates[0]; // show first duplicate
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item Found",
        html: `
             Portion - ${findFromList(
               dup?.portionId,
               portionList?.data,
               "name",
             )},
             Rows - ${dup.firstIndex + 1} & ${dup.duplicateIndex + 1}
           `,
        confirmButtonText: "OK",
      });
      return false;
    }
    if (
      !(
        (isOutside ? data?.supplierId : true) &&
        data.styleId &&
        data.processGroupId &&
        data?.productionType &&
        data?.employeeId &&
        data?.fromProcessId &&
        isGridDatasValid(
          data?.cuttingDeliveryItems?.filter((item) => item.styleId),
          false,
          ["issueQty", "usedMeter", "styleId", "styleItemId"],
        ) &&
        data?.cuttingDeliveryItems.length > 0
      )
    ) {
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
      const existingItems =
        allData?.data?.flatMap((d) => d.cuttingDeliveryItems || []) || [];
      console.log(allData?.data, "allData");
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
  };

  // useEffect(() => {
  //   if (firstUpdate.current) {
  //     firstUpdate.current = false;
  //     return; // skip on first render
  //   }
  //   // Call the function whenever styleId changes
  //   if (id) return;

  //   // 🚫 block when readOnly mode
  //   if (readOnly) return;
  //   handleAddRow();
  // }, [styleId, id, readOnly]);

  const handleAddRow = async (newValue) => {
    if (!storeId) {
      toast.info("Please Choose Location...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    if (!newValue) return;
    setStyleId(newValue);
    const hasUnfilledRequired = cuttingDeliveryItems.some((row) => {
      return row.fabricId && !row.usedMeter;
    });

    if (hasUnfilledRequired) {
      toast.info("Please fill all required fields before adding...!", {
        position: "top-center",
      });
      return;
    }
    try {
      const style = styleList?.data.find((item) => item.id === newValue);
      setSizeTemplateId(style?.sizeTemplateId);
      const { data: orderData } = await getOrderDetail({
        params: {
          styleId: newValue,
          branchId,
          storeId: storeId,
        },
      });
      let docId = "";
      if (orderData.statusCode === 1) {
        setCuttingNo("");
        docId = "";
      } else {
        docId = orderData?.data?.docId;
      }
      setCuttingNo(docId);
      const isCuttingNull = !docId;
      console.log(isCuttingNull, "isCuttingNull");
      const fabricItems = orderData?.data?.cuttingOrderItems;
      const { data: fabricData } = await getFabricDetail({
        params: {
          styleId: newValue,
          branchId,
          storeId: storeId,
        },
      });
      const fabricDetails = fabricData?.data;
      if (!fabricDetails) return;

      setCuttingDeliveryItems((prev) => {
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
            !row.remarks,
        );
        if (startIndex === -1) startIndex = updated.length;

        if (isCuttingNull) {
          fabricDetails?.forEach((item, i) => {
            const cloned = structuredClone(item);

            if (startIndex + i < updated.length) {
              updated[startIndex + i] = cloned;
            } else {
              updated.push(cloned);
            }
          });
        } else {
          fabricItems.forEach((item, i) => {
            const detail = fabricDetails.find(
              (f) =>
                f.styleId === item.styleId && f.portionId === item.portionId,
            );
            const newRow = {
              ...item,
              fabWidth: detail?.fabWidth || "",
              fabMeter: detail?.fabMeter || "",
            };
            if (startIndex + i < updated.length) {
              updated[startIndex + i] = newRow;
            } else {
              updated.push(newRow);
            }
          });
        }

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
            selected: "",
            invNo: "",
          });
        }

        return updated;
      });
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const getSizeTemplate = async () => {
    if (!sizeTemplateId) return;

    const { data: sizeData } = await styleTemplateDetail(sizeTemplateId);

    if (!sizeData?.data?.SizeTemplateList?.length) return;

    const columns = sizeData.data.SizeTemplateList.map((s) => ({
      sizeId: s.sizeId,
      sizeName: s.Size?.name,
    }));
    setSizeColumns(columns);
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
                Cutting Production Entry
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
                    label="Cutting Production No"
                    readOnly
                    value={docId}
                  />
                  <ReusableInput
                    label="Cutting Production Date"
                    value={docDate}
                    type={"date"}
                    required={true}
                    readOnly={true}
                    disabled
                  />
                  <CustomDropdown
                    name="Process Group"
                    value={processGroupId}
                    onChange={(val) => setProcessGroupId(val)}
                    options={(processGroupList?.data || [])
                      .filter((item) => item.active)
                      .map((item) => ({
                        label: item?.ProcessGroupSeq?.name,
                        value: item.id,
                      }))}
                    disabled={id}
                    required={true}
                    placeholder="Select Group"
                    onKeyDown={(e) => {
                      if (e.key === "Delete") setProcessGroupId("");
                    }}
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
                  <DropdownInput
                    name="Production Type"
                    options={inHouseOutsideTypes}
                    value={productionType}
                    setValue={setProductionType}
                    required={true}
                    readOnly={id}
                  />
                  {data?.productionType === "OUTSIDE" && (
                    <DropdownNew
                      name="Supplier"
                      dataList={
                        id
                          ? supplierList?.data
                          : supplierList?.data?.filter((item) => item.active)
                      }
                      value={supplierId}
                      setValue={setSupplierId}
                      readOnly={readOnly}
                      placeholder={"Select Supplier"}
                      disabled={readOnly}
                      clear={true}
                    />
                  )}
                </div>
              </div>
              <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm col-span-1">
                <h2 className="font-medium text-slate-700 mb-2">
                  Production Details
                </h2>

                <div className="grid grid-cols-2 gap-1">
                  <DropdownNew
                    name="Process"
                    dataList={processList?.data?.filter(
                      (item) => item.isCutting,
                    )}
                    value={fromProcessId}
                    setValue={setFromProcessId}
                    readOnly={readOnly}
                    placeholder={"Select Process"}
                    disabled={id}
                    required={true}
                  />
                  <DropdownNew
                    name="Style No"
                    dataList={
                      id
                        ? styleList?.data
                        : styleList?.data?.filter((item) => item.active)
                    }
                    value={styleId}
                    setValue={handleAddRow}
                    required={true}
                    readOnly={readOnly}
                    placeholder={"Select Style"}
                    otherField={"sku"}
                    disabled={id}
                    clear={true}
                  />
                  <ReusableInput
                    label="Cutting Plan No"
                    value={cuttingNo}
                    setValue={setCuttingNo}
                    type={"text"}
                    readOnly={true}
                  />
                  <DropdownNew
                    name="Employee"
                    dataList={employeeList?.data}
                    value={employeeId}
                    setValue={setEmployeeId}
                    readOnly={readOnly}
                    placeholder={"Select Employee"}
                    disabled={readOnly}
                    required={true}
                    otherField={"firstName"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1"></div>
              </div>
            </div>
            <fieldset className="w-full  min-w-[1200px]">
              <CuttingDeliveryItem
                cuttingDeliveryItems={cuttingDeliveryItems}
                setCuttingDeliveryItems={setCuttingDeliveryItems}
                readOnly={readOnly}
                id={id}
                styleId={styleId}
                sizeTemplateId={sizeTemplateId}
                uomList={uomList}
                styleTemplateDetail={styleTemplateDetail}
                companyId={companyId}
                params={params}
                cuttingNo={cuttingNo}
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
                <button className="bg-emerald-600 text-white px-4 py-1 rounded-md hover:bg-emerald-700 flex items-center text-sm">
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
                <button
                  className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700 flex items-center text-sm"
                  disabled={!id}
                  onClick={() => {
                    getSizeTemplate();
                    setPdfOpen(true);
                  }}
                >
                  <FiPrinter className="w-4 h-4 mr-2" />
                  Print
                </button>
              </div>
            </div>
          </div>
          <Modal
            isOpen={pdfOpen}
            onClose={() => setPdfOpen(false)}
            widthClass={"w-[90%] h-[90%]"}
          >
            <PDFViewer style={tw("w-full h-full")}>
              <PDF singleData={singleData?.data} sizeColumns={sizeColumns} />
            </PDFViewer>
          </Modal>
        </div>
      )}
    </>
  );
}
