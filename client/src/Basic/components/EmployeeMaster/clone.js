import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import {
  useGetEmployeeQuery,
  useGetEmployeeByIdQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "../../../redux/services/EmployeeMasterService";
import { useGetCityQuery } from "../../../redux/services/CityMasterService";
import LiveWebCam from "../LiveWebCam";
import { toast } from "react-toastify";
import {
  TextInput,
  DropdownInput,
  TextArea,
  DateInput,
  DisabledInput,
  ToggleButton,
} from "../../../Inputs";

import {
  dropDownListObject,
  dropDownListMergedObject,
} from "../../../Utils/contructObject";
import Modal from "../../../UiComponents/Modal";
import {
  statusDropdown,
  employeeType,
  genderList,
  maritalStatusList,
  bloodList,
} from "../../../Utils/DropdownData";
import moment from "moment";
import { useGetEmployeeCategoryQuery } from "../../../redux/services/EmployeeCategoryMasterService";
import { getCommonParams, viewBase64String } from "../../../Utils/helper";
import SingleImageFileUploadComponent from "../SingleImageUploadComponent";
import EmployeeLeavingForm from "./EmployeeLeavingForm";
import { useGetDepartmentQuery } from "../../../redux/services/DepartmentMasterService";
import { useDispatch } from "react-redux";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Mail,
  Plus,
  Search,
  Table,
  X,
} from "lucide-react";
import Mastertable from "../MasterTable/Mastertable";
import imageDefault from "../../../assets/default-dp.png";

const MODEL = "Employee Master";
export default function Form() {
  const [view, setView] = useState("table");
  const [form, setForm] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [openTable, setOpenTable] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [panNo, setPanNo] = useState("");
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [dob, setDob] = useState("");
  const [chamberNo, setChamberNo] = useState("");
  const [localAddress, setlocalAddress] = useState("");
  const [localCity, setLocalCity] = useState("");
  const [localPincode, setLocalPincode] = useState("");
  const [mobile, setMobile] = useState("");
  const [degree, setDegree] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [salaryPerMonth, setSalaryPerMonth] = useState("");
  const [commissionCharges, setCommissionCharges] = useState("");
  const [gender, setGender] = useState("");
  const [regNo, setRegNo] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [permAddress, setPermAddress] = useState("");
  const [permCity, setPermCity] = useState("");
  const [permPincode, setPermPincode] = useState("");
  const [email, setEmail] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [consultFee, setConsultFee] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscNo, setIfscNo] = useState("");
  const [branchName, setbranchName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeCategory, setEmployeeCategory] = useState("");
  const [permanent, setPermanent] = useState("");
  const [active, setActive] = useState(true);
  const [branchPrefixCategory, setBranchPrefixCategory] = useState("");
  const [leavingForm, setLeavingForm] = useState(false);
  const [leavingDate, setLeavingDate] = useState("");
  const [leavingReason, setLeavingReason] = useState("");
  const [canRejoin, setCanRejoin] = useState("");
  const [rejoinReason, setRejoinReason] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [image, setImage] = useState(null);
  const [newForm, setNewForm] = useState(false);
  const [formHeading, setFormHeading] = "";
  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    finYearId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentFinYear"
    ),
    userId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userId"
    ),
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
  };
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const {
    data: cityList,
    isLoading: cityLoading,
    isFetching: cityFetching,
  } = useGetCityQuery({ params });

  const { data: employeeCategoryList } = useGetEmployeeCategoryQuery({
    params: companyId,
  });

  const { data: departmentList } = useGetDepartmentQuery({ params });
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetEmployeeQuery({ params, searchParams: searchValue });

  const isCurrentEmployeeDoctor = (employeeCategory) =>
    employeeCategoryList.data
      .find((cat) => parseInt(cat.id) === parseInt(employeeCategory))
      ?.name?.toUpperCase() === "DOCTOR";
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetEmployeeByIdQuery(id, { skip: !id });

  const [addData] = useAddEmployeeMutation();
  const [updateData] = useUpdateEmployeeMutation();
  const [removeData] = useDeleteEmployeeMutation();

  const getRegNo = useCallback(() => {
    if (id || isLoading || isFetching) return;

    if (allData?.Regno) {
      setRegNo(allData?.Regno);
    }
  }, [allData, isLoading, isFetching, id]);

  useEffect(getRegNo, id[(getRegNo, id)]);

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setReadOnly(false);
        setPanNo("");
        setName("");
        setFatherName("");
        setDob("");
        setChamberNo("");
        setlocalAddress("");
        setLocalCity("");
        setLocalPincode("");
        setMobile("");
        setDegree("");
        setSpecialization("");
        setSalaryPerMonth("");
        setCommissionCharges("");
        setGender("");
        setRegNo("");
        setJoiningDate("");
        setPermAddress("");
        setPermCity("");
        setPermPincode("");
        setEmail("");
        setMaritalStatus("");
        setConsultFee("");
        setAccountNo("");
        setIfscNo("");
        setbranchName("");
        setBloodGroup("");
        setDepartment("");
        setImage(null);
        setEmployeeCategory("");
        setPermanent("");
        setActive(true);
        setLeavingDate("");
        setLeavingReason("");
        setCanRejoin(false);
        setRejoinReason("");
        return;
      }
      setReadOnly(true);
      setPanNo(data?.panNo || "");
      setName(data?.name || "");
      setFatherName(data?.fatherName || "");
      setDob(data?.dob ? moment.utc(data?.dob).format("YYYY-MM-DD") : "");
      setChamberNo(data?.chamberNo || "");
      setlocalAddress(data?.localAddress || "");
      setLocalCity(data?.localCity?.id || "");
      setLocalPincode(data?.localPincode || "");
      setMobile(data?.mobile || "");
      setDegree(data?.degree || "");
      setSpecialization(data?.specialization || "");
      setSalaryPerMonth(data?.salaryPerMonth || "");
      setCommissionCharges(data?.commissionCharges || "");
      setGender(data?.gender || "");
      setRegNo(data?.regNo || "");
      setJoiningDate(
        data?.joiningDate
          ? moment.utc(data?.joiningDate).format("YYYY-MM-DD")
          : ""
      );
      setPermAddress(data?.permAddress || "");
      setPermCity(data?.permCity?.id || "");
      setPermPincode(data?.permPincode || "");
      setEmail(data?.email || "");
      setMaritalStatus(data?.maritalStatus || "");
      setConsultFee(data?.consultFee || "");
      setAccountNo(data?.accountNo || "");
      setIfscNo(data?.ifscNo || "");
      setbranchName(data?.branchName || "");
      setBloodGroup(data?.bloodGroup || "");
      setDepartment(data?.department?.id || "");
      setImage(data?.imageBase64 ? viewBase64String(data?.imageBase64) : null);
      setEmployeeCategory(data?.employeeCategoryId || "");
      setPermanent(data?.permanent || "");
      setActive(data?.active ? data?.active : true);

      // Employee Leaving Form states
      setLeavingDate(data?.leavingDate || "");
      setLeavingReason(data?.leavingReason || "");
      setCanRejoin(data?.canRejoin || false);
      setRejoinReason(data?.rejoinReason || "");

      secureLocalStorage.setItem(
        sessionStorage.getItem("sessionId") + "currentEmployeeSelected",
        data?.id
      );
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
    panNo,
    name,
    fatherName,
    dob,
    chamberNo,
    localAddress,
    localCity,
    localPincode,
    mobile,
    degree,
    specialization,
    salaryPerMonth,
    commissionCharges,
    gender,
    joiningDate,
    permAddress,
    permCity,
    permPincode,
    email,
    maritalStatus,
    consultFee,
    accountNo,
    ifscNo,
    branchName,
    bloodGroup,
    ...(department && { department }),
    employeeCategoryId: employeeCategory,
    permanent,
    active,
    id,
    leavingReason,
    leavingDate,
    canRejoin,
    rejoinReason,
    regNo,
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      const formData = new FormData();
      for (let key in data) {
        formData.append(key, data[key]);
      }
      if (image instanceof File) {
        formData.append("image", image);
      } else if (!image) {
        formData.append("isDeleteImage", true);
      }
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
      } else {
        returnData = await callback(formData).unwrap();
      }
      setId(returnData.data.id);
      toast.success(text + "Successfully");
      setSearchValue("");
      setStep(1);
      dispatch({
        type: `EmployeeCategoryMaster/invalidateTags`,
        payload: ["Employee Category"],
      });
      dispatch({
        type: `DepartmentMaster/invalidateTags`,
        payload: ["Department"],
      });
      dispatch({
        type: `CityMaster/invalidateTags`,
        payload: ["City/State Name"],
      });
    } catch (error) {
      console.log("handle");
    }
  };
  console.log(employeeCategoryList?.data, "employeeCategoryList?.data");

  const saveData = () => {
    if (!JSON.parse(active)) {
      setLeavingForm(true);
    } else {
      if (id) {
        handleSubmitCustom(updateData, data, "Updated");
      } else {
        handleSubmitCustom(addData, data, "Added");
      }
    }
  };
  const saveDataandExit = async (exitAfterSave = false) => {
    if (!window.confirm("Are you sure save the details ...?")) return;

    try {
      if (id) {
        await handleSubmitCustom(updateData, data, "Updated");
      } else {
        await handleSubmitCustom(addData, data, "Added");
      }
      if (!exitAfterSave) {
        onNew();
      } else {
        setForm(false);
        setId("");
      }
    } catch (error) {
      console.error("Save failed:", error);
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
        dispatch({
          type: `EmployeeCategoryMaster/invalidateTags`,
          payload: ["Employee Category"],
        });
        dispatch({
          type: `DepartmentMaster/invalidateTags`,
          payload: ["Department"],
        });
        dispatch({
          type: `cityMaster/invalidateTags`,
          payload: ["City/State Name"],
        });
        toast.success("Deleted Successfully");
        setForm(false);
        setSearchValue("");
        setStep(1);
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
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const handleKeyNext = (e, nextRef) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };
  const onNew = () => {
    setId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setPanNo("");
    setName("");
    setFatherName("");
    setDob("");
    setChamberNo("");
    setlocalAddress("");
    setLocalCity("");
    setLocalPincode("");
    setMobile("");
    setDegree("");
    setSpecialization("");
    setSalaryPerMonth("");
    setCommissionCharges("");
    setGender("");
    setRegNo("");
    setJoiningDate("");
    setPermAddress("");
    setPermCity("");
    setPermPincode("");
    setEmail("");
    setMaritalStatus("");
    setConsultFee("");
    setAccountNo("");
    setIfscNo("");
    setbranchName("");
    setBloodGroup("");
    setDepartment("");
    setImage(null);
    setEmployeeCategory("");
    setPermanent("");
    setActive(true);
    setLeavingDate("");
    setLeavingReason("");
    setCanRejoin(false);
    setRejoinReason("");
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }
  const tableHeaders = [
    "S.NO",
    "Employee Id",
    "Employee name",
    "Employee Category",
    "Gender",
    "Contact",
    "Email",
    "Employee status",
  ];
  const tableDataNames = [
    "index+1",
    "dataObj.regNo",
    "dataObj.name",
    "dataObj?.EmployeeCategory?.name",
    "dataObj?.gender",
    "dataObj?.mobile",
    "dataObj?.email",
    "dataObj.active ? ACTIVE : INACTIVE",
  ];
  const submitLeavingForm = () => {
    console.log("sdfsdfsdfsdf");
    if (id) {
      console.log("called id");
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      console.log("called no id");
      handleSubmitCustom(addData, data, "Added");
    }
    setLeavingForm(false);
  };

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const validateStep = () => {
    let newErrors = {};
    if (step === 1) {
      if (!data.employeeCategoryId)
        newErrors.employeeCategory = "Employee Category is required";
      if (!data.name) newErrors.name = "Name is required";
      if (!data.joiningDate) newErrors.joiningDate = "Joining Date is required";
      if (!data.department) newErrors.department = "Select a department";
    } else if (step === 2) {
      if (!data.mobile) newErrors.mobile = "Mobile No is required";
    } else if (step === 3) {
      if (!data.dob) newErrors.dob = "Date of Birth is required";
      if (!data.gender) newErrors.gender = "Gender is required";
    } else if (step === 4) {
      if (!data.localAddress)
        newErrors.localAddress = "Local Address is required";
      if (!data.localPincode)
        newErrors.localPincode = "Local Pincode is required";
      if (!data.localCity) newErrors.localCity = "Local City is required";
    } else if (step === 6) {
      if (!data.active) newErrors.active = "Set Status";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div onKeyDown={handleKeyDown} className="p-1 ">
      {/* Header Section */}
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h1 className="text-2xl font-bold text-gray-800">Employee Master</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setForm(true);
              onNew();
              setNewForm(true);
            }}
            className="bg-white border text-xs border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Employee
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("table")}
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                view === "table"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Table size={16} />
              Table
            </button>
            <button
              onClick={() => setView("card")}
              className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${
                view === "card"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutGrid size={16} />
              Cards
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[f1f1f0] rounded-xl shadow overflow-hidden">
        <div className="pt-2">
          {view === "table" ? (
            <Mastertable
              header={`Employees list`}
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              onDataClick={onDataClick}
              tableHeaders={tableHeaders}
              tableDataNames={tableDataNames}
              data={allData?.data}
              setReadOnly={setReadOnly}
              deleteData={deleteData}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {allData?.data?.map((employee, index) => (
                <div
                  key={index}
                  onClick={() => onDataClick(employee.id)}
                  className={`border rounded-lg text-bold overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${
                    employee?.active ? "border-green-200" : "border-red-200"
                  }`}
                >
                  <div
                    className={`p-4 ${
                      employee?.active ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <img
                        src={employee?.imageBase64 || imageDefault}
                        alt="Profile"
                        className={`w-12 h-12 object-cover rounded-full border-2 ${
                          employee?.active
                            ? "border-green-500"
                            : "border-red-500"
                        }`}
                      />
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">
                          {employee?.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {employee?.regNo}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Department</p>
                        <p className="font-medium">
                          {employee?.department?.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p
                          className={`font-medium ${
                            employee?.active ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {employee?.active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mobile</p>
                        <p className="font-medium">{employee?.mobile || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium truncate">
                          {employee?.email || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[95%] max-w-6xl h-[85vh]"}
          onClose={() => {
            setForm(false);
            setErrors({});
          }}
        >
          <div className="h-full flex flex-col bg-[f1f1f0]">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                    {id ? (!readOnly?"Edit Employee": "Employee Master") : "Add New Employee"}
                </h2>
                {console.log(id,"id")
                }
                {regNo && (
                  <span
                    className={`px-2 py-0.5 text-xs text-bold rounded-full ${
                      active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {regNo}
                  </span>
                )}
              </div>
             
              {/* <button type="button" className="px-3 py-1  text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600 text-xs rounded" onClick={() => setReadOnly(false)}> Edit</button> */}
              <div className="flex gap-2">
                <div>
                  {!readOnly && (
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
                  )}
                </div>
                <div className="flex gap-2">
                  {!readOnly && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveData}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
      border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update And Add" : "Save And Add"}
                      </button>

                      <button
                        type="button"
                        onClick={saveDataandExit}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
      border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update & Exit" : "Save & Exit"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                <div className="lg:col-span-3 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <SingleImageFileUploadComponent
                      setWebCam={setCameraOpen}
                      disabled={readOnly}
                      image={image}
                      setImage={setImage}
                      className="mb-3"
                    />

                    <div className="space-y-2">
                      <TextInput
                        ref={input1Ref}
                        name="Full Name"
                        value={name}
                        setValue={setName}
                        required={true}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                        onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                      />
                      {errors.name && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.name}
                        </span>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                         <DateInput
                        name="Date of Birth"
                        value={dob}
                        setValue={setDob}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                      {errors.dob && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.dob}
                        </span>
                      )}
                        <div>
                          <DropdownInput
                            ref={input2Ref}
                            name="Gender"
                            options={genderList}
                            value={gender}
                            setValue={setGender}
                            required
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                          {errors.gender && (
                            <span className="text-red-500 text-xs">
                              {errors.gender}
                            </span>
                          )}
                        </div>

                      </div>

                     
                        <div>
                          <DropdownInput
                            name="Blood Group"
                            options={bloodList}
                            value={bloodGroup}
                            setValue={setBloodGroup}
                            required
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                          {errors.bloodGroup && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.bloodGroup}
                            </span>
                          )}
                        </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Employment Status
                    </h3>
                    <div className="space-y-2">
                      <ToggleButton
                        name="Status"
                        options={statusDropdown}
                        value={active}
                        setActive={setActive}
                        required={true}
                        readOnly={readOnly}
                      />
                      {errors.active && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.active}
                        </span>
                      )}

                      {!active && (
                        <button
                          type="button"
                          onClick={() => setLeavingForm(true)}
                          className="text-xs text-red-600 hover:text-red-800 underline"
                        >
                          Add Leaving Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Official Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <DropdownInput
                          ref={input3Ref}
                          name="Employee Category"
                          options={dropDownListObject(
                            id
                              ? employeeCategoryList?.data
                              : employeeCategoryList?.data?.filter(
                                  (item) => item.active
                                ),
                            "name",
                            "id"
                          )}
                          value={employeeCategory}
                          setValue={(value) => setEmployeeCategory(value)}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, null)}
                        />
                        {errors.employeeCategory && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.employeeCategory}
                          </span>
                        )}
                      </div>

                      <div>
                        <DropdownInput
                          name="Department"
                          options={dropDownListObject(
                            id
                              ? departmentList?.data
                              : departmentList?.data?.filter(
                                  (item) => item.active
                                ),
                            "name",
                            "id"
                          )}
                          value={department}
                          setValue={setDepartment}
                          readOnly={readOnly}
                          required={true}
                          disabled={childRecord.current > 0}
                        />
                        {errors.department && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.department}
                          </span>
                        )}
                      </div>

                      <div className="">
                        <DateInput
                          name="Joining Date"
                          value={joiningDate}
                          setValue={setJoiningDate}
                          required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.joiningDate && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.joiningDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Additional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <TextInput
                          name="Father Name"
                          value={fatherName}
                          setValue={setFatherName}
                          required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.fatherName && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.fatherName}
                          </span>
                        )}
                      </div>

                      <div>
                        <DropdownInput
                          name="Marital Status"
                          options={maritalStatusList}
                          value={maritalStatus}
                          setValue={setMaritalStatus}
                          required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.maritalStatus && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.maritalStatus}
                          </span>
                        )}
                      </div>

                      <div>
                        <TextInput
                          name="Pan No"
                          value={panNo}
                          setValue={setPanNo}
                          required
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        {errors.panNo && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.panNo}
                          </span>
                        )}
                      </div>

                      <div>
                        <TextInput
                          name="Degree"
                          value={degree}
                          setValue={setDegree}
                          required
                          readOnly={readOnly}
                        />
                        {errors.degree && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.degree}
                          </span>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <TextInput
                          name="Specialization"
                          value={specialization}
                          setValue={setSpecialization}
                          required
                          readOnly={readOnly}
                        />
                        {errors.specialization && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Bank Details
                    </h3>
                    <div className="space-y-2">
                      <TextInput
                        name="Account No"
                        type="number"
                        value={accountNo}
                        setValue={setAccountNo}
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <TextInput
                          name="IFSC No"
                          value={ifscNo}
                          setValue={setIfscNo}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />

                        <TextInput
                          name="Branch Name"
                          value={branchName}
                          setValue={setbranchName}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-md border border-gray-200 ">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex flex-wrap">
                        <div className="grid grid-cols-3 gap-2 items-start">
                          <TextInput
                            name="Mobile No"
                            type="number"
                            value={mobile}
                            width="w-24" // Tailwind class to reduce width
                            setValue={setMobile}
                            required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                          />
                          {errors.mobile && (
                            <span className="text-red-500 text-xs ml-1 col-span-2">
                              {errors.mobile}
                            </span>
                          )}
                          <div className="col-span-2">
                            <TextInput
                              name="Email Id"
                              type="email"
                              value={email}
                              setValue={setEmail}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                            {errors.email && (
                              <span className="text-red-500 text-xs ml-1">
                                {errors.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <TextArea
                        name="Address"
                        rows="2"
                        value={localAddress}
                        setValue={setlocalAddress}
                        required
                        readOnly={readOnly}
                        disabled={childRecord.current > 0}
                      />
                      {errors.localAddress && (
                        <span className="text-red-500 text-xs ml-1">
                          {errors.localAddress}
                        </span>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <TextInput
                          name="Pincode"
                          type="number"
                          value={permPincode}
                          setValue={setPermPincode}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                        <DropdownInput
                          name="City/State"
                          options={dropDownListMergedObject(
                            (cityList?.data || []).filter(
                              (item) => id || item.active
                            ),
                            "name",
                            "id"
                          )}
                          value={permCity}
                          setValue={setPermCity}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Modal isOpen={cameraOpen} onClose={() => setCameraOpen(false)}>
            <LiveWebCam
              picture={image}
              setPicture={setImage}
              onClose={() => setCameraOpen(false)}
            />
          </Modal>

          <Modal isOpen={leavingForm} onClose={() => setLeavingForm(false)}>
            <EmployeeLeavingForm
              leavingReason={leavingReason}
              setLeavingReason={setLeavingReason}
              leavingDate={leavingDate}
              setLeavingDate={setLeavingDate}
              canRejoin={canRejoin}
              setCanRejoin={setCanRejoin}
              rejoinReason={rejoinReason}
              setRejoinReason={setRejoinReason}
              onSubmit={submitLeavingForm}
              onClose={() => setLeavingForm(false)}
            />
          </Modal>
        </Modal>
      )}
    </div>
  );
}
