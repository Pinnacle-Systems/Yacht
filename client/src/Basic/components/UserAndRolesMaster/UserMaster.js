import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
    useGetUserQuery,
    useGetUserByIdQuery,
    useAddUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
} from "../../../redux/services/UsersMasterService";
import { useGetEmployeeQuery } from "../../../redux/services/EmployeeMasterService";
import { useGetRolesQuery } from "../../../redux/services/RolesMasterService";
import { useGetBranchQuery } from "../../../redux/services/BranchMasterService";

import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput, MultiSelectDropdown } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { dropDownListObject, multiSelectOption, multiSelectOptionSelectedApiData } from '../../../Utils/contructObject';

const MODEL = "User Master";

export default function Form() {
    const [form, setForm] = useState(false);

    const [readOnly, setReadOnly] = useState(false);

    const [id, setId] = useState("")
    const [name, setName] = useState("");
    const [password, setPassword] = useState("")
    const [active, setActive] = useState(true);
    const [role, setRole] = useState("");
    const [branches, setBranches] = useState([]);
    const [employee, setEmployee] = useState("");
    const [isAdmin, setIsAdmin] = useState(false)


    const [searchValue, setSearchValue] = useState("");

    const childRecord = useRef(0);

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const { data: employeeList, isLoading: isEmployeeLoading, isFetching: isEmployeeFetching } =
        useGetEmployeeQuery({ params: { ...params, active: true } }, { skip: !form });

    const { data: roleList, isLoading: isRoleLoading, isFetching: isRoleFetching } =
        useGetRolesQuery({ params: { ...params, active: true, defaultRole: false } }, { skip: !form });

    const { data: branchesList, isLoading: branchesLoading, isFetching: branchesFetching } =
        useGetBranchQuery({ params: { ...params, active: true, defaultRole: false } }, { skip: !form });

    const { data: allData, isLoading, isFetching } = useGetUserQuery({ params: { ...params, defaultRole: false }, searchParams: searchValue });


    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id, { skip: !id });

    const [addData] = useAddUserMutation();
    const [updateData] = useUpdateUserMutation();
    const [removeData] = useDeleteUserMutation();

    const syncFormWithDb = useCallback((data) => {
        if (id) setReadOnly(true);
        setId(data?.id ? data.id : "");
        setName(data?.username ? data.username : "");
        setActive(id ? (data?.active ? data.active : false) : true);
        setIsAdmin(id ? (data?.isAdmin ? data?.isAdmin : false) : true);
        setRole(data?.roleId ? data.roleId : "");
        setEmployee(data?.Employee?.id ? data?.Employee?.id : "");
        setBranches(data ? data?.UserOnBranch.map((branch) => { return { value: branch.branchId, label: branch.Branch.branchName } }) : [])
    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

    const data = {
        username: name, password, active, roleId: role, branches: multiSelectOptionSelectedApiData(branches), employeeId: employee, id, isAdmin
    }

    const validateData = (data) => {
        if (data.username && (id ? true : data.password) && data.roleId && data.branches) {
            return true;
        }
        return false;
    }

    const handleSubmitCustom = async (callback, data, text) => {
        try {
            await callback(data)
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
        setReadOnly(false);
        setForm(true);
        setSearchValue("");
        setIsAdmin()
        setName("")
        setPassword("")
    };

    function onDataClick(id) {
        setId(id);
        setForm(true);
    }
    const tableHeaders = ["Username", "Role", "Status"]
    const tableDataNames = ["dataObj.username", "dataObj?.role?.name", 'dataObj.active ? ACTIVE : INACTIVE']


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
                    childRecord={childRecord.current}
                />

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">

                    <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
                        <div className='mr-1 md:ml-2'>
                            <fieldset className='frame my-1'>
                                <legend className='sub-heading'>User Info</legend>
                                <form className='grid grid-cols-1 my-2' autoComplete="chrome-off">
                                    <TextInput name="Username" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} />
                                    {!id
                                        ?
                                        <TextInput name="Password" type="password" value={password} setValue={setPassword} required={true} readOnly={readOnly} 
/>
                                        :
                                        ""
                                    }
                                    {console.log(password,"password")
                                    }
                                    <DropdownInput name="Employee" options={!employeeList ? [] : employeeList?.data.map(employee => { return { show: `${employee.regNo}/${employee.name}/${employee.EmployeeCategory?.name}`, value: employee.id } })} value={employee} setValue={setEmployee} required={true} readOnly={readOnly} />
                                    <DropdownInput name="Role" options={dropDownListObject(roleList ? roleList?.data : [], "name", "id")} value={role} setValue={setRole} required={true} readOnly={readOnly} />
                                    <MultiSelectDropdown readOnly={readOnly} name="Branch" selected={branches} setSelected={setBranches} options={multiSelectOption(branchesList ? branchesList.data : [], "branchName", "id")} />
                                    <CheckBox name="Active" value={active} setValue={setActive} />
                                    <CheckBox name="Admin" value={isAdmin} setValue={setIsAdmin} />
                                </form>
                            </fieldset>
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
