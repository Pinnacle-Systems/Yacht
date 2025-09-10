import React, { useCallback, useEffect, useState } from 'react'
import {
    Modal,
    ToggleButton,
    DateInput,
    DropdownInput,
    TextInput,
    FancyCheckBox,
    MultiSelectDropdown,
    CheckBox,
    RadioButton,
    TextArea,
    DisabledInput,
    DropdownWithSearch,
    ReusableTable,
} from "../../../Inputs";
import MastersForm from '../MastersForm/MastersForm';
import { findFromList } from '../../../Utils/helper';
import { toast } from "react-toastify";
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import { Check, Eye, Plus } from 'lucide-react';
import { useGetbranchTypeQuery } from '../../../redux/uniformService/BranchTypeMaster';
import { XMarkIcon, MapPinIcon, BuildingStorefrontIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { FaPlus } from 'react-icons/fa';
import { useAddPartyContactMutation, useDeletePartyContactMutation, useGetPartyContactByIdQuery, useUpdatePartyContactMutation } from '../../../redux/services/PartyContactMasterService';
import Swal from 'sweetalert2';

const ContactPersonDetails = ({ partyData, partyId, refetch , 
    contactPersonName,setContactPersonName,designation,setDesignation , department,alterContactNumber , setAlterContactNumber , 
    setDepartment, contactNumber, setContactNumber, branchForm,setBranchForm , contactPersonEmail,setContactPersonEmail                  

}) => {

    const [contactId,setcontactId]  =   useState("")

    const [addData] = useAddPartyContactMutation();
    const [updateData] =  useUpdatePartyContactMutation()
    const [removeData]  =  useDeletePartyContactMutation()
 

      const {
        data: singleData,
        refetch : singleDataRefetch ,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
      } = useGetPartyContactByIdQuery(contactId, { skip: !contactId });

    const data = {
    contactPersonName,designation , department  , contactNumber , partyId ,id :contactId , contactPersonEmail
    }; 



    const syncFormWithDb = useCallback(
      (data) => {
           setContactNumber(data?.mobileNo ?  data?.mobileNo : null)
          setContactPersonName(data?.contactPersonName  ? data?.contactPersonName  : undefined )
          setDepartment(data?.department  ? data?.department  : null  )
          setDesignation(data?.Designation  ?  data?.Designation   : null)
          setContactPersonEmail(data?.email ? data?.email  : null )
       
 
      },
  
      [contactId]
    );
    

    const onNew = () =>  {
      syncFormWithDb("")
      setcontactId("")
    }
    
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleLoading,isSingleFetching ,singleData,contactId, syncFormWithDb,singleDataRefetch]);
  

    const handleSubmitCustom = async (callback, data, text, exit = false) => {
        try {
            let returnData;
            if (text === "Updated") {
              
                returnData = await callback(data).unwrap();
                 setcontactId("")
            } else {
                returnData = await callback(data).unwrap();
                 setcontactId("")
            }
          
            
            syncFormWithDb("")
            setcontactId(returnData?.data?.id)
            // singleDataRefetch() 
            setBranchForm(false)
            refetch()
            if(returnData?.statusCode  == 0){
              Swal.fire({
               icon: 'success',
               title: `${text || 'Saved'} Successfully`,
               showConfirmButton: false,
               timer: 2000
             });

            }


        } catch (error) {
            console.error("Submission error:", error);
                      Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                  });
        }
    };

          const handleDelete = async (id) => {
      if (id) {
          if (!window.confirm("Are you sure to delete...?")) {
              return;
          }
          try {
              await removeData(id)
            //  setId("");
                   Swal.fire({
                      icon: 'success',
                      title: `Deleted Successfully`,
                      showConfirmButton: false,
                      timer: 2000
                    });
              refetch()
              syncFormWithDb("")
              setBranchForm(false)
          } catch (error) {
              toast.error("something went wrong");
          }
      }

  };

    const validateData = (data) => {

        if (data.branchAddress && data?.branchCode && data?.branchContact  && data?.branchName) {


            return true

        }
        return false
    };

    const saveData = () => {

            // if (!validateData(data)) {
            //     toast.error("Please fill all required fields...!", {
            //         position: "top-center",
            //     });
            //     return;
            // }
        if (contactId) {
            handleSubmitCustom(updateData, data, "Updated");
        } else {

            handleSubmitCustom(addData, data, "Added");
        }
    };

 const columns = [
          {
              header: 'S.No',
              accessor: (item, index) => index + 1,
              className : 'font-medium text-gray-900 w-[5%] text-center'
          },
          
          {
              header: 'Contact  Person Name',
              accessor: (item) => item.contactPersonName,
              className : 'font-medium text-gray-900 w-[30%]'
          },
            
        {
              header: 'Email',
              accessor: (item) => item.email,
              className : 'font-medium text-gray-900 w-[30%]'
          },
  {
              header: 'Contact Number',
              accessor: (item) => item.mobileNo,
              className : 'font-medium text-gray-900 w-[20%]'
          },
           {
              header: 'Designation',
              accessor: (item) => item.Designation,
              className : 'font-medium text-gray-900 w-[15%]'
          },
             {
              header: 'Department',
              accessor: (item) => item.department,
              className : 'font-medium text-gray-900 w-[40%]'
          },
          
     
        ];



  
         const handleView = (id) => {
                  setBranchForm(true)

             setcontactId(id)
            //  setForm(true)
            //  setReadOnly(true);
         };
     
         const handleEdit = (id) => {
             setcontactId(id)
             setBranchForm(true)
            //  setReadOnly(false);
         };
     


    return (
        <>
      
{ !branchForm   ?   
  

(                    <div className="flex flex-col bg-[#f1f1f0] p-3 h-[100%] rounded-md">
   
     
     <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center  mb-4 gap-4 p-2 bg-white rounded-md shadow-md border border-gray-200'>
                       <h1 className="text-xl font-bold text-gray-800"> Contact  List</h1>
                         <div className="flex items-center gap-4">
                             <button
                               onClick={() => {
                        setBranchForm(!branchForm)
                                 onNew();
                               }}
                               className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                             >
                               <Plus size={16} />
                               Add New contact
                             </button>
                  
                           </div>
               </div>
     {/* Scrollable Table Container */}
     <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
       <ReusableTable
         columns={columns}
         data={partyData?.PartyContactDetails || []}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         itemsPerPage={10}
       />
     </div>
   </div>)
  

      :
                    
          (  <div className="bg-[F1F1F0] rounded-lg shadow-xl w-full  overflow-hidden p-3 ">
        <div className="flex justify-between bg-white items-center my-2 rounded-md  px-3 py-1">
          <h3 className="text-gray-800 font-semibold text-sm p-1">Add New Contact</h3>
          <div className='flex flex-row gap-3'>
               <button
              type="button"
                onClick={()  => {
                  setBranchForm(false)
                  singleDataRefetch()
                }}

              className="px-2 py-1 border border-blue-300 rounded-md  font-medium flex items-center gap-1 text-xs text-blue-700 hover:bg-gray-50"
            >
              
<Eye className="w-4 h-4" />
              View 
            </button>
       
              <button
            onClick={saveData}

              className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                      border border-green-600 flex items-center gap-1 text-xs">
              <Check className="w-4 h-4" />
              {contactId ? "Update" : "Save"}
            </button>
          </div>
            
        </div>

         <div className="flex-1 overflow-auto py-2">
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                      
        

                         <div className=" bg-white p-3 rounded-md border border-gray-200  h-[322px] ">
                                           <h3 className="font-medium text-gray-800  text-sm">Contact  Details</h3>
                                        <div className="grid grid-cols-2 space-y-2 mt-2 ">
                                        
                       
                                             
                                               <div className="col-span-2">
                                                                         
                                                     <TextInput
                                                                   name="Contact Person Name"
                                                                   type="text"
                                                                   value={contactPersonName}
                                           
                                                                   setValue={setContactPersonName}
                                                                  //  readOnly={readOnly}
                                                                  //  disabled={childRecord.current > 0}
                                                                   className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                 />
                                    
                                              
                                                 </div> 
                                                     <div className="col-span-2 flex flex-row gap-6 mt-2">
                                      
                                                      
                                                    <div className='w-44'>

                                                            <TextInput
                                                                     name="Designation"
                                                                     type="text"
                                                                     value={designation}  
                                             
                                                                     setValue={setDesignation}
                                                                    //  readOnly={readOnly}
                                                                    //  disabled={childRecord.current > 0}
                                                                     className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                   />
                                                    </div>
                                      
                                                    <div className='w-52'>
                                                                    <TextInput
                                                                     name="Department"
                                                                     type="text"
                                                                     value={department}
                                             
                                                                     setValue={setDepartment} 
                                                                    //  readOnly={readOnly}
                                                                    //  disabled={childRecord.current > 0}
                                                                     className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                   />      
                                                        </div>                                
                                       </div> 
                                              <div className='col-span-2'>
              
                                                    
                                         
                                                      <TextInput
                                                        name="Email"
                                                        type="text"
                                                            value={contactPersonEmail}
                                                          setValue={setContactPersonEmail}
                                                        // readOnly={readOnly}
                                                        // disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                                      />
                                                    </div>
                                                    <div className='col-span-2  flex flex-row gap-6' >
                                        <div className='w-44'>
                                              
                                                              <TextInput
                                                          name="Contact Number"
                                                          type="number"
                                                            value={contactNumber}
                                                        setValue={setContactNumber}
                                  
                                                          // readOnly={readOnly}
                                                          // disabled={childRecord.current > 0}
                                                          className="focus:ring-2 focus:ring-blue-100 "
                                                        />
                                            </div>
                                                  <div className='w-52'>

                                
                                                              <TextInput
                                                                                name="Alternative Contact Number"
                                                                                type="number"
                                                                                  value={alterContactNumber}
                                                                              setValue={setAlterContactNumber}
                                                        
                                                                                // readOnly={readOnly}
                                                                                // disabled={childRecord.current > 0}
                                                                                className="focus:ring-2 focus:ring-blue-100 "
                                                                              />
                                                  </div>

                                
                                                        </div>

                                                           
                                                   

                                

                      
                                                      
                                
                                                            
                                                     
                                                                                  
                                                                                           
                                                                                                           
                                             </div>
                                          
                                </div>
                            
                                      
        
                                   
     
        
                      </div>
                    </div>
       
      


     

        

      </div>)            


    } 

        </>
    )
}

export default ContactPersonDetails