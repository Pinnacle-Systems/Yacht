import React, { useState, useCallback, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { MastersDropDown } from "../MasterDropDown";
import AccountDetailsDropDown from "../AccountDetailsDropdown";
import { APP_NAME } from "../../../Strings";

const SuperAdminHeader = ({ setLogout }) => {
  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };
  const pages = [
    { id: 1, name: "PAGE MASTER" },
    { id: 2, name: "COMPANY MASTER" },
    { id: 3, name: "PAGE GROUP MASTER" },
  ];

  return (
    <div className="relative">
      <nav className="nav-bar-bg flex md:items-center flex-wrap p-">
        <div className="logo-heading flex flex-shrink-0 mr-6 break-words">
          <svg
            className="fill-current h-8 w-8 mr-2"
            width="54"
            height="54"
            viewBox="0 0 54 54"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M13.5 22.1c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05zM0 38.3c1.8-7.2 6.3-10.8 13.5-10.8 10.8 0 12.15 8.1 17.55 9.45 3.6.9 6.75-.45 9.45-4.05-1.8 7.2-6.3 10.8-13.5 10.8-10.8 0-12.15-8.1-17.55-9.45-3.6-.9-6.75.45-9.45 4.05z" />
          </svg>
          <span className="flex font-semibold break-words">
            {APP_NAME} Super Admin Page{" "}
          </span>
        </div>
        <div className="block lg:hidden justify-items-start">
          <button
            onClick={toggleNavMenu}
            className="flex items-center px-3 py-2 button-border"
          >
            <svg
              className="fill-current h-3 w-3"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title className="text-white">Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          </button>
        </div>
        <div className="flex-grow flex items-center lg:w-auto">
          <div className="nav-item flex-grow">
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MastersDropDown heading={"Masters"} items={pages} />
            </div>
          </div>
        </div>
        <div className="nav-item flex justify-between gap-3 items-center">
          <div className="flex">
            {" "}
            <p>WELCOME</p> &nbsp;{" "}
            <pre>
              {" "}
              {secureLocalStorage.getItem(
                sessionStorage.getItem("sessionId") + "username"
              )}
            </pre>
          </div>
          <AccountDetailsDropDown
            setLogout={setLogout}
            items={[]}
          />
        </div>
      </nav>
    </div>
  );
};

export default SuperAdminHeader;
