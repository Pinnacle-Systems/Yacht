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
import { useAddPartyMutation,     useUpdatePartyContactMutation, useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import { toast } from "react-toastify";
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import { Check, Eye, Plus } from 'lucide-react';
// import { useGetbranchTypeQuery } from '../../../redux/uniformService/BranchTypeMaster';
import { XMarkIcon, MapPinIcon, BuildingStorefrontIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { FaPlus } from 'react-icons/fa';
// import { useAddPartyBranchContactMutation, useDeletePartyBranchContactMutation, useGetPartyBranchContactByIdQuery, useUpdatePartyBranchContactMutation } from '../../../redux/services/PartyBranchContactMasterService';
import Swal from 'sweetalert2';

const BranchContactdetails = ({ partyData, partyId,setPartyId ,branchId, contactForm ,setContactForm ,

    contactPersonName , setContactPersonName,

    designation,setDesignation , 
 
    department,    setDepartment,     

      contact,   setContact,

      alterContact , setAlterContact ,  email , setEmail , 

       branchForm,setBranchForm , setBranchId                 

}) => {

    const [contactId,setcontactId]  =   useState("")

    // const [addData] = useAddPartyBranchContactMutation();
    // const [updateData] =  useUpdatePartyBranchContactMutation()
    // const [removeData]  =  useDeletePartyBranchContactMutation()
    

    //   const {
    //     data: singleData,
    //     refetch,
    //     isFetching: isSingleFetching,
    //     isLoading: isSingleLoading,
    //   } = useGetPartyBranchContactByIdQuery(contactId, { skip: !contactId });

    const data = {
        contactPersonName, designation , department  , contact , partyId , branchId , alterContact ,email , id : contactId
    }; 



    const syncFormWithDb = useCallback(
      (data) => {
           setContact(data?.mobileNo ?  data?.mobileNo : null)
          setContactPersonName(data?.contactPersonName  ? data?.contactPersonName  : undefined )
          setDepartment(data?.department  ? data?.department  : null  )
          setDesignation(data?.designation  ?  data?.designation   : null)
          setEmail(data?.email  ?  data?.email   :  null)
        
       
 
      },
  
      [contactId]
    );
    
    const onNew = () =>  {
      syncFormWithDb("")
      setcontactId("")
    }
    

  // useEffect(() => {
  //   syncFormWithDb(singleData?.data);
  // }, [isSingleLoading,isSingleFetching ,singleData,contactId, syncFormWithDb]);
  

    const handleSubmitCustom = async (callback, data, text, exit = false) => {
        try {
            let returnData;
            if (text === "Updated") {
              console.log(contactId,"contactId");
              
                returnData = await callback(data ).unwrap();
            } else {
                returnData = await callback(data).unwrap();
            }
            setBranchId(returnData?.data?.id)
            setContactForm(false)
            // refetch()
                   Swal.fire({
                                         icon: 'success',
                                         title: `${text || 'Saved'} Successfully`,
                                         showConfirmButton: false,
                                         timer: 2000
                                       });


        } catch (error) {
                      setContactForm(false)

            console.error("Submission error:", error);
                       Swal.fire({
                                icon: 'error',
                                title: 'Submission error',
                                text: error.data?.message || 'Something went wrong!',
                              });
        }
    };

        console.log(branchForm, "branchForm")

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
            // handleSubmitCustom(updateData, data, "Updated");
        } else if(partyId &&  branchId) {

            // handleSubmitCustom(addData, data, "Added");
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
              accessor: (item) => item.designation,
              className : 'font-medium text-gray-900 w-[15%]'
          },
             {
              header: 'Designation',
              accessor: (item) => item.department,
              className : 'font-medium text-gray-900 w-[40%]'
          },
          
     
        ];



  
         const handleView = (id) => {
        setContactForm(true)

             setcontactId(id)
            //  setForm(true)
            //  setReadOnly(true);
         };
     
         const handleEdit = (id) => {
             setcontactId(id)
  setContactForm(true)            //  setReadOnly(false);
         };
     
  const handleDelete = async (id) => {
    console.log(id,"id")
      if (id) {
          if (!window.confirm("Are you sure to delete...?")) {
              return;
          }
          try {
              // await removeData(id)
            //  setId("");
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

    return (
        <>
      
{  contactForm  == false  ?   
  

(                    <div className="flex flex-col bg-[#f1f1f0] p-3 h-[100%] rounded-md">
   
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-2 bg-white rounded-md shadow-md border border-gray-200">
       <div className="flex items-center gap-2">
         <h1 className="text-lg sm:text-xl font-semibold text-gray-800 tracking-tight">
           Contact  List
         </h1>
       </div>
   
         <div className="flex items-center gap-4">
                                    <button
                                      onClick={() => {
                                   setContactForm(true)
                                     onNew();
                                      }}
                                      className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-3 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                                    >
                                      <Plus size={12} />
                                      Add New contact
                                    </button>
                         
                                  </div>
     </div>
   
     <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
       <ReusableTable
         columns={columns}
         data={partyData?.BranchContactDetails || []}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         itemsPerPage={10}
       />
     </div>
   </div>)
  

      :
      
                    
           (  <div className="bg-[F1F1F0] rounded-lg shadow-xl w-full  overflow-auto p-3 ">
                <div className="flex justify-between bg-white items-center my-2 rounded-md  px-3 py-1">
                  <h3 className="text-gray-800 font-semibold text-sm p-1">Add New Contact</h3>
                  <div className='flex flex-row gap-3'>
                       <button
                      type="button"
                        onClick={()  => {
                          onNew()
                         setContactForm(false)}}
        
                      className="px-2 py-1 border border-blue-300 flex items-center gap-1 rounded-md text-xs font-medium text-blue-700 hover:bg-gray-50"
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
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                              
                
                                 <div className="lg:col-span-12 space-y-3">
                                                 <div className="bg-white p-3 rounded-md border border-gray-200  h-[332px]">
                                                   <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                                                <div className="grid grid-cols-1 gap-3 p-3">
                                                        <div className="space-y-2 col-span-2 ">
                                                          <div className="relative">
                                                          <TextInput
                                                                name="Contact Person Name"
                                                                type="text"
                                                                value={contactPersonName}
                                                                setValue={setContactPersonName}
                                                                // readOnly={readOnly}
                                                                // disabled={childRecord.current > 0}
                                                                className="focus:ring-2 focus:ring-blue-100"
                                                              /> 
                                                          </div>
                                                        </div>
                                                                   <div className="col-span-2 flex flex-row gap-3">
                                                            <div className='w-44'>

                                                                <TextInput
                                                                          name="Designation"
                                                                          type="text"
                                                                          value={designation}
                                                                          setValue={setDesignation}
                                                                          // readOnly={readOnly}
                                                                          // disabled={childRecord.current > 0}
                                                                          className="focus:ring-2 focus:ring-blue-100"
                                                                        /> 
                                                          </div>
                                                           <div className='w-48'>

                                                      <TextInput
                                                                name="Department"
                                                                type="text"
                                                                value={department}
                                                                setValue={setDepartment}
                                                                // readOnly={readOnly}
                                                                // disabled={childRecord.current > 0}
                                                                className="focus:ring-2 focus:ring-blue-100"
                                                              /> 
                                                          </div>
                                                        </div>
                                                         <div className='col-span-2'>
                                                                                                  
                                      
                                                                              <TextInput
                                                                                name="Email"
                                                                                type="text"
                                                                                    value={email}
                                                                                  setValue={setEmail}
                                                                                // readOnly={readOnly}
                                                                                // disabled={childRecord.current > 0}
                                                                                className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                              />
                                                                      </div>
                                                             <div className='col-span-2 flex flex-row gap-3' >
                                                                        <div className='w-44'>

                                                                            <TextInput
                                                                                              name="Contact Number"
                                                                                              type="number"
                                                                                              value={contact}
                                                                                          setValue={setContact}
                                                                      
                                                                                              // readOnly={readOnly}
                                                                                              // disabled={childRecord.current > 0}
                                                                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                                            />
                                                                        </div>
                                                                          <div className='w-48'>
                                                                                  <TextInput

                                                                                            name="Alternative Contact Number"
                                                                                            label="Alternative"
                                                                                            type="number"
                                                                                            value={alterContact}
                                                                                        setValue={setAlterContact}
                                                                    
                                                                                            // readOnly={readOnly}
                                                                                            // disabled={childRecord.current > 0}
                                                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                                                          />
                                                                      </div>
                                                                                                                                
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
                
                                               
export default BranchContactdetails
             
                
               
              
        
        
             
        
                
        
