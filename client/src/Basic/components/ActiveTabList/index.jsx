import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { push, remove } from "../../../redux/features/opentabs";
import { useModal } from "../../pages/home/context/ModalContext";
import {
  CountryMaster,
  PageMaster,
  StateMaster,
  CityMaster,
  DepartmentMaster,
  EmployeeCategoryMaster,
  FinYearMaster,
  UserAndRolesMaster,
  AccountSettings,
  ControlPanel,
  EmployeeMaster,
  PartyCategorymaster,
  CurrencyMaster,
  ColorMaster,
  PayTermMaster,
  SizeMaster,
  LocationMaster,
  MachineMaster,
  PageGroupMaster,
  CompanyMaster,
  Dashboard,
  Role,
  New,
  UomMaster,
  PartyMasterNew,
  PartyMaster,
  SampleEntry,
  BuyerSuffling,
  Designation,
  PayFrequency,
  EmployeeSubCategory,
  PayComponents,
  CompanyPaycode,
  Measurement,
} from "../../components";

import { CLOSE_ICON, DOUBLE_NEXT_ICON } from "../../../icons";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import secureLocalStorage from "react-secure-storage";
import {
  LabDip,
  MaxcontrolPanel,
  MaxHomePage,
  NewPurchaseInward,
  Order,
  PurchaseInward,
  PurchaseOrder,
  StyleMaster,
  TagTypeMater,
} from "../../../Uniform/Components";
import NewOrder from "../../../Uniform/Components/NewOrder";
import Manufacture from "../../../Uniform/Components/styleesheet/Manufacture";
import PurchaseOrders from "../../../Uniform/Components/styleesheet";
import PoForm from "../../../Uniform/Components/PurchaseOrder";
import PartyDetailModal from "../../../Uniform/Components/styleesheet/partyMaster";
import ShiftCommonTemplateMaster from "../ShiftCommonTemplate";
import ShiftMaster from "../ShiftMaster";
import ShiftTemplateMaster from "../ShiftTemplateMaster";

const ActiveTabList = () => {
  const openTabs = useSelector((state) => state.openTabs);

  const dispatch = useDispatch();
  const [showHidden, setShowHidden] = useState(false);
  const [isAllowableUser, setIsAllowableUser] = useState(false);
  const { showAddModal } = useModal();
  const ref = useOutsideClick(() => {
    setShowHidden(false);
  });

  const tabs = {
    "PAGE MASTER": <PageMaster />,
    "COMPANY MASTER": <CompanyMaster />,
    "PAGE GROUP MASTER": <PageGroupMaster />,
    "COUNTRY MASTER": <CountryMaster />,
    "MACHINE MASTER": <MachineMaster />,
    "STATE MASTER": <StateMaster />,
    "CITY MASTER": <CityMaster />,
    "DEPARTMENT MASTER": <DepartmentMaster />,
    "EMPLOYEE CATEGORY MASTER": <EmployeeCategoryMaster />,
    "FIN YEAR MASTER": <FinYearMaster />,
    "USERS & ROLES": <UserAndRolesMaster />,
    ROLE: <Role />,
    "ACCOUNT SETTINGS": <AccountSettings />,
    "CONTROL PANEL": <ControlPanel />,
    "EMPLOYEE MASTER": <EmployeeMaster />,
    "PARTY MASTER": <PartyMaster />,
    "PARTY CATEGORY MASTER": <PartyCategorymaster />,
    "CURRENCY MASTER": <CurrencyMaster />,
    "COLOR MASTER": <ColorMaster />,
    "PAY TERM MASTER": <PayTermMaster />,
    "SIZE MASTER": <SizeMaster />,
    "LOCATION MASTER": <LocationMaster />,
    DASHBOARD: <Dashboard />,
    // "ORDER": <Order />,
    // "HOMEPAGE": <MaxHomePage />,
    // "MAX CONTROL PANEL": <MaxcontrolPanel />,
    "TAG TYPE MASTER": <TagTypeMater />,
    NEW: <New />,
    ORDER: <NewOrder />,
    "FABRIC DESCRIPTION SHEET": <PurchaseOrders />,
    "PURCHASE ORDER": <PoForm />,
    "UOM MASTER": <UomMaster />,
    "CUSTOMER / SUPPLIER  MASTER": <PartyMasterNew />,
    "LAB DIP": <LabDip />,
    "SHIPPED QUANTITY": <NewPurchaseInward />,
    "SAMPLE ENTRY": <SampleEntry />,
    "BUYER SUFFLING": <BuyerSuffling />,
    "DESIGNATION MASTER": <Designation />,
    "PAY FREQUENCY": <PayFrequency />,
    "SHIFT COMMON TEMPLATE MASTER": <ShiftCommonTemplateMaster />,
    "SHIFT MASTER": <ShiftMaster />,
    "SHIFT TEMPLATE MASTER": <ShiftTemplateMaster />,
    "EMPLOYEE SUB CATEGORY": <EmployeeSubCategory />,
    PAYCOMPONENTS: <PayComponents />,
    "COMPANY PAYCODE": <CompanyPaycode />,
    "STYLE MASTER": <StyleMaster />,
    "PURCHASE INWARD": <PurchaseInward />,
    "MEASUREMENT MASTER": <Measurement />,
  };
  const innerWidth = window.innerWidth;
  const itemsToShow = innerWidth / 130;

  let currentShowingTabs = openTabs.tabs.slice(0, parseInt(itemsToShow));

  const hiddenTabs = openTabs.tabs.slice(parseInt(itemsToShow));
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  return (
    <>
      {showAddModal && <PartyDetailModal />}
      <div className="relative mt-10 " style={{ backgroundColor: "#F1F1F0" }}>
        <div className="flex justify-between">
          <div className="flex gap-2">
            {currentShowingTabs?.map((tab, index) => (
              <div
                key={index}
                className={`px-2   rounded-lg text-[11px] d-flex content-center items-center gap-1 hover:bg-gray-500 hover:text-white transition my-1 ${
                  tab.active
                    ? "bg-gray-500 text-white border border-gray-500"
                    : "text-gray-500 border border-gray-500"
                }`}
              >
                <button
                  onClick={() => {
                    dispatch(push({ name: tab.name }));
                    // dispatch(push({ id: tab.id }));
                  }}
                >
                  {tab.name}
                </button>
                <button
                  className="px-1 rounded-xs transition"
                  onClick={() => {
                    dispatch(remove({ name: tab.name }));
                    // dispatch(remove({ id: tab.id }));
                  }}
                >
                  {CLOSE_ICON}
                </button>
              </div>
            ))}
          </div>
          <div>
            {hiddenTabs.length !== 0 && (
              <button onClick={() => setShowHidden(true)}>
                {DOUBLE_NEXT_ICON}
              </button>
            )}
          </div>
          {showHidden && (
            <ul
              ref={ref}
              className="absolute right-0 top-5 bg-[#F1F1F0] h-screen  z-50 text-xs p-1"
            >
              {hiddenTabs.map((tab) => (
                <li
                  key={tab.name}
                  className={`flex justify-between  ${
                    tab.active ? " bg-[#F1F1F0]" : " bg-[#F1F1F0]"
                  } `}
                >
                  <button
                    onClick={() => {
                      dispatch(push({ name: tab.name }));
                      // dispatch(push({ id: tab.id }));
                    }}
                  >
                    {tab.name}
                  </button>
                  <button
                    className="hover:bg-red-400 px-1 rounded-xs transition"
                    onClick={() => {
                      dispatch(remove({ name: tab.name }));
                      // dispatch(remove({ id: tab.id }));
                    }}
                  >
                    {CLOSE_ICON}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {openTabs?.tabs?.map((tab, index) => (
          <div key={index} className={`${tab.active ? "block" : "hidden"}`}>
            {tabs[tab.name]}
          </div>
        ))}
      </div>
    </>
  );
};

export default ActiveTabList;
