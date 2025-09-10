import React, { useEffect, useState, useRef, useCallback } from "react";

import {
  useGetCuttingReceiptQuery,
  useGetCuttingReceiptByIdQuery,
  useAddCuttingReceiptMutation,
  useUpdateCuttingReceiptMutation,
  useDeleteCuttingReceiptMutation,
} from "../../../redux/uniformService/CuttingReceiptServices";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
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
import _ from "lodash";

import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import {
  useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import Modal from "../../../UiComponents/Modal";
import CuttingReceiptInwardDetails from "./CuttingReceiptInwardDetails";
import CuttingReceiptFormReport from "./CuttingReceiptFormReport";
import {
  useGetCuttingOrderQuery,
  useGetCuttingOrderByIdQuery,
} from "../../../redux/uniformService/CuttingOrderService";
// import CuttingOrderFillGrid from "../../../ERP/Components/CuttingDelivery/CuttingOrderFillGrid";
import CuttingOrderFillGrid from "../../../Uniform/Components/CuttingDelivery/CuttingOrderFillGrid";
import FabricConsumptionDetails from "./FabricConsumptionDetails";
import CuttingOrderDetailsFillGrid from "./CuttingOrderDetailsFillGrid";
import CuttingDeliveryFabricConsumptionFillGrid from "./CuttingDeliveryFabricConsumptionFillGrid";
import Consolidation from "./Consolidation";
import PrintFormat from "./PrintFormat-CR/index";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";

const MODEL = "Cutting Receipt";

export default function Form() {
  const dispatch = useDispatch()
  const today = new Date()
  const [id, setId] = useState("");
  const [form, setForm] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [locationId, setLocationId] = useState('');
  const [cuttingOrderId, setCuttingOrderId] = useState("");
  const [docId, setDocId] = useState("");
  const [deliveryFromId, setDeliveryFromId] = useState("")
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [date, setDate] = useState("");

  const [cuttingReceiptInwardDetails, setCuttingReceiptInwardDetails] = useState([]);
  const [cuttingReceiptFabricConsumptionDetails, setCuttingReceiptFabricConsumptionDetails] = useState([]);

  const [cuttingReceiptInwardDetailsFillData, setCuttingReceiptInwardDetailsFillData] = useState([])
  const [cuttingReceiptFabricConsumptionFillData, setCuttingReceiptFabricConsumptionFillData] = useState([])

  const [storeId, setStoreId] = useState("")

  const [supplierId, setSupplierId] = useState("");

  const [delNo, setDelNo] = useState("")

  const [delDate, setDelDate] = useState(getDateFromDateTime(today))

  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [vehicleNo, setVehicleNo] = useState("");

  const [styleId, setStyleId] = useState("");
  const [active, setActive] = useState(true)

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [cuttingOrderFillGrid, setCuttingOrderFillGrid] = useState(false);
  const childRecord = useRef(0);
  const [dcNo, setDcNo] = useState("")
  const [cuttingOrderDetailsFillGrid, setCuttingOrderDetailsFillGrid] = useState(false);
  const [cuttingOrderFabricConsumptionFillGrid, setCuttingOrderFabricConsumptionFillGrid] = useState(false)

  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    companyId
  };
  const { data: locationData, isLoading: isLocationLoading, isFetching: isLocationFetching } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: itemList, isLoading: isStyleLoading, isFetching: isStyleFetching } = useGetItemMasterQuery({ params, searchParams: searchValue });
  const { data: cuttingOrderList } = useGetCuttingOrderQuery({ params: { branchId } });
  const { data: supplierList } =
    useGetPartyQuery({ params });

  const { data: allData, isLoading, isFetching } = useGetCuttingReceiptQuery({ params: { branchId, finYearId }, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCuttingReceiptByIdQuery(id, { skip: !id });
  const {
    data: cuttingOrderDetails,
    isFetching: isCuttingOrderDetailsFetching,
    isLoading: isCuttingOrderDetailsLoading,
  } = useGetCuttingOrderByIdQuery({ id: cuttingOrderId, cuttingReceiptId: id }, { skip: !cuttingOrderId });


  console.log(cuttingOrderDetails, "cuttingOrderDetails")

  useEffect(() => {
    if (id) return
    if (!cuttingOrderDetails?.data) return
    setCuttingReceiptInwardDetailsFillData(cuttingOrderDetails.data.cuttingOrderDetailsForReceipt)
    let newDeliveryDetails = []
    cuttingOrderDetails.data.CuttingDelivery.forEach(delItem => {
      delItem.CuttingDeliveryDetails.forEach(fabricItem => [
        newDeliveryDetails.push({ docId: delItem.docId, ...fabricItem })
      ])
    })
    setCuttingReceiptFabricConsumptionFillData(newDeliveryDetails)
  }, [cuttingOrderDetails, isCuttingOrderDetailsFetching, isCuttingOrderDetailsLoading])


  const [addData] = useAddCuttingReceiptMutation();
  const [updateData] = useUpdateCuttingReceiptMutation();
  const [removeData] = useDeleteCuttingReceiptMutation();

  useEffect(() => {
    if (!cuttingOrderId) return
    if (cuttingReceiptInwardDetails.length === 0) {
      setCuttingOrderDetailsFillGrid(true);
    }
    if (cuttingReceiptFabricConsumptionDetails.length === 0) {
      setCuttingOrderFabricConsumptionFillGrid(true);
    }
  }, [cuttingOrderId, cuttingReceiptInwardDetails, cuttingReceiptFabricConsumptionDetails])

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
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDeliveryFromId(data?.deliveryFromId ? data?.deliveryFromId : "");
    setLocationId(data?.storeId ? findFromList(data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(data?.storeId ? data?.storeId : "");
    setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
    setCuttingOrderId(data?.cuttingOrderId ? data?.cuttingOrderId : "")
    setStyleId(data?.cuttingOrderId ? findFromList(data.cuttingOrderId, cuttingOrderList ? cuttingOrderList.data : [], "styleId") : "");
    setActive(id ? (data?.active ? data.active : false) : true);
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    setDcNo(data?.supplierDc ? data.supplierDc : "");
    setCuttingReceiptInwardDetails(data?.CuttingReceiptInwardDetails ? data.CuttingReceiptInwardDetails : [])
    setCuttingReceiptFabricConsumptionDetails(data?.CuttingReceiptFabricConsumptionDetails ? data.CuttingReceiptFabricConsumptionDetails : [])
  }, [id]);

  useEffect(() => {
    if (!id) {
      setDeliveryFromId(supplierId)
    }
  },
    [supplierId])

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
    supplierId,
    branchId,
    storeId,
    styleId,
    deliveryFromId,
    cuttingOrderId,
    cuttingReceiptInwardDetails,
    cuttingReceiptFabricConsumptionDetails,
    vehicleNo,
    remarks,
    specialInstructions,
    supplierDc: dcNo,
    id, userId, finYearId
  }

  const validateData = (data) => {
    let inwardDetails = ["receivedQty"];
    let rawMaterialMandatoryDetails = ["consumption"]
    let rawMaterialConsumptionLoss = ["lossReasonId", "lossQty"]
    return data.cuttingOrderId && data.supplierId
      && data.cuttingReceiptInwardDetails.length !== 0
      && isGridDatasValid(data.cuttingReceiptInwardDetails, false, inwardDetails)
      && isGridDatasValid(data.cuttingReceiptFabricConsumptionDetails, false, rawMaterialMandatoryDetails)


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

  useEffect(() => {
    setSupplierId(cuttingOrderDetails?.data?.partyId)

  }, [cuttingOrderDetails, isCuttingOrderDetailsFetching, isCuttingOrderDetailsLoading])


  function isSupplierDcRequired() {

    if (cuttingOrderDetails?.data?.deliveryType == "ToParty") {
      return true
    }
    else {
      return false
    }
  }


  const tableHeaders = ["Po", "Status"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']


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
      />
    );

  if (isLocationFetching || isLocationLoading || isStyleLoading || isStyleFetching || isCuttingOrderDetailsLoading || isCuttingOrderDetailsFetching) return <Loader />
  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  const styleOnColor = findFromList(styleId, itemList ? itemList.data : [], "StyleOnColor")
  const colorIds = styleId ? (styleOnColor ? styleOnColor.map(item => parseInt(item.colorId)) : []) : []
  function isColorInStyle(colorId) {
    return styleId ? colorIds.includes(parseInt(colorId)) : true
  }
  const getTotalIssuedQty = () => {
    const totalQty = cuttingReceiptInwardDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.receivedQty ? currentValue?.receivedQty : 0))
    }, 0)
    return totalQty
  }

  return (
    <>
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        <CuttingReceiptFormReport
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
      <Modal isOpen={cuttingOrderFillGrid} onClose={() => { setCuttingOrderFillGrid(false) }} widthClass={"bg-gray-300 w-[90%] h-[70%]"}>
        <CuttingOrderFillGrid styleId={styleId} setFillGrid={setCuttingOrderFillGrid} setCuttingOrderId={setCuttingOrderId} supplierId={supplierId} isCuttingReceiptFilter />
      </Modal>
      <Modal isOpen={cuttingOrderDetailsFillGrid} onClose={() => { setCuttingOrderDetailsFillGrid(false) }} widthClass={"bg-gray-300"}>
        <CuttingOrderDetailsFillGrid
          cuttingReceiptInwardDetails={cuttingReceiptInwardDetails}
          setCuttingReceiptInwardDetails={setCuttingReceiptInwardDetails}
          cuttingReceiptInwardDetailsFillData={cuttingReceiptInwardDetailsFillData}
          setCuttingReceiptInwardDetailsFillData={setCuttingReceiptInwardDetailsFillData}
          styleId={styleId} onDone={() => { setCuttingOrderDetailsFillGrid(false) }} />
      </Modal>
      <Modal isOpen={cuttingOrderFabricConsumptionFillGrid} onClose={() => { setCuttingOrderFabricConsumptionFillGrid(false) }} widthClass={"bg-gray-300 h-[90%]"}>
        <CuttingDeliveryFabricConsumptionFillGrid
          cuttingReceiptFabricConsumptionDetails={cuttingReceiptFabricConsumptionDetails}
          setCuttingReceiptFabricConsumptionDetails={setCuttingReceiptFabricConsumptionDetails}
          cuttingReceiptFabricConsumptionFillData={cuttingReceiptFabricConsumptionFillData}
          setCuttingReceiptFabricConsumptionFillData={setCuttingReceiptFabricConsumptionFillData}
          styleId={styleId} onDone={() => { setCuttingOrderFabricConsumptionFillGrid(false) }} />
      </Modal>
      <Modal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        widthClass={"w-[90%] h-[90%]"}
      >
        <PDFViewer style={tw("w-full h-full")}>
          <PrintFormat
            singleData={id ? singleData?.data : "Null"}
            date={id ? singleData?.data?.selectedDate : date}
            docId={docId ? docId : ""}

          />
        </PDFViewer>
      </Modal>
      <div
        onKeyDown={handleKeyDown}
        className="md:items-start md:justify-items-center grid min-h-[800px] bg-theme overflow-auto"
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
                            <div className="grid grid-cols-12 items-center">
                              <div className="col-span-10">
                                <DisabledInput name={"Cutting Order"} value={cuttingOrderDetails ? cuttingOrderDetails.data.docId : ""} />
                              </div>
                              {!readOnly &&
                                <button className="p-0.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white -ml-6"
                                  onClick={() => {
                                    // if (!supplierId) {
                                    //   toast.info("Please Select  SupplierId ", { position: "top-center" })
                                    //   return
                                    // }
                                    setCuttingOrderFillGrid(true)
                                  }}
                                  onKeyDown={(e) => { if (e.key === "Enter") { setCuttingOrderFillGrid(true) } }}
                                >Select</button>
                              }
                            </div>
                            <DropdownInput name="Supplier" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />
                            {/* <DropdownInput name="From" options={supplierList ? (dropDownListObject(id ? supplierList.data : supplierList.data.filter(item => item.active), "name", "id")) : []} value={deliveryFromId} setValue={setDeliveryFromId} required={true} readOnly={id || readOnly} /> */}
                            {
                              isSupplierDcRequired() &&
                              <TextInput name="Supplier Dc" type="text" value={dcNo} setValue={setDcNo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />


                            }


                          </div>
                        </div>
                      </fieldset>

                      {
                        cuttingOrderDetails &&
                        <CuttingReceiptInwardDetails
                          id={id}
                          cuttingOrderId={cuttingOrderId}
                          cuttingReceiptInwardDetails={cuttingReceiptInwardDetails}
                          setCuttingReceiptInwardDetails={setCuttingReceiptInwardDetails}
                          cuttingReceiptInwardDetailsFillData={cuttingReceiptInwardDetailsFillData}
                          setFillGrid={setCuttingOrderDetailsFillGrid}
                          readOnly={readOnly} />
                      }

                      {cuttingOrderDetails &&
                        <fieldset className=' min-h-[180px] frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 overflow-auto'>
                          <legend className='sub-heading'>Fabric Consumption Details</legend>
                          <FabricConsumptionDetails
                            id={id}
                            cuttingOrderId={cuttingOrderId}
                            cuttingReceiptFabricConsumptionDetails={cuttingReceiptFabricConsumptionDetails}
                            setCuttingReceiptFabricConsumptionDetails={setCuttingReceiptFabricConsumptionDetails}
                            cuttingReceiptFabricConsumptionFillData={cuttingReceiptFabricConsumptionFillData}
                            setCuttingReceiptFabricConsumptionFillData={setCuttingReceiptFabricConsumptionFillData}
                            setFillGrid={setCuttingOrderFabricConsumptionFillGrid}
                            readOnly={readOnly} />
                        </fieldset>
                      }
                    </div>
                    <Consolidation totalQty={getTotalIssuedQty()} vehicleNo={vehicleNo} setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks}
                      specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions} />
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