import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
    useGetRolesQuery,
    useGetRoleByIdQuery,
    useAddRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation,
} from '../../../redux/services/RolesMasterService';
import FormHeader from '../FormHeader';
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify"
import { TextInput, CheckBox } from "../../../Inputs"
import ReportTemplate from '../ReportTemplate';
import { useGetPagesQuery } from '../../../redux/services/PageMasterService';
import { TICK_ICON } from "../../../icons";

const MODEL = "Role Master";

export default function RoleMaster() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("")
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);
    const [purchasePrice,setPurchasePrice] =useState(true);
    const[purchaseDepartment,setPurchaseDepartment]=useState(true);

    const [pages, setPages] = useState([]);
    const childRecord = useRef(0);

    const [searchValue, setSearchValue] = useState("");


    const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), defaultRole: false }
    const { data: allData, isLoading, isFetching } = useGetRolesQuery({ params, searchParams: searchValue });
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetRoleByIdQuery(id, { skip: !id });

    const { data: pagesData, isLoading: pagesLoading, isFetching: pagesFetching } = useGetPagesQuery(params);

    useEffect(() => {
        if (pagesData?.data) setPages(pagesData.data.map((page) => {
            let newPage = { ...page }
            newPage["create"] = false;
            newPage["read"] = false;
            newPage["edit"] = false;
            newPage["delete"] = false;
            return newPage
        }))
    }, [pagesLoading, pagesFetching, pagesData])

    const [addData] = useAddRoleMutation();
    const [updateData] = useUpdateRoleMutation();
    const [removeData] = useDeleteRoleMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) {
                setReadOnly(true);
                setPages(prev =>
                    prev.map((page) => {
                        const currentRoleOnPage = data?.RoleOnPage.find(item => parseInt(item?.page?.id) === parseInt(page.id));
                        let newPage = { ...page }
                        if (currentRoleOnPage) {
                            newPage["create"] = currentRoleOnPage.create;
                            newPage["read"] = currentRoleOnPage.read;
                            newPage["edit"] = currentRoleOnPage.edit;
                            newPage["delete"] = currentRoleOnPage.delete;
                        }
                        return newPage
                    }))
            } else {
                setPages(prev =>
                    prev.map((page) => {
                        let newPage = { ...page }
                        newPage["create"] = false;
                        newPage["read"] = false;
                        newPage["edit"] = false;
                        newPage["delete"] = false;
                        return newPage
                    }))
            }
            setName(data?.name ? data.name : "");
            setActive(id ? (data?.active ? data.active : false) : true);
            setPurchasePrice(data?.purchasePrice ? data.purchasePrice : false);
            setPurchaseDepartment(data?.purchaseDepartment ? data.purchaseDepartment : false);
            childRecord.current = data?.childRecord ? data?.childRecord : 0;
        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


    const data = {
        name,purchasePrice,purchaseDepartment,
        companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "tempCompanyId") ? secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "tempCompanyId") : secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        active, pages, id
    }

    const validateData = (data) => {
        if (data.name) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            await callback(data);
            setId("")
            syncFormWithDb(undefined)
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
                await removeData(id);
                setId("");
                setActive(true);
                setReadOnly(false);
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
    const tableHeaders = ["Role Name", "Status"]
    const tableDataNames = ["dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

    const tableHeadersPages = ["Page", "All", "Read", "Create", "Edit", "Delete"]

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
        <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>{console.log(purchasePrice,"purchaseprice")}
            <div className='flex flex-col frame w-full h-full'>
                <FormHeader childRecordValidationActions={["delete"]} onNew={onNew} onClose={() => { setForm(false); setSearchValue(""); }} model={MODEL} saveData={saveData} setReadOnly={setReadOnly} deleteData={deleteData} childRecord={childRecord.current} />
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
                    <div className='col-span-3 grid md:grid-cols-3 border'>
                        <div className='mr-1 md:ml-2 col-span-3 flex flex-col'>
                            <fieldset className='frame my-1'>
                                <legend className='sub-heading'>Role Info</legend>
                                <div className='grid grid-cols-2 my-2 justify-items-center'>
                                    <TextInput name="Role Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} />
                                    {/* <CheckBox name="Purchase Price" value={purchasePrice} setValue={setPurchasePrice} />
                                    <CheckBox name="Purchase Dept." value={purchaseDepartment} setValue={setPurchaseDepartment} /> */}

                                    <CheckBox name="Active" value={active} setValue={setActive} />
                                </div>
                            </fieldset>
                            <fieldset className='frame md:grid md:justify-items-stretch overflow-auto h-[420px]' style={{ width: "100%" }}>
                                <legend className='sub-heading'>Permissions</legend>
                                <table className='table-auto text-center'>
                                    <thead className='border-2 table-header'>
                                        <tr>
                                            {tableHeadersPages.map((head, index) => <th key={index} className='border-2 sticky top-0 stick-bg'>{head}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className={` ${readOnly ? 'border-2 pointer-events-none' : 'border-2'}`} >
                                        {pages.map((dataObj, index) =>
                                            <tr key={index} className='border-2 table-row'>
                                                <td key={index} className='table-data text-start'>{dataObj.name}</td>
                                                <td className='table-data' onClick={() => {
                                                    setPages(prev => prev.map((page) => {
                                                        if (page.id === dataObj.id) {
                                                            const out = !(dataObj.read && dataObj.create && dataObj.edit && dataObj.delete);
                                                            page.read = out;
                                                            page.create = out;
                                                            page.edit = out;
                                                            page.delete = out;
                                                        }
                                                        return page
                                                    }
                                                    ))
                                                }}>
                                                    {(dataObj.read && dataObj.create && dataObj.edit && dataObj.delete) ? TICK_ICON : ""}
                                                </td>
                                                <td className='table-data' onClick={() => {
                                                    setPages(prev => prev.map((page) => {
                                                        if (page.id === dataObj.id) {
                                                            page.read = !dataObj?.read
                                                        }
                                                        return page
                                                    }
                                                    ))
                                                }}>
                                                    {dataObj?.read ? TICK_ICON : ""}
                                                </td>
                                                <td className='table-data' onClick={() => {
                                                    setPages(prev => prev.map((page) => {
                                                        if (page.id === dataObj.id) {
                                                            page.create = !dataObj?.create
                                                        }
                                                        return page
                                                    }
                                                    ))
                                                }}>
                                                    {dataObj?.create ? TICK_ICON : ""}
                                                </td>
                                                <td className='table-data' onClick={() => {
                                                    setPages(prev => prev.map((page) => {
                                                        if (page.id === dataObj.id) {
                                                            page.edit = !dataObj?.edit
                                                        }
                                                        return page
                                                    }
                                                    ))
                                                }}>
                                                    {dataObj?.edit ? TICK_ICON : ""}
                                                </td>
                                                <td className='table-data' onClick={() => {
                                                    setPages(prev => prev.map((page) => {
                                                        if (page.id === dataObj.id) {
                                                            page.delete = !dataObj?.delete
                                                        }
                                                        return page
                                                    }))
                                                }}>
                                                    {dataObj?.delete ? TICK_ICON : ""}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </fieldset>
                        </div>
                    </div>
                    <div className='frame hidden md:block overflow-x-hidden'>
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
