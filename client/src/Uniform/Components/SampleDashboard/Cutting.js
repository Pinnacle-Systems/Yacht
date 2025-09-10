import moment from 'moment'
import React from 'react'

const Cutting = ({ val, valIndex,userData }) => {
    return (
        <>
       <tr className='text-center'>
  <td
    className='py-1.5 text-center capitalize text-xs'
    title={
      `${
        val?.cuttingUserId > 0
          ? (userData?.data?.find(user => user.id === val?.cuttingUserId)?.username || "")
          : ""
      }\n${val?.cuttingDate ? moment.utc(val?.cuttingDate).format("DD-MM-YYYY") : "Not Finish"}`
    }
  >
    <input
      type="checkbox"
      checked={val?.cutting}
      disabled={true}
      title={
        `${
          val?.cuttingUserId > 0
            ? (userData?.data?.find(user => user.id === val?.cuttingUserId)?.username || "")
            : ""
        }\n${val?.cuttingDate ? moment.utc(val?.cuttingDate).format("DD-MM-YYYY") : "Not Finish"}`
      }
    />
    {/* Optionally uncomment to show the date text directly within the cell */}
    {/* <span>{val?.cuttingDate ? moment.utc(val?.cuttingDate).format("DD-MM-YYYY") : ""}</span> */}
  </td>
</tr>

        </>
    )
}

export default Cutting