import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";

import { toast } from "react-toastify";
import {
  TextInput,
  ToggleButton,
  ReusableTable,
  TextAreaInput,
  DropdownInput,
} from "../../../Inputs";

import { common, commonNew, statusDropdown } from "../../../Utils/DropdownData";

import { useGetCompanyQuery } from "../../../redux/services/CompanyMasterService";
import Modal from "../../../UiComponents/Modal";
import { Check, Power } from "lucide-react";

import { findFromList, getCommonParams } from "../../../Utils/helper";

import { useGetshiftMasterQuery } from "../../../redux/services/ShiftMasterService";
import TemplateItems from "./templateItems";
import {
  useAddPayFrequencyMutation,
  useDeletePayFrequencyMutation,
  useGetPayFrequencyByIdQuery,
  useGetPayFrequencyQuery,
  useUpdatePayFrequencyMutation,
} from "../../../redux/services/PayFrequencyService";
import { useGetShiftCommonTemplateQuery } from "../../../redux/services/ShiftCommonTemplate.service";
import { useGetFinYearQuery } from "../../../redux/services/FinYearMasterService";
import Swal from "sweetalert2";

const PayFrequencymaster = () => {
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [docId, setDocId] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [payFrequencyType, setPayFrequencyType] = useState([]);
  const [finYearId, setFinYearId] = useState("");

  const params = getCommonParams();

  const { branchId } = params;

  const { data: company } = useGetCompanyQuery({ params });
  const [companyCode, setCompanyCode] = useState(company?.data[0].code);

  const { data: yearData } = useGetFinYearQuery({
    params,
    searchParams: searchValue,
  });

  const { data: allData } = useGetPayFrequencyQuery({
    params,
    searchParams: searchValue,
  });
  console.log(allData, "allData");

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetPayFrequencyByIdQuery(id, { skip: !id });

  const [addData] = useAddPayFrequencyMutation();
  const [updateData] = useUpdatePayFrequencyMutation();
  const [removeData] = useDeletePayFrequencyMutation();

  useEffect(() => {
    if (company?.data?.length > 0) {
      // setCompanyName(company.data[0].name);
      setCompanyCode(company.data[0].code);
    }
  }, [company]);

  const getNextDocId = useCallback(() => {
    if (id) return;
    if (allData?.nextDocId) {
      setDocId(allData?.nextDocId);
    }
  }, [allData, id]);

  useEffect(getNextDocId, [getNextDocId]);

  useEffect(() => {
    if (payFrequencyType?.length >= 1) return;
    setPayFrequencyType((prev) => {
      let newArray = Array.from({ length: 1 - prev.length }, (i) => {
        return { templateId: "" };
      });
      return [...prev, ...newArray];
    });
  }, []);

  const syncFormWithDb = useCallback(
    (data) => {
      if (!id) {
        setActive(true);
        setCompanyCode(company?.data?.[0]?.code || "");
        // setPayFrequencyType([]);
      } else if (data) {
        // Edit Mode

        setActive(data?.active ?? true);
        setFinYearId(data?.finYearId || "");

        // ✅ Normalize PayFrequencyType from backend
        const normalized = data?.PayFrequencyType?.map((type) => ({
          id: type.id,
          type: type.payFrequencyType, // backend string
          payFrequencyItems:
            type.PayFrequencyItems?.map((item) => ({
              id: item.id,
              startDate: item.startDate ? item.startDate.slice(0, 10) : "", // format YYYY-MM-DD
              endDate: item.endDate ? item.endDate.slice(0, 10) : "",
              salaryDate: item.salaryDate ? item.salaryDate.slice(0, 10) : "",
              notes: item.notes || "",
            })) || [],
        }));

        setPayFrequencyType(normalized || []);
        setCompanyCode(data?.companyCode || company?.data?.[0]?.code || "");
      }
    },
    [id, company]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    description,
    docId,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    branchId,
    payFrequencyType,

    finYearId,
  };

  console.log(payFrequencyType, "payFrequencyType  ");

  const validateData = (data) => {
    if (data.finYearId) {
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
      console.log("handle");
    }
  };

  const saveData = () => {
    if (!validateData(data)) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text:  "Please fill all required Details!",
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
        const deldata = await removeData(id).unwrap();
        if (deldata?.statusCode == 1) {
          Swal.fire({
            title: "Deleted Successfully",
            icon: "success",
            timer: 1000,
          });
          setForm(false);
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
      }
    }
  };

  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      // saveData();
    }
  };

  const onNew = () => {
    setId("");
    setReadOnly(false);
    setFinYearId("");
    setReadOnly(false);
    setForm(true);
    setSearchValue("");
    setPayFrequencyType([]);
    // setCompanyName(company.data[0].name);
    setCompanyCode(company?.data[0]?.code);
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
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: " text-gray-900 w-12  text-center",
    },

    {
      header: "FIn Year",
      accessor: (item) => findFromList(item?.finYearId, yearData?.data, "code"),
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-center uppercase w-32",
    },

    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      //   cellClass: () => " text-gray-900",
      className: " text-gray-900 text-center uppercase w-36",
    },
  ];
  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(payFrequencyType);
    newBlend[index][field] = value;

    setPayFrequencyType(newBlend);
  };

  return (
    <div>
      <div onKeyDown={handleKeyDown} className="p-1 ">
        {form === true ? (
          <TemplateItems
            yearData={yearData}
            saveData={saveData}
            setForm={setForm}
            readOnly={readOnly}
            payFrequencyType={payFrequencyType}
            setPayFrequencyType={setPayFrequencyType}
            id={id}
            setId={setId}
            companyCode={companyCode}
            setCompanyCode={setCompanyCode}
            docId={docId}
            setReadOnly={setReadOnly}
            setDocId={setDocId}
            finYearId={finYearId}
            setFinYearId={setFinYearId}
            childRecord={childRecord}
          />
        ) : (
          <>
            <div className="w-full flex bg-white p-1 justify-between  items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Pay Frequency
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setForm(true);
                    onNew();
                  }}
                  className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                >
                  + Add New Pay Frequency
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
          </>
        )}
      </div>
    </div>
  );
};

export default PayFrequencymaster;
