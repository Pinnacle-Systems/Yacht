import React from "react";
import { ExclamationCircleIcon } from "@heroicons/react/solid";
import { useNavigate } from "react-router-dom";
import { LOGIN } from "../../../Route/urlPaths";

export default function Logout({ setLogout }) {
  let navigate = useNavigate();
  const onLogout = () => {
    const removeKeys = [];
    let len = localStorage.length;
    for (let i = 0; i < len; ++i) {
      if (localStorage.key(i).split(".").length === 3) {
        if (
          localStorage
            .key(i)
            .split(".")[2]
            .startsWith(sessionStorage.getItem("sessionId"))
        ) {
          removeKeys.push(localStorage.key(i));
        }
      }
    }
    for (let i of removeKeys) {
      localStorage.removeItem(i);
    }
    sessionStorage.removeItem("sessionId");
    navigate(LOGIN);
  };

  return (
    <>
      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationCircleIcon
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <div
              as="h3"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Confirm
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to logout now ?
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button
          type="button"
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={onLogout}
        >
          Log Out
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => {
            setLogout(false);
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
}
