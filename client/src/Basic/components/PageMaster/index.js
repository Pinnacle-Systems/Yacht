import React, { useEffect, useState,useRef, useCallback } from "react";
import {
  useGetPagesQuery,
  useGetPagesByIdQuery,
  useAddPageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} from "../../../redux/services/PageMasterService";
import FormHeader from "../FormHeader";
import FormReport from "../FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput } from "../../../Inputs";
import ReportTemplate from "../ReportTemplate";
import { pageType } from "../../../Utils/DropdownData"
import {useGetPageGroupQuery} from "../../../redux/services/PageGroupMasterServices";
import { dropDownListObject } from "../../../Utils/contructObject";

const MODEL = "Page Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [type, setType] = useState("")
  const [pageGroupId, setPageGroupId] = useState("")
  const [active, setActive] = useState(true);


  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  
  const { data: allData, isLoading, isFetching } = useGetPagesQuery({searchParams:searchValue});
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPagesByIdQuery(id, {skip: !id});

  const {data: pageGroupData, isLoading: isGroupLoading, isFetching: isGroupFetching } = useGetPageGroupQuery({})
 

  const [addData] = useAddPageMutation();
  const [updateData] = useUpdatePageMutation();
  const [removeData] = useDeletePageMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setName(data?.name ? data?.name : "");
      setLink(data?.link ? data?.link : "");
      setType(data?.type ? data?.type : "");
      setPageGroupId(data?.pageGroupId ? data?.pageGroupId : "");
      setActive(id ? (data?.active ? data.active : false) : true);
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name, link, active, type, pageGroupId,
    id,
  };

  const validateData = (data) => {
    if (data.name && data.type ) {
        return true;
    }
    return false;
}

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      await callback(data).unwrap();
      setId("")
      syncFormWithDb(undefined)
      toast.success(text + "Successfully");
    } catch (error) {
      console.log("handle");
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      toast.info("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (!window.confirm("Are you sure save the details ...?")) {
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        await removeData(id).unwrap();
        setId("");
        toast.success("Deleted Successfully");
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const tableHeaders = ["Page Name", "Page Link", "Status"];
  const tableDataNames = [
    "dataObj.name",
    "dataObj.link",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];

  if (!form)
    return (
      <ReportTemplate
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
    );

  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme"
    >
      <div className="flex flex-col frame w-full h-full">
        <FormHeader
          onNew={onNew}
          onClose={() => {
            setForm(false);
            setSearchValue("");
          }}
          model={MODEL}
          saveData={saveData}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
          <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
            <div className="mr-1 md:ml-2">
              <fieldset className="frame my-1">
                <legend className="sub-heading">Page Info</legend>
                <div className="grid grid-cols-1 my-2">
                  <TextInput
                    name="Page Name"
                    type="text"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                    disabled={(childRecord.current > 0)}
                  />
                  <TextInput
                    name="Link"
                    type="text"
                    value={link}
                    setValue={setLink}
                    required={true}
                    readOnly={readOnly}
                    disabled={(childRecord.current > 0)}
                  />
                  <DropdownInput
                    name="Type"
                    options={pageType}
                    value={type}
                    setValue={setType}
                    required={true}
                    readOnly={readOnly}
                    disabled={(childRecord.current > 0)}
                  />
                  <DropdownInput
                    name="Page Group"
                    options={dropDownListObject(pageGroupData ? pageGroupData.data.filter(g => g.type === type) : [], "name", "id")}
                    value={pageGroupId}
                    setValue={setPageGroupId}
                    required={true}
                    readOnly={!type || readOnly}
                    disabled={(childRecord.current > 0)}
                  />
                  <CheckBox
                    name="Active"
                    readOnly={readOnly}
                    value={active}
                    setValue={setActive}
                  />
                </div>
              </fieldset>
            </div>
          </div>
          <div className="frame hidden md:block overflow-x-hidden">
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
  );
}
