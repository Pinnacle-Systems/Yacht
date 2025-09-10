import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    useGetOrderImportQuery,
    useGetOrderImportByIdQuery,
    useAddOrderImportMutation,
    useUpdateOrderImportMutation,
    useDeleteOrderImportMutation,
} from "../../../redux/services/OrderImportService";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import { toast } from "react-toastify";
import { DisabledInput, DateInput, DropdownInput } from "../../../Inputs";
import { dropDownListObject, } from '../../../Utils/contructObject';

import Modal from "../../../UiComponents/Modal";
import FormReport from "./FormReport";

import { getCommonParams, isGridDatasValid } from "../../../Utils/helper";

import ExcelSelectionTable from "./ExcelSelectionTable";
import moment from "moment";
import OrderImportItems from "./OrderImportItems";
import OrderDropdown from "../../Components/ReusableComponents/OrderDropdown";
import { useGetOrderByIdQuery } from "../../../redux/uniformService/OrderService";
import StudentList from "./StudentList";
import { useGetItemMasterQuery } from "../../../redux/uniformService/ItemMasterService";
import { useGetClassMasterQuery } from "../../../redux/uniformService/ClassMasterService";

const MODEL = "Order Import";

export default function Form() {

    const [readOnly, setReadOnly] = useState(false);
    const [docId, setDocId] = useState("")
    const [id, setId] = useState("");
    const [file, setFile] = useState(null);
    const [formReport, setFormReport] = useState(false);
    const [partyId, setPartyId] = useState("");
    const [date, setDate] = useState("");
    const [orderImportItems, setOrderImportItems] = useState([]);
    const [pres, setPres] = useState([]);
    const [additionalImportData, setAdditionalImportData] = useState([])
    const [orderId, setOrderId] = useState('');
    const [error, setError] = useState('');
    const [isDirectImportItems, setIsDirectImportItems] = useState(false)
    const childRecord = useRef(0);
    const { branchId, companyId, finYearId, userId } = getCommonParams()
    const params = {
        branchId, userId, finYearId
    };

    const { data: supplierList } =
        useGetPartyQuery({ params: { ...params } });

    const { data: allData, isLoading, isFetching } = useGetOrderImportQuery({ params, searchParams: '' });


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
    } = useGetOrderImportByIdQuery(id, { skip: !id });

    const [addData] = useAddOrderImportMutation();
    const [updateData] = useUpdateOrderImportMutation();
    const [removeData] = useDeleteOrderImportMutation();

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
        setOrderImportItems(data?.orderImportItems ? data?.orderImportItems : [])

    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        branchId, id, userId, companyId, finYearId
    }



    const {
        data: orderData,
    } = useGetOrderByIdQuery(orderId, { skip: !orderId });


    const validateData = (data) => {
        let mandatoryFields = ["po_number",
            "order_qty",
            "colour",
            "size_desc"
        ];


        return isGridDatasValid(pres, false, mandatoryFields)
    }



    const handleSubmitCustom = async (callback, data, text) => {
        try {
            const formData = new FormData();

            for (let key in data) {
                formData.append(key, data[key]);
            }
            if (file instanceof File) {
                formData.append("file", file);
            }

            let returnData;
            if (text === "Updated") {
                returnData = await callback(formData).unwrap();
            } else {

                returnData = await callback(formData).unwrap();
            }
            if (returnData?.statusCode === 0) {
                onNew()
                setError("");
                toast.success(text + "Successfully",{
          autoClose: 1000
        });
            } else if (returnData?.statusCode === 2) {

                setError(returnData)
            } else {
                toast.error(returnData?.message,{
          autoClose: 1000
        })
            }
        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = (isCreateMasters) => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" },{
          autoClose: 1000
        })
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
                toast.success("Deleted Successfully",{
          autoClose: 1000
        });
            } catch (error) {
                toast.error("something went wrong",{
          autoClose: 1000
        });
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
        setPres([]);
    };


    return (
        <div
            onKeyDown={handleKeyDown}
            className="md:items-start md:justify-items-center grid h-full bg-theme w-full">
            <Modal isOpen={formReport} onClose={() => setFormReport(false)} widthClass={"px-2 h-[90%] w-[50%]"}>
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

            <div className="flex flex-col frame w-full">
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
                    <div className="col-span-3 grid ">
                        <div className='col-span-3 grid '>
                            <div className='mr-1'>
                                <div className={`grid`}>
                                    <div className={"flex flex-col"}>
                                        <fieldset className='frame rounded-tr-lg rounded-bl-lg w-full border border-gray-600 px-3 min-h-[100px]'>
                                            <legend className='sub-heading'>Order Info</legend>
                                            <div className='flex flex-col justify-center items-start flex-1 w-full'>
                                                <div className="grid grid-cols-5 w-full">
                                                    <DisabledInput name="Doc Id." value={docId} required={true}
                                                    />
                                                    <DateInput name="Doc Date" value={date} type={"date"} required={true} readOnly={readOnly} disabled />

                                                </div>
                                            </div>
                                        </fieldset>


                                        <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-full border border-gray-600 md:pb-5 flex flex-1'>
                                            <legend className='sub-heading'>Import Details</legend>
                                            {id ?
                                                <OrderImportItems orderImportItems={orderImportItems} />
                                                :
                                                <ExcelSelectionTable pres={pres} setPres={setPres} params={params} readOnly={readOnly} file={file} setFile={setFile} />
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