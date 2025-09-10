import React, { useEffect, useState } from "react";
// import { PAGE_MASTER_PATH, COMPANY_MASTER_PATH } from "../../../Constants/Config";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { push } from "../../../redux/features/opentabs";
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";

export function MastersDropDown({ heading, items }) {

  const dispatch = useDispatch()

  const [localItems, setlocalItems] = useState([]);
  const [search, setSearch] = useState("");

  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const handleOutsideClick = () => {
    sethideNavBar(true);
    setSearch("");
  };

  const ref = useOutsideClick(handleOutsideClick);

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };
  useEffect(() => {
    if (search)
      setlocalItems(
        items.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    else setlocalItems([...items]);
  }, [items, search]);
  return (
    <div className="relative text-left">
      <div>
        <button
          onClick={toggleNavMenu}
          type="button"
          className="md:bg-transparent inline-flex w-full px-4 py-2"
          id="menu-button"
          aria-expanded="true"
          aria-haspopup="true"
        >
          {heading}
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div
        className={`m-0 absolute mt-2 w-35 origin-top-right rounded-md z-10 ${navBatItemsStyle} bg-white`}
      >
        <input
          ref={ref}
          type="text"
          value={search}
          className="w-64 border p-2 text-black  focus:outline-none rounded"
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
        />
        {localItems.map((item, index) => (
          <button
            key={index}
            type="link"
            className="nav-dropdown-bg z-99 p-2 text-start block w-full"
            onClick={() => {
              dispatch(push({ id: item.id, name: item.name }))
              secureLocalStorage.setItem(
                sessionStorage.getItem("sessionId") + "currentPage",
                item.id
              );
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

