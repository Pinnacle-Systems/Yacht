import React, { useEffect, useState } from 'react'
import {
    
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
import { useAddPartyMutation,   useUpdatePartyMutation } from '../../../redux/services/PartyMasterService';
import { toast } from "react-toastify";
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import { Check, DatabaseBackup, Eye, Paperclip } from 'lucide-react';
// import { useGetbranchTypeQuery } from '../../../redux/uniformService/BranchTypeMaster';
import { XMarkIcon, MapPinIcon, BuildingStorefrontIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { FaInfoCircle, FaPlus } from 'react-icons/fa';
import { dropDownListMergedObject } from '../../../Utils/contructObject';
import { statusDropdown } from '../../../Utils/DropdownData';
import BranchContactdetails from './BranchContactDetails';
import Modal from "../../../UiComponents/Modal";
import { faFileShield } from '@fortawesome/free-solid-svg-icons';
import { useCallback } from 'react';
// import { useAddPartyBranchMutation, useDeletePartyBranchMutation, useGetPartyBranchByIdQuery, useUpdatePartyBranchMutation } from '../../../redux/services/PartyBranchMasterService';
import Swal from 'sweetalert2';
import ArtDesignReport from './ArtDesign/ArtDesignReport';


const AddBranch = ({ singleData, partyId,setPartyId, cityList,branchInfo,name,setBranchInfo ,childRecord, readOnly,setReadOnly  ,
      branchForm,setBranchForm ,branchState , refetch ,branchAlterContact ,setBranchAlterContact , branchContactPersonEmail , setBranchContactPersonEmail

    }) => {

    const {

  
  branchName,
  setBranchName,
  branchCode,
  setBranchCode,
  branchAddress,
  setBranchAddress,
  branchContact,
  setBranchContact,
  branchContactPerson,
  setBranchcontactPerson,
  branchEmail,
  setBranchEmail,
  openingHours,
  setopeningHours,
  branchWebsite,
  setBranchWebsite,

    branchAliasName,
    setBranchAliasName,

    branchActive,
    setBranchActive,
    branchCity,
    setBranchCity,
    branchLandMark,
    setBranchLandMark,
    branchPincode,
    setBranchPincode,
    branchContactDesignation,
    setBranchcontactDesignation,
    branchContactDepartment,
    setBranchcontactDepartment,
    branchBankname,
    setBranchBankName,
    branchBankBranchName,
    setBranchBankBranchName,
    branchAccountNumber,
    setBranchAccountNumber,
    branchIfscCode,
    setBranchIfscCode, 
    branchType,
    setBranchType,
    branchContactPersonContact,
setBranchContactPersonContact,
branchContactPersonAlterContact,
setBranchContactPersonAlterContact,
    
  } = branchState;


  useEffect(() => {

    syncFormWithDb(undefined)
  }, []);

  const [isBranchcontact,setIsBranchcontact]   = useState(false)
  const [branchId,setBranchId]   = useState("")
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [contactForm,setContactForm]  =  useState(false)
  const [formReport, setFormReport] = useState(false);
  const [attachments, setAttachments] = useState([]);


  // const { data: branchTypeData } = useGetbranchTypeQuery({ });
  
  
  // const {
  //   data: singleBranchData,
  //   isFetching: isSingleFetching,
  //   isLoading: isSingleLoading,
  // } = useGetPartyBranchByIdQuery(branchId, { skip: !branchId });
  
  console.log(branchId,"branchId")

//     const [addData] = useAddPartyBranchMutation();
//     const [updateData] = useUpdatePartyBranchMutation()
//  const [removeData] =   useDeletePartyBranchMutation()





    const syncFormWithDb = useCallback(
      (data) => {
        setReadOnly(false)
        setBranchName(data?.branchName ? data?.branchName : undefined);
        setBranchCode(data?.branchCode ? data?.branchCode : undefined);
        setBranchAddress(data?.branchAddress ? data?.branchAddress : undefined);
        setBranchContact(data?.branchContact ? data?.branchContact : undefined);
        setBranchcontactPerson(data?.branchContactPerson ? data?.branchContactPerson : undefined);
        setBranchEmail(data?.branchEmail ? data?.branchEmail : undefined);
        setopeningHours(data?.openingHours ? data?.openingHours : undefined);
        setBranchWebsite(data?.branchWebsite ? data?.branchWebsite : undefined);
        setBranchAliasName(data?.branchAliasName ? data?.branchAliasName : undefined);
        setBranchActive(data?.branchActive ? data?.branchActive : undefined);
        setBranchCity(data?.branchCity ? data?.branchCity : undefined);
        setBranchLandMark(data?.branchLandMark ? data?.branchLandMark : undefined);
        setBranchPincode(data?.branchPincode ? data?.branchPincode : undefined);
        setBranchcontactDesignation(data?.branchContactDesignation ? data?.branchContactDesignation : undefined);
        setBranchcontactDepartment(data?.branchContactDepartment ? data?.branchContactDepartment : undefined);
        setBranchBankName(data?.branchBankname ? data?.branchBankname : undefined);
        setBranchBankBranchName(data?.branchBankBranchName ? data?.branchBankBranchName : undefined);
        setBranchAccountNumber(data?.branchAccountNumber ? data?.branchAccountNumber : undefined);
        setBranchIfscCode(data?.branchIfscCode ? data?.branchIfscCode : undefined);
        
       
 
      },
  
      [branchId]
    );
    
  // useEffect(() => {
  //   syncFormWithDb(singleBranchData?.data);
  // }, [isSingleLoading,isSingleFetching ,singleBranchData,branchId, syncFormWithDb]);
    
    

    
    const data = {
          branchStateValues : {
        branchName,
        branchAddress,
        branchContact,
        branchContactPerson,
        branchEmail,
        openingHours,
        branchWebsite,
        
      branchAliasName,
      branchCode,
      branchActive,
      branchCity,
      branchLandMark,
      branchPincode,
      branchContactDesignation,
      branchContactDepartment,
      branchBankname,
      branchBankBranchName,
      branchAccountNumber,
      branchIfscCode,
      }, 
      isBranch : true ,
      partyId:partyId,
      id : branchId
    }; 

    console.log(data,"data")

    const onNew = () => {
        setBranchAddress();
        setBranchCode("");
        setBranchContact("")
        setBranchEmail("");
        setBranchName("");
      };

    const handleSubmitCustom = async (callback, data, text, exit = false) => {
        try {
            let returnData;
            if (text === "Updated") {
                returnData = await callback(data).unwrap();
                setBranchId('')
                setPartyId("")

            } else {
                returnData = await callback(data).unwrap();
                setBranchId("")
                setPartyId("")
            }
                  Swal.fire({
                     icon: 'success',
                     title: `${text || 'Saved'} Successfully`,
                     showConfirmButton: false,
                     timer: 2000
                   });
              setBranchId(returnData?.data?.id);
              refetch()
              setPartyId(returnData?.data?.partyId)


        } catch (error) {
            console.error("Submission error:", error);
                console.error("Submission error:", error);
                        Swal.fire({
                    icon: 'error',
                    title: 'Submission error',
                    text: error.data?.message || 'Something went wrong!',
                  });
        }
    };

             const handleDelete = async (orderId) => {
             if (orderId) {
                 if (!window.confirm("Are you sure to delete...?")) {
                     return;
                 }
                 try {
                    //  await removeData(orderId)
                    //  setId("");
                    refetch()
                     onNew();
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
            //     handleSubmitCustom(updateData, data, "Updated");
            // } else {
              
        if (branchId) {
          // handleSubmitCustom(updateData, data, "Updated");
        }
        else {
          
          // handleSubmitCustom(addData, data, "Added");

        }
        // else{
        //   toast.info("no Party selected")
        // }
    };

 const columns = [
          {
              header: 'S.No',
              accessor: (item, index) => index + 1,
              className : 'font-medium text-gray-900 w-[5%] text-center'
          },
          
          {
              header: 'BranchName',
              accessor: (item) => item.branchName,
              className : 'font-medium text-gray-900 w-[35%]'
          },
            
        {
              header: 'BranchAddress',
              accessor: (item) => item.branchAddress,
              className : 'font-medium text-gray-900 w-[30%]'
          },
  {
              header: '',
              accessor: (item) => item.none,
              className : 'font-medium text-gray-900 w-[40%]'
          },
     
        ];


    useEffect(() => {
        if (branchInfo?.length >= 1) return
        setBranchInfo(prev => {
            let newArray = Array.from({ length: 1 - prev.length }, () => {
                return {
                        address : "" , branchName : ''
                }
            })
            return [...prev, ...newArray]
        }
        )
    }, [setBranchInfo, branchInfo])

  function addNewRow() {

    setBranchInfo((prev) => [...prev, { address: "" }]);
  }
  
         const handleView = (id) => {
     console.log(id,"id")
             setBranchId(id)
             setBranchForm(false)
            //  setReadOnly(true);
         };
     
         const handleEdit = (id) => {
             setBranchId(id)
             setBranchForm(false)
            //  setReadOnly(false);
         };
     
   

    return (

      
        <>
                           <Modal
                          isOpen={isBranchcontact}
                          widthClass={`${ contactForm  ? "w-[34%] h-[73%]" :  "w-[60%] h-[70%]"  }`}
                          setIsContactPerson={setIsBranchcontact}
                          onClose={() => {
                            setIsBranchcontact(false)
                            // setMaterialForm(false)
                            }}
                            // allData ={allData}
                   
                    >
                        <BranchContactdetails    
                          partyData={singleData?.data}   partyId={partyId}   setPartyId={setPartyId} branchStat = {branchState} branchId={branchId}

                           contactPersonName={branchState?.branchContactPerson}  setContactPersonName={branchState?.setBranchcontactPerson} 
                           
                         designation={branchState?.branchContactDesignation}  setDesignation={branchState?.setBranchcontactDesignation} 
                           
                            department={ branchState?.branchContactDepartment} setDepartment={branchState?.setBranchcontactDepartment}
                           
                            contact={branchState?.branchContact}   setContact={branchState?.setBranchContact}
                           
                            branchAddress={branchState?.branchAddress}  setBranchAddress={branchState?.setBranchAddress}

                            alterContact = {branchState?.branchAlterContact}  setAlterContact = {branchState?.setBranchAlterContact}

                            email={branchState?.branchContactPersonEmail}  setEmail = {branchState?.setBranchContactPersonEmail}
                           
                            branchForm={branchForm}  setBranchId={setBranchId}  contactForm={contactForm}  setContactForm={setContactForm}
                        
                            setIsContactPerson={branchState?.setIsContactPerson}   
                             setBranchForm={setBranchForm}
                              onClose={() => {
                              setIsBranchcontact(false) 
                            }}
      
                        />
                    </Modal>
                                        <Modal isOpen={formReport}
                            onClose={() => setFormReport(false)} widthClass={"p-3 h-[70%] w-[70%]"}
                          >
                            <ArtDesignReport
                              // userRole={userRole}
                              setFormReport={setFormReport}
                              tableWidth="100%"
                              formReport={formReport}
                              setAttachments={setAttachments}
                              attachments={attachments}
                              // searchValue={searchValue}
                              // setSearchValue={setSearchValue}
                            />
                          </Modal>
{ branchForm  == true  ?   
  
  

(   
                
     <div className="flex flex-col bg-[#f1f1f0] p-4 h-[100%] rounded-md">
   
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 p-2 bg-white rounded-md shadow-md border border-gray-200">
       <div className="flex items-center gap-2">
         <h1 className="text-lg font-semibold text-gray-800 tracking-tight " >
           Branch List
         </h1>
       </div>
   
       <button
         onClick={() => {
            setBranchForm(!branchForm)
          //  onNew();
         }}
         className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs">
         <FaPlus className="w-4 h-4" />
         Add  Branch
       </button>
     </div>
   
     <div className="flex-1 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm p-2">
       <ReusableTable
         columns={columns}
         data={singleData?.data?.partyBranch || []}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         itemsPerPage={10}
       />
     </div>
   </div>)
  

      :
                    
          (  <div className="bg-[F1F1F0]  shadow-xl w-full  overflow-auto p-2 h-[98%] ">
        <div className="flex justify-between bg-white items-center my-2 rounded-md  px-4 ">
           <h2 className="text-gray-800 font-semibold text-lg p-1">Add New Branch</h2>
                      <h2 className="text-lg font-semibold text-zinc-800 p-1">{name}</h2>

           <div className='flex flex-row gap-3'>

             <button
              type="button"
                onClick={()  => setBranchForm(true)}

              className="px-3 py-1 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600 text-xs flex items-center gap-1 rounded"
            >
              <Eye className="w-4 h-4" />
              View
            </button>  
                {/* <button
                      type="button"
                      onClick={() => 
                       onclose}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                </button>  */}
                      <button
              type="submit"
        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"         
                    onClick={saveData} >
                <Check size={14} />
              {branchId  ?   "update"  : "save"}
            </button>
           </div>
        </div>
 
           <div className="flex-1 overflow-auto p-1">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                      
        
                       
        
                        <div className="lg:col-span-4 space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200 h-[320px]">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Basic Details</h3>
                            <div className="grid grid-cols-2 ">     
                            {/* <div className='w-52'>
                              <DropdownWithSearch
                              options={branchTypeData?.data}
                              labelField ={"name"}
                                                                required={true}

                              label={"Branch Category"}
                              value ={branchType}
                              setValue = {setBranchType}
                              />

                            </div> */}

                              <div className="col-span-2">
                                      <TextArea
                                        name="Branch Name"
                                        type="text"
                                        value={branchName}
                                        setValue={setBranchName}
                                        inputClass="h-8" 

                                        // readOnly={readOnly}
                                        required
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100"
                                             onBlur={(e) => {
                                                     if (branchAliasName) return;
                                                     setBranchAliasName(e.target.value);
                                                   }} 
                                      /> 
                              </div>
                               <div className="col-span-2">
                                    <TextArea
                                        name="Branch Alias Name"
                                        type="text"
                                        inputClass="h-8" 
                                        value={branchAliasName}
                                        setValue={setBranchAliasName}
                                        required={true}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100"
                                      />
                              </div>
                               <div>
                                  <TextInput
                                        name="Branch Code"
                                        type="text"
                                        value={branchCode}
                
                                        setValue={setBranchCode}
                                        readOnly={readOnly}
                                        disabled={childRecord.current > 0}
                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                      />
                              </div>
                              <div className="mt-5 ml-3">
                                      <ToggleButton
                                      name="Status"
                                      options={statusDropdown}
                                      value={branchActive}
                                      setActive={setBranchActive}
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
                           <div className="lg:col-span-4 space-y-3 ">
                          <div className="bg-white p-3 rounded-md border border-gray-200 h-[320px]">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Address  Details</h3>
                         <div className="space-y-2">
                         
        
                              <div className="grid grid-cols-2 gap-2 ">
                              
                                <div className='col-span-2'>
                                  
                                <TextArea name="Address"
                                inputClass="h-10" 
                                value={branchAddress} 
                                setValue={setBranchAddress}
                                  required={true}
                                  readOnly={readOnly} d
                                  isabled={(childRecord.current > 0)} />
                                </div>
                                      <TextInput
                                              name="Land Mark"
                                              type="text"
                                              value={branchLandMark}
                                              setValue={setBranchLandMark}
                      
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100 w-10"
                                            /> 
                                                    {/* <TextInput
                                                            name="Website"
                                                            type="text"
                                                            value={branchWebsite}
                                                            setValue={setBranchWebsite}
                                    
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                          /> */}
                                  <DropdownInput
                                      name="City/State Name"
                                      options={dropDownListMergedObject(
                                        partyId
                                          ? cityList?.data
                                          : cityList?.data?.filter((item) => item.active),
                                        "name",
                                        "id"
                                      )}
                                            //  country={country}
                                              masterName="CITY MASTER"
                                            //  lastTab={activeTab}
                                              value={branchCity}
                                              setValue={setBranchCity}
                                              required={true}
                                              readOnly={readOnly}
                                              disabled={childRecord.current > 0}
                                              className="focus:ring-2 focus:ring-blue-100"
                                            />
                                    
                                    <div className="col-span-2 flex flex-row gap-3">                        
                                            <div className="w-24">
      
                                                  <TextInput
                                                  name="Pincode"
                                                  type="number"
                                                  value={branchPincode}
                                                  setValue={setBranchPincode}
                                                  required={true}
                          
                                                  readOnly={readOnly}
                                                  disabled={childRecord.current > 0}
                                                  className="focus:ring-2 focus:ring-blue-100 w-10"
                                                />         
                                           </div>
                                              <div className="w-64"> 
                                            <TextInput
                                          name="Branch Email"
                                          type="text"
                                          value={branchEmail}
                  
                                          setValue={setBranchEmail}
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />
                                          <div>
                                                                                 
                                          
                                                                                </div>
                                          
                                                                                </div>
                                                                              </div>  
                                     <TextInput
                                          name="Contact Number"
                                          type="number"
                                          value={branchContact}
                  
                                          setValue={setBranchContact}
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />                  
                              </div>
                            </div> 
                          </div>
                                                           
                                                                                                   
        
        
                        </div>
                           <div className="lg:col-span-4 space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200 h-[320px]">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Contact  Details</h3>
                         <div className="space-y-2">
                         
        
                           
                              <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2 flex flex-row gap-4 mt-2">
                                   <div className="w-96">
                                                          
                                      <TextInput
                                                    name="Contact Person Name"
                                                    type="text"
                                                    value={branchContactPerson}
                                                    setValue={setBranchcontactPerson}
                            
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                  />
                                                   </div>
                            <div className="relative inline-block">
                                        <button
                                          className="w-7 h-6 border border-green-500 rounded-md mt-6
                                                    hover:bg-green-500 text-green-600 hover:text-white
                                                    transition-colors flex items-center justify-center"
                                          disabled={readOnly}
                                          onClick={() => {
                                            setIsBranchcontact(true)
                                            // setIsDropdownOpen(false);
                                            // setEditingItem("new");
                                            // setOpenModel(true);
                                            // setIsContactPerson(true)
                                          }}
                                          onMouseEnter={() => setTooltipVisible(true)}
                                          onMouseLeave={() => setTooltipVisible(false)}
                                          aria-label="Add supplier"
                                        >
                                          <FaPlus className="text-sm" />
                                        </button>
        
                                            {tooltipVisible && (
                                              <div className="absolute z-10 top-full right-0 mt-1 w-48 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg">
                                                <div className="flex items-start">
                                                  <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                                  <span>Click to add a new Contact Person</span>
                                                </div>
                                                <div className="absolute -top-1 right-3 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                              </div>
                                            )}
                              </div>
                               
          </div> 
                         
                                             <TextInput
                                                      name="Designation"
                                                      type="text"
                                                      value={branchContactDesignation}  
                                                      setValue={setBranchcontactDesignation}
                              
                                                      readOnly={readOnly}
                                                      disabled={childRecord.current > 0}
                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                    />
                                                     <TextInput
                                                      name="Department"
                                                      type="text"
                                                      value={branchContactDepartment}
                                                      setValue={setBranchcontactDepartment} 
                              
                                                      readOnly={readOnly}
                                                      disabled={childRecord.current > 0}
                                                      className="focus:ring-2 focus:ring-blue-100 w-10"
                                                    />
                                      <div className='col-span-2'>

                                       <TextInput
                                          name="Email"
                                          type="text"
                                          value={branchContactPersonEmail}
                  
                                          setValue={setBranchContactPersonEmail}
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />
                                      </div> 
                                          <TextInput
                                                            name="Contact Number"
                                                            type="number"
                                                            value={branchContactPersonContact} 
                                                            setValue={setBranchContactPersonContact}
                                    
                                                            readOnly={readOnly}
                                                            disabled={childRecord.current > 0}
                                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                                          />
                                      {/* </div>
                                       <div className='w-48'> */}
                                          <TextInput
                                                        name="Alternative Contact Number"
                                                        type="number"
                                                          value={branchContactPersonAlterContact}
                                                      setValue={setBranchContactPersonAlterContact}
                                
                                                        // readOnly={readOnly}
                                                        // disabled={childRecord.current > 0}
                                                        className="focus:ring-2 focus:ring-blue-100 w-10"
                                                      />
                                        
                                                 
                                     {/* <div className='col-span-2 flex flex-row gap-3' >
                                      <div className='w-44'> */}

                                            {/* </div> */}
                                    
                                {/* </div> */}
                                                            
                                                                            
                                                                                            
                              </div>
                            </div> 
                          </div>
        
             
                        </div>
                       
                      
        
                           
                   <div className="lg:col-span-6 space-y-3">
                          <div className="bg-white p-3 rounded-md border border-gray-200">
                            <h3 className="font-medium text-gray-800 mb-2 text-sm">Bank  Details</h3>
                         <div className="space-y-2">
                         
        
                              
                              <div className="grid grid-cols-2 gap-2">

                                  <TextInput
                                          name="Bank Name"
                                          type="text"
                                          value={branchBankname}
                                          setValue={setBranchBankName}
                  
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />
                                      <TextInput
                                                    name="Branch Name"
                                                    type="text"
                                                    value={branchBankBranchName}
                                                    setValue={setBranchBankBranchName}
                            
                                                    readOnly={readOnly}
                                                    disabled={childRecord.current > 0}
                                                    className="focus:ring-2 focus:ring-blue-100 w-10"
                                                  />
                                    <TextInput
                                          name="Account Number"
                                          type="text"
                                          value={branchAccountNumber}
                                          setValue={setBranchAccountNumber}
                  
                                          readOnly={readOnly}
                                          disabled={childRecord.current > 0}
                                          className="focus:ring-2 focus:ring-blue-100 w-10"
                                        />
                                      <TextInput
                                            name="IFSC CODE"
                                            type="text"
                                            value={branchIfscCode}
                                            setValue={setBranchIfscCode}
                    
                                            readOnly={readOnly}
                                            disabled={childRecord.current > 0}
                                            className="focus:ring-2 focus:ring-blue-100 w-10"
                                          />
                                                                        
                                                                            
                                                                                            
                              </div>
                        </div> 
                  </div>
        
             
                           </div>
                                                             
               <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[175px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">Attchments</h3>
                 <div className="space-y-2">
                    <div className="flex pt-4">
                  <button
                    className="relative w-10 h-10 bg-gray-800    text-white rounded-md shadow-md hover:shadow-xl hover:scale-105 
                    transform transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center"
                    onClick={() => setFormReport(true)}
                  >
                    <span className="absolute inset-0 bg-white opacity-10 rounded-md"></span>
                        <Paperclip className="relative z-10 w-5 h-5" />
                   </button>
                </div>


                    </div> 
                  </div>

     
                   </div>  
                      </div>
                    </div>


     

        

    </div>
    
  
  )            


  } 

      </>
  )
}

export default AddBranch