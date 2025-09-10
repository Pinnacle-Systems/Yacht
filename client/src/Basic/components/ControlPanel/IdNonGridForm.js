import React, { useState, useEffect} from 'react'
import secureLocalStorage from 'react-secure-storage';
import { TextInput, DisabledInput, DropdownInput } from '../../../Inputs';
import { toast } from 'react-toastify';
import { EditButtonOnly } from '../../../Buttons';
import { prefixCategory } from '../../../Utils/DropdownData';
import { useGetBranchByIdQuery, useUpdateBranchMutation} from '../../../redux/services/BranchMasterService';

const BranchEmployeeIdSettingsNonGridForm = () => {
    const [branchName, setBranchName] = useState("");
    const [idPrefix, setPrefix] = useState("");
    const [idSequence, setSequence] = useState("");
    const [tempPrefix, setTempPrefix] = useState("");
    const [tempSequence, setTempSequence] = useState("");

    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "currentBranchId")

    const {data: singleData, isFetching, isLoading} = useGetBranchByIdQuery(id);

    const [update] = useUpdateBranchMutation()
  
    const [currentPrefixCategory, setCurrentPrefixCategory] = useState("");
  
    const [employees, setEmployees] = useState([]);
  
    const [editable, setEditable] = useState(false);
  
    const data = {
      idPrefix, idSequence, ...tempPrefix && { tempPrefix }, ...tempSequence && { tempSequence }, prefixCategory: currentPrefixCategory, id
    }
  
  
    const validateData = (data) => {
      if (data.idPrefix && data.idSequence && data.prefixCategory) {
        return true;
      }
      return false;
    }
    const syncFormWithDb = (data) => {
      setCurrentPrefixCategory(data.prefixCategory);
      setPrefix(data.idPrefix ? data.idPrefix : "");
      setSequence(data.idSequence ? data.idSequence : "");
      setTempPrefix(data.tempPrefix);
      setTempSequence(data.tempSequence);
      setBranchName(data.branchName);
      setEmployees(data.Employee)
    }
  
    const saveData = async() => {
      if (!validateData(data)) {
        toast.info("Please fill all required fields...!", { position: "top-center" })
        return
      }
      if (!window.confirm("Are you sure save the details ...?")) {
        return
      }
      await update(data);
      toast.success("Settings Saved");
      setEditable(false);

    }
  
    const handleKeyDown = (event) => {
      let charCode = String.fromCharCode(event.which).toLowerCase();
      if ((event.ctrlKey || event.metaKey) && charCode === 's') {
        event.preventDefault();
        saveData();
      }
    }
  
  
    useEffect(() => {
      if(singleData){
        syncFormWithDb(singleData?.data);
      }
    }, [isFetching, isLoading])
  
    const handleOnEdit = () => {
      console.log("employee", employees.length !== 0);
      if (employees.length !== 0) {
        toast.info("Employees Already created!", { position: "top-center" });
        return;
      }
      setEditable(true);
    }
  
    return (
      <div onKeyDown={handleKeyDown} className='col-span-7 h-full bg-theme flex flex-col frame'>
        <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
          <div className='col-span-3 grid md:grid-cols-2 overflow-auto'>
            <div className='mr-1 md:ml-2'>
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Branch Settings</legend>
                <div className='grid grid-cols-1 my-2' autoComplete="chrome-off">
                  {editable ? "" : <div className='text-sm flex justify-end '> <EditButtonOnly onClick={handleOnEdit} /></div>}
                  <DisabledInput name="Branch Name" type={"text"} value={branchName} />
                  <DropdownInput name="Category" options={prefixCategory} value={currentPrefixCategory} setValue={setCurrentPrefixCategory} required={true} readOnly={!editable} />
  
                  {currentPrefixCategory ?
                    <>
                      {(currentPrefixCategory === "Default")
                        ?
                        <fieldset>
                          <TextInput name="Prefix" type="text" value={idPrefix} setValue={setPrefix} readOnly={!editable} />
                          <TextInput name="Sequence" type="text" value={idSequence} setValue={setSequence} readOnly={!editable} />
                        </fieldset>
                        :
                        <>
                          <fieldset className='p-1'>
                            <legend className='sub-heading'>Permanent Employee</legend>
                            <TextInput name="Prefix" type="text" value={idPrefix} setValue={setPrefix} readOnly={!editable} />
                            <TextInput name="Sequence" type="text" value={idSequence} setValue={setSequence} readOnly={!editable} />
                          </fieldset>
                          <fieldset className='p-1'>
                            <legend className='sub-heading'>Contract/Temp Employee</legend>
                            <TextInput name="Prefix" type="text" value={tempPrefix} setValue={setTempPrefix} readOnly={!editable} />
                            <TextInput name="Sequence" type="text" value={tempSequence} setValue={setTempSequence} readOnly={!editable} />
                          </fieldset>
                        </>
                      }
                      {editable ?
                        <div className='flex m-1 justify-between p-1'>
                          <button onClick={() => { setEditable(false); }} className='bg-red-700 text-white rounded p-1 px-2 text-sm'> Back</button>
                          <button onClick={() => { saveData(); }} className='bg-green-700 text-white rounded p-1 px-2 text-sm'> Save</button>
                        </div>
                        :
                        ""
                      }
                    </>
                    : ""}
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default BranchEmployeeIdSettingsNonGridForm;