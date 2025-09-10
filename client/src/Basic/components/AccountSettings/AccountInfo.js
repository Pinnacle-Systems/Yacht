import React, { useState, useEffect, useCallback } from 'react';
import { DisabledInput, TextInput, validateEmail } from '../../../Inputs';
import { EditButtonOnly } from '../../../Buttons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import  toasterTrigger  from "../../../Utils/toastTrigger";
import secureLocalStorage from "react-secure-storage";
import {useUpdateUserMutation, useGetUserByIdQuery} from "../../../redux/services/UsersMasterService";


export default function AccountInfo() {
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("");

    const [editable, setEditable] = useState(false);
    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id);

    const data = {
        username, id
    }
    const [updateData] = useUpdateUserMutation();


    const validateData = (data) => {
        if (data.username) {
            return true;
        }
        return false;
    }

    const saveData = () => {
        if (!validateData(data)) {
            toast.info("Please fill all required fields...!", { position: "top-center" })
            return
        }
        if (!window.confirm("Are you sure save the details ...?")) {
            return
        }
        updateData(data);
        
        setEditable(false);
    }


    const handleKeyDown = (event) => {
        let charCode = String.fromCharCode(event.which).toLowerCase();
        if ((event.ctrlKey || event.metaKey) && charCode === 's') {
            event.preventDefault();
            saveData();
        }
    }
    useEffect(toasterTrigger, []);


    const syncFormWithDb = useCallback((data) => {
        setUsername(data ? data?.username : "");
        setRole(data ? data.role?.name : "");
    }, [id]);

    useEffect(() => {
        syncFormWithDb(singleData?.data);
    }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);


    return (
        <div onKeyDown={handleKeyDown} className='col-span-7 h-full bg-theme flex flex-col frame'>
            <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
                <div className='col-span-3 grid md:grid-cols-2 overflow-auto'>
                    <div className='mr-1 md:ml-2'>
                        <fieldset className='frame my-1'>
                            <legend className='sub-heading'>User Info</legend>
                            <div className='grid grid-cols-1 my-2' autoComplete="chrome-off">
                                {editable ? "" : <div className='text-sm flex justify-end '> <EditButtonOnly onClick={() => setEditable(true)} /></div>}
                                <TextInput name="Username" type="text" value={username} setValue={setUsername} readOnly={!editable} />
                                <DisabledInput name="Role" type="text" value={role} />
                                {editable ?
                                    <div className='flex m-1'>
                                        <button onClick={() => { saveData(); }} className='bg-blue-700 text-white rounded p-1 px-2 text-sm'> Save</button>
                                    </div>
                                    :
                                    ""
                                }
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
    )
}
