import { useGetStyleMasterQuery } from "../../../redux/uniformService/StyleMasterService";
import { HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import SizeDetails from "./SizeDetails";

export default function ReadyGoods({
  goodsItems,
  setGoodsItems,
  params,
  readOnly,
  id,
}) {
  const { data: styleList } = useGetStyleMasterQuery({ params });

  const addRow = () => {
    const newRow = {
      styleId: "",
      sizeDetails: [],
    };
    setGoodsItems([...goodsItems, newRow]);
  };

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(goodsItems);
    newBlend[index][field] = value;
    setGoodsItems(newBlend);
  };

  const deleteRow = (id) => {
    setGoodsItems((currentRows) => {
      if (currentRows.length > 1) {
        return currentRows.filter((row, index) => index !== parseInt(id));
      }
      return currentRows;
    });
  };

  return (
    <>
      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[250px] overflow-auto">
        <div className="flex gap-6">
          <div className="w-[40%]">
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
                      Style
                    </th>
                    <th
                      className={`w-16 px-3 py-2 text-center font-medium text-[13px] `}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(goodsItems ? goodsItems : [])?.map((row, index) => (
                    <tr className="border border-blue-gray-200 cursor-pointer ">
                      <td className="w-12 border border-gray-300 text-[11px]  text-center p-0.5">
                        {index + 1}
                      </td>
                      <td className="py-0.5 border border-gray-300 text-[11px] ">
                        <select
                          onKeyDown={(e) => {
                            if (e.key === "Delete") {
                              handleInputChange("", index, "styleId");
                            }
                          }}
                          tabIndex={"0"}
                          disabled={readOnly}
                          className="text-left w-full rounded py-1 table-data-input"
                          value={row.fabricId}
                          onChange={(e) =>
                            handleInputChange(e.target.value, index, "styleId")
                          }
                          onBlur={(e) => {
                            handleInputChange(e.target.value, index, "styleId");
                          }}
                        >
                          <option></option>
                          {(id
                            ? styleList?.data
                            : styleList?.data?.filter((item) => item.active)
                          )?.map((blend) => (
                            <option value={blend.id} key={blend.id}>
                              {blend?.name}
                            </option>
                          ))}
                        </select>
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
          <div className="w-[60%]">
            <SizeDetails />
          </div>
        </div>
      </div>
    </>
  );
}
