import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import secureLocalStorage from "react-secure-storage";
import { useGetPagePermissionsByIdQuery } from "../../../redux/services/PageMasterService";
import { CloseButton, DeleteButton, EditButton, NewButton, OpenProjectButton, PrintButtonOnly, SaveButton, SearchButton, ViewButtton } from "../../../Buttons";
import { Refresh } from "@mui/icons-material";


const FormHeaderNew = ({
  refresh,
  refreshPage,
  setNavigateProjectId = null,
  quotesData = null,
  projectOpen = null,
  model,
  saveData = null,
  setReadOnly = null,
  deleteData = null,
  onClose = null,
  onNew = null,
  childRecord = 0,
  onPrint = null,
  openReport = null,
  viewReport = null,
  childRecordValidationActions = ["edit", "delete"],
  setId,
  setPoItems
}) => {

  const openTabs = useSelector((state) => state?.openTabs);

  const activeTab = openTabs?.tabs?.find(tab => tab.active);

  const dispatch = useDispatch()
  const currentPageId = activeTab?.name

  const userRoleId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userRoleId"
  );
  const {
    data: currentPagePermissions,
    isLoading,
    isFetching,
  } = useGetPagePermissionsByIdQuery({ currentPageId, userRoleId }, { skip: !(currentPageId && userRoleId) });

  const handleRefetch = () => {
    refreshPage();
    setId('')
    setPoItems([])
    dispatch({
      type: `Order/invalidateTags`,
      payload: ['Order'],
    });
  }
  const IsSuperAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "superAdmin"
      )
    );
  };

  const IsDefaultAdmin = () => {
    return JSON.parse(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "defaultAdmin"
      )
    );
  };


  const isCurrentFinYearActive = () => {
    return Boolean(
      secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentFinYearActive"
      )
    );
  };

  const hasPermission = (callback, type) => {
    if (childRecordValidationActions.includes(type) && childRecord !== 0) {
      toast.error("Child Record Exists", { position: "top-center" });
      return;
    }
    if (IsSuperAdmin()) {
      callback();
    } else {
      if (isCurrentFinYearActive()) {
        if (IsDefaultAdmin()) {
          callback();
        } else if (currentPagePermissions?.data[type]) {
          callback();
        } else {
          toast.info(`No Permission to ${type}...!`, {
            position: "top-center",
          });
        }
      } else {
        toast.info(" Past Fin Year Only can view!", { position: "top-center" });
      }
    }
  };
  return (
    <>



      <div className="md:flex md:items-center md:justify-between bg-gray-300 p-2">

        <div className="font-bold   text-gray-800 ">
          {model}
        </div>
        <div className="" onClick={() => handleRefetch()}>
          {/* {refresh} */}
          <Refresh />

        </div>
      </div>



    </>
  );
};

export default FormHeaderNew;
