import React, { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { findFromList } from "../../../Utils/helper";
import {
  useAddCustomerMutation,
  useGetCustomerQuery,
} from "../../../redux/services/CustomerMasterService";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import Swal from "sweetalert2";

const CustomerSearchComponent = ({
  setCustomerId,
  customerId,
  name = null,
  readOnly,
  id,
  autoFocus = false,
  focusNext,
}) => {
  const [isListShow, setIsListShow] = useState(false);
  const inputRef = useOutsideClick(() => {
    setIsListShow(false);
  });
  const [filteredPages, setFilteredPages] = useState([]);
  const [search, setSearch] = useState("");

  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId",
  );
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId",
  );
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId",
  );
  const {
    data: customerList,
    isLoading: isCustomerLoading,
    isFetching: isCustomerFetching,
  } = useGetCustomerQuery({ params: { companyId } });

  const [addData] = useAddCustomerMutation();

  useEffect(() => {
    let pageSearchComponent = document.getElementById("pageSearch");
    if (!pageSearchComponent) return;
    pageSearchComponent.addEventListener("keydown", function (ev) {
      var focusableElementsString = '[tabindex="0"]';
      let ol = document.querySelectorAll(focusableElementsString);
      if (ev.key === "ArrowDown") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = i < ol.length - 1 ? ol[i + 1] : ol[0];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      } else if (ev.key === "ArrowUp") {
        for (let i = 0; i < ol.length; i++) {
          if (ol[i] === ev.target) {
            let o = ol[i - 1];
            o.focus();
            break;
          }
        }
        ev.preventDefault();
      }
    });
    return () => {
      pageSearchComponent.removeEventListener("keydown", () => {});
    };
  }, []);

  useEffect(() => {
    if (!customerList) return;
    if (!search) {
      setFilteredPages(customerList.data);
    }
    setFilteredPages(
      customerList.data.filter((page) =>
        page.mobileNo.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, customerList, isCustomerFetching, isCustomerLoading]);

  let foundItem;
  foundItem = filteredPages.find((item) => item.mobileNo === search);
  const handleAddNewCustomer = async () => {
    if (foundItem) {
      Swal.fire({
        text: "The Customer Mobile No already exists.",
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    if(search.length < 10){
      Swal.fire({
        text: "Please enter a valid 10-digit Contact number.", 
        icon: "warning",
        timer: 1500,
        showConfirmButton: false,
      });
      return false;
    }
    let response = await addData({
      mobileNo: search,
      companyId,
      branchId,
    }).unwrap();
    setCustomerId(response.data.id);
  };
  //   if (!customerList) return <Loader />;

  const handleKeyDown = (e) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Enter",
  ];

  // allow control keys
  if (allowedKeys.includes(e.key)) return;

  // allow numbers only
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

  return (
    <div id="pageSearch" ref={inputRef} className="mb-2 relative w-full">
      {/* Label – same as ReusableInput */}
      <span className="text-xs text-slate-700 font-bold mb-1 block">
        {name} <span className="text-red-500">*</span>
      </span>

      <div className="col-span-2">
        {isListShow ? (
          <input
            type="text"
            readOnly={readOnly}
            tabIndex={0}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsListShow(true)}
            className="
        w-full px-2 py-1 text-xs
        border border-slate-300 rounded-md
        focus:border-indigo-300 focus:outline-none
      "
            onKeyDown={handleKeyDown}
          />
        ) : (
          <input
            // type="text"
            readOnly   // 
            tabIndex={0}
            value={findFromList(
              customerId,
              customerList ? customerList.data : [],
              "mobileNo",
            )}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsListShow(true)}
            className="
        w-full px-2 py-1 text-xs
        border border-slate-300 rounded-md
      "
            autoFocus={autoFocus}
          />
        )}
      </div>

      {/* Dropdown */}
      {isListShow && !readOnly && (
        <ul
          className="
          absolute mt-1 w-full max-h-[250px] overflow-auto
          bg-white border border-slate-300 rounded-md
          shadow-md z-[40]
        "
        >
          {search && (
            <li
              tabIndex={0}
              className="px-2 py-1 text-xs cursor-pointer hover:bg-indigo-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddNewCustomer();
                  setSearch("");
                  setIsListShow(false);
                  focusNext?.();
                }
              }}
              onClick={() => {
                handleAddNewCustomer();
                setSearch("");
                setIsListShow(false);
                focusNext?.();
              }}
            >
              ➕ Create Customer "{search}"
            </li>
          )}

          {filteredPages.map((customer) => (
            <li
              key={customer.id}
              tabIndex={0}
              className="px-2 py-1 text-xs cursor-pointer hover:bg-indigo-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCustomerId(customer.id);
                  setSearch("");
                  setIsListShow(false);
                  focusNext?.();
                }
              }}
              onClick={() => {
                setCustomerId(customer.id);
                setSearch("");
                setIsListShow(false);
                focusNext?.();
              }}
            >
              {customer.mobileNo} / {customer?.name || ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerSearchComponent;
