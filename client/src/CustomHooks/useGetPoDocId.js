import React, { useState, useEffect } from 'react'
import { useGetBranchQuery } from "../redux/services/BranchMasterService";
import {
    useGetPoQuery,
} from "../redux/ErpServices/PoServices";
import { findFromList } from '../Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import moment from 'moment';

const useGetPoDocId = ({poId}) => {
    const [poDocId, setPoDocId] = useState("")
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
      )
    const { data: poList, isLoading: isPoLoading, isFetching: isPoFetching } = useGetPoQuery({ params: {branchId} });
    const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params: {companyId} });
    
    useEffect(() => {
        const poObj = poList ? poList.data.find(item => parseInt(item.id) === parseInt(poId)) : null
        console.log("poObj", poObj,poList, poId)
        if (!poObj) return
        let branchCode = branchList ? findFromList(poObj.branchId, branchList.data, "branchCode") : ""
        const shortCodeForYearCreatedAt = moment.utc(poObj.createdAt).format("YY")
        setPoDocId(`${branchCode}/PO/${shortCodeForYearCreatedAt}/${poObj.docId}`)
    }, [poList, branchList, isBranchFetching, isBranchLoading, isPoFetching, isPoLoading, poId])
    return poDocId
}

export default useGetPoDocId