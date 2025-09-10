import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetTaxTemplateQuery,
    useGetTaxTemplateByIdQuery,
    useAddTaxTemplateMutation,
    useUpdateTaxTemplateMutation,
    useDeleteTaxTemplateMutation,
} from "../../../redux/services/TaxTemplateServices";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import TaxTemplateGrid from "./TaxTemplateGrid";
import { TextInput, CheckBox } from "../../../Inputs";
import { useDispatch } from "react-redux";

const MODEL = "Tax Template Master";


export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");

    const [name, setName] = useState("")
    const [active, setActive] = useState(true);
    const [taxTemplateDetails, setTaxTemplateDetails] = useState([])

    const [searchValue, setSearchValue] = useState("");

    const childRecord = useRef(0);
    const dispatch = useDispatch();

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )
    const params = {
        companyId
    };

    const { data: allData, isLoading, isFetching } = useGetTaxTemplateQuery({ params, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetTaxTemplateByIdQuery(id, { skip: !id });

    const [addData] = useAddTaxTemplateMutation();
    const [updateData] = useUpdateTaxTemplateMutation();
    const [removeData] = useDeleteTaxTemplateMutation();

    const syncFormWithDb = useCallback((data) => {
        if (id) setReadOnly(true);
        setName(data ? data?.name : "");
        setTaxTemplateDetails(data ? data?.TaxTemplateDetails : []);
        setActive(id ? (data?.active ? data.active : false) : true);
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name, active, companyId, id, userId,
        taxTemplateDetails: taxTemplateDetails.filter(temp => temp.taxTermId)
    }

    const validateData = (data) => {
        return data.taxTemplateDetails && data.name
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            setId("")
            syncFormWithDb(undefined)
            toast.success(text + "Successfully");
            dispatch({
                type: `TaxTermMaster/invalidateTags`,
                payload: ['Taxe Name'],
            });
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
                dispatch({
                    type: `TaxTermMaster/invalidateTags`,
                    payload: ['Tax Name'],
                });
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
        setForm(true);
        setSearchValue("");
        setReadOnly(false);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["Name", "Status"]
    const tableDataNames = ['dataObj.name', 'dataObj.active ? ACTIVE : INACTIVE']


    if (!form)
        return (
            <ReportTemplate
                heading={MODEL}
                tableHeaders={tableHeaders}
                tableDataNames={tableDataNames}
                loading={
                    isLoading || isFetching
                }
                setForm={setForm}
                data={allData?.data}
                onClick={onDataClick}
                onNew={onNew}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
            />
        );

    return (
        <div
            onKeyDown={handleKeyDown}
            className="md:items-start md:justify-items-center grid h-full bg-theme"
        >
            <div className="flex flex-col frame w-full h-full">
                <FormHeader
                    onNew={onNew}
                    onClose={() => {
                        setForm(false);
                        setSearchValue("");
                    }}
                    model={MODEL}
                    saveData={saveData}
                    setReadOnly={setReadOnly}
                    deleteData={deleteData}
                // childRecord={childRecord.current}
                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
                    <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                        <div className='col-span-3 mr-1 md:ml-5'>
                            <fieldset className='frame my-1 rounded-tr-lg rounded-bl-lg rounded-br-lg border border-gray-600'>
                                <legend className='sub-heading'>Tax Template Info</legend>
                                <div className='grid grid-cols-1 my-2'>
                                    <TextInput name="Template Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                </div>
                            </fieldset>
                            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-5 w-full flex h-[400px] overflow-auto border border-gray-600'>
                                <legend className='sub-heading'>Tax Template Details</legend>
                                <TaxTemplateGrid params={params} taxTemplateItems={taxTemplateDetails} setTaxTemplateItems={setTaxTemplateDetails} readOnly={readOnly} />
                            </fieldset>
                        </div>
                    </div>
                    <div className="frame overflow-x-hidden">
                        <FormReport
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            setId={setId}
                            tableHeaders={tableHeaders}
                            tableDataNames={tableDataNames}
                            data={allData?.data}
                            loading={
                                isLoading || isFetching
                            }
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}
