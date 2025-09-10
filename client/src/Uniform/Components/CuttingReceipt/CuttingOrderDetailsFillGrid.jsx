import React from 'react';
import { useGetFabricMasterQuery } from '../../../redux/uniformService/FabricMasterService';
import { useGetColorMasterQuery } from '../../../redux/uniformService/ColorMasterService';
import { useGetUomQuery } from '../../../redux/services/UomMasterService';
import { useGetGaugeQuery } from '../../../redux/services/GaugeMasterServices';
import { useGetdesignQuery } from '../../../redux/uniformService/DesignMasterServices';
import { useGetgsmQuery } from '../../../redux/uniformService/GsmMasterServices';
import { useGetDiaQuery } from '../../../redux/uniformService/DiaMasterServices';
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { findFromList, substract } from '../../../Utils/helper';
import { useGetLoopLengthQuery } from '../../../redux/uniformService/LoopLengthMasterServices';
import { useGetItemMasterQuery } from '../../../redux/uniformService/ItemMasterService';
import { useGetSizeMasterQuery } from '../../../redux/uniformService/SizeMasterService';
import { useGetItemTypeMasterQuery } from '../../../redux/uniformService/ItemTypeMasterService';
import { useGetPanelMasterQuery } from '../../../redux/uniformService/PanelMasterService';

const CuttingOrderDetailsFillGrid = ({ id, cuttingReceiptInwardDetailsFillData, setCuttingReceiptInwardDetailsFillData,
  cuttingReceiptInwardDetails, setCuttingReceiptInwardDetails, onDone }) => {
  const params = {
    companyId: secureLocalStorage.getItem(
      sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
  };



  const addItem = (id, row, panelId) => {
    setCuttingReceiptInwardDetails(prev => {
      let newInwardDetails = structuredClone(prev);
      newInwardDetails.push({
        sizeWiseDetailsId: id, receivedQty: row?.receivedQty, itemId: row?.itemId, colorId: row?.colorId, uomId: row?.uomId,
        sizeId: row?.sizeId, orderQty: row?.orderQty, cuttingOrderDetailsId: row?.cuttingOrderDetailsId,
        alreadyReceivedQty: row?.alreadyReceivedQty, cuttingQty: row?.cuttingQty,
        panelId: row?.panelId, panelColorId: row?.panelColorId
      })
      return newInwardDetails
    })
  }
  const deleteItem = (id, panelId) => {
    setCuttingReceiptInwardDetails(prev => {
      return prev.filter(item => (parseInt(item.sizeWiseDetailsId) !== parseInt(id)) && (parseInt(item.panelId) !== parseInt(panelId)))
    })
  }

  console.log(cuttingReceiptInwardDetails, "cuttingReceiptInwardDetails")

  const isItemSelected = (id, panelId) => {
    let foundIndex = cuttingReceiptInwardDetails.findIndex(item => (parseInt(item.sizeWiseDetailsId) === parseInt(id)) && (parseInt(item.panelId) === parseInt(panelId)))
    return foundIndex !== -1
  }

  const handleChangeInwardProgramDetails = (id, row, panelId) => {
    if (isItemSelected(id, panelId)) {
      deleteItem(id, panelId)
    } else {
      addItem(id, row, panelId)
    }
  }

  function handleSelectAllChange(value) {
    if (value) {
      (cuttingReceiptInwardDetailsFillData ? cuttingReceiptInwardDetailsFillData : []).forEach(item => addItem(item?.id, item))
    } else {
      (cuttingReceiptInwardDetailsFillData ? cuttingReceiptInwardDetailsFillData : []).forEach(item => deleteItem(item?.id))
    }
  }

  function getSelectAll() {


    return (cuttingReceiptInwardDetailsFillData ? cuttingReceiptInwardDetailsFillData : []).every(item => isItemSelected(item?.id, item?.panelId))
  }

  const { data: fabricList } =
    useGetFabricMasterQuery({ params });

  const { data: colorList } =
    useGetColorMasterQuery({ params });

  const { data: itemTypeList } =
    useGetItemTypeMasterQuery({ params });
  const { data: itemList } =
    useGetItemMasterQuery({ params });

  const { data: sizeList } =
    useGetSizeMasterQuery({ params });

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

  const { data: panelList } =
    useGetPanelMasterQuery({ params });


  if (!fabricList || !colorList || !uomList || !gaugeList || !designList || !gsmList || !loopLengthList || !diaList) return <Loader />
  return (
    <>
      <div className={`w-full h-[380px] overflow-auto`}>
        <div className='flex justify-between mb-2'>
          <h1 className='text-center mx-auto font-bold'>Cutting Order Details</h1>
          <button className='text-center font-bold bg-blue-400 text-gray-100 p-1 rounded-lg' onClick={onDone}>DONE</button>
        </div>
        <table className=" text-xs table-fixed w-full">
          <thead className='bg-blue-200 top-0'>
            <tr>

              <th className='w-16 p-2'>
                Mark All
                <input type="checkbox" className='w-full' onChange={(e) => handleSelectAllChange(e.target.checked)}
                  checked={getSelectAll()}
                />
              </th>
              <th className="table-data w-10 text-center">S.no</th>
              <th className="table-data w-48">Item</th>
              <th className="table-data w-48">Color</th>
              <th className="table-data w-48">Panel</th>
              <th className="table-data w-48">PanelColor</th>
              <th className="table-data w-32">Size</th>
              {/* <th className="table-data w-20">Uom</th> */}
              <th className="table-data w-20">Order Qty</th>
              {/* <th className="table-data w-20">Cutting Price</th> */}
              <th className="table-data  w-16">A. Inward Qty<span className="text-red-500">*</span></th>
              <th className="table-data  w-16">Bal. Qty<span className="text-red-500">*</span></th>
            </tr>
          </thead>
          <tbody className='overflow-y-auto  h-full w-full'>
            {cuttingReceiptInwardDetailsFillData?.map((row, index) => (
              <tr key={index} className="w-full table-row" onClick={() => { handleChangeInwardProgramDetails(row?.id, row, row?.panelId) }} >
                <td className="table-data flex justify-center ">
                  <input type='checkbox' checked={isItemSelected(row?.id, row?.panelId)} />
                </td>
                <td className="table-data  ">
                  {index + 1}
                </td>
                <td className='table-data'>
                  {findFromList(row?.itemId, itemList?.data, "name")}
                </td>
                <td className='table-data'>
                  {findFromList(row?.colorId, colorList?.data, "name")}
                </td>
                <td className='table-data'>
                  {findFromList(row?.panelId, panelList?.data, "name")}
                </td>
                <td className='table-data'>
                  {findFromList(row?.panelColorId, colorList?.data, "name")}
                </td>
                <td className='table-data'>
                  {findFromList(row?.sizeId, sizeList?.data, "name")}
                </td>
                {/* <td className='table-data'>
                  {findFromList(row?.uomId, uomList?.data, "name")}
                </td> */}

                <td className='table-data text-right'>
                  {row.orderQty}
                </td>

                <td className='text-right table-data'>
                  {row?.alreadyReceivedQty || 0}
                </td>
                <td className='text-right table-data'>
                  {substract(row.orderQty, row?.alreadyReceivedQty ? row?.alreadyReceivedQty : 0).toFixed(3)}
                </td>
              </tr>
            ))}
            {Array.from({ length: 5 - cuttingReceiptInwardDetailsFillData.length }).map(i =>
              <tr className='w-full font-bold h-8 border border-gray-400 table-row'>
                <td className='table-data'>
                </td>
                <td className="table-data   "></td>
                {/* <td className="table-data   "></td> */}
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>
                <td className="table-data   "></td>

                <td className="table-data  "></td>
                <td className="table-data   "></td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </>

  )
}

export default CuttingOrderDetailsFillGrid