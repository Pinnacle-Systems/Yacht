import React from 'react'
import {
    useGetBranchQuery,
} from '../../../redux/services/BranchMasterService';
import {
    useGetLocationMasterQuery,
} from "../../../redux/uniformService/LocationMasterServices";
import { Loader } from '../../../Basic/components';
import secureLocalStorage from 'react-secure-storage';
import { AddNewButton } from '../../../Buttons';
import { EMPTY_ICON } from '../../../icons';
import { findFromList } from '../../../Utils/helper';
import { ACTIVE, INACTIVE } from '../../../Strings';

const LocationFormReport = ({ searchValue, setSearchValue, onNew, onClick }) => {

    const params = {
        companyId: secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userCompanyId"
        ),
    };
    const tableHeaders = [
        "Location", "Store", "Status"
    ]
    const { data: allData, isLoading, isFetching } = useGetLocationMasterQuery({ params, searchParams: searchValue });

    const { data: branchList, isLoading: isBranchLoading, isFetching: isBranchFetching } = useGetBranchQuery({ params });
    return (
        <div className="flex flex-col frame w-full h-[90%] overflow-auto">
            <div className="md:text-center md:gap-8">
                <input
                    type="text"
                    className="text-sm bg-gray-100 focus:outline-none border w-full"
                    id="id"
                    placeholder="Search"
                    value={searchValue}
                    onChange={(e) => {
                        setSearchValue(e.target.value);
                    }}
                />
            </div>
            <> {
                (isBranchLoading || isBranchFetching || isLoading || isFetching)
                    ?
                    <Loader />
                    :
                    <>
                        {allData.data.length === 0 ? (
                            <div className="flex-1 flex justify-center text-blue-900 items-center text-3xl">
                                <p>{EMPTY_ICON} No Data Found...! </p>
                            </div>
                        ) : (
                            <div className="md:grid md:justify-items-stretch ">
                                <table className="table-auto text-center">
                                    <thead className="border-2 table-header">
                                        <tr>
                                            {tableHeaders.map((head, index) => (
                                                <th
                                                    key={index}
                                                    className="border-2  top-0 stick-bg"
                                                >
                                                    {head}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="border-2">
                                        {allData.data.map((location, index) => (
                                            <tr
                                                key={index}
                                                className="border-2 table-row"
                                                onClick={() => onClick(location.id)}>
                                                <td className='table-data' >
                                                    {findFromList(location.locationId, branchList.data, "branchName")}
                                                </td>
                                                <td className='table-data'>
                                                    {location.storeName}
                                                </td >
                                                <td className='table-data'>
                                                    {(location.active) ? ACTIVE : INACTIVE}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
            }
            </>
        </div>)
}


export default LocationFormReport