import React, { useState, useEffect } from 'react'
import { useGetBranchQuery } from "../redux/services/BranchMasterService";
import { findFromList } from '../Utils/helper';
import secureLocalStorage from 'react-secure-storage';
import moment from 'moment';
import { useGetProcessQuery } from '../redux/ErpServices/processMasterServices';
import { useGetProcessDeliveryQuery } from '../redux/ErpServices/ProcessDeliveryServices';
import { useGetProcessInwardQuery } from '../redux/ErpServices/ProcessInwardServices';

const useGetProcessInwardDocId = ({id}) => {
    const [processInwardDocId, setProcessDeliveryDocId] = useState("")
    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )
    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
      )
    const { data: processInwardList, isLoading: isProcessInwardLoading, isFetching: isProcessInwardFetching } = useGetProcessInwardQuery({ params: {branchId} });
    const { data: processList, isLoading: isProcessLoading, isFetching: isProcessFetching } = useGetProcessQuery({ params: {companyId} });
    const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params: {companyId} });
    
    useEffect(() => {
        const processInwardObj = processInwardList ? processInwardList.data.find(item => parseInt(item.id) === parseInt(id)) : null
        if (!processInwardObj) return
        let branchCode = branchList ? findFromList(processInwardObj.branchId, branchList.data, "branchCode") : ""
        let processCode = processList ? findFromList(processInwardObj.ProcessDelivery.processId, processList.data, "code") : ""
        const shortCodeForYearCreatedAt = moment.utc(processInwardObj.createdAt).format("YY")
        setProcessDeliveryDocId(`${branchCode}/${processCode}/GRN/${shortCodeForYearCreatedAt}/${processInwardObj.docId}`)
    }, [processInwardList, branchList, isBranchFetching, isBranchLoading, isProcessInwardFetching, isProcessInwardLoading, id, processList, isProcessFetching, isProcessLoading])
    return processInwardDocId
}

export default useGetProcessInwardDocId