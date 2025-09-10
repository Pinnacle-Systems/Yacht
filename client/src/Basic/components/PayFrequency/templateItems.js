import { useState, useEffect } from "react";
import { DropdownInput, TextInput } from "../../../Inputs";
import { dropDownFinYear } from "../../../Utils/contructObject";
import { payCategory } from "../../../Utils/DropdownData";
import moment from "moment";
import { HiPlus, HiTrash } from "react-icons/hi";

const TemplateItems = ({
  saveData,
  setForm,
  readOnly,
  id,
  childRecord,
  yearData,
  finYearId,
  setFinYearId,
  payFrequencyType,
  setPayFrequencyType,
  setReadOnly,
  setId,
}) => {
  console.log(payFrequencyType, "payFrequencyType");

  const [contextMenu, setContextMenu] = useState(null);
  const handleRightClick = (event, rowIndex, type) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      rowId: rowIndex,
      type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };
  useEffect(() => {
    const normalized = payCategory.map((cat) => {
      const existing = payFrequencyType?.find((t) => t.type === cat.value);
      return {
        type: cat.value,
        payFrequencyItems: existing?.payFrequencyItems || [],
      };
    });
    setPayFrequencyType(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTab, setActiveTab] = useState(payCategory[0].value);

  const handleInputChange = (type, index, field, value) => {
    const updated = structuredClone(payFrequencyType);
    const typeIndex = updated.findIndex((t) => t.type === type);

    if (typeIndex !== -1) {
      updated[typeIndex].payFrequencyItems[index][field] = value;
      setPayFrequencyType(updated);
    }
  };

  const handleDeleteRow = (type, index) => {
    const updated = structuredClone(payFrequencyType);
    const typeIndex = updated.findIndex((t) => t.type === type);

    if (typeIndex !== -1) {
      // Prevent deletion if only one row left
      if (updated[typeIndex].payFrequencyItems.length <= 1) {
        return; // Do nothing
      }

      updated[typeIndex].payFrequencyItems.splice(index, 1);
      setPayFrequencyType(updated);
    }
  };
  const handleDeleteAllRows = (type) => {
    const updated = structuredClone(payFrequencyType);
    const typeIndex = updated.findIndex((t) => t.type === type);

    if (typeIndex !== -1) {
      // Prevent deleting all rows if only one row exists
      if (updated[typeIndex].payFrequencyItems.length <= 1) {
        return; // Do nothing
      }

      // Keep only the first row
      updated[typeIndex].payFrequencyItems = [
        updated[typeIndex].payFrequencyItems[0],
      ];
      setPayFrequencyType(updated);
    }
  };

  const addNewRow = (type) => {
    const updated = structuredClone(payFrequencyType);
    const typeIndex = updated.findIndex((t) => t.type === type);

    if (typeIndex !== -1) {
      updated[typeIndex].payFrequencyItems.push({
        startDate: "",
        endDate: "",
        salaryDate: "",
        notes: "",
      });
      setPayFrequencyType(updated);
    }
  };

useEffect(() => {
  const defaultTypes = [
    "Monthly - 2 Pay Frequency",
    "Monthly Pay Frequency",
    "Weekly Pay Frequency",
  ];

  if (id) {
    // Edit/View Mode: Ensure all types exist and have at least one row
    if (payFrequencyType && payFrequencyType.length > 0) {
      const updatedTypes = defaultTypes.map((typeName) => {
        const existingType = payFrequencyType.find((t) => t.type === typeName);

        return existingType
          ? {
              ...existingType,
              payFrequencyItems:
                existingType.payFrequencyItems?.length > 0
                  ? existingType.payFrequencyItems
                  : [
                      {
                        startDate: "",
                        endDate: "",
                        salaryDate: "",
                        notes: "",
                      },
                    ],
            }
          : {
              type: typeName,
              payFrequencyItems: [
                {
                  startDate: "",
                  endDate: "",
                  salaryDate: "",
                  notes: "",
                },
              ],
            };
      });

      setPayFrequencyType(updatedTypes);
    }
  } else {
    // New form: Initialize if empty
    if (!payFrequencyType || payFrequencyType.length === 0) {
      setPayFrequencyType(
        defaultTypes.map((type) => ({
          type,
          payFrequencyItems: [
            { startDate: "", endDate: "", salaryDate: "", notes: "" },
          ],
        }))
      );
    }
  }
}, [id, payFrequencyType]);


  const calculatePayPeriod = (startDate, endDate) => {
    if (!startDate || !endDate) return { totalDays: 0, sundays: 0 };

    const start = moment(startDate);
    const end = moment(endDate);
    const totalDays = end.diff(start, "days") + 1;

    let sundays = 0;
    let current = start.clone();
    while (current.isSameOrBefore(end)) {
      if (current.day() === 0) sundays++;
      current.add(1, "day");
    }

    return { totalDays, sundays };
  };

  const activeType = payFrequencyType?.find((t) => t.type === activeTab);

  return (
    <>
      <div className="h-[90vh] flex flex-col bg-gray-100 overflow-x-auto">
        {/* Header */}
        <div className=" flex  justify-between items-center  ">
          <h1 className="text-2xl font-semibold text-gray-800">
            Pay Frequency Master
          </h1>
          <div className="flex gap-2">
            {readOnly && (
              <button
                type="button"
                onClick={() => {
                  setReadOnly(false);
                }}
                className="px-3 py-1 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-600 text-xs rounded"
              >
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setForm(false);
                setId("");
              }}
              className="px-3 py-1 text-red-600 hover:bg-red-600 hover:text-white border border-red-600 text-xs rounded"
            >
              Back
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={saveData}
                className="px-3 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 border border-green-600 flex items-center gap-1 text-xs"
              >
                {id ? "Update" : "Save"}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 mt-2">
          <div className="bg-white p-3 rounded-md border  border-gray-200 w-full">
            <div className="flex gap-x-8 ">
              <DropdownInput
                name="Fin Year"
                options={dropDownFinYear(
                  id
                    ? yearData?.data
                    : yearData?.data?.filter((item) => item?.active),
                  "code",
                  "id"
                )}
                value={finYearId}
                setValue={setFinYearId}
                required={true}
                readOnly={readOnly}
                disabled={childRecord.current > 0}
              />
              <TextInput
                name="Start Date"
                type="text"
                value={
                  finYearId
                    ? moment(
                        yearData?.data?.find((i) => i.id == finYearId)?.from
                      )
                        .utc()
                        .format("DD-MM-YYYY")
                    : ""
                }
                setValue={() => {}}
                required={true}
                disabled={true}
              />
              <TextInput
                name="End Date"
                type="text"
                value={
                  finYearId
                    ? moment(yearData?.data?.find((i) => i.id == finYearId)?.to)
                        .utc()
                        .format("DD-MM-YYYY")
                    : ""
                }
                setValue={() => {}}
                required={true}
                disabled={true}
              />
            </div>
          </div>
          <div className="bg-white   rounded-md border mt-1 border-gray-200 h-full w-full p-3">
            {/* Tabs */}
            <div className="flex border-b ">
              {payFrequencyType?.map((t) => (
                <button
                  key={t.type}
                  onClick={() => setActiveTab(t.type)}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === t.type
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {t.type}
                </button>
              ))}
            </div>

            {/* Active Tab Table */}
            {activeType && (
              <div className="w-full  overflow-x-auto">
                <div
                  className="w-full overflow-x-auto"
                  // tabIndex={0}
                  // onKeyDown={(e) => {
                  //   if (e.key === "Enter" && !readOnly) {
                  //     e.preventDefault(); // prevent accidental form submission
                  //     addNewRow(activeType.type);
                  //   }
                  // }}
                >
                  <table className="w-full border-collapse table-fixed">
                    <thead className="bg-gray-200 text-gray-800">
                      <tr>
                        <th className="w-12 px-4 py-2 text-center font-medium text-[13px]">S.No</th>
                        <th className="w-36 px-4 py-2 text-center font-medium text-[13px]">
                          Start Date
                        </th>
                        <th className="w-36 px-4 py-2 text-center font-medium text-[13px]">End Date</th>
                        <th className="w-36 px-4 py-2 text-center font-medium text-[13px]">
                          Salary Date
                        </th>
                        <th className="w-44 px-4 py-2 text-center font-medium text-[13px]">
                          Pay Month
                        </th>
                        <th className="w-36 px-4 py-2 text-center font-medium text-[13px]">
                          Pay Period Days
                        </th>
                        <th className="w-32 px-4 py-2 text-center font-medium text-[13px]">Holidays</th>
                        <th className="w-[310px] px-4 py-2 text-center font-medium text-[13px]">
                          Notes
                        </th>

                        {/* <th className="px-2 py-2 w-full">
                          <button
                            onClick={() => addNewRow(activeType.type)}
                            disabled={readOnly}
                            className={`px-2 py-1 rounded-md flex items-center text-xs border
      ${
        readOnly
          ? "cursor-not-allowed opacity-50 border-gray-400 text-gray-400"
          : "hover:bg-green-600 text-green-600 hover:text-white border-green-600"
      }`}
                          >
                            <HiPlus className="w-3 h-3" />
                          </button>
                        </th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {activeType?.payFrequencyItems?.map((item, index) => {
                        const { totalDays, sundays } = calculatePayPeriod(
                          item.startDate,
                          item.endDate
                        );
                        return (
                          <tr key={index} className="w-full table-row  ">
                            <td className="text-left px-2 border border-gray-300">
                              {index + 1}
                            </td>
                            <td className="border border-gray-300">
                              <input
                                type="date"
                                value={item.startDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    activeType.type,
                                    index,
                                    "startDate",
                                    e.target.value
                                  )
                                }
                                className="pl-1 bg-transparent  focus:outline-none focus:border-transparent"
                                disabled={readOnly}
                              />
                            </td>
                            <td className="border border-gray-300">
                              <input
                                type="date"
                                value={item.endDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    activeType.type,
                                    index,
                                    "endDate",
                                    e.target.value
                                  )
                                }
                                className="pl-1 bg-transparent focus:outline-none focus:border-transparent"
                                disabled={readOnly}
                              />
                            </td>
                            <td className="border border-gray-300">
                              <input
                                type="date"
                                value={item.salaryDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    activeType.type,
                                    index,
                                    "salaryDate",
                                    e.target.value
                                  )
                                }
                                className="pl-1 bg-transparent focus:outline-none focus:border-transparent"
                                disabled={readOnly}
                              />
                            </td>
                            <td className="border border-gray-300 p-1">
                              {item.salaryDate
                                ? new Date(item.salaryDate).toLocaleString(
                                    "default",
                                    { month: "long" }
                                  )
                                : ""}
                            </td>
                            <td className="border border-gray-300 text-right p-1">
                              {totalDays}
                            </td>
                            <td className="border border-gray-300 text-right  p-1">
                              {sundays}
                            </td>
                            <td
                              className="border border-gray-300 bg-transparent"
                              onContextMenu={(e) => {
                                if (!readOnly) {
                                  handleRightClick(e, index, activeType.type);
                                }
                              }}
                            >
                              <input
                                type="text"
                                value={item.notes}
                                onChange={(e) =>
                                  handleInputChange(
                                    activeType.type,
                                    index,
                                    "notes",
                                    e.target.value
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addNewRow(activeType.type);
                                  }
                                }}
                                className="focus:outline-none focus:border-transparent bg-transparent p-1"
                                disabled={readOnly}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: `${contextMenu.mouseY - 50}px`,
            left: `${contextMenu.mouseX + 20}px`,

            boxShadow: "0px 0px 5px rgba(0,0,0,0.3)",
            padding: "8px",
            borderRadius: "4px",
            zIndex: 1000,
          }}
          onMouseLeave={handleCloseContextMenu} // Close when the mouse leaves
              className="bg-gray-100"
        >
          <div className="flex flex-col gap-1">
            <button
             className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => {
                handleDeleteRow(contextMenu.type, contextMenu.rowId);
                handleCloseContextMenu();
              }}
            >
              Delete{" "}
            </button>
            <button
           className=" text-black text-[12px] text-left rounded px-1"
              onClick={() => handleDeleteAllRows(contextMenu.type)}
            >
              Delete All
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateItems;
