import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDollarSign, faClock, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { WEB_LINK } from '../../../icons';
import { FaBed } from 'react-icons/fa';
import { GiBed } from "react-icons/gi";
import cutting from "../../../assets/cutting_12698384.svg"
import printing from "../../../assets/print-products.svg"
import embroiding from "../../../assets/t-shirt.svg"
import stitching from "../../../assets/sewing-machine.svg"
import ironingAndPacking from "../../../assets/ironing_17521832.svg"
import pattern from "../../../assets/clothes.svg"


const Card = ({ filterDate, setFilterDate, sampleData, setIsCompletedOnly, SetIsWipOnly }) => {

    const cuttingCount = sampleData ? sampleData?.flatMap(j => j.sampleDetails)?.filter((data) => data.cutting == false)?.length : 0;
    const printingCount = sampleData ? sampleData?.flatMap(j => j.sampleDetails)?.filter((data) => data.printing == false)?.length : 0;
    const stitchingCount = sampleData ? sampleData?.flatMap(j => j.sampleDetails)?.filter((data) => data.stitching == false)?.length : 0;
    const ironingPackingCount = sampleData ? sampleData?.flatMap(j => j.sampleDetails)?.filter((data) => data.ironingAndPacking == false)?.length : 0;
    const embroidingCount = sampleData ? sampleData?.flatMap(j => j.sampleDetails)?.filter((data) => data.embroiding == false)?.length : 0;
    const patternCount = sampleData ? sampleData?.flatMap(j => j.sampleDetails)?.filter((data) => data.pattern == false)?.length : 0;

    const data = [
        {
            name: "Pattern",
            borderColor: "#4CAF50",

            value: patternCount,
            icon: pattern,
        },
        {
            name: "Cutting",
            borderColor: "#4CAF50",
            value: cuttingCount,
            icon: cutting,
        },
        {
            name: "Printing",
            borderColor: "#4CAF50",
            value: printingCount,
            icon: printing,
        },
        {
            name: "Embroiding",
            borderColor: "#F44336",
            value: embroidingCount,
            icon: embroiding,
        },
        {
            name: "Stitching",
            borderColor: "#FFC107",
            value: stitchingCount,
            icon: stitching,
        },
        {
            name: "Ironing & Packing",
            borderColor: "#4CAF50",
            value: ironingPackingCount,
            icon: ironingAndPacking,
        },

    ];


    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const dispatch = useDispatch();

    return (
        <div className='flex flex-col w-full h-[35%] mt-2'>
            <div className="flex justify-between text-center ml-5 mr-5 ">
                <div className='space-x-4 bg-red-400 hover:bg-white  px-6 py-1  rounded-lg w-[20%]  cursor-pointer' onClick={() => { SetIsWipOnly(true); setIsCompletedOnly(false) }}>
                    <span className="text-xl ">WIP =
                        <span className="ml-2 inline-flex items-center justify-center w-8 h-6 p-4 text-white bg-gray-500 rounded-full">
                            {sampleData?.filter(i => i.sampleDetails?.some(val => val.cutting == false || val.printing == false || val.stitching == false || val.embroiding == false || val.ironingAndPacking == false || val.pattern == false))?.length || 0}
                        </span>
                    </span>
                </div>
                <div className='space-x-4 bg-gray-50 px-6 py-1  rounded-lg w-[20%]'>
                    <span className="text-xl ">Total Sample =
                        <span className="ml-2 inline-flex items-center justify-center w-8 h-6 p-4 text-white bg-blue-500 rounded-full">
                            {sampleData?.length || 0}
                        </span>
                    </span>
                </div>

                <div className='space-x-4  px-6 py-1  rounded-lg w-[20%] cursor-pointer bg-green-400 hover:bg-white ' onClick={() => { setIsCompletedOnly(true); SetIsWipOnly(false) }}>
                    <span type={"button"} className="text-xl " >Completed =
                        <span className="ml-2 inline-flex items-center justify-center w-8 h-6 p-4 text-white bg-green-500 rounded-full">
                            {sampleData?.filter(i => i.sampleDetails?.every(val => val.cutting == true || val.printing == true || val.stitching == true || val.embroiding == true || val.ironingAndPacking == true || val.pattern == true) && i.sampleSubmitBy)?.length || 0}
                        </span>
                    </span>
                </div>

            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 h-full mt-2'>
                {data.map((val, i) => (
                    <div
                        key={i}
                        className={"flex items-center bg-white p-4 rounded-lg shadow-md border-l-4"}
                        style={{ borderColor: val.borderColor }}
                    >
                        <div className='flex-shrink-0'>

                            <img src={val.icon} className='w-12 ' style={{ color: val.borderColor }} />
                        </div>
                        <div className='flex-grow flex flex-col items-center'>
                            <div className='text-2xl font-bold' style={{ color: val.borderColor }}>
                                {val.value}
                            </div>
                            <div className='text-sm text-gray-700'>
                                {val.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
};

export default Card;