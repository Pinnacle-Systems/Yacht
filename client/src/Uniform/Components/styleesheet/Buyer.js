import { useState } from "react";
import { findFromList, getDateFromDateTime } from "../../../Utils/helper";
import { Modal } from "../../../Inputs";
import StatusSidebar from "../StatusSideBar";

export default function Buyer({ allData, setForm, setId, setPoNo }) {
  const stageDefinitions = [
    { key: "sa", title: "Po Received", label: "PR" },
    { key: "isSave", title: "Assigned", label: "AS" },
    { key: "poSentForApproval", title: "Sent to Approval", label: "SA" },
    { key: "isApproved" },
  ];

  const getProgressIndex = (item) => {
    const keys = stageDefinitions.map((s) => s.key);
    let index = -1;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === "isApproved") {
        if (item?.isApproved) index = i;
      } else {
        if (item?.[key] === true || item?.[key] === 1) {
          index = i;
        }
      }
    }

    return index;
  };
  const handleClick = (item) => {
    setForm(true);
    setId(item?.id);
    setPoNo(item?.docId);
  };

  return (
    <>
      <StatusSidebar />
      <div className=" bg-[#F1F1F0]  shadow rounded-lg h-[76vh] ">
        <table className="table-fixed w-full text-[11px] rounded-lg border border-gray-300 ">
          <thead className="bg-white text-gray-800 border-b border-gray-300">
            <tr>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[50px]">
                S No
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[160px]">
                Po Number              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">
                Po Date
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300">
                Manufacture
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">
                Received Date
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300">
                Vendor
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">
                Assigned Date
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">
                Delivery Date
              </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300">
                Po Status
              </th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {(allData ? allData?.data : [])?.map((item, index) => {
              const rawStatus = item?.isApproved || "In Progress";

              const approvalStatusMap = {
                Approve: "Approved",
                Reject: "Rejected",
                Hold: "On Hold",
                "In Progress": "In Progress",
              };





              return (
                <tr
                  className={`border-b transition-all duration-300 hover:shadow-lg transform table-row px-2 ${index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
                    }`}
                  onClick={() => {
                    handleClick(item);
                  }}
                >
                  <td className="border p-1 text-center text-[11px]">
                    {parseInt(index) + 1}
                  </td>
                  <td className="border p-1 text-center text-[11px]">
                    {item?.docId}
                  </td>
                  <td className="border p-1 text-center text-[11px]">
                    {item?.orderdate
                      ? getDateFromDateTime(item?.orderdate)
                      : ""}
                  </td>
                  <td className="p-1 border-r-2 text-center text-[11px]">
                    {item?.Manufacture?.name}
                  </td>
                  <td className="border p-1 text-center text-[11px]">
                    {item?.createdAt
                      ? getDateFromDateTime(item?.createdAt)
                      : ""}
                  </td>

                  <td className="p-1 border text-center">
                    {item?.Vendor?.name}
                  </td>
                  <td className="p-1 text-center border">
                    {item?.isSave && item?.updatedAt
                      ? getDateFromDateTime(item?.updatedAt)
                      : ""}
                  </td>
                  <td className="p-1 text-center border">
                    {item?.deliverydate ? getDateFromDateTime(item?.deliverydate)
                      : ""}
                  </td>
                  <td className="p-1 border">
                    <div className="flex items-center space-x-0">
                      {stageDefinitions.map((stage, i) => {
                        const progressIndex = getProgressIndex(item);
                        const isAlwaysActive = i === 0;
                        const isReached = isAlwaysActive || progressIndex >= i;

                        let bgColor = "bg-gray-300 text-gray-600 shadow-inner";
                        let gradient = "";

                        if (stage.key === "isApproved") {
                          switch (item?.isApproved) {
                            case "Approve":
                              bgColor = "bg-green-600 text-white";
                              gradient =
                                "bg-gradient-to-br from-green-400 to-green-700";
                              break;
                            case "Reject":
                              bgColor = "bg-red-600 text-white";
                              gradient =
                                "bg-gradient-to-br from-red-400 to-red-700";
                              break;
                            case "Hold":
                              bgColor = "bg-yellow-400 text-black";
                              gradient =
                                "bg-gradient-to-br from-yellow-300 to-yellow-500";
                              break;
                            default:
                              bgColor = "bg-gray-300 text-gray-600";
                              gradient = "";
                          }
                        } else {
                          if (isReached) {
                            bgColor = "bg-green-600 text-white";
                            gradient =
                              "bg-gradient-to-br from-green-400 to-green-700";
                          }
                        }

                        // const label = item.isApproved.toUpperCase().slice(0, 2); // short code

                        return (
                          <div
                            key={i}
                            title={
                              stage.key === "isApproved"
                                ? `Approval Status: ${item?.isApproved || "In Progress"
                                }`
                                : stage.title
                            }
                            className={`relative flex items-center justify-center text-[11px] font-semibold ${bgColor} ${gradient} px-4 py-1 shadow-md ${i !== 0 ? "mr-[-10px]" : ""
                              }`}
                            style={{
                              clipPath:
                                "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                              zIndex: 50 - i,
                            }}
                          >
                            {stage.label
                              ? stage.label
                              : i === stageDefinitions.length - 1
                                ? item?.isApproved === "Approve"
                                  ? "A"
                                  : item?.isApproved === "Reject"
                                    ? "R"
                                    : item?.isApproved === "Hold"
                                      ? "H"
                                      : "N"
                                : ""}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
