import React, { useEffect, useState, useRef, useCallback } from "react";
import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
// import { useGetTaxTemplateQuery } from '../../../redux/ErpServices/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { LongDropdownInput, DisabledInput, DropdownInput, DateInput, TextInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
// import { poTypes, } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems"
import Consolidation from "../Consolidation";
import PoItemsSelection from "./PoItemsSelection";
import AccessoryInwardItems from "./AccessoryInwardItems";
import FabricInwardItems from "./FabricInwardItems";
import moment from "moment";
// import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import { Loader } from '../../../Basic/components';
import {
  useAddDirectInwardOrReturnMutation, useDeleteDirectInwardOrReturnMutation,
  useGetDirectInwardOrReturnByIdQuery, useGetDirectInwardOrReturnQuery, useUpdateDirectInwardOrReturnMutation
}
  from "../../../redux/uniformService/DirectInwardOrReturnServices";
import { getCommonParams, isGridDatasValid, sumArray } from "../../../Utils/helper";
import { directOrPo, poTypes } from "../../../Utils/DropdownData";

const MODEL = "Purchase Inward / Direct Inward";


export default function Form() {


  const [readOnly, setReadOnly] = useState(false);
  const [directInwardReturnItems, setDirectInwardReturnItems] = useState([]);
  const [docId, setDocId] = useState("")
  const [id, setId] = useState("");
  const [date, setDate] = useState();
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dcDate, setDcDate] = useState("");

  const [transType, setTransType] = useState("DyedFabric");
  const [poInwardOrDirectInward, setPoInwardOrDirectInward] = useState("DirectInward");
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);

  const [locationId, setLocationId] = useState('');

  const [storeId, setStoreId] = useState("")

  const [dcNo, setDcNo] = useState("")

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [vehicleNo, setVehicleNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [inwardItemSelection, setInwardItemSelection] = useState(false)



  const childRecord = useRef(0);
  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);
  const params = {
    branchId, companyId
  };

  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });


  // const { data: taxTypeList } =
  //   useGetTaxTemplateQuery({ params: { ...params } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });

  const { data: allData, isLoading, isFetching } = useGetDirectInwardOrReturnQuery({ params: { branchId, poInwardOrDirectInward, finYearId } });

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const getNextDocId = useCallback(() => {
    if (isLoading || isFetching) return
    if (id) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetDirectInwardOrReturnByIdQuery(id, { skip: !id });

  const [addData] = useAddDirectInwardOrReturnMutation();
  const [updateData] = useUpdateDirectInwardOrReturnMutation();
  const [removeData] = useDeleteDirectInwardOrReturnMutation();

  const syncFormWithDb = useCallback((data) => {
    const today = new Date()
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setTransType(data?.poType ? data.poType : "DyedFabric");
    setPoInwardOrDirectInward(data?.poInwardOrDirectInward ? data?.poInwardOrDirectInward : "DirectInward")
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(today).format("YYYY-MM-DD"));
    setDirectInwardReturnItems(data?.directItems ? data.directItems : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
    // setTaxTemplateId(data?.taxTemplateId ? data?.taxTemplateId : "");
    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDcDate(data?.dcDate ? moment.utc(data?.dcDate).format("YYYY-MM-DD") : "");
    setDcNo(data?.dcNo ? data.dcNo : "")
    setLocationId(data?.Store ? data.Store.locationId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setVehicleNo(data?.vehicleNo ? data?.vehicleNo : "")
    setSpecialInstructions(data?.specialInstructions ? data?.specialInstructions : "")
    setRemarks(data?.remarks ? data?.remarks : "")
    if (data?.branchId) {
      branchIdFromApi.current = data?.branchId
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    poType: transType,
    poInwardOrDirectInward,
    supplierId, dcDate,

    payTermId,
    branchId, id, userId,
    storeId,
    directInwardReturnItems: directInwardReturnItems?.filter(po => po.fabricId || po.accessoryId),
    discountType,
    discountValue,
    dcNo,
    remarks,
    specialInstructions,
    vehicleNo,
    finYearId
  }

  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }



  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "price"];
    let lotMandatoryFields = ["qty"]
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, "yarnId"]
      lotMandatoryFields = [...lotMandatoryFields, "noOfBags", "weightPerBag"]
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
      lotMandatoryFields = [...lotMandatoryFields, "noOfRolls"]
    } else if (transType === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
    }




    return data.poType && data.supplierId && data.dcDate && data.payTermId && data.dcNo
      &&
      (
        (data.poType === "Accessory")
          ?
          isGridDatasValid(data.directInwardReturnItems, false, [...mandatoryFields, "qty"])
          :
          data.directInwardReturnItems.every(item => item?.inwardLotDetails && isGridDatasValid(item?.inwardLotDetails, false, lotMandatoryFields))
      )
      && isGridDatasValid(data.directInwardReturnItems, false, mandatoryFields)
      && data.directInwardReturnItems.length !== 0



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
    } catch (error) {
      console.log("handle");
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
    setSearchValue("");
    setReadOnly(false);
    syncFormWithDb(undefined)
    getNextDocId()
  };

  const tableHeadings = ["PoNo", "PoDate", "PoType", "DueDate", "Supplier"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']
  useEffect(() => {
    if (id) return
    setDirectInwardReturnItems([])
  }, [transType, id])

  const allSuppliers = supplierList ? supplierList.data : []

  function filterSupplier() {
    let finalSupplier = []
    if (transType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (transType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } else {
      finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems.length > 0)
    }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()

  const getTotalIssuedQty = () => {
    if (transType === "Accessory") {
      return directInwardReturnItems?.reduce((total, current) => total + current?.qty, 0)
    }
    else {

      return directInwardReturnItems?.reduce((total, current) => {
        return total + sumArray(current?.inwardLotDetails ? current.inwardLotDetails : [], "qty")
      }, 0)
    }

  }

  useEffect(() => {
    if (id) return
    setDirectInwardReturnItems([]);
    setSupplierId("")
  }, [transType])

  const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });

  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  function removeItem(id) {
    setDirectInwardReturnItems(directInwardItems => {
      let newItems = structuredClone(directInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }


  if (!branchList || !locationData) return <Loader />

  // let taxItems = transType !== "Accessory" ? directInwardReturnItems.map(item => {
  //   let newItem = structuredClone(item)
  //   newItem["qty"] = sumArray(newItem?.inwardLotDetails ? newItem?.inwardLotDetails : [], "qty")
  //   return newItem
  // }) : directInwardReturnItems

  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">
      {/* <Modal isOpen={summary} onClose={() => setSummary(false)} widthClass={"p-10"}>
        <PoSummary
          vehicleNo={vehicleNo} setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks}
          specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions}
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          poItems={taxItems} taxTypeId={taxTemplateId} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
      </Modal> */}
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        <PurchaseOrderFormReport
          heading={MODEL}
          tableHeaders={tableHeadings}
          tableDataNames={tableDataNames}
          loading={
            isLoading || isFetching
          }
          tableWidth="100%"
          data={allData?.data}
          onClick={(id) => {
            setId(id);
            setFormReport(false);
          }
          }
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </Modal>


      <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={transType}
          supplierId={supplierId}
          inwardItems={directInwardReturnItems}
          setInwardItems={setDirectInwardReturnItems} />
      </Modal>{console.log(directInwardReturnItems, "directInwardReturnItems")}
      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          onNew={onNew}
          model={MODEL}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          openReport={() => { setFormReport(true) }}
          childRecord={childRecord.current}
        />
        <div className="flex-1 grid gap-x-2">
          <div className="col-span-3 grid overflow-auto">
            <div className='col-span-3 grid overflow-auto'>
              <div className='mr-1'>
                <div className={`grid`}>
                  <div className={"flex flex-col"}>
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 h-[160px] px-3 overflow-auto'>
                      <legend className='sub-heading'>Inward Info</legend>
                      <div className='flex flex-col justify-center items-start flex-1 w-full'>
                        <div className="grid grid-cols-5 w-full">
                          <DisabledInput name="Doc. Id." value={docId} required={true}
                          />
                          <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
                          <DropdownInput name="Inward Type"
                            beforeChange={() => { setDirectInwardReturnItems([]) }}
                            options={directOrPo}
                            value={poInwardOrDirectInward} setValue={setPoInwardOrDirectInward} required={true} readOnly={readOnly} />
                          <DropdownInput name="Po Type"

                            options={poTypes}
                            value={transType}
                            setValue={setTransType}
                            required={true}
                            readOnly={readOnly} />

                          <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id} />

                          <TextInput name={"Dc No."} value={dcNo} setValue={setDcNo} readOnly={readOnly} required />
                          <DateInput name="Dc Date" value={dcDate} setValue={setDcDate} required={true} readOnly={readOnly} />
                          <DropdownInput name="Pay Terms" options={dropDownListObject(payTermList ? payTermList.data : [], "name", "id")} value={payTermId} setValue={(value) => { setPayTermId(value); }} required={true} readOnly={readOnly} />
                          {/* <DropdownInput name="Tax Type" options={dropDownListObject(taxTypeList ? taxTypeList.data : [], "name", "id")} value={taxTemplateId} setValue={setTaxTemplateId} required={true} readOnly={readOnly} /> */}
                          <DropdownInput name="Location"
                            options={branchList ? (dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")) : []}
                            value={locationId}
                            setValue={(value) => { setLocationId(value); setStoreId("") }}
                            required={true} readOnly={id || readOnly} />
                          <DropdownInput name="Store"
                            options={dropDownListObject(id ? storeOptions : storeOptions.filter(item => item.active), "storeName", "id")}
                            value={storeId} setValue={setStoreId} required={true} readOnly={id || readOnly} />

                          {(!readOnly && poInwardOrDirectInward == "PurchaseInward") &&
                            < div className="">
                              <button className="p-1.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
                                onClick={() => {
                                  if (!supplierId) {
                                    toast.info("Please Select Suppplier", { position: "top-center" })
                                    return
                                  }
                                  setInwardItemSelection(true)
                                }}
                              >Select Items</button>
                            </div>
                          }
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 border border-gray-600 md:pb-5 flex 
                    h-[200px] w-full overflow-auto'>
                      <legend className='sub-heading'>Inward Details</legend>
                      {

                        poInwardOrDirectInward == "DirectInward" &&
                        (transType.toLowerCase().includes("yarn")
                          ?
                          <YarnPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} params={params} poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                          :
                          (
                            transType.toLowerCase().includes("fabric")
                              ?
                              <FabricPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} params={params} poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                              :
                              <AccessoryPoItems id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={directInwardReturnItems} setPoItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                          )
                        )
                      }





                      {

                        poInwardOrDirectInward == "PurchaseInward" &&
                        (
                          transType.toLowerCase().includes("fabric")
                            ?
                            <FabricInwardItems removeItem={removeItem} transType={transType} purchaseInwardId={id} params={params}
                              inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                            :
                            <AccessoryInwardItems purchaseInwardId={id} removeItem={removeItem} transType={transType} inwardItems={directInwardReturnItems} setInwardItems={setDirectInwardReturnItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} params={params} />
                        )

                      }
                    </fieldset>

                    <Consolidation readOnly={readOnly} totalQty={getTotalIssuedQty()} vehicleNo={vehicleNo} setVehicleNo={setVehicleNo} remarks={remarks} setRemarks={setRemarks}
                      specialInstructions={specialInstructions} setSpecialInstructions={setSpecialInstructions} />

                    {/* <div>
                      <button className="text-sm bg-sky-500 hover:text-white font-semibold hover:bg-sky-800 transition p-1 ml-5 rounded"
                        onClick={() => {
                          if (!taxTemplateId) {
                            toast.info("Please Select Tax Template !", { position: "top-center" })
                            return
                          }
                          setSummary(true)
                        }}>
                        View Inward Summary
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}