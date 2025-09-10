import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetAccessoryMasterQuery,
    useGetAccessoryMasterByIdQuery,
    useAddAccessoryMasterMutation,
    useUpdateAccessoryMasterMutation,
    useDeleteAccessoryMasterMutation,
} from "../../../redux/uniformService/AccessoryMasterServices";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { useGetAccessoryItemMasterQuery } from "../../../redux/uniformService/AccessoryItemMasterServices";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { LongTextInput, DropdownInput, LongDisabledInput, CheckBox } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { accessoryCategoryList } from "../../../Utils/DropdownData";
import { useDispatch } from "react-redux";

const MODEL = "Accessory Master";


export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);

    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [accessoryItemId, setAccessoryItemId] = useState("");
    const [hsn, setHsn] = useState("");
    const [accessoryGroupId, setAccessoryGroupId] = useState("");
    const [accessoryCategory, setAccessoryCategory] = useState();
    const [active, setActive] = useState(true);


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

    // const { data: contentList } =
    //     useGetContentMasterQuery({ params: { ...params, active: true } });

    // const { data: YarnBlendList } =
    //     useGetYarnBlendMasterQuery({ params: { ...params, active: true } });

    const { data: accessoryItemList } =
        useGetAccessoryItemMasterQuery({ params });

    const { data: accessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params });


    const { data: allData, isLoading, isFetching } = useGetAccessoryMasterQuery({ params, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddAccessoryMasterMutation();
    const [updateData] = useUpdateAccessoryMasterMutation();
    const [removeData] = useDeleteAccessoryMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (id) setReadOnly(true);
        setAliasName(data?.aliasName ? data?.aliasName : "");
        setAccessoryCategory(data?.accessoryCategory ? data?.accessoryCategory : "");
        setAccessoryItemId(data?.accessoryItemId ? data?.accessoryItemId : "");
        setHsn(data?.hsn ? data?.hsn : "");
        setAccessoryGroupId(data?.accessoryItem.accessoryGroupId ? data?.accessoryItem.accessoryGroupId : "");
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
        aliasName, accessoryCategory,
        accessoryItemId, hsn, accessoryGroupId, active, companyId, id, userId
    }

    const validatePercentage = () => {
        const yarnBlendPercentage = yarnBlendDetails.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.percentage)
        }, 0);
        return yarnBlendPercentage === 100
    }

    function findName(arr, id) {
        if (!arr) return ""
        let data = arr.find(item => parseInt(item.id) === parseInt(id))
        return data ? data.name : ""
    }

    const calculateYarnName = () => {
        let group = findName(accessoryGroupList?.data, accessoryGroupId)
        let category = accessoryCategoryList.find(item => item.value === accessoryCategory)?.show
        let item = findName(accessoryItemList?.data, accessoryItemId)

        // let yarnBlend = yarnBlendDetails ?
        //     yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

        if (!group || !category || !item) return ""
        return `${category} / ${group} / ${item}`
    }

    useEffect(() => {
        if (id) return
        setAliasName(calculateYarnName())
    }, [calculateYarnName()])


    const validateData = (data) => {
        return data.aliasName && data.accessoryCategory && data.accessoryItemId && data.accessoryGroupId &&
            data.hsn
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
                type: `AccessoryGroupMaster/invalidateTags`,
                payload: ['Accessory Group'],
            });
        } catch (error) {
            console.log("handle");
        }
    };


    const saveData = () => {
        // if (!validatePercentage()) {
        //     toast.info("Yarn Blend equal to 100...!", { position: "top-center" })
        //     return
        // }
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
                    type: `AccessoryGroupMaster/invalidateTags`,
                    payload: ['Accessory Group'],
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
        syncFormWithDb(undefined)
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["Alias Name", "Status"]
    const tableDataNames = ['dataObj.aliasName', 'dataObj.active ? ACTIVE : INACTIVE']


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
                <div className="flex-1 grid md:grid-cols-2">
                    <div className="border-l w-[800px] h-[570px] overflow-auto">
                        <div className='col-span-3 grid md:grid-cols-2 border-l'>
                            <div className='mr-1 md:ml-5'>
                                <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-5 md:w-[650px] md:pb-5 flex h-[200px] p-3 overflow-auto border border-gray-600'>
                                    <legend className='sub-heading'>Accessories</legend>
                                    <div className='flex flex-col justify-start gap-3 flex-1'>
                                        <div className="md:grid gap-3">
                                            <DropdownInput
                                                name="Accessory Category"
                                                options={accessoryCategoryList}
                                                value={accessoryCategory}
                                                setValue={setAccessoryCategory}
                                                required={true}
                                                readOnly={readOnly}
                                                disabled={(childRecord.current > 0)}
                                            />
                                            <DropdownInput name="Accessory Group" options={dropDownListObject(id ? accessoryGroupList.data : accessoryGroupList.data.filter(item => item.active), "name", "id")} value={accessoryGroupId} setValue={(value) => { setAccessoryGroupId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                            <DropdownInput name="Accessory Item" options={dropDownListObject(id ? accessoryItemList.data.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)) : accessoryItemList.data.filter(item => parseInt(accessoryGroupId) === parseInt(item.accessoryGroupId)).filter(item => item.active), "name", "id")} value={accessoryItemId} setValue={(value) => { setAccessoryItemId(value) }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)}
                                            />
                                            <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                        </div>
                                    </div>
                                </fieldset>
                                <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-[650px] md:pb-5 flex p-3 border border-gray-600'>
                                    <legend className='sub-heading'>Accessory Details</legend>
                                    <div className='flex flex-col justify-start gap-3 flex-1'>
                                        <LongTextInput readOnly name="Accessory Name" className={'focus:outline-none cursor-not-allowed md:col-span-2 h-6 w-[610px] border border-gray-500 rounded'} type="text" value={calculateYarnName()} disabled={(childRecord.current > 0)} />
                                        <div className="flex">
                                            <LongTextInput name="Alias Name" className={'focus:outline-none md:col-span-2 h-6 w-[450px] border border-gray-500 rounded'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                            <LongTextInput name="HSN Code" className={'focus:outline-none md:col-span-2 h-6 w-[150px] border border-gray-500 rounded'} type="text" value={hsn} setValue={setHsn} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                        </div>
                                    </div>
                                </fieldset>
                            </div>
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
