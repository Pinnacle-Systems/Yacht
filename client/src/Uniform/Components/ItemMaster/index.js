import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetItemMasterQuery,
  useGetItemMasterByIdQuery,
  useAddItemMasterMutation,
  useUpdateItemMasterMutation,
  useDeleteItemMasterMutation,
} from "../../../redux/uniformService/ItemMasterService";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { useGetPanelMasterQuery } from "../../../redux/uniformService/PanelMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox, DropdownInput } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import { useGetItemTypeMasterQuery } from "../../../redux/uniformService/ItemTypeMasterService";
import { dropDownListObject } from "../../../Utils/contructObject";
import { DELETE, PLUS } from "../../../icons";
import Select from "react-dropdown-select";

const MODEL = "Item Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [itemTypeId, setItemTypeId] = useState("");
  const [name, setName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [active, setActive] = useState(true);
  const [panelId, setPanelId] = useState([]);

  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetItemMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetItemMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddItemMasterMutation();
  const [updateData] = useUpdateItemMasterMutation();
  const [removeData] = useDeleteItemMasterMutation();
  const { data: ItemTypeList } = useGetItemTypeMasterQuery({ params });

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      setItemTypeId(data?.itemTypeId ? data.itemTypeId : "");
      setPanelId(data?.ItemPanel ? data?.ItemPanel : [])
      setActive(id ? (data?.active ? data.active : false) : true);
      setItemDescription(data?.itemDescription ? data?.itemDescription : "");
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id]
  );


  const { data: panelData } = useGetPanelMasterQuery({ params });
  const { data: process } = useGetProcessMasterQuery({ params });
  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    itemDescription,
    name, panelId,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    itemTypeId,
  };

  const validateData = (data) => {
    if (data.name && data.itemTypeId) {
      return true;
    }
    return false;
  };



  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);
      setReadOnly(false);
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

  const handlePanelIdChange = (value, index, field) => {
    setPanelId((prev) => {
      const updatedPanelData = structuredClone(prev);
      updatedPanelData[index][field] = value;
      return updatedPanelData;
    });
  };

  const handleAddonChange = (e, addon, panelIndex) => {
    const isChecked = e.target.checked;

    setPanelId((prev) => {
      const updatedPanelData = [...prev];
      const selectedAddons = updatedPanelData[panelIndex]?.selectedAddons || [];
      const updatedAddons = isChecked
        ? [...selectedAddons, addon.id]
        : selectedAddons.filter((a) => a !== addon.id);

      updatedPanelData[panelIndex] = {
        ...updatedPanelData[panelIndex],
        selectedAddons: updatedAddons,
      };

      return updatedPanelData;
    });
  };

  const deleteData = async () => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let returnData = await removeData(id);
        if (returnData?.data?.statusCode === 1) {
          return toast.error(returnData?.data?.message);
        } else {
          setId("");
          toast.success("Deleted Successfully");
        }
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
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }


  function deletePanel(index) {
    setPanelId(prev => prev.filter((_, i) => i !== index))
  }
  function addNewPanel() {
    setPanelId(prev =>
      [...prev,
      { panelId: "", selectedAddons: [] }]
    );
  }


  const tableHeaders = ["ItemType", "Name", "Status"];
  const tableDataNames = [
    "dataObj.ItemType?.name",
    "dataObj.name",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];



  if (!form)
    return (
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        loading={isLoading || isFetching}
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
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip w-full">
          <div className="col-span-3 border overflow-auto">
            <div className="col-span-3">
              <div className="mr-1 md:ml-2 flex gap-5 min-h-80">
                <fieldset className="frame w-full flex flex-col gap-x-5">
                  <legend className="sub-heading">Item Info</legend>
                  <div className="grid grid-cols-2">
                    <DropdownInput
                      name="Item Type"
                      options={dropDownListObject(
                        id
                          ? ItemTypeList?.data
                          : ItemTypeList?.data.filter((item) => item.active),
                        "name",
                        "id"
                      )}
                      value={itemTypeId}
                      setValue={(value) => {
                        setItemTypeId(value);
                      }}
                      readOnly={readOnly}
                      required={true}
                      disabled={childRecord.current > 0}
                    />
                    <TextInput
                      name="Item Name"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}
                      disabled={childRecord.current > 0}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className=" w-28 text-xs underline  ml-1">
                      Description :
                    </div>
                    <div className="ml-1">
                      <textarea
                        readOnly={readOnly}
                        className=" w-[400px] h-8 overflow-auto focus:outline-none border border-gray-500 rounded p-2 text-xs"
                        value={itemDescription}
                        onChange={(e) => {
                          setItemDescription(e.target.value);
                        }}
                      ></textarea>
                    </div>
                    <CheckBox
                      name="Active"
                      readOnly={readOnly}
                      value={active}
                      setValue={setActive}
                    />
                  </div>

                  <fieldset className='frame my-1'>
                    <legend className='sub-heading'>Choose Panel</legend>
                    <div className='grid grid-cols-1 gap-2 my-2 p-1'>
                      <table className=" border border-gray-500 text-xs  w-2/4">
                        <thead className='bg-blue-200 top-0 border-b border-gray-500'>

                          <tr className=''>
                            <th className="table-data  py-2 w-12">S.No</th>
                            <th className="table-data  py-2 ">Panel</th>
                            <th className="table-data  w-20 p-0.5">  <button onClick={addNewPanel}>{PLUS}</button></th>

                          </tr>
                        </thead>
                        <tbody className='overflow-y-auto h-full w-full'>

                          {(panelId ? panelId : []).map((item, index) =>
                            <tr className="w-full table-row">
                              <td className='table-data'>
                                {index + 1}
                              </td>
                              <td className='table-data'>
                                <select
                                  disabled={readOnly}
                                  className={"w-full p-1 border border-gray-400 rounded"}
                                  value={item?.panelId}
                                  onChange={(e) => handlePanelIdChange(e.target.value, index, "panelId")} >
                                  <option className="text-gray-600 w-full">Select</option>
                                  {
                                    panelData?.data?.map((value, vIndex) =>

                                      <option value={value.id} key={value.id}>
                                        {value.name}
                                      </option>

                                    )
                                  }


                                </select>
                              </td>
                              <td className="border border-gray-500 text-xs text-center">
                                <button
                                  type='button'
                                  onClick={() => {
                                    deletePanel(index)
                                  }}
                                  className='text-xs text-red-600 '>{DELETE}
                                </button>
                              </td>
                            </tr>
                          )}

                        </tbody>
                      </table>
                    </div>
                  </fieldset>


                  {/* {
                    itemTypeId &&

                    <div className="grid grid-cols-4 gap-4">
                      {panelData?.data?.filter(val => parseInt(val.itemTypeId) === parseInt(itemTypeId))?.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white rounded-lg shadow-lg mb-4"
                        >
                          <DropdownInput
                            name="Panel"
                            options={dropDownListObject(
                              panelData?.data?.filter((item) => item.active),
                              "name",
                              "id"
                            )}
                            value={panelId[index]?.panelId || ""}
                            setValue={(id) => handlePanelIdChange(id, index)}
                            required={true}
                            readOnly={readOnly}
                          />

                          <ul className="space-y-3">
                            {process?.data?.map((addon, addonIndex) => (
                              <li
                                key={addonIndex}
                                className="flex items-center space-x-3"
                              >
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="mr-2 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                    disabled={readOnly}
                                    onChange={(e) =>
                                      handleAddonChange(e, addon, index)
                                    }
                                    checked={
                                      panelId[index]?.selectedAddons?.includes(
                                        addon.id
                                      ) || false
                                    }
                                  />
                                  <span className="text-gray-700 text-xs hover:text-green-600 transition duration-300">
                                    {addon.name}
                                  </span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                  } */}

                </fieldset>
              </div>
            </div>
          </div>
          <div className="frame hidden md:block overflow-x-hidden">
            <FormReport
              needExcelReport={true}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              setId={setId}
              tableHeaders={tableHeaders}
              tableDataNames={tableDataNames}
              data={allData?.data}
              loading={isLoading || isFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
