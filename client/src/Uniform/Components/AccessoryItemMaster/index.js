import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetAccessoryItemMasterQuery,
    useGetAccessoryItemMasterByIdQuery,
    useAddAccessoryItemMasterMutation,
    useUpdateAccessoryItemMasterMutation,
    useDeleteAccessoryItemMasterMutation,
} from "../../../redux/uniformService/AccessoryItemMasterServices";
import {
    useGetPartyQuery,
} from "../../../redux/services/PartyMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { useGetAccessoryGroupMasterQuery } from "../../../redux/uniformService/AccessoryGroupMasterServices";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput, } from "../../../Inputs";
import { dropDownListObject } from "../../../Utils/contructObject";
import ReportTemplate from '../../../Basic/components/ReportTemplate'
import PartySupplyDetails from "./PartySupplyDetails";
import { useDispatch } from "react-redux";

const MODEL = "Accessory Item Master";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [accessoryGroupId, setAccessoryGroupId] = useState("")
    const [active, setActive] = useState(true);
    const [partySuppliesItem, setPartySuppliesItem] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);

    const dispatch = useDispatch()

    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const params = {
        companyId
    };
    const { data: partyData, isLoading: isPartyLoading, isFetching: isPartyFetching } = useGetPartyQuery(params)


    const { data: AccessoryGroupList } =
        useGetAccessoryGroupMasterQuery({ params });

    const { data: allData, isLoading, isFetching, refetch } = useGetAccessoryItemMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetAccessoryItemMasterByIdQuery(id, { skip: !id });


    const [addData] = useAddAccessoryItemMasterMutation();
    const [updateData] = useUpdateAccessoryItemMasterMutation();
    const [removeData] = useDeleteAccessoryItemMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            setAccessoryGroupId(data?.accessoryGroupId ? data.accessoryGroupId : "");
            setActive(id ? (data?.active ? data.active : false) : true);
            setPartySuppliesItem(data?.PartyOnAccessoryItems ? data?.PartyOnAccessoryItems.map(item => item.partyId) : [])
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, accessoryGroupId, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"),
        partySuppliesItem
    }

    const validateData = (data) => {
        if (data.name && data.accessoryGroupId) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId("")
            syncFormWithDb(undefined)
            dispatch({
                type: `partyMaster/invalidateTags`,
                payload: ['Party'],
            });
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
                dispatch({
                    type: `partyMaster/invalidateTags`,
                    payload: ['Party'],
                });
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
        setForm(true);
        setSearchValue("");
        syncFormWithDb(undefined)
        setReadOnly(false);
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }

    const tableHeaders = [
        "Name", "Status"
    ]
    const tableDataNames = ["dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

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
                <div className="flex-1 grid grid-cols-4 gap-x-2 overflow-clip">
                    <div className="col-span-3 overflow-auto">
                        <div className='col-span-3 grid overflow-auto'>
                            <div className='mr-1 md:ml-2 mb-4'>
                                <fieldset className='frame my-1 border border-gray-500 p-2'>
                                    <legend className='sub-heading'>Accessory Item Info</legend>
                                    <div className='flex my-2 gap-10 font-semibold justify-evenly items-center'>
                                        <TextInput className={"text-sm"} name="Item Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <DropdownInput className={"text-sm"} name="Item Type" options={dropDownListObject(id ? AccessoryGroupList.data : AccessoryGroupList.data.filter(item => item.active), "name", "id")} value={accessoryGroupId} setValue={(value) => { setAccessoryGroupId(value); }} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <CheckBox className={"text-sm"} name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                                    </div>
                                </fieldset>
                            </div>
                            <div className='mr-1 md:ml-2'>
                                <fieldset className='frame my-1 border-gray-500 p-2'>
                                    <legend className='sub-heading'>Party Supply Details</legend>
                                    <div className='grid my-2 justify-items-center items-center px-10'>
                                        <PartySupplyDetails readOnly={readOnly} partySuppliesItem={partySuppliesItem} setPartySuppliesItem={setPartySuppliesItem}
                                            partyDetails={partyData ? partyData.data : []} />
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
