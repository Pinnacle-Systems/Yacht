// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import secureLocalStorage from 'react-secure-storage';
// import {
//     useGetSubcriptionQuery,
//     useGetSubscriptionByIdQuery,
//     useAddSubscriptionMutation,
//     useUpdateSubscriptionMutation,
//     useDeleteSubscriptionMutation,
// } from '../../../redux/services/SubscriptionService';
// import FormHeader from '../FormHeader';
// import FormReport from "../FormReportTemplate";
// import { toast } from "react-toastify"
// import { TextInput, DateInput, } from "../../../Inputs"
// import ReportTemplate from '../ReportTemplate';

// const MODEL = "Subscription Master";

// export default function Form() {
//     const [form, setForm] = useState(false);

//     const [readOnly, setReadOnly] = useState(false);
//     const [id, setId] = useState("")
//     const [validFrom, setValidFrom] = useState("");
//     const [expireAt, setExpireAt] = useState("");
//     const [maxUsers, setMaxUsers] = useState("");
//     const [subscriptionCode, setSubscriptionCode] = useState("");
//     const [active, setActive] = useState(true);

//     const [searchValue, setSearchValue] = useState("");

//     const childRecord = useRef(0);

//     const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
//     const { data: allData, isLoading, isFetching } = useGetSubcriptionQuery({ params, searchParams: searchValue });
//     const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetSubscriptionByIdQuery(id, { skip: !id });

//     const [addData] = useAddSubscriptionMutation();
//     const [updateData] = useUpdateSubscriptionMutation();
//     const [removeData] = useDeleteSubscriptionMutation();

//     const syncFormWithDb = useCallback(
//         (data) => {
//             if (id) setReadOnly(true);
//             setExpireAt(data?.expireAt ? moment.utc(data.expireAt).format('YYYY-MM-DD') : "");
//             setValidFrom(data?.validFrom ? moment.utc(data.validFrom).format('YYYY-MM-DD') : "");
//             setMaxUsers(data?.maxUsers);
//             setSubscriptionCode(data?.code);
//             setActive(data?.active);
//             childRecord.current = data?.childRecord ? data?.childRecord : 0;
//         }, [id])


//     useEffect(() => {
//         syncFormWithDb(singleData?.data);
//     }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


//     const data = {
//         name, code, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId"), active, id
//     }

//     const validateData = (data) => {
//         if (data.name && data.code) {
//             return true;
//         }
//         return false;
//     }

//     const handleSubmitCustom = async (callback, data, text) => {
//         try {
//             await callback(data).unwrap();
//             toast.success(text + "Successfully");
//         } catch (error) {
//             console.log("handle")
//         }
//     }

//     const saveData = () => {
//         if (!validateData(data)) {
//             toast.info("Please fill all required fields...!", { position: "top-center" })
//             return
//         }
//         if (!window.confirm("Are you sure save the details ...?")) {
//             return
//         }
//         if (id) {
//             handleSubmitCustom(updateData, data, "Updated")
//         } else {
//             handleSubmitCustom(addData, data, "Added")
//         }
//     }

//     const deleteData = async () => {
//         if (id) {
//             if (!window.confirm("Are you sure to delete...?")) {
//                 return
//             }
//             try {
//                 await removeData(id).unwrap();
//                 setId("");
//                 toast.success("Deleted Successfully");
//             } catch (error) {
//                 toast.error("something went wrong")
//             }
//             ;
//         }
//     }

//     const handleKeyDown = (event) => {
//         let charCode = String.fromCharCode(event.which).toLowerCase();
//         if ((event.ctrlKey || event.metaKey) && charCode === 's') {
//             event.preventDefault();
//             saveData();
//         }
//     }

//     const onNew = () => { setId(""); setReadOnly(false); setForm(true); setSearchValue("") }

//     function onDataClick(id) {
//         setId(id);
//         setForm(true);
//     }
//     const tableHeaders = [
//         "Code", "Name", "Status"
//     ]
//     const tableDataNames = ["dataObj.code", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

//     if (!form)
//         return <ReportTemplate
//             heading={MODEL}
//             tableHeaders={tableHeaders}
//             tableDataNames={tableDataNames}
//             loading={
//                 isLoading || isFetching
//             }
//             setForm={setForm}
//             data={allData?.data}
//             onClick={onDataClick}
//             onNew={onNew}
//             searchValue={searchValue}
//             setSearchValue={setSearchValue}
//         />

//     return (
//         <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
//             <div className='flex flex-col frame w-full h-full'>
//                 <FormHeader onNew={onNew} onClose={() => { setForm(false); setSearchValue(""); }} model={MODEL} saveData={saveData} setReadOnly={setReadOnly} deleteData={deleteData} childRecord={childRecord.current} />
//                 <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
//                     <div className='col-span-3 grid md:grid-cols-2 border overflow-auto'>
//                         <div className='mr-1 md:ml-2'>
//                             {Boolean(id) ?
//                                 <fieldset className='frame my-1'>
//                                     <legend className='sub-heading'>Current Subscription details</legend>
//                                     <DateInput name="Valid From" value={validFrom} setValue={setValidFrom} readOnly={true} />
//                                     <DateInput name="Valid To" value={expireAt} setValue={setExpireAt} readOnly={true} />
//                                     <TextInput name="Max Users" type="number" value={maxUsers} setValue={setMaxUsers} readOnly={true} />
//                                     <TextInput name="Subcription Code" type="text" value={subscriptionCode} setValue={setSubscriptionCode} readOnly={true} />
//                                 </fieldset>
//                                 :
//                                 <fieldset className='frame my-1'>
//                                     <legend className='sub-heading'>Add Subscription details</legend>
//                                     <div className='row-span-2'>
//                                         <DateInput name="Valid From" value={validFrom} setValue={setValidFrom} required={true} readOnly={readOnly} />
//                                         <DateInput name="Valid To" value={expireAt} setValue={setExpireAt} required={true} readOnly={readOnly} />
//                                         <TextInput name="Max Users" type="number" value={maxUsers} setValue={setMaxUsers} required={true} readOnly={readOnly} />
//                                     </div>
//                                 </fieldset>
//                             }
//                         </div>
//                     </div>
//                     <div className='frame overflow-x-hidden'>
//                         <FormReport
//                             searchValue={searchValue}
//                             setSearchValue={setSearchValue}
//                             setId={setId}
//                             tableHeaders={tableHeaders}
//                             tableDataNames={tableDataNames}
//                             data={allData?.data}
//                             loading={
//                                 isLoading || isFetching
//                             }
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
