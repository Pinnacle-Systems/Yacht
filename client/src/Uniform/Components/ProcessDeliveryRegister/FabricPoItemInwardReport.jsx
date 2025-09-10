import React from 'react'
import { getDateFromDateTimeToDisplay, sumArray } from '../../../Utils/helper'
import { ExcelButton } from '../../../Buttons'
import { exportFileToCsv } from '../../../Utils/excelHelper'

const FabricItemInwardReport = ({ inwardItems = [], item, dataObj }) => {
  const inwardItemsWithLot = [];
  inwardItems.forEach(i => {
    i.lotDetails.forEach(j => {
      inwardItemsWithLot.push({ docId: i?.ProcessInward?.docId, dcNo: i?.ProcessInward?.dcNo, dcDate: i?.ProcessInward?.dcDate, lotNo: j.lotNo, inwardBags: j.inwardBags, inwardQty: j.inwardQty });
    })
  })
  return (
    <div className='border bg-gray-200'>
      <div className='flex text-lg justify-between'>
        <div className=''>Inward Report</div>
        <div>{dataObj.docId}</div>
      </div>
      <table className='table-fixed text-xs border border-gray-500 '>
        <thead>
          <tr className='table-row'>
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
            <td className='text-left px-1 table-data'>{item?.Fabric?.aliasName}</td>
            <td className='text-left px-1 table-data'>{item?.Color?.name}</td>
            <td className='text-left px-1  table-data'>{item?.Design?.name}</td>
            <td className='text-right px-1  table-data'>{item?.Gauge?.name}</td>
            <td className='text-right px-1  table-data'>{item?.LoopLength?.name}</td>
            <td className='text-left px-1  table-data'>{item?.Gsm?.name}</td>
            <td className='text-right px-1  table-data'>{item?.KDia?.name}</td>
            <td className='text-right px-1  table-data'>{item?.FDia?.name}</td>
            <td className='text-left px-1  table-data'>{item?.Uom?.name}</td>
            <td className='py-1 text-center w-8'>
              <ExcelButton onClick={() => {

                exportFileToCsv([
                  {
                    "Po No.": dataObj.docId,
                    "Fabric": item.Fabric.aliasName,
                    "Color": item.Color.name,
                    "Design": item.Design.name,
                    "Gauge": item.Gauge.name,
                    "Loop Length": item.LoopLength.name,
                    "Gsm": item.Gsm.name,
                    "K-Dia": item.KDia.name,
                    "F-Dia": item.FDia.name,
                    "Uom": item.Uom.name
                  }
                  , ...inwardItemsWithLot], `${dataObj.docId}-Inward`)
              }} width={18} />
            </td>
          </tr>
        </tbody>
      </table>
      <table className='table-auto w-full text-xs border border-gray-500 '>
        <thead className=' border-b border-gray-500'>
          <tr className='bg-blue-200 border border-gray-500 sticky top-10 '>
            <th className="table-data  w-2 text-center">S.no</th>
            <th className="table-data  w-2 text-center">Inward No.</th>
            <th className="table-data  w-20 text-center">Inward Date.</th>
            <th className="table-data  w-20 text-center">DC No.</th>
            <th className="table-data  w-20 text-center">Dc Date.</th>
            <th className="table-data  w-10">Lot No.</th>
            <th className="table-data  w-10">Inward Rolls</th>
            <th className="table-data  w-10">Inward Qty</th>
          </tr>
        </thead>
        <tbody>
          {inwardItemsWithLot.map((item, index) =>
            <tr key={item.id}>
              <td className='text-center   table-data'>{index + 1}</td>
              <td className='text-left  table-data'>{item?.docId}</td>
              <td className='text-left  table-data'>{getDateFromDateTimeToDisplay(item?.createdAt)}</td>
              <td className='text-left  table-data'>{item?.dcNo}</td>
              <td className='text-left  table-data'>{getDateFromDateTimeToDisplay(item?.dcDate)}</td>
              <td className='text-right  table-data'>{item?.lotNo}</td>
              <td className='text-right  table-data'>{item?.inwardRolls}</td>
              <td className='text-right  table-data'>{item?.inwardQty}</td>
            </tr>
          )
          }
          <tr className='table-row'>
            <td colSpan={5} className='table-data'></td>
            <td>Totals</td>
            <td className='text-right  table-data'>{sumArray(inwardItemsWithLot.filter(item => item.inwardRolls), "inwardRolls")}</td>
            <td className='text-right  table-data'>{sumArray(inwardItemsWithLot, "inwardQty")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricItemInwardReport
