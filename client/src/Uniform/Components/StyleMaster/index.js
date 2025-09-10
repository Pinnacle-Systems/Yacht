import React, { useEffect, useState, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetStyleMasterQuery,
  useGetStyleMasterByIdQuery,
  useAddStyleMasterMutation,
  useUpdateStyleMasterMutation,
  useDeleteStyleMasterMutation,
} from "../../../redux/uniformService/StyleMasterService";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { useGetPanelMasterQuery } from "../../../redux/uniformService/PanelMasterService";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  MultiSelectDropdown,
  DropdownInput,
} from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import {
  dropDownListObject,
  multiSelectOption,
} from "../../../Utils/contructObject";

// import { useGetSizeTemplateQuery } from "../../../redux/ErpServices/SizeTemplateMasterServices";
import { useGetColorMasterQuery } from "../../../redux/uniformService/ColorMasterService";

const MODEL = "Style Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [styleCode, setStyleCode] = useState("");

  const [active, setActive] = useState(true);
  const [panelId, setPanelId] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetStyleMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetStyleMasterByIdQuery(id, { skip: !id });
  const [selectedAddons, setSelectedAddons] = useState([]);

  const [addData] = useAddStyleMasterMutation();
  const [updateData] = useUpdateStyleMasterMutation();
  const [removeData] = useDeleteStyleMasterMutation();
  const { data: panelData } = useGetPanelMasterQuery({ params });

  const { data: process } = useGetProcessMasterQuery({ params });


  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      setPanelId(data?.StylePanel ? data?.StylePanel : [])
      setStyleCode(data?.styleCode ? data?.styleCode : "");
      setActive(id ? (data?.active ? data.active : false) : true);
    },
    [id]
  );

  console.log(id, "idddd")

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    //  panelId,

    name,
    styleCode,

    active,

    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const validateData = (data) => {
    if (data.name) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      setId(returnData.data.id);
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
        await removeData(id);
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
    setForm(true);
    setSearchValue("");
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const tableHeaders = ["Name", "Status"];
  const tableDataNames = ["dataObj.name", "dataObj.active ? ACTIVE : INACTIVE"];

  if (!form)
    return (
      <ReportTemplate
        heading={MODEL}
        tableHeaders={tableHeaders}
        tableDataNames={tableDataNames}
        loading={isLoading || isFetching}
        setForm={setForm}
        data={allData?.data ? allData?.data : []}
        onClick={onDataClick}
        onNew={onNew}
        searchValue={searchValue}
        setSearchValue={setSearchValue}
      />
    );
  console.log(panelId, "panel");
  const handlePanelIdChange = (id, index) => {
    setPanelId((prev) => {
      const updatedPanelData = [...prev];
      updatedPanelData[index] = { panelId: id, selectedAddons: [] };
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

  // const panelSelections = panelId.map(({ panelId, selectedAddons }) => ({
  //   panelId,
  //   selectedAddons,
  // }));

  return (
    <div
      onKeyDown={handleKeyDown}
      className="md:items-start md:justify-items-center grid h-full bg-theme"
    >
      {console.log(singleData, "singledata")}

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
          childRecord={0}
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip w-full">
          <div className="col-span-3 border overflow-auto">
            <div className="col-span-3">
              <div className="mr-1 md:ml-2 flex gap-5 min-h-80">
                <fieldset className="frame w-full flex flex-col gap-x-5">
                  <legend className="sub-heading">Style Info</legend>
                  <div className="grid grid-cols-2">
                    <TextInput
                      name="Item Name"
                      type="text"
                      value={name}
                      setValue={setName}
                      required={true}
                      readOnly={readOnly}
                    />

                    <TextInput
                      name="Style code"
                      type="text"
                      value={styleCode}
                      setValue={setStyleCode}
                      required={true}
                      readOnly={readOnly}
                    />
                  </div>

                  <div className="grid grid-cols-2">
                    <CheckBox
                      name="Active"
                      value={active}
                      setValue={setActive}
                    />
                  </div>


                  {/* <div className="grid grid-cols-4 gap-4">
                  {panelData?.data?.map((item, index) => (
    <div key={index} className="p-4 bg-white rounded-lg shadow-lg mb-4">
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
          <li key={addonIndex} className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="mr-2 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                disabled={readOnly}
                onChange={(e) => handleAddonChange(e, addon, index)}
                checked={panelId[index]?.selectedAddons?.includes(addon.id) || false}
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
                  </div> */}




                </fieldset>
              </div>
            </div>
          </div>
          <div className="frame hidden md:block overflow-x-hidden">
            <FormReport
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              setId={setId}
              tableHeaders={tableHeaders}
              tableDataNames={tableDataNames}
              data={allData?.data ? allData?.data : []}
              loading={isLoading || isFetching}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
