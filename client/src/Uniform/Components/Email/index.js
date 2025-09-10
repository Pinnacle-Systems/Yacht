import { useEffect, useState } from "react";
import {
  findFromList,
  getCommonParams,
  handleMailSendWithMultipleAttachments,
} from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input, Modal } from "@mui/material";

import {
  useGetOrderByIdQuery,
  useUpdateOrderMutation,
  useUploadMutation,
} from "../../../redux/uniformService/OrderService";
import {
  useGetEmailByIdQuery,
  useGetEmailQuery,
} from "../../../redux/uniformService/Email.Services";
import { getImageUrlPath } from "../../../Constants";
import { useGetPartyByIdQuery } from "../../../redux/services/PartyMasterService";
import { LongDropdownInput } from "../../../Inputs";
import ArtDesignReport from "../ArtDesign/ArtDesignReport";
import { useDispatch } from "react-redux";
import { Backpack, DeleteIcon, Send } from "lucide-react";
import { Loader } from "../../../Basic/components";
import Swal from "sweetalert2";
import "./swalStyles.css";

export default function MailForm({
  currentId,
  emailId,
  userRole,
  singleUserPartyData,
  poSentForApproval,
  setPoSentForApproval,
  setActive,
  setForm,
  isSave,
  setIsSave,
  setCurrentId,
  setEmailId,
}) {
  const userName = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "username"
  );
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const partyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userType"
  );
  const [toEmail, setToEmail] = useState(["manojbharathi00@gmail.com"]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ccList, setCcList] = useState([""]);
  const [attachments, setattachments] = useState([]);
  const [fileName, setfileName] = useState("");
  const [files, setFiles] = useState([]);
  // const [userId, setUserId] = useState("")
  const [fromAddress, setFromAddress] = useState("");
  const [sendorName, setSendorName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [sendorId, setSendorId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [formReport, setFormReport] = useState(false);
  const [poNumber, setPoNumber] = useState();
  // const [form,setForm] = useState("")

  const id = currentId;

  const SyncformwithDb = () => {
    setToEmail("");
    setSubject("");
    setMessage("");
    setCcList([""]);
    setattachments([""]);
    setfileName("");
    setFromAddress("");
    setSendorName("");
    setReceiverName("");
  };


  const {
    data: Emaildata,
    isLoading: isEmailLoading,
    isFetching: isEmailFetching,
  } = useGetEmailByIdQuery(emailId, { skip: !emailId });

  const {
    data: SigleOrderdata,
    isLoading,
    isFetching,
  } = useGetOrderByIdQuery(id, { skip: !id });
  const { data: partyData } = useGetPartyByIdQuery(partyId, { skip: !partyId });
  // console.log()
  const FromEmailAddress = partyData?.data?.mailId;
  const passskey = SigleOrderdata?.data?.passKey;

  const [updateData] = useUpdateOrderMutation();

  const styleNumber = SigleOrderdata?.data?.orderBillItems?.[0]?.styleCode;

  useEffect(() => {
    const singleAttachments = SigleOrderdata?.data?.attachments || [];
    console.log(singleAttachments, "singleAttachments");
    const emailAttachment = Emaildata?.data?.poExcelFileName
      ? [{ filePath: Emaildata?.data?.poExcelFileName, fileName: Emaildata?.data.poExcelFileName }]
      : [];

    const combined = [...singleAttachments, ...emailAttachment]
    console.log(combined, 'combined')

    setPoNumber(SigleOrderdata?.data?.docId);
    setSubject(SigleOrderdata?.data?.docId);
    setattachments(combined);
    setfileName(Emaildata?.data?.poExcelFileName);
    setReceiverName(SigleOrderdata?.data?.Vendor?.name);
    setSendorName(SigleOrderdata?.data?.Manufacture?.name);
    setSendorId(SigleOrderdata?.data?.Manufacture?.id);
    setReceiverId(SigleOrderdata?.data?.Vendor?.id);
  }, [
    SigleOrderdata,
    Emaildata,
    isLoading,
    isFetching,
    isEmailLoading,
    isEmailFetching,
  ]);
  useEffect(() => {
    setFromAddress(singleUserPartyData?.data?.mailId);
  }, [singleUserPartyData]);

  const handleRemove = (indexToRemove) => {
    setattachments((prev) => prev.filter((_, i) => i !== indexToRemove));
  };
  const addCcField = () => {
    setCcList([...ccList, ""]);
  };

  const handleCcChange = (index, value) => {
    const updated = [...ccList];
    updated[index] = value;
    setCcList(updated);
  };



  const data = {
    mailTransaction: true,
    orderId: id,
    fromAddress,
    sendorName,
    sendorId,
    toEmail,
    receiverName,
    receiverId,
    subject,
    message,
    userRole,
    cc: ccList.map((item) => item).join(","),
    attachments,
    fileName,
    userId, userName
  };

  const handleSubmitCustom = async (callback, data, text) => {
    try {
      const formData = new FormData();
      for (let key in data) {
        if (key === "attachments") {
          formData.append(
            key,
            JSON.stringify(data[key].map((i) => ({ ...i })))
          );
        } else {
          formData.append(key, data[key]);
        }
      }

      console.log(formData,"formData");
      
      let returnData;
      if (text === "Updated") {
        returnData = await callback({ id, body: formData }).unwrap();
        setCurrentId("");
        SyncformwithDb();
      } else {
        // returnData = await callback(formData).unwrap();
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
      console.log("handle", error);
    }
  };

  const MailIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );

  const saveData = () => {
    if (id) {
      handleSubmitCustom(updateData, data, "Updated");
    }
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await handleMailSendWithMultipleAttachments(
        FromEmailAddress,
        toEmail,
        passskey,
        subject,
        message,
        fileName,
        attachments,
        ccList,
        setActive,
        setForm,
        setLoading
      );
    } catch (error) {
      console.error("Email sending failed:", error);
    }
  };

  if (isFetching || isLoading) return <Loader />;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm font-medium text-gray-700">
            Sending Mail...
          </span>
        </div>
      )}
      <div className="flex items-end gap-2 p-2 ml-2 justify-end bg-white">
        <button
          onClick={() => {
            setForm(false);
            setActive("order");
          }}
          className="group flex items-center bg-white text-[#E4002B] border border-[#E4002B] hover:bg-[#E4002B] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E4002B] focus:ring-offset-1"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-1.5 text-xs font-medium">Back</span>
        </button>

        <button
          onClick={() => {
            handleSubmit();

            if (userRole === "VENDOR") {
              setPoSentForApproval(true);
            }

            if (userRole === "MANUFACTURE") {
              setIsSave(true);
            }
            saveData();
            SyncformwithDb();
            setattachments([""]);
            setEmailId("");
          }}
          className="group flex items-center bg-white text-[#303AB2] mr-5 border border-[#303AB2] hover:bg-[#303AB2] hover:text-white transition-all duration-200 ease-in-out px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-[#303AB2] focus:ring-offset-1"
        >
          <svg
            className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v16h16V4H4zm4 8l4 4 4-4"
            />
          </svg>
          <span className="ml-1.5 text-xs font-medium">SEND MAIL</span>
        </button>

      </div>
      <div className="grid grid-cols-3 gap-3 h-full bg-gray-100 p-3 overflow-hidden">
        <Modal
          isOpen={formReport}
          onClose={() => setFormReport(false)}
          widthClass={"px-2 h-[90%] w-[70%]"}
        >
          <ArtDesignReport
            setFormReport={setFormReport}
            tableWidth="100%"
            setAttachments={setattachments}
            attachments={attachments}
          />
        </Modal>

        <div className="col-span-2 h-[533px] flex flex-col gap-2 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg shadow-sm p-3 overflow-y-auto">
            <div className="flex items-center space-x-1.5 pb-2 border-b border-gray-200 mb-3">
              <div className="flex items-center gap-2 p-1 bg-blue-50 rounded-full">
                <MailIcon className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600">Compose Mail</span>
              </div>

              <h2 className="text-base font-semibold text-gray-800"></h2>
            </div>

            <div className="space-y-3">
              <div className="flex border rounded-md border-gray-300">
                <label className="w-16 text-xs text-gray-600 p-1.5 border-r border-gray-300 bg-gray-50">
                  To
                </label>
                <input
                  type="email"
                  placeholder="Recipient email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  className="flex-1 px-2 text-xs focus:outline-none bg-white"
                />
              </div>

              <div className="space-y-1 mt-1">
                {ccList.map((cc, index) => (
                  <div
                    key={index}
                    className="flex border rounded-md border-gray-300"
                  >
                    <label className="w-16 text-xs text-gray-600 p-1.5 border-r border-gray-300 bg-gray-50">
                      CC
                    </label>
                    <textarea
                      rows={1}
                      placeholder={`cc${index + 1}@example.com`}
                      value={cc}
                      onChange={(e) => handleCcChange(index, e.target.value)}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      className="flex-1 px-2 text-xs focus:outline-none bg-white resize-none pt-1 overflow-hidden"
                    />
                  </div>
                ))}
              </div>

              <div className="flex border rounded-md border-gray-300">
                <label className="w-16 text-xs text-gray-600 p-1.5 border-r border-gray-300 bg-gray-50">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 px-2 text-xs focus:outline-none bg-white"
                />
              </div>

              <div className="border rounded-md border-gray-300 h-[200px]">
                <label className="block text-xs text-gray-600 p-1.5 border-b border-gray-300 bg-gray-50">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compose your message..."
                  className="w-full h-[calc(100%-30px)] px-2 text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
              {/* Action buttons can be added here */}
            </div>
          </div>
        </div>

        <div className="h-[533px] flex flex-col gap-3 ">
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6 ">
            <div className="flex flex-col space-y-1 pb-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
                  PO Number
                </span>
                {poNumber && (
                  <span className="text-xs font-bold text-white bg-gray-800 border border-gray-800 rounded px-2 py-1">
                    {`${poNumber} (${styleNumber})`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-3 mt-3">
              {userRole === "MANUFACTURE" && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-600">
                    Vendor
                  </span>
                  <span className="text-xs text-gray-800">{receiverName}</span>
                </div>
              )}

              {userRole === "VENDOR" && (
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-xs font-medium text-gray-600">
                    Manufacturer
                  </span>
                  <span className="text-xs text-gray-800">{sendorName}</span>
                </div>
              )}

              {!userRole && (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      Manufacturer
                    </span>
                    <span className="text-xs text-gray-800">{sendorName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      Vendor
                    </span>
                    <span className="text-xs text-gray-800">
                      {receiverName}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-700 mb-3">
                Attachments
              </h3>

              <div className="flex flex-col gap-2  h-[380px] overflow-y-auto">

                {attachments?.map((item, index) => {
                  const fileName = item?.filePath?.split("/").pop();
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-white rounded-md border border-gray-200">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h5v-2H4V5h12v3h2V5a2 2 0 00-2-2H4z" />
                            <path d="M14 11v2h-3v3h-2v-3H6v-2h3V8h2v3h3z" />
                          </svg>
                        </div>

                        <span className="text-xs text-gray-700 font-medium truncate max-w-[200px]">
                          {fileName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={async () => {
                            const response = await fetch(
                              getImageUrlPath(item.filePath)
                            );
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleRemove(index)}
                          className="text-red-600 hover:text-red-800 text-xs font-medium flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
