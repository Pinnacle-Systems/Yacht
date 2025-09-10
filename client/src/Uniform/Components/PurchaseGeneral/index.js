import React, { useEffect, useState, useRef, useCallback } from "react";

import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";
import { useGetTaxTemplateQuery } from '../../../redux/services/TaxTemplateServices';
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DropdownInput, DateInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { Generalpurchase } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems"
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import moment from "moment";
// import PrintFormat from "./PrintFormat-PO/index";
// import PoSummary from "./PoSummary";
import Modal from "../../../UiComponents/Modal";
import { useReactToPrint } from "@etsoo/reactprint";
import PrintFormatGreyYarnPurchaseOrder from "../PrintFormat-PurchaseOrder"
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import { deliveryTypes } from "../../../Utils/DropdownData";
import  PrintFormat  from "./PrintFormat-PG/index"
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import Consolidation from "./Cosolidation";
import { useAddGeneralPurchaseMutation, useDeleteGeneralPurchaseMutation, useGetGeneralPurchaseByIdQuery, useGetGeneralPurchaseQuery, useUpdateGeneralPurchaseMutation } from "../../../redux/uniformService/GeneralPurchaseServices";
const MODEL = "General Purchase";


export default function Form() {

  const today = new Date()
  const componentRef = useRef();

  const [summary, setSummary] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [poItems, setPoItems] = useState([]);
  const [docId, setDocId] = useState("")
  const [id, setId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [taxTemplateId, setTaxTemplateId] = useState("");
  const [payTermId, setPayTermId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [transType, setTransType] = useState("DyedFabric");
  const [supplierId, setSupplierId] = useState("");

  const [discountType, setDiscountType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [remarks, setRemarks] = useState("")

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [deliveryType, setDeliveryType] = useState("")
  const [deliveryToId, setDeliveryToId] = useState("")

  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const branchIdFromApi = useRef(branchId);
  const params = {
    branchId, companyId, finYearId
  };

  const { data: supplierList } =
    useGetPartyQuery({ params: { ...params } });


  const { data: taxTypeList } =
    useGetTaxTemplateQuery({ params: { ...params } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  const { data: payTermList } =
    useGetPaytermMasterQuery({ params: { ...params } });
    const handlePrint = () => {
      setPrintModalOpen(true);
    };
  
  const { data: allData, isLoading, isFetching } =   useGetGeneralPurchaseQuery({ params, searchParams: searchValue });
  

  const { data: branchList } = useGetBranchQuery({ params: { companyId } });

  const getNextDocId = useCallback(() => {
    if (id || isLoading || isFetching) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetGeneralPurchaseByIdQuery(id, { skip: !id });

  const [addData] = useAddGeneralPurchaseMutation();
  const [updateData] = useUpdateGeneralPurchaseMutation();
  const [removeData] = useDeleteGeneralPurchaseMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }

    setTransType(data?.transType ? data.transType : "DyedFabric");
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));

    setPoItems(data?.GeneralPurchaseItems ? data?.GeneralPurchaseItems : [])
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);

    setPayTermId(data?.payTermId ? data?.payTermId : "");
    setDiscountType(data?.discountType ? data?.discountType : "Percentage")
    setDiscountValue(data?.discountValue ? data?.discountValue : "0")
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setDueDate(data?.dueDate ? moment.utc(data?.dueDate).format("YYYY-MM-DD") : "");
    setDeliveryType(data?.deliveryType ? data?.deliveryType : "")
    if (data) {
      setDeliveryToId(data?.deliveryType === "ToSelf" ? data?.deliveryBranchId : data?.deliveryPartyId)
    } else {
      setDeliveryToId("")
    }
    setRemarks(data?.remarks ? data.remarks : "")
    // if (data?.branchId) {
    //   branchIdFromApi.current = data?.branchId
    // }
  }, [id]);




  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    transType, supplierId, dueDate, taxTemplateId, payTermId,
    branchId, id, userId,
    remarks,
    poItems: poItems.filter(po => po.yarnId || po.fabricId || po.accessoryId),
    deliveryType, deliveryToId,
    discountType,
    discountValue,
    finYearId
  }

  console.log(singleData, "poItems")

  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }
  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "qty", "price"];
    if (transType === "GreyYarn" || transType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, ...["yarnId", "noOfBags"]]
    } else if (transType === "GreyFabric" || transType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    } else if (transType === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId"]]
    }
    return data.supplierId && data.dueDate && data.payTermId
      && isGridDatasValid(data.poItems, false, mandatoryFields) && data.poItems.length !== 0
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
        return
      }
      setId("")
      syncFormWithDb(undefined)
      toast.success(text + "Successfully");
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


  const tableHeadings = ["PoNo", "PoDate", "transType", "DueDate", "Supplier"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']
  useEffect(() => {
    if (id) return
    setPoItems([]);
    setSupplierId("")
  }, [transType, id])

  const allSuppliers = supplierList ? supplierList.data : []

  function filterSupplier() {
    let finalSupplier = []
    if (transType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (transType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } else {
      finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems?.length > 0)
    }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()

  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto">

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
            
          />
        </PDFViewer>
      </Modal> 


      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          onNew={onNew}
          model={MODEL}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          onPrint={id ? handlePrint : null}
          openReport={() => { setFormReport(true) }}
          childRecord={childRecord.current}
        />
        <div className="flex-1 grid gap-x-2">
          <div className="col-span-3 grid overflow-auto">
            <div className='col-span-3 grid overflow-auto'>
              <div className='mr-1'>
                <div className={`grid`}>
                  <div className={"flex flex-col"}>
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 overflow-auto'>
                      <legend className='sub-heading'>Purchase Info</legend>
                      <div className='flex flex-col justify-center items-start flex-1 w-full'>
                        <div className="grid grid-cols-5 w-full">
                          <DisabledInput name="Po no." value={docId} required={true}
                          />
                          <DateInput name="Po Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
                          <DropdownInput name="Po Type"
                            options={Generalpurchase}
                            value={transType} setValue={setTransType} required={true} readOnly={readOnly} />

                          <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id} />

                          <DateInput name="Due Date" value={dueDate} setValue={setDueDate} required={true} readOnly={readOnly} />
                          <DropdownInput name="Pay Terms" options={dropDownListObject(payTermList ? payTermList.data : [], "name", "id")} value={payTermId} setValue={(value) => { setPayTermId(value); }} required={true} readOnly={readOnly} />
                          {/* <DropdownInput name="Tax Type" options={dropDownListObject(taxTypeList ? taxTypeList.data : [], "name", "id")} value={taxTemplateId} setValue={setTaxTemplateId} required={true} readOnly={readOnly} /> */}
                          <DropdownInput name="Delivery Type"
                            options={deliveryTypes}
                            value={deliveryType}
                            setValue={setDeliveryType}
                            required={true} readOnly={readOnly} />
                          {deliveryType
                            ?
                            <DropdownInput name="Delivery To" options={(deliveryType === "ToSelf") ? dropDownListObject(branchList ? branchList.data : [], "branchName", "id") : dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} />
                            :

                            <DropdownInput name="Delivery To" options={(supplierList?.data && deliveryType === "ToParty") ? dropDownListObject(supplierList?.data?.filter(val => val.isSupplier), "name", "id") : []} value={deliveryToId} setValue={setDeliveryToId} required={true} readOnly={readOnly} />
                          }
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 border border-gray-600 md:pb-5 flex h-[360px] px-1 w-full overflow-auto'>
                      <legend className='sub-heading'>Purchase Details</legend>
                      {transType.toLowerCase().includes("yarn")
                        ?
                        <YarnPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                        :
                        (
                          transType.toLowerCase().includes("fabric")
                            ?
                            <FabricPoItems greyFilter={transType.toLowerCase().includes("grey")} id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                            :
                            <AccessoryPoItems id={id} transType={transType} taxTypeId={taxTemplateId} params={params} poItems={poItems} setPoItems={setPoItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                        )
                      }


                      <Consolidation readOnly={readOnly} remarks={remarks} setRemarks={setRemarks}
                      />
                    </fieldset>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}