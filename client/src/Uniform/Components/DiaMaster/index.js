import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetDiaQuery,
    useGetDiaByIdQuery,
    useAddDiaMutation,
    useUpdateDiaMutation,
    useDeleteDiaMutation,
} from "../../../redux/uniformService/DiaMasterServices";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { DisabledInput, TextInput, CheckBox, DropdownInput } from "../../../Inputs";
import ReportTemplate from '../../../Basic/components/ReportTemplate'
import { diaMeasurementList } from "../../../Utils/DropdownData";

const MODEL = "Dia Master";

export default function Form() {




    // CMS
    // INCHES
    // OPENWIDTH
    // TUBULER



    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [measurement, setMeasurement] = useState("")
    const [kDia, setKDia] = useState(true)
    const [fDia, setFDia] = useState(true)
    const [active, setActive] = useState(true);


    const [searchValue, setSearchValue] = useState("");
    const childRecord = useRef(0);


    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: allData, isLoading, isFetching } = useGetDiaQuery({ params, searchParams: searchValue });
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetDiaByIdQuery(id, { skip: !id });


    const [addData] = useAddDiaMutation();
    const [updateData] = useUpdateDiaMutation();
    const [removeData] = useDeleteDiaMutation();

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) setReadOnly(true);
            setName(data?.name ? data.name : "");
            setMeasurement(data?.measurement ? data.measurement : "");
            setFDia(data?.fDia ? data.fDia : false);
            setKDia(data?.kDia ? data.kDia : false);
            setActive(id ? (data?.active ? data.active : false) : true);
        },
        [id]
    );

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        id, name, measurement, fDia, kDia, active, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
    }

    const validateData = (data) => {
        if (data.name) {
            return true;
        }
        return false;
    }


    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId("")
            syncFormWithDb(undefined)
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
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
                    <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                        <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
                            <div className='mr-1 md:ml-2'>
                                <fieldset className='frame my-1'>
                                    <legend className='sub-heading'>Dia Info</legend>
                                    <div className='grid grid-cols-1 my-2'>
                                        <div className="flex gap-10">
                                            <CheckBox name="K Dia" readOnly={readOnly} value={kDia} setValue={setKDia} />
                                            <CheckBox name="F Dia" readOnly={readOnly} value={fDia} setValue={setFDia} />
                                        </div>
                                        <TextInput name="Dia Desc" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                                        <DropdownInput
                                            name="Dia Measurement"
                                            options={(kDia && !fDia) ? diaMeasurementList.slice(2) : (kDia || fDia ? diaMeasurementList : [])}
                                            value={measurement}
                                            setValue={setMeasurement}
                                            required={true}
                                            readOnly={readOnly}
                                            disabled={(childRecord.current > 0)}
                                        />
                                        <DisabledInput name="Dia" value={(name) + (measurement)} disabled={(childRecord.current > 0)} />
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
