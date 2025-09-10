import React from 'react'

const FabricPurchaseOrder = ({ poItems = [], taxDetails }) => {
  return (
    <div>
      <table border="1px" className=" text-xs table-auto w-full" >
        <thead className=' border border-gray-500 top-0  bg-green-200'>
          <tr className='h-8'>
            <th className="table-data text-center w-16">S.no</th>
            <th className="table-data ">Description</th>
            <th className="table-data ">Color</th>
            <th className="table-data  ">UOM</th>
            <th className=' table-data'>
              Design
            </th>
            <th className=' table-data'>
              Gauge
            </th>
            <th className=' table-data'>
              LL
            </th>
            <th className=' table-data'>
              Gsm
            </th>
            <th className=' table-data'>
              K-Dia
            </th>
            <th className=' table-data'>
              F-Dia
            </th>
            <th className="table-data  ">No. Of Rolls</th>
            <th className="table-data  "> Qty</th>
            <th className="table-data  ">Rate</th>
            <th className="table-data  w-16">Tax</th>
            <th className="table-data  w-16">Amount</th>

          </tr>
        </thead>
        <tbody>
          {poItems.map((value, index) => (
            <tr className='border  border-gray-500 w-full' key={index}>
              <td className='table-data text-center '>{index + 1} </td>

              <td className='table-data   '>
                {value.Fabric?.aliasName}
              </td>
              <td className='table-data text-center  px-1 '>
                {value.Color?.name}
              </td>
              <td className='table-data text-center px-1 '>
                {value.Uom?.name}
              </td>
              <td className='text-center px-1  table-data '>
                {value.Design?.name}
              </td>
              <td className='text-center px-1  table-data '>
                {value.Gauge?.name}
              </td>
              <td className='text-center px-1  table-data '>
                {value.LoopLength?.name}
              </td>
              <td className='text-center px-1  table-data '>
                {value.Gsm?.name}
              </td>
              <td className='text-center px-1  table-data '>
                {value.KDia?.name}
              </td>
              <td className='text-center px-1  table-data '>
                {value.FDia?.name}
              </td>
              <td className='table-data text-center px-1 '>{value.noOfRolls}</td>
              <td className='table-data text-center text-right px-1 '>{parseFloat(value.qty).toFixed(3)}</td>
              <td className='table-data text-center text-right px-1 '>{parseFloat(value.price).toFixed(2)} </td>
              <td className='table-data text-center px-1 '>{value.taxPercent} </td>
              <td className='table-data text-right px-1 '>{parseFloat(parseFloat(value.qty) * parseFloat(value.price)).toFixed(2)}</td>
            </tr>
          ))}
          <tr className='border  border-gray-500'>
            <th className='table-data text-center px-1 h-8 font-bold text-xs' colSpan={14}>TOTAL</th>
            <td className='px-1 h-8  text-right'>{parseFloat(taxDetails.taxableAmount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default FabricPurchaseOrder