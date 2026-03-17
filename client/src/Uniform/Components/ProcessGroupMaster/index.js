import React, { useEffect, useState, useRef, useCallback } from "react";
import secureLocalStorage from "react-secure-storage";
import { Check, Power } from "lucide-react";
import { toast } from "react-toastify";
import {
  TextInput,
  CheckBox,
  ReusableTable,
  ToggleButton,
  DropdownNew,
} from "../../../Inputs";
import Swal from "sweetalert2";
import Modal from "../../../UiComponents/Modal";
import { statusDropdown } from "../../../Utils/DropdownData";
import {
  useAddProcessGroupMasterMutation,
  useDeleteProcessGroupMasterMutation,
  useGetProcessGroupMasterByIdQuery,
  useGetProcessGroupMasterQuery,
  useLazyGetProcessGroupMasterByIdQuery,
  useUpdateProcessGroupMasterMutation,
} from "../../../redux/uniformService/ProcessGroupMasterServices";
import {
  useGetProcessGroupSeqMasterByIdQuery,
  useGetProcessGroupSeqMasterQuery,
} from "../../../redux/uniformService/ProcessGroupSeqMasterServices";
import { useGetProcessMasterQuery } from "../../../redux/uniformService/ProcessMasterService";
import { findFromList } from "../../../Utils/helper";
import { UserPermissions } from "../../../Utils/UserPermissions";

const MODEL = "Process Group Master";

export default function Form() {
  const [form, setForm] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [readOnly, setReadOnly] = useState(false);
  const [id, setId] = useState("");
  const [processGroupSeqsId, setProcessGroupSeqsId] = useState("");
  const [active, setActive] = useState(true);
  const [processGroupLists, setProcessGroupLists] = useState(
    Array.from({ length: 4 }, (_, i) => ({
      id: null,
      processId: "",
      seqNo: i + 1,
    }))
  );
  const [searchValue, setSearchValue] = useState("");
  const childRecordProduction = useRef(0);
  const { hasPermission } = UserPermissions();

  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };
  const {
    data: allData,
    isLoading,
    isFetching,
  } = useGetProcessGroupMasterQuery({ params, searchParams: searchValue });
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetProcessGroupMasterByIdQuery(id, { skip: !id });

  const [addData] = useAddProcessGroupMasterMutation();
  const [updateData] = useUpdateProcessGroupMasterMutation();
  const [removeData] = useDeleteProcessGroupMasterMutation();
  const [trigger, { data: singleDataLazy, isFetchingLazy }] =
    useLazyGetProcessGroupMasterByIdQuery();
  const { data: seqData } = useGetProcessGroupSeqMasterByIdQuery(
    processGroupSeqsId,
    {
      skip: !processGroupSeqsId,
    }
  );
  const sequence = seqData?.data?.sequence;
  const { data: processGroupSeqList } = useGetProcessGroupSeqMasterQuery({
    params: { params },
  });
  const { data: processList } = useGetProcessMasterQuery({
    params: { params },
  });

  const syncFormWithDb = useCallback(
    (data) => {
      setProcessGroupSeqsId(
        data?.processGroupSeqsId ? data?.processGroupSeqsId : ""
      );
      setActive(id ? data?.active ?? false : true);
      setProcessGroupLists(
        data?.processGroupLists
          ? data?.processGroupLists
          : Array.from({ length: 4 }, (_, i) => ({
              id: null,
              processId: "",
              seqNo: (sequence ?? 1) + i,
            }))
      );
      childRecordProduction.current = data?.childRecordProduction
        ? data?.childRecordProduction
        : 0;
    },
    [id]
  );

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  const data = {
    id,
    processGroupSeqsId,
    active,
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    processGroupLists: processGroupLists?.filter(
      (item) => item.processId && item.seqNo
    ),
  };

  const validateData = (data) => {
    if (data.processGroupSeqsId) {
      return true;
    }
    return false;
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      let returnData;
      if (text === "Updated") {
        returnData = await callback(data).unwrap();
      } else {
        returnData = await callback(data).unwrap();
      }
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
      console.log("handle");
    }
  };

  const saveData = () => {
    let foundItem;
    if (id) {
      foundItem = allData?.data
        ?.filter((i) => i.id !== id)
        ?.some((item) => item.processGroupSeqsId === processGroupSeqsId);
    } else {
      foundItem = allData?.data?.some(
        (item) => item.processGroupSeqsId === processGroupSeqsId
      );
    }

    if (foundItem) {
      Swal.fire({
        text: "The Process Group already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
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

  const handleDelete = async (id) => {
    setId(id);
    const { data } = await trigger(id);
    if (id) {
      if (!window.confirm("Are you sure to delete...?")) {
        return;
      }
      if (data?.data?.childRecordProduction > 0) {
        Swal.fire({
          icon: "error",
          title: "Child record Exists in Production Entry",
          text: "Data cannot be deleted!",
        });
      } else {
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

  const handleView = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(true);
  };

  const handleEdit = (id) => {
    setId(id);
    setForm(true);
    setReadOnly(false);
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
      accessor: (item, index) => parseInt(index) + parseInt(1),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
    {
      header: "Group Name",
      accessor: (item) =>
        findFromList(
          item?.processGroupSeqsId,
          processGroupSeqList?.data,
          "name"
        ),
      className: "font-medium text-gray-900  w-[250px]  py-1  px-2",
      search: "Group Name",
    },
    {
      header: "Status",
      accessor: (item) => (item.active ? ACTIVE : INACTIVE),
      className: "font-medium text-gray-900 text-center w-[10px] py-1",
      search: "",
    },
  ];

  const handleInputChange = async (value, index, field) => {
    setProcessGroupLists((prev) => {
      const newItems = structuredClone(prev);
      newItems[index][field] = value;
      return newItems;
    });
  };

  const handleRightClick = (event, rowIndex = 0, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const addRow = () => {
    setProcessGroupLists((prev) => {
      const maxSeq = Math.max(...prev.map((r) => Number(r.seqNo)));
      return [
        ...prev,
        {
          id: null,
          processId: "",
          seqNo: maxSeq + 1,
        },
      ];
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const deleteRow = (index) => {
    setProcessGroupLists((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((row, i) => ({
        ...row,
        seqNo: sequence + i,
      }));
    });
  };

  useEffect(() => {
    if (!sequence) return;

    // If editing and existing data exists
    if (processGroupLists.length >= 4) {
      // Merge existing rows + re-index seqNo starting from sequence
      const updated = processGroupLists.map((row, i) => ({
        ...row,
        seqNo: sequence + i,
      }));

      // ensure minimum 4 rows
      const missing = Math.max(0, 4 - updated.length);
      const extra = Array.from({ length: missing }, (_, i) => ({
        id: null,
        processId: "",
        seqNo: sequence + updated.length + i,
      }));

      setProcessGroupLists([...updated, ...extra]);
    } else {
      // Create initial 4 rows when creating fresh
      const rows = Array.from({ length: 4 }, (_, i) => ({
        id: null,
        processId: "",
        seqNo: sequence + i,
      }));
      setProcessGroupLists(rows);
    }
  }, [sequence]);

  return (
    <div onKeyDown={handleKeyDown} className="p-1">
      <div className="w-full flex bg-white p-1 justify-between  items-center">
        <h5 className="text-xl font-bold font-segoe text-gray-800 ">
          Process Group Master
        </h5>
        <div className="flex items-center">
          <button
            onClick={() => {
              if (
                !hasPermission(() => {
                  setForm(true);
                  onNew();
                }, "create")
              )
                return;
            }}
            className="bg-white border font-segoe border-green-600 text-green-600 hover:bg-green-700 hover:text-white text-sm px-2  rounded-md shadow transition-Portions duration-200 flex items-center gap-2"
          >
            + Add New Process Group
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-3">
        <ReusableTable
          columns={columns}
          data={allData?.data || []}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          itemsPerPage={10}
        />
      </div>
      {form && (
        <Modal
          isOpen={form}
          form={form}
          widthClass={"w-[700px] h-[500px]"}
          onClose={() => {
            setForm(false);
          }}
        >
          <div className="h-full flex flex-col bg-gray-100">
            <div className="border-b py-2 px-4 mt-4 mx-3 flex justify-between items-center sticky top-0 z-10 bg-white">
              <div className="flex items-center gap-2">
                <h2 className="text-lg px-2 py-0.5 font-semibold text-gray-800">
                  {id
                    ? !readOnly
                      ? "Edit Process Group Master"
                      : "Process Group Master"
                    : "Add New Process Group"}
                </h2>
              </div>
              <div className="flex gap-2">
                <div>
                  {readOnly && (
                    <button
                      type="button"
                      onClick={() => {
                          if (
                            !hasPermission(() => {
                              setReadOnly(false);
                            }, "edit")
                          )
                            return;
                        }}
                      className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
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
                    <div className="">
                      <div className="mb-5 w-56">
                        <DropdownNew
                          name="Process Group"
                          dataList={
                            id
                              ? processGroupSeqList?.data
                              : processGroupSeqList?.data?.filter(
                                  (item) => item.active
                                )
                          }
                          value={processGroupSeqsId}
                          setValue={setProcessGroupSeqsId}
                          readOnly={readOnly}
                          placeholder={"Select Group"}
                          disabled={childRecordProduction.current > 0 || readOnly}
                          required={true}
                          autoFocus={true}
                        />
                      </div>
                      <div
                        className={`w-full  max-h-[300px] overflow-y-auto  my-1 mb-5`}
                      >
                        <table className="border-collapse table-fixed w-full">
                          <thead className="bg-gray-200 text-gray-800 sticky top-0 z-10">
                            <tr>
                              <th
                                className={`w-10 px-1 py-2 text-center font-medium text-[13px]`}
                              >
                                S.No
                              </th>
                              <th
                                className={`w-20 px-1 py-2 text-center font-medium text-[13px]`}
                              >
                                Process
                              </th>
                              <th
                                className={`w-20  py-2 text-center font-medium text-[13px] `}
                              >
                                Seq No
                              </th>
                              <th
                                className={`w-10 px-3 py-2 text-center font-medium text-[13px] `}
                              ></th>
                            </tr>
                          </thead>
                          <tbody>
                            {(processGroupLists ? processGroupLists : [])?.map(
                              (row, index) => (
                                <>
                                  <tr
                                    className="border border-blue-gray-200 cursor-pointer "
                                    key={index}
                                  >
                                    <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                                      {index + 1}
                                    </td>
                                    <td className="py-0.5 border border-gray-300 text-[11px] ">
                                      <select
                                        id={`processId-input-${index}`}
                                        disabled={readOnly || childRecordProduction.current > 0}
                                        className="text-left w-full rounded py-1 table-data-input"
                                        value={row.processId}
                                        onKeyDown={(e) => {
                                          if (e.key === "Delete") {
                                            handleInputChange(
                                              "",
                                              index,
                                              "processId"
                                            );
                                          }
                                          if (e.key === "Enter") {
                                            e.preventDefault(); // prevent form submit or line break
                                            e.stopPropagation();
                                            const nextQtyInput =
                                              document.querySelector(
                                                `#processId-input-${index + 1}`
                                              );
                                            if (nextQtyInput) {
                                              nextQtyInput.focus();
                                            }
                                          }
                                        }}
                                        onChange={(e) =>
                                          handleInputChange(
                                            e.target.value,
                                            index,
                                            "processId"
                                          )
                                        }
                                        onBlur={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            index,
                                            "processId"
                                          );
                                        }}
                                      >
                                        <option></option>
                                        {(id
                                          ? processList?.data
                                          : processList?.data?.filter(
                                              (item) => item.active
                                            )
                                        )?.map((blend) => (
                                          <option
                                            value={blend.id}
                                            key={blend.id}
                                          >
                                            {blend?.name}
                                          </option>
                                        ))}
                                      </select>
                                    </td>

                                    <td className="border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                                      <input
                                        type="number"
                                        className="text-right rounded py-1 px-1 w-full table-data-input"
                                        value={row?.seqNo}
                                        disabled={true}
                                        onKeyDown={(e) => {
                                          if (
                                            e.code === "Minus" ||
                                            e.code === "NumpadSubtract"
                                          )
                                            e.preventDefault();
                                          if (e.key === "Delete") {
                                            handleInputChange(
                                              "",
                                              index,
                                              "seqNo"
                                            );
                                          }
                                        }}
                                        onFocus={(e) => e.target.focus()}
                                        onChange={(e) =>
                                          handleInputChange(
                                            e.target.value,
                                            index,
                                            "seqNo"
                                          )
                                        }
                                        onBlur={(e) => {
                                          handleInputChange(
                                            e.target.value,
                                            index,
                                            "seqNo"
                                          );
                                        }}
                                      />
                                    </td>
                                    <td className="w-2 border border-gray-300">
                                      <input
                                        onContextMenu={(e) => {
                                          if (!readOnly) {
                                            handleRightClick(e, index, "notes");
                                          }
                                        }}
                                        className="w-full "
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            e.preventDefault();
                                            addRow();
                                          }
                                        }}
                                        disabled={readOnly || childRecordProduction.current > 0}
                                      />
                                    </td>
                                  </tr>
                                </>
                              )
                            )}
                          </tbody>
                        </table>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: `${contextMenu.mouseY}px`,
            left: `${contextMenu.mouseX}px`,
            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
          className="bg-gray-100"
          onMouseLeave={handleCloseContextMenu}
        >
          <div className="flex flex-col gap-1">
            <button
              className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                deleteRow(contextMenu.rowId);
                handleCloseContextMenu();
              }}
            >
              Delete
            </button>
            {/* <button
              className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                handleDeleteAllRows();
                handleCloseContextMenu();
              }}
            >
              Delete All
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}
