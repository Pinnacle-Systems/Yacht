import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetPanelMasterQuery,
    useGetPanelMasterByIdQuery,
    useAddPanelMasterMutation,
    useUpdatePanelMasterMutation,
    useDeletePanelMasterMutation,
} from "../../../redux/uniformService/PanelMasterService";
// import { useGetYarnBlendMasterQuery } from "../../../redux/uniformService/YarnBlendMasterServices";
// import { useGetFabricTypeMasterQuery } from "../../../redux/uniformService/FabricTypeMasterServices";
// import YarnBlendDetails from "../YarnMaster/YarnBlendDetails";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { LongTextInput, DropdownInput, LongDisabledInput, CheckBox, TextInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { dropDownListObject, } from '../../../Utils/contructObject';
import { useGetItemTypeMasterQuery } from "../../../redux/uniformService/ItemTypeMasterService";
const MODEL = "Panel Master";


export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [aliasName, setAliasName] = useState("");
    const [yarnBlendDetails, setYarnBlendDetails] = useState("");
    const [fabricTypeId, setFabricTypeId] = useState("");
    const [hsn, setHsn] = useState("");
    const [active, setActive] = useState(true);
    const [organic, setOrganic] = useState(false)
    const [itemTypeId, setItemTypeId] = useState("")

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


    const { data: allData, isLoading, isFetching } = useGetPanelMasterQuery({ params, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetPanelMasterByIdQuery(id, { skip: !id });

    const [addData] = useAddPanelMasterMutation();
    const [updateData] = useUpdatePanelMasterMutation();
    const [removeData] = useDeletePanelMasterMutation();
    const { data: ItemTypeList } = useGetItemTypeMasterQuery({ params });
    const syncFormWithDb = useCallback((data) => {
        if (id) setReadOnly(true);
        // setAliasName(data?.aliasName ? data?.aliasName : "");
        // setYarnBlendDetails(data?.FabricOnYarnBlend ? data?.FabricOnYarnBlend : [{ yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }, { yarnBlendId: "", percentage: "" }]);
        // setFabricTypeId(data?.fabricTypeId ? data?.fabricTypeId : "");
        // setHsn(data?.hsn ? data?.hsn : "");
        setName(data?.name ? data.name : "");
        setItemTypeId(data?.itemTypeId ? data?.itemTypeId : "")
        setActive(id ? (data?.active ? data.active : false) : true);
        // setOrganic(data?.organic ? data.organic : false);
    }, [id]);

    useEffect(() => {
        if (id) {
            syncFormWithDb(singleData?.data);
        } else {
            syncFormWithDb(undefined);
        }
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        name,
        // itemTypeId,
        active,
        companyId, id, userId
    }

    const validatePercentage = () => {
        // const yarnBlendPercentage = yarnBlendDetails.filter(blend => blend.yarnBlendId).reduce((accumulator, currentValue) => {
        //     return accumulator + parseInt(currentValue.percentage)
        // }, 0);
        // return yarnBlendPercentage === 100
    }

    function findName(arr, id) {
        if (!arr) return ""
        let data = arr.find(item => parseInt(item.id) === parseInt(id))
        return data ? data.name : ""
    }

    const calculateYarnName = () => {
        //     let fabricType = findName(FabricTypeList?.data, fabricTypeId)

        //     let yarnBlend = yarnBlendDetails ?
        //         yarnBlendDetails?.filter(blend => blend.yarnBlendId && blend.percentage).map(blend => `${parseInt(blend.percentage)}%${findName(YarnBlendList?.data, blend.yarnBlendId)}`).join(' ') : "";

        //     if (!fabricType) return ""
        //     return `( ${yarnBlend} )/ ${fabricType}`
    }

    useEffect(() => {
        if (id) return
        setAliasName(calculateYarnName())
    }, [calculateYarnName()])


    const validateData = (data) => {
        return (data?.name)
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData;
            if (text == "Updated") {
                returnData = await callback({ id, body: data }).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            setId(returnData.data.id)
            toast.success(text + "Successfully");
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
        setForm(true);
        setSearchValue("");
        setReadOnly(false);
        // syncFormWithDb(undefined)
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

                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
                    <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                        <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
                            <div className='mr-1 md:ml-2'>
                                <fieldset className='frame my-1'>
                                    <legend className='sub-heading'>Panel Info</legend>
                                    <div className='flex flex-col justify-start gap-3 flex-1'>
                                        <div className="grid grid-cols-2">
                                            <TextInput name="PanelName" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                            {/* <DropdownInput
                                                name="Item Type"
                                                options={dropDownListObject(
                                                    id
                                                        ? ItemTypeList?.data
                                                        : ItemTypeList?.data.filter((item) => item.active),
                                                    "name",
                                                    "id"
                                                )}
                                                value={itemTypeId}
                                                setValue={(value) => {
                                                    setItemTypeId(value);
                                                }}
                                                readOnly={readOnly}
                                                required={true}
                                                disabled={childRecord.current > 0}
                                            /> */}

                                            <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
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
