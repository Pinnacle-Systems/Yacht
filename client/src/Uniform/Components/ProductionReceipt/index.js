import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import {
  useGetProductionReceiptQuery,
  useGetProductionReceiptByIdQuery,
  useAddProductionReceiptMutation,
  useUpdateProductionReceiptMutation,
  useDeleteProductionReceiptMutation,
} from "../../../redux/uniformService/ProductionReceiptServices";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { DropdownInput, TextInput, DateInput, DisabledInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { useDispatch } from "react-redux";
import { findFromList, getCommonParams, getDateFromDateTime, isGridDatasValid } from "../../../Utils/helper";
import moment from "moment";
import { Loader } from "../../../Basic/components";

import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import {
  useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import Modal from "../../../UiComponents/Modal";
import ProductionReceiptDetails from "./ProductionReceiptDetails";
import ProductionReceiptFormReport from "./ProductionReceiptFormReport";
import {
  useGetProductionDeliveryByIdQuery,
} from "../../../redux/uniformService/ProductionDeliveryServices";
import ProductionDeliveryDetailsFillGrid from "./ProductionDeliveryDetailsFillGrid";
import Consolidation from "../Consolidation";
import ProductionDeliveryFormReport from "../ProductionDelivery/ProductionDeliveryFormReport";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { groupByMultipleKeys } from "../../../Utils/groupbyMultipleKeys";
import FabricConsumptionDetails from "./FabricConsumptionDetails";
import OrderDropdown from "../ReusableComponents/OrderDropdown";
import { useGetOrderByIdQuery, useGetOrderItemsByIdQuery } from "../../../redux/uniformService/OrderService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import ProductionDeliveryByOrder from "./ProductionDeliveryByOrder";
import ProductionDeliveryDetailsFillGridByStitching from "./ProductionDeliveryDetailsFillGridByStitching";
import ProductionDeliveryDetailsFillGridForPacking from "./ProductionDeliveryDetailsFillGridForPacking";
import ProductionReceiptDetailsForPacking from "./ProductionReceiptDetailsForPacking";
import { packingCategoryOption, packingTypeOption } from "../../../Utils/DropdownData";
import ProductionReceiptForIndividual from "./ProductionReceiptForIndividual";
import ProductionReceiptDetailsForIndividual from "./ProductionReceiptDetailsForIndividual";
import ProductionDeliveryDetailsFillGridForMixed from "./ProductionDeliveryDetailsFillGridForMixed";
import ProductionReceiptDetailsForMixed from "./ProductionReceiptDetailsForMixed";
import { PDFViewer } from "@react-pdf/renderer";
import PrintFormat from "../ProductionReceipt/PrintFormat-PR/index";
import tw from "../../../Utils/tailwind-react-pdf";
import { useGetClassMasterQuery } from "../../../redux/uniformService/ClassMasterService";
import { useGetPanelMasterQuery } from "../../../redux/uniformService/PanelMasterService";
import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { substract } from "../../../Utils/helper";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";

const MODEL = "Production Receipt";

export default function Form() {



  const boxCount = useRef(0);
  const boxCountIndividual = useRef(0);
  const dispatch = useDispatch()
  const [boxQty, setBoxQty] = useState(0);
  const [markRead, setMarkRead] = useState(false);
  const [boxQtyIndividual, setBoxQtyIndividual] = useState(0);
  const [markReadIndividual, setMarkReadIndividual] = useState(false);
  const [packingType, setPackingType] = useState("")
  const [packingCategory, setPackingCategory] = useState("")
  const today = new Date()
  const [id, setId] = useState("");
  const [processType, setProcessType] = useState("")
  const [form, setForm] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [productionDeliveryId, setProductionDeliveryId] = useState("");
  const [productionReceiptFormReport, setProductionReceiptFormReport] = useState(false)
  const [docId, setDocId] = useState("");
  const [deliveryToId, setDeliveryToId] = useState("")
  const [productionReceiptDetails, setProductionReceiptDetails] = useState([]);
  const [productionDeliveryDetailsFillData, setProductionDeliveryDetailsFillData] = useState([])
  const [productionDeliveryDetailsFillDataForIndividual, setProductionDeliveryDetailsFillDataForIndividual] = useState([])
  const [storeId, setStoreId] = useState("")
  const [supplierId, setSupplierId] = useState("");
  const [prevProcessId, setPrevProcessId] = useState("");
  const [delDate, setDelDate] = useState(getDateFromDateTime(today))
  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [vehicleNo, setVehicleNo] = useState("");
  const [styleId, setStyleId] = useState("");
  const [formReport, setFormReport] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [productionDeliveryFillGrid, setProductionDeliveryFillGrid] = useState(false);
  const [productionDeliveryDetailsFillGridByStitching, setProductionDeliveryDetailsFillGridByStitching] = useState(false);
  const childRecord = useRef(0);
  const [dcNo, setDcNo] = useState("")
  const [productionDeliveryDetailsFillGrid, setProductionDeliveryDetailsFillGrid] = useState(false);
  const [productionDeliveryDetailsFillGridForPacking, setProductionDeliveryDetailsFillGridForPacking] = useState(false);
  const [orderId, setOrderId] = useState('');
  const { branchId, companyId, finYearId, userId } = getCommonParams();
  const [groupData, setGroupData] = useState([]);
  const [processCost, setProcessCost] = useState();
  const [printModalopen, setprintmodalOpen] = useState(false)
  const [date, setDate] = useState("");

  const params = {
    companyId
  };
  const { data: locationData, isLoading: isLocationLoading, isFetching: isLocationFetching } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: styleList, isLoading: isStyleLoading, isFetching: isStyleFetching } = useGetItemMasterQuery({ params, searchParams: searchValue });

  const { data: allData, isLoading, isFetching } = useGetProductionReceiptQuery({ params: { branchId, finYearId }, searchParams: searchValue });

  console.log(productionReceiptDetails, "productionReceiptDetails")


  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProductionReceiptByIdQuery({ id }, { skip: !id });


  const { data: supplierList } =
    useGetPartyQuery({ params });



  const {
    data: singleOrderItemsData,
    isFetching: singleOrderItemsDataFetching,
    isLoading: singleOrderItemsDataLoading,
  } = useGetOrderItemsByIdQuery({ id: orderId, prevProcessId, packingCategory, packingType }, { skip: !orderId });

  const { data: processList } = useGetProcessMasterQuery({ params: { ...params } });

  const isStitching = useCallback(() => {
    return findFromList(prevProcessId, (processList?.data ? processList?.data : []), "isStitching");
  }, [prevProcessId, processList])

  const isIroning = useCallback(() => {
    return findFromList(prevProcessId, (processList?.data ? processList?.data : []), "isIroning");
  }, [prevProcessId, processList])

  const isPacking = useCallback(() => {
    return findFromList(prevProcessId, (processList?.data ? processList?.data : []), "isPacking");
  }, [prevProcessId, processList])



  const { data: classList } =
    useGetClassMasterQuery({ params });


  const { data: panelList } =
    useGetPanelMasterQuery({ params });

  const { data: itemList } =
    useGetItemMasterQuery({ params });

  const { data: sizeList } =
    useGetSizeMasterQuery({ params });

  const { data: colorList } =
    useGetColorMasterQuery({ params });

  const [addData] = useAddProductionReceiptMutation();
  const [updateData] = useUpdateProductionReceiptMutation();
  const [removeData] = useDeleteProductionReceiptMutation();






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
    if (data?.createdAt) setDelDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
    if (data?.docId) {
      setDocId(data.docId);
    }
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setOrderId(data?.orderId || "");
    setDeliveryToId(data?.deliveryId ? data?.deliveryId : "");
    setLocationId(data?.storeId ? findFromList(data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(data?.storeId ? data?.storeId : "");
    setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
    setProductionDeliveryId(data?.productionDeliveryId ? data?.productionDeliveryId : "")
    setStyleId(data?.styleId ? data?.styleId : "");
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setDcNo(data?.supplierDc ? data.supplierDc : "");
    setProductionReceiptDetails(data?.productionReceiptDetails ? data.productionReceiptDetails : []);
    setPrevProcessId(data?.prevProcessId ? data.prevProcessId : "");
    setProcessType(data?.ProductionDelivery?.productionType ? data?.ProductionDelivery?.productionType : "")
    setPackingCategory(data?.packingCategory ? data?.packingCategory : "");
    setPackingType(data?.packingType ? data?.packingType : "");

  }, [id, locationData]);

console.log(groupData,"groupData")

  useEffect(() => { if (!id) { setDeliveryToId(supplierId) } }, [supplierId, id])

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);




  const data = {
    delDate,
    supplierId,
    branchId,
    storeId,
    packingType,
    packingCategory,
    deliveryId: deliveryToId,
    productionDeliveryId,
    productionReceiptDetails,
    vehicleNo,
    remarks,
    specialInstructions,
    supplierDc: dcNo,
    id, userId,
    prevProcessId,
    finYearId,
    orderId
  }
  const validateData = (data) => {
    let inwardDetails = ["receivedQty"];
    return data.prevProcessId && data.orderId
      && data.productionReceiptDetails.length !== 0

  }

  useEffect(() => {
    if (id) return
    if (!orderId) return
    if (productionReceiptDetails.length === 0 && isStitching()) {
      setProductionDeliveryDetailsFillGridByStitching(true);

    }
    else if (productionReceiptDetails.length === 0 && isPacking()) {
      setProductionDeliveryDetailsFillGridForPacking(true);
    }
    else if (productionReceiptDetails.length === 0) {
      setProductionDeliveryDetailsFillGrid(true);
    }
  }, [orderId, productionReceiptDetails, isStitching, isPacking])




  useEffect(() => {
    if (id) return
    if (!singleOrderItemsData?.data) return
    setProcessCost(singleOrderItemsData?.data?.processCost)
    if (isStitching()) {
      let array = singleOrderItemsData?.data?.productionDeliveryDetailsItemGroupBy?.filter(val => parseInt(val?.toprocessid) === parseInt(prevProcessId))
      setProductionDeliveryDetailsFillData(array)
    }
    else if (isPacking()) {
      let array = singleOrderItemsData?.data?.productionDeliveryDetailsItemForPacking
      setProductionDeliveryDetailsFillData(array)
      if (packingType == "MIXED") {
        setProductionDeliveryDetailsFillDataForIndividual(singleOrderItemsData?.data?.packingForIndividualExtra)
      }
    }
    else {
      let array = singleOrderItemsData?.data?.productionDeliveryDetailsItems?.filter(val => parseInt(val?.toprocessid) === parseInt(prevProcessId))
      setProductionDeliveryDetailsFillData(array)
    }
  }, [singleOrderItemsData, singleOrderItemsDataFetching, singleOrderItemsDataLoading, isStitching, isPacking])



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
        type: `CuttingOrder/invalidateTags`,
        payload: ['CuttingOrder'],
      });
      dispatch({
        type: `stock/invalidateTags`,
        payload: ['Stock'],
      });
      dispatch({
        type: `ProductionDelivery/invalidateTags`,
        payload: ['ProductionDelivery'],
      });
      dispatch({
        type: `Order/invalidateTags`,
        payload: ['Order'],
      });
    } catch (error) {
      console.log("handle", error);
    }
  };


  const saveData = () => {

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

  const onNew = () => {
    setId("");
    setForm(true);
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined);
    getNextDocId();
    setGroupData([])
  };

  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = ["Po", "Status"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']


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


  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  const getTotalIssuedQty = () => {
    const totalQty = productionReceiptDetails?.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0))
    }, 0)
    return totalQty
  }

  if (isLocationFetching || isLocationLoading || isStyleLoading || isStyleFetching) return <Loader />

  return (
    <>
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        <ProductionReceiptFormReport
          heading={MODEL}
          tableDataNames={tableDataNames}
          loading={
            isLoading || isFetching
          }

          tableWidth="100%"
          setForm={setForm}
          data={allData?.data}
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
      <Modal isOpen={productionDeliveryFillGrid} onClose={() => { setProductionDeliveryFillGrid(false) }} widthClass={"bg-gray-300 w-[90%] h-[70%]"}>
        <ProductionDeliveryByOrder onClick={(id) => { setOrderId(id); setProductionDeliveryFillGrid(false) }} prevProcessId={prevProcessId} />
      </Modal>
      <Modal isOpen={productionReceiptFormReport} onClose={() => { setProductionReceiptFormReport(false) }} widthClass={"bg-gray-300 w-[90%] h-[70%]"}>
        <ProductionReceiptFormReport onClick={(id) => { setId(id); setProductionReceiptFormReport(false) }} prevProcessId={prevProcessId} />
      </Modal>
      <Modal isOpen={productionDeliveryDetailsFillGrid} onClose={() => { setProductionDeliveryDetailsFillGrid(false) }} widthClass={"bg-gray-300 h-[550px]"}>
        <ProductionDeliveryDetailsFillGrid
          isIroning={isIroning}
          isPacking={isPacking}
          prevProcessId={prevProcessId}
          productionReceiptDetails={productionReceiptDetails}
          setProductionReceiptDetails={setProductionReceiptDetails}
          productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
          setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData}
          onDone={() => { setProductionDeliveryDetailsFillGrid(false) }} />
      </Modal>
      <Modal isOpen={productionDeliveryDetailsFillGridByStitching}
        onClose={() => { setProductionDeliveryDetailsFillGridByStitching(false) }} widthClass={"bg-gray-300 h-[550px]"}>
        <ProductionDeliveryDetailsFillGridByStitching
          orderDetails={singleOrderItemsData?.data?.orderDetails}
          prevProcessId={prevProcessId}
          isIroning={isIroning}
          productionReceiptDetails={productionReceiptDetails}
          setProductionReceiptDetails={setProductionReceiptDetails}
          productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
          setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData}
          onDone={() => { setProductionDeliveryDetailsFillGridByStitching(false) }} />
      </Modal>

      <Modal isOpen={productionDeliveryDetailsFillGridForPacking}
        onClose={() => { setProductionDeliveryDetailsFillGridForPacking(false) }} widthClass={"bg-gray-300 h-[650px] w-[80%] overflow-auto"}>

        {
          (packingCategory == "SIZEWISE" && packingType == "INDIVIDUAL")
            ?
            <ProductionReceiptForIndividual
              boxQty={boxQty}
              setBoxQty={setBoxQty}
              markRead={markRead}
              setMarkRead={setMarkRead}
              boxCount={boxCount}
              packingCategory={packingCategory}
              packingType={packingType}
              orderDetails={singleOrderItemsData?.data?.orderDetails}
              prevProcessId={prevProcessId}
              isIroning={isIroning}
              productionReceiptDetails={productionReceiptDetails}
              setProductionReceiptDetails={setProductionReceiptDetails}
              productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
              setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData}
              onDone={() => { setProductionDeliveryDetailsFillGridForPacking(false) }}

            />
            :
            (packingCategory == "CLASSWISE" && packingType == "SET")
              ?

              <ProductionDeliveryDetailsFillGridForPacking
                boxQty={boxQty}
                setBoxQty={setBoxQty}
                markRead={markRead}
                setMarkRead={setMarkRead}
                boxCount={boxCount}
                packingCategory={packingCategory}
                packingType={packingType}
                orderDetails={singleOrderItemsData?.data?.orderDetails}
                prevProcessId={prevProcessId}
                isIroning={isIroning}
                productionReceiptDetails={productionReceiptDetails}
                setProductionReceiptDetails={setProductionReceiptDetails}
                productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData}
                onDone={() => { setProductionDeliveryDetailsFillGridForPacking(false) }} />
              :

              <ProductionDeliveryDetailsFillGridForMixed
                boxQty={boxQty}
                setBoxQty={setBoxQty}
                markRead={markRead}
                setMarkRead={setMarkRead}
                boxCount={boxCount}
                boxQtyIndividual={boxQtyIndividual}
                setBoxQtyIndividual={setBoxQtyIndividual}
                markReadIndividual={markReadIndividual}
                setMarkReadIndividual={setMarkReadIndividual}
                boxCountIndividual={boxCountIndividual}
                packingCategory={packingCategory}

                packingType={packingType}
                orderDetails={singleOrderItemsData?.data?.orderDetails}
                prevProcessId={prevProcessId}
                isIroning={isIroning}
                productionReceiptDetails={productionReceiptDetails}
                setProductionReceiptDetails={setProductionReceiptDetails}
                productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                setProductionDeliveryDetailsFillData={setProductionDeliveryDetailsFillData}
                setProductionDeliveryDetailsFillDataForIndividual={setProductionDeliveryDetailsFillDataForIndividual}
                productionDeliveryDetailsFillDataForIndividual={productionDeliveryDetailsFillDataForIndividual}
                onDone={() => { setProductionDeliveryDetailsFillGridForPacking(false) }} />

        }
      </Modal>
      <Modal
        isOpen={printModalopen}
        onClose={() => setprintmodalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")} >
          <PrintFormat
            singleData={id ? singleData?.data : "Null"}
            groupData={groupData}
            productionReceiptDetails={productionReceiptDetails}
            docId={docId ? docId : ""}
            id={id}
            isStitching={isStitching} substract={substract}
            classList={classList} panelList={panelList} itemList={itemList} sizeList={sizeList} colorList={colorList}
            findFromList={findFromList}

          />
        </PDFViewer>

      </Modal>
      <div
        onKeyDown={handleKeyDown}
        className="md:items-start md:justify-items-center grid h-[900px] bg-theme overflow-auto"
      >
        <div className="flex flex-col frame w-full h-full">
          <FormHeader
            onNew={onNew}
            model={MODEL}
            saveData={saveData}
            setReadOnly={setReadOnly}
            deleteData={deleteData}
            onPrint={id ? () => setprintmodalOpen(true) : null}
            openReport={() => setProductionReceiptFormReport(true)}
            childRecord={childRecord.current}
          />
          <div className="flex-1 grid gap-x-2">
            <div className="col-span-3 grid overflow-auto">
              <div className='col-span-3 grid overflow-auto'>
                <div className='mr-1'>
                  <div className={`grid ${formReport ? "grid-cols-12" : "grid-cols-1"} h-full relative overflow-auto`}>
                    <div className={`${formReport ? "col-span-9" : "col-span-1"}`}>
                      <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto'>
                        <legend className='sub-heading'>Production Receipt </legend>
                        <div className='flex flex-col justify-center items-start flex-1 w-full'>
                          <div className="grid grid-cols-5 w-full">
                            <DisabledInput name={"Receipt No"} value={docId} />
                            <DateInput name="Receipt Date" value={delDate} type={"date"} required={true} disabled />
                            <DropdownInput name="Location"
                              options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                              value={locationId}
                              setValue={(value) => { setLocationId(value); setStoreId("") }}
                              required={true} readOnly={id || readOnly} />
                            <DropdownInput name="Store"
                              options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                              value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                            {
                              (processType == "OUTSIDE" || processType == "") &&
                              <>
                                <DropdownInput name="Supplier" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />

                                <TextInput name="Supplier Dc" type="text" value={dcNo} setValue={setDcNo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                              </>
                            }

                            <DropdownInput
                              name="Process"
                              options={dropDownListObject(id ? (processList ? processList.data : []) : (processList ? processList.data.filter(item => item.active) : []), "name", "id")}
                              value={prevProcessId}
                              setValue={setPrevProcessId}
                              required={true}
                              readOnly={readOnly}
                            />
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

                            {
                              (isStitching() || isPacking() || isIroning()) &&

                              <DisabledInput name={"ProcessCost"} value={processCost} />


                            }

                            <div className="grid grid-cols-12 items-center">
                              <div className="col-span-10">
                                <DisabledInput name={"Order"} value={singleOrderItemsData ? singleOrderItemsData?.data?.docId : ""} />
                              </div>
                              {!readOnly &&
                                <button className="p-0.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white -ml-6"
                                  onClick={() => {
                                    if (!prevProcessId) {
                                      toast.info("Please Select  Process ", { position: "top-center" })
                                      return
                                    }
                                    setProductionDeliveryFillGrid(true)
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      if (!styleId || !prevProcessId) {
                                        toast.info("Please Select Style and Process ", { position: "top-center" })
                                        return
                                      }
                                      setProductionDeliveryFillGrid(true)
                                    }
                                  }}
                                >Select</button>
                              }
                            </div>
                          </div>
                        </div>
                      </fieldset>

                      {
                        (isPacking() && packingCategory == "SIZEWISE" && packingType == "INDIVIDUAL")
                          ?
                          <ProductionReceiptDetailsForIndividual
                            groupData={groupData} setGroupData={setGroupData}
                            packingCategory={packingCategory}
                            packingType={packingType}
                            isIroning={isIroning}
                            id={id}
                            productionDeliveryId={productionDeliveryId}
                            productionReceiptDetails={productionReceiptDetails}
                            setProductionReceiptDetails={setProductionReceiptDetails}
                            productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                            setFillGrid={setProductionDeliveryDetailsFillGrid}
                            readOnly={readOnly}
                            isStitching={isStitching}
                            isPacking={isPacking}
                            setProductionDeliveryDetailsFillGridForPacking={setProductionDeliveryDetailsFillGridForPacking}
                          />

                          :
                          (isPacking() && packingCategory == "CLASSWISE" && packingType == "SET")
                            ?
                            <ProductionReceiptDetailsForPacking
                              groupData={groupData} setGroupData={setGroupData}
                              packingCategory={packingCategory}
                              packingType={packingType}
                              isIroning={isIroning}
                              id={id}
                              productionDeliveryId={productionDeliveryId}
                              productionReceiptDetails={productionReceiptDetails}
                              setProductionReceiptDetails={setProductionReceiptDetails}
                              productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                              setFillGrid={setProductionDeliveryDetailsFillGrid}
                              readOnly={readOnly}
                              isStitching={isStitching}
                              isPacking={isPacking}
                              setProductionDeliveryDetailsFillGridForPacking={setProductionDeliveryDetailsFillGridForPacking}
                            />
                            :
                            (isPacking() && packingCategory == "CLASSWISE" && packingType == "MIXED")
                              ?
                              <ProductionReceiptDetailsForMixed
                                groupData={groupData} setGroupData={setGroupData}
                                packingCategory={packingCategory}
                                packingType={packingType}
                                isIroning={isIroning}
                                id={id}
                                productionDeliveryId={productionDeliveryId}
                                productionReceiptDetails={productionReceiptDetails}
                                setProductionReceiptDetails={setProductionReceiptDetails}
                                productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                                setFillGrid={setProductionDeliveryDetailsFillGrid}
                                readOnly={readOnly}
                                isStitching={isStitching}
                                isPacking={isPacking}
                                setProductionDeliveryDetailsFillGridForPacking={setProductionDeliveryDetailsFillGridForPacking}
                              />
                              :
                              <ProductionReceiptDetails
                                isIroning={isIroning}
                                isPacking={isPacking}
                                id={id}
                                productionDeliveryId={productionDeliveryId}
                                productionReceiptDetails={productionReceiptDetails}
                                setProductionReceiptDetails={setProductionReceiptDetails}
                                productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                                setFillGrid={setProductionDeliveryDetailsFillGrid}
                                readOnly={readOnly}
                                isStitching={isStitching}
                                setProductionDeliveryDetailsFillGridByStitching={setProductionDeliveryDetailsFillGridByStitching}

                              />

                      }


                      {/* (productionReceiptDetails && !isPacking()) && */}




                      {/* {isStitching() &&
                        <fieldset className='h-[170px] frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 overflow-auto'>
                          <legend className='sub-heading'>Panel Consumption Details</legend>
                          <FabricConsumptionDetails
                            id={id}
                            productionDeliveryId={productionDeliveryId}
                            productionReceiptDetails={productionReceiptDetails}
                            setProductionReceiptDetails={setProductionReceiptDetails}
                            productionDeliveryDetailsFillData={productionDeliveryDetailsFillData}
                            setFillGrid={setProductionDeliveryDetailsFillGrid}
                            readOnly={readOnly}
                            isStitching={isStitching}
                            setProductionDeliveryDetailsFillGridByStitching={setProductionDeliveryDetailsFillGridByStitching}
                          />
                        </fieldset>
                      } */}
                    </div>
                    <Consolidation totalQty={getTotalIssuedQty()} vehicleNo={vehicleNo}
                      setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks} readOnly={readOnly}
                      specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions} />

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