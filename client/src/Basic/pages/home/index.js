import React, { useState } from "react";
import { Dashboard, Header, HomePage } from "../../components";
import Modal from "../../../UiComponents/Modal";
import { BranchAndFinyearForm, LogoutConfirm } from "../../components";
import ActiveTabList from "../../components/ActiveTabList";
import secureLocalStorage from "react-secure-storage";
import SuperAdminHeader from "../../components/SuperAdminHeader";
import { useDispatch, useSelector } from "react-redux";
import { ModalProvider, useModal } from "./context/ModalContext";
import Sidebar from "../../components/Sidebar";
import UserRoles from "../../components/UserAndRolesMaster";
import useIdleLogout from "../../../Utils/useIdleLogout";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { LOGIN } from "../../../Route/urlPaths";

const Home = () => {
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [logout, setLogout] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(false);
  const [isMainDropdownOpen, setIsMainDropdownOpen] = useState(false);
  let navigate = useNavigate();
  const isSuperAdmin = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "superAdmin"
  );
  const userRole = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRole"
  );
  const dispatch = useDispatch();
  const openTabs = useSelector((state) => state.openTabs);

  const handleCloseDropdowns = () => {
    if (isOpen) setIsOpen(false);
    if (profile) setProfile(false);
  };

  const isLoggedIn = !!sessionStorage.getItem("sessionId");
  const onLogout = useCallback(() => {
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
    localStorage.clear();
    sessionStorage.clear();
    navigate(LOGIN);
    window.location.reload();
  },[navigate]);
  // useIdleLogout(onLogout, isLoggedIn);

  return (
    <>
      <ModalProvider>
        <Modal
          isOpen={isGlobalOpen}
          onClose={() => setIsGlobalOpen(false)}
          widthClass={""}
        >
          <BranchAndFinyearForm setIsGlobalOpen={setIsGlobalOpen} />
        </Modal>

        <Modal
          isOpen={logout}
          onClose={() => {
            setLogout(false);
            setProfile(false);
          }}
          widthClass={""}
        >
          <LogoutConfirm setLogout={setLogout} />
        </Modal>

        <div style={{ backgroundColor: "#F1F1F0" }}>
          {isSuperAdmin ? (
            <>
              <SuperAdminHeader
                setIsGlobalOpen={setIsGlobalOpen}
                setLogout={setLogout}
              />
              <div className="bg-[#F1F1F0]">
                <ActiveTabList />
              </div>
            </>
          ) : userRole === "MANUFACTURE" || userRole === "VENDOR" ? (
            <div className="h-screen" onClick={handleCloseDropdowns}>
              <Header
                profile={profile}
                setProfile={setProfile}
                setLogout={setLogout}
              />
              <div className="mt-[30px]  p-5 bg-gray-100  :tab">
                <ActiveTabList />
              </div>
              {openTabs.tabs.length === 0 && (
                <Dashboard setProfile={setProfile} />
              )}
            </div>
          ) : (
            <div className="h-screen" onClick={handleCloseDropdowns}>
              <Header
                profile={profile}
                setProfile={setProfile}
                setLogout={setLogout}
              />
              <Sidebar
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                isMainDropdownOpen={isMainDropdownOpen}
                setIsMainDropdownOpen={setIsMainDropdownOpen}
              />

              <div className="p-2">
                <ActiveTabList />
              </div>
              {openTabs.tabs.length === 0 && (
                <HomePage setProfile={setProfile} />
              )}
            </div>
          )}
        </div>
      </ModalProvider>
    </>
  );
};

export default Home;
