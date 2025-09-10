import React from 'react'

const AccessoryPurchaseOrder = ({ poItems = [], taxDetails }) => {
  return (
    <div>
      <table className=" text-xs border  border-gray-500 table-auto w-full">
        <thead className=' border border-gray-500 top-0 bg-green-200'>
          <tr className='h-8'>
            <th className="table-data text-center w-16">S.no</th>
            <th className="table-data ">Description</th>
            <th className='table-data p-1'>
              Accessory Items
            </th>
            <th className='table-data p-1'>
              Accessory Group
            </th>
            <th className="table-data ">Color</th>
            <th className="table-data ">Size</th>
            <th className="table-data  ">UOM</th>
            <th className="table-data  "> Qty</th>
            <th className="table-data  ">Rate</th>
            <th className="table-data  w-16">Tax</th>
            <th className="table-data  w-16">Amount</th>
          </tr>
        </thead>
        <tbody>
          {poItems.map((value, index) => (
            <tr className='border  border-gray-500 w-full' key={index}>
              <td className='table-data text-center px-1  '>{index + 1} </td>
              <td className='table-data  px-1 h-8 '>
                {value.Accessory?.aliasName}
              </td>
              <td className=' px-1  table-data '>
                {value.Accessory?.accessoryItem.name}
              </td>
              <td className=' px-1  table-data '>
                {value.Accessory?.accessoryItem?.AccessoryGroup?.name}
              </td>
              <td className='table-data text-center px-1  '>
                {value.Color?.name}
              </td>
              <td className='table-data text-center px-1 '>
                {value.Size?.name}
              </td>
              <td className='table-data  px-1 '>
                {value.Uom?.name}
              </td>
              <td className='table-data text-center px-1 text-right '>{parseFloat(value.qty).toFixed(3)}</td>
              <td className='table-data text-center px-1  text-right'>{parseFloat(value.price).toFixed(2)} </td>
              <td className='table-data text-center px-1'>{value.taxPercent} </td>
              <td className='table-data text-right px-1  '>{parseFloat(parseFloat(value.qty) * parseFloat(value.price)).toFixed(2)}</td>
            </tr>
          ))}
          <tr className='border  border-gray-500'>
            <th className='table-data text-center px-1  font-bold text-xs' colSpan={10}>TOTAL</th>
            <td className='px-1 border- text-right'>{parseFloat(taxDetails.taxableAmount).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default AccessoryPurchaseOrder