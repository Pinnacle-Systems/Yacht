import React, { useEffect, useState, useRef, useCallback } from "react";

import { 
  useGetRawMaterialOpeningStockQuery,
  useGetRawMaterialOpeningStockByIdQuery,
  useAddRawMaterialOpeningStockMutation,
  useUpdateRawMaterialOpeningStockMutation,
  useDeleteRawMaterialOpeningStockMutation,  } from "../../../redux/uniformService/RawMaterialOpeningStockServices";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DropdownInput, DateInput } from "../../../Inputs";
import { poTypes } from '../../../Utils/DropdownData';
import YarnPoItems from "./YarnPoItems";
import FabricPoItems from "./FabricPoItems";
import AccessoryPoItems from "./AccessoryPoItems"
import moment from "moment";
import Modal from "../../../UiComponents/Modal";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import PurchaseOrderFormReport from "./PurchaseOrderFormReport";
import {
  useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import { Loader } from '../../../Basic/components';
import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";
import { dropDownListObject } from "../../../Utils/contructObject";
import StockReport from "./StockReport";

const MODEL = "Raw Material Opening Stock";

export default function OpeningStock() {
  const today = new Date()
  const [readOnly, setReadOnly] = useState(false);
  const [rawMaterialOpeningStockItems, setRawMaterialOpeningStockItems] = useState([]);
  const [docId, setDocId] = useState("")
  const [id, setId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format('YYYY-MM-DD'));
  const [storeId, setStoreId] = useState("")
  const [locationId, setLocationId] = useState('');
  const [viewReport,setViewReport ] = useState(false)
  const [rawMaterialType, setRawMaterialType] = useState("");

  const [formReport, setFormReport] = useState(false);

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const { branchId, companyId, finYearId, userId } = getCommonParams()

  const params = {
    branchId, companyId, finYearId
  };

  const { data: allData, isLoading, isFetching } = useGetRawMaterialOpeningStockQuery({ params, searchParams: searchValue });
  const { data: branchList } = useGetBranchQuery({ params: { companyId } });
  const { data: locationData } = useGetLocationMasterQuery({ params: { branchId }, searchParams: searchValue });

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
  } = useGetRawMaterialOpeningStockByIdQuery(id, { skip: !id });
  
  const [addData] = useAddRawMaterialOpeningStockMutation();
  const [updateData] = useUpdateRawMaterialOpeningStockMutation();
  const [removeData] = useDeleteRawMaterialOpeningStockMutation();

  const syncFormWithDb = useCallback((data) => {
    if (id) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
    setLocationId(data?.Store?.locationId ? data?.Store?.locationId : "")
    setStoreId(data?.storeId ? data.storeId : "")
    setRawMaterialType(data?.rawMaterialType ? data.rawMaterialType : "");
    setDate(data?.createdAt ? moment.utc(data.createdAt).format("YYYY-MM-DD") : moment.utc(new Date()).format("YYYY-MM-DD"));
    setRawMaterialOpeningStockItems(data?.RawMaterialOpeningStockItems ? data.RawMaterialOpeningStockItems.map(item => {
      let newItem = structuredClone(item);
      if (data.rawMaterialType === "GreyYarn" || data.rawMaterialType === "DyedYarn") {
        newItem["weightPerBag"] = parseFloat(newItem.qty) / parseFloat(newItem.noOfBags)
      }
      return newItem
    }) : []);
    if (data?.docId) {
      setDocId(data?.docId)
    }
    if (data?.date) setDate(data?.date);
  }, [id]);


  useEffect(() => {
    if (id) {
      syncFormWithDb(singleData?.data);
    } else {
      syncFormWithDb(undefined);
    }
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    rawMaterialType,
    branchId, id, userId,
    storeId,
    rawMaterialOpeningStockItems: rawMaterialOpeningStockItems.filter(po => po.yarnId || po.fabricId || po.accessoryId), finYearId
  }

  const validateData = (data) => {
    let mandatoryFields = ["uomId", "colorId", "qty", "price"];
    if (rawMaterialType === "GreyYarn" || rawMaterialType === "DyedYarn") {
      mandatoryFields = [...mandatoryFields, ...["yarnId", "noOfBags"]]
    } else if (rawMaterialType === "GreyFabric" || rawMaterialType === "DyedFabric") {
      mandatoryFields = [...mandatoryFields, ...["fabricId", "designId", "gaugeId", "loopLengthId", "gsmId", "kDiaId", "fDiaId"]]
    } else if (rawMaterialType === "Accessory") {
      mandatoryFields = [...mandatoryFields, ...["accessoryId", "sizeId"]]
    }
    return data.rawMaterialType
      && isGridDatasValid(data.rawMaterialOpeningStockItems, false, mandatoryFields) && data.rawMaterialOpeningStockItems.length !== 0
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


  const tableHeadings = ["PoNo", "PoDate", "rawMaterialType", "DueDate", "Supplier"]
  const tableDataNames = ['dataObj?.id', 'dataObj.active ? ACTIVE : INACTIVE']
  useEffect(() => {
    if (id) return
    setRawMaterialOpeningStockItems([]);
  }, [rawMaterialType, id])

  const storeOptions = locationData ?
    locationData.data.filter(item => parseInt(item.locationId) === parseInt(locationId)) :
    [];

  if (!branchList || !locationData) return <Loader />

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
      <Modal isOpen={viewReport} onClose={() => setViewReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
        
        <StockReport
        storeId={storeId}
           options={poTypes}
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
      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          viewReport ={() =>  {setViewReport(true)}}
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
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 overflow-auto'>
                      <legend className='sub-heading'>Stock Info</legend>
                      <div className='flex flex-col justify-center items-start flex-1 w-full'>
                        <div className="grid grid-cols-5 w-full">
                          <DisabledInput name="Doc Id." value={docId} required={true}
                          />
                          <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />
                          <DropdownInput name="Raw Material Type"
                            options={poTypes}
                            value={rawMaterialType} setValue={setRawMaterialType} required={true} readOnly={id} />
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
                    <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-600 md:pb-5 flex flex-1 overflow-auto'>
                      <legend className='sub-heading'>Stock Details</legend>
                      {rawMaterialType.toLowerCase().includes("yarn")
                        ?
                        <YarnPoItems greyFilter={rawMaterialType.toLowerCase().includes("grey")} id={id} rawMaterialType={rawMaterialType} params={params} poItems={rawMaterialOpeningStockItems} setPoItems={setRawMaterialOpeningStockItems} readOnly={readOnly} />
                        :
                        (
                          rawMaterialType.toLowerCase().includes("fabric")
                            ?
                            <FabricPoItems greyFilter={rawMaterialType.toLowerCase().includes("grey")} id={id} rawMaterialType={rawMaterialType} params={params} poItems={rawMaterialOpeningStockItems} setPoItems={setRawMaterialOpeningStockItems} readOnly={readOnly} />
                            :
                            <>
                              {(rawMaterialType.toLowerCase() === "accessory")
                                ?
                                <AccessoryPoItems id={id} rawMaterialType={rawMaterialType} params={params} poItems={rawMaterialOpeningStockItems} setPoItems={setRawMaterialOpeningStockItems} readOnly={readOnly} />
                                :
                                <></>
                              }
                            </>
                        )
                      }
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