import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetProcessMasterQuery,
    useGetProcessMasterByIdQuery,
    useAddProcessMasterMutation,
    useUpdateProcessMasterMutation,
    useDeleteProcessMasterMutation,
} from "../../../redux/uniformService/ProcessMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput } from "../../../Inputs";
import ReportTemplate from '../../../Basic/components/ReportTemplate'
import { ProcessIOOptions } from "../../../Utils/DropdownData";

const MODEL = "Process Master";

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [io, setIo] = useState("");
    const [active, setActive] = useState(true);
    const [isCutting, setIsCutting] = useState(false);
    const [isPacking, setIsPacking] = useState(false);
    const [isPcsStage, setIsPcsStage] = useState(false);
    const [isStitching, setIsStitching] = useState(false);
    const [isPrintingJobWork, setIsPrintingJobWork] = useState(false);
    const [code, setCode] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [isIroning, setIsIroning] = useState(false)
    const childRecord = useRef(0);

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetProcessMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetProcessMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddProcessMasterMutation();
    const [updateData] = useUpdateProcessMasterMutation();
    const [removeData] = useDeleteProcessMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {


            if (id) {
                setReadOnly(true);
            } else {
                setReadOnly(false);
            }
            setName(data?.name ? data.name : "");
            setCode(data?.code ? data.code : "");
            setIo(data?.io ? data.io : "");
            setIsCutting(data?.isCutting ? data.isCutting : false);
            setIsPacking(data?.isPacking ? data.isPacking : false);
            setIsStitching(data?.isStitching ? data?.isStitching : false)
            setIsPcsStage(data?.isPcsStage ? data.isPcsStage : false);
            setIsIroning(data?.isIroning ? data.isIroning : false);
            setIsPrintingJobWork(data?.isPrintingJobWork ? data.isPrintingJobWork : false);
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, io, code, active, isCutting, isPacking, isIroning,
        isPcsStage, isPrintingJobWork, isStitching,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        return data.name && data.code && (data.isCutting || data.isPacking || data.isPcsStage ? true : data.io)
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)
            toast.success(text + "Successfully");
        } catch (error) {
            console.log("handle");
        }
    };

    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", {
                position: "top-center",
            });
            return;
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return;
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {
            handleSubmitCustom(addData, data, "Added");
        }
    };

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)
                setId("");
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
        setForm(true);
        syncFormWithDb(undefined)
        setSearchValue("");
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "Name", "IO", "Status"
    ]
    const tableDataNames = ["dataObj.name", "dataObj.io", 'dataObj.active ? ACTIVE : INACTIVE']


    // useEffect(() => {
    //     if (isCutting || isPacking) {
    //         setIsPcsStage(true)
    //     }
    // }, [isCutting, isPacking, setIsPcsStage])

    // useEffect(() => {
    //     if (!isPcsStage) {
    //         setIsCutting(false);
    //         setIsPacking(false);
    //     }
    // }, [isPcsStage, setIsCutting, setIsPacking])

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

                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
                    <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                        <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
                            <div className='mr-1 md:ml-2'>
                                <fieldset className='frame my-1'>
                                    <legend className='sub-heading'>Process Info</legend>{console.log(io, "io")}
                                    <div className='grid grid-cols-1 my-2'>
                                        <TextInput name="Process name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <DropdownInput name="IO" options={ProcessIOOptions} value={io} setValue={setIo} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        {/* <CheckBox name="PcsStage" readOnly={readOnly} value={isPcsStage} setValue={setIsPcsStage} />
                                        <CheckBox name="Cutting" readOnly={readOnly} value={isCutting} setValue={setIsCutting} /> */}
                                        <CheckBox name="Packing" readOnly={readOnly} value={isPacking} setValue={setIsPacking} />
                                        <CheckBox name="Stitching" readOnly={readOnly} value={isStitching} setValue={setIsStitching} />
                                        {/* <CheckBox name="Ironing" readOnly={readOnly} value={isPrintingJobWork} setValue={setIsPrintingJobWork} /> */}
                                        <CheckBox name="Ironing" readOnly={readOnly} value={isIroning} setValue={setIsIroning} />
                                        <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="frame hidden md:block overflow-x-hidden">
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
