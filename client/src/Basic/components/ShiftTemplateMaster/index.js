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
  useAddShiftTemplateMasterMutation,
  useDeleteShiftTemplateMasterMutation,
  useGetShiftTemplateMasterByIdQuery,
  useGetShiftTemplateMasterQuery,
  useUpdateShiftTemplateMasterMutation,
} from "../../../redux/services/ShiftTemplateMaster";
import { useGetShiftCommonTemplateQuery } from "../../../redux/services/ShiftCommonTemplate.service";
import { useGetshiftMasterQuery } from "../../../redux/services/ShiftMasterService";
import TemplateItems from "./templateItems";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";

const ShiftTemplateMaster = () => {
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
  const [ShiftTemplateItems, setShiftTemplateItems] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(null);
  const params = getCommonParams();
  const[shiftId,setshiftId] = useState('')

  const { branchId } = params;
  const dispatch = useDispatch();
  const { data: company } = useGetCompanyQuery({ params });
  const [companyCode, setCompanyCode] = useState(company?.data[0].code);

  const { data: allData, refetch } = useGetShiftTemplateMasterQuery({
    params,
    searchParams: searchValue,
  });

  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetShiftTemplateMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddShiftTemplateMasterMutation();
  const [updateData] = useUpdateShiftTemplateMasterMutation();
  const [removeData] = useDeleteShiftTemplateMasterMutation();

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
    if (ShiftTemplateItems?.length >= 1) return;
    setShiftTemplateItems((prev) => {
      let newArray = Array?.from({ length: 1 - prev?.length }, () => {
        return {
          templateId: "",
        };
      });
      return [...prev, ...newArray];
    });
  }, [setShiftTemplateItems, ShiftTemplateItems]);

  const syncFormWithDb = useCallback(
    (data) => {
      setName(data?.name || "");
      setDocId(data?.docId);

      setDescription(data?.description || "");
      setActive(id ? data?.active ?? false : true);
      setShiftTemplateItems(
        data?.ShiftTemplateItems ? data?.ShiftTemplateItems : []
      );
      setCategoryId(data?.category ? data?.category : "");
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    name,
    date,
    description,
    docId,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    id,
    branchId,
    ShiftTemplateItems: ShiftTemplateItems?.filter((item) => item.templateId),
    categoryId,
  };

  console.log(ShiftTemplateItems, "ShiftTemplateItems");

  // const validateData = (data) => {
  //     if (!data?.categoryId) {
  //         toast.error("Category is required...!");
  //         return false;
  //     }

  //     return true;
  // };
  useEffect(() => {
    console.log("allData", allData);
  }, [allData]);

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
        type: `shiftMaster/invalidateTags`,
        payload: ["shiftMaster"],
      });
      dispatch({
        type: `ShiftCommonTemplateMaster/invalidateTags`,
        payload: ["ShiftCommonTemplate"],
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: error.data?.message || "Something went wrong!",
      });
    }
  };

  const validateData = (data) => {
    if (!categoryId) {
      // toast.info("Category is Missing");
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Category is Missing",
      });
      return false;
    }
    if (ShiftTemplateItems.length === 0) {
      // toast.info("ShiftTemplateItems  should have atleast One Item...!!!");
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "ShiftTemplateItems  should have atleast One Item...!!!",
      });
      return false;
    }
    if (ShiftTemplateItems?.some((i) => !i.templateId || i.templateId === "")) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "Shift Common Template  Is Missing...!!!",
      });
      return;
    }
    if (ShiftTemplateItems?.some((i) => !i.shiftId || i.shiftId === "")) {
      Swal.fire({
        icon: "error",
        title: "Submission error",
        text: "shift  Is Missing...!!!",
      });
      return;
    }
    return true;
  };

  const saveData = () => {
    // if (!validateData(data)) {
    //     toast.error("Please fill all required fields...!", {
    //         position: "top-center",
    //     });
    //     return;
    // }
    if (!validateData(data)) {
      return;
    }

    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    } else {
      handleSubmitCustom(addData, data, "Added");
    }
  };

  console.log(id, "id");

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
          type: `shiftMaster/invalidateTags`,
          payload: ["shiftMaster"],
        });
        dispatch({
          type: `ShiftCommonTemplateMaster/invalidateTags`,
          payload: ["ShiftCommonTemplate"],
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
    console.log("Hitr");
    setId("");

    setReadOnly(false);
    setSearchValue("");
    // setCompanyCode(company?.data[0]?.code);
    setShiftTemplateItems([]);
    setCategoryId("");
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
      header: "Doc Id",
      accessor: (item) => item?.docId,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-left pl-2 uppercase w-32",
    },
    {
      header: "Category",
      accessor: (item) => item?.category,
      //   cellClass: () => "  text-gray-900",
      className: " text-gray-900 text-center uppercase w-32",
    },
    
  ];

  return (
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
            ShiftTemplateItems={ShiftTemplateItems}
            setShiftTemplateItems={setShiftTemplateItems}
            id={id}
            companyCode={companyCode}
            setCompanyCode={setCompanyCode}
            docId={docId}
            setDate={setDate}
            setshiftId={setshiftId}
            shiftId={shiftId}
            date={date}
            setDocId={setDocId}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            childRecord={childRecord}
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
              <h1 className="text-2xl  font-bold text-gray-800">
                Shift Template Master
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setForm(true);
                    onNew();
                  }}
                  className="bg-white border   border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-colors duration-200 flex items-center gap-2"
                >
                  + Add Shift Template Master
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

export default ShiftTemplateMaster;
