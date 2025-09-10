import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useGetCuttingDeliveryQuery,
  useGetCuttingDeliveryByIdQuery,
  useAddCuttingDeliveryMutation,
  useUpdateCuttingDeliveryMutation,
  useDeleteCuttingDeliveryMutation,
} from "../../../redux/uniformService/CuttingDeliveryServices";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { DropdownInput, DateInput, DisabledInput, TextInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { useDispatch } from "react-redux";
import { findFromList, getCommonParams, getDateFromDateTime, isGridDatasValid } from "../../../Utils/helper";
import moment from "moment";
import { Loader } from "../../../Basic/components";
import _ from "lodash";

import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import {
  useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import Modal from "../../../UiComponents/Modal";
import CuttingDeliveryDetails from "./CuttingDeliveryDetails";
import CuttingDeliveryFormReport from "./CuttingDeliveryFormReport";
import {
  useGetCuttingOrderQuery,
  useGetCuttingOrderByIdQuery,
} from "../../../redux/uniformService/CuttingOrderService";
import CuttingOrderFillGrid from "./CuttingOrderFillGrid";
import StockSelectionFillGrid from "./StockFillGrid";
import Consolidation from "./Consolidation";
import PrintFormatCuttingDelivery from "../PrintFormat-CuttingDelivery";
import { useReactToPrint } from "@etsoo/reactprint";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import PrintFormat from "./PrintFormat-CD";

const MODEL = "Cutting Delivery";

export default function Form() {

  // const componentRef = useRef();
  // const handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  // });


  const dispatch = useDispatch()

  const today = new Date()
  const [id, setId] = useState("");
  const [form, setForm] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [processId, setProcessId] = useState("");
  const [locationId, setLocationId] = useState('');
  const [cuttingOrderId, setCuttingOrderId] = useState("");
  const [docId, setDocId] = useState("");
  const [stockDetailsFillGrid, setStockDetailsFillGrid] = useState(false);
  const [deliveryToId, setDeliveryToId] = useState("")
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));


  
  const [cuttingDeliveryDetails, setCuttingDeliveryDetails] = useState([])

  const [storeId, setStoreId] = useState("")

  const [supplierId, setSupplierId] = useState("");

  const [delNo, setDelNo] = useState("")

  const [delDate, setDelDate] = useState(getDateFromDateTime(today))
  const [dueDate, setDueDate] = useState("")

  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [vehicleNo, setVehicleNo] = useState("");

  const [styleId, setStyleId] = useState("");
  const [active, setActive] = useState(true)

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [cuttingOrderFillGrid, setCuttingOrderFillGrid] = useState(false);
  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    companyId
  };
  const { data: locationData, isLoading: isLocationLoading, isFetching: isLocationFetching } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params: { companyId } });
  const { data: styleList, isLoading: isStyleLoading, isFetching: isStyleFetching } = useGetStyleMasterQuery({ params, searchParams: searchValue });
  const { data: allData, isLoading, isFetching } = useGetCuttingDeliveryQuery({ params: { branchId, finYearId }, searchParams: searchValue });
  const { data: cuttingOrderList, isLoading: isCuttingOrderLoading, isFetching: isCuttingOrderFetching } = useGetCuttingOrderQuery({ params: { branchId } });
  const { data: supplierList } =
    useGetPartyQuery({ params });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCuttingDeliveryByIdQuery(id, { skip: !id });

  const {
    data: cuttingOrderDetails,
    isFetching: isCuttingDeliveryFetching,
    isLoading: isCuttingDeliveryLoading,
  } = useGetCuttingOrderByIdQuery({ id: cuttingOrderId }, { skip: !cuttingOrderId });


  const [addData] = useAddCuttingDeliveryMutation();
  const [updateData] = useUpdateCuttingDeliveryMutation();
  const [removeData] = useDeleteCuttingDeliveryMutation();

  const getNextDocId = useCallback(() => {
    if (id) return
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
    // setProcessId(data?.prevProcessId ? data?.prevProcessId : "")
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDeliveryToId(data?.deliveryId ? data?.deliveryId : "");
    setLocationId(data?.storeId ? findFromList(data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(data?.storeId ? data?.storeId : "");
    setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
    setCuttingDeliveryDetails(data?.CuttingDeliveryDetails ? data?.CuttingDeliveryDetails : []);
    setCuttingOrderId(data?.cuttingOrderId ? data?.cuttingOrderId : "")
    setStyleId(data?.cuttingOrderId ? findFromList(data.cuttingOrderId, cuttingOrderList ? cuttingOrderList.data : [], "styleId") : "");
    setActive(id ? (data?.active ? data.active : false) : true);
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setDueDate(data?.dueDate ? getDateFromDateTime(data?.dueDate) : "")
  }, [id]);

  useEffect(() => { if (!id) { setDeliveryToId(supplierId) } }, [supplierId])

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);





  const data = {
    delNo,
    delDate,
    dueDate,
    supplierId,
    branchId,
    storeId,

    vehicleNo,
    specialInstructions,
    remarks,

    deliveryId: deliveryToId,
    cuttingOrderId,
    cuttingDeliveryDetails: cuttingDeliveryDetails.map(item => {
      if (id) return item
      return {

        fabricId: item.fabricId,
        colorId: item.colorId,
        designId: item.designId,
        gsmId: item.gsmId,
        loopLengthId: item.loopLengthId,
        gaugeId: item.gaugeId,
        kDiaId: item.kDiaId,
        fDiaId: item.fDiaId,
        uomId: item.uomId,
        stockRolls: item.stockRolls,
        stockQty: item.stockQty,
        stockPrice: item?.price,
        storeId: item.storeId,
        delRolls: item?.delRolls ? item.delRolls : 0,
        delQty: item?.delQty ? item.delQty : 0,
        lotNo: item?.lotNo ? item.lotNo : undefined,
      }
    }),
    id, userId, finYearId
  }
  const validateData = (data) => {
    let cuttingDeliveryValidationFields = ["delQty", "delRolls"]
    return data.supplierId
      && data.cuttingDeliveryDetails.length !== 0
      && isGridDatasValid(data.cuttingDeliveryDetails, false, cuttingDeliveryValidationFields)
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
        type: `CuttingOrder/invalidateTags`,
        payload: ['CuttingOrder'],
      });
      dispatch({
        type: `stock/invalidateTags`,
        payload: ['Stock'],
      });
    } catch (error) {
      console.log("handle", error);
    }
  };



  useEffect(() => {
    if (!cuttingOrderId) return
    if (!cuttingDeliveryDetails.length !== 0) return
    setStockDetailsFillGrid(true)
  }, [cuttingOrderId, cuttingDeliveryDetails])


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
    const totalQty = cuttingDeliveryDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.delQty ? currentValue?.delQty : 0))
    }, 0)
    return totalQty
  }
  useEffect(() => {
    setSupplierId(cuttingOrderDetails?.data?.partyId)

  }, [cuttingOrderDetails, isCuttingDeliveryFetching, isCuttingDeliveryLoading])



  if (!form)
    return (
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        loading={
          isLocationLoading || isLocationFetching
        }
        setForm={setForm}
        data={allData?.data}
        onClick={onDataClick}
        onNew={onNew}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        // printFormat={id ? () =>  {setPrintFormat(true)} : undefined}
      />
    );

  const allSuppliers = supplierList ? supplierList.data : []


  const getIssuedPropertyFabric = (stockItem, property) => {



    const stockItemIssuedDetails = cuttingDeliveryDetails.filter(item =>
      !(
        stockItem.fabricId === item.fabricId
        &&
        stockItem.designId === item.designId
        &&
        stockItem.gaugeId === item.gaugeId
        &&
        stockItem.loopLengthId === item.loopLengthId
        &&
        stockItem.gsmId === item.gsmId
        &&
        stockItem.kDiaId === item.kDiaId
        &&
        stockItem.fDiaId === item.fDiaId
        &&
        stockItem.colorId === item.colorId
        &&
        stockItem.uomId === item.uomId
        &&
        stockItem.lotNo == item.lotNo

        &&
        stockItem.storeId === item.storeId
      )
    )



    const totalQty = stockItemIssuedDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue[property] ? currentValue[property] : 0))
    }, 0)
    return totalQty
  }


  if (isLocationFetching || isLocationLoading || isStyleLoading || isStyleFetching || isCuttingDeliveryLoading || isCuttingDeliveryFetching) return <Loader />
  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  const styleOnColor = findFromList(styleId, styleList ? styleList.data : [], "StyleOnColor")
  const colorIds = styleId ? (styleOnColor ? styleOnColor.map(item => parseInt(item.colorId)) : []) : []
  function isColorInStyle(colorId) {
    return styleId ? colorIds.includes(parseInt(colorId)) : true
  }



  return (
    <>
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        <CuttingDeliveryFormReport
          heading={MODEL}
          tableDataNames={tableDataNames}
          loading={
            isLoading || isFetching
          }
          allData={allData}
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
      <Modal isOpen={stockDetailsFillGrid} onClose={() => { setStockDetailsFillGrid(false) }} widthClass={"bg-gray-300"}>
        <StockSelectionFillGrid styleId={styleId} getIssuedPropertyFabric={getIssuedPropertyFabric}
          setFillGrid={setStockDetailsFillGrid} storeId={storeId} setRawMaterials={setCuttingDeliveryDetails} rawMaterials={cuttingDeliveryDetails} />
      </Modal>
      <Modal isOpen={cuttingOrderFillGrid} onClose={() => { setCuttingOrderFillGrid(false) }} widthClass={"bg-gray-300 w-[90%] h-[70%]"}>
        <CuttingOrderFillGrid setFillGrid={setCuttingOrderFillGrid} setCuttingOrderId={setCuttingOrderId} supplierId={supplierId} styleId={styleId} isCuttingDeliveryFilter />
      </Modal>
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat
            data={id ? singleData?.data : "Null"}
            singleData={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            docId={docId ? docId : ""}
            cuttingDeliveryDetails={cuttingDeliveryDetails}
          />
        </PDFViewer>
      </Modal>
      {/* <div className="hidden">
        <PrintFormatCuttingDelivery
          remarks={remarks}
          innerRef={componentRef}
          poNumber={docId}
          poDate={delDate}
          poItems={cuttingDeliveryDetails.filter(item => item.yarnId || item.accessoryId || item.fabricId)}
          supplierDetails={supplierList ? supplierList.data : null} singleData={singleData ? singleData.data : null}
          deliveryToId={deliveryToId}
        />
      </div> */}
      <div
        onKeyDown={handleKeyDown}
        className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto"
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
                  <div className={`grid ${formReport ? "grid-cols-12" : "grid-cols-1"} h-full relative overflow-auto`}>
                    <div className={`${formReport ? "col-span-9" : "col-span-1"}`}>
                      <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 p-1 overflow-auto'>
                        <legend className='sub-heading'>Fabric Delivery To Cutting</legend>
                        <div className='flex flex-col justify-center items-start flex-1 w-full'>
                          <div className="grid grid-cols-5 w-full">
                            <DisabledInput name={"Delivery No"} value={docId} />
                            <DateInput name="Del. Date" value={delDate} type={"date"} required={true} disabled />
                            <TextInput name={"Due. Date"} value={dueDate} setValue={setDueDate} type={"date"} readOnly={readOnly} />
                            <DropdownInput name="Location"
                              options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                              value={locationId}
                              setValue={(value) => { setLocationId(value); setStoreId("") }}
                              required={true} readOnly={id || readOnly} />
                            <DropdownInput name="Store"
                              options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                              value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                            <div className="grid grid-cols-12 items-center">{console.log(cuttingOrderDetails, "cuttingOrderDetails")}
                              <div className="col-span-10">
                                <DisabledInput name={"Cutting Order"} value={cuttingOrderDetails ? cuttingOrderDetails.data.docId : ""} />
                              </div>
                              {!readOnly &&
                                <button className="p-0.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white -ml-6"
                                  onClick={() => {


                                    setCuttingOrderFillGrid(true)
                                  }}
                                  onKeyDown={(e) => { if (e.key === "Enter") { setCuttingOrderFillGrid(true) } }}
                                >Select</button>
                              }
                            </div>
                            <DropdownInput name="Supplier" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />
                            <DropdownInput name="Delivery To" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={id || readOnly} />


                          </div>
                        </div>
                      </fieldset>
                      <CuttingDeliveryDetails
                        storeId={storeId}
                        openStockGrid={() => {
                          if (!storeId) return toast.info("Please Choose Store...!")
                          setStockDetailsFillGrid(true)
                        }}
                        id={id} cuttingDeliveryDetails={cuttingDeliveryDetails} setCuttingDeliveryDetails={setCuttingDeliveryDetails} readOnly={readOnly} />
                    </div>
                    <Consolidation specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions} vehicleNo={vehicleNo} setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks} totalQty={getTotalIssuedQty()} />
                    <div className={`frame h-[500px] overflow-x-hidden ${formReport ? "block" : "hidden"} col-span-3`}>
                      <FormReport
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        setId={setId}
                        tableHeaders={tableHeaders}
                        tableDataNames={tableDataNames}
                        data={allData?.data ? allData?.data : []}
                        loading={
                          isLocationLoading || isLocationFetching
                        }
                      />
                    </div>
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