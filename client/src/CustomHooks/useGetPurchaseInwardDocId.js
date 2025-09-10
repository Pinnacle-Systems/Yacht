import React, { useState, useEffect } from 'react'
import { useGetBranchQuery } from "../redux/services/BranchMasterService";
import { findFromList } from '../Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import moment from 'moment';
import { useGetPurchaseInwardOrReturnQuery } from '../redux/ErpServices/PurchaseInwardOrReturnServices';

const useGetPurchaseDocId = ({id, prefix}) => {
    const [purchaseDocId, setPurchaseDocId] = useState("")
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
      )
    const { data: purchaseList, isLoading: isPoLoading, isFetching: isPoFetching } = useGetPurchaseInwardOrReturnQuery({ params: {branchId} });
    const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params: {companyId} });
    
    useEffect(() => {
        const purchaseObj = purchaseList ? purchaseList.data.find(item => parseInt(item.id) === parseInt(id)) : null
        if (!purchaseObj) return
        let branchCode = branchList ? findFromList(purchaseObj.branchId, branchList.data, "branchCode") : ""
        const shortCodeForYearCreatedAt = moment.utc(purchaseObj.createdAt).format("YY")
        setPurchaseDocId(`${branchCode}/${prefix}/${shortCodeForYearCreatedAt}/${purchaseObj.docId}`)
    }, [purchaseList, branchList, isBranchFetching, isBranchLoading, isPoFetching, isPoLoading, id])
    return purchaseDocId
}

export default useGetPurchaseDocId