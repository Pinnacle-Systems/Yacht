import moment from 'moment'
import React, { useEffect } from 'react'
import { CLOSE_ICON, DELETE, VIEW } from '../../../icons';
import { getImageUrlPath } from '../../../helper';
import { renameFile } from '../../../Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';

const SampleDetailsForm = ({ setCurrentImage, setIsStyleImageOpen, item, index, readOnly, sampleFollowId, setSampleDetails, sampleDetails }) => {


    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )

    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )


    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        companyId
    };

    const { data: colorList } =
        useGetColorMasterQuery({ params });
    const { data: sizeList } =
        useGetSizeMasterQuery({ params });
    const { data: itemList } =
        useGetItemMasterQuery({ params });
    const { data: itemTypeList } =
        useGetItemTypeMasterQuery({ params });
    const { data: fabricList } =
        useGetFabricMasterQuery({ params: { ...params, active: true } });


    function handleInputChange(value, index, field) {
        const newBlend = structuredClone(sampleDetails);
        newBlend[index][field] = value;
        setSampleDetails(newBlend);
    };

    function deleteRow(index) {
        setSampleDetails(prev => prev.filter((_, i) => i !== index))
    }

    function openPreview() {
        window.open(item?.filePath instanceof File ? URL.createObjectURL(item?.filePath) : getImageUrlPath(item.filePath))
    }
    return (
        <>{console.log(sampleDetails, "sample")}

            <tr
                key={index}
                className="hover:bg-gray-100 transition text-xs duration-150"
            >
                <td className="py-0.5 px-1 text-center border border-gray-400">
                    {index + 1}
                </td>
                <td className="py-0.5 px-1 border border-gray-400">
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemTypeId") } }}
                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                        value={item.itemTypeId}
                        onChange={(e) => handleInputChange(e.target.value, index, "itemTypeId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(itemTypeList?.data ? itemTypeList?.data : []).map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}
                    </select>
                </td>
                <td className="py-0.5 px-1 border border-gray-400">
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemId") } }}
                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                        value={item.itemId || ""}
                        onChange={(e) => handleInputChange(e.target.value, index, "itemId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(itemList?.data ? itemList?.data : [])?.filter(val => parseInt(val.itemTypeId) == parseInt(item.itemTypeId))?.map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}
                    </select>
                </td>
                <td className="py-0.5 px-1 border border-gray-400">
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "fabricId") } }}
                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                        value={item.fabricId || ""}
                        onChange={(e) => handleInputChange(e.target.value, index, "fabricId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(fabricList?.data ? fabricList?.data : []).map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}
                    </select>
                </td>

                <td className="py-0.5 px-1 border border-gray-400">
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "sizeId") } }}
                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                        value={item.sizeId}
                        onChange={(e) => handleInputChange(e.target.value, index, "sizeId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(sizeList?.data ? sizeList?.data : []).map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}
                    </select>
                </td>

                <td className="py-0.5 px-1 border border-gray-400">
                    <select
                        readOnly={readOnly}
                        onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                        className='text-left w-full rounded py-1 table-data-input border border-gray-400'
                        value={item.colorId}
                        onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                    >
                        <option className='text-gray-600'>Select
                        </option>
                        {(colorList?.data ? colorList?.data : []).map((uom) =>
                            <option value={uom.id} key={uom.id}>
                                {uom.name}
                            </option>
                        )}
                    </select>
                </td>
                <td className="py-0.5 px-1 border border-gray-400">
                    <input className="w-full  h-full p-1 uppercase" name="" type="text" value={item.comment}
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "comment")
                        }
                        onBlur={(e) => {
                            handleInputChange(e.target.value, index, "comment");
                        }
                        }
                    />
                </td>

                <td className="py-0.5 px-1 border border-gray-400">
                    <div className='flex gap-2'>
                        {(!readOnly && !item.filePath) &&
                            <input
                                title=" "
                                type="file"
                                disabled={readOnly}
                                onChange={(e) =>
                                    e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                }
                            />

                        }
                        {item.filePath &&
                            <>

                                <button onClick={() => { setIsStyleImageOpen(true); setCurrentImage(item.filePath) }}>
                                    {VIEW}
                                </button>
                                {!readOnly &&
                                    <button onClick={() => { handleInputChange('', index, "filePath") }}>{CLOSE_ICON}</button>
                                }
                            </>
                        }

                    </div>
                </td>

                {!readOnly &&
                    <td className="py-0.5 px-3 border border-gray-400 text-center">
                        <button
                            type='button'
                            onClick={() => deleteRow(index)}
                            className='text-xs text-red-600 '>{DELETE}
                        </button>
                    </td>
                }



            </tr>

        </>
    )
}

export default SampleDetailsForm
