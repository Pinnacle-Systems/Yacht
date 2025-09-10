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
  ReusableTable,
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
  employeeType as EmployeeType,
  genderList,
  maritalStatusList,
  bloodList,
  common,
  SalaryMethod,
  married,
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
import { HiPlus } from "react-icons/hi";
import { useGetdesignationQuery } from "../../../redux/services/DesignationMasterService";
import { useGetShiftTemplateMasterQuery } from "../../../redux/services/ShiftTemplateMaster";
import { useGetStateQuery } from "../../../redux/services/StateMasterService";
import { useGetCountriesQuery } from "../../../redux/services/CountryMasterService";
import { log } from "util";
import Swal from "sweetalert2";

const MODEL = "Employee Master";
export default function Form() {
  const [view, setView] = useState("table");
  const [form, setForm] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [openTable, setOpenTable] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [panNo, setPanNo] = useState("");
  const [firstName, setFirstName] = useState("");
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

  const [maritalStatus, setMaritalStatus] = useState("");
  const [consultFee, setConsultFee] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscNo, setIfscNo] = useState("");
  const [branchName, setBranchName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  // const [department, setDepartment] = useState("");
  const [employeeCategoryId, setEmployeeCategoryId] = useState("");
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

  const [employeeType, setEmployeeType] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [disability, setDisability] = useState("");
  const [identificationMark, setIdentificationMark] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [payCategory, setPayCategory] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [desiginationId, setDesignationId] = useState("");
  const [shiftTemplateId, setShiftTemplateId] = useState("");
  const [salaryMethod, setSalaryMethod] = useState("");
  const [pf, setPf] = useState("");
  const [religion, setReligion] = useState("");
  const [esiNo, setEsiNo] = useState("");
  const [pfNo, setPfNo] = useState("");
  const [uanNo, setUanNo] = useState("");
  const [salary, setSalary] = useState("");
  const [esi, setEsi] = useState("");
  const [email, setEmail] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [bankDetails, setBankDetails] = useState([]);
  const [educationDetails, setEducationDetails] = useState([]);
  const [familyDetails, setFamilyDetails] = useState([]);

  const [presentAddress, setPresentAddress] = useState({
    address: "",
    cityId: "",
    village: "",
    stateId: "",
    countryId: "",
    pincode: "",
    mobile: "",
  });

  const [permanentAddress, setPermanentAddress] = useState({
    address: "",
    cityId: "",
    village: "",
    stateId: "",
    countryId: "",
    pincode: "",
    mobile: "",
  });
  const [sameAsPresent, setSameAsPresent] = useState(false);
  // const [esi, setEsi] = useState("")

  const childRecord = useRef(0);
  const dispatch = useDispatch();
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    // finYearId: secureLocalStorage.getItem(
    //   sessionStorage.getItem("sessionId") + "currentFinYear"
    // ),
    // userId: secureLocalStorage.getItem(
    //   sessionStorage.getItem("sessionId") + "userId"
    // ),
    // branchId: secureLocalStorage.getItem(
    //   sessionStorage.getItem("sessionId") + "currentBranchId"
    // ),
  };
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const { data: cityList } = useGetCityQuery({ params });

  const { data: stateList } = useGetStateQuery({ params });

  const { data: countryList } = useGetCountriesQuery({ params });

  const { data: employeeCategoryList } = useGetEmployeeCategoryQuery({
    params: companyId,
  });

  const { data: desigination } = useGetdesignationQuery({ params });

  const { data: department } = useGetDepartmentQuery({ params });
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetEmployeeQuery({ params });

  console.log(allData, "allData");

  const { data: shiftTemplate } = useGetShiftTemplateMasterQuery({ params });

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
      // Basic Info
      setEmployeeType(data?.employeeType);
      setFirstName(data?.firstName || "");
      setMiddleName(data?.middleName || "");
      setLastName(data?.lastName || "");
      setFatherName(data?.fatherName || "");
      setMotherName(data?.motherName || "");
      setGender(data?.gender || "");
      setMaritalStatus(data?.maritalStatus || "");
      setDob(data?.dob ? moment.utc(data?.dob).format("YYYY-MM-DD") : "");
      setIdentificationMark(data?.identificationMark || "");
      setDisability(data?.disability || "");
      setHeight(data?.height || "");
      setWeight(data?.weight || "");
      setBloodGroup(data?.bloodGroup);

      // IDs & Numbers
      setPanNo(data?.panNo || "");
      setAadharNo(data?.aadharNo || "");
      setEsiNo(data?.esiNo || "");
      setPfNo(data?.pfNo || "");
      setUanNo(data?.uanNo || "");
      setIdNumber(data?.idNumber || "");
      setRegNo(data?.regNo || "");
      setReligion(data?.religion);

      setEmail(data?.email || "");

      // Employment Info
      setDepartmentId(data?.departmentId || "");
      setShiftTemplateId(data?.shiftTemplateId || "");
      setEmployeeCategoryId(data?.employeeCategoryId || "");
      setPayCategory(data?.payCategory || "");
      setSalary(data?.salary || "");
      setSalaryMethod(data?.salaryMethod || "");
      setJoiningDate(
        data?.joiningDate
          ? moment.utc(data?.joiningDate).format("YYYY-MM-DD")
          : ""
      );
      setDesignationId(data?.designationId);
      setLeavingDate(
        data?.leavingDate
          ? moment.utc(data?.leavingDate).format("YYYY-MM-DD")
          : ""
      );
      setPf(data?.pf);
      setEsi(data?.esi);
      setLeavingReason(data?.leavingReason || "");
      setCanRejoin(data?.canRejoin || false);
      setRejoinReason(data?.rejoinReason || "");
      setActive(data?.active !== undefined ? data?.active : true);

      // Contact Info (Present)
      // For Present Address
      setPresentAddress((prev) => ({
        ...prev,
        address: data?.presentAddress || "",
        cityId: data?.presentCityId || "",
        pincode: data?.presentPincode || "",
        stateId: data?.presentStateId || "",
        countryId: data?.presentCountryId || "",
        mobile: data?.presentMobile || "",
        village: data?.presentVillage || "",
      }));

      // For Permanent Address
      setPermanentAddress((prev) => ({
        ...prev,
        address: data?.permanentAddress || "",
        cityId: data?.permanentCityId || "",
        pincode: data?.permanentPincode || "",
        mobile: data?.permanentMobile || "",
        stateId: data?.permanentStateId || "",
        countryId: data?.permanentCountryId || "",
        village: data?.permanentVillage || "",
      }));

      // Other Info

      // setBranchId(data?.branchId || "");
      setImage(data?.imageBase64 ? viewBase64String(data.imageBase64) : null);

      // setBankDetails(data?.EmployeeBankDetails)

      setBankDetails(
        (data?.EmployeeBankDetails || [])?.map((b, i) => ({
          Sno: i + 1,
          bankName: b.bankName || "",
          branchName: b.branchName || "",
          accountNumber: b.accountNumber || "",
          ifscCode: b.ifscCode || "",
        }))
      );

      setEducationDetails(
        (data?.EmployeeEducationdetails || [])?.map((e, i) => ({
          Sno: i + 1,
          courseName: e.courseName || "",
          universityName: e.universityName || "",
          institutionName: e.institutionName || "",
          yearOfPass: e.yearOfPass || "",
        }))
      );

      setFamilyDetails(
        data?.EmployeeFamilyDetails?.map((f, i) => ({
          Sno: i + 1,
          name: f.name || "",
          dob: f.dob ? moment.utc(f.dob).format("YYYY-MM-DD") : "",
          age: f.age || "",
          relationShip: f.relationShip || "",
          occupation: f.occupation || "",
          nominee: f.nominee || "",
        }))
      );

      // Save selected employee ID
      secureLocalStorage.setItem(
        sessionStorage.getItem("sessionId") + "currentEmployeeSelected",
        data?.id
      );
    },
    [id]
  );

  const cleanData = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(cleanData); // process each item
    }
    if (!obj || typeof obj !== "object") return obj;

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (typeof value === "string") {
          // Remove surrounding quotes and any extra quotes inside
          let cleaned = value.replace(/^"+|"+$/g, ""); // remove leading/trailing quotes
          cleaned = cleaned.replace(/"+/g, ""); // remove remaining quotes inside
          return [key, cleaned];
        } else if (typeof value === "object" && value !== null) {
          return [key, cleanData(value)]; // recurse
        }
        return [key, value];
      })
    );
  };

  useEffect(() => {
    if (singleData?.data) {
      const cleanedData = cleanData(singleData?.data);
      console.log(cleanedData, "cleanedData");

      syncFormWithDb(cleanedData);
    }
  }, [singleData, syncFormWithDb]);

  console.log(singleData, "single");

  const data = {
    branchId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
    employeeType,
    firstName,
    middleName,
    lastName,
    fatherName,
    motherName,
    dob,
    gender,
    disability,
    identificationMark,

    bloodGroup,
    maritalStatus,
    height,
    weight,

    joiningDate,
    departmentId,
    employeeCategoryId,
    payCategory,
    idNumber,
    desiginationId,
    shiftTemplateId,
    pf,
    esi,
    salary,
    salaryMethod,

    religion,
    aadharNo,
    panNo,
    esiNo,
    pfNo,
    uanNo,
    email,

    presentAddress,
    permanentAddress: sameAsPresent ? presentAddress : permanentAddress,

    // chamberNo,
    // localAddress,
    // localCity,
    // localPincode,
    // mobile,
    // degree,
    // specialization,
    // salaryPerMonth,
    // commissionCharges,
    // permAddress,
    // permCity,
    // permPincode,

    // consultFee,
    // accountNo,
    // ifscNo,
    // branchName,

    // permanent,
    // active,
    // id,
    // leavingReason,
    // leavingDate,
    // canRejoin,
    // rejoinReason,
    // regNo,

    bankDetails,
    educationDetails,
    familyDetails,
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      const formData = new FormData();
      for (let key in data) {
        formData.append(
          key,
          typeof data[key] === "object" && data[key] !== null
            ? JSON.stringify(data[key])
            : data[key]
        );
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
      setForm(false);
      Swal.fire({
        icon: "success",
        title: `${text || "saved"}   Successfully`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.data?.message || "Something went wrong!",
      });
      console.log("handle");
    }
  };
  console.log(employeeCategoryList?.data, "employeeCategoryList?.data");
  const validateData = (data) => {
    console.log(data, "data--");

    if (
      data?.firstName &&
      data?.departmentId &&
      data?.desiginationId &&
      data?.dob &&
      data?.joiningDate &&
      data?.shiftTemplateId
    ) {
      return true;
    }
    return false;
  };
  const saveData = () => {
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
    setId("");
    setForm(true)
    
    
  };
  const saveDataandExit = async (exitAfterSave = false) => {
    if (!validateData(data)) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Please fill all required fields...!",
      });
      return;
    }
   
      if (id) {
        await handleSubmitCustom(updateData, data, "Updated");
      } else {
        await handleSubmitCustom(addData, data, "Added");
      }
      setId('')
     setForm(false)
   
  };

  const deleteData = async (id) => {
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

        setForm(false);
        Swal.fire({
          icon: "success",
          title: "Deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setSearchValue("");
        setStep(1);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Delete Failed",
          text: error?.data?.message || "Something went wrong!",
        });
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
    setStep("Basic Details");
    // Basic Info
    setEmployeeType("");
    setSearchValue("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setFatherName("");
    setMotherName("");
    setGender("");
    setDob(null); // better than empty string
    setIdentificationMark("");
    setDisability("");
    setHeight("");
    setWeight("");

    setMaritalStatus("");
    setRegNo("");
    setBloodGroup("");

    // Employment Info
    setShiftTemplateId("");
    setPf("");
    setEsi("");
    setSalary("");
    setSalaryMethod("");
    setSalaryPerMonth("");
    setCommissionCharges("");
    setDepartmentId("");
    setEmployeeCategoryId("");
    setActive(true);
    setJoiningDate(null);
    setLeavingDate(null);
    setLeavingReason("");
    setCanRejoin(false);
    setRejoinReason("");
    setDesignationId("");
    setEmployeeCategoryId("");

    setPayCategory("");
    setIdNumber("");

    // Contact Info
    // fixed camelCase
    setLocalCity("");
    setLocalPincode("");
    setMobile("");
    setPermAddress("");
    setPermCity("");
    setPermPincode("");
    setPresentAddress([
      {
        address: "",
        cityId: "",
        village: "",
        stateId: "",
        countryId: "",
        pincode: "",
        mobile: "",
      },
    ]);
    setSameAsPresent(false);
    setPermanentAddress([
      {
        address: "",
        cityId: "",
        village: "",
        stateId: "",
        countryId: "",
        pincode: "",
        mobile: "",
      },
    ]);

    // Personal Info
    setAadharNo("");
    setEsiNo("");
    setPfNo("");
    setUanNo("");
    setPanNo("");
    setReligion("");
    setEmail("");

    setBankDetails([
      {
        Sno: "",
        bankName: "",
        branchName: "",
        accountNumber: "",
        ifscCode: "",
      },
    ]);

    // Education & Family Info
    setEducationDetails([
      {
        Sno: "",
        courseName: "",
        universityName: "",
        institutionName: "",
        yearOfPass: "",
      },
    ]);
    setFamilyDetails([
      {
        Sno: "",
        name: "",
        dob: null, // better as null
        age: "",
        relationShip: "",
        occupation: "",
        nominee: "",
      },
    ]);

    // Misc
    setImage(null);
    setConsultFee("");
  };

  const submitLeavingForm = () => {
    if (id) {
      console.log("called id");
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      console.log("called no id");
      handleSubmitCustom(addData, data, "Added");
    }
    setLeavingForm(false);
  };

  const [step, setStep] = useState("Basic Details");
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

  const handleTabClick = (tabNumber) => {
    // if (tabNumber < step || validateStep()) {
    // if (tabNumber < step) {

    setStep(tabNumber);
    // }
  };

  console.log(familyDetails, "familyDetails");

  useEffect(() => {
    if (bankDetails?.length >= 1) return;
    setBankDetails([
      {
        Sno: "",
        bankName: "",
        branchName: "",
        acountNumber: "",
        ifscCode: "",
      },
    ]);
  }, []);
  useEffect(() => {
    if (educationDetails?.length >= 1) return;
    setEducationDetails([
      {
        Sno: "",
        courseName: "",
        universityName: "",
        institutionName: "",
        yearOfPass: "",
      },
    ]);
  }, []);
  useEffect(() => {
    if (familyDetails?.length >= 1) return;
    setFamilyDetails([
      {
        Sno: "",
        name: "",
        dob: "",
        age: "",
        relationShip: "",
        occupation: "",
        nominee: "",
      },
    ]);
  }, []);

  function addNewRow() {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setBankDetails((prev) => [
      ...prev,

      {
        Sno: "",
        bankName: "",
        branchName: "",
        acountNumber: "",
        ifscCode: "",
      },
    ]);
  }
  function addEducationNewRow() {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setEducationDetails((prev) => [
      ...prev,

      {
        Sno: "",
        courseName: "",
        universityName: "",
        institutionName: "",
        yearOfPass: "",
      },
    ]);
  }
  function addFamilyNewRow() {
    if (readOnly) return toast.info("Turn on Edit Mode...!!!");
    setFamilyDetails((prev) => [
      ...prev,

      {
        Sno: "",
        name: "",
        dob: "",
        age: "",
        relationShip: "",
        occupation: "",
        nominee: "",
      },
    ]);
  }

  function handleBankDetailsChange(index, field, value) {
    const newBlend = structuredClone(bankDetails);
    newBlend[index][field] = value;
    setBankDetails(newBlend);
  }
  function handleEDucationDetailsChange(index, field, value) {
    const newBlend = structuredClone(educationDetails);
    newBlend[index][field] = value;
    setEducationDetails(newBlend);
  }
  function handleFamilyDetailsChange(index, field, value) {
    const newBlend = structuredClone(familyDetails);
    newBlend[index][field] = value;
    setFamilyDetails(newBlend);
  }

  function deleteRow(rowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setBankDetails((prev) => {
      const updated = structuredClone(prev); // or [...prev] if deep clone is not needed
      updated.splice(rowIndex, 1);
      return updated;
    });

    console.log("bankDetails updated after delete");
  }
  function deleteEducationRow(rowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setEducationDetails((prev) => {
      const updated = structuredClone(prev); // or [...prev] if deep clone is not needed
      updated.splice(rowIndex, 1);
      return updated;
    });

    console.log("EducationDetails updated after delete");
  }
  function deleteFamilyRow(rowIndex) {
    if (readOnly) return toast.error("Turn on Edit Mode...");

    setFamilyDetails((prev) => {
      const updated = structuredClone(prev);
      updated.splice(rowIndex, 1);
      return updated;
    });

    console.log("FamilyDetails updated after delete");
  }
  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
    console.log("view");
    setStep("Basic Details");
  };
  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
    console.log("Edit");
    setStep("Basic Details");
  };
  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: "text-gray-900 w-12  text-center",
    },

    {
      header: "Employee Name",
      accessor: (item) => item?.firstName || "",
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900 text-left pl-2 uppercase w-72",
    },
    {
      header: "ID Number",
      accessor: (item) => item?.idNumber,
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900  text-left pl-2 uppercase w-72",
    },
    {
      header: "Department",
      accessor: (item) => item?.department?.name,
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900  text-left pl-2 uppercase w-72",
    },
    {
      header: "Designation",
      accessor: (item) => item?.designation?.name,
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900  text-left pl-2 uppercase w-72",
    },
    {
      header: "Mobile",
      accessor: (item) => item?.permanentMobile,
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900 pr-2 text-right uppercase w-36",
    },
    {
      header: "Email",
      accessor: (item) => item?.email,
      //   cellClass: () => " text-gray-900",
      className: "text-gray-900 text-center uppercase w-80",
    },

    // {
    //   header: "",
    //   accessor: (item) => "",
    //     cellClass: () => "font-medium text-gray-900",
    //   className: "font-medium text-gray-900 uppercase w-[15%]",
    // },
  ];
  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);
    if (checked) {
      setPermanentAddress({ ...presentAddress }); // copy all values
    } else {
      setPermanentAddress({
        address: "",
        cityId: "",
        village: "",
        stateId: "",
        countryId: "",
        pincode: "",
        mobile: "",
      }); // clear when unchecked
    }
  };
  console.log(presentAddress, "presentAddress");

  console.log(permanentAddress, "permanentAddress");

  const handlePresentChange = (field, value) => {
    setPresentAddress((prev) => {
      const updated = { ...prev, [field]: value };

      if (sameAsPresent) {
        setPermanentAddress(updated);
      }
      return updated;
    });
  };

  const handlePermanentChange = (field, value) => {
    setPermanentAddress((prev) => {
      const updated = { ...prev, [field]: value };

      return updated;
    });
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
            className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            + Add New Employee
          </button>
          {/* <div className="flex items-center gap-2">
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
          </div> */}
        </div>
      </div>

      <div className="bg-white w-full rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={deleteData}
          itemsPerPage={10}
        />
      </div>

      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[90%]  h-[85%]"}
          onClose={() => {
            setForm(false);
            setErrors({});
            setId("");
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white mt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Employee Master
                </h2>

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

              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                        setReadOnly(false);
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
                    >
                      Edit
                    </button>
                  )}
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
                        {id ? "Update " : "Save "}
                      </button>

                      {/* <button
                        type="button"
                        onClick={saveDataandExit}
                        className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
      border border-green-600 flex items-center gap-1 text-xs"
                      >
                        <Check size={14} />
                        {id ? "Update & Exit" : "Save & Exit"}
                      </button> */}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1  p-3 h-[100%]">
              <div className="flex text-blue-600 text-[14px] gap-x-1">
                {[
                  "Basic Details",
                  "Employment Details",
                  "Personal Details",
                  "Contact Details",
                  "Bank Details",
                  "Education Details",
                  "Family Details",
                ].map((tabNumber) => (
                  <button
                    key={tabNumber}
                    onClick={() => handleTabClick(tabNumber)}
                    className={`px-3 py-1 field-text border-b-2 rounded-t-md transition-colors duration-200
                ${
                  step === tabNumber
                    ? "border-b-2 border-secondary text-secondary font-semibold bg-white"
                    : "border-b-2 border-transparent text-gray-500 hover:border-secondary hover:text-secondary"
                }`}
                  >
                    {tabNumber}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-2 h-[90%] mt-2 overflow-y-auto">
                {step === "Basic Details" && (
                  <div className=" bg-white p-3 rounded-md border border-gray-200 overflow-y-auto">
                    {/* <h1 className=" text-gray-800 mb-2 ">Basic Details</h1> */}
                    <div className="grid grid-cols-6 gap-4 ">
                      <div className="col-span-1">
                        <DropdownInput
                          ref={input1Ref}
                          name="Employee Type"
                          value={employeeType}
                          setValue={setEmployeeType}
                          options={EmployeeType}
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
                      </div>
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="First Name"
                          value={firstName}
                          setValue={setFirstName}
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
                      </div>{" "}
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Middle Name"
                          value={middleName}
                          setValue={setMiddleName}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Last Name"
                          value={lastName}
                          setValue={setLastName}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Father Name"
                          value={fatherName}
                          setValue={setFatherName}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Mother Name"
                          value={motherName}
                          setValue={setMotherName}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <DateInput
                          ref={input1Ref}
                          name="Date of Birth"
                          value={dob}
                          setValue={setDob}
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
                      </div>{" "}
                      <div className="col-span-1">
                        <DropdownInput
                          ref={input1Ref}
                          name="Gender"
                          value={gender}
                          setValue={setGender}
                          options={genderList}
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
                      </div>{" "}
                      <div className="col-span-1">
                        <DropdownInput
                          ref={input1Ref}
                          name="Disability"
                          value={disability}
                          setValue={setDisability}
                          required={true}
                          readOnly={readOnly}
                          options={common}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Identification Mark"
                          value={identificationMark}
                          setValue={setIdentificationMark}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <DropdownInput
                          ref={input1Ref}
                          name="Blood Group"
                          value={bloodGroup}
                          setValue={setBloodGroup}
                          options={bloodList}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <DropdownInput
                          ref={input1Ref}
                          name="Marital Status"
                          value={maritalStatus}
                          setValue={setMaritalStatus}
                          // required={true}
                          options={married}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Height in Cms"
                          value={height}
                          setValue={setHeight}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Weight in Kgs"
                          value={weight}
                          setValue={setWeight}
                          // required={true}
                          readOnly={readOnly}
                          disabled={childRecord.current > 0}
                          onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                        />
                        {errors.name && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.name}
                          </span>
                        )}
                      </div>{" "}
                    </div>
                  </div>
                )}
                {step === "Employment Details" && (
                  <div className="flex flex-col  gap-4  h-full">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      {/* <h3 className="font-medium text-gray-800 mb-2 text-sm">
                        Employment Details
                      </h3> */}
                      <div className="grid grid-cols-5 md:grid-cols-5 gap-2">
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
                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name=" Department"
                            value={departmentId}
                            setValue={setDepartmentId}
                            options={dropDownListObject(
                              department?.data,
                              "name",
                              "id"
                            )}
                            // required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />
                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name="Employee Category"
                            value={employeeCategoryId}
                            setValue={setEmployeeCategoryId}
                            options={dropDownListObject(
                              employeeCategoryList?.data,
                              "name",
                              "id"
                            )}
                            // required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />
                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>
                        <div className="col-span-1">
                          <TextInput
                            ref={input1Ref}
                            name="Pay Category"
                            value={payCategory}
                            setValue={setPayCategory}
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
                        </div>
                        <div className="col-span-1">
                          <TextInput
                            ref={input1Ref}
                            name="Id Card Number"
                            value={idNumber}
                            setValue={setIdNumber}
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
                        </div>

                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name=" Designation"
                            value={desiginationId}
                            setValue={setDesignationId}
                            options={dropDownListObject(
                              desigination?.data,
                              "name",
                              "id"
                            )}
                            // required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />
                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name="Shift Template"
                            value={shiftTemplateId}
                            setValue={setShiftTemplateId}
                            options={dropDownListObject(
                              shiftTemplate?.data,
                              "docId",
                              "id"
                            )}
                            // required={true}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />
                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>
                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name="PF (Y/N)"
                            value={pf}
                            setValue={setPf}
                            required={true}
                            options={common}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />
                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name="ESI (Y/N)"
                            value={esi}
                            setValue={setEsi}
                            required={true}
                            options={common}
                            readOnly={readOnly}
                            disabled={childRecord.current > 0}
                            onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                          />
                          {errors.name && (
                            <span className="text-red-500 text-xs ml-1">
                              {errors.name}
                            </span>
                          )}
                        </div>

                        <div className="col-span-1">
                          <TextInput
                            ref={input1Ref}
                            name="Salary"
                            value={salary}
                            setValue={setSalary}
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
                        </div>
                        <div className="col-span-1">
                          <DropdownInput
                            ref={input1Ref}
                            name="Salary Type"
                            value={salaryMethod}
                            setValue={setSalaryMethod}
                            options={SalaryMethod}
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {step === "Personal Details" && (
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <h3 className="font-medium text-gray-800 mb-2 text-sm">
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
                      <div>
                        <TextInput
                          name="Religion"
                          value={religion}
                          setValue={setReligion}
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
                      <div className="col-span-1">
                        <TextInput
                          ref={input1Ref}
                          name="Adhaar No"
                          value={aadharNo}
                          setValue={setAadharNo}
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
                        {errors.fatherName && (
                          <span className="text-red-500 text-xs ml-1">
                            {errors.fatherName}
                          </span>
                        )}
                      </div>
                      <div>
                        <TextInput
                          name="ESI No"
                          value={esiNo}
                          setValue={setEsiNo}
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
                        <TextInput
                          name="PF No"
                          value={pfNo}
                          setValue={setPfNo}
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
                        <TextInput
                          name="UAN No (PF)"
                          value={uanNo}
                          setValue={setUanNo}
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
                        <TextInput
                          name="Email"
                          value={email}
                          setValue={setEmail}
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
                    </div>
                  </div>
                )}
                {step === "Contact Details" && (
                  <div className="flex flex-col  gap-4  h-full">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full overflow-y-auto ">
                      <div className="grid grid-cols-2 gap-2 justify-between ">
                        <div className="grid grid-cols-2 gap-3 border-r border-gray-300  pr-3">
                          <h3 className="font-medium text-gray-800 mb-2 text-sm">
                            PRESENT ADDRESS
                          </h3>
                          <div className="col-span-2 -mt-2 ">
                            <TextArea
                              inputClass="h-12"
                              name="Address"
                              value={presentAddress.address}
                              setValue={(val) =>
                                handlePresentChange("address", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                            {errors.address && (
                              <span className="text-red-500 text-xs ml-1">
                                {errors.address}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1">
                            <TextInput
                              name="Village"
                              value={presentAddress.village}
                              setValue={(val) =>
                                handlePresentChange("village", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="col-span-1">
                            <DropdownInput
                              ref={input1Ref}
                              name="Choose City"
                              value={presentAddress.cityId}
                              setValue={(val) =>
                                handlePresentChange("cityId", val)
                              }
                              options={dropDownListObject(
                                cityList?.data,
                                "name",
                                "id"
                              )}
                              // required={true}
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 ? true : undefined
                              }
                              onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                            />
                            {errors.name && (
                              <span className="text-red-500 text-xs ml-1">
                                {errors.name}
                              </span>
                            )}
                          </div>

                          <div className="col-span-1">
                            <DropdownInput
                              ref={input1Ref}
                              name="Choose State"
                              value={presentAddress.stateId}
                              setValue={(val) =>
                                handlePresentChange("stateId", val)
                              }
                              options={dropDownListObject(
                                stateList?.data,
                                "name",
                                "id"
                              )}
                              // required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                            />
                            {errors.name && (
                              <span className="text-red-500 text-xs ml-1">
                                {errors.name}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1">
                            <DropdownInput
                              ref={input1Ref}
                              name="Choose Country"
                              value={presentAddress.countryId}
                              setValue={(val) =>
                                handlePresentChange("countryId", val)
                              }
                              options={dropDownListObject(
                                countryList?.data,
                                "name",
                                "id"
                              )}
                              // required={true}
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                              onKeyDown={(e) => handleKeyNext(e, input2Ref)}
                            />
                            {errors.name && (
                              <span className="text-red-500 text-xs ml-1">
                                {errors.name}
                              </span>
                            )}
                          </div>
                          <div className="col-span-1">
                            <TextInput
                              name="Pincode"
                              value={presentAddress.pincode}
                              setValue={(val) =>
                                handlePresentChange("pincode", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                          <div className="col-span-1">
                            <TextInput
                              name="Mobile No"
                              value={presentAddress.mobile}
                              setValue={(val) =>
                                handlePresentChange("mobile", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={childRecord.current > 0}
                            />
                          </div>
                        </div>

                        {/* PERMANENT ADDRESS */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2 flex items-center gap-2">
                            <h3 className="font-medium text-gray-800 text-sm">
                              PERMANENT ADDRESS
                            </h3>
                            <label className="flex items-center gap-1 text-xs text-gray-600">
                              <input
                                type="checkbox"
                                checked={sameAsPresent}
                                onChange={handleCheckboxChange}
                                disabled={readOnly}
                              />
                              Same as Present
                            </label>
                          </div>

                          <div className="col-span-2">
                            <TextArea
                              inputClass="h-12"
                              name="Address"
                              value={permanentAddress.address}
                              setValue={(val) =>
                                handlePermanentChange("address", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <TextInput
                              name="Village"
                              value={permanentAddress.village}
                              setValue={(val) =>
                                handlePermanentChange("village", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <DropdownInput
                              name="Choose City"
                              value={permanentAddress.cityId}
                              setValue={(val) =>
                                handlePermanentChange("cityId", val)
                              }
                              options={dropDownListObject(
                                cityList?.data,
                                "name",
                                "id"
                              )}
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>

                          <div className="col-span-1">
                            <DropdownInput
                              name="Choose State"
                              value={permanentAddress.stateId}
                              setValue={(val) =>
                                handlePermanentChange("stateId", val)
                              }
                              options={dropDownListObject(
                                stateList?.data,
                                "name",
                                "id"
                              )}
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <DropdownInput
                              name="Choose Country"
                              value={permanentAddress.countryId}
                              setValue={(val) =>
                                handlePermanentChange("countryId", val)
                              }
                              options={dropDownListObject(
                                countryList?.data,
                                "name",
                                "id"
                              )}
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <TextInput
                              name="Pincode"
                              value={permanentAddress.pincode}
                              setValue={(val) =>
                                handlePermanentChange("pincode", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>
                          <div className="col-span-1">
                            <TextInput
                              name="Mobile No"
                              value={permanentAddress.mobile}
                              setValue={(val) =>
                                handlePermanentChange("mobile", val)
                              }
                              required
                              readOnly={readOnly}
                              disabled={
                                childRecord.current > 0 || sameAsPresent
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {step === "Bank Details" && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-800 text-sm">
                          Bank Details
                        </h3>
                        <button
                          onClick={() => addNewRow()}
                          disabled={readOnly}
                          className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                          <HiPlus className="w-3 h-3 mr-1" />
                          Add Item
                        </button>
                      </div>

                      <table className="w-full border-collapse table-fixed ">
                        <thead className="bg-gray-200 text-gray-800">
                          <tr>
                            <th
                              className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              S.No
                            </th>
                            <th
                              className={` px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Bank Name
                            </th>
                            <th
                              className={` px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Branch Name
                            </th>
                            <th
                              className={` px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Account Number
                            </th>
                            <th
                              className={` px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              IFSC Code
                            </th>
                            <th
                              className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {bankDetails.map((item, index) => (
                            <tr
                              key={index}
                              className=" border border-gray-300 text-[13px] py-0.5 px-1 text-center"
                            >
                              <td className=" text-center px-1">{index + 1}</td>
                              <td className="border border-gray-300 text-[13px] py-1.5 px-1 item-center">
                                <input
                                  // name="Bank Name"
                                  type="text"
                                  value={item?.bankName}
                                  onChange={(e) =>
                                    handleBankDetailsChange(
                                      index,
                                      "bankName",
                                      e.target.value
                                    )
                                  }
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                  className="w-full focus:outline-none uppercase focus:border-none pl-2"
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="Branch Name"
                                  type="text"
                                  value={item.branchName}
                                  onChange={(e) =>
                                    handleBankDetailsChange(
                                      index,
                                      "branchName",
                                      e.target.value
                                    )
                                  }
                                  className="w-full focus:outline-none uppercase focus:border-none pl-3"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="Account Number"
                                  type="number"
                                  value={item.accountNumber}
                                  onChange={(e) =>
                                    handleBankDetailsChange(
                                      index,
                                      "accountNumber",
                                      e.target.value
                                    )
                                  }
                                  className="w-full focus:outline-none uppercase focus:border-none text-right pr-3"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 items-center">
                                <input
                                  // name="IFSC CODE"
                                  type="text"
                                  value={item.ifscCode}
                                  onChange={(e) =>
                                    handleBankDetailsChange(
                                      index,
                                      "ifscCode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full focus:outline-none uppercase focus:border-none text-left pl-2"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <button
                                  type="button"
                                  title="Delete Row"
                                  onClick={() => deleteRow(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 inline-block"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {step === "Education Details" && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-800 text-sm">
                          Education Details
                        </h3>
                        <button
                          onClick={() => addEducationNewRow()}
                          disabled={readOnly}
                          className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                          <HiPlus className="w-3 h-3 mr-1" />
                          Add Item
                        </button>
                      </div>

                      <table className="w-full border-collapse table-fixed ">
                        <thead className="bg-gray-200 text-gray-800">
                          <tr>
                            <th
                              className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              S.No
                            </th>
                            <th
                              className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Course / Degree
                            </th>
                            <th
                              className={` px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Board / University
                            </th>
                            <th
                              className={` px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Institution
                            </th>
                            <th
                              className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Year & Month of Passing
                            </th>
                            <th
                              className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {educationDetails.map((item, index) => (
                            <tr
                              key={index}
                              className=" border border-gray-300 text-[11px] py-1.5 px-1 text-center"
                            >
                              <td className=" text-center px-1">{index + 1}</td>
                              <td className="border border-gray-300 text-[13px] py-1.5 px-1 item-center">
                                <input
                                  // name="Bank Name"
                                  type="text"
                                  value={item?.courseName}
                                  onChange={(e) =>
                                    handleEDucationDetailsChange(
                                      index,
                                      "courseName",
                                      e.target.value
                                    )
                                  }
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                  className="w-full pl-2 focus:outline-none uppercase focus:border-none"
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="Branch Name"
                                  type="text"
                                  value={item?.universityName}
                                  onChange={(e) =>
                                    handleEDucationDetailsChange(
                                      index,
                                      "universityName",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-2 focus:outline-none  uppercase focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="Account Number"
                                  type="text"
                                  value={item?.institutionName}
                                  onChange={(e) =>
                                    handleEDucationDetailsChange(
                                      index,
                                      "institutionName",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-2 focus:outline-none uppercase focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="IFSC CODE"
                                  type="text"
                                  value={item.yearOfPass}
                                  onChange={(e) =>
                                    handleEDucationDetailsChange(
                                      index,
                                      "yearOfPass",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-2 focus:outline-none uppercase focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <button
                                  type="button"
                                  title="Delete Row"
                                  onClick={() => deleteEducationRow(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 inline-block"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {step === "Family Details" && (
                  <div className="flex flex-col gap-4 h-full">
                    <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-800 text-sm">
                          Family Details
                        </h3>
                        <button
                          onClick={() => addFamilyNewRow()}
                          disabled={readOnly}
                          className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                        >
                          <HiPlus className="w-3 h-3 mr-1" />
                          Add Item
                        </button>
                      </div>

                      <table className="w-full border-collapse table-fixed ">
                        <thead className="bg-gray-200 text-gray-800">
                          <tr>
                            <th
                              className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              S.No
                            </th>
                            <th
                              className={`w-44 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Name
                            </th>
                            <th
                              className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Date of Birth
                            </th>
                            <th
                              className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Age
                            </th>
                            <th
                              className={`w-32 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              RelationShip
                            </th>
                            <th
                              className={`w-52 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Occupation
                            </th>
                            <th
                              className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Nominee
                            </th>
                            <th
                              className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {familyDetails.map((item, index) => (
                            <tr
                              key={index}
                              className=" border border-gray-300 text-[11px] py-0.5 px-1 text-center"
                            >
                              <td className=" text-center px-1">{index + 1}</td>
                              <td className="border border-gray-300 text-[11px] py-1.5 px-1 item-center">
                                <input
                                  // name="Bank Name"
                                  type="text"
                                  value={item?.name}
                                  onChange={(e) =>
                                    handleFamilyDetailsChange(
                                      index,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                  className="w-full pl-2 focus:outline-none uppercase focus:border-none"
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="Branch Name"
                                  type="date"
                                  value={item?.dob}
                                  onChange={(e) =>
                                    handleFamilyDetailsChange(
                                      index,
                                      "dob",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-1 focus:outline-none uppercase  focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="Account Number"
                                  type="number"
                                  value={item?.age}
                                  onChange={(e) =>
                                    handleFamilyDetailsChange(
                                      index,
                                      "age",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pr-2 text-right focus:outline-none uppercase  focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="IFSC CODE"
                                  type="text"
                                  value={item.relationShip}
                                  onChange={(e) =>
                                    handleFamilyDetailsChange(
                                      index,
                                      "relationShip",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-2 focus:outline-none uppercase  focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="IFSC CODE"
                                  type="text"
                                  value={item.occupation}
                                  onChange={(e) =>
                                    handleFamilyDetailsChange(
                                      index,
                                      "occupation",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-2 focus:outline-none uppercase  focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <input
                                  // name="IFSC CODE"
                                  type="text"
                                  value={item.nominee}
                                  onChange={(e) =>
                                    handleFamilyDetailsChange(
                                      index,
                                      "nominee",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-2 focus:outline-none uppercase  focus:border-none"
                                  readOnly={readOnly}
                                  // disabled={childRecord.current > 0}
                                />
                              </td>
                              <td className=" border border-gray-300 text-[13px] py-1.5 item-center">
                                <button
                                  type="button"
                                  title="Delete Row"
                                  onClick={() => deleteFamilyRow(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 inline-block"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
