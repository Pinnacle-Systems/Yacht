import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetPurchaseCancelQuery,
  useGetPurchaseCancelByIdQuery,
  useAddPurchaseCancelMutation,
  useUpdatePurchaseCancelMutation,
  useDeletePurchaseCancelMutation,
} from "../../../redux/uniformService/PurchaseCancelServices";

import { useGetPartyQuery, useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DropdownInput, DisabledInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { poTypes } from '../../../Utils/DropdownData';
import { useDispatch } from "react-redux";
import Modal from "../../../UiComponents/Modal";
import PoItemsSelection from "./PoItemsSelection";
import { getCommonParams, getDateFromDateTime, isGridDatasValid } from "../../../Utils/helper";
import YarnCancelItems from "./YarnCanceltems";
import AccessoryCancelItems from "./AccessoryCancelItems";
import FabricCancelItems from "./FabricCancelItems";
import moment from "moment";
import PurchaseInwardFormReport from "./PurchaseInwardFormReport";
import Consolidation from "../Consolidation";

const MODEL = "Purchase Cancel";

export default function Form() {
  const dispatch = useDispatch()
  const today = new Date()
  const [inwardItemSelection, setInwardItemSelection] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [date, setDate] = useState(getDateFromDateTime(today));
  const [poType, setPoType] = useState("DyedFabric");
  const [supplierId, setSupplierId] = useState("");

  const [docId, setDocId] = useState("");

  const [inwardItems, setInwardItems] = useState([]);

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const [remarks, setRemarks] = useState("")

  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams()


  const branchIdFromApi = useRef(branchId);
  const params = {
    branchId, companyId
  };

  const { data: supplierList } =
    useGetPartyQuery({ params: { companyId, active: true } });

  const { data: supplierDetails } =
    useGetPartyByIdQuery(supplierId, { skip: !supplierId });

  const { data: allData, isLoading, isFetching } = useGetPurchaseCancelQuery({ params: { branchId, inwardOrReturn: "PurchaseCancel", finYearId } });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPurchaseCancelByIdQuery(id, { skip: !id });


  function isSupplierOutside() {
    if (supplierDetails) {
      return supplierDetails?.data?.City?.state?.name !== "TAMIL NADU"
    }
    return false
  }
  const [addData] = useAddPurchaseCancelMutation();
  const [updateData] = useUpdatePurchaseCancelMutation();
  const [removeData] = useDeletePurchaseCancelMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    if (data?.docId) {
      setDocId(data?.docId)
    }
    setPoType(data?.poType ? data.poType : "DyedFabric");

    setInwardItems(data?.cancelItems ? structuredClone(data.cancelItems) : [])
    if (data?.createdAt) setDate(moment.utc(data?.createdAt).format("YYYY-MM-DD"));
    setSupplierId(data?.supplierId ? data?.supplierId : "");
    setRemarks(data?.remarks ? data.remarks : "")
  }, [id]);

  const getNextDocId = useCallback(() => {
    if (isLoading || isFetching) return
    if (id) return
    if (allData?.nextDocId) {
      setDocId(allData.nextDocId)
    }
  }, [allData, isLoading, isFetching, id])

  useEffect(getNextDocId, [getNextDocId])

  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);



  const data = {
    poInwardOrDirectInward: "PurchaseCancel",
    poType, supplierId,
    branchId, id, userId,
    remarks,
    cancelItems: inwardItems,
    finYearId
  }

  const validateData = (data) => {
    let mandatoryFields = ["poItemsId", "qty"];
    if (poType === "GreyYarn" || poType === "DyedYarn") {
      mandatoryFields.push("noOfBags")
    }
    return data.poType && data.supplierId
      && isGridDatasValid(data.cancelItems, false, mandatoryFields)
      && data.cancelItems.length !== 0
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
      console.log(id, "id", data, "dataaa")
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
  };

  function removeItem(id) {
    setInwardItems(localInwardItems => {
      let newItems = structuredClone(localInwardItems);
      newItems = newItems.filter(item => parseInt(item.poItemsId) !== parseInt(id))
      return newItems
    });
  }

  const allSuppliers = supplierList ? supplierList.data : []

  function filterSupplier() {
    let finalSupplier = []
    if (poType.toLowerCase().includes("yarn")) {
      finalSupplier = allSuppliers.filter(s => s.yarn)
    } else if (poType.toLowerCase().includes("fabric")) {
      finalSupplier = allSuppliers.filter(s => s.fabric)
    } else {
      finalSupplier = allSuppliers.filter(s => s.PartyOnAccessoryItems.length > 0)
    }
    return finalSupplier
  }
  let supplierListBasedOnSupply = filterSupplier()
  function getTotalIssuedQty() {
    return inwardItems.reduce((total, current) => {
      return total + parseFloat(current?.qty)
    }, 0)
  }
  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme overflow-auto"
    >
      <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[70%] w-[90%]"}>
        <PurchaseInwardFormReport
          heading={MODEL}
          loading={
            isLoading || isFetching
          }

          allData={allData}
          tableWidth="100%"
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
      <Modal isOpen={inwardItemSelection} onClose={() => setInwardItemSelection(false)} widthClass={"w-[95%] h-[90%] py-10"}>
        <PoItemsSelection setInwardItemSelection={setInwardItemSelection} transtype={poType}
          supplierId={supplierId}
          inwardItems={inwardItems}
          setInwardItems={setInwardItems} />
      </Modal>
      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          onNew={onNew}
          openReport={() => { setFormReport(true); }}
          model={MODEL}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          childRecord={childRecord.current}
        />
        <div className="flex-1 grid gap-x-2">
          <div className="col-span-3 grid overflow-auto">
            <div className='col-span-3 grid overflow-auto'>
              <div className='mr-1'>
                <div className={`grid ${formReport ? "grid-cols-12" : "grid-cols-1"}`}>
                  <div className={`${formReport ? "col-span-9" : "col-span-1"}`}>
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg w-full border border-gray-600 h-[100px] px-3 overflow-auto'>
                      <legend className='sub-heading'>Purchase Inward Info</legend>
                      <div className="flex justify-end relative top-0 right-0">
                      </div>
                      <div className='grid grid-cols-4 items-start flex-1 w-full'>
                        <DisabledInput name="Doc Id" value={docId} required={true} readOnly={readOnly} />
                        <DisabledInput name="Doc 
                           Date" value={date} type={"date"} required={true} readOnly={readOnly} />
                        <DropdownInput
                          className={"w-[110px]"}
                          name="Po Type"
                          beforeChange={() => { setSupplierId(""); setInwardItems([]); }}
                          options={poTypes}
                          value={poType}
                          setValue={setPoType}
                          required={true}
                          readOnly={readOnly}
                        />
                        <DropdownInput name="Supplier" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={supplierId} setValue={setSupplierId} required={true} readOnly={id || readOnly} />
                        <div className="">
                          <button className="p-1.5 text-xs bg-lime-400 rounded hover:bg-lime-600 font-semibold transition hover:text-white"
                            onClick={() => {
                              if (!supplierId || !poType) {
                                toast.info("Please Select Inward/Return , Po type and Suppplier", { position: "top-center" })
                                return
                              }
                              setInwardItemSelection(true)
                            }}
                          >Select Items</button>
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 border border-gray-600 md:pb-5 flex h-[360px] px-1 w-full overflow-auto'>
                      <legend className='sub-heading'>Purchase Details</legend>
                      {
                        poType.toLowerCase().includes("yarn")
                          ?
                          <YarnCancelItems purchaseInwardId={id} removeItem={removeItem}
                            transType={poType} inwardItems={inwardItems} setInwardItems={setInwardItems}
                            readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                          :
                          poType.toLowerCase().includes("fabric")
                            ?
                            <FabricCancelItems params={params} removeItem={removeItem} transType={poType} purchaseInwardId={id}
                              inwardItems={inwardItems} setInwardItems={setInwardItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                            :
                            <AccessoryCancelItems params={params} purchaseInwardId={id} removeItem={removeItem} transType={poType} inwardItems={inwardItems} setInwardItems={setInwardItems} readOnly={readOnly} isSupplierOutside={isSupplierOutside()} />
                      }
                      <Consolidation isPurchaseCancel readOnly={readOnly} totalQty={getTotalIssuedQty()} remarks={remarks} setRemarks={setRemarks}
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