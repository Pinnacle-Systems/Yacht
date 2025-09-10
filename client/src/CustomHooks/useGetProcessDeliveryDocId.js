import React, { useState, useEffect } from 'react'
import { useGetBranchQuery } from "../redux/services/BranchMasterService";
import { findFromList } from '../Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import moment from 'moment';
import { useGetProcessQuery } from '../redux/ErpServices/processMasterServices';
import { useGetProcessDeliveryQuery } from '../redux/ErpServices/ProcessDeliveryServices';

const useGetProcessDeliveryDocId = ({id}) => {
    const [processDeliveryDocId, setProcessDeliveryDocId] = useState("")
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
      )
    const { data: processDeliveryList, isLoading: isProcessDeliveryLoading, isFetching: isProcessDeliveryFetching } = useGetProcessDeliveryQuery({ params: {branchId} });
    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessQuery({ params: {companyId} });
    const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params: {companyId} });
    
    useEffect(() => {
        const processDeliveryObj = processDeliveryList ? processDeliveryList.data.find(item => parseInt(item.id) === parseInt(id)) : null
        if (!processDeliveryObj) return
        let branchCode = branchList ? findFromList(processDeliveryObj.branchId, branchList.data, "branchCode") : ""
        let processCode = processList ? findFromList(processDeliveryObj.processId, processList.data, "code") : ""
        const shortCodeForYearCreatedAt = moment.utc(processDeliveryObj.createdAt).format("YY")
        setProcessDeliveryDocId(`${branchCode}/${processCode}/PD/${shortCodeForYearCreatedAt}/${processDeliveryObj.docId}`)
    }, [processDeliveryList, branchList, isBranchFetching, isBranchLoading, isProcessDeliveryFetching, isProcessDeliveryLoading, id, processList, isProcessFetching, isProcessLoading])
    return processDeliveryDocId
}

export default useGetProcessDeliveryDocId