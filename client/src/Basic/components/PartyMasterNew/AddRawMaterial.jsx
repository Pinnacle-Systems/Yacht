import { ReusableTable, TextInput, ToggleButton } from "../../../Inputs"
import MastersForm from "../MastersForm/MastersForm";
import { statusDropdown } from "../../../Utils/DropdownData";
import { Check, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import CommonTable from "../../../Shocks/CommonReport/CommonTable";
import { toast } from "react-toastify";
import { useDeletePartyMaterialMutation, useGetPartyByIdQuery, useGetPartyMaterialByIdQuery, useUpdatePartyMaterialMutation } from "../../../redux/services/PartyMasterService";
import { FaPlus } from "react-icons/fa";
import { findFromList } from "../../../Utils/helper";
import Swal from "sweetalert2";
import { useAddMaterialMasterMutation } from "../../../redux/uniformService/MaterialMaster";

const RawMaterial  = ( {material ,setMaterial, id , readOnly , setRawMaterial   , materialActive , setMaterialActive 
    ,form ,allData , setMaterialForm , materialForm ,setMaterialId ,materialId , } ) => {

          const {
            data: singleData,
            isFetching: isSingleFetching,
            isLoading: isSingleLoading,
          } = useGetPartyMaterialByIdQuery(materialId, { skip: !materialId });
          const [ addData] = useAddMaterialMasterMutation()
          const [removeData] = useDeletePartyMaterialMutation()
          const [updateData]  =  useUpdatePartyMaterialMutation()




  const data = {
    
    material,
    materialActive,
    rawMaterial :true,
    materialId
  };

      const onNew = () => {
        setMaterial("");
        setMaterialId('')
    }

  console.log(materialActive,"materialActive")


    const syncFormWithDb = useCallback(
      (data) => {
           setMaterial(data?.name ?  data?.name : null)
          setMaterialActive(data?.active)
        
       
 
      },
  
      [id]
    );
    
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleLoading,isSingleFetching ,singleData,materialId, syncFormWithDb]);


    const columns = [
          {
              header: 'S.No',
              accessor: (item, index) => index + 1,
              className : 'font-medium text-gray-900 w-[5%] text-center'
          },
          
          {
              header: 'Name',
              accessor: (item) => item.name,
              className : 'font-medium text-gray-900 w-[40px]'
          },
            
        {
              header: '',
              accessor: (item) => item.none,
              className : 'font-medium text-gray-900 w-[80%]'
          },
 
     
        ];

               const handleView = (id) => {
           
                   setMaterialId(id)
                   setMaterialForm(true)
                //    setReadOnly(true);
               };
           
               const handleEdit = (id) => {
                     setMaterialId(id)
                     setMaterialForm(true)
                //    setReadOnly(false);
               };
           
               const handleDelete = async (materialId) => {
                   if (materialId) {
                       if (!window.confirm("Are you sure to delete...?")) {
                           return;
                       }
                       try {
                              let deldata = await removeData(materialId).unwrap();
                              if (deldata?.statusCode == 1) {
                                toast.error(deldata?.message)
                                return
                              }
                              Swal.fire({
                                  icon: 'success',
                                  title: `Deleted Successfully`,
                                  showConfirmButton: false,
                                  timer: 2000
                                });
                            } catch (error) {
                              Swal.fire({
                                  icon: 'error',
                                  title: 'Submission error',
                                  text: error.data?.message || 'Something went wrong!',
                                });
                            }
                   }
           
               };


                const handleSubmitCustom = async (callback, data, text, exit = false) => {
                   try {
                     let returnData;
                     if (text === "Updated") {

                       returnData = await callback({ materialId, body: data }).unwrap();
                            setMaterialId(returnData?.data?.id)
                            setMaterialForm(false)

                     } else {
                       returnData = await callback(data).unwrap();
                       setMaterialId(returnData?.data?.id)
                        setMaterialForm(false)

                     }
                         Swal.fire({
                       icon: 'success',
                       title: `${text || 'Saved'} Successfully`,
                       showConfirmButton: false,
                       timer: 2000
                     });

                    //  dispatch({
                    //    type: `accessoryItemMaster/invalidateTags`,
                    //    payload: ["AccessoryItemMaster"],
                    //  });
                    //  dispatch({
                    //    type: `CityMaster/invalidateTags`,
                    //    payload: ["City/State Name"],
                    //  });
                    //  dispatch({
                    //    type: `CurrencyMaster/invalidateTags`,
                    //    payload: ["Currency"],
                    //  });
               
                    //  setId(returnData.data.id);
                     onNew();
                    //  setStep(1);
                     if (exit) {
                       // setForm(false);
                     }
                    //  if (exit) {
                    //    if (openPartyModal === true && lastTapName) {
                    //      dispatch(push({ name: lastTapName }));
                    //    }
               
                    //    dispatch(setOpenPartyModal(false));
                    //  }
                         //  setForm(false);
                         //  setRawMaterial(false)
               
                   } catch (error) {
                     console.error("Submission error:", error);
                           Swal.fire({
                       icon: 'error',
                       title: 'Submission error',
                       text: error.data?.message || 'Something went wrong!',
                     });
                   }
                 };

const SaveBranch  = (   )  => {
 if (materialId) {
      handleSubmitCustom(updateData, data, "Updated");
      // setRawMaterial(false)
    } else {
      handleSubmitCustom(addData, data, "Added");
            // setRawMaterial(false)

    }
}
    return (
        <>
          
           
                {/* <div className="space-y-4 bg-[#f1f1f0] p-2">

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">

                        <div className="grid grid-cols-4 gap-4 bg-[#f1f1f0]">

                            <div className="">
                               <TextInput name="Meterial Name" type="text" value={material} setValue={setMaterial} required={true} readOnly={readOnly} /> 
                              
                            </div>
                            
                            <div className="flex items-center">
                                <ToggleButton
                                name="Status"
                                options={statusDropdown}
                                value={materialActive}
                                setActive={setMaterialActive}
                                required={true}
                                readOnly={readOnly}
                                className="bg-gray-100 p-1 rounded-lg"
                                activeClass="bg-[#f1f1f0]  shadow-sm text-blue-600 "
                                inactiveClass="text-gray-500"
                                />
                             </div>

                        </div>
                    </div>

                </div> */}

               {materialForm   ?   
            
               <>
   
                   <div className="h-full flex flex-col bg-[#f1f1f0]">

  <div className="sticky top-0 mt-3 z-10 bg-white shadow-sm border-b py-3 px-4 mx-4 flex justify-between items-center rounded-t-md">
    <div className="flex items-center gap-2">
      <h2 className="text-base sm:text-lg font-semibold text-gray-800 tracking-tight">
        {id ? (!readOnly ? " Edit Material Master" : " Material Master") : "Add New Material"}
      </h2>
    </div>

    <div className="flex items-center gap-2">
      {readOnly && (
        <button
          type="button"
          onClick={() => setRawMaterial(false)}
          className="px-1 py-1 text-xs font-medium text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
        >
          Cancel
        </button>
      )}

      <button
        type="button"
        onClick={() => setMaterialForm(false)}
        className="px-2 py-1 text-xs font-medium  item-center  text-blue-600 border border-blue-600 rounded flex items-center gap-1 hover:bg-blue-600 hover:text-white transition"
      >
        <Eye className="w-4 h-4" />
        
         view
      </button>

      {!readOnly && (
       
             <button
                onClick={SaveBranch}

                 className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                          border border-green-600 flex items-center gap-1 text-xs">
                 <Check className="w-4 h-4" />
                  {materialId ? "Update" : "Save"}
               </button>
      )}
    </div>
  </div>

  <div className="flex-1 overflow-y-auto p-4 ">
    <div className="grid grid-cols-1 gap-4 h-full">
      <div className="w-full   bg-white p-3 rounded-md border border-gray-200 shadow-sm">

        <div className="w-52">
          <TextInput
            name="Meterial Name"
            type="text"
            value={material}
            setValue={setMaterial}
            required={true}
            readOnly={readOnly}
          />

          <div className="flex items-center mt-2">
            <ToggleButton
              name="Status"
              options={statusDropdown}
              value={materialActive}
              setActive={setMaterialActive}
              required={true}
              readOnly={readOnly}
              className="bg-gray-100 p-1 rounded-lg"
              activeClass="bg-[#f1f1f0] shadow-sm text-blue-600"
              inactiveClass="text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

               </>
              : 
            
              <div className="flex flex-col bg-[#f1f1f0] p-4 h-[100%] rounded-md">

  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-2 bg-white rounded-md shadow-md border border-gray-200">
    <div className="flex items-center gap-2">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
         Materials List
      </h1>
    </div>

    <button
      onClick={() => {
        setMaterialForm(true);
        onNew();
      }}
     className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                      border border-green-600 flex items-center gap-1 text-xs">
      <FaPlus className="w-4 h-4" />
      Add Material
    </button>

  </div>

  {/* Scrollable Table Container */}
  <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
    <ReusableTable
      columns={columns}
      data={allData?.materialData || []}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      itemsPerPage={10}
    />
  </div>
</div>

            }
                
        </>
    )
}
                     
                        
                            
                           

export default  RawMaterial;
                            
                                                  
                            
                            
                                                 
                            
                                                 
                            
                            