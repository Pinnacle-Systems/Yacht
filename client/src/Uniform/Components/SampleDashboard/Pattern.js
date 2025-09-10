import React from 'react'
import moment from 'moment';


const Pattern = ({ val, valIndex, userData }) => {
    return (
        <>
<tr className='text-left'>
  <td
    className='py-1.5 gridAlignLeft text-center capitalize text-xs'
    title={
      `${
        val?.patternUserId > 0
          ? (userData?.data?.find(user => user.id === val?.patternUserId)?.username || "")
          : ""
      }\n${val?.patternDate ? moment.utc(val?.patternDate).format("DD-MM-YYYY") : "Not Finish"}`
    }
  >
    <input
      type="checkbox"
      checked={val?.pattern}
      disabled={true}
      title={
        `${
          val?.patternUserId > 0
            ? (userData?.data?.find(user => user.id === val?.patternUserId)?.username || "")
            : ""
        }\n${val?.patternDate ? moment.utc(val?.patternDate).format("DD-MM-YYYY") : "Not Finish"}`
      }
    />
   
  </td>
</tr>


        </>
    )
}

export default Pattern