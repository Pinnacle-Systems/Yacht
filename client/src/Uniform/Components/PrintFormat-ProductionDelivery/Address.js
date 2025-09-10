import React from 'react'


const Address = ({ supplierDetails, fromAddress }) => {
  if (!supplierDetails) return null
  return (
    <div>
      <div className=''>
        <table className="text-xs  w-full p-2 table-auto border border-gray-500">
          <thead className='text-left p-1 ml-1'>
            <tr className=''>
              <th className=' font-bold w-1/2 table-data text-sm'>VENDOR DETAILS : </th>
              <th className=' font-bold text-sm '>DELIVERY TO :</th>
            </tr>
          </thead>
          <tbody>
            <tr className=' text-xs'>
              <td className='p-1 table-data'>
                <h2 className='font-bold text-sm text-green-700'>{fromAddress.name}</h2>
                <div> {fromAddress.address} </div>
                <div className=''>Mobile NO :{fromAddress.contactMobile}</div>
                <div className=''>PAN NO :{fromAddress.panNo}</div>
                <div className=''>GST NO :{fromAddress.gstNo}</div>
                <div className=''> EMAIL :{fromAddress.email}</div>
              </td >
              <div className='mt-0'>
                <td className=''>
                  <h2 className='font-bold text-sm text-green-700'>{supplierDetails?.data?.name}</h2>
                  <div>{supplierDetails?.data?.address}</div>
                  <div>Mobile NO  :{supplierDetails?.data?.contactMobile}</div>
                  {supplierDetails?.data?.panNo &&
                    <div className=''>PAN NO :{supplierDetails?.data?.panNo}</div>
                  }
                  {supplierDetails?.data?.gstNo &&
                    <div className=''>GST No :{supplierDetails?.data?.gstNo}</div>
                  }
                  {supplierDetails?.data?.email &&
                    <div className=''>EMAIL :{supplierDetails?.data?.email}</div>
                  }
                </td>

              </div>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}


export default Address