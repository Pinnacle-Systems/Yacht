import { useCallback, useEffect, useRef, useState } from "react";
import { FaFileAlt, FaWhatsapp } from "react-icons/fa";
import { ReusableInput } from "../../../Utils/CommonInput";
import FxSelect, {
  CustomDropdown,
  DropdownInput,
  DropdownNew,
} from "../../../Inputs";
import {
  findFromList,
  getCommonParams,
  isGridDatasValid,
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
import PDF from "./PrintFormat-PD/PDF.jsx";

import { inHouseOutsideTypes } from "../../../Utils/DropdownData.js";
import { useGetUnitOfMeasurementMasterQuery } from "../../../redux/uniformService/UnitOfMeasurementServices.js";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService.js";
import { useLazyGetSizeTemplateByIdQuery } from "../../../redux/uniformService/SizeTemplateMasterServices.js";
import {
  useAddProductionDeliveryMutation,
  useGetProductionDeliveryByIdQuery,
  useGetProductionDeliveryQuery,
  useUpdateProductionDeliveryMutation,
} from "../../../redux/uniformService/ProductionDeliveryServices.js";
import { useLazyGetOrderDetailsQuery } from "../../../redux/uniformService/CuttingOrderService.js";
import ProductionDeliveryItem from "./ProductionDeliveryItem.js";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService.js";
import { useLazyGetStyleDetailQuery } from "../../../redux/uniformService/ProductionStockServices.js";
import ProductionDetailsFillGrid from "./ProductionDetailsFillGrid";
import Modal from "../../../UiComponents/Modal/index.js";
import { useGetStyleItemMasterQuery } from "../../../redux/uniformService/StyleItemMasterService.js";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService.js";
import { useGetPortionMasterQuery } from "../../../redux/uniformService/PortionMasterService.js";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService.js";
import { dropDownListObject } from "../../../Utils/contructObject.js";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService.js";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf.js";
import CuttingDeliveryApi from "../../../redux/uniformService/CuttingDeliveryServices.js";
import StockInwardApi from "../../../redux/uniformService/StockInwardService.js";
import { Loader } from "../../../Basic/components/index.js";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService.js";

export default function ProductionDeliveryForm({
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
  const [productionEntryItems, setProductionEntryItems] = useState([]);
  const [styleId, setStyleId] = useState("");
  const [productionType, setProductionType] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [fromProcessId, setFromProcessId] = useState("");
  const [toProcessId, setToProcessId] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);
  const isLoadingIndicator = isSingleFetching || isSingleLoading;

  const [styleTemplateDetail] = useLazyGetSizeTemplateByIdQuery();
  const firstUpdate = useRef(true);
  // const [sizeTemplateId, setSizeTemplateId] = useState("");

  const dispatch = useDispatch();

  const { companyId, userId, finYearId, branchId } = getCommonParams();
  const params = {
    branchId,
    companyId,
  };
  const { data: styleList } = useGetStyleMasterQuery({ params: { companyId } });
  const { data: styleItemList } = useGetStyleItemMasterQuery({
    params: { companyId },
  });
  const { data: fabricList } = useGetFabricMasterQuery({
    params: { companyId },
  });
  const { data: portionList } = useGetPortionMasterQuery({
    params: { companyId },
  });
  const { data: sizeList } = useGetSizeMasterQuery({
    params: { companyId },
  });
  const { data: supplierList } = useGetPartyQuery({
    params: { companyId },
  });
  const { data: uomList } = useGetUnitOfMeasurementMasterQuery({
    params: { companyId },
  });
  const { data: processList } = useGetProcessMasterQuery({
    params: { companyId },
  });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  // const {
  //   data: singleData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetProductionDeliveryByIdQuery(id, { skip: !id });

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
    data: allData,
    isFetching,
    isLoading,
  } = useGetProductionDeliveryQuery({
    params: {
      branchId,
    },
  });

  const [getStyleStkDetail] = useLazyGetStyleDetailQuery();

  const syncFormWithDb = useCallback(
    (data) => {
      const today = new Date();
      setDocDate(
        data?.docDate
          ? moment.utc(data.docDate).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );
      if (data?.docId) {
        setDocId(data?.docId);
      }
      setStyleId(data?.styleId ? data?.styleId : "");
      // setSizeTemplateId(data?.sizeTemplateId ? data?.sizeTemplateId : "");
      setProductionType(
        data?.productionType ? data?.productionType : "INHOUSE"
      );
      setSupplierId(data?.supplierId ? data?.supplierId : "");
      setToProcessId(data?.toProcessId ? data?.toProcessId : "");
      setFromProcessId(data?.fromProcessId ? data?.fromProcessId : "");
      setProductionEntryItems(
        data?.productionEntryItems ? data?.productionEntryItems : []
      );
      setLocationId(data?.locationId ? data?.locationId : branchId);
      setStoreId(data?.storeId ? data.storeId : "");
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

  const [addData] = useAddProductionDeliveryMutation();
  const [updateData] = useUpdateProductionDeliveryMutation();
  const [getOrderDetail] = useLazyGetOrderDetailsQuery();

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
        dispatch(CuttingDeliveryApi.util.invalidateTags(["CuttingDelivery"]));
        dispatch(StockInwardApi.util.invalidateTags(["StockInward"]));
      } else {
        toast.error(returnData?.message, {
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.log("handle");
    }
  };

  const isOutside = productionType === "OUTSIDE";

  const findDuplicates = (items) => {
    const seen = new Map(); // key -> first index
    const duplicates = [];

    items.forEach((row, index) => {
      const key = [
        row.styleId || "",
        row.sizeId || "",
        row.portionId || "",
      ].join("-");

      if (seen.has(key)) {
        duplicates.push({
          firstIndex: seen.get(key),
          duplicateIndex: index,
          styleId: row.styleId,
          sizeId: row.sizeId,
          portionId: row.portionId,
        });
      } else {
        seen.set(key, index);
      }
    });

    return duplicates; // empty array = no duplicates
  };

  const validateData = (data) => {
    const items = data?.productionEntryItems || [];
    const filledItems = items.filter(
      (item) => item.styleId || item.fabricId || item.portionID
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
        Portion - ${findFromList(dup?.portionId, portionList?.data, "name")},
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
        data?.productionType &&
        data?.fromProcessId &&
        data?.toProcessId &&
        isGridDatasValid(data?.productionEntryItems, false, ["issueQty"]) &&
        data?.productionEntryItems?.length > 0
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
        allData?.data?.flatMap((d) => d.productionEntryItems || []) || [];
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

  const filterItems = productionEntryItems?.filter?.((item) => item?.styleId);

  const data = {
    id,
    docDate,
    branchId,
    productionEntryItems: filterItems,
    userId,
    finYearId,
    styleId,
    productionType,
    supplierId,
    fromProcessId,
    toProcessId,
    locationId,
    storeId,
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
    // handleAddRow();
  }, [styleId, id, readOnly]);

  const handleAddRow = async () => {
    try {
      if (!fromProcessId) {
        toast.info("Please Choose From Process and Style No...!", {
          position: "top-center",
          autoClose: 2000,
        });
        return;
      }
      const { data: styleData } = await getStyleStkDetail({
        params: {
          styleId: styleId,
          fromProcessId: fromProcessId,
          branchId,
        },
      });
      if (styleData?.statusCode === 400) {
        toast.error(styleData.message, { autoClose: 2000 });
        return; // stop function
      }
      const styleItems = styleData.data || [];
      if (!styleItems) return;
      setProductionEntryItems((prev) => {
        const updated = [...prev];
        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) =>
            !row.styleId &&
            !row.styleItemId &&
            !row.fabricId &&
            !row.colorId &&
            !row.portionId &&
            !row.sizeId
        );
        if (startIndex === -1) startIndex = updated.length;
        styleItems.forEach((row, i) => {
          const cloned = structuredClone(row);
          if (startIndex + i < updated.length) {
            updated[startIndex + i] = cloned;
          } else {
            updated.push(cloned); // append if no empty slot
          }
        });
        while (updated.length < 6) {
          updated.push({
            styleId: "",
            styleItemId: "",
            fabricId: "",
            colorId: "",
            portionId: "",
            sizeId: "",
            orderQty: "",
            remarks: "",
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

  // const handleStyleChange = (newValue) => {
  //   console.log(newValue, "newValue");
  //   if (!newValue) return;
  //   setStyleId(newValue);
  //   // Use Promise to ensure state update
  //   Promise.resolve().then(() => {
  //     handleAddRow();
  //   });
  // };

  const handleStyleChange = async (newValue) => {
    if (!storeId) {
      toast.info("Please Choose Location...!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    if (!newValue) return;
    const hasUnfilledRequired = productionEntryItems.some((row) => {
      return row.styleId && !row.issueQty;
    });

    if (hasUnfilledRequired) {
      toast.info("Please fill all required fields before adding...!", {
        position: "top-center",
      });
      return;
    }
    try {
      if (!fromProcessId || !toProcessId) {
        toast.info("Please Choose From Process and To Process...!", {
          position: "top-center",
          autoClose: 2000,
        });
        return;
      }
      const { data: styleData } = await getStyleStkDetail({
        params: {
          styleId: newValue,
          fromProcessId: fromProcessId,
          branchId,
          toProcessId: toProcessId,
          storeId: storeId,
        },
      });
      if (styleData?.statusCode === 400) {
        toast.error(styleData.message, { autoClose: 2000 });
        return; // stop function
      }
      const styleItems = styleData.data || [];
      if (!styleItems) return;
      setProductionEntryItems((prev) => {
        const updated = [...prev];
        // Find first empty slot index
        let startIndex = updated.findIndex(
          (row) =>
            !row.styleId &&
            !row.styleItemId &&
            !row.fabricId &&
            !row.colorId &&
            !row.portionId &&
            !row.sizeId
        );
        if (startIndex === -1) startIndex = updated.length;
        styleItems.forEach((row, i) => {
          const cloned = structuredClone(row);
          if (startIndex + i < updated.length) {
            updated[startIndex + i] = cloned;
          } else {
            updated.push(cloned); // append if no empty slot
          }
        });
        while (updated.length < 6) {
          updated.push({
            styleId: "",
            styleItemId: "",
            fabricId: "",
            colorId: "",
            portionId: "",
            sizeId: "",
            orderQty: "",
            remarks: "",
          });
        }

        return updated;
      });
    } catch (error) {
      console.error("Error adding row:", error);
    }
    setStyleId(newValue);
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
                Production Entry Details
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
                  <ReusableInput label="Production No" readOnly value={docId} />
                  <ReusableInput
                    label="Production Date"
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
                    autoFocus={true}
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
                  Process Details
                </h2>

                <div className="grid grid-cols-2 gap-1">
                  <DropdownNew
                    name="From Process"
                    dataList={processList?.data?.filter(
                      (item) => !item.isCutting
                    )}
                    value={fromProcessId}
                    setValue={setFromProcessId}
                    readOnly={readOnly}
                    placeholder={"Select Process"}
                    disabled={id}
                    required={true}
                  />
                  <DropdownNew
                    name="To Process"
                    dataList={processList?.data?.filter(
                      (item) => !item.isCutting
                    )}
                    value={toProcessId}
                    setValue={setToProcessId}
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
                    setValue={handleStyleChange}
                    required={true}
                    readOnly={readOnly}
                    placeholder={"Select Style"}
                    otherField={"sku"}
                    disabled={readOnly}
                    clear={true}
                    // onKeyDown={(e) => {
                    //   if (e.key === "Enter") {
                    //     setTimeout(() => {
                    //       handleAddRow();
                    //     }, 100);
                    //   }
                    // }}
                  />
                </div>
              </div>
            </div>
            <fieldset className="w-full  min-w-[1200px]">
              <ProductionDeliveryItem
                productionEntryItems={productionEntryItems}
                setProductionEntryItems={setProductionEntryItems}
                readOnly={readOnly}
                id={id}
                styleId={styleId}
                // sizeTemplateId={sizeTemplateId}
                uomList={uomList}
                styleTemplateDetail={styleTemplateDetail}
                params={params}
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
          <Modal
            isOpen={pdfOpen}
            onClose={() => setPdfOpen(false)}
            widthClass={"w-[90%] h-[90%]"}
          >
            <PDFViewer style={tw("w-full h-full")}>
              <PDF singleData={singleData?.data} />
            </PDFViewer>
          </Modal>
          {/* <Modal
        isOpen={stockDetailsFillGrid}
        onClose={() => {
          setStockDetailsFillGrid(false);
        }}
        // widthClass={"bg-gray-300"}
      >
        <ProductionDetailsFillGrid
          styleData={styleData}
          setFillGrid={setStockDetailsFillGrid}
          productionEntryItems={productionEntryItems}
          setProductionEntryItems={setProductionEntryItems}
          styleItemList={styleItemList}
          fabricList={fabricList}
          portionList={portionList}
          processList={processList}
          colorList={colorList}
        />
      </Modal> */}
        </div>
      )}
    </>
  );
}
