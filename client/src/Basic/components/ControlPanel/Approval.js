import { useCallback, useEffect, useState } from "react"
import { useAddApproverMutation, useAddPercentageMutation, useGetPercentageByIdQuery, useGetPercentageQuery, useUpdatePercentageMutation } from "../../../redux/uniformService/Percentage";

import { CheckBox, Modal, MultiSelectDropdown, TextInput, ToggleButton } from "../../../Inputs";
import Mastertable from "../MasterTable/Mastertable";
import { MultiSelectPartytype, Party, statusDropdown } from "../../../Utils/DropdownData";
import toast from "react-hot-toast";
import MastersForm from "../MastersForm/MastersForm";
import { useGetPartyQuery } from "../../../redux/services/PartyMasterService";
import { multiSelectOption } from "../../../Utils/contructObject";
import { useGetRoleByIdQuery, useGetRolesQuery, useUpdateRoleMutation } from "../../../redux/services/RolesMasterService";
import { useGetUserByIdQuery, useGetUserQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";


export const params = {
    companyId: secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    branchId: secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
    userId: secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    ),
    finYearId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
    , approverData: true
};

export default function Approval() {
    const [id, setId] = useState("")

    const [active, setActive] = useState(true);
    const [partytype, setPartyType] = useState([])
    const [role, setRole] = useState([])
    const [readOnly, setReadOnly] = useState(false);

    const { data: allData } = useGetPercentageQuery({ params });
    console.log(allData, 'allData');

    const { data: roleData } = useGetRolesQuery({ params });
    // const userRoleId = secureLocalStorage.getItem(
    //     sessionStorage.getItem("sessionId") + "userRoleId"
    // );
    // console.log(userRoleId, 'userRoleId');
    // const { data: userRoleData, } = useGetRoleByIdQuery(userRoleId, { skip: !userRoleId });


    const { data: userData } = useGetUserQuery({ params });
    const [selectedApprover, setSelectedApprover] = useState('');

    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPercentageByIdQuery(id, { skip: !id });

    const [addData] = useAddPercentageMutation();
    const [updateData] = useUpdatePercentageMutation();
    // const [updateRole] = useUpdateRoleMutation()
    console.log(partytype, role, "partytype")

    const syncFormWithDb = useCallback(
        (data) => {
            if (id) {
                setReadOnly(true);
                setPartyType(data?.qty)
                setActive(data?.active)
            }
        }, [id])


    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])

    useEffect(() => {
        if (allData?.data?.length) {
            setId(allData?.data[0]?.id);
            setSelectedApprover(allData?.data[0]?.selectedApprover);
        }
    }, [allData]);


    const handleSubmitCustom = async (callback, data, text) => {
        try {
            let returnData = await callback(data).unwrap();
            setId(returnData.data.id)

            toast.success(text + "Successfully");

        } catch (error) {
            console.log("handle")
        }
    }


    const validateOneActiveFinYear = (active) => {
        if (Boolean(active)) {
            // return !allData.data.some((qty) => id === qty.id ? false : Boolean(qty.active))
        }
        return true
    }
    console.log(id, 'id');

    const data = {
        selectedApprover, approverData: true, id
    }
    const saveData = () => {

        if (!validateOneActiveFinYear(data.active)) {
            toast.error("Only one Fin year can be active...!", { position: "top-center" })
            return
        }

        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        if (id) {
            handleSubmitCustom(updateData, data, "Updated")
        } else {
            handleSubmitCustom(addData, data, "Created")
        }
    }

    // const onNew = () => { setId(""); setReadOnly(false); setForm(true); setPartyType([]) }
    // const tableHeaders = ["S.NO", "qty", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    // const tableDataNames = ["index+1", "dataObj.qty", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]

    // function onDataClick(id) {
    //     setId(id);
    //     setForm(true);
    // }

    const handleChange = (approver) => {
        setSelectedApprover(approver.name);

    }


    return (
        <>

            <div>
                <div className=' flex justify-between mb-2 items-center px-0.5 text-[14px] font-semibold'>
                    <h5 className='my-1 bg-gray-300 px-1 rounded'>Select Approver</h5>
                    {/* <div className='flex items-center'>
                        <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                    </div> */}
                </div>

                <div className=" flex flex-col   items-start gap-3 ">
                    <div className="p-4 w-[20rem] bg-white rounded-xl shadow-md">
                        <h2 className="text-lg font-semibold mb-4">Select Approver</h2>
                        <form>
                            {roleData?.data?.map((approver, index) => (
                                <>
                                    {!approver.defaultRole && approver.name !== "VENDOR" ?
                                        <label key={index} className="flex  mb-2 cursor-pointer">

                                            <input
                                                type="radio"
                                                name="approver"
                                                // value={approver.name}
                                                checked={selectedApprover === approver.name}
                                                onChange={() => handleChange(approver)}
                                                className="form-radio text-blue-600 mr-2"
                                            />
                                            <span className="text-gray-700">{approver.name}</span>
                                        </label> : ''}</>
                            ))}
                        </form>
                        {selectedApprover && (
                            <div className="w-full flex pr-1">
                                <span>     Selected Approver: </span>
                                <p className=" text-green-600 font-medium px-1">
                                    {selectedApprover}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className='flex items-center'>
                        <button onClick={() => saveData()} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>Save</button>
                    </div>
                </div>

            </div>
        </>
    )

    {/* <div className='w-full flex items-start'>
                                    <Mastertable
                                        header={'Excess Qty'}
                                        // searchValue={searchValue}
                                        // setSearchValue={setSearchValue}
                                        onDataClick={onDataClick}
                                        // setOpenTable={setOpenTable}
                                        tableHeaders={tableHeaders}
                                        tableDataNames={tableDataNames}
                                        // data={allData?.data}
                                        // loading={
                                        //     isLoading || isFetching
                                        // } 
                                        />
                                </div>
                                {form === true && <Modal isOpen={form} form={form} widthClass={"w-[80%] h-[70%]"} onClose={() => { setForm(false);  }}>
                                    <MastersForm
                                        onNew={onNew}
                                        onClose={() => {
                                            setForm(false);
                                            // setSearchValue("");
                                            setId(false);
                                        }}
                                        // model={MODEL}
                                        // childRecord={childRecord.current}
                                        saveData={saveData}
                                        setReadOnly={setReadOnly}
                                        // deleteData={deleteData}
                                        readOnly={readOnly}
                                        // emptyErrors={() => setErrors({})}
                                    >
                                        <fieldset className=' rounded mt-2'>
                                            <div className='grid grid-cols-3'>
                                             
                                              < div className='mb-5'>
                                                    <MultiSelectDropdown name="PartyType"  selected={partytype} setSelected={setPartyType} required={true} readOnly={readOnly} 
                                                    options={multiSelectOption(MultiSelectPartytype ? MultiSelectPartytype : [], "name", "value")}   />
                                                </div>
                    
                                                <div className='mb-5'>
                                                 <MultiSelectDropdown name="Role"  selected={role} setSelected={setRole} required={true} readOnly={readOnly} 
                                                    options={multiSelectOption(roleData ? roleData?.data : [], "name", "id")}    />                                                   
                                                </div>
                    
                                            
                                                  <div className='mb-5'>
                                                 <MultiSelectDropdown name="Users"  selected={users} setSelected={setUsers} required={true} readOnly={readOnly} 
                                                    options={multiSelectOption(userData ? userData?.data : [], "username", "id")}    />                                             
                                                  </div>
                    
                                                 </div>
                                             
                                        </fieldset>
                                    </MastersForm>
                                </Modal>} */}
}