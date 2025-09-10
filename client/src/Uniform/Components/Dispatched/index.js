import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

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
import { useGetProductionReceiptByIdQuery, useGetProductionReceiptQuery } from "../../../redux/uniformService/ProductionReceiptServices";
import { useAddDispatchedMutation, useDeleteDispatchedMutation, useGetDispatchedByIdQuery, useGetDispatchedQuery, useUpdateDispatchedMutation } from "../../../redux/uniformService/DispatchedServices";
import DispatchedDetails from "./DispatchedDetails";
import { ProductionReceipt } from "..";
import ProductionReceiptDropdown from "../ReusableComponents/ProductionReceiptDropdown";

const MODEL = "Dispatched";

export default function Form() {

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const dispatch = useDispatch()
  const [orderId, setOrderId] = useState('');
  const [productionReceiptId, setProductionReceiptId] = useState("")
  const today = new Date()
  const [id, setId] = useState("");
  const [form, setForm] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [docId, setDocId] = useState("");
  const [stockDetailsFillGrid, setStockDetailsFillGrid] = useState(false);
  const [deliveryToId, setDeliveryToId] = useState("")
  const [dispatchedDetails, setDispatchedDetails] = useState([])


  const [storeId, setStoreId] = useState("")

  const [supplierId, setSupplierId] = useState("");

  const [delDate, setDelDate] = useState(getDateFromDateTime(today))

  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [vehicleNo, setVehicleNo] = useState("");
  const [partyId, setPartyId] = useState("")
  const [formReport, setFormReport] = useState(false);
  const [dispatchedType, setDispatchedType] = useState("")

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);


  const { branchId, companyId, finYearId, userId } = getCommonParams()


  const params = {
    companyId
  };
  const { data: locationData, isLoading: isLocationLoading, isFetching: isLocationFetching } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const { data: allData, isLoading, isFetching } = useGetDispatchedQuery({ params: { branchId, finYearId }, searchParams: searchValue });
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
    data: singleReceiptData,
    isFetching: isSingleReceiptFetching,
    isLoading: isSingleReceiptLoading,
  } = useGetProductionReceiptByIdQuery({ id: productionReceiptId }, { skip: !productionReceiptId });

  console.log(singleReceiptData, "singleReceiptData")

  useEffect(() => {
    setLocationId(singleReceiptData?.data?.storeId ? findFromList(singleReceiptData?.data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(singleReceiptData?.data?.storeId ? singleReceiptData?.data?.storeId : "");
    setPartyId(singleReceiptData?.data?.Order?.partyId);
    setDispatchedDetails(singleReceiptData?.data?.productionReceiptDetails?.map(val => { return { ...val, delQty: val?.receivedQty } }) || [])

  }, [singleReceiptData, isSingleReceiptFetching, isSingleReceiptLoading])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetDispatchedByIdQuery({ id }, { skip: !id });

  const [addData] = useAddDispatchedMutation();
  const [updateData] = useUpdateDispatchedMutation();
  const [removeData] = useDeleteDispatchedMutation();


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
    setDispatchedType(data?.dispatchedType ? data?.dispatchedType : "")

    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDeliveryToId(data?.deliveryId ? data?.deliveryId : "");
    setLocationId(data?.storeId ? findFromList(data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(data?.storeId ? data?.storeId : "");
    setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
    setDispatchedDetails(data?.dispatchedDetails || []);
    setProductionReceiptId(data?.productionReceiptId ? data?.productionReceiptId : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")

  }, [id]);

  useEffect(() => { if (!id) { setDeliveryToId(supplierId) } }, [supplierId, id]);

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



  const data = {
    supplierId,
    dispatchedType,
    branchId,
    storeId,
    productionReceiptId,
    vehicleNo,
    specialInstructions,
    remarks,
    deliveryId: deliveryToId,
    dispatchedDetails,
    id, userId,
    finYearId,
    orderId
  }



  // function packingValidation() {
  //   const isPacking = findFromList(processIdTo, (processList?.data ? processList?.data : []), "isPacking");
  //   if (!isPacking) return true;
  //   const groupedItems = groupByMultipleKeys(productionDeliveryDetails, ["colorId", "sizeId", "prevProcessId"]);
  //   return groupedItems.every(item => {
  //     if (item.length !== styleDetail?.data?.portionDetails.length) return false;
  //     let delQty = parseFloat(item[0]?.delQty ? item[0]?.delQty : 0);
  //     return item.every(i => parseFloat(i.delQty) === delQty)
  //   })
  // }

  const validateData = (data) => {
    return data.vehicleNo &&
      data.storeId && data.orderId
      && data.dispatchedDetails.length > 0
      && isGridDatasValid(data.dispatchedDetails, false, ["delQty"])
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
  };



  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = ["Po", "Status"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']

  const getTotalIssuedQty = () => {
    const totalQty = dispatchedDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.delQty ? currentValue?.delQty : 0))
    }, 0)
    return totalQty
  }

  if (isLocationFetching || isLocationLoading) return <Loader />
  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];
  return (
    <>{console.log(allData, "alladata")}
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
      {/* <Modal isOpen={stockDetailsFillGrid} onClose={() => { setStockDetailsFillGrid(false) }} widthClass={"bg-gray-300 h-[500px]"}>
        <ProductionDetailsFillGrid
          isStitching={isStitching}
          storeId={storeId}
          processIdTo={processIdTo}
          orderId={orderId}
          setFillGrid={setStockDetailsFillGrid} productionDeliveryDetails={productionDeliveryDetails}
          setProductionDeliveryDetails={setProductionDeliveryDetails} fromProcessId={processIdFrom} itemId={itemId} />
      </Modal>  */}

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
            onPrint={id ? handlePrint : null}
            openReport={() => setFormReport(true)}
            childRecord={childRecord.current}
          />
          <div className="flex-1 grid gap-x-2">
            <div className="col-span-3 grid overflow-auto">
              <div className='col-span-3 grid overflow-auto'>
                <div className='mr-1'>
                  <div >
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto'>
                      <legend className='sub-heading'>Dispatched</legend>
                      <div className='flex flex-col justify-center items-start flex-1 w-full'>
                        <div className="grid grid-cols-4 w-full">
                          <DisabledInput name={"Dispatched No"} value={docId} />
                          <DateInput name="Del. Date" value={delDate} type={"date"} required={true} disabled />
                          <OrderDropdown name={"Order"} readOnly={readOnly} selected={orderId} setSelected={setOrderId} partyId={supplierId} />
                          <ProductionReceiptDropdown name={"PackingReceipt"} readOnly={readOnly} selected={productionReceiptId} setSelected={setProductionReceiptId} partyId={supplierId} orderId={orderId} />
                          {/* <DropdownInput name="PackingReceipt"
                            options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                          <> */}
                          <DropdownInput name="Location"
                            options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                            value={locationId}
                            setValue={(value) => { setLocationId(value); setStoreId("") }}
                            required={true} readOnly={true} />
                          <DropdownInput name="Store"
                            options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} required={true} readOnly={true} />

                          <>
                            <DropdownInput name="Party" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={partyId} setValue={setPartyId} required={true} readOnly={true} />
                            {/* <DropdownInput name="Delivery To" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} /> */}
                          </>

                        </div>
                      </div>
                    </fieldset>
                    <DispatchedDetails itemList={styleList}
                      colorList={colorList} sizeList={sizeList} id={id} readOnly={readOnly}
                      setStockDetailsFillGrid={setStockDetailsFillGrid}
                      dispatchedDetails={dispatchedDetails} setDispatchedDetails={setDispatchedDetails}
                      storeId={storeId} orderId={orderId} />
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