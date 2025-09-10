import "./Header.css"
import dp from "../../../assets/default-dp.png"
import { Bell, Search } from "lucide-react"
import { useCallback, useEffect, useState } from "react";
import Profile from "./Profile";
import logo from "../../../assets/max'.png"
// import logo2 from '../../../assets/logo2.png'
import { useGetPageGroupQuery } from "../../../redux/services/PageGroupMasterServices";
import { useGetProjectQuery } from "../../../redux/services/ProjectService";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { PAGES_API, ROLES_API } from "../../../Api";
import { toast } from "react-toastify";
import useOutsideClick from "../../../CustomHooks/handleOutsideClick";
import { getCommonParams } from "../../../Utils/helper";
import { useDispatch } from "react-redux";
import { useGetBranchByIdQuery } from "../../../redux/services/BranchMasterService";
import useLogout from "../../../CustomHooks/useLogout";
import { Users, Briefcase } from 'lucide-react';
import { push } from "../../../redux/features/opentabs";
import MultiLevelDropDown from "../../../UiComponents/MultiSelectDropDown";
import PageSearch from "./PageSearch";
import logo3 from '../../../assets/Eunoia-logo.jpeg'

const BASE_URL = process.env.REACT_APP_SERVER_URL;


const Header = ({ profile, setProfile, setLogout, logout }) => {
  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  console.log(allowedPages, "allowedPages")
  const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" })

  const toggleNavMenu = () => {
    setProfile(!profile);
  };
  const userName = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "username")

  const handleOutsideClick = () => {
    sethideNavBar(false);
  };
  const dispatch = useDispatch();
  const ref = useOutsideClick(handleOutsideClick);

  const { token } = getCommonParams()

  useLogout()


  const userRole = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRole"
  );

  const retrieveAllowedPages = useCallback(() => {
    if (
      JSON.parse(
        secureLocalStorage.getItem(
          sessionStorage.getItem("sessionId") + "defaultAdmin"
        )
      )

    ) {
      axios({
        method: "get",
        url: BASE_URL + PAGES_API,
        params: { active: true },
        headers: { Authorization: token }

      }).then(
        (result) => {
          console.log("result", result.data.data);
          setAllowedPages(result.data.data);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        }
      );
    } else {
      axios({
        method: "get",
        url:
          BASE_URL +
          ROLES_API +
          `/${secureLocalStorage.getItem(
            sessionStorage.getItem("sessionId") + "userRoleId"
          )}`,
        headers: { Authorization: token }
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              console.log(result.data.data.RoleOnPage, "result.data.data.RoleOnPage")
              setAllowedPages(
                result.data.data.RoleOnPage.filter(
                  (page) => page.page.active && page.read
                ).map((page) => {
                  return {
                    active: true,
                    name: page.page.name,
                    type: page.page.type,
                    link: page.page.link,
                    id: page.page.id,
                    pageGroupId: page.page.pageGroupId
                  };
                })
              );
            }
          } else {
            console.log(result);
          }
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
        }
      );
    }
  }, []);
  useEffect(retrieveAllowedPages, [retrieveAllowedPages]);
  const hideExpireWarning = () => {
    let expireWarningDiv = document.getElementById("expireWarning");
    expireWarningDiv.style.display = "none";
  };
  function findElement(id, arr) {
    if (!arr) return ""
    let data = arr.find(item => parseInt(item.id) === parseInt(id))
    return data ? data.name : ""
  }
  // const masters = allowedPages.filter((page) => page.type === "Masters")
  
  const masters = allowedPages.filter((page) => page.type === "Masters" && page.active === true)


  
 
  
  const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } }).filter(group => group.name);
  console.log( mastersGroup,"mastersGroup");
   

  
  const transactions = allowedPages.filter((page) => page.type === "Transactions")
  const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  const reports = allowedPages.filter((page) => page.type === "Reports")
  const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  const { userId, branchId } = getCommonParams()
  const { data: branch } = useGetBranchByIdQuery(branchId, { skip: !branchId });



  return (

    <div className='py-1 w-full flex justify-between items-center bg-black shadow-sm fixed z-50 px-4'>
      {/* Logo */}
     
        {/* <img className="rounded-lg h-8 w-32" src={logo3}   alt="peenics logo" /> */}
        <h1 className="text-white">PAY ROLL</h1>



      {/* dropdown  */}
         {/* <div className="drop">
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MultiLevelDropDown heading={"Masters"} groups={mastersGroup} pages={masters} />
            </div>
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MultiLevelDropDown heading={"Transactions"} groups={transactionsGroup} pages={transactions} />
            </div>
            <div
              className={`block mt-4 lg:inline-block lg:mt-0  mr-4 ${navBatItemsStyle}`}
            >
              <MultiLevelDropDown heading={"Reports"} groups={reportGroups} pages={reports} />
            </div>


          </div> */}

      {/* Center Search Bar */}
      <div className="flex items-center gap-3 ml-[420px]  rounded-md">
      

        {/* Party Icon */}
        {/* <button
          className="flex items-center space-x-1 text-sm px-3 py-1 bg-gray-100 hover:bg-indigo-100 text-indigo-600 rounded-full shadow-sm transition"
          title="Party"
          onClick={() => dispatch(push({ name: "PARTY MASTER" }))}
        >
          <Users size={16} />
          <span>Party</span>
        </button> */}


        {/* Employee Icon */}
        {/* <button
          className="flex items-center space-x-1 text-sm px-3 py-1 bg-gray-100 hover:bg-indigo-100 text-indigo-600 rounded-full shadow-sm transition"
          title="Employee"
        >
          <Briefcase size={16} />
          <span>Employee</span>
        </button> */}
      </div>

      {/* Right Side */}
      <div className="flex items-center text-white space-x-6 text-sm">
          <div className='relative'>
         
               <PageSearch pageList={allowedPages} />
        </div>
         <p>WELCOME</p> &nbsp;{" "}
        <div className="text-white">{userName?.toUpperCase()}</div>
        <img
          className="rounded-full border-2 border-indigo-500 cursor-pointer hover:border-indigo-700 transition-all duration-200 shadow-sm"
          onClick={() => setProfile(!profile)}
          width={25}
          height={25}
          src={dp}
          alt="Profile"
        />

        {profile && (
          <Profile
            dp={dp}
            setProfile={setProfile}
            items={allowedPages.filter((page) => page.type === "AdminAccess")}
            setLogout={setLogout}
            logout={logout}
          />
        )}
      </div>
    </div>

  )
}

export default Header
