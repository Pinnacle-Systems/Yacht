import React, { useState} from 'react'
import { AddNewButton } from '../../../Buttons';
import { DELETE} from '../../../icons';
import { ACTIVE, INACTIVE } from '../../../Strings';
import 'react-toastify/dist/ReactToastify.css';

import { useGetUserQuery} from "../../../redux/services/UsersMasterService";
import Loader from '../Loader';


export default function UserReport({companyId, onNew}) {
    const [searchValue, setSearchValue] = useState("");

    const params = companyId? {companyId}:{companyId:0}
    const { data: allData, isLoading, isFetching } = useGetUserQuery({ params, searchParams: searchValue });

    const deleteBranch = (id) => {
        if (!window.confirm("Confirm delete....?")) {
            return
        }
    }
   
    const columns = ["User", "Role", "Status"]
    return (
        <div className='flex flex-col md:justify-items-center'>
            <div className='text-sm flex sticky top-0 stick-bg justify-evenly'>
                <input type="text" className='text-sm bg-gray-100 focus:outline-none border w-1/2 m-1' id='id' placeholder='Search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                <AddNewButton onClick={onNew}/>
            </div>
            {isLoading || isFetching 
            ?
            <Loader/>
            :
            <table className='table-auto text-center m-1'>
                <thead className='border-2 table-header'>
                    <tr>
                        {columns.map((head, index) => <th key={index} className='border-2 sticky top-0 stick-bg'>{head}</th>)}
                    </tr>
                </thead>
                <tbody className='border-2'>
                    {allData.data.map((dataObj, index) =>
                        <tr key={index} className='border-2 table-row hover:bg-inherit'>
                           <td className='table-data'>{dataObj.username}</td>
                            <td className='table-data'>{dataObj.role.name}</td>
                            <td className='table-data'>{dataObj.active ? ACTIVE : INACTIVE}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            }
        </div>
    )
}