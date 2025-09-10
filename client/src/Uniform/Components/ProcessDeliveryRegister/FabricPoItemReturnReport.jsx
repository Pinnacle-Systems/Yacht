import React from 'react'
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper'
import { ExcelButton } from '../../../Buttons'
import { exportFileToCsv } from '../../../Utils/excelHelper'

const FabricItemReturnReport = ({ inwardItems = [], poItem, dataObj }) => {
  return (
    <div className='border bg-gray-200'>
      <table className='table-fixed text-xs border border-gray-500 '>
        <thead>
          <tr className='table-row'>
            <th className='w-32 table-data'>Po. No</th>
            <th>Fabric</th>
            <th className='w-10 table-data'>
              Color
            </th>
            <th className='w-16 table-data'>
              Design
            </th>
            <th className='w-12 table-data'>
              Gauge
            </th>
            <th className='w-12 table-data'>
              LL
            </th>
            <th className='w-12 table-data'>
              Gsm
            </th>
            <th className='w-12 table-data'>
              K-Dia
            </th>
            <th className='w-12 table-data'>
              F-Dia
            </th>
            <th className='w-12 table-data'>
              Uom
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className='table-row'>
            <td className='table-data'>
              {dataObj.docId}
            </td>
            <td className='text-left px-1 table-data'>{poItem.Fabric.aliasName}</td>
            <td className='text-left px-1 table-data'>{poItem.Color.name}</td>
            <td className='text-left px-1  table-data'>{poItem.Design.name}</td>
            <td className='text-right px-1  table-data'>{poItem.Gauge.name}</td>
            <td className='text-right px-1  table-data'>{poItem.LoopLength.name}</td>
            <td className='text-left px-1  table-data'>{poItem.Gsm.name}</td>
            <td className='text-right px-1  table-data'>{poItem.KDia.name}</td>
            <td className='text-right px-1  table-data'>{poItem.FDia.name}</td>
            <td className='text-left px-1  table-data'>{poItem.Uom.name}</td>
            <td className='py-1 text-center w-8'>
              <ExcelButton onClick={() => {
                let excelData = inwardItems.map(item => {
                  let newItem = {};
                  newItem["Return. No."] = item.PurchaseInwardOrReturn.docId;
                  newItem["Return. Date"] = getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.createdAt);
                  newItem["Dc. No"] = item.PurchaseInwardOrReturn.dcNo;
                  newItem["Dc. Date"] = getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.dcDate);
                  newItem["Lot No"] = item.lotNo;
                  newItem["Rolls"] = item.noOfRolls;
                  newItem["Qty"] = item.qty;
                  return newItem
                })
                exportFileToCsv([
                  {
                    "Po No.": dataObj.docId,
                    "Fabric": poItem.Fabric.aliasName,
                    "Color": poItem.Color.name,
                    "Design": poItem.Design.name,
                    "Gauge": poItem.Gauge.name,
                    "Loop Length": poItem.LoopLength.name,
                    "Gsm": poItem.Gsm.name,
                    "K-Dia": poItem.KDia.name,
                    "F-Dia": poItem.FDia.name,
                    "Uom": poItem.Uom.name
                  }
                  , ...excelData], `${dataObj.docId}-Return`)
              }} width={18} />
            </td>
          </tr>
        </tbody>
      </table>
      <table className='table-auto w-full text-xs border border-gray-500 '>
        <thead className=' border-b border-gray-500'>
          <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
            <th className="table-data  w-2 text-center">S.no</th>
            <th className="table-data  w-2 text-center">Return No.</th>
            <th className="table-data  w-20 text-center">Return Date.</th>
            <th className="table-data  w-20 text-center">DC No.</th>
            <th className="table-data  w-20 text-center">Dc Date.</th>
            <th className="table-data  w-10">Lot No.</th>
            <th className="table-data  w-10">Return Rolls</th>
            <th className="table-data  w-10">Return Qty</th>
          </tr>
        </thead>
        <tbody>
          {inwardItems.map((item, index) =>
                       <tr key={item.id}>

              <td className='text-center   table-data'>{index + 1}</td>
              <td className='text-left  table-data'>{item.PurchaseInwardOrReturn.docId}</td>
              <td className='text-left  table-data'>{getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.createdAt)}</td>
              <td className='text-left  table-data'>{item.PurchaseInwardOrReturn.dcNo}</td>
              <td className='text-left  table-data'>{getDateFromDateTimeToDisplay(item.PurchaseInwardOrReturn.dcDate)}</td>
              <td className='text-right  table-data'>{item.lotNo}</td>
              <td className='text-right  table-data'>{item.noOfRolls}</td>
              <td className='text-right  table-data'>{item.qty}</td>
            </tr>
          )
          }
           <tr className='table-row'>
            <td colSpan={5} className='table-data'></td>
            <td>Totals</td>
            <td className='text-right  table-data'>{sumArray(inwardItems.filter(item => item.noOfRolls), "noOfRolls")}</td>
            <td className='text-right  table-data'>{sumArray(inwardItems, "qty")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricItemReturnReport
