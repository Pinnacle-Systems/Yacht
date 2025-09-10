import React, { useEffect, useMemo } from 'react'

import { useState } from 'react';

import Card from './Card';
import SampleTable from './Table';
import { useGetSampleQuery } from '../../../redux/uniformService/SampleService';
import secureLocalStorage from 'react-secure-storage';
import { useGetUserQuery } from '../../../redux/services/UsersMasterService';
const SampleDashboard = () => {

    const branchId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    )


    const userId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    )


    const companyId = secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    )

    const params = {
        branchId
    };
    const [filterDate, setFilterDate] = useState('');
    // const [paymentFilter, setPaymentFilter] = useState("All");
    // const [consultFilter, setConsultFilter] = useState("All");
    // const [searchToken, setSearchToken] = useState('');
    // const [patientGender, setPatientGender] = useState('');
    // const [searchPatientRegNo, setSearchPatientRegNo] = useState('');
    // const [searchPatientName, setSearchPatientName] = useState('')
    const [dataPerPage, setDataPerPage] = useState("10");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [searchSchool, setSearchSchool] = useState("");
    const [searchContact, setSearchContact] = useState("")
    const [searchContactName, setSearchContactName] = useState("");
    const [isCompletedOnly, setIsCompletedOnly] = useState(false);
    const [isWipOnly, SetIsWipOnly] = useState(false)



    const searchFields = { searchSchool, searchContact, searchContactName }

    useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, searchSchool, searchContact, searchContactName])

    const { data: sampleData, isSampleLoading, isSampleFetching } = useGetSampleQuery({ params: { branchId, ...searchFields, pagination: true, dataPerPage, pageNumber: currentPageNumber, isCompletedReport: isCompletedOnly, isDashboard: true, isWipOnly: isWipOnly } });

    const {data:userData} = useGetUserQuery({params})
    // let isPaymentDone = useMemo(() => {
    //     let isPaymentDone;
    //     if (paymentFilter === "Done") {
    //         isPaymentDone = true
    //     } else if (paymentFilter === "Pending") {
    //         isPaymentDone = false
    //     }
    //     return isPaymentDone
    // }, [paymentFilter]);
    // let consulted = useMemo(() => {
    //     let consulted;
    //     if (consultFilter === "Consulted") {
    //         consulted = true
    //     } else if (consultFilter === "Waiting") {
    //         consulted = false
    //     }
    //     return consulted
    // }, [consultFilter]);



    useEffect(() => { setCurrentPageNumber(1) }, [dataPerPage, filterDate])
    useEffect(() => {
        if (sampleData?.totalCount) {
            setTotalCount(sampleData?.totalCount)
        }
    }, [sampleData, isSampleLoading, isSampleFetching])

    return (
        <div className='flex flex-col px-1 bg-gray-200 mt-0.5 h-[95%] overflow-auto'>

            <div><Card filterDate={filterDate} setFilterDate={setFilterDate} sampleData={sampleData?.data || []} setIsCompletedOnly={setIsCompletedOnly} SetIsWipOnly={SetIsWipOnly} /></div>
            <div><SampleTable isCompletedOnly={isCompletedOnly} isWipOnly={isWipOnly} sampleData={sampleData?.data || []}
              userData={ userData }  totalCount={totalCount} currentPageNumber={currentPageNumber} setCurrentPageNumber={setCurrentPageNumber} dataPerPage={dataPerPage}
                setDataPerPage={setDataPerPage} searchSchool={searchSchool} setSearchSchool={setSearchSchool}
                setSearchContact={setSearchContact} searchContact={searchContact} searchContactName={searchContactName} setSearchContactName={setSearchContactName}
            /></div>
        </div>
    )
}
export default SampleDashboard
