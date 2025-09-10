import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  useGetProcessDeliveryQuery,
  useGetProcessDeliveryByIdQuery,
  useAddProcessDeliveryMutation,
  useUpdateProcessDeliveryMutation,
  useDeleteProcessDeliveryMutation,
} from "../../../redux/uniformService/ProcessDeliveryServices";
import {
  useGetProcessMasterQuery,
} from "../../../redux/uniformService/ProcessMasterService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { LongDropdownInput, DropdownInput, TextInput, DateInput, DisabledInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { useDispatch } from "react-redux";
import { filterGodown, findFromList, getCommonParams, getDateFromDateTime, getItemFullNameFromShortCode, isGridDatasValid } from "../../../Utils/helper";
import moment from "moment";
import { Loader } from "../../../Basic/components";
import Program from "../ProcessDeliveryProgram"
import RawMaterial from "../ProcessDeliveryRawMaterial";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import _ from "lodash";
import Consolidation from "./Consolidation";
// import PrintFormatYarnDeliveryToKnitting from "../PrintFormat-YarnDeliveryToKnitting"
import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import {
  useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import Modal from "../../../UiComponents/Modal";
import ProcessDeliveryFormReport from "./ProcessDeliveryFormReport";
import { useReactToPrint } from "@etsoo/reactprint";
import { useGetOrderQuery } from "../../../redux/uniformService/OrderService";

const MODEL = "Process Delivery";


export default function Form() {

  const componentRef = useRef();
  const dispatch = useDispatch()
  const today = new Date()
  const [id, setId] = useState("");
  const [form, setForm] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [processId, setProcessId] = useState("");
  const [locationId, setLocationId] = useState('');
  const [docId, setDocId] = useState("")

  const [storeId, setStoreId] = useState("")

  const [programDetails, setProgramDetails] = useState([])

  const [supplierId, setSupplierId] = useState("");

  const [autoDeliveryDate, setAutoDeliveryDate] = useState(getDateFromDateTime(today));
  const [delDate, setDelDate] = useState("")
  const [dueDate, setDueDate] = useState("")

  const [currentProgramIndex, setCurrentProgramIndex] = useState(-1);

  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [vehicleNo, setVehicleNo] = useState("");

  const [styleId, setStyleId] = useState("");

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const rawMaterialRef = useOutsideClick(() => setCurrentProgramIndex(-1));

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: docId,
    pageStyle: ` `
  });
  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    companyId
  };
  const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessMasterQuery({ params: { ...params, isPcsStage: true } });
  const { data: locationData, isLoading: isLocationLoading, isFetching: isLocationFetching } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: styleList, isLoading: isStyleLoading, isFetching: isStyleFetching } = useGetItemMasterQuery({ params, searchParams: searchValue });
  const { data: orderList, isLoading: isOrderLoading, isFetching: isOrderFetching } = useGetOrderQuery({ params: { branchId } });

  const { data: supplierList } =
    useGetPartyQuery({ params });
  const { data: allData, isLoading, isFetching } = useGetProcessDeliveryQuery({ params: { branchId, processId, docIdOnly: true, finYearId }, searchParams: searchValue });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProcessDeliveryByIdQuery({ id }, { skip: !id });

  const getNextDocId = useCallback(() => {
    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])


  const [addData] = useAddProcessDeliveryMutation();
  const [updateData] = useUpdateProcessDeliveryMutation();
  const [removeData] = useDeleteProcessDeliveryMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    if (data?.createdAt) setAutoDeliveryDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
    setDelDate(data?.delDate ? moment.utc(data?.delDate).format("YYYY-MM-DD") : "");
    setDueDate(data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "");
    setProcessId(data?.processId ? data?.processId : "")
    setProgramDetails(data?.ProcessDeliveryProgramDetails ? data?.ProcessDeliveryProgramDetails : [])
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setLocationId(data?.storeId ? findFromList(data?.storeId, (locationData?.data ? locationData.data : []), "locationId") : "")
    setStoreId(data?.storeId ? data?.storeId : "");
    setVehicleNo(data?.vehicleNo ? data.vehicleNo : "");
    setRemarks(data?.remarks ? data?.remarks : "");
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setStyleId(data?.styleId ? data.styleId : "");
    if (data?.docId) {
      setDocId(data?.docId)
    }
  }, [id, locationData]);

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    delDate,
    dueDate,
    supplierId,
    branchId,
    storeId,
    processId,
    vehicleNo,
    specialInstructions,
    remarks,
    styleId,
    programDetails: structuredClone(programDetails).filter(program => program.yarnId || program.fabricId).filter(program => {
      program["rawMaterials"] = program["rawMaterials"].filter(raw => raw.yarnId || raw.fabricId);
      return program
    }),
    itemType: (processId && processList?.data) ? (getItemFullNameFromShortCode(findFromList(processId, processList?.data, "io")?.toString().split("_").at(0))) : "",
    id, userId,
    finYearId
  }
  const validateData = (data) => {

    const programPoType = getItemFullNameFromShortCode(findFromList(processId, processList.data, "io").toString().split("_").at(1))

    let programMandatoryDetails = ["uomId", "colorId", "qty", "processCost"];
    if (programPoType === "GreyYarn" || programPoType === "DyedYarn") {
      programMandatoryDetails = [...programMandatoryDetails, ...["yarnId", "noOfBags"]]
    } else if (programPoType === "GreyYarn" || programPoType === "DyedYarn") {
      programMandatoryDetails = [...programMandatoryDetails, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    } else if (programPoType === "Accessory") {
      programMandatoryDetails = [...programMandatoryDetails, ...["accessoryId", "sizeId"]]
    }

    const rawMaterialPoType = getItemFullNameFromShortCode(findFromList(processId, processList.data, "io").toString().split("_").at(0))

    let rawMaterialMandatoryDetails = ["qty"]

    if (rawMaterialPoType === "GreyYarn" || rawMaterialPoType === "DyedYarn") {
      rawMaterialMandatoryDetails = [...rawMaterialMandatoryDetails, "noOfBags"];
    } else if (rawMaterialPoType === "GreyYarn" || rawMaterialPoType === "DyedYarn") {
      rawMaterialMandatoryDetails = [...rawMaterialMandatoryDetails, "noOfRolls"];
    }
    return data.itemType && data.supplierId && data.storeId && data.vehicleNo
      && data.programDetails.length !== 0
      && isGridDatasValid(data.programDetails, false, programMandatoryDetails)
      && data.programDetails.every(item => ((item?.rawMaterials) && isGridDatasValid(item.rawMaterials, false, rawMaterialMandatoryDetails)))
  }


  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
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
  };

  function onDataClick(id) {
    setId(id);
    onNew();
    setForm(true);
  }
  const tableHeaders = ["Po", "Status"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']

  const getIssuedQty = (stockItem) => {
    const issueDetails = programDetails.map(item => item.rawMaterials).flat()
    const stockItemIssuedDetails = issueDetails.filter(item => _.isEqual(stockItem.itemDetails, item.itemDetails))
    const totalQty = stockItemIssuedDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.qty ? currentValue?.qty : 0))
    }, 0)
    return totalQty
  }
  const getTotalIssuedQty = () => {
    const issueDetails = programDetails.map(item => item.rawMaterials).flat()
    const totalQty = issueDetails.reduce((accumulation, currentValue) => {
      return (parseFloat(accumulation) + parseFloat(currentValue?.qty ? currentValue?.qty : 0))
    }, 0)
    return totalQty
  }

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

  const allSuppliers = supplierList ? supplierList.data : []

  console.log(allSuppliers, "allSuppliers")

  function filterSupplier() {
    if (!processId) return []
    const isProcessInSupplier = (supplierProcessList) => supplierProcessList.includes(parseInt(processId))
    let finalSupplier = allSuppliers.filter(s => (!(s?.PartyOnProcess)) ? false : isProcessInSupplier(s.PartyOnProcess.map(item => parseInt(item.processId))))
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()

  if (isProcessLoading || isProcessFetching || isLocationFetching || isLocationLoading || isStyleLoading || isStyleFetching) return <Loader />

  const inputShortCode = (processId && processList?.data?.length > 0) ? (findFromList(processId, processList?.data, "io"))?.toString().split("_").at(0) : ""
  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)).filter(item => filterGodown(item, inputShortCode)) :
    [];

  const styleOnColor = findFromList(styleId, styleList ? styleList.data : [], "StyleOnColor")
  const styleColors = styleId ? (styleOnColor ? styleOnColor.map(item => parseInt(item.colorId)) : []) : []

  return (
    <>
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        <ProcessDeliveryFormReport
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
      {/* <div className="hidden">
        <PrintFormatYarnDeliveryToKnitting innerRef={componentRef} processId={processId} id={id}
          supplierId={supplierId}
          processDocId={docId}
          delDate={delDate} programDetails={programDetails} />
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
            onPrint={id ? handlePrint : null}
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
                        <legend className='sub-heading'>Delivery Info</legend>
                        <div className='flex flex-col justify-center items-start flex-1 w-full'>
                          <div className="grid grid-cols-4  w-full">
                            <DisabledInput name={"Dc. No."} value={processId ? docId : "Choose process to Generate..."} />
                            <DateInput name="Delivery Date" value={autoDeliveryDate} type={"date"} required={true} disabled />
                            <DropdownInput
                              className={"w-[110px]"}
                              name="To Process"
                              options={dropDownListObject(id ? processList.data : processList.data.filter(item => item.active), "name", "id")}
                              value={processId}
                              setValue={setProcessId}
                              required={true}
                              readOnly={id || readOnly}
                            />
                            <DropdownInput
                              clear
                              name="Order"
                              options={dropDownListObject(id ? (orderList ? orderList.data : []) : (orderList ? orderList.data : []), "docId", "id")}
                              value={styleId}
                              setValue={setStyleId}
                              required={true}
                              readOnly={id || readOnly}
                            />

                            <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />

                            <TextInput name={"User Del. Date"} value={delDate} setValue={setDelDate} type={"date"} readOnly={readOnly} />
                            <TextInput name={"Due. Date"} value={dueDate} setValue={setDueDate} type={"date"} readOnly={readOnly} />
                            <DropdownInput name="Location"
                              options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                              value={locationId}
                              setValue={(value) => { setLocationId(value); setStoreId("") }}
                              required={true} readOnly={id || readOnly} />
                            <DropdownInput name="Store"
                              options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                              value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />
                          </div>
                        </div>
                      </fieldset>
                      {processId
                        &&
                        <Program rawMaterialRef={rawMaterialRef} setCurrentProgramIndex={setCurrentProgramIndex} currentProgramIndex={currentProgramIndex}
                          finishedGoodsType={(processId && processList?.data?.length > 0) ? (findFromList(processId, processList?.data, "io"))?.toString().split("_").at(1) : ""}
                          programDetails={programDetails} setProgramDetails={setProgramDetails} readOnly={readOnly} />
                      }
                      {(Number.isInteger(currentProgramIndex) && currentProgramIndex >= 0) &&
                        <fieldset ref={rawMaterialRef} className='h-[130px] frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 overflow-auto'>
                          <legend className='sub-heading'>Delivery from stock</legend>
                          <RawMaterial readOnly={readOnly} styleColors={styleColors}
                            storeId={storeId} getIssuedQty={getIssuedQty} currentProgramIndex={currentProgramIndex} programDetails={programDetails} setProgramDetails={setProgramDetails} rawMaterialType={(processId && processList.data?.length > 0) ? (findFromList(processId, processList.data, "io")).toString().split("_").at(0) : ""} />
                        </fieldset>
                      }
                      <Consolidation totalQty={getTotalIssuedQty()} vehicleNo={vehicleNo} setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks}
                        specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions} />
                    </div>
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