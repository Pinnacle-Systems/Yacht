import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import {
  useAddPartyMutation,
  useDeletePartyMutation,
  useGetPartyByIdQuery,
  useGetPartyQuery,
  useUpdatePartyMutation,
} from "../../../redux/services/PartyMasterService";
import moment from "moment";
import { findFromList } from "../../../Utils/helper";
import {
  dropDownListMergedObject,
  dropDownListObject,
  multiSelectOption,
} from "../../../Utils/contructObject";
import PartyOnItems from "./PartyOnItems";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { statusDropdown } from "../../../Utils/DropdownData";
import BrowseSingleImage from "../../components/BrowseSingleImage";
import MastersForm from "../MastersForm/MastersForm";
import {
  Modal,
  ToggleButton,
  DateInput,
  DropdownInput,
  TextInput,
  FancyCheckBox,
  MultiSelectDropdown,
  TextAreaInput,
} from "../../../Inputs";
import Mastertable from "../MasterTable/Mastertable";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { useGetCurrencyMasterQuery } from "../../../redux/services/CurrencyMasterServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { DELETE, PLUS } from "../../../icons";
import { toast } from "react-toastify";
import { exist } from "joi";
import { push } from "../../../redux/features/opentabs";
import { TextField } from "@mui/material";
import CommonTable from "../../../Uniform/Components/common/CommonTable.jsx";
import { FaChevronRight } from "react-icons/fa6";
import GarmentBranchForm from "./GarmentBranchForm.jsx";

const MODEL = "Party Master";

export default function Form({ partyId, onCloseForm }) {
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [panNo, setPanNo] = useState("");
  const [name, setName] = useState("");
  const [aliasName, setAliasName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tinNo, setTinNo] = useState("");
  const [cstNo, setCstNo] = useState("");
  const [cinNo, setCinNo] = useState("");
  const [faxNo, setFaxNo] = useState("");
  const [website, setWebsite] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [contactPersonName, setContactPersionName] = useState("");
  const [igst, setIgst] = useState(false);
  const [gstNo, setGstNo] = useState("");
  const [costCode, setCostCode] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [isGy, setIsGy] = useState(false);
  const [isDy, setIsDy] = useState(false);
  const [isAcc, setIsAcc] = useState(false);
  const [payTermDay, setPayTermDay] = useState("0");
  const [processDetails, setProcessDetails] = useState([]);
  const [cstDate, setCstDate] = useState("");
  const [mail, setMail] = useState("");
  const [accessoryItemList, setAccessoryItemList] = useState([]);
  const [accessoryGroup, setAccessoryGroup] = useState(false);
  const [accessoryGroupPrev, setAccessoryGroupPrev] = useState(false);
  const [priceTemplateId, setPriceTemplateId] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [active, setActive] = useState(true);
  const [isSupplier, setSupplier] = useState(true);
  const [isClient, setClient] = useState(true);
  const [itemsPopup, setItemsPopup] = useState(false);
  const [backUpItemsList, setBackUpItemsList] = useState([]);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);
  const [certificate, setCertificate] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("");
  const [branch, setBranch] = useState(false);
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState({});
  const [mobileNumber, setMobileNumber] = useState("")
  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  // const { data: accessoryItemsMasterList, isLoading: isItemsLoading, isFetching: isItemsFetching } = useGetAccessoryItemMasterQuery({ companyId })
  let accessoryItemsMasterList;

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const params = {
    companyId,
  };
  const { data: cityList } = useGetCityQuery({ params });

  const { data: currencyList } = useGetCurrencyMasterQuery({ params });

  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetPartyQuery({ params, searchParams: searchValue });

  const activeTab = useSelector(
    (state) => state.openTabs.tabs.find((tab) => tab.active).name
  );

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(id, { skip: !id });



  const [addData] = useAddPartyMutation();
  const [updateData] = useUpdatePartyMutation();
  const [removeData] = useDeletePartyMutation();

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setPanNo("");
        setMail("");
        setCertificate([]);
        setName("");
        setImage("");
        setAliasName("");
        setDisplayName("");
        setAddress("");
        setTinNo("");
        setCstNo("");
        setCinNo("");
        setFaxNo("");
        setCinNo("");
        setContactPersionName("");
        setGstNo("");
        setCostCode("");
        setPayTermDay("0");
        setCstDate("");
        setCode("");
        setPincode("");
        setWebsite("");
        setEmail("");
        setCity("");
        setCurrency("");
        setActive(id ? data?.active : true);
        setSupplier(false);
        setClient(false);
        setContactMobile("");
        setAccessoryGroup(false);
        setAccessoryItemList([]);
        setPriceTemplateId("");
        setProcessDetails([]);
      } else {
        // if (partyId) {
        //   setReadOnly(false);
        // } else {
        // }

        setPanNo(data?.panNo || "");
        setName(data?.name || "");
        setMail(data?.mailId || "");
        setAliasName(data?.aliasName || "");
        setImage(data?.image || "");
        setDisplayName(data?.displayName || "");
        setAddress(data?.address || "");
        setTinNo(data?.tinNo || "");
        setCstNo(data?.cstNo || "");
        setIsGy(data?.isGy || false);
        setIsDy(data?.isDy || false);
        setIsAcc(data?.isAcc || false);
        setCinNo(data?.cinNo || "");
        setFaxNo(data?.faxNo || "");
        setCinNo(data?.cinNo || "");
        setContactPersionName(data?.contactPersionName || "");
        setMobileNumber(data?.mobileNumber || "");

        setGstNo(data?.gstNo || "");
        setCostCode(data?.costCode || "");
        setCstDate(
          data?.cstDate ? moment.utc(data?.cstDate).format("YYYY-MM-DD") : ""
        );
        setPayTermDay(data?.payTermDay);
        setCode(data?.code || "");
        setPincode(data?.pincode || "");
        setWebsite(data?.website || "");
        setEmail(data?.email || "");
        setCity(data?.cityId || "");
        setCurrency(data?.currencyId || "");
        setActive(id ? data?.active ?? false : true);
        setSupplier(data?.yarn || false);
        setClient(data?.fabric || false);
        setAccessoryGroup(data?.accessoryGroup || false);
        setAccessoryItemList(
          data?.PartyOnAccessoryItems
            ? data.PartyOnAccessoryItems.map((item) =>
              parseInt(item.accessoryItemId)
            )
            : []
        );
        setPriceTemplateId(data?.priceTemplateId || "");
        setShippingAddress(data?.ShippingAddress ? data?.ShippingAddress : []);
        setContactDetails(data?.ContactDetails ? data.ContactDetails : "");
        setSupplier(data?.isSupplier || false);
        setClient(data?.isClient || false);
        setProcessDetails(
          data?.PartyOnProcess
            ? data.PartyOnProcess.map((item) => {
              return {
                value: parseInt(item.processId),
                label: findFromList(item.processId, processList.data, "name"),
              };
            })
            : []
        );
      }
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    code,
    aliasName,
    displayName,
    address,
    cityId: city,
    pincode,
    panNo,
    tinNo,
    certificate,
    cstNo,
    cstDate,
    cinNo,
    faxNo,
    email,
    website,
    contactPersonName,
    igst,
    companyId,
    currencyId: currency,
    costCode,
    contactMobile,
    gstNo,
    active,
    isSupplier,
    isClient,
    accessoryGroup,
    companyId,
    shippingAddress,
    contactDetails,
    payTermDay,
    accessoryItemList,
    processDetails: processDetails
      ? processDetails.map((item) => item.value)
      : undefined,
    id,
    userId,
    priceTemplateId,
    image,
    isAcc,
    certificate,
    mail,
    isGy,
    isDy,
    mobileNumber
  };

  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });

  const validateData = (data) => {
    if (data.name) {
      return true;
      // && data.joiningDate && data.fatherName && data.dob && data.gender && data.maritalStatus && data.bloodGroup &&
      //     data.panNo && data.email && data.mobile && data.degree && data.specialization &&
      //     data.localAddress && data.localCity && data.localPincode && data.partyCategoryId && data.currencyId
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text, exit = false) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: data }).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
      toast.success(text + "Successfully");
      dispatch({
        type: `accessoryItemMaster/invalidateTags`,
        payload: ["AccessoryItemMaster"],
      });
      dispatch({
        type: `CityMaster/invalidateTags`,
        payload: ["City/State Name"],
      });
      dispatch({
        type: `CurrencyMaster/invalidateTags`,
        payload: ["Currency"],
      });

      setId(returnData.data.id);
      onNew();
      setStep(1);
      if (exit) {
        setForm(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong during submission");
    }
  };

  useEffect(() => {
    if (itemsPopup) {
      setBackUpItemsList(accessoryItemList);
    }
  }, [itemsPopup]);
  useEffect(() => {
    if (accessoryGroup) {
      if (accessoryItemsMasterList) {
        setAccessoryItemList(
          accessoryItemsMasterList.data.map((item) => parseInt(item.id))
        );
      }
    }
  }, [accessoryGroup, accessoryItemsMasterList]);

  const saveData = () => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      console.log("hit");
      handleSubmitCustom(addData, data, "Added");
    }
  };
  const saveExitData = () => {
    if (!validateData(data)) {
      toast.error("Please fill all required fields...!", {
        position: "top-center",
      });
      return;
    }
    if (id) {
      handleSubmitCustom(updateData, data, "Updated", true);
    } else {
      console.log("hit");
      handleSubmitCustom(addData, data, "Added", true);
    }
  };
  console.log(id, "id");

  const deleteData = async (id) => {
    if (!id) return;
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          toast.error(deldata?.message);
          return;
        }
        dispatch({
          type: `accessoryItemMaster/invalidateTags`,
          payload: ["AccessoryItemMaster"],
        });
        setId("");
        dispatch({
          type: `CityMaster/invalidateTags`,
          payload: ["City/State Name"],
        });
        dispatch({
          type: `CurrencyMaster/invalidateTags`,
          payload: ["Currency"],
        });
        syncFormWithDb(undefined);
        toast.success("Deleted Successfully");
        setForm(false);
      } catch (error) {
        toast.error("something went wrong");
      }
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const onNew = () => {
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setId("");
    syncFormWithDb(undefined);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  function handleInputAddress(value, index, field) {
    const newBlend = structuredClone(shippingAddress);
    newBlend[index][field] = value;
    setShippingAddress(newBlend);
  }

  function deleteAddress(index) {
    setShippingAddress((prev) => prev.filter((_, i) => i !== index));
  }
  function addNewAddress() {
    setShippingAddress((prev) => [...prev, { address: "" }]);
  }

  function removeItem(index) {
    setContactDetails((contactDetails) => {
      return contactDetails.filter((_, i) => parseInt(i) !== parseInt(index));
    });
  }

  const tableHeaders = [
    "S.NO",
    "Party Name",
    "Alias Name",
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
    "dataObj.name",
    "dataObj.aliasName",
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
  const [step, setStep] = useState(1);
  useEffect(() => {
    if (!partyId) return;
    if (partyId == "new") {
      onNew();
    } else {
      setId(partyId);
    }

    setForm(true);
    setReadOnly(false);
  }, [partyId]);

  console.log(readOnly, "readOnly");

  const columns = [
    {
      header: "Name.",
      accessor: (item) => item.name,
      cellClass: () => "font-medium text-gray-900",
    },
    {
      header: "Alias Name",
      accessor: (item) => item.aliasName,
    },
  ];
  return (
    <div onKeyDown={handleKeyDown}>
      <>
        <div className="w-full flex justify-between mb-2 items-center px-0.5 p-2">
          <h1 className="text-2xl font-bold text-gray-800"> Party Master</h1>
          <div className="flex items-center">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="px-3 py-1 text-green-600 hover:bg-green-600 hover:text-white border border-green-600 text-xs rounded"
            >
              + Add Party
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {console.log(allData, "alll")}
          <CommonTable
            columns={columns}
            data={allData?.data || []}
            onDataClick={onDataClick}
            itemsPerPage={10}
            setReadOnly={setReadOnly}
            handleDelete={deleteData}
          />
        </div>
      </>

      {form === true && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[75%] h-[65vh] -mt-10"}
          onClose={() => {
            setForm(false);
            onCloseForm();
            setErrors({});
            setStep(1);
          }}
        >
          <Modal
            isOpen={itemsPopup}
            onClose={() => {
              setAccessoryGroup(accessoryGroupPrev);
              setAccessoryItemList(structuredClone(backUpItemsList));
              setItemsPopup(false);
            }}
            widthClass={"w-[55%] h-[45%] "}
          >
            <PartyOnItems
              readOnly={readOnly}
              setItemsPopup={setItemsPopup}
              accessoryItemsMasterList={accessoryItemsMasterList}
              accessoryItemList={accessoryItemList}
              setAccessoryItemList={setAccessoryItemList}
            />
          </Modal>

          <div className="h-full flex flex-col bg-[#f1f1f0]">
            {/* Header */}
            <div className="border-b py-2 px-4 mx-3 my-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  {id
                    ? readOnly
                      ? "Party Master"
                      : "Edit Party"
                    : "Add New Party"}
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setForm(false);
                    setSearchValue("");
                    setId(false);
                  }}
                  className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteData();
                    setId(id);
                  }}
                  className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                >
                  Deleted
                </button>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={saveData}
                    className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
              border border-green-600 flex items-center gap-1 text-xs"
                  >
                    <Check size={14} />
                    {id ? "Update" : "Save"}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Party Type
                </h3>
                <div className={`space-y-2 ${readOnly ? "opacity-80" : ""}`}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-6">
                    <FancyCheckBox
                      label="Is Supplier"
                      value={isSupplier}
                      onChange={setSupplier}
                      readOnly={readOnly}
                      className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    />
                    <FancyCheckBox
                      label="Is Client"
                      value={isClient}
                      onChange={setClient}
                      readOnly={readOnly}
                      className="hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    />
                    {/* 
                    {isSupplier && (
                      <>
                        <FancyCheckBox
                          label="Grey Yarn"
                          value={isGy}
                          onChange={setIsGy}
                          readOnly={readOnly}
                          className="hover:bg-gray-100 p-3 rounded-lg"
                        />
                        <FancyCheckBox
                          label="Dyed Yarn"
                          value={isDy}
                          onChange={setIsDy}
                          readOnly={readOnly}
                          className="hover:bg-gray-100 p-3 rounded-lg"
                        />
                        <FancyCheckBox
                          label="Accessories"
                          value={isAcc}
                          onChange={setIsAcc}
                          readOnly={readOnly}
                          className="hover:bg-gray-100 p-3 rounded-lg"
                        />
                      </>
                    )} */}

                    <div className="flex items-center gap-x-2">
                      <ToggleButton
                        name="Status"
                        options={statusDropdown}
                        value={active}
                        setActive={setActive}
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

              {/* Party Details Section */}
              <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Party Details
                </h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
                  <TextInput
                    name="Party Name"
                    type="text"
                    value={name}
                    setValue={setName}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    onBlur={(e) => {
                      if (aliasName) return;
                      setAliasName(e.target.value);
                    }}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="Alias Name"
                    type="text"
                    value={aliasName}
                    setValue={setAliasName}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="Pan No"
                    type="pan_no"
                    value={panNo}
                    setValue={setPanNo}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="GST No"
                    type="text"
                    value={gstNo}
                    setValue={setGstNo}
                    readOnly={readOnly}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="Pincode"
                    type="number"
                    value={pincode}
                    setValue={setPincode}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="CST No"
                    type="text"
                    value={cstNo}
                    setValue={setCstNo}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="Fax No"
                    type="text"
                    value={faxNo}
                    setValue={setFaxNo}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <DropdownInput
                    name="Currency"
                    options={dropDownListObject(
                      id
                        ? currencyList?.data ?? []
                        : currencyList?.data?.filter((item) => item.active) ??
                        [],
                      "name",
                      "id"
                    )}
                    value={currency}
                    setValue={setCurrency}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <DropdownInput
                    name="City/State Name"
                    options={dropDownListMergedObject(
                      id
                        ? cityList?.data
                        : cityList?.data?.filter((item) => item.active),
                      "name",
                      "id"
                    )}
                    value={city}
                    setValue={setCity}
                    required={true}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="PayTerm Days"
                    type="name"
                    value={payTermDay}
                    setValue={setPayTermDay}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextInput
                    name="Mobile Number"
                    type="text"
                    value={mobileNumber}
                    setValue={setMobileNumber}
                    readOnly={readOnly}
                    disabled={childRecord.current > 0}
                    className="focus:ring-2 focus:ring-blue-100"
                  />

                  <TextAreaInput
                    name="Address"
                    value={address}
                    setValue={setAddress}
                    required={true}
                  />

                  <button
                    onClick={() => {
                      setBranch(true)
                    }}
                    // className="px-3 py-1 w-40 text-[12px] text-green-600 hover:bg-green-600 hover:text-white border border-green-600  rounded"
                    className="w-20 h-5 mt-8 ml-5 text-green-600 hover:bg-green-600 hover:text-white border border-green-600 text-xs rounded"
                  >
                    + Add Branch
                  </button>
                  {branch && <GarmentBranchForm onClose={() => setBranch(false)} />}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}