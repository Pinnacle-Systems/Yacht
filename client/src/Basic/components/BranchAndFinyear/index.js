import React, { useEffect, useState, useCallback } from 'react';
import { BRANCHES_API, FIN_YEAR_API, USERS_API } from '../../../Api';
import { dropDownFinYear, dropDownListObject } from '../../../Utils/contructObject';
import { getData } from '../../../Utils/Apicalls';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router-dom';
import { HOME_PATH } from '../../../Route/urlPaths';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PRODUCT_ADMIN_HOME_PATH } from '../../../Route/urlPaths';

const BASE_URL = process.env.REACT_APP_SERVER_URL

const BranchAndFinYearForm = ({ setIsGlobalOpen }) => {
    const [loading, setLoading] = useState(false);
    const [currentFinYear, setcurrentFinYear] = useState(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
        ?
        secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
        : "");
    const [currentBranch, setCurrentBranch] = useState(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentBranchId')
        ?
        secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentBranchId')
        : "");

    const [finYears, setFinYears] = useState([]);
    const [branches, setBranches] = useState([]);

    const retrieveFinYearData = useCallback(() => getData(FIN_YEAR_API, setFinYears, setLoading, { companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId") }), []);
    useEffect(retrieveFinYearData, [retrieveFinYearData]);


    const retrieveBranchData = useCallback(() => {
        if (JSON.parse(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "defaultAdmin"))) {
            getData(BRANCHES_API, setBranches, setLoading, {
                active: true, companyId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userCompanyId")
            });
        } else {
            axios({
                method: 'get',
                url: BASE_URL + USERS_API + `/${secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")}`
            }).then((result) => {
                if (result.status === 200) {
                    if (result.data.statusCode === 0) {
                        setBranches(result.data.data.UserOnBranch.map((branch) => { return { branchName: branch.Branch.branchName, id: branch.Branch.id } }));
                    }
                } else {
                    console.log(result);
                }
            }, (error) => {
                console.log(error);
                toast.error("Server Down", { autoClose: 5000 });
            });
        }

    }, []);
    useEffect(retrieveBranchData, [retrieveBranchData]);
        useEffect(() => {
        setCurrentBranch(branches[0]?.id || "");
        let selectedFinYears = dropDownFinYear(finYears?.filter(val => val?.active));
        console.log(selectedFinYears, "selectedFinYears")
        setcurrentFinYear(selectedFinYears[0]?.value || "");
    }, [branches, finYears])
    useEffect(retrieveBranchData, [retrieveBranchData]);

    const navigate = useNavigate();

    const onSubmit = () => {
        if (!(currentBranch && currentFinYear)) {
            toast.info("Select Branch and Fin. Year", { position: 'top-center' });
            return
        }
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentBranchId", currentBranch);
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentFinYear", currentFinYear);
        secureLocalStorage.setItem(sessionStorage.getItem("sessionId") + "currentFinYearActive", isCurrentFinYearActive());
        navigate(HOME_PATH);
        window.location.reload();
    }

    const isCurrentFinYearActive = () => {
        return finYears.find((finYr) => finYr.id === parseInt(currentFinYear)).active;
    }


    console.log(finYears, "finYears", branches, "branches")

    return (
        <div className="flex flex-col items-center justify-center bg-gray-100 w-[400px] h-[280px]">
            <form
                className="w-full text-sm max-w-md px-6 py-8 bg-white shadow-md rounded-md"
            >
                <div className="mb-4">
                    <label
                        className="block mb-2 font-bold text-gray-700"
                        htmlFor="branch"
                    >
                        Branch
                    </label>
                    <select
                        className="w-full px-4 py-2 border rounded-md text-gray-700 bg-white hover:border-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-500"
                        id="branch"
                        name="branch"
                        value={currentBranch}
                        onChange={(e) => { setCurrentBranch(e.target.value) }}
                    >
                        <option value="" hidden>
                            Select Branch
                        </option>
                        {dropDownListObject(branches, "branchName", "id")?.map((branch) => (
                            <option key={branch.value} value={branch.value}>
                                {branch.show}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label
                        className="block mb-2 font-bold text-gray-700"
                        htmlFor="finyear"
                    >
                        Financial Year
                    </label>
                    <select
                        className="w-full px-4 py-2 border rounded-md text-gray-700 bg-white hover:border-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-500"
                        id="finyear"
                        name="finyear"
                        value={currentFinYear}
                        onChange={(e) => { setcurrentFinYear(e.target.value) }}
                    >
                        <option value="" hidden>
                            Select Financial Year
                        </option>
                        {dropDownFinYear(finYears)?.map((finyear) => (
                            <option key={finyear.value} value={finyear.value}>
                                {finyear.show}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='flex justify-between'>
                    <button
                        onClick={() => { setIsGlobalOpen(false) }}
                        className="px-4 py-2 mt-6 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
                        type="button"
                    >
                        Back
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-4 py-2 mt-6 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
                        type="button"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};




export default BranchAndFinYearForm