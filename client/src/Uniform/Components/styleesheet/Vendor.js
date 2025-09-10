import { findFromList, getDateFromDateTime } from "../../../Utils/helper"
import StatusSidebar from "../StatusSideBar";
export default function Vendor({ allData, setForm, setId, setPoNo, partyData, poSentForApproval }) {

  const stageDefinitions = [
    { key: "sa", title: "Po Received", label: 'PR' },
    { key: "isSave", title: "Assigned", label: 'AS' },
    { key: "poSentForApproval", title: "Sent to Approval", label: 'SA' },
    { key: "isApproved", },
  ];
  const getProgressIndex = (item) => {
    const keys = stageDefinitions.map(s => s.key);
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
  return (
    <>

      <StatusSidebar />

      <div className="bg-[F1F1F0]  shadow rounded-lg h-[76vh]">
        <table className="table-fixed w-full text-[11px] rounded-lg border border-gray-300">
          <thead className="bg-white text-gray-800 border-b border-gray-300">
            <tr >
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[50px]">S No</th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[160px]">PO Number </th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Po date</th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300">Manufacture</th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300">Vendor</th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Assigned date</th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300 w-[100px]">Delivery date</th>
              <th className="text-[11px] font-semibold p-1 border border-gray-300">PO Status</th>



            </tr>
          </thead>

          <tbody className="text-gray-700 text-xs">

            {(allData ? allData?.data : [])?.map((item, index) => {


              const completedStages = stageDefinitions
                .filter((stage) => item?.[stage.key])
                .reverse();

              const approvalStatus = item?.isApproved || "In Progress";

              const approvalColor = approvalStatus === "Approved"
                ? "bg-green-500 text-white"
                : approvalStatus === "Rejected"
                  ? "bg-red-500 text-white"
                  : approvalStatus === "Hold"
                    ? "bg-yellow-500 text-black"
                    : "bg-gray-300 text-black";

              return (
                <>

                  {/* {item?.isSave && ( */}

                  <tr className={`border-b transition-all duration-300 hover:shadow-lg transform table-row px-2 ${index % 2 === 0 ? "bg-gray-100" : "bg-gray-300"
                    }`}
                    onClick={() => {
                      setForm(true)
                      setId(item?.id)
                      setPoNo(item?.docId)
                    }}
                  >
                    <td className="border p-1 text-center text-[11px]">{parseInt(index) + 1}</td>
                    <td className="border p-1 text-center text-[11px]">{item?.docId}</td>
                    <td className="border p-1 text-center text-[11px]">{getDateFromDateTime(item?.orderdate)}</td>
                    <td className="border p-1 text-center text-[11px]">{item?.Manufacture?.name}</td>
                    <td className="border p-1 text-center text-[11px]">{item?.Vendor?.name}</td>
                    <td className="border p-1 text-center text-[11px]">{item?.isSave && item?.updatedAt ? getDateFromDateTime(item?.updatedAt) : ""}</td>
                    <td className="border p-1 text-center text-[11px]">{item?.deliverydate ? getDateFromDateTime(item?.deliverydate) : ""} </td>
                    <td className="border p-1 text-center text-[11px]">
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
                                gradient = "bg-gradient-to-br from-green-400 to-green-700";
                                break;
                              case "Reject":
                                bgColor = "bg-red-600 text-white";
                                gradient = "bg-gradient-to-br from-red-400 to-red-700";
                                break;
                              case "Hold":
                                bgColor = "bg-yellow-400 text-black";
                                gradient = "bg-gradient-to-br from-yellow-300 to-yellow-500";
                                break;
                              default:
                                bgColor = "bg-gray-300 text-gray-600";
                                gradient = "";
                            }
                          } else {
                            if (isReached) {
                              bgColor = "bg-green-600 text-white";
                              gradient = "bg-gradient-to-br from-green-400 to-green-700";
                            }
                          }


                          return (
                            <div
                              key={i}
                              title={
                                stage.key === "isApproved"
                                  ? ` ${item?.isApproved || "In Progress"}`
                                  : stage.title
                              }
                              className={`relative flex items-center justify-center text-xs font-semibold ${bgColor} ${gradient} px-4 py-1 shadow-md ${i !== 0 ? "mr-[-10px]" : ""
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
                    {/* )} */}
                </>

              )
            })}

          </tbody>
        </table>
      </div>

    </>
  )
}









