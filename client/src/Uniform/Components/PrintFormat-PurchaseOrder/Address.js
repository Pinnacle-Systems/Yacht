import React from 'react'

const Address = ({ deliveryTo, supplierDetails, deliveryType }) => {
  return (
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
              <h2 className='font-bold text-sm text-green-700'>{supplierDetails.name}</h2>
              <div> {supplierDetails.address} </div>
              <div className=''>Mobile NO :{supplierDetails.contactMobile}</div>
              <div className=''>PAN NO :{supplierDetails.panNo}</div>
              <div className=''>GST NO :{supplierDetails.gstNo}</div>
              <div className=''> EMAIL :{supplierDetails.email}</div>
            </td >
            <div className='mt-0'>
              {deliveryType === "ToSelf" ?
                <td className=''>
                  <h2 className='font-bold text-sm text-green-700'>{deliveryTo?.branchName}</h2>
                  <div>{deliveryTo?.address}</div>
                  <div>Mobile No :{deliveryTo?.contactMobile}</div>
                  {deliveryTo.panNo &&
                    <div className=''>PAN NO :{deliveryTo?.panNo}</div>
                  }
                  {deliveryTo.gstNo &&
                    <div className=''>GST No :{deliveryTo?.gstNo}</div>
                  }
                  {deliveryTo.contactEmail &&
                    <div className=''>EMAIL :{deliveryTo?.contactEmail}</div>
                  }
                </td>
                :
                <td className=''>
                  <h2 className='font-bold text-sm text-green-700'>{deliveryTo?.name}</h2>
                  <div>{deliveryTo?.address}</div>
                  <div>Mobile No :{deliveryTo?.contactMobile}</div>
                  {deliveryTo?.panNo &&
                    <div className=''>PAN NO :{deliveryTo?.panNo}</div>
                  }
                  {deliveryTo?.gstNo &&
                    <div className=''>GST No :{deliveryTo?.gstNo}</div>
                  }
                  {deliveryTo?.email &&
                    <div className=''>EMAIL :{deliveryTo?.email}</div>
                  }
                </td>
              }
            </div>
          </tr>
        </tbody>
      </table>
    </div>
  )
}


export default Address