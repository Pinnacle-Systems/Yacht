import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetProductionDeliveryQuery,
  useGetProductionDeliveryByIdQuery,
  useAddProductionDeliveryMutation,
  useUpdateProductionDeliveryMutation,
  useDeleteProductionDeliveryMutation,
} from "../../../redux/uniformService/ProductionDeliveryServices";
import {
  useGetProcessMasterQuery,
} from "../../../redux/uniformService/ProcessMasterService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { DropdownInput, DateInput, DisabledInput, TextInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { useDispatch } from "react-redux";
import { findFromList, getDateFromDateTime, isGridDatasValid, getCommonParams } from "../../../Utils/helper";
import moment from "moment";
import { Loader } from "../../../Basic/components";

import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import {
  useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import { useGetItemMasterByIdQuery, useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import Modal from "../../../UiComponents/Modal";

import ProductionDeliveryFormReport from "./ProductionDeliveryFormReport";
import ProductionDetailsFillGrid from "./ProductionDetailsFillGrid";
import { inHouseOutsideTypes, packingCategoryOption, packingTypeOption } from "../../../Utils/DropdownData";
import ProductionDeliveryDetails from "./ProductDeliveryDetails";
import Consolidation from "../Consolidation";
import PrintFormatProductionDelivery from "../PrintFormat-ProductionDelivery";
import { useReactToPrint } from "@etsoo/reactprint";
import { groupByMultipleKeys } from "../../../Utils/groupbyMultipleKeys";
import { useGetPanelMasterQuery } from "../../../redux/uniformService/PanelMasterService";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import OrderDropdown from "../ReusableComponents/OrderDropdown";
import { useGetProductionReceiptQuery } from "../../../redux/uniformService/ProductionReceiptServices";
import tw from "../../../Utils/tailwind-react-pdf";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "../ProductionDelivery/PrintFormat-PD/index";
import { date } from "joi";

const MODEL = "Production Delivery";

export default function Form() {

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const dispatch = useDispatch()
  const [orderId, setOrderId] = useState('');
  const today = new Date()
  const [id, setId] = useState("");
  const [form, setForm] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [docId, setDocId] = useState("");
  const [stockDetailsFillGrid, setStockDetailsFillGrid] = useState(false);
  const [deliveryToId, setDeliveryToId] = useState("")
  const [productionDeliveryDetails, setProductionDeliveryDetails] = useState([])
  const [dueDate, setDueDate] = useState("");
  const [storeId, setStoreId] = useState("")
  const [supplierId, setSupplierId] = useState("");
  const [delDate, setDelDate] = useState(getDateFromDateTime(today))
  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [vehicleNo, setVehicleNo] = useState("");
  const [itemId, setItemId] = useState("");
  const [stitchingCost, setStitchingCost] = useState();
  const [packingCost, setPackingCost] = useState();
  const [ironingCost, setIroningCost] = useState();
  const [formReport, setFormReport] = useState(false);
  const [packingType, setPackingType] = useState("")
  const [packingCategory, setPackingCategory] = useState("")
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [processIdFrom, setProcessIdFrom] = useState("");
  const [processIdTo, setProcessIdTo] = useState("");
  const [productionType, setProductionType] = useState("INHOUSE")
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [date, setDate] = useState("");
  const { branchId, companyId, finYearId, userId } = getCommonParams()


  const params = {
    companyId
  };
  const { data: locationData, isLoading: isLocationLoading, isFetching: isLocationFetching } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: allData, isLoading, isFetching } = useGetProductionDeliveryQuery({ params: { branchId, finYearId }, searchParams: searchValue });
  const { data: supplierList } =
    useGetPartyQuery({ params });
  const { data: processList } = useGetProcessMasterQuery({ params: { ...params } });

  const { data: styleList, isLoading: isStyleLoading, isFetching: isStyleFetching } =
    useGetItemMasterQuery({ params, searchParams: searchValue });
  const { data: panelList, isLoading: isPanelLoading, isFetching: isPanelFetching } =
    useGetPanelMasterQuery({ params, searchParams: searchValue });
  const { data: colorList, isLoading: isColorLoading, isFetching: isColorFetching } =
    useGetColorMasterQuery({ params, searchParams: searchValue });
  const { data: sizeList, isLoading: isSizeLoading, isFetching: isSizeFetching } =
    useGetSizeMasterQuery({ params, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProductionDeliveryByIdQuery({ id }, { skip: !id });

  const [addData] = useAddProductionDeliveryMutation();
  const [updateData] = useUpdateProductionDeliveryMutation();
  const [removeData] = useDeleteProductionDeliveryMutation();


  const getNextDocId = useCallback(() => {

    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])


  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    if (data?.createdAt) {
      setDelDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
    }
    if (data?.docId) {
      setDocId(data.docId);
    }
    setOrderId(data?.orderId || "");
    setProductionType(data?.productionType ? data?.productionType : "INHOUSE")
    setProcessIdFrom(data?.fromProcessId ? data?.fromProcessId : "")
    setProcessIdTo(data?.toProcessId ? data?.toProcessId : "")
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDeliveryToId(data?.deliveryId ? data?.deliveryId : "");
    setLocationId(data?.storeId ? findFromList(data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(data?.storeId ? data?.storeId : "");
    setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
    setProductionDeliveryDetails(data?.productionDeliveryDetails || []);
    setItemId(data?.itemId ? data.itemId : "");
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setDueDate(data?.dueDate ? getDateFromDateTime(data.dueDate) : "");
    setPackingCategory(data?.packingCategory ? data?.packingCategory : "");
    setPackingType(data?.packingType ? data?.packingType : "");
    setStitchingCost(data?.stitchingCost ? data?.stitchingCost : 0);
    setPackingCost(data?.packingCost ? data?.packingCost : 0);
    setIroningCost(data?.ironingCost ? data?.ironingCost : 0);
  }, [id]);

  useEffect(() => { if (!id) { setDeliveryToId(supplierId) } }, [supplierId, id]);
  const { data: styleDetail } = useGetItemMasterByIdQuery(itemId, { skip: !itemId })
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



  const data = {
    supplierId,
    stitchingCost,
    ironingCost,
    packingCost,
    packingType,
    packingCategory,
    branchId,
    storeId,
    fromProcessId: processIdFrom,
    productionType,
    toProcessId: processIdTo,
    vehicleNo,
    specialInstructions,
    remarks,
    itemId,
    deliveryId: deliveryToId,
    productionDeliveryDetails,
    id, userId,
    dueDate,
    finYearId,
    orderId
  }

  const isOutside = productionType === "OUTSIDE";

  function packingValidation(data) {
    const isPacking = findFromList(processIdTo, (processList?.data ? processList?.data : []), "isPacking");
    if (!isPacking) return true;
    return (data?.packingCategory && data?.packingType)

  }

  const validateData = (data) => {
    return (isOutside ? data.supplierId && data.deliveryId && data.vehicleNo : true)
      && data.storeId && data.fromProcessId && data.toProcessId && data.orderId
      && data.productionDeliveryDetails.length > 0
      && isGridDatasValid(data.productionDeliveryDetails, false, ["delQty"])
  }

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
        setId("")
        syncFormWithDb(undefined)
      }
      dispatch({
        type: `po/invalidateTags`,
        payload: ['po'],
      });
      dispatch({
        type: `Order/invalidateTags`,
        payload: ['Order'],
      });
      dispatch({
        type: `stock/invalidateTags`,
        payload: ['Stock'],
      });

    } catch (error) {
      console.log("handle", error);
    }
  };

  const saveData = () => {
    if (!packingValidation(data)) {
      toast.info("Please fill Packing Type or Packing Category fields", { position: "top-center" })
      return
    }
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
      return
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id)
        setId("");
        onNew();
        dispatch({
          type: `po/invalidateTags`,
          payload: ['po'],
        });
        dispatch({
          type: `stock/invalidateTags`,
          payload: ['Stock'],
        });
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const isStitching = useCallback(() => {
    return findFromList(processIdFrom, (processList?.data ? processList?.data : []), "isStitching");
  }, [processIdFrom, processList])

  const isPacking = useCallback(() => {
    return findFromList(processIdTo, (processList?.data ? processList?.data : []), "isPacking");
  }, [processIdTo, processList])
  const isIroning = useCallback(() => {
    return findFromList(processIdTo, (processList?.data ? processList?.data : []), "isIroning");
  }, [processIdTo, processList])

  const isChecking = useCallback(() => {
    return findFromList(processIdTo, (processList?.data ? processList?.data : []), "isStitching");
  }, [processIdTo, processList])


  const isForStitchingCost = useCallback(() => {
    return findFromList(processIdTo, (processList?.data ? processList?.data : []), "isStitching");
  }, [processIdTo, processList])

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined);
    getNextDocId();
  };

  useEffect(() => {
    if (packingType == "SET") {
      setPackingCategory("CLASSWISE")
    }
    else if (packingType == "INDIVIDUAL") {
      setPackingCategory("SIZEWISE")
    }
    else {
      setPackingCategory("CLASSWISE")
    }

  }, [packingType])

  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = ["Po", "Status"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']

  const getTotalIssuedQty = () => {
    const totalQty = productionDeliveryDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.delQty ? currentValue?.delQty : 0))
    }, 0)
    return totalQty
  }

  if (isLocationFetching || isLocationLoading || isStyleLoading || isStyleFetching || !processList) return <Loader />
  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];
  return (
    <>
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        <ProductionDeliveryFormReport
          heading={MODEL}
          tableDataNames={tableDataNames}
          loading={
            isLoading || isFetching
          }
          allData={allData}
          tableWidth="100%"
          setForm={setForm}
          data={allData?.data || []}
          onClick={(id) => {
            setId(id);
            setFormReport(false);
          }
          }
          onNew={onNew}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>
      <Modal isOpen={stockDetailsFillGrid} onClose={() => { setStockDetailsFillGrid(false) }} widthClass={"bg-gray-300 h-[500px]"}>
        <ProductionDetailsFillGrid
          isStitching={isStitching}
          storeId={storeId}
          processIdTo={processIdTo}
          orderId={orderId}
          setFillGrid={setStockDetailsFillGrid} productionDeliveryDetails={productionDeliveryDetails}
          setProductionDeliveryDetails={setProductionDeliveryDetails} fromProcessId={processIdFrom} itemId={itemId} />
      </Modal>
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")} >
          <PrintFormat
            singleData={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            docId={docId ? docId : ""}

          />
        </PDFViewer>

      </Modal>
      <div className="hidden">
        {/* <PrintFormatProductionDelivery
          remarks={remarks}
          id={id}
          innerRef={componentRef}
        /> */}
      </div>
      <div
        onKeyDown={handleKeyDown}
        className="md:items-start md:justify-items-center grid h-[800px] bg-theme overflow-auto"
      >
        <div className="flex flex-col frame w-full h-full">
          <FormHeader
            onNew={onNew}
            model={MODEL}
            saveData={saveData}
            setReadOnly={setReadOnly}
            deleteData={deleteData}
            onPrint={id ? () => setPrintModalOpen(true) : null}
            openReport={() => setFormReport(true)}
            childRecord={childRecord.current}
          />
          <div className="flex-1 grid gap-x-2">
            <div className="col-span-3 grid overflow-auto">
              <div className='col-span-3 grid overflow-auto'>
                <div className='mr-1'>
                  <div >
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto'>
                      <legend className='sub-heading'>Production Delivery</legend>
                      <div className='flex flex-col justify-center items-start flex-1 w-full'>
                        <div className="grid grid-cols-4 w-full">
                          <DisabledInput name={"Delivery No"} value={docId} />
                          <DateInput name="Del. Date" value={delDate} type={"date"} required={true} disabled />
                          <DateInput name={"Due. Date"} value={dueDate} setValue={setDueDate} type={"date"} readOnly={readOnly} />
                          <DropdownInput
                            name="In House / Outside"
                            options={inHouseOutsideTypes}
                            value={productionType}
                            setValue={setProductionType}
                            required={true}
                            readOnly={id || readOnly}
                          />
                          <OrderDropdown name={"Order"} readOnly={readOnly} selected={orderId} setSelected={setOrderId} partyId={supplierId} />{console.log(supplierId, "supplierId")}
                          <DropdownInput name="Location"
                            options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                            value={locationId}
                            setValue={(value) => { setLocationId(value); setStoreId("") }}
                            required={true} readOnly={id || readOnly} />
                          <DropdownInput name="Store"
                            options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />
                          {isOutside &&
                            <>
                              <DropdownInput name="Supplier" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />
                              <DropdownInput name="Delivery To" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} />
                            </>
                          }

                          <DropdownInput
                            name="From Process"
                            options={dropDownListObject(id ? (processList ? processList.data : []) : (processList ? processList.data.filter(item => item.active) : []), "name", "id")}
                            value={processIdFrom}
                            setValue={setProcessIdFrom}
                            required={true}
                            readOnly={id || readOnly}
                          />
                          <DropdownInput
                            onBlur={() => {
                              if (!storeId || !itemId || !processIdFrom || !processIdTo) return
                              if (productionDeliveryDetails.length === 0) {
                                setStockDetailsFillGrid(true)
                              }
                            }}
                            name="To Process"
                            options={dropDownListObject(id ? (processList ? processList.data : []) : (processList ? processList.data.filter(item => item.active) : []), "name", "id")}
                            value={processIdTo}
                            setValue={setProcessIdTo}
                            required={true}
                            readOnly={id || readOnly}
                          />




                          {
                            isForStitchingCost() &&
                            <>
                              <TextInput name="ProcessCost" type="number" value={stitchingCost} setValue={setStitchingCost} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                            </>
                          }

                          {
                            isPacking() &&
                            <>
                              <TextInput name="ProcessCost" type="number" value={packingCost} setValue={setPackingCost} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                            </>
                          }

                          {
                            isIroning() &&
                            <>
                              <TextInput name="ProcessCost" type="number" value={ironingCost} setValue={setIroningCost} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />

                            </>
                          }


                          {
                            isPacking() &&
                            <>
                              <DropdownInput
                                name="PackingType"
                                options={packingTypeOption}
                                value={packingType}
                                setValue={setPackingType}
                                required={true}
                                readOnly={id || readOnly}
                              />

                              <DropdownInput
                                name="Category"
                                options={packingCategoryOption}
                                value={packingCategory}
                                setValue={setPackingCategory}
                                required={true}
                                readOnly={true}
                              />
                            </>
                          }

                        </div>
                      </div>
                    </fieldset>
                    <ProductionDeliveryDetails isChecking={isChecking} isPacking={isPacking} isIroning={isIroning} isForStitchingCost={isForStitchingCost} toProcessId={processIdTo}
                      isStitching={isStitching} itemList={styleList}
                      panelList={panelList} colorList={colorList} sizeList={sizeList} id={id} readOnly={readOnly}
                      setStockDetailsFillGrid={setStockDetailsFillGrid}
                      productionDeliveryDetails={productionDeliveryDetails}
                      // productionDeliveryDetails={productionDeliveryDetails?.map(i => { return { ...i, delQty: i.qty } })}
                      setProductionDeliveryDetails={setProductionDeliveryDetails}
                      itemId={itemId} storeId={storeId} fromProcessId={processIdFrom} orderId={orderId} />
                    <Consolidation vehicleNo={vehicleNo} setVehicleNo={setVehicleNo}
                      specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions}
                      remarks={remarks} setRemarks={setRemarks} totalQty={getTotalIssuedQty()} readOnly={readOnly} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}