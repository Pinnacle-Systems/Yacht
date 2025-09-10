import React, { useState } from 'react'
import BranchIdSettings from './BranchIdSettings';
import ExcessQty from './ExcessQty';
import Approval from './Approval';

const UserRoles = () => {
    const [activeNavBar, setActiveNavBar] = useState("Id Card Settings");

    const subMenus = [
        "Id Card Settings",
        "Excess Qty",
        "Approval"
    ]

    const getShowSubMenu = () => {
        switch (activeNavBar) {
            case "Id Card Settings":
                return <BranchIdSettings />
                    case  "Excess Qty" :
                        return <ExcessQty />
                            case "Approval" :
                                return <Approval/>
            default:
                return ""
        }
    }

    return (
        <div className='h-full flex flex-col'>
            <div className='md:flex md:items-center page-heading font-bold heading text-center py-2 justify-center'>
               Control Panel
            </div>
            <div className='row-span-6 grid grid-cols-8 overflow-clip flex-1'>
                <div className='border-2 bg-white'>
                    <div>
                        {subMenus.map((item, index) =>
                            <div key={index} onClick={() => setActiveNavBar(item)} className={`${activeNavBar === item ? "sub-navbar-active" : "sub-navbar"} text-center cursor-pointer`}>{item}</div>
                        )}
                    </div>
                </div>
                <div className='col-span-7'>
                {getShowSubMenu()}
                </div>
            </div>
        </div>
    )
}

export default UserRoles

