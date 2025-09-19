import { useGetSizeMasterQuery } from "../../../redux/uniformService/SizeMasterService";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";

export default function SizeDetails({
  sizeDetails,
  setSizeDetails,
  params,
  readOnly,
  id,
}) {
  const { data: sizeList } = useGetSizeMasterQuery({ params });

  const addRow = () => {
    const newRow = {
      sizeId: "",
      qty: "",
    };
    setSizeDetails([...sizeDetails, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(sizeDetails);
    newBlend[index][field] = value;
    setSizeDetails(newBlend);
  };

  const deleteRow = (id) => {
    setSizeDetails((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-medium text-slate-700">List Of Sizes</h2>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              addRow();
            }}
            className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
          >
            <HiPlus className="w-3 h-3 mr-1" />
            Add Size
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
                className={`w-24 px-4 py-2 text-center font-medium text-[13px] `}
              >
                Size
              </th>
              <th
                className={`w-16 px-4 py-2 text-center font-medium text-[13px] `}
              >
                Quantity
              </th>
              <th
                className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(sizeDetails ? sizeDetails : [])?.map((row, index) => (
              <tr className="border border-blue-gray-200 cursor-pointer ">
                <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                  {index + 1}
                </td>
                <td className="py-0.5 border border-gray-300 text-[11px]">
                  <select
                    onKeyDown={(e) => {
                      if (e.key === "Delete") {
                        handleInputChange("", index, "sizeId");
                      }
                    }}
                    tabIndex={"0"}
                    disabled={readOnly}
                    className="text-left w-full rounded py-1 table-data-input"
                    value={row.sizeId}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "sizeId")
                    }
                    onBlur={(e) => {
                      handleInputChange(e.target.value, index, "sizeId");
                    }}
                  >
                    <option></option>
                    {(id
                      ? sizeList?.data
                      : sizeList?.data?.filter((item) => item.active)
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
                      if (e.code === "Minus" || e.code === "NumpadSubtract")
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
    </>
  );
}
