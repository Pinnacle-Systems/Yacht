import { LogOut } from 'lucide-react'
import Modal from '../../../UiComponents/Modal';
import Logout from '../LogoutConfirm';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from 'react-secure-storage';
import { useGetUserByIdQuery } from '../../../redux/services/UsersMasterService';
import { useDispatch } from 'react-redux';
import { push } from '../../../redux/features/opentabs';
import useOutsideClick from '../../../CustomHooks/handleOutsideClick';
import { useState } from 'react';

const Profile = ({ dp, setProfile, items = [] , setLogout , logout }) => {
    
    // const [logout, setLogout] = useState(false);
    const navigate = useNavigate();
    const [allowedPages, setAllowedPages] = useState([]);
 
    const [hideNavBar, sethideNavBar] = useState(true);

    const navBatItemsStyle = hideNavBar ? "hidden" : "";
  
    const handleOutsideClick = () => {
      sethideNavBar(true);
    };
  
    const ref = useOutsideClick(handleOutsideClick);
  
    const toggleNavMenu = () => {
        setProfile(false);
    };
  
  const dispatch = useDispatch()


    const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
    const {
        data: singleData,
        isFetching: isSingleFetching,
        isLoading: isSingleLoading,
    } = useGetUserByIdQuery(id);

    console.log("items",items,   secureLocalStorage.setItem(
        sessionStorage.getItem("sessionId") + "currentPage"))


    
    return (
        <div className={`absolute rounded-lg right-0 top-10 bg-white p-3 shadow w-[300px] z-10  `}>
            <Modal
                isOpen={logout}
                onClose={() => {
                    setLogout(false);
                }}
                widthClass={""}
            >
                <Logout setLogout={setLogout} />
            </Modal>
            <div  >

           {/* <div  ref={ref}
               onClick={toggleNavMenu}> */}
                   <div>
            
         
            <div className="font-semibold">Profile</div>
            <div className="bg-beige flex p-2 items-center rounded-lg">
                <div className="mr-2 w-12">
                    <img className="rounded-full" width={'30px'} height={'30px'} src={dp} alt="image" />
                </div>
                <div>
                    <div className="text-sm text-black my-0 py-0">
                        {secureLocalStorage.getItem(
                            sessionStorage.getItem("sessionId") + "username"
                        )}
                    </div>
                    <div className="text-[11px] p-0 text-gray-400 -mt-1 ">{singleData?.data?.email}</div>
                </div>
            </div>
            <button className="nav-dropdown-bg z-99 p-2 w-full" onClick={() => { dispatch(push({id:1000000, name: "ACCOUNT SETTINGS"}))}}>
          <pre>ACCOUNT SETTINGS</pre>
        </button>
        {items.map((item, index) => (
          <button
            key={index}
            type="link"
            className="nav-dropdown-bg z-99 p-2 text-start block w-full"
            onClick={(e) => {
                console.log("Hit")
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
           
            <div>

                <div className="flex text-[12px] items-center mt-3 pt-3 border-t mx-2" style={{ borderTopWidth: '0.5px', borderColor: '#dce1e9' }}>
                   <button 
                    type="button"
                    className="flex items-center cursor-pointer w-full nav-dropdown-bg z-99"   
                    onClick={() => {
                        setLogout(true)
                    }
                    }
                     
                    >
                        <LogOut className="mr-2" size={20} />
                        Sign Out
                    </button>
                </div>
            </div>
             
            </div>
            </div>
        </div>
    )
}

export default Profile
