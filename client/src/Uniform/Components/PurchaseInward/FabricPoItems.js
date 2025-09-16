import React, { useEffect, useState } from "react";
import { useGetFabricMasterQuery } from "../../../redux/uniformService/FabricMasterService";
import { useGetUomQuery } from "../../../redux/services/UomMasterService";
import { toast } from "react-toastify";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";

const FabricPoItems = ({
  id,
  transType,
  poItems,
  setPoItems,
  readOnly,
  params,
}) => {
  const [currentSelectedLotGrid, setCurrentSelectedLotGrid] = useState(false);
  const [currentSelectedIndex, setCurrentSelectedIndex] = useState("");

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(poItems);
    newBlend[index][field] = value;
    if (field === "fabricId") {
      newBlend[index]["taxPercent"] = findYarnTax(value);
    }
    setPoItems(newBlend);
  };

  useEffect(() => {
    if (poItems.length >= 3) return;
    setPoItems((prev) => {
      let newArray = Array.from({ length: 3 - prev.length }, (i) => {
        return {
          fabricId: "",
          qty: "0.000",
          taxPercent: "0.000",
          uomId: "",
          price: "0.00",
          discountType: "Percentage",
          discountValue: "0.00",
          discountPerc: "",
        };
      });
      return [...prev, ...newArray];
    });
  }, [transType]);

  function handleInputChangeLotNo(value, index, lotIndex, field) {
    setPoItems((poItems) => {
      const newBlend = structuredClone(poItems);
      if (!newBlend[index]["inwardLotDetails"]) return poItems;

      newBlend[index]["inwardLotDetails"][lotIndex][field] = value;

      if (field == "noOfRolls") {
        let totalValue = newBlend[index]["inwardLotDetails"].reduce(
          (accumulator, currentValue) =>
            accumulator + parseInt(currentValue?.noOfRolls),
          0
        );
        newBlend[index][field] = totalValue;
      }
      if (field == "qty") {
        let totalValue = parseFloat(
          newBlend[index]["inwardLotDetails"].reduce(
            (accumulator, currentValue) =>
              accumulator + parseFloat(currentValue?.qty),
            0
          )
        ).toFixed(3);
        newBlend[index][field] = totalValue;
      }

      return newBlend;
    });
  }

  const addRow = () => {
    const newRow = {
      fabricId: "",
      uomId: "",
      taxPercent: "0.000",
      qty: "0.000",
      price: "0.00",
      discountType: "Percentage",
      discountValue: "0.00",
      discountPerc: "",
    };
    setPoItems([...poItems, newRow]);
  };

  const { data: fabricList } = useGetFabricMasterQuery({ params });

  const { data: uomList } = useGetUomQuery({ params });

  function findYarnTax(id) {
    if (!fabricList) return 0;

    let yarnItem = fabricList.data.find(
      (item) => parseInt(item.id) === parseInt(id)
    );
    return yarnItem?.taxPercent ? yarnItem.taxPercent : 0;
  }

  function getTotals(field) {
    const total = poItems.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0);
    }, 0);
    return parseFloat(total);
  }

  function getGross(field1, field2) {
    const total = poItems.reduce((accumulator, current) => {
      return (
        accumulator +
        parseFloat(
          current[field1] && current[field2]
            ? current[field1] * current[field2]
            : 0
        )
      );
    }, 0);
    return parseFloat(total);
  }

  // if (!fabricList || !uomList ) return <Loader />

  function addNewLotNo(index, weightPerBag) {
    setPoItems((poItems) => {
      const newBlend = structuredClone(poItems);
      if (!newBlend[index]) return poItems;
      if (newBlend[index]["inwardLotDetails"]) {
        newBlend[index]["inwardLotDetails"] = [
          ...newBlend[index]["inwardLotDetails"],
          { lotNo: "", qty: "0.000", noOfRolls: 0, weightPerBag },
        ];
      } else {
        newBlend[index]["inwardLotDetails"] = [
          { lotNo: "", qty: "0.000", noOfRolls: 0, weightPerBag },
        ];
      }
      return newBlend;
    });
  }
  function removeLotNo(index, lotIndex) {
    setPoItems((poItems) => {
      const newBlend = structuredClone(poItems);
      if (!newBlend[index]["inwardLotDetails"]) return poItems;
      newBlend[index]["inwardLotDetails"] = newBlend[index][
        "inwardLotDetails"
      ].filter((_, index) => index != lotIndex);
      return newBlend;
    });
  }

  let selectedRow = Number.isInteger(currentSelectedLotGrid)
    ? poItems[currentSelectedLotGrid]
    : "";
  // let taxItems = poItems.map(item => {
  //     let newItem = structuredClone(item)
  //     newItem["qty"] = sumArray(newItem.inwardLotDetails, "qty")
  //     return newItem
  // })

  let lotNoArr = selectedRow?.inwardLotDetails
    ? selectedRow.inwardLotDetails.map((item) => item.lotNo)
    : [];
  let isLotNoUnique = new Set(lotNoArr).size == lotNoArr.length;
  function onClose() {
    if (!isLotNoUnique) {
      toast.info("Lot No Should be Unique", { position: "top-center" });
      return;
    }
    setCurrentSelectedLotGrid(false);
  }

  const deleteRow = (id) => {
    setPoItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  return (
    <>
      {poItems.length !== 0 ? (
        <>
          {/* <Modal widthClass={"max-h-[600px] overflow-auto"} onClose={onClose} isOpen={Number.isInteger(currentSelectedLotGrid)}>
                            <FabricLotGrid
                                isDirect
                                readOnly={readOnly}
                                onClose={onClose}
                                addNewLotNo={addNewLotNo}
                                removeLotNo={removeLotNo}
                                handleInputChangeLotNo={handleInputChangeLotNo}
                                index={currentSelectedLotGrid}
                                inwardLotDetails={selectedRow?.inwardLotDetails ? selectedRow?.inwardLotDetails : []} />
                        </Modal> */}
          {/* <Modal isOpen={Number.isInteger(currentSelectedIndex)} onClose={() => setCurrentSelectedIndex("")}>
                            <TaxDetailsFullTemplate setCurrentSelectedIndex={setCurrentSelectedIndex} taxTypeId={taxTypeId}
                                currentIndex={currentSelectedIndex} poItems={taxItems} handleInputChange={handleInputChange}
                                isSupplierOutside={isSupplierOutside} readOnly={readOnly} />
                        </Modal> */}
          <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium text-slate-700">List Of Items</h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    addRow();
                  }}
                  className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                >
                  <HiPlus className="w-3 h-3 mr-1" />
                  Add Item
                </button>
              </div>
            </div>
            <div className={`w-full overflow-y-auto py-1 relative`}>
              <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-200 text-gray-800">
                  <tr>
                    <th
                      className={`w-12 px-4 py-2 text-center font-medium text-[13px]`}
                    >
                      S.No
                    </th>
                    <th
                      className={`w-36 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      Items
                    </th>
                    <th
                      className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      HSN / SAC
                    </th>
                    <th
                      className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      Quantity
                    </th>
                    <th
                      className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      Price
                    </th>
                    <th
                      className={`w-12 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      UOM
                    </th>
                    <th
                      className={`w-10 px-4 py-2 text-center font-medium text-[13px] `}
                    >
                      Disc. %
                    </th>
                    <th
                      className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                    >
                      Amount
                    </th>
                    <th
                      className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(poItems ? poItems : [])?.map((row, index) => (
                    <tr className="border border-blue-gray-200 cursor-pointer ">
                      <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                        {index + 1}
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "fabricId");
                            }
                          }}
                          tabIndex={"0"}
                          disabled={readOnly}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.fabricId}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "fabricId")
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "fabricId"
                            );
                          }}
                        >
                          <option></option>
                          {(id
                            ? fabricList?.data
                            : fabricList?.data?.filter((item) => item.active)
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-0.5 border border-gray-300 text-[11px]">
                        <select
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "fabricId");
                            }
                          }}
                          tabIndex={"0"}
                          disabled={readOnly}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.fabricId}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "fabricId")
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              e.target.value,
                              index,
                              "fabricId"
                            );
                          }}
                        >
                          <option></option>
                          {(id
                            ? fabricList?.data
                            : fabricList?.data?.filter((item) => item.active)
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="w-40  border-blue-gray-200 text-[11px] border border-gray-300 py-0.5 text-right">
                        <input
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
                              e.preventDefault();
                            if (e.key === "Delete") {
                              handleInputChange("0.000", index, "qty");
                            }
                          }}
                          min={"0"}
                          type="number"
                          className="text-right rounded py-1 px-1 w-full table-data-input"
                          onFocus={(e) => e.target.select()}
                          value={row?.qty}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "qty")
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              parseFloat(e.target.value).toFixed(2),
                              index,
                              "qty"
                            );
                          }}
                        />
                      </td>

                      <td className="w-40 py-0.5 border border-gray-300 text-[11px] text-right">
                        <input
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
                              e.preventDefault();
                            if (e.key === "Delete") {
                              handleInputChange("0.00", index, "price");
                            }
                          }}
                          min={"0"}
                          type="number"
                          className="text-right rounded py-1 w-full px-1 table-data-input"
                          onFocus={(e) => e.target.select()}
                          value={!row.price ? 0 : row.price}
                          disabled={readOnly}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "price")
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              parseFloat(e.target.value).toFixed(2),
                              index,
                              "price"
                            );
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 text-[11px] py-0.5">
                        <select
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "uomId");
                            }
                          }}
                          disabled={readOnly}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.uomId}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "uomId")
                          }
                          onBlur={(e) => {
                            handleInputChange(e.target.value, index, "uomId");
                          }}
                        >
                          <option hidden></option>
                          {(id
                            ? uomList?.data
                            : uomList?.data?.filter((item) => item.active)
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-0.5 border-blue-gray-200 text-[11px] text-right border border-gray-300">
                        <input
                          onKeyDown={(e) => {
                            if (
                              e.code === "Minus" ||
                              e.code === "NumpadSubtract"
                            )
                              e.preventDefault();
                            if (e.key === "Delete") {
                              handleInputChange("0", index, "discountPerc");
                            }
                          }}
                          min={"0"}
                          type="number"
                          className="text-right rounded py-1 px-1 w-full table-data-input"
                          onFocus={(e) => e.target.select()}
                          value={row?.discountPerc}
                          onChange={(e) =>
                            handleInputChange(
                              e.target.value,
                              index,
                              "discountPerc"
                            )
                          }
                          onBlur={(e) => {
                            handleInputChange(
                              parseFloat(e.target.value),
                              index,
                              "discountPerc"
                            );
                          }}
                        />
                      </td>

                      <td className="py-0.5 px-1 border border-gray-300 text-[11px] text-right">
                        {(
                          (parseFloat(row?.price) || 0) *
                          (parseFloat(row?.qty) || 0)
                        ).toFixed(2)}
                      </td>
                      <td className="w-16 px-1 py-0.5 text-center">
                        <div className="flex space-x-3  justify-center">
                          <button
                            // onClick={() => handleView(index)}
                            // onMouseEnter={() => setTooltipVisible(true)}
                            // onMouseLeave={() => setTooltipVisible(false)}
                            className="text-blue-800 flex items-center  bg-blue-50 rounded"
                          >
                            👁
                          </button>
                          <button
                            // onClick={() => handleEdit(index)}
                            className="text-green-600 hover:text-green-800 bg-green-50 py-1 rounded text-xs flex items-center"
                          >
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRow(index)}
                            className="text-red-600 hover:text-red-800 bg-red-50  py-1 rounded text-xs flex items-center"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default FabricPoItems;
