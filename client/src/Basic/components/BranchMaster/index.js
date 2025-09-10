import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetBranchQuery,
    useGetBranchByIdQuery,
    useAddBranchMutation,
    useUpdateBranchMutation,
    useDeleteBranchMutation,
} from '../../../redux/services/BranchMasterService';
import FormHeader from '../FormHeader';
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify"
import { TextInput, CheckBox, DisabledInput, TextArea } from "../../../Inputs"
import ReportTemplate from '../ReportTemplate';

const MODEL = "Branch Master";

export default function BranchMaster({ companyCode, setBranchForm }) {
    const [form, setForm] = useState(true);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [nameBranch, setNameBranch] = useState("");
    const [codeBranch, setCodeBranch] = useState("");
    const [address, setAddress] = useState("");
    const [activeBranch, setActiveBranch] = useState(true);

    const [contactNameBranch, setContactNameBranch] = useState("");
    const [contactMobileBranch, setContactMobileBranch] = useState("");
    const [contactEmailBranch, setContactEmailBranch] = useState("")
    const [searchValue, setSearchValue] = useState("");

    const childRecord = useRef(0);

    const companyId = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    const params = { companyId }


    const { data: allData, isLoading, isFetching } = useGetBranchQuery({ params, searchParams: searchValue });
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetBranchByIdQuery(id, { skip: !id });

    const [addData] = useAddBranchMutation();
    const [updateData] = useUpdateBranchMutation();
    const [removeData] = useDeleteBranchMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setNameBranch(data?.branchName ? data.branchName : "");
            setCodeBranch(data?.branchCode ? data.branchCode : "");
            setActiveBranch(data?.active ? data.active : "");
            setContactNameBranch(data?.contactName ? data.contactName : "");
            setContactEmailBranch(data?.contactEmail ? data.contactEmail : "");
            setContactMobileBranch(data?.contactMobile ? data.contactMobile : "");
            setAddress(data?.address ? data.address : "");
            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        }, [id])

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const data = {
        name: nameBranch, code: codeBranch, active: activeBranch, contactEmail: contactEmailBranch,
        contactMobile: contactMobileBranch, contactName: contactNameBranch, companyId, id, address
    }

    const validateData = (data) => {
        if (data.name && data.code) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            await callback(data).unwrap();
            toast.success(text + "Successfully");
        } catch (error) {
            console.log("handle")
        }
    }

    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Added")
        }
    }

    const deleteData = async () => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return
            }
            try {
                await removeData(id).unwrap();
                setId("");
                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong")
            }
            ;
        }
    }

    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }

    const onNew = () => { setId(""); setReadOnly(false); setForm(true); setSearchValue("") }

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = [
        "Code", "Name", "Status"
    ]
    const tableDataNames = ["dataObj.branchCode", "dataObj.branchName", 'dataObj.active ? ACTIVE : INACTIVE']

    if (!form)
        return <ReportTemplate
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

    return (
        <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
            <div className='flex flex-col frame w-full h-full'>
                <FormHeader onNew={onNew} onClose={() => { setSearchValue("");
                 setBranchForm(false); }}
                  model={MODEL} 
                  saveData={saveData} 
                  setReadOnly={setReadOnly} 
                  deleteData={deleteData} />
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
                    <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
                        <div className='mr-1 md:ml-2'>
                            <fieldset className='my-1 row-span-2 overflow-auto'>
                                <legend className='sub-heading'>Basic Info</legend>
                                <div className='grid grid-cols-1 my-2'>
                                    <DisabledInput name="Company Code" type="text" value={companyCode} disabled={(childRecord.current > 0)} />
                                    <TextInput name="Branch Name" type="text" value={nameBranch} setValue={setNameBranch} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    <TextInput name="Branch Code" type="text" value={codeBranch} setValue={setCodeBranch} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    <TextArea name="Address" type="text" value={address} setValue={setAddress} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                            </fieldset>
                            <fieldset className='my-1 row-span-2 overflow-auto'>
                                <legend className='sub-heading'>Contact Person Details</legend>
                                <div className='grid grid-cols-1 my-2'>
                                    <TextInput name="Name" type="text" value={contactNameBranch} setValue={setContactNameBranch} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    <TextInput name="Mobile No" type="number" value={contactMobileBranch} setValue={setContactMobileBranch} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                    <TextInput name="Email id" type="text" value={contactEmailBranch} setValue={setContactEmailBranch} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                </div>
                            </fieldset>
                            <div className='flex justify-between text-sm'>
                                <CheckBox name="Active" readOnly={readOnly} value={activeBranch} setValue={setActiveBranch} />
                            </div>
                        </div>
                    </div>
                    <div className='frame overflow-x-hidden'>
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
    )
}
