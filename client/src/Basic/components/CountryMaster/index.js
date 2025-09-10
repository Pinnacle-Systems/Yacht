import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import secureLocalStorage from "react-secure-storage";
import Select from "react-select";
import {
  useAddCountryMutation,
  useDeleteCountryMutation,
  useGetCountriesQuery,
  useGetCountryByIdQuery,
  useLazyGetCountryByIdQuery,
  useUpdateCountryMutation,
} from "../../../redux/services/CountryMasterService";
import { Country } from "country-state-city";
import { TextInput, ToggleButton, ReusableTable } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import Modal from "../../../UiComponents/Modal";

import { useDispatch, useSelector } from "react-redux";

import { Check, Power } from "lucide-react";
import Swal from "sweetalert2";

import { toast } from "react-toastify";
import { text } from "@fortawesome/fontawesome-svg-core";
import { capitalize } from "@mui/material";

export default function Form() {
  const openTabs = useSelector((state) => state.openTabs);

  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [errors, setErrors] = useState({});
  // const [childRecord,setChildRecord]  = useState("")
  const countryNameRef = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
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
  } = useGetCountriesQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCountryByIdQuery(id, { skip: !id });

  const [addData] = useAddCountryMutation();
  const [updateData] = useUpdateCountryMutation();
  const [removeData] = useDeleteCountryMutation();

  // const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(push({ name: "COUNTRY MASTER" }))

  // }, [ dispatch,openTabs])
  useEffect(() => {
    if (form && !readOnly && countryNameRef.current) {
      countryNameRef.current.focus();
    }
  }, [form, readOnly]);

  const syncFormWithDb = useCallback(
    (data) => {
      // setName(data?.name || "");
      // setCode(data?.code || "");
      const matchedCountry = countries?.find((c) => c?.label === data?.name);

      setSelectedCountry(matchedCountry || null);
      setCountryCode(data?.code);
      setActive(id ? data?.active ?? false : true);
      // setChildRecord(data?.childRecord ? data?.childRecord : 0);
      childRecord.current = data?.childRecord ? data?.childRecord : 0;
    },
    [id, countries]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name: selectedCountry,
    code: countryCode,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    active,
    id,
  };

  const validateData = (data) => {
    if (data?.name?.value) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);
      Swal.fire({
        title: text + "  " + "Successfully",
        icon: "success",
        draggable: true,
        timer: 1000,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      setForm(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  const saveData = () => {
    console.log("saveData hit");
    if (!validateData(data)) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Please fill all required fields...!",
      });
      return;
    }

    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            icon: "error",
            title: "Child record Exists",
            text: deldata.data?.message || "Data cannot be deleted!",
          });
          return;
        }
        setId("");
        Swal.fire({
          title: "Deleted Successfully",
          icon: "success",
          timer: 1000,
        });
        setForm(false);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Submission error",
          text: error.data?.message || "Something went wrong!",
        });
        setForm(false);
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
    setName("");
    setCode("");
    setActive(true);
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setSelectedCountry("");
    setCountryCode("");
  };
  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
  };
  const ACTIVE = (
    <div className="bg-gradient-to-r from-green-200 to-green-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-green-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const INACTIVE = (
    <div className="bg-gradient-to-r from-red-200 to-red-500 inline-flex items-center justify-center rounded-full border-2 w-6 border-red-500 shadow-lg text-white hover:scale-110 transition-transform duration-300">
      <Power size={10} />
    </div>
  );
  const columns = [
    {
      header: "S.NO",
      accessor: (item, index) => index + 1,
      className: " text-gray-900 font-segoe uppercase  text-center",
    },

    {
      header: "COUNTRY NAME",
      accessor: (item) => item?.name,
      //   cellClass: () => "font-medium  text-gray-900",
      className: " text-gray-900 pl-2 font-segoe text-left uppercase w-72",
    },

    {
      header: "STATUS",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => "font-medium text-gray-900",
      className: " text-gray-900 font-segoe text-center uppercase w-16",
    },
    // {
    //   header: "",
    //   accessor: (item) => "",
    //   //   cellClass: () => "font-medium text-gray-900",
    //   className: "font-medium text-gray-900 uppercase w-[65%]",
    // },
  ];
  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "S.NO",
    "Code",
    "Name",
    "Status",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];
  const tableDataNames = [
    "index+1",
    "dataObj.code",
    "dataObj.name",
    "dataObj.active ? ACTIVE : INACTIVE",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
  ];
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,cca3")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data
          .map((c) => ({
            value: c.cca3, // ISO Alpha-3 code (for your input)
            label: c.name?.common?.toUpperCase() || "", // Only country name for dropdown
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCountries(formatted);
      })
      .catch(console.error);
  }, []);

  const handleSelect = (selectedOption) => {
    if (selectedOption) {
      setSelectedCountry(selectedOption); // Country name
      setCountryCode(selectedOption.value); // Country code
    } else {
      setSelectedCountry("");
      setCountryCode("");
    }
  };

  const [filterData, setFilterData] = useState([]);
  let val = 3;
  const filtered = allData?.data.filter((item, index) => index < val);

  // useEffect(() =>{

  //   console.log(filtered,"filtered");

  //   setFilterData(filtered)
  // },[allData])

  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-2xl font-bold font-segoe text-gray-800 ">
          Country Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border font-segoe border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Country
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      <div>
        {form === true && (
          <Modal
            isOpen={form}
            form={form}
            widthClass={"w-[40%] h-[60%]"}
            onClose={() => {
              setForm(false);
              setErrors({});
              setCountryCode("");
              setId("");
            }}
          >
            <div className="h-full flex flex-col bg-gray-100">
              <div className="border-b py-2 px-4 mx-3 flex mt-4 justify-between items-center sticky top-0 z-10 bg-white">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg   py-0.5 font-semibold  text-gray-800">
                    Country Master
                  </h2>
                </div>
                <div className="flex gap-2">
                  <div>
                    {readOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          setReadOnly(false);
                        }}
                        className="px-3 py-1 font-segoe text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={saveData}
                        className="px-3 py-1 font-segoe hover:bg-green-600 hover:text-white rounded text-green-600 
                          border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update" : "Save"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1  p-3">
                <div className="grid grid-cols-1 font-segoe  gap-3  h-full">
                  <div className="lg:col-span- space-y-3">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="space-y-4 ">
                        <div className="p-2">
                          {/* <div className="flex">
                            <div className="mb-3 w-[60%]">
                              <TextInput
                                name="Country Name"
                                type="text"
                                value={name}
                                setValue={setName}
                                ref={countryNameRef}
                                required={true}
                                readOnly={readOnly}
                                // disabled={ childRecord > 0 ? true : undefined}
                                disabled={
                                  childRecord.current > 0 ? true : undefined
                                }
                              />
                            </div>
                            <div className="mb-3 ml-5 ">
                              <TextInput
                                name="Code"
                                type="text"
                                value={code}
                                setValue={setCode}
                                // required={true}
                                readOnly={readOnly}
                                disabled={
                                  childRecord.current > 0 ? true : undefined
                                }
                              />
                            </div>
                          </div> */}
                          <div className="flex gap-x-3 font-segoe">
                            <div className="w-72 font-segoe">
                              <label className="block text-xs  font-bold text-slate-700 mb-1">
                                Select Country{" "}
                                <span className="text-red-500">*</span>
                              </label>

                              <Select
                                options={countries}
                                ref={countryNameRef}
                                onChange={handleSelect}
                                value={selectedCountry}
                                placeholder="Type to search..."
                                isDisabled={readOnly || childRecord.current > 0}
                                isSearchable
                                isClearable={false}
                                menuShouldScrollIntoView={false}
                                maxMenuHeight={150} // <-- Reduce height here
                                onInputChange={(value) => value.toUpperCase()}
                                className="w-full px-1   text-xs rounded-lg
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          transition-all duration-150 shadow-sm"
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    minHeight: "22px", // Reduce overall height
                                    height: "22px", // Force height
                                    padding: "14px 4px", // Adjust padding inside
                                    fontSize: "12px", // Make text smaller
                                    borderRadius: "8px",
                                    fontFamily: "'Segoe UI'",
                                  }),
                                  valueContainer: (base) => ({
                                    ...base,
                                    padding: "0 6px", // Space for text
                                    marginTop: "-8px",
                                    fontFamily: "'Segoe UI'",
                                  }),
                                  input: (base) => ({
                                    ...base,
                                    margin: 0,
                                    padding: 0,
                                    fontFamily: "'Segoe UI'",
                                  }),
                                  singleValue: (base) => ({
                                    ...base,
                                    fontFamily: "'Segoe UI'",
                                  }),
                                  placeholder: (base) => ({
                                    ...base,
                                    fontFamily: "'Segoe UI'",
                                  }),
                                  menu: (base) => ({
                                    ...base,
                                    fontFamily: "'Segoe UI'",
                                  }),
                                  option: (base) => ({
                                    ...base,
                                    fontFamily: "'Segoe UI'",
                                    fontSize: "12px",
                                  }),
                                  indicatorsContainer: (base) => ({
                                    ...base,
                                    display: "none",
                                    height: "28px", // Align dropdown arrow
                                    marginTop: "-12px",
                                  }),
                                }}
                              />
                            </div>
                            <div className="w-16">
                              <label className="block text-xs font-bold text-slate-700 mb-1">
                                Code
                              </label>
                              <input
                                type="text"
                                value={countryCode}
                                readOnly={readOnly || childRecord.current > 0}
                                className={`w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg
  focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
  transition-all duration-150 shadow-sm
  ${
    readOnly || childRecord.current > 0
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : "bg-white hover:border-gray-400"
  }`}
                                disabled={readOnly || childRecord.current > 0}
                              />
                            </div>
                          </div>

                          <div className=" pt-10">
                            <ToggleButton
                              name="Status"
                              options={statusDropdown}
                              value={active}
                              setActive={setActive}
                              required={true}
                              readOnly={readOnly}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
