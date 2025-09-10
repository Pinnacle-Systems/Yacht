import { useCallback, useEffect, useState } from "react"
import { useAddPercentageMutation, useDeletePercentageMutation, useGetPercentageByIdQuery, useGetPercentageQuery, useUpdatePercentageMutation } from "../../../redux/uniformService/Percentage";
import { params } from "../../../Utils/helper";
import { CheckBox, Modal, TextInput, ToggleButton } from "../../../Inputs";


import { statusDropdown } from "../../../Utils/DropdownData";
import Mastertable from "../MasterTable/Mastertable";
import MastersForm from "../MastersForm/MastersForm";
import { toast } from "react-toastify";



export default function ExcessQty(){
        const [id, setId] = useState("")
        const [form, setForm] = useState(false);
        
        const [active, setActive] = useState(true);
        const [qty,setQty] =  useState("")
        const [readOnly, setReadOnly] = useState(false);
        const [errors, setErrors] = useState({});
    
    const { data: allData, isLoading, isFetching } = useGetPercentageQuery({ params });
    const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetPercentageByIdQuery(id, { skip: !id });

    const [addData] = useAddPercentageMutation();
    const [updateData] =  useUpdatePercentageMutation();
     const [removeData]   =   useDeletePercentageMutation();

     const syncFormWithDb = useCallback(
            (data) => {
                if (id) {
                    setReadOnly(true);
                    setQty(data?.qty)
                    setActive(data?.active)
                }
            }, [id])
    
    
        useEffect(() => {
            syncFormWithDb(singleData?.data);
        }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])
    
    
        const handleSubmitCustom = async (callback, data, text) => {
            try {
                let returnData = await callback(data).unwrap();
                setId(returnData.data.id)
                // syncFormWithDb(undefined)
                toast.success(text + "Successfully");
    
            } catch (error) {
                console.log("handle")
            }
        }
    
              

    const validateOneActiveFinYear = (active) => {
        if (Boolean(active)) {
              console.log(!allData.data.some((qty) => id === qty.id ? false : Boolean(qty.active)),"validateOneActiveFinYear")    
            return !allData.data.some((qty) => id === qty.id ? false : Boolean(qty.active))
        }
        return true
    }
    const data = {
        active,
         id,qty
    }
        const saveData = () => {
            console.log("hit")
            if (!validateOneActiveFinYear(data?.active)) {
                toast.error("Only one Excess % Can  be active...!", { position: "top-center" })
                return
            }
           
            if (!window.confirm("Are you sure save the details ...?")) {
                return
            }
            if (id) {
                handleSubmitCustom(updateData, data, "Updated")
            } else {
                handleSubmitCustom(addData, data, "Added")
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

        const onNew = () => { setId(""); setReadOnly(false); setForm(true);setQty("") }
        const tableHeaders = ["S.NO", "qty",  "Status", " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
        const tableDataNames = ["index+1", "dataObj.qty", 'dataObj.active ? ACTIVE : INACTIVE', " ", " ", " ", " ", " ", " ", " ", " ", " ", " ", " "]
    
        function onDataClick(id) {
            setId(id);
            setForm(true);
        }

    return (
        <>
            {/* <div className="container mx-auto col-span-2">
                  <div className="p-8">
                  <input
                                type="text"
                                className="border rounded px-4 py-2"
                                value={qty}
                                onChange={(e) =>  setQty(e.target.value)}
                              />
                              
                <div className='mb-5'>
                    <CheckBox name="Active" readOnly={readOnly} value={active} setValue={setActive} />
                </div>
                    <div className='flex p-2'>
                      <button
                      onClick={() =>  saveData() }
                        type="button"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div> */}
                  <div>
                            <div className='w-full flex justify-between mb-2 items-center px-0.5'>
                               <h5 className='my-1'>Excess Qty</h5>
                        <div className='flex items-center'>
                                   <button onClick={() => { setForm(true); onNew() }} className='bg-green-500 text-white px-3 py-1 button rounded shadow-md'>+ New</button>
                                 </div>
                             </div>
                         <div className='w-full flex items-start'>
                                <Mastertable
                                    header={'Excess Qty'}
                                    // searchValue={searchValue}
                                    // setSearchValue={setSearchValue}
                                    onDataClick={onDataClick}
                                    // setOpenTable={setOpenTable}
                                    tableHeaders={tableHeaders}
                                    tableDataNames={tableDataNames}
                                    data={allData?.data}
                                    loading={
                                        isLoading || isFetching
                                    } />
                            </div>
                            {form === true && <Modal isOpen={form} form={form} widthClass={"w-[40%] h-[50%]"} onClose={() => { setForm(false); setErrors({}); }}>
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
                                    deleteData={deleteData}
                                    readOnly={readOnly}
                                    emptyErrors={() => setErrors({})}
                                >
                                    <fieldset className=' rounded mt-2'>
                                        <div className=''>
                                         
                                        <div className='mb-5 w-64'>
                                                <TextInput name="Qty"  value={qty} setValue={setQty} required={true} readOnly={readOnly} />
                                            </div>
                
                                            <div className='mb-5'>
                                                <ToggleButton name="Status" options={statusDropdown} value={active} setActive={setActive} required={true} readOnly={readOnly} />
                                            </div>
                
                                        </div>
                                    </fieldset>
                                </MastersForm>
                            </Modal>}
                
                        </div>
        </>
    )
}