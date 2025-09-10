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

import { getCommonParams } from "../../../Utils/helper";
import {
  useAddCompanyPayCodeMutation,
  useDeleteCompanyPayCodeMutation,
  useGetCompanyPayCodeByIdQuery,
  useGetCompanyPayCodeQuery,
  useUpdateCompanyPayCodeMutation,
} from "../../../redux/services/CompanyPayCodeService";
import { useGetShiftCommonTemplateQuery } from "../../../redux/services/ShiftCommonTemplate.service";
import { useGetshiftMasterQuery } from "../../../redux/services/ShiftMasterService";
import TemplateItems from "./templateItems";
import Swal from "sweetalert2";
import { useGetPayComponentQuery } from "../../../redux/services/PayComponentsService";
import moment from "moment";
import { useDispatch } from "react-redux";

const CompanyPaycode = () => {
  const today = new Date();
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [payComponentId, setPayComponentId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [docId, setDocId] = useState("");
  const [active, setActive] = useState(true);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const childRecord = useRef(0);
  const [payDetails, setPayDetails] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(moment.utc(today).format("YYYY-MM-DD"));
  const dispatch = useDispatch();
  console.log(date, "date");

  const params = getCommonParams();

  const { branchId } = params;

  const { data: company } = useGetCompanyQuery({ params });
  const [companyCode, setCompanyCode] = useState(company?.data[0].code);

  const { data: allData, refetch } = useGetCompanyPayCodeQuery({
    params,
    searchParams: searchValue,
  });

  const { data: payComponent } = useGetPayComponentQuery({
    params,
    searchParams: searchValue,
  });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetCompanyPayCodeByIdQuery(id, { skip: !id });

  const [addData] = useAddCompanyPayCodeMutation();
  const [updateData] = useUpdateCompanyPayCodeMutation();
  const [removeData] = useDeleteCompanyPayCodeMutation();

  const { data: shiftData } = useGetshiftMasterQuery({
    params,
    searchParams: searchValue,
  });
  const { data: ShitCommonData } = useGetShiftCommonTemplateQuery({
    params,
    searchParams: searchValue,
  });

  // useEffect(() => {
  //   if (company?.data?.length > 0) {
  //     // setCompanyName(company.data[0].name);
  //     setCompanyCode(company.data[0].code);
  //   }
  // }, [company]);

  useEffect(() => {
    if (payDetails?.length >= 1) return;
    setPayDetails((prev) => {
      let newArray = Array?.from({ length: 1 - prev?.length }, () => {
        return {
           payComponentId:''
        };
      });
      return [...prev, ...newArray];
    });
  }, [setPayDetails, payDetails]);

  const syncFormWithDb = useCallback(
    (data) => {
      setDocId(data?.docId);
      setDate(
        data?.date
          ? moment.utc(data.date).format("YYYY-MM-DD")
          : moment.utc(today).format("YYYY-MM-DD")
      );

      setPayDetails(data?.PayDetails ? data?.PayDetails : []);
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    date,

    docId,

    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    branchId,
    payDetails,
  };

  
  const validateData = (data) => {
    
   
    if (payDetails?.some((i) => !i.payComponentId || i.payComponentId === "")) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Pay Code is Missing",
      });
      return;
    }
  
    return true;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData = await callback(data).unwrap();
      setId(returnData.data.id);

      // toast.success(text + "Successfully");
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
      dispatch({
        type: `payComponent/invalidateTags`,
        payload: ["payComponent"],
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

 

  const saveData = () => {
   
    if (!validateData(data)) {
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
            icon: "error",
            title: "Submission error",
            text: deldata?.data?.message || "Something went wrong!",
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
         dispatch({
        type: `payComponent/invalidateTags`,
        payload: ["payComponent"],
      });
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

  console.log(allData, "alldata");

  const getNextDocId = useCallback(() => {
    if (id) return;
    if (allData?.nextDocId) {
      setDocId(allData?.nextDocId);
    }
  }, [allData, id]);

  useEffect(getNextDocId, [getNextDocId]);
  console.log(allData, "alldata");
  const onNew = () => {
   
    setId("");

    setReadOnly(false);
    setSearchValue("");
    // setCompanyCode(company?.data[0]?.code);
    setPayDetails([]);
    
    refetch();
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

  const columns = [
    {
      header: "S.No",
      accessor: (item, index) => index + 1,
      className: " text-gray-900 w-6  text-center",
    },

    {
      header: "Doc Id",
      accessor: (item) => item?.docId,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-left pl-2 uppercase w-32",
    },
    {
      header: "Date",
      accessor: (item) => new Date(item?.date).toISOString().split("T")[0],
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-center uppercase w-32",
    },
  ];

  return (
    <>
      <div>
        <div onKeyDown={handleKeyDown} className="p-1 ">
          {form === true ? (
            <TemplateItems
              saveData={saveData}
              setForm={setForm}
              setReadOnly={setReadOnly}
              setId={setId}
              ShitCommonData={ShitCommonData}
              shiftData={shiftData}
              readOnly={readOnly}
              payDetails={payDetails}
              setPayDetails={setPayDetails}
              id={id}
              companyCode={companyCode}
              setCompanyCode={setCompanyCode}
              docId={docId}
              setDate={setDate}
              date={date}
              setDocId={setDocId}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              childRecord={childRecord}
              payComponent={payComponent}
              setPayComponentId={setPayComponentId}
              payComponentId={payComponentId}
              onClose={() => {
                setForm(false);
                onNew();
              }}
              onNew={onNew}
              refetch={refetch}
            />
          ) : (
            <>
              <div className="w-full flex bg-white p-1 justify-between  items-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Company Paycode
                </h1>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setForm(true);
                      onNew();
                    }}
                    className="bg-white border  border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                  >
                    + Add New Company Paycode
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
    </>
  );
};

export default CompanyPaycode;
