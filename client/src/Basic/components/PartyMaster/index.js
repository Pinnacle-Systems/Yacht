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
} from "../../../Utils/contructObject";
import { Check, LayoutGrid, Paperclip, Plus, Table } from "lucide-react";
import { statusDropdown } from "../../../Utils/DropdownData";
import {
  Modal,
  ToggleButton,
  DropdownInput,
  TextInput,
  ReusableTable,
  TextArea,
} from "../../../Inputs";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useGetPaytermMasterQuery } from "../../../redux/services/PayTermMasterServices";

const MODEL = "Party Master";

export default function Form({ partyId, onCloseForm }) {
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
  const [priceTemplateId, setPriceTemplateId] = useState("");
  const [active, setActive] = useState(true);
  const [isSupplier, setSupplier] = useState(true);
  const [isClient, setClient] = useState(true);
  const [shippingAddress, setShippingAddress] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);
  const [certificate, setCertificate] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState({});
  const [mobileNumber, setMobileNumber] = useState("");
  const [view, setView] = useState("all");
  const [step, setStep] = useState(1);
  const [branchModelOpen, setBranchModelOpen] = useState(false);
  const [branchForm, setBranchForm] = useState(true);
  const [partyCode, setPartyCode] = useState("");
  const [landMark, setlandMark] = useState("");
  const [country, setCountry] = useState("");
  const [contact, setContact] = useState("");
  const [bankname, setBankName] = useState("");
  const [bankBranchName, setBankBranchName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [alterContactNumber, setAlterContactNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [msmeNo, setMsmeNo] = useState("");

  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );

  let accessoryItemsMasterList;

  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const params = {
    companyId,
  };

  const { data: cityList } = useGetCityQuery({ params });
  const { data: payTermList } = useGetPaytermMasterQuery({ params });
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
    refetch,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPartyByIdQuery(id, { skip: !id });

  const [addData] = useAddPartyMutation();
  const [updateData] = useUpdatePartyMutation();
  const [removeData] = useDeletePartyMutation();

  let filterParty;

  if (view == "Customer") {
    filterParty = allData?.data?.filter((item) => item.isClient);
  }
  if (view === "Supplier") {
    filterParty = allData?.data?.filter((item) => item.isSupplier);
  }
  if (view == "all") {
    filterParty = allData?.data;
  }

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
        setGstNo("");
        setCostCode("");
        setPayTermDay("0");
        setCstDate("");
        setCode("");
        setPincode("");
        setWebsite("");
        setEmail("");
        setCity("");
        setActive(id ? data?.active : true);
        setSupplier(false);
        setClient(false);
        setContactMobile("");
        setAccessoryGroup(false);
        setAccessoryItemList([]);
        setPriceTemplateId("");
        setProcessDetails([]);
      } else {
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
    mobileNumber,
  };

  const {
    data: processList,
    isLoading: isProcessLoading,
    isFetching: isProcessFetching,
  } = useGetProcessMasterQuery({ params });

  const validateData = (data) => {
    if (data.name) {
      return true;
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
    if (accessoryGroup) {
      if (accessoryItemsMasterList) {
        setAccessoryItemList(
          accessoryItemsMasterList.data.map((item) => parseInt(item.id))
        );
      }
    }
  }, [accessoryGroup, accessoryItemsMasterList]);

  const saveData = () => {
    // if (isSupplier) {
    //   console.log(selected.length <= 0, "condiion");
    //   if (selected.length <= 0) {
    //     Swal.fire({
    //       icon: "error",
    //       title: `Select One Material...!`,
    //       showConfirmButton: false,
    //       timer: 3000,
    //     });
    //     return false;
    //   }
    // }
    if (!validateData(data)) {
      Swal.fire({
        icon: "warning",
        title: `Please fill all required fields...!`,
        showConfirmButton: false,
        timer: 3000,
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
      syncFormWithDb(undefined);
      Swal.fire({
        icon: "success",
        title: `Deleted Successfully`,
        showConfirmButton: false,
        timer: 2000,
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

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (orderId) => {
    setId(orderId);
    setForm(true);
    setReadOnly(false);
  };

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
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "font-medium text-gray-900 w-12  text-center",
    },

    {
      header: "Name",
      accessor: (item) => item.name,
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-[300px]",
    },
    {
      header: "Address",
      accessor: (item) => item.address,
      cellClass: () => "font-medium text-gray-900",
      className: "text-gray-800 uppercase w-[700px]",
    },
  ];

  const handleChange = (type) => {
    setSupplier(type == "supplier");
    setClient(type == "client");
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="w-full bg-white  mx-auto rounded-md shadow-md px-2 py-1 overflow-y-auto mt-1">
        <div className="w-full flex justify-between p-1  items-center px-0.5">
          <h1 className="text-xl font-bold text-gray-800">Party Master</h1>
          <div className="flex items-center gap-4 text-md">
            <button
              onClick={() => {
                setForm(true);
                onNew();
              }}
              className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={12} />
              <span className=" ">Add New Customer/Supplier</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("all")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                  view === "all"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Table size={16} />
                All
              </button>
              <button
                onClick={() => setView("Customer")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                  view === "Customer"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Table size={16} />
                Customer
              </button>
              <button
                onClick={() => setView("Supplier")}
                className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                  view === "Supplier"
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid size={16} />
                Supplier
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3 w-">
        <ReusableTable
          columns={columns}
          data={filterParty || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      {form === true && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[90%] h-[95%]"}
          onClose={() => {
            setForm(false);
          }}
        >
          {/* <Modal
            isOpen={branchModelOpen}
            form={form}
            widthClass={` ${
              branchForm ? "w-[60%] h-[80%]" : "w-[90%] h-[90%]"
            } `}
            setBranchModelOpen={setBranchModelOpen}
            onClose={() => {
              setBranchModelOpen(false);
              refetch();
            }}
          >
            <AddBranch
              singleData={singleData}
              partyId={id}
              branchEmail={branchEmail}
              setBranchEmail={setBranchEmail}
              setBranchAddress={setBranchAddress}
              branchName={branchName}
              setBranchName={setBranchName}
              branchCode={branchCode}
              setBranchCode={setBranchCode}
              branchAddress={branchAddress}
              branchContact={branchContact}
              setBranchContact={setBranchContact}
              branchContactPerson={branchContactPerson}
              setBranchcontactPerson={setBranchcontactPerson}
              branchWebsite={branchWebsite}
              setBranchWebsite={setBranchWebsite}
              openingHours={openingHours}
              setopeningHours={setopeningHours}
              onNew={onNew}
              branchType={branchType}
              handleFun={handleFun}
              setPartyId={setId}
              childRecord={childRecord}
              saveData={saveData}
              saveExitData={saveExitData}
              setReadOnly={setReadOnly}
              deleteData={deleteData}
              readOnly={readOnly}
              onCloseForm={onCloseForm}
              handleChange={handleChange}
              contactDetails={contactDetails}
              setContactDetails={setContactDetails}
              shippingAddress={shippingAddress}
              setForm={setForm}
              onClose={() => {
                setBranchModelOpen(false);
              }}
              branchForm={branchForm}
              setBranchForm={setBranchForm}
              removeItem={removeItem}
              setBranchInfo={setBranchInfo}
              branchInfo={branchInfo}
              partyBranch={partyBranch}
              setPartyBranch={setPartyBranch}
              setBranchModelOpen={setBranchModelOpen}
              name={name}
              setBranchType={setBranchType}
              handleInputbranch={handleInputbranch}
              deleteBranch={deleteBranch}
              cityList={cityList}
              branchState={branchState}
              refetch={refetch}
              branchActive={branchActive}
            />
          </Modal> */}

          {/* <Modal
            isOpen={rawMaterial}
            widthClass={`${"w-[50%] h-[70%]"}`}
            setRawmeterial={setRawMaterial}
            onClose={() => {
              setRawMaterial(false);
              setMaterialForm(false);
            }}
            allData={allData}
          >
            <RawMaterial
              addData={addData}
              updateData={updateData}
              SaveBranch={SaveBranch}
              material={material}
              setMaterial={setMaterial}
              setMaterialActive={setMaterialActive}
              materialActive={materialActive}
              allData={allData}
              setMaterialForm={setMaterialForm}
              materialForm={materialForm}
              setMaterialId={setMaterialId}
              materialId={materialId}
            />
          </Modal> */}
          {/* <Modal
            isOpen={isContactPerson}
            widthClass={`${branchForm ? "w-[33%] h-[71%]" : "w-[60%] h-[68%]"}`}
            setIsContactPerson={setIsContactPerson}
            onClose={() => {
              setIsContactPerson(false);
              // setMaterialForm(false)
            }}
            allData={allData}
          >
            <ContactPersonDetails
              partyData={singleData?.data}
              partyId={id}
              contactNumber={contactNumber}
              setContactNumber={setContactNumber}
              contactPersonName={contactPersonName}
              setContactPersonName={setContactPersonName}
              designation={designation}
              setDesignation={setDesignation}
              setDepartment={setDepartment}
              department={department}
              setIsContactPerson={setIsContactPerson}
              setContactPersonEmail={setContactPersonEmail}
              contactPersonEmail={contactPersonEmail}
              branchForm={branchForm}
              refetch={refetch}
              syncFormWithDb={syncFormWithDb}
              alterContactNumber={alterContactNumber}
              setAlterContactNumber={setAlterContactNumber}
              setBranchForm={setBranchForm}
              onClose={() => {
                setIsContactPerson(false);
              }}
            />
          </Modal> */}
          {/* <Modal
            isOpen={formReport}
            onClose={() => setFormReport(false)}
            widthClass={"p-3 h-[70%] w-[70%]"}
          >
            <ArtDesignReport
              // userRole={userRole}
              setFormReport={setFormReport}
              tableWidth="100%"
              formReport={formReport}
              setAttachments={setAttachments}
              attachments={attachments}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
            />
          </Modal> */}

          <div className="h-full flex flex-col bg-[f1f1f0] ">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-3 ">
              <div className="flex items-center gap-2">
                <h2 className="text-md font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Customer/Supplier"
                      : "Customer/Supplier Master"
                    : "Add New Customer/Supplier"}
                </h2>
              </div>

              <div className="flex gap-2">
                <div className="  ">
                  <button
                    onClick={() => {
                      if (name) {
                        setBranchModelOpen(true);
                        setBranchForm(false);
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: `Enter ${
                            isSupplier ? "Supplier Details" : "Customer Details"
                          } `,
                          showConfirmButton: false,
                          timer: 2000,
                        });
                      }
                    }}
                    readOnly={readOnly}
                    className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Branch
                  </button>
                </div>
                <div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm(false);
                        setSearchValue("");
                        setId(false);
                      }}
                      className="px-2 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={saveData}
                      className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                  border border-green-600 flex items-center gap-1 text-xs"
                    >
                      <Check size={14} />
                      {id ? "Update" : "Save"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Basic Details
                    </h3>
                    <div className="grid grid-cols-2">
                      <div className="flex flex-row items-center gap-2 mt-2 mb-2">
                        <div className="flex items-center gap-2 ">
                          <input
                            type="radio"
                            name="type"
                            checked={isClient}
                            onChange={() => handleChange("client")}
                            readOnly={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600 mt-1">
                            Customer
                          </label>
                        </div>
                        <div className="flex flex-row gap-2">
                          <input
                            type="radio"
                            name="type"
                            checked={isSupplier}
                            onChange={() => handleChange("supplier")}
                            readOnly={readOnly}
                          />
                          <label className="block text-xs font-bold text-gray-600 mt-1">
                            Supplier
                          </label>
                        </div>
                        <div className="col-span-4 flex flex-row">
                          {/* {isSupplier && (
                            <div className="w-48">
                              <MultiSelectDropdown
                                // name={"Material List"}
                                options={multiSelectOption(
                                  allData ? allData?.materialData : [],
                                  "name",
                                  "id"
                                )}
                                labelName="name"
                                setSelected={setSelected}
                                selected={selected}
                              />
                            </div>
                          )} */}

                          {/* {isSupplier && (
                            <div className="mt-3 px-3 relative inline-block">
                              <button
                                className="w-7 h-6 border border-green-500 rounded-md mt-2
                hover:bg-green-500 text-green-600 hover:text-white
                transition-colors flex items-center justify-center"
                                onClick={() => setRawMaterial(true)}
                                onMouseEnter={() =>
                                  setTooltipVisibleForMaterial(true)
                                }
                                onMouseLeave={() =>
                                  setTooltipVisibleForMaterial(false)
                                }
                              >
                                <FaPlus className="text-sm w-3 h-4" />
                              </button>

                              {tooltipVisibleForMaterial && (
                                <div className="absolute left-full top-0 ml-2 mt-1 w-56 bg-indigo-800 text-white text-xs rounded p-2 shadow-lg z-10">
                                  <div className="flex items-start">
                                    <FaInfoCircle className="flex-shrink-0 mt-0.5 mr-1" />
                                    <span>Click to add a new Material</span>
                                  </div>
                                  <div className="absolute top-2 -left-1 w-2.5 h-2.5 bg-indigo-800 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                          )} */}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <TextArea
                          name={isSupplier ? "Supplier Name" : "Customer Name"}
                          type="text"
                          value={name}
                          inputClass="h-8"
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
                      </div>
                      <div className="col-span-2">
                        <TextArea
                          name="Alias Name"
                          type="text"
                          inputClass="h-8"
                          value={aliasName}
                          setValue={setAliasName}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="col-span-1">
                        <TextInput
                          name="Party Code"
                          type="text"
                          value={partyCode}
                          setValue={setPartyCode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                      <div className="mt-5 ml-3">
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
                      <div className="mt-5 ml-3"></div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3 ">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Address Details
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2">
                          <TextArea
                            name="Address"
                            inputClass="h-10"
                            value={address}
                            setValue={setAddress}
                            required={true}
                            readOnly={readOnly}
                            d
                            isabled={childRecord.current > 0}
                          />
                        </div>
                        <TextInput
                          name="Land Mark"
                          type="text"
                          value={landMark}
                          setValue={setlandMark}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
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
                          country={country}
                          masterName="CITY MASTER"
                          lastTab={activeTab}
                          value={city}
                          setValue={setCity}
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
                              value={pincode}
                              required={true}
                              setValue={setPincode}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                          </div>
                          <div className="w-64">
                            <TextInput
                              name={"Email"}
                              type="text"
                              value={email}
                              setValue={setEmail}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                            <div></div>
                          </div>
                        </div>
                        <div>
                          <TextInput
                            name={"Contact Number"}
                            type="number"
                            value={contact}
                            setValue={setContact}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[330px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Contact Details
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex flex-row gap-4 mt-2">
                          <div className="w-96">
                            <TextInput
                              name="Contact Person Name"
                              type="text"
                              value={contactPersonName}
                              setValue={setContactPersonName}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              className="focus:ring-2 focus:ring-blue-100 w-10"
                            />
                          </div>
                          {/* <div className="relative inline-block">
                            <button
                              className="w-7 h-6 border border-green-500 rounded-md mt-6
                                            hover:bg-green-500 text-green-600 hover:text-white
                                            transition-colors flex items-center justify-center"
                              disabled={readOnly}
                              onClick={() => {
                                // openAddModal();
                                // setIsDropdownOpen(false);
                                // setEditingItem("new");
                                // setOpenModel(true);
                                setBranchForm(false);
                                setIsContactPerson(true);
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
                          </div> */}
                        </div>
                        <TextInput
                          name="Designation"
                          type="text"
                          value={designation}
                          setValue={setDesignation}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="Department"
                          type="text"
                          value={department}
                          setValue={setDepartment}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <div className="col-span-2">
                          <TextInput
                            name="Email"
                            type="text"
                            value={contactPersonEmail}
                            setValue={setContactPersonEmail}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        <div className="col-span-1">
                          <TextInput
                            name="Contact Number"
                            type="number"
                            value={contactNumber}
                            setValue={setContactNumber}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                        <div className="col-span-1">
                          <TextInput
                            name="Alternative Contact Number"
                            type="number"
                            value={alterContactNumber}
                            setValue={setAlterContactNumber}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            className="focus:ring-2 focus:ring-blue-100 w-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Business Details
                    </h3>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <DropdownInput
                          name="PayTerm"
                          options={dropDownListObject(
                            id
                              ? payTermList?.data
                              : payTermList?.data?.filter(
                                  (item) => item.active
                                ),
                            "name",
                            "id"
                          )}
                          value={payTermDay}
                          setValue={setPayTermDay}
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
                          name="MSME CERTFICATE  No"
                          type="text"
                          value={msmeNo}
                          setValue={setMsmeNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                        <TextInput
                          name="CIN No"
                          type="text"
                          value={cinNo}
                          setValue={setCinNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Bank Details
                    </h3>
                    <div className="space-y-2">
                      <TextInput
                        name="Bank Name"
                        type="text"
                        value={bankname}
                        setValue={setBankName}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        className="focus:ring-2 focus:ring-blue-100 w-10"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <TextInput
                          name="Branch Name"
                          type="text"
                          value={bankBranchName}
                          setValue={setBankBranchName}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="Account Number"
                          type="text"
                          value={accountNumber}
                          setValue={setAccountNumber}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                        <TextInput
                          name="IFSC CODE"
                          type="text"
                          value={ifscCode}
                          setValue={setIfscCode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          className="focus:ring-2 focus:ring-blue-100 w-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200  h-[240px]">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Attchments
                    </h3>
                    <div className="space-y-2">
                      <div className="flex pt-4">
                        <button
                          className="relative w-20 h-7 bg-gray-800    text-white rounded-md shadow-md hover:shadow-xl hover:scale-105 
        transform transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center"
                          onClick={() => setFormReport(true)}
                        >
                          <span className="absolute inset-0 bg-white opacity-10 rounded-md"></span>
                          <Paperclip className="relative z-10 w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
