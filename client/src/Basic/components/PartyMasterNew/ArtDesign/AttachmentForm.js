import moment from "moment";
import { getImageUrlPath } from "../../../../Constants";
import { renameFile } from "../../../../Utils/helper";
import { Delete, View } from "lucide-react";


const AttachementForm = ({ item, index, readOnly, leadId, dueDate, userRole, setAttachments, attachments, setDueDate }) => {


    const today = new Date();
    function handleInputChange(value, index, field) {
      console.log(value,'value',index,"index",field,"field")

        const newBlend = structuredClone(attachments);
        newBlend[index][field] = value;
        setAttachments(newBlend);
        // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
    };

    function deleteRow(index) {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    function openPreview() {
        window.open(item?.filePath instanceof File ? URL.createObjectURL(item?.filePath) : getImageUrlPath(item.filePath))

    }



    

    return (
        <>

            <tr
                key={index}
                 className={`hover:bg-gray-50 transition-colors border-b   border-gray-200 text-[12px] ${index % 2 === 0 ? "bg-white" : "bg-gray-100"
                  }` }
            >
                <td className="border-r border-white/50 center h-8 text-center "
>
                    {index + 1}
                </td>
                <td className=" border-r border-white/50 h-8 ">
                    <input
                        type="date"
                        disabled
                        className="text-center rounded py-1 w-full  focus:outline-none focus:ring focus:border-blue-300"
                        value={
                            moment(item?.date).format("YYYY-MM-DD")
                        }
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "date")
                        }
                    />
                </td>
                {/* <td className="py-0.5 px-3  w-32 border border-gray-400">
                    <input
                        type="text"
                        className="text-left rounded py-1 px-2 w-full border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                        value={item?.gridUser}
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "gridUser")
                        }

                    />
                </td> */}
                <td className=" border-r border-white/50' h-8 ">
                    <input
                        type="text"
                        className="text-left rounded py-1 px-2 w-full  focus:outline-none focus:ring focus:border-blue-300"
                        value={item?.log}
                        disabled={userRole == ""}
                        onChange={(e) =>
                            handleInputChange(e.target.value, index, "log")
                        }

                    />
                </td>

                <td className=" border-r border-white/50' h-8 ">
                    <div className='flex gap-2'>
                        {(!readOnly && !item.filePath) &&
                            <input
                                disabled={userRole == ""}
                                title=" "
                                type="file"
                                onChange={(e) =>
                                    e.target.files[0] ? handleInputChange(renameFile(e.target.files[0]), index, "filePath") : () => { }
                                }
                            />

                        }
                        {item.filePath &&
                            <>
                                {item.filePath?.name ? item.filePath?.name : item?.filePath}
                                <button onClick={() => { openPreview() }}>
                                    View    
                                </button>
                                {!readOnly &&
                                    <button disabled={userRole == ""} onClick={() => { handleInputChange('', index, "filePath") }}></button>
                                }
                            </>
                        }



                    </div>
                </td>

             <td className=" w-[30px] border-gray-200 gap-1   h-8 justify-end">
                    <div className="flex">
                      {/* {onView && ( */}
                        <button
                          className="text-blue-600  flex items-center   px-1  bg-blue-50 rounded"
                        //   onClick={() => onView(item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      {/* )} */}
                      {/* {onEdit && ( */}
                        <button
                          className="text-green-600 gap-1 px-1   bg-green-50 rounded"
                        //   onClick={() => onEdit(item.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                      {/* )} */}
                      {/* {onDelete && ( */}
                        <button
                          className=" text-red-800 flex items-center gap-1 px-1  bg-red-50 rounded"
                          onClick={() => deleteRow(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {/* <span className="text-xs">delete</span> */}
                        </button>
                      {/* )} */}
                    </div>
                  </td>
            



            </tr>

        </>
    )
}

export default AttachementForm;
