import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetLocationMasterQuery,
    useGetLocationMasterByIdQuery,
    useAddLocationMasterMutation,
    useUpdateLocationMasterMutation,
    useDeleteLocationMasterMutation,
} from "../../../redux/uniformService/LocationMasterServices";
import {
    useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput } from "../../../Inputs";
import ReportTemplate from '../../../Basic/components/ReportTemplate';
import { dropDownListObject } from "../../../Utils/contructObject";
import { Loader } from "../../../Basic/components";
import LocationReport from "./LocationReport";
import LocationFormReport from "./LocationFormReport";
// import { useDispatch } from "react-redux";

const MODEL = "Location Master";

export default function Form() {
    const [form, setForm] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [storeName, setStoreName] = useState("");
    const [locationId, setLocationId] = useState("");
    const [isFabric, setIsFabric] = useState(false);
    const [isYarn, setIsYarn] = useState(false);
    const [isAccessory, setIsAccessory] = useState(false);
    const [isGarments, setIsGarments] = useState(false);
    const [active, setActive] = useState(true);

    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);
    // const dispatch = useDispatch();


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetLocationMasterQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetLocationMasterByIdQuery(id, { skip: !id });

    const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params });

    const [addData] = useAddLocationMasterMutation();
    const [updateData] = useUpdateLocationMasterMutation();
    const [removeData] = useDeleteLocationMasterMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setStoreName(data?.storeName ? data.storeName : "");
            setLocationId(data?.locationId ? data.locationId : "");
            setIsAccessory(data?.isAccessory ? data?.isAccessory : false);
            setIsFabric(data?.isFabric ? data?.isFabric : false);
            setIsYarn(data?.isYarn ? data?.isYarn : false);
            setIsGarments(data?.isGarments ? data?.isGarments : false);
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, storeName, locationId, isYarn, isAccessory, isFabric, isGarments, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.storeName && data.locationId) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            await callback(data)
            toast.success(text + "Successfully");
            setId("")
            syncFormWithDb(undefined)
            // dispatch({
            //     type: `LocationMaster/invalidateTags`,
            //     payload: ['Location'],
            //   }); 
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
                // dispatch({
                //     type: `LocationMaster/invalidateTags`,
                //     payload: ['Location'],
                //   }); 
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

    if (!form)
        return (
            <LocationReport searchValue={searchValue} setSearchValue={setSearchValue} onNew={onNew} onClick={onDataClick} />
        );

    if (isBranchFetching || isBranchLoading) return <Loader />
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
                                    <legend className='sub-heading'>Location Info</legend>
                                    <div className='grid grid-cols-2 my-2'>
                                        <CheckBox name="Yarn" value={isYarn} setValue={setIsYarn}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                        />
                                        <CheckBox name="Fabric" value={isFabric} setValue={setIsFabric}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                        />
                                    </div>
                                    <div className='grid grid-cols-2 my-2'>
                                        <CheckBox name="Accessory" value={isAccessory} setValue={setIsAccessory}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                        />
                                        <CheckBox name="Garments" value={isGarments} setValue={setIsGarments}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 my-2'>
                                        <DropdownInput
                                            name="Location"
                                            options={dropDownListObject(id ? branchList.data : branchList.data.filter(item => item.active), "branchName", "id")}
                                            value={locationId}
                                            setValue={setLocationId}
                                            required={true}
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                        />
                                        <TextInput name="Store" type="text" value={storeName} setValue={setStoreName} readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                        />
                                        <CheckBox name="Active" value={active} setValue={setActive} readOnly={readOnly} />
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="frame hidden md:block overflow-x-hidden">
                        <LocationFormReport searchValue={searchValue} setSearchValue={setSearchValue} onNew={onNew} onClick={onDataClick} />
                    </div>
                </div>
            </div>
        </div>
    );
}
