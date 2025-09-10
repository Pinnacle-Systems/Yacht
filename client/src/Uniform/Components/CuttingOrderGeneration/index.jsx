import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetCuttingOrderQuery,
    useGetCuttingOrderByIdQuery,
    useAddCuttingOrderMutation,
    useUpdateCuttingOrderMutation,
    useDeleteCuttingOrderMutation,
} from "../../../redux/uniformService/CuttingOrderService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DateInput, DropdownInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';

import Modal from "../../../UiComponents/Modal";
import FormReport from "./FormReport";

import { getCommonParams } from "../../../Utils/helper";

import moment from "moment";
import OrderDropdown from "../../Components/ReusableComponents/OrderDropdown";
import OrderConsolidation from "./OrderConsolidation";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";
import { deliveryTypes } from "../../../Utils/DropdownData";
import { PDFViewer } from "@react-pdf/renderer";
import tw from "../../../Utils/tailwind-react-pdf";
import PrintFormat from "./PrintFormat-CO";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";

const MODEL = "Cutting Order ";

export default function Form() {

    const [readOnly, setReadOnly] = useState(false);
    const [docId, setDocId] = useState("")
    const [id, setId] = useState("");
    const [formReport, setFormReport] = useState(false);
    const [cuttingOrderDetails, setCuttingOrderDetails] = useState([]);
    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');
    const [selectedColorList, setSelectedColorList] = useState([]);
    const [selectedSizeList, setSelectedSizeList] = useState([]);
    const [selectedClassList, setSelectedClassList] = useState([]);
    const [selectedStyleList, setSelectedStyleList] = useState([]);
    const [selectedStyleTypeList, setSelectedStyleTypeList] = useState([])
    const [deliveryType, setDeliveryType] = useState("")
    const [deliveryToId, setDeliveryToId] = useState("")
    const [printModalOpen, setPrintModalOpen] = useState(false);
    const [tempOrderDetails, setTempOrderDetails] = useState([]);


    const childRecord = useRef(0);
    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };

    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetCuttingOrderQuery({ params, searchParams: '' });
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
    } = useGetCuttingOrderByIdQuery({ id }, { skip: !id });

    const [addData] = useAddCuttingOrderMutation();
    const [updateData] = useUpdateCuttingOrderMutation();
    const [removeData] = useDeleteCuttingOrderMutation();

    const syncFormWithDb = useCallback((data) => {
        if (id) {
            setReadOnly(true);
        } else {
            setReadOnly(false);
        }
        if (data?.docId) {
            setDocId(data?.docId)
        }
        setDate(data?.createdAt ? moment(data?.createdAt).format("YYYY-MM-DD") : moment(new Date()).format("YYYY-MM-DD"));
        setPartyId(data?.partyId ? data?.partyId : "");
        setOrderId(data?.orderId || "");
        setCuttingOrderDetails(data?.cuttingOrderDetails ? data?.cuttingOrderDetails : []);
        setSelectedClassList(data?.CuttingClass ? data?.CuttingClass : []);
        setSelectedColorList(data?.CuttingColor ? data?.CuttingColor : []);
        setSelectedSizeList(data?.CuttingSize ? data?.CuttingSize : []);
        setSelectedStyleList(data?.CuttingStyle ? data?.CuttingStyle : []);
        setSelectedStyleTypeList(data?.CuttingStyleType ? data?.CuttingStyleType : []);
        setDeliveryType(data?.deliveryType ? data?.deliveryType : "")
        if (data) {
            setDeliveryToId(data?.deliveryType === "ToSelf" ? data?.deliveryBranchId : data?.deliveryPartyId)
        } else {
            setDeliveryToId("")
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
        branchId, id, userId, companyId,
        partyId, finYearId, orderId, cuttingOrderDetails, selectedColorList,
        selectedSizeList,
        selectedClassList,
        selectedStyleList,
        selectedStyleTypeList,
        deliveryType, deliveryToId,
    }


    useEffect(() => {
        let newObj = {};
        let colorObj = {};
        let tempArray = []
        cuttingOrderDetails?.forEach(item => {
            item?.items?.forEach((value, valueIndex) => {
                value?.colorList?.map(color => {

                    newObj = {
                        itemType: item?.itemTypeName,
                        itemName: value?.itemName,

                    }
                    colorObj = {
                        color: color?.name
                    }
                })
                tempArray.push(colorObj)

            })
        })
        setTempOrderDetails(tempArray)

    }, [cuttingOrderDetails])

    const validateData = (data) => {
        return data.partyId && data.orderId
    }


    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            if (returnData.statusCode === 0) {

                setId("")
                syncFormWithDb(undefined)
                toast.success(text + "Successfully");
            } else {
                toast.error(returnData?.message)
            }
        } catch (error) {
            console.log("handle")
        }
    }


    const saveData = (isCreateMasters) => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (id) {
            handleSubmitCustom(updateData, { ...data, isCreateMasters }, "Updated");
        } else {
            handleSubmitCustom(addData, { ...data, isCreateMasters }, "Added");
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
        setReadOnly(false);
        syncFormWithDb(undefined)
        getNextDocId();
    };



    let supplierListBasedOnSupply = supplierList ? supplierList.data : []


    return (
        <div
            onKeyDown={handleKeyDown}
            className="md:items-start md:justify-items-center grid h-[900px] bg-theme overflow-auto">
            <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[90%]"}>
                <FormReport
                    heading={MODEL}
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
                />
            </Modal>
            <Modal isOpen={error} onClose={() => setError('')} widthClass={"px-2 w-[500px] overflow-auto"}>
                <div className="w-full">
                    <div className="text-center font-bold ">{error?.message}</div>
                    {((error?.data?.missingItemsInClassMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> Class: </span>
                            <span> {(error?.data?.missingItemsInClassMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInSizeMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> Size: </span>
                            <span> {(error?.data?.missingItemsInSizeMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInColorMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> Color: </span>
                            <span> {(error?.data?.missingItemsInColorMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInBottomSizeMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> BottomSize: </span>
                            <span> {(error?.data?.missingItemsInBottomSizeMaster || []).join(",")} </span>
                        </div>
                    }
                    {((error?.data?.missingItemsInBottomColorMaster || [])?.length > 0) &&
                        <div className="flex gap-1 mt-1">
                            <span className="font-bold"> BottomColor: </span>
                            <span> {(error?.data?.missingItemsInBottomColorMaster || []).join(",")} </span>
                        </div>
                    }
                    <div className="w-full flex justify-around">
                        <button className="bg-red-500 text-white p-1 rounded-md" onClick={() => setError("")} >
                            Cancel
                        </button>
                        <button className="bg-blue-500 text-white p-1 rounded-md" onClick={() => saveData(true)}>
                            Auto Create Masters
                        </button>
                    </div>
                </div>
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
                        cuttingOrderDetails={cuttingOrderDetails}
                        selectedSizeList={selectedSizeList}
                        selectedStyleList={selectedStyleList}
                        tempOrderDetails={tempOrderDetails}
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
                    openReport={() => { setFormReport(true) }}
                    onPrint={id ? () => { setPrintModalOpen(true) } : null}
                    childRecord={childRecord.current}
                />
                <div className="flex-1 grid gap-x-2">
                    <div className="col-span-3 grid ">
                        <div className='col-span-3 grid '>
                            <div className='mr-1'>
                                <div className={`grid`}>
                                    <div className={"flex flex-col"}>
                                        <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 min-h-[100px]'>
                                            <legend className='sub-heading'>Cutting Order Info</legend>
                                            <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                <div className="grid grid-cols-5 w-full">
                                                    <DisabledInput name="Doc Id." value={docId} required={true}
                                                    />
                                                    <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />

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
                                                    <DropdownInput name="Customer" options={dropDownListObject(supplierListBasedOnSupply, "name", "id")} value={partyId} setValue={setPartyId} required={true} readOnly={id} />
                                                    <OrderDropdown name={"Order"} readOnly={readOnly || !deliveryToId} selected={orderId} setSelected={setOrderId} partyId={partyId} />
                                                </div>
                                            </div>
                                        </fieldset>
                                        {orderId &&
                                            <OrderConsolidation selectedColorList={selectedColorList} setSelectedColorList={setSelectedColorList}
                                                selectedSizeList={selectedSizeList} setSelectedSizeList={setSelectedSizeList}
                                                selectedClassList={selectedClassList} setSelectedClassList={setSelectedClassList}
                                                selectedStyleList={selectedStyleList} setSelectedStyleList={setSelectedStyleList}
                                                selectedStyleTypeList={selectedStyleTypeList} setSelectedStyleTypeList={setSelectedStyleTypeList} id={id}
                                                cuttingOrderDetails={cuttingOrderDetails} setCuttingOrderDetails={setCuttingOrderDetails} orderId={orderId} />
                                        }
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