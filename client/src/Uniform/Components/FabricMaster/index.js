import { useEffect, useState } from "react";
import { handleMailSendWithMultipleAttachments } from "../../../Utils/helper";
import { useGetUserByIdQuery } from "../../../redux/services/UsersMasterService";
import secureLocalStorage from "react-secure-storage";
import { Button, Card, CardContent, Input } from "@mui/material";
import { DELETE } from "../../../icons";
import { AttachFile } from "@mui/icons-material";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { useUploadMutation } from "../../../redux/uniformService/OrderService";
import { useGetEmailByIdQuery, useGetEmailQuery } from "../../../redux/uniformService/Email.Services";
import { getImageUrlPath } from "../../../Constants";




export default function MailForm({ fileName, singleData, emailId }) {




    const [toEmail, setToEmail] = useState("");
    const [subject, setSubject] = useState('');
    const [Message, setMessage] = useState("")
    const [excelData, setExcelData] = useState([]);
    const [filename, setfileName] = useState('')
    const [files, setFiles] = useState([]);


    const FromEmailAddress = singleData?.data?.email;
    const passskey = singleData?.data?.passKey;


    const id = emailId

    const { data: Emaildata } = useGetEmailByIdQuery(id, { skip: !emailId });


    useEffect(() => {
        setfileName(Emaildata?.data?.poExcelFileName)

    }, [Emaildata])


    const [ccList, setCcList] = useState([""]);
    const handleCcChange = (index, value) => {
        const updated = [...ccList];
        updated[index] = value;
        setCcList(updated);
    };

    const addCcField = () => {
        setCcList([...ccList, ""]);
    };

    const removeCcField = (index) => {
        const updated = ccList.filter((_, i) => i !== index);
        setCcList(updated);
    };


    const handleViewExcel = async () => {
        console.log(fileName, "fileName")

        try {
            const fileUrl = `http://localhost:3000/uploads/1745991676117Order_1745991676045.xlsx`;
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();

            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            setExcelData(jsonData);
            console.log(excelData, 'excelData')
        } catch (error) {
            console.error("Error reading Excel file", error);
        }
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files); // Convert FileList to array
        setFiles(selectedFiles);
    };







    return (

        <>
            <div className="grid grid-cols-2">
                <div className="flex flex-col" >
                    <div className=" p-3 rounded mb-4 h-[90%] w-full">
                        <div>
                            <label className="block  text-black text-sm mb-1" htmlFor="to">To:</label>
                            <input
                                type="email"
                                id="to"
                                placeholder="recipient@example.com"
                                name="username" value={toEmail} onChange={(e) => setToEmail(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm"
                            />

                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cc:</label>
                            {ccList.map((cc, index) => (
                                <div key={index} className="flex items-center space-x-2 mt-1">
                                    <input
                                        type="email"
                                        placeholder={`Cc recipient ${index + 1}`}
                                        value={cc}
                                        onChange={(e) => handleCcChange(index, e.target.value)}
                                        className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm"
                                    />
                                    <button
                                        onClick={() => removeCcField(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addCcField}
                                className="mt-2 text-sm text-blue-600 hover:underline"
                            >
                                + Add Cc
                            </button>
                        </div>

                        <div className="">
                            <label className="block  text-black text-sm mb-1" htmlFor="subject">Subject:</label>
                            <input
                                type="text"
                                id="subject"
                                placeholder="Subject"
                                name="Subject" value={subject} onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm"

                            />
                        </div>

                        <div className="">
                            <label className="block  text-black text-sm mb-1" htmlFor="message">Messag</label>
                            <textarea
                                id="message"
                                rows="7"
                                placeholder="Write your message..."
                                name="Subject" value={Message} onChange={(e) => setMessage(e.target.value)}

                                className="w-full border border-gray-300 px-3 py-2 rounded shadow-sm"
                            ></textarea>
                        </div>




                    </div>
                    <div className="mt-auto flex justify-end w-full">
                        <button className="bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded"
                            onClick={() => {
                                handleMailSendWithMultipleAttachments(FromEmailAddress, toEmail, passskey, subject, Message, filename, files);
                            }}
                        >
                            Send
                        </button>
                    </div>

                    <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileChange(e)}
                        className="mb-4"
                    />

                </div>





                <div className="flex flex-col mt-5 p-5 gap-4">
                    <div className="border-b border-gray-400 w-64">
                        <label htmlFor="">Po Number :  </label>
                        {Emaildata?.data?.order?.docId}
                    </div>
                    <div className="border-b border-gray-400 w-64">
                        <label htmlFor="">Vendor :  </label>
                        {Emaildata?.data?.order?.vendor}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h5v-2H4V5h12v3h2V5a2 2 0 00-2-2H4z" />
                            <path d="M14 11v2h-3v3h-2v-3H6v-2h3V8h2v3h3z" />
                        </svg>
                        <span>{Emaildata?.data?.poExcelFileName}</span>
                    </div>

                    <button
                        onClick={async () => {
                            const fileName = Emaildata?.data?.poExcelFileName;
                            const response = await fetch(getImageUrlPath(fileName));
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                        }}
                        className="text-blue-600 underline text-sm w-fit"
                    >
                        Download Excel
                    </button>
                </div>
            </div>








        </>

    );
}   