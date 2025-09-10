import React, { useEffect, useState, useRef, useCallback } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
  useGetCompanyQuery,
  useGetCompanyByIdQuery,
  useAddCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
} from '../../../redux/services/CompanyMasterService';
import FormHeader from '../FormHeader';
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify"
import { TextInput, DateInput, } from "../../../Inputs"
import ReportTemplate from '../ReportTemplate';
import moment from 'moment';
import { SUBSCRIPTION_ICON } from '../../../icons';
import { GenerateButton } from '../../../Buttons';
import BranchReport from './BranchReport';
import BranchMaster from '../BranchMaster';
import UserReport from './UserReport';
import UserRoles from '../UserAndRolesMaster';
import Modal from '../../../UiComponents/Modal';
// import { generateCompanyId } from '../../../Utils/helper';

const MODEL = "Company Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [branchForm, setBranchForm] = useState(false);
  const [userForm, setUserForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("")
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [panNo, setPanNo] = useState("");

  const [contactName, setContactName] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactEmail, setContactEmail] = useState("")

  const [generatedId, setGeneratedId] = useState("")

  const [validFrom, setValidFrom] = useState("")
  const [expireAt, setExpireAt] = useState("")
  const [maxUsers, setMaxUsers] = useState("")
  const [subscriptionCode, setSubscriptionCode] = useState("")

  const [searchValue, setSearchValue] = useState("");

  const childRecord = useRef(0);

  const params = { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }
  const { data: allData, isLoading, isFetching } = useGetCompanyQuery({ params, searchParams: searchValue });
  const { data: singleData, isFetching: isSingleFetching, isLoading: isSingleLoading } = useGetCompanyByIdQuery(id, { skip: !id });

  const [addData] = useAddCompanyMutation();
  const [updateData] = useUpdateCompanyMutation();
  const [removeData] = useDeleteCompanyMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      setCode(data?.code ? data.code : "");
      setActive(data?.active ? data.active : "");
      setGstNo(data?.gstNo ? data.gstNo : "");
      setPanNo(data?.panNo ? data.panNo : "");
      setContactName(data?.contactName ? data.contactName : "");
      setContactEmail(data?.contactEmail ? data.contactEmail : "");
      setContactMobile(data?.contactMobile ? data.contactMobile : "");
      setGeneratedId(data?.companyId ? data?.companyId : "");
      setValidFrom(data ? (data?.Subscription.length !== 0 ? moment.utc(data?.Subscription[0]?.validFrom).format('YYYY-MM-DD') : "") : "");
      setExpireAt(data ? (data?.Subscription.length !== 0 ? moment.utc(data?.Subscription[0]?.expireAt).format('YYYY-MM-DD') : "") : "");
      setMaxUsers(data ? (data?.Subscription.length !== 0 ? data?.Subscription[0]?.maxUsers : "") : "");
      setSubscriptionCode(data ? (data?.Subscription.length !== 0 ? data?.Subscription[0]?.code : "") : "");
      secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "userCompanyId", data?.id);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    }, [id])


  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData])


  const data = {
    name: name.trim(), code: code.trim(),
    active, gstNo: gstNo.trim(), contactEmail: contactEmail.trim(), contactName: contactName.trim(), contactMobile: contactMobile,
    validFrom, expireAt, maxUsers, id, panNo: panNo.trim()
  }

  const validateData = (data) => {
    if (data.name && data.code) {
      return true;
    }
    return false;
  }

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const returned = await callback(data).unwrap();
      setId(returned.data.id);
      toast.success(text + "Successfully");
    } catch (error) {
      console.log("handle")
    }
  }

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", { position: "top-center" })
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
        await removeData(id).unwrap();
        setId("");
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong")
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

  const onNew = () => { setId(""); setForm(true); setReadOnly(false); setSearchValue("") }

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "Code", "Name", "Status"
  ]
  const tableDataNames = ["dataObj.code", "dataObj.name", 'dataObj.active ? ACTIVE : INACTIVE']

  if (!form)
    return <ReportTemplate
      heading={MODEL}
      tableHeaders={tableHeaders}
      tableDataNames={tableDataNames}
      loading={
        isLoading || isFetching
      }
      setForm={setForm}
      data={allData?.data}
      onClick={onDataClick}
      onNew={onNew}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
    />

  return (
    <>
      <Modal isOpen={userForm} onClose={() => setUserForm(false)} widthClass={"w-[900px] h-[600px] pt-10"}>
        <UserRoles />
      </Modal>
      <Modal isOpen={branchForm} onClose={() => setBranchForm(false)} widthClass={"w-[900px] h-[600px] pt-10"}>
        <BranchMaster companyCode={code} setBranchForm={setBranchForm} />
      </Modal>
      <div onKeyDown={handleKeyDown} className='md:items-start md:justify-items-center grid h-full bg-theme'>
        <div className='flex flex-col frame w-full h-full'>
          <FormHeader onNew={onNew} onClose={() => { setForm(false); setSearchValue(""); }} model={MODEL} saveData={saveData} setReadOnly={setReadOnly} deleteData={deleteData}  />
          <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
            <div className='col-span-3 grid md:grid-cols-2 border'>
              <fieldset className='frame mr-1 md:m-1 overflow-auto'>
                <legend className='sub-heading'>Company Info</legend>
                <div className='grid grid-cols-1 my-2'>
                  <TextInput name="Company Name" type="text" value={name} setValue={setName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                  <TextInput name="Code" type="text" value={code} setValue={setCode} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                  <TextInput name="GST No" type="text" value={gstNo} setValue={setGstNo} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                  <TextInput name="PAN No" type="text" value={panNo} setValue={setPanNo} readOnly={readOnly} disabled={(childRecord.current > 0)}/>

                </div>
                <fieldset className='row-span-2 overflow-auto'>
                  <legend className='sub-heading'>Contact Person Details</legend>
                  <div className='grid grid-cols-1 my-2'>
                    <TextInput name="Name" type="text" value={contactName} setValue={setContactName} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                    <TextInput name="Mobile No" type="number" value={contactMobile} setValue={setContactMobile} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                    <TextInput name="Email id" type="text" value={contactEmail} setValue={setContactEmail} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                  </div>
                </fieldset>
                {id ?
                  <fieldset className='row-span-2'>
                    <legend className='sub-heading'>Current Subscription details</legend>
                    {Boolean(maxUsers) ?
                      <div className='row-span-2'>
                        <DateInput name="Valid From" value={validFrom} setValue={setValidFrom} readOnly={true} disabled={(childRecord.current > 0)}/>
                        <DateInput name="Valid To" value={expireAt} setValue={setExpireAt} readOnly={true} disabled={(childRecord.current > 0)}/>
                        <TextInput name="Max Users" type="number" value={maxUsers} setValue={setMaxUsers} readOnly={true} disabled={(childRecord.current > 0)}/>
                        <TextInput name="Subcription Code" type="text" value={subscriptionCode} setValue={setSubscriptionCode} readOnly={true} disabled={(childRecord.current > 0)}/>
                      </div>
                      :
                      <div className='text-center flex justify-center items-center'>{SUBSCRIPTION_ICON} No Current Subscription Plan</div>
                    }
                    {/* <div className='sub-heading underline hover:cursor-pointer flex justify-end'><span onClick={() => navigate(SUBSCRIPTION_PATH)}>Add New/View Subscription History</span></div> */}
                  </fieldset>
                  :
                  <fieldset className='row-span-2'>
                    <legend className='sub-heading'>Add Subscription details</legend>
                    <div className='row-span-2'>
                      <DateInput name="Valid From" value={validFrom} setValue={setValidFrom} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                      <DateInput name="Valid To" value={expireAt} setValue={setExpireAt} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)}/>
                      <TextInput name="Max Users" type="number" value={maxUsers} setValue={setMaxUsers} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} />
                    </div>
                  </fieldset>
                }
                <div className='grid grid-cols-3 h-1/8 items-center text-sm mx-1 my-5'>
                  <label hidden={!generatedId}>Generated Id</label>
                  <input type="text" disabled placeholder='Generated Id' value={generatedId} onChange={(e) => setGeneratedId(e.target.value)} className='border col-span-2 bg-white' />
                  <GenerateButton onClick={saveData} hidden={generatedId} />
                </div>
              </fieldset>
              <div className='grid grid-rows-2'>
                <fieldset className='mr-1 md:ml-2 my-1 frame overflow-auto'>
                  <legend className='sub-heading'>Branch Info</legend>
                  <BranchReport companyId={id} onNew={() => setBranchForm(true)} />
                </fieldset>
                <fieldset className='mr-1 md:ml-2 my-1 frame overflow-auto'>
                  <legend className='sub-heading '>User & Roles Info</legend>
                  <UserReport companyId={id} onNew={() => setUserForm(true)} />
                </fieldset>
              </div>
            </div>
            <div className='frame overflow-x-hidden'>
              <FormReport
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                setId={setId}
                tableHeaders={tableHeaders}
                tableDataNames={tableDataNames}
                data={allData?.data}
                loading={
                  isLoading || isFetching
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
