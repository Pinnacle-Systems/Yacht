import React, { useEffect } from 'react';
import { DELETE, PLUS } from '../../../icons';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { Loader } from '../../../Basic/components';
import { VIEW } from '../../../icons';
import secureLocalStorage from 'react-secure-storage';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';

const FabricPoItems = ({ id, programDetails, setProgramDetails, readOnly, setCurrentProgramIndex, finishedGoodsType, currentProgramIndex,
}) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };

  const { data: itemList, isLoading: isItemLoading, isFetching: isItemFetching } = useGetItemMasterQuery({ params });

  const handleInputChange = (value, index, field) => {
    const newBlend = structuredClone(programDetails);
    newBlend[index][field] = value;
    setProgramDetails(newBlend);
  };
  useEffect(() => {
    if (id || programDetails.length !== 0) return
    setProgramDetails(Array.from({ length: 1 }, i => {
      return { yarnId: "", qty: "0.000", inwardQty: "0.000", colorId: "", uomId: "", price: "0.00", discountType: "Percentage", discountValue: "0.00", rawMaterials: [] }
    }))
  }, [setProgramDetails, programDetails, id])


  const addRow = () => {
    const newRow = { fabricId: "", qty: "", colorId: "", uomId: "", gaugeId: "", designId: "", gsmId: "", loopLengthId: "", kDiaId: "", fDiaId: "", rawMaterials: [] };
    setProgramDetails([...programDetails, newRow]);
  };
  const handleDeleteRow = id => {
    setProgramDetails(yarnBlend => yarnBlend.filter((row, index) => index !== parseInt(id)));
  };

  const { data: fabricList } =
    useGetFabricMasterQuery({ params });

  const { data: colorList } =
    useGetColorMasterQuery({ params });

  const { data: uomList } =
    useGetUomQuery({ params });

  const { data: gaugeList } =
    useGetGaugeQuery({ params });

  const { data: designList } =
    useGetdesignQuery({ params });

  const { data: gsmList } =
    useGetgsmQuery({ params });

  const { data: loopLengthList } =
    useGetLoopLengthQuery({ params });

  const { data: diaList } =
    useGetDiaQuery({ params });

  function getTotals(field) {
    const total = programDetails.reduce((accumulator, current) => {
      return accumulator + parseFloat(current[field] ? current[field] : 0)
    }, 0)
    return parseFloat(total)
  }

  if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList) return <Loader />
  return (
    <>
      <div className={`w-full`}>
        <table className=" text-xs table-fixed w-full">
          <thead className='bg-blue-200 top-0'>
            <tr>
              <th className="table-data w-10">S.no</th>
              <th className="table-data  w-32">Style<span className="text-red-500">*</span></th>

              <th className="table-data  w-32">Fabric<span className="text-red-500">*</span></th>
              <th className="table-data  w-32">Color<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">Design<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">Gauge<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">LL<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">GSM<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">K Dia<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">F Dia<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">UOM<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">Process Cost per Kg<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">Quantity<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">Delivery Details</th>
              {!readOnly &&
                <th className='table-data w-5'>
                  <button onClick={addRow}
                    className='hover:cursor-pointer w-full py-2 flex items-center justify-center bg-green-600 text-white'>
                    {PLUS}
                  </button>
                </th>
              }
            </tr>
          </thead>
          <tbody className='overflow-y-auto  h-full w-full'>
            {programDetails.map((row, index) => (
              <tr key={index} className={`w-full ${currentProgramIndex == index ? "border-2 border-black" : "table-row"}`}>
                <td className="table-data  ">
                  {index + 1}
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "itemId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.itemId}
                    onChange={(e) => handleInputChange(e.target.value, index, "itemId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "itemId")
                    }}>
                    <option hidden>
                    </option>
                    {(itemList?.data ? itemList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id} >
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "fabricId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.fabricId}
                    onChange={(e) => handleInputChange(e.target.value, index, "fabricId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "fabricId")
                    }}>
                    <option hidden>
                    </option>
                    {(fabricList?.data ? fabricList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id} >
                        {blend.aliasName}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "colorId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.colorId}
                    onChange={(e) => handleInputChange(e.target.value, index, "colorId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "colorId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(id ? (colorList?.data ? colorList?.data : []) : (colorList?.data ? colorList?.data : []).filter(item => item.active)).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "designId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.designId}
                    onChange={(e) => handleInputChange(e.target.value, index, "designId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "designId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(designList?.data ? designList.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "gaugeId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.gaugeId}
                    onChange={(e) => handleInputChange(e.target.value, index, "gaugeId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "gaugeId")

                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(gaugeList?.data ? gaugeList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "loopLengthId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.loopLengthId}
                    onChange={(e) => handleInputChange(e.target.value, index, "loopLengthId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "loopLengthId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(loopLengthList?.data ? loopLengthList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "gsmId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.gsmId}
                    onChange={(e) => handleInputChange(e.target.value, index, "gsmId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "gsmId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(gsmList?.data ? gsmList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "kDiaId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.kDiaId}
                    onChange={(e) => handleInputChange(e.target.value, index, "kDiaId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "kDiaId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(diaList?.data ? diaList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "fDiaId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.fDiaId}
                    onChange={(e) => handleInputChange(e.target.value, index, "fDiaId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "fDiaId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(diaList?.data ? diaList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <select
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("", index, "uomId") } }}
                    disabled={readOnly} className='text-left w-full rounded py-1 table-data-input' value={row.uomId}
                    onChange={(e) => handleInputChange(e.target.value, index, "uomId")}
                    onBlur={(e) => {
                      handleInputChange((e.target.value), index, "uomId")
                    }
                    }
                  >
                    <option hidden>
                    </option>
                    {(uomList?.data ? uomList?.data : []).map((blend) =>
                      <option value={blend.id} key={blend.id}>
                        {blend.name}
                      </option>
                    )}
                  </select>
                </td>
                <td className='table-data'>
                  <input
                    type="number"
                    min={"0"}

                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.00", index, "processCost") } }}
                    onFocus={(e) => e.target.select()}
                    className="text-right rounded py-1 px-1 w-full table-data-input"
                    value={(!row.processCost) ? "0.00" : row.processCost}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "processCost")
                    }
                    onBlur={(e) => {
                      handleInputChange(parseFloat(e.target.value).toFixed(2), index, "processCost")
                    }
                    }
                  />
                </td>
                <td className='table-data'>
                  <input
                    type="number"
                    onKeyDown={e => { if (e.key === "Delete") { handleInputChange("0.000 ", index, "qty") } }}
                    onFocus={(e) => e.target.select()}
                    min={"0"}

                    className="text-right rounded py-1 px-1 w-full table-data-input"
                    value={(!row.qty) ? 0 : row.qty}
                    disabled={readOnly}
                    onChange={(e) =>
                      handleInputChange(e.target.value, index, "qty")
                    }
                    onBlur={(e) => {
                      handleInputChange(parseFloat(e.target.value).toFixed(3), index, "qty")
                    }
                    }
                  />
                </td>
                <td className='table-data flex justify-center items-center w-full h-full'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setCurrentProgramIndex(index);
                    }
                  }}
                  onClick={() => { setCurrentProgramIndex(index) }}
                >
                  {VIEW}
                </td>
                {!readOnly
                  &&
                  <td className=' w-full'>
                    <div tabIndex={-1} onClick={() => handleDeleteRow(index)} className='flex justify-center px-2 py-1.5 items-center cursor-pointer bg-gray-300'>
                      {DELETE}
                    </div>
                  </td>
                }
              </tr>
            ))}
            {Array.from({ length: 4 - programDetails.length }).map(i =>
              <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                <td className='table-data'>
                </td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data    "></td>
                <td className="table-data    "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                {!readOnly &&
                  <td className="table-data w-10"></td>
                }
              </tr>)
            }
            <tr className='bg-blue-200 w-full border border-gray-400 h-7 font-bold'>

              <td className="table-data   "></td>
              <td className="table-data  w-10 font-bold text-center" colSpan={9}></td>
              <td className="table-data  w-10 font-bold text-center">Total</td>
              <td className="table-data text-right px-1 w-10">{getTotals("qty").toFixed(3)}</td>
              <td className="table-data  w-10 font-bold text-center"></td>
              {!readOnly &&
                <td className="table-data w-10"></td>
              }
            </tr>
          </tbody>
        </table>
      </div>
    </>

  )
}

export default FabricPoItems