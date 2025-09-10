import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import secureLocalStorage from "react-secure-storage";
import { useDispatch } from "react-redux";
import { push } from "../../../redux/features/opentabs";
export default function AccountDetailsDropDown({ items = [], setLogout}) {

  const dispatch = useDispatch()

  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const handleOutsideClick = () => {
    sethideNavBar(true);
  };

  const ref = useOutsideClick(handleOutsideClick);

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };

  return (
    <div className="relative text-left">
      <button
        ref={ref}
        onClick={toggleNavMenu}
        type="button"
        className="md:bg-transparent inline-flex px-4 py-2 text-2xl justify-end"
        id="menu-button"
        aria-expanded="true"
        aria-haspopup="true"
      >
        <FontAwesomeIcon icon={faUserCircle} />
      </button>
      <div
        className={`-ml-20 absolute mt-2 origin-top-right rounded-md z-50 ${navBatItemsStyle}`}
      >
        <button className="nav-dropdown-bg z-99 p-2 w-full" onClick={() => { dispatch(push({id:1000000, name: "ACCOUNT SETTINGS"}))}}>
          <pre>ACCOUNT SETTINGS</pre>
        </button>
        {items.map((item, index) => (
          <button
            key={index}
            type="link"
            className="nav-dropdown-bg z-99 p-2 text-start block w-full"
            onClick={(e) => {
              dispatch(push({id:item.id, name: item.name}))
              secureLocalStorage.setItem(
                sessionStorage.getItem("sessionId") + "currentPage",
                item.id
              );
            }}
          >
            <pre>{item.name}</pre>
          </button>
        ))}
        <button
          className="nav-dropdown-bg z-99 p-2 text-start w-full"
          onClick={() => setLogout(true)}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
