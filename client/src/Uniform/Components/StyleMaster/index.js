import React from "react";
import { Check, Plus } from "lucide-react";
import Modal from "../../../UiComponents/Modal";
import secureLocalStorage from "react-secure-storage";
import Mastertable from "../../../Basic/components/MasterTable/Mastertable";
import {
  useAddStyleMasterMutation,
  useDeleteStyleMasterMutation,
  useGetStyleMasterQuery,
  useUpdateStyleMasterMutation,
  useGetStyleMasterByIdQuery,
} from "../../../redux/uniformService/StyleMasterService";
import Swal from "sweetalert2";
import { TextInput, ToggleButton, ReusableTable } from "../../../Inputs";
import { statusDropdown } from "../../../Utils/DropdownData";
import { useState, useCallback, useEffect } from "react";

const StyleMaster = () => {
  const [form, setForm] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [active, setActive] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const [addData] = useAddStyleMasterMutation();
  const [updateData] = useUpdateStyleMasterMutation();
  const [removeData] = useDeleteStyleMasterMutation();

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

  const data = {
    id,
    sku,
    active,
    name,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const validateData = (data) => {
    if (data.name && data.sku) {
      return true;
    }
    return false;
  };
  const saveData = () => {
    if (!validateData(data)) {
      Swal.fire({
        title: "Please fill all required fields...!",
        icon: "success",
        timer: 1000,
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
  const handleKeyDown = (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      saveData();
    }
  };

  const syncFormWithDb = useCallback(
    (data) => {
      // if (id) setReadOnly(true);
      setName(data?.name ? data.name : "");

      setSku(data?.sku ? data?.sku : "");
      setActive(id ? (data?.active ? data.active : false) : true);
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const onNew = () => {
    setId("");
    setForm(true);
    syncFormWithDb(undefined);
    setReadOnly(false);
  };

  function onDataClick(id) {
    setId(id);
    setForm(true);
  }

  const tableHeaders = [
    "S.NO",
    "SKU",
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

  // const columns = [
  //   {
  //     header: "S.No",
  //     accessor: (item, index) => parseInt(index) + parseInt(1),
  //     className: "font-medium text-gray-900 text-center w-[10px] py-1",
  //     search: "",
  //   },
  //   {
  //     header: "SKU",
  //     accessor: (item) => item.name,
  //     className: "font-medium text-gray-900 text-center w-[130px]  py-1  px-2",
  //     search: "SKU",
  //     value: serachDate,
  //     setValue: setSearchDate,
  //   },
  //   {
  //     header: "Customer",
  //     accessor: (item) => item.Party?.name,
  //     className: "font-medium text-gray-900 w-[500px]  py-1  px-2",
  //     search: "Customer",
  //     value: searchCustomer,
  //     setValue: setSearchCustomer,
  //   },
  // ];

  const tableDataNames = [
    "index+1",
    "dataObj.sku",
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

  const deleteData = async (id) => {
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      try {
        let deldata = await removeData(id).unwrap();
        // if (deldata?.statusCode == 1) {
        //     toast.error(deldata?.message)
        //     return
        // }
        setId("");
        Swal.fire({
          title: "Deleted" + "  " + "Successfully",
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
    }
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
    } catch (error) {
      console.log("handle");
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="w-full flex justify-between mb-2 items-center px-0.5">
        <h5 className="my-1">Style Master</h5>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setForm(true);
              onNew();
            }}
            className="bg-white border  border-indigo-600 text-indigo-600 hover:bg-indigo-700 hover:text-white text-sm px-4 py-1 rounded-md shadow transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New Style
          </button>
        </div>
      </div>
      <div className="w-full flex items-start">
        <Mastertable
          header={"Style list"}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          onDataClick={onDataClick}
          // setOpenTable={setOpenTable}
          tableHeaders={tableHeaders}
          setReadOnly={setReadOnly}
          deleteData={deleteData}
          tableDataNames={tableDataNames}
          data={allData?.data}
          loading={isLoading || isFetching}
        />
      </div>
      {/* <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <ReusableTable
          columns={columns}
          data={orderData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div> */}

      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[30%] max-w-6xl h-[50vh]"}
          onClose={() => {
            setForm(false);
          }}
        >
          <div className="h-full flex flex-col bg-[f1f1f0]">
            <div className="border-b py-2 px-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Style  "
                      : "Style Master "
                    : "Add New Style "}
                </h2>
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
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
            </div>

            <div className="flex-1 overflow-auto p-3">
              <div className="grid grid-cols-1  gap-3  h-full">
                <div className="lg:col-span- space-y-3">
                  <div className="bg-white p-3 rounded-md border border-gray-200 h-full">
                    <fieldset className=" rounded mt-2">
                      <div className="">
                        <div className="flex justify-between">
                          <div>
                            <div className="mb-3">
                              <TextInput
                                name="SKU / Style code"
                                type="text"
                                value={name}
                                setValue={setName}
                                required={true}
                                readOnly={readOnly}
                              />
                            </div>
                            <div className="mb-3">
                              <TextInput
                                name="Alias Name"
                                type="text"
                                value={sku}
                                setValue={setSku}
                                required={true}
                                readOnly={readOnly}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="mb-5">
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
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StyleMaster;
