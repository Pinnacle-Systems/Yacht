import React, { useCallback, useEffect, useRef, useState } from 'react'
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';

import e from 'cors';

import { push } from '../../../redux/features/opentabs';
import { useDispatch, useSelector } from 'react-redux';
import { useAddTagTypeMutation, useDeleteTagTypeMutation, useGetTagTypeByIdQuery, useGetTagTypeQuery, useUpdateTagTypeMutation } from '../../../redux/uniformService/TagTypeMasterServices';
import Mastertable from '../../../Basic/components/MasterTable/Mastertable';
import { Modal, TextInput, ToggleButton } from '../../../Inputs';
import MastersForm from '../../../Basic/components/MastersForm/MastersForm';
import { statusDropdown } from '../../../Utils/DropdownData';
import { getCommonParams, renameFile } from '../../../Utils/helper';



const MODEL = "Tag Type Master";

export default function Form() {

  const openTabs = useSelector((state) => state.openTabs);


  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState({});
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);
  const { branchId , userId } = getCommonParams()
  const { data: allData, isLoading, isFetching } = useGetTagTypeQuery({params :{branchId, userId }});
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetTagTypeByIdQuery(id, { skip: !id });

  const [addData] = useAddTagTypeMutation();
  const [updateData] = useUpdateTagTypeMutation();
  const [removeData] = useDeleteTagTypeMutation();


  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(push({ name: "COUNTRY MASTER" }))
 
  // }, [ dispatch,openTabs])

  const syncFormWithDb = useCallback((data) => {

    if (!id) {
      setReadOnly(false);

      setName("");
      setActive(id ? (data?.active ?? true) : false);

      return;
    } else {
      setReadOnly(true)
      setName(data?.name || "");
      setActive(id ? (data?.active ?? false) : true);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }
  }, [id])

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])

  const file = fileName?.name


  const data = {
   name,  active, id , fileName
  }


  // const validateData = (data) => {
  //   if (data.name ) {
  //     return true;
  //   }
  //   return false;
  // }
  const handleSubmitCustom = async (callback, data, text) => {
    
    const formData = new FormData();

formData.append("name",JSON.stringify(data?.name));
formData.append("active", JSON.stringify(data?.active)); 
formData.append("fileName", JSON.stringify(data?.fileName));


    console.log(formData,"formData");

    try {
      let returnData = await callback({ id, body: formData }).unwrap();
      setId(returnData.data.id)
      toast.success(text + "Successfully");

    } catch (error) {
      console.log("handle")
    }
  }

  const saveData = () => {

    // if (!validateData(data)) {
    //   toast.error("Please fill all required fields...!", { position: "top-center" })
    //   return
    // }
    if (!window.confirm("Are you sure save the details ...?")) {
      return
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated")
     
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  }

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          toast.error(deldata?.message)
          return
        }
        setId("");
        toast.success("Deleted Successfully");
        setForm(false);
      } catch (error) {
        toast.error("something went wrong")
        setForm(false);
      }
      ;
    }
  }

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
      event.preventDefault();
      saveData();
    }
  }

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setFileName({})
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "S.NO",  "Name", "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "
  ]
  const tableDataNames = ["index+1",  "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]

  return (
    <div onKeyDown={handleKeyDown} className='px-5'>
      <div className='w-full flex justify-between mb-2 items-center px-0.5'>
        <h5 className='my-1 text-xl'>Tag Type Master</h5>
        <div className='flex items-center'>
          <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
        </div>
      </div>
      <div className='w-full flex items-start'>

        <Mastertable
          header={'Tag Type list'}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          tableHeaders={tableHeaders}
          tableDataNames={tableDataNames}
          data={allData?.data}
          // loading={
          //   isLoading || isFetching
          // }
           />

        <div>
          {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[40%]"} onClose={() => { setForm(false); setErrors({}); }}>
            <MastersForm
              onNew={onNew}
              onClose={() => {
                setForm(false);
                setSearchValue("");
                setId(false);
              }}
              model={MODEL}
              childRecord={childRecord.current}
              saveData={saveData}
              setReadOnly={setReadOnly}
              deleteData={deleteData}
              readOnly={readOnly}
              emptyErrors={() => setErrors({})}
            >

              <fieldset className=' rounded '>

                <div className='p-2'>
                  <div className='flex justify-between'>
                    <div className='mb-3 w-[48%]'>
                      <TextInput name="Tag Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} />
                    </div>
                              <div className='flex items-center border border-gray-700 hover:border-lime-500 rounded-md h-8 px-1 mt-3'>
                                    <input type="file" id="profileImage" className='hidden' 
                                       onChange={(e) =>
                                                 setFileName(renameFile(e.target.files[0]))
                                          }
                                          />
                                         

                                    <label htmlFor="profileImage" className="text-xs w-full">Browse</label>
                                </div>
                                <div>
                                  {fileName?.name}
                                </div>
                                          
                  </div>
                  <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                </div>
              </fieldset>
            </MastersForm>
          </Modal>}

        </div>
      </div>
    </div>
  )
}


