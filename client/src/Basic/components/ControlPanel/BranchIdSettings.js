import React from 'react'
import secureLocalStorage from 'react-secure-storage';
import IdGridForm from './IdGridForm';
import IdNonGridForm from './IdNonGridForm';


const BranchEmployeeIdSettings = () => {
  return (
    <>
      {JSON.parse(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "defaultAdmin"))
        ?
        <IdGridForm />
        :
        <IdNonGridForm />
      }
    </>
  )
}


export default BranchEmployeeIdSettings



