import React from 'react'

import { Navigate } from 'react-router-dom'

function Protected({ children, role = "USER"}) {
  // if (!secureLocalStorage.getItem(sessionStorage.getItem("sessionId")+"login")) {
  //   return <Navigate to="/" replace />
  // }
  // if(!(role === secureLocalStorage.getItem(sessionStorage.getItem("sessionId")+"role"))){
  //   return <Navigate to="/" replace />
  // }
  return children
}
export default Protected