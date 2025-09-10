import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetYarnMasterQuery,
    useGetYarnMasterByIdQuery,
    useAddYarnMasterMutation,
    useUpdateYarnMasterMutation,
    useDeleteYarnMasterMutation,
} from "../../../redux/uniformService/YarnMasterServices";
// import { useGetContentMasterQuery } from "../../../redux/ErpServices/ContentMasterServices";
import { useGetYarnBlendMasterQuery } from "../../../redux/uniformService/YarnBlendMasterServices";
import { useGetYarnTypeMasterQuery } from "../../../redux/uniformService/YarnTypeMasterServices";
import YarnBlendDetails from "./YarnBlendDetails";
// import { useGetCountsMasterQuery } from "../../../redux/uniformService/CountsMasterServices";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, LongTextInput, DropdownInput, LongDisabledInput, CheckBox, DisabledInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
const MODEL = "Yarn Master";


export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);

    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [yarnTypeId, setYarnTypeId] = useState("");
    const [hsn, setHsn] = useState("");
    const [countsId, setCountsId] = useState("");
    const [contentId, setContentId] = useState();
    const [active, setActive] = useState(true);

    const [taxPercent, setTaxPercent] = useState("");
    const [searchValue, setSearchValue] = useState("");

    const childRecord = useRef(0);

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
    //     useGetContentMasterQuery({ params });

    const { data: YarnBlendList } =
        useGetYarnBlendMasterQuery({ params });

    const { data: YarnTypeList } =
        useGetYarnTypeMasterQuery({ params });

    // const { data: countsList } =
    //     useGetCountsMasterQuery({ params });


    const { data: allData, isLoading, isFetching } = useGetYarnMasterQuery({ params, searchParams: searchValue });

console.log(yarnBlendDetails,"yarnBlendDetails")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetYarnMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddYarnMasterMutation();
    const [updateData] = useUpdateYarnMasterMutation();
    const [removeData] = useDeleteYarnMasterMutation();

    const syncFormWithDb = useCallback((data) => {
        if (id) setReadOnly(true);
        if (id) setAliasName(data?.aliasName ? data?.aliasName : "");
        setContentId(data?.contentId ? data?.contentId : "");
        setYarnBlendDetails(data?.YarnOnYarnBlend ? data?.YarnOnYarnBlend : [{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
        setYarnTypeId(data?.yarnTypeId ? data?.yarnTypeId : "");
        setHsn(data?.hsn ? data?.hsn : "");
        setCountsId(data?.countsId ? data?.countsId : "");
        setTaxPercent(data?.taxPercent ? data?.taxPercent : 0);
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
        aliasName, contentId,
        yarnBlendDetails: yarnBlendDetails ? yarnBlendDetails.filter(item => item.yarnBlendId) : undefined, yarnTypeId, hsn, taxPercent,
        countsId, active, companyId, id, userId
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
        // let count = findName(countsList?.data, countsId)
        // let content = findName(contentList?.data, contentId)
        // let yarnType = findName(YarnTypeList?.data, yarnTypeId)

        // let yarnBlend = yarnBlendDetails ?
        //     yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

        // if (!count || !content || !yarnType) return ""
        // return `${count} / ${content} ( ${yarnBlend} )/ ${yarnType}`
    }

    useEffect(() => {
        if (id) return
        setAliasName(calculateYarnName())
    }, [calculateYarnName()])


    const validateData = (data) => {
        return data.aliasName 
        &&  data.hsn
        //  && data.contentId && data.yarnTypeId && data.countsId
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
        } catch (error) {
            console.log("handle");
        }
    };


    const saveData = () => {
        if (!validatePercentage()) {
            toast.info("Yarn Blend equal to 100...!", { position: "top-center" })
            return
        }
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
                        <div className='col-span-3 mr-1 md:ml-5'>
                            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-5 md:w-[650px] flex h-[300px] overflow-auto border border-gray-600'>
                                <legend className='sub-heading'>Yarn Blend Details</legend>
                                <div className='flex flex-col justify-start gap-3 flex-1'>
                                    <div className="md:grid md:grid-cols-3">
                                        {/* <DropdownInput name="Content" options={dropDownListObject(id ? contentList.data : contentList.data.filter(item => item.active), "name", "id")} value={contentId} setValue={(value) => { setContentId(value); }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <DropdownInput name="Counts" options={dropDownListObject(id ? countsList.data : countsList.data.filter(item => item.active), "name", "id")} value={countsId} setValue={(value) => { setCountsId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                        <DropdownInput name="Yarn Type" options={dropDownListObject(id ? YarnTypeList.data : YarnTypeList.data.filter(item => item.active), "name", "id")} value={yarnTypeId} setValue={(value) => { setYarnTypeId(value); }} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} /> */}
                                        <TextInput name={"Gst %"} value={taxPercent} setValue={setTaxPercent} readOnly={readOnly} required disabled={(childRecord.current > 0)} />
                                        <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                    </div>
                                    <YarnBlendDetails id={id} params={params} yarnBlend={yarnBlendDetails} setYarnBlend={setYarnBlendDetails} readOnly={readOnly} />
                                </div>  
                            </fieldset>
                            <fieldset className='frame rounded-tr-lg rounded-bl-lg rounded-br-lg my-1 w-[650px] flex border border-gray-600'>
                                <legend className='sub-heading'>Yarn Details</legend>
                                <div className='flex flex-col justify-start gap-3 p-3 flex-1'>
                                    <LongTextInput  name="Yarn Name" className={'focus:outline-none  md:col-span-2 h-6 w-[500px] border border-gray-500 rounded'} type="text" value={calculateYarnName()} disabled={(childRecord.current > 0)} />
                                    <div className="flex">
                                        <LongTextInput name="Alias Name" className={'focus:outline-none md:col-span-2 h-6 w-[450px] border border-gray-500 rounded'} type="text" value={aliasName} setValue={setAliasName} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                        <LongTextInput name="HSN Code" className={'focus:outline-none md:col-span-2 h-6 w-[150px] border border-gray-500 rounded'} type="text" value={hsn} setValue={setHsn} readOnly={readOnly} required={true} disabled={(childRecord.current > 0)} />
                                    </div>
                                </div>
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
                            data={allData?.data ? allData?.data : []}
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
