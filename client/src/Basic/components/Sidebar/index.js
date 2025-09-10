import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutDashboard, PanelLeftClose, Table, Home, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import './Sidebar.css';
import secureLocalStorage from 'react-secure-storage';
import { toast } from 'react-toastify';
import { PAGES_API, ROLES_API } from '../../../Api';
import axios from 'axios';
import { useGetPageGroupQuery } from '../../../redux/services/PageGroupMasterServices';
import SidebarComponent from './SidebarComponent';
import { useNavigate } from 'react-router-dom';
import { push } from '../../../redux/features/opentabs';
import { useDispatch } from 'react-redux';
const BASE_URL = process.env.REACT_APP_SERVER_URL;



const Sidebar = ({ isOpen, setIsOpen, isMainDropdownOpen, setIsMainDropdownOpen }) => {

  const navigate = useNavigate()

  const dispatch = useDispatch();

  const [name, setName] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [hideNavBar, sethideNavBar] = useState(true);

  const navBatItemsStyle = hideNavBar ? "hidden" : "";

  const [allowedPages, setAllowedPages] = useState([]);

  const { data: pageGroup } = useGetPageGroupQuery({ searchParams: "" })

  const toggleNavMenu = () => {
    sethideNavBar(!hideNavBar);
  };



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
      }).then(
        (result) => {
          if (result.status === 200) {
            if (result.data.statusCode === 0) {
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
    return data?.name
  }



  const masters = allowedPages.filter((page) => page.type === "Masters" && page.active === true)
  const mastersGroup = [...new Set(masters.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  const transactions = allowedPages.filter((page) => page.type === "Transactions")
  const transactionsGroup = [...new Set(transactions.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })
  const reports = allowedPages.filter((page) => page.type === "Reports")
  const reportGroups = [...new Set(reports.map(page => page.pageGroupId))].map(pageId => { return { id: pageId, name: findElement(pageId, pageGroup?.data) } })


  console.log("masters", masters)


  const headers = [

    {
      heading: 'Masters',
      logo: <Table size={24} />,
      groups: mastersGroup,
      pages: masters
    },
    {
      heading: 'Transactions',
      logo: <PanelLeftClose size={24} />,
      groups: transactionsGroup,
      pages: transactions
    },

  ]
  console.log(isOpen, "isOpen", isMainDropdownOpen, "isMainDropdownOpen")

  function click() {
    if (isOpen && isMainDropdownOpen) {
      setIsOpen(true);
      setIsMainDropdownOpen(false)
    }
    if (!isOpen && !isMainDropdownOpen) {
      setIsOpen(true);

    }
  }


  return (
    <>
      <div


        // onClick={() => {
        //   if (isOpen && isMainDropdownOpen) {
        //     setIsOpen(true);
        //     setIsMainDropdownOpen(false)
        //   }
        //      if (!isOpen && !isMainDropdownOpen) {
        //     setIsOpen(true);

        //   }
        // }
        // }
        onClick={() => {
          if (!isOpen && !isMainDropdownOpen) {
            setIsOpen(true);

          }

        }
        }
        className="fixed z-[99] top-[18.5%] left-0 bg-gradient-to-r from-gray-700 to-gray-600 text-white w-8 h-12 flex items-center justify-center rounded-r-xl shadow-xl cursor-pointer transition-all duration-300 hover:from-gray-800 hover:to-gray-700 hover:scale-105"
      // className='fixed z-[99] top-[16.5%]  bg-gray-600 opacity-50 px-0 h-[10%] flex items-center rounded-end cursor-pointer'
      >
        <div className='text-white'>{isOpen ? <ArrowLeftCircle size={22} className="text-white transition-all duration-300" /> : <ArrowRightCircle size={22} className="text-white transition-all duration-300" />}</div>
      </div>
      {isOpen &&
        <div className={`fixed z-[999] top-[16.5%] left-[1.5rem] bg-[#343a40] text-white w-[72px] ${isMainDropdownOpen ? "h-[450px]" : "h-auto"
          } rounded-lg py-4 flex flex-col items-center shadow-xl transition-all duration-300`}>



          <div className=" " >
            <div className='text-white hover:text-gray-300 cursor-pointer mb-4 flex flex-col items-center'
              onClick={() => dispatch(push({ name: "DASHBOARD" }))}
            >
              <a className=' mx-auto text-light flex justify-center hover:text-gray-400 ' type="button" ><LayoutDashboard size={24} /></a>
              <div className='text-[11px] text-center mt-1'>Dashboard</div>
            </div>
            {/* <div className='text-white hover:text-gray-400 cursor-pointer mb-3 '
              onClick={() => dispatch(push({ name: "HOMEPAGE" }))}

            >
              <a className=' mx-auto text-light flex justify-center hover:text-gray-400 ' type="button" ><Home size={20} /></a>
            <div className='text-[8.5px] w-full text-center'>Home</div>
            </div> */}

            {isOpen && headers.map((ele, index) => {

              console.log("ele", ele)

              return (

                <div
                  key={index}
                  onClick={() => { setIsMainDropdownOpen(true); setName(ele.heading) }}
                  className="hover:text-gray-300 cursor-pointer my-3 flex flex-col items-center transition">

                  <a className=" cursor-pointer text-white flex justify-center">{ele.logo}</a>
                  <div className="text-[11px] text-center mt-1">{ele.heading}</div>
                </div>

              )
            })}

          </div>


        </div>}

      <div className="my-0 ">

        <ul className='my-0 flex flex-col '>


          {headers.map((ele, index) => {
            return (
              <div key={index}>
                <li >
                  {name === ele.heading && <SidebarComponent setIsOpen={setIsOpen} heading={ele.heading} logo={ele.logo} groups={ele.groups} pages={ele.pages} isMainDropdownOpen={isMainDropdownOpen} setIsMainDropdownOpen={setIsMainDropdownOpen} />}
                </li>
              </div>
            )
          })}

        </ul>

      </div>
    </>
  )
}

export default Sidebar;