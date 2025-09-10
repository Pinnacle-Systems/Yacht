import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import FormHeader from "../../../Basic/components/FormHeader";
import FormReport from "../../../Basic/components/FormReportTemplate";
import { toast } from "react-toastify";
import { TextInput, CheckBox } from "../../../Inputs";
import ReportTemplate from "../../../Basic/components/ReportTemplate";
import {
  useAddColorMasterMutation,
  useDeleteColorMasterMutation,
  useGetColorMasterByIdQuery,
  useGetColorMasterQuery,
  useUpdateColorMasterMutation,
} from "../../../redux/uniformService/ColorMasterService";
import pantoneColors from "./Pantone";
const MODEL = "Color Master";

export default function Form() {
  const [form, setForm] = useState(false);

  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [pantone, setPantone] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [active, setActive] = useState(true);
  const [isGrey, setIsGrey] = useState(false);

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
  } = useGetColorMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetColorMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddColorMasterMutation();
  const [updateData] = useUpdateColorMasterMutation();
  const [removeData] = useDeleteColorMasterMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");
      // setPantone(data?.pantone ? data.pantone : "");
      const pantoneValue = data?.pantone || "";
      setPantone(pantoneValue);

      const pantoneHex = pantoneColors?.[pantoneValue]?.hex || pantoneValue;
      setHexCode(pantoneHex);

      // setHexCode(data?.pantone);

      setIsGrey(data?.isGrey ? data.isGrey : false);
      setActive(id ? (data?.active ? data.active : false) : true);
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
    console.log(singleData?.data, "singleData?.data");
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);
  useEffect(() => {
    console.log(pantone, "pantone updated");
  }, [pantone]);
  useEffect(() => {
    console.log(hexCode, "hexCode updated");
  }, [hexCode]);

  const data = {
    id,
    name,
    pantone,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    isGrey,
  };

  const validateData = (data) => {
    if (data.name && data.pantone) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId("");
      syncFormWithDb(undefined);
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
      console.log("Added");
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

  const tableHeaders = ["Name","Pantone",  "Status", "color"];
  const tableDataNames = [
       "dataObj.name",
    "dataObj.pantone",
 
    "dataObj.active ? ACTIVE : INACTIVE",
    "dataObj.color",
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

  const handleOnChange = (value, pantoneColors) => {
    console.log(value, "value");

    // pantoneColors[value] ? setHexCode(pantoneColors[value].hex) : setHexCode(value);
    // value ? setPantone(value) : setPantone(value);
    const hex = pantoneColors[value]?.hex || value;

    setHexCode(hex);
    setPantone(value || "");
  };

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
          childRecord={0}
        />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip">
          <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
            <div className="col-span-3 grid md:grid-cols-2 border overflow-auto">
              <div className="mr-1 md:ml-2">
                <fieldset className="frame my-1">
                  <legend className="sub-heading">Color Info</legend>
                  <div className="grid grid-cols-1 my-2 px-5">
                    <div className="w-60">
                      <TextInput
                        name="Color Name"
                        type="text"
                        value={name}
                        setValue={setName}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                    </div>
                    <div className="py-5 col-span-2 w-60 ">
                      {/* <TextInput name="Pantone" type="text" value={pantone} setValue={setPantone} required={true} readOnly={readOnly} disabled={(childRecord.current > 0)} /> */}

                      <label className="block text-xs text-black mb-1">
                        Pantone
                      </label>
                      <input
                        className="w-full px-3 py-0 text-xs border border-gray-300 rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
                        value={pantone}
                        onChange={(e) =>
                          handleOnChange(e.target.value, pantoneColors)
                        }
                      />
                      {console.log(pantone, "check")}
                      <div />
                      <div
                        className={`h-20 w-32 mt-4 `}
                        style={{ backgroundColor: hexCode }}
                       

                      ></div>
                     
                    </div>
                    <CheckBox
                      name="Grey"
                      readOnly={readOnly}
                      value={isGrey}
                      setValue={setIsGrey}
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
          </div>
          <div className="frame hidden md:block overflow-x-hidden">
            <FormReport
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
