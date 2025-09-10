import React, { useState } from 'react'
import AccountInfo from './AccountInfo';
import PasswordSettings from './PasswordSettings';

const UserRoles = () => {
    const [activeNavBar, setActiveNavBar] = useState("Account Info");

    const subMenus = [
        "Account Info",
        "Password Settings"
    ]

    const getShowSubMenu = () => {
        switch (activeNavBar) {
            case "Account Info":
                return <AccountInfo />
            case "Password Settings":
                return <PasswordSettings />
            default:
                return ""
        }
    }

    return (
        <div className='h-full flex flex-col'>
            <div className='md:flex md:items-center page-heading font-bold heading text-center py-2 justify-center'>
                Account Settings
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

