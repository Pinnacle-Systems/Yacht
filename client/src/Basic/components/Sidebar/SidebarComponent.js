import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { push } from "../../../redux/features/opentabs";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";


import designation from './images/designation.png'
import pay from './images/money.png'
import country from './images/flag.png';
import employee from "./images/employee.png";
import state from "./images/map.png";
import city from "./images/city.png";
import department from "./images/department.png";
import calender from "./images/calender.png";
import empcategory from "./images/empcategory.png";
import partycategory from "./images/partycategory.png";
import currency from "./images/currency.png";
import party from "./images/party.png";
import color from "./images/color.png";
import payterm from "./images/payterm.png"
import taxterm from "./images/tax.png";
import taxtemplate from "./images/taxtemplate.png";
import size from "./images/size.png";
import style from "./images/fabImage.jpg";
import location from "./images/location.png";
import sizetemplate from "./images/sizetemplate.png";
import lossreason from "./images/reason.png";
import yarncontent from "./images/cotton.png";
import yarntype from "./images/yarntype.png";
import yarnblend from "./images/yarnblend.png";
import yarn from "./images/yarn.png";
import yarncount from "./images/yarncount.png";
import accessorygroup from "./images/accessorygroup.png";
import accessory from "./images/accessory.png";
import accessoryitem from "./images/accessoryitem.png"
import Machine from "./images/Machine.jpeg";
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import axios from "axios";
import { MachineMaster } from "..";


const SidebarComponent = ({ logo, groups, pages, isMainDropdownOpen, setIsMainDropdownOpen, heading, setIsOpen }) => {
    const dispatch = useDispatch();

    const [hoveredGroupId, setHoveredGroupId] = useState(null);
    const navigate = useNavigate();

    const ref = useRef(null);
    const [search, setSearch] = useState("");

    const filteredData = pages.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const iconMapping = {
        "COUNTRY MASTER":
            <img src={country} alt="country" className="w-[23px]  justify-center items-center bg-white rounded border-2 border-white shadow" />
        ,
        "EMPLOYEE MASTER":
            <img src={employee} alt="country" className="w-[23px]  justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "STATE MASTER":
            <img src={state} alt="country" className="w-[23px]  justify-center items-center  bg-white border-2 border-white rounded shadow" />
        ,
        "CITY MASTER":
            <img src={city} alt="country" className="w-[23px]  justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
         "FIN YEAR MASTER":
            <img src={calender} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "DEPARTMENT MASTER":
            <img src={department} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
       
        "EMPLOYEE CATEGORY MASTER":
            <img src={empcategory} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "PARTY MASTER":
            <img src={party} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "PARTY CATEGORY MASTER":
            <img src={partycategory} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "CURRENCY MASTER":
            <img src={currency} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,

        "UNIT OF MEASUREMENT MASTER": <img />,
        "PAY TERM MASTER":
            <img src={payterm} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "TAX TERM MASTER":
            <img src={taxterm} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "TAX TEMPLATE":
            <img src={taxtemplate} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "COLOR MASTER":
            <img src={color} alt="country" className="w-[23px] flex justify-center items-center bg-white border-2 border-white rounded shadow" />,
        "SIZE MASTER":
            <img src={size} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "SIZE TEMPLATE MASTER":
            <img src={sizetemplate} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "LOCATION MASTER":
            <img src={location} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "FABRIC DESCRIPTION SHEET":
            <img src={style} alt="country" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow" />
        ,
        "PROCESS MASTER":
            <span className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow">
                <img />
            </span>
        ,


        "FABRIC TYPE MASTER": <img />,
        "GSM MASTER": <img />,
        "GAUGE MASTER": <img />,
        "LOOP LENGTH MASTER": <img />,
        "DESIGN MASTER": <img />,


        "DESIGNATION MASTER" : <span className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow">
                <img src={designation} alt="designation" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"/>
            </span>,

            "PAY FREQUENCY" :<span className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow">
                <img src={pay} alt="designation" className="w-[23px]  flex justify-center items-center bg-white border-2 border-white rounded shadow"/>
            </span>

    }





    return (
        <div
            className="fixed top-[3.5%] left-[87px] z-50"
        >

            {isMainDropdownOpen === true ?
                <div onClick={() => setIsMainDropdownOpen(false)} className="bg-black/50 fixed inset-0 -z-10 "
                ></div> : ""}


            {/* Main Dropdown */}
            {isMainDropdownOpen === true && (
                <div className=" "  >

                    <div className=" bg-white p-4 rounded-lg shadow-2xl outline outline-1 outline-gray-300 h-[650px] overflow-y-auto w-[400px] transition-all duration-200 space-y-4">
                        <h1 className="text-lg font-bold">Masters</h1>
                        <div className='relative'>
                            <input className=' w-full pl-3 pr-10 py-2 text-sm text-gray-700 bg-gray-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='search'
                                type='text'
                                name='masters'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)} />
                            <div className='absolute inset-y-0 right-3 flex items-center text-gray-500'>
                                <Search size={16} />
                            </div>
                        </div>
                        <ul className="space-y-2">

                            {groups && groups?.filter(item => item.id).map((group) => (
                                <li
                                    key={group?.id}
                                    className="rounded-md relative my-0"
                                // onMouseEnter={() => setHoveredGroupId(group.id)}
                                // onMouseLeave={() => setHoveredGroupId(null)}
                                >
                                    {/* Sub-Dropdown Trigger */}
                                    <div className={`w-full text-[11px] text-left  items-center  rounded cursor-default`} >
                                        {search.length > 0 ? "" :
                                            <div className="text-[14px] font-semibold ml-2.5 text-gray-800 mt-2">
                                                {(group?.name + " MASTER").toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase())}
                                            </div>}

                                        <ul className=" grid grid-cols-4 gap-2 pt-1">
                                            {filteredData
                                                .filter(
                                                    (page) =>
                                                        parseInt(page.pageGroupId) === parseInt(group.id)
                                                )
                                                .map((page) => (
                                                    <>
                                                        <li
                                                            key={page.id}
                                                            onClick={() => {
                                                                dispatch(push({ name: page.name }));
                                                                secureLocalStorage.setItem(
                                                                    sessionStorage.getItem("sessionId") + "currentPage",
                                                                    page?.id
                                                                );
                                                                // navigate(page.type)
                                                                setIsMainDropdownOpen(false)
                                                                setIsOpen(false)
                                                            }}
                                                            className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 text-xs text-center cursor-pointer transition-all duration-150"
                                                        >

                                                            <div className="flex flex-col items-center justify-cente">
                                                                <div className="mb-1 ">
                                                                    {/* <Gamepad2 size={20} /> */}
                                                                    {iconMapping[page?.name] || <span className="text-gray-400">🔘</span>}

                                                                </div>
                                                                <div className="text-[11.3px] leading-tight">
                                                                    {page?.name.replace(/\bMASTER\b/g, "").trim().toLowerCase().replace(/\b[a-z]/g, char => char.toUpperCase())}
                                                                </div>
                                                            </div>

                                                        </li></>

                                                ))}
                                        </ul>


                                    </div>



                                </li>
                            ))}
                        </ul>

                    </div>
                </div>

            )}
        </div>
    );
};
export default SidebarComponent;