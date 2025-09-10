import React, { useEffect, useState } from "react";
import {
  Home,
  MessageCircle,
  Bell,
  MoreHorizontal,
  Plus,
  UserCircle,
  Search,
  ClipboardList,
} from "lucide-react";
import { HomePage } from "./homePage";
import { Message } from "./Message";
import { Activity } from "./Activity";
import { RiOrderPlayFill } from "react-icons/ri";
import secureLocalStorage from "react-secure-storage";
import Order from "../styleesheet/index.js";
import MailForm from "../Email";
import { OrderImport } from "..";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import {
  useGetOrderByIdQuery,
  useGetOrderQuery,
} from "../../../redux/uniformService/OrderService";
import EmailReport from "../styleesheet/Fds.jsx";
import { getCommonParams } from "../../../Utils/helper";
import { Dashboard } from "../../../Basic/components";
import PurchaseOrders from "../styleesheet/index.js";
export default function Form() {
  const user = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );

  const [active, setActive] = useState(user === null ? "home" : "order");
  const [isOpen, setisOpen] = useState(false);
  const [form, setForm] = useState(false);
  const [mailForm, setMailform] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [currentId, setCurrentId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [attachments, setattachments] = useState([]);
  const { branchId, finYearId, userId } = getCommonParams();

  const [poSentForApproval, setPoSentForApproval] = useState(false);

  const [isSave, setIsSave] = useState(false);
  // const userId = secureLocalStorage.getItem(
  //   sessionStorage.getItem("sessionId") + "userId")

  const { data: singleuserData } = useGetUserByIdQuery(userId, {
    skip: !userId,
  });
  const userRole = singleuserData?.data?.userType || "";
  const { data: singleUserPartyData } = useGetPartyByIdQuery(partyId, {
    skip: !partyId,
  });
  const {
    data: SigleOrderdata,
    isLoading: isSingleloading,
    isFetching: isSinglefetching,
  } = useGetOrderByIdQuery(currentId, { skip: !currentId });

  useEffect(() => {
    setPartyId(singleuserData?.data?.partyType);
  }, [singleUserPartyData]);

  useEffect(() => {
    setattachments(SigleOrderdata?.data?.attachments);
  }, [SigleOrderdata]);

  const getButtonStyle = (name) => ({
    backgroundColor: active === name ? "##212E89" : "transparent",
    borderRadius: "8px",
    Padding: "4px",
  });

  const menuItems = [
    { name: "home", label: "Home", icon: <Home className="h-6 w-6" /> },
    {
      name: "order",
      label: "Order",
      icon: <RiOrderPlayFill className="h-6 w-6" />,
      action: () => setisOpen(true),
    },
    {
      name: "Mail",
      label: "Mail",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      name: "Style Sheet",
      label: "Style Sheet",
      icon: <ClipboardList className="h-6 w-6" />,
    },
    userRole === ""
      ? {
        name: "More",
        label: "OrderImport",
        icon: <MoreHorizontal className="h-6 w-6" />,
      }
      : "",
  ];

  console.log(active, "active");
  return (
    <>
      <div className="flex font-sans my-2 px-0  w-full  first-line:">
        {/* <aside
          className="flex flex-col items-center 
          bg-[#F1F1F0] backdrop-blur-md w-20 h-screen
           border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out"
        >
          {menuItems.map(({ name, label, icon, action }) => (
            <button
              key={name}
              onClick={() => {
                if (form) {
                  setForm(false);
                }
                setActive(name);
                action?.();
              }}
              className={`group relative flex flex-col items-center text-xs font-medium tracking-tight transition-all duration-300 ease-in-out ${
                active === name
                  ? "text-indigo-700"
                  : "text-gray-600 hover:text-indigo-600 "
              } w-full px-1 py-2 mb-1`}
            >
            
              {active === name && (
                <div className="absolute left-0 w-1 h-8 bg-indigo-600  rounded-r-md shadow-md" />
              )}

              <div
                className={`relative p-1.5 rounded-md transition-transform duration-300 ${
                  active === name
                    ? "bg-indigo-100 scale-105 shadow-md"
                    : "group-hover:bg-gray-200 group-hover:scale-100"
                }`}
              >
                <span className="w-5 h-5">{icon}</span>
                {active === name && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600  rounded-full border-2 border-white shadow-sm" />
                )}
              </div>

              <span
                className={`mt-1 transition-all duration-300 ${
                  active === name
                    ? "font-semibold scale-100 opacity-100"
                    : "opacity-80 group-hover:scale-100 group-hover:opacity-100"
                }`}
              >
                {label}
              </span>

            
              <div className="absolute inset-0 -z-10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white to-gray-100 shadow-md" />
            </button>
          ))}
        </aside> */}
        <main className="flex-1 flex flex-col   shadow-2xl  bg-[#F1F1F0]  pb-2  h-full  w-[70%] ">
          <div style={{ backgroundColor: "#F1F1F0" }}>
            {active === "home" && <Dashboard />}
            {active === "Mail" && (
              <MailForm
                setPoSentForApproval={setPoSentForApproval}
                poSentForApproval={poSentForApproval}
                emailId={emailId}
                setEmailId={setEmailId}
                currentId={currentId}
                userRole={userRole}
                singleUserPartyData={singleUserPartyData}
                setActive={setActive}
                setForm={setForm}
                isSave={isSave}
                setIsSave={setIsSave}
                setCurrentId={setCurrentId}
              />
            )}
            {/* {active === "Style Sheet" && <EmailReport attachments={attachments} />} */}
            {active === "Style Sheet" && <PurchaseOrders attachments={attachments} />}
            {active === "More" && userRole === "" ? <OrderImport /> : ""}
            {active === "order" && (
              <Order
                setEmailId={setEmailId}
                active={active}
                setActive={setActive}
                setForm={setForm}
                form={form}
                setMailform={setMailform}
                setCurrentId={setCurrentId}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
