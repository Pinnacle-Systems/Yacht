import { Check, Plus } from "lucide-react";
import moment from "moment";
import { useEffect } from "react";
import AttachementForm from "./AttachmentForm";
import { HiPlus } from "react-icons/hi";


const ArtDesignReport = ({ id, index, readOnly, userRole, setFormReport, formReport, setAttachments, attachments, setDueDate }) => {

  const today = new Date();
  const Model = "Attachments"


  function addNewComments() {
    setAttachments((prev) => [...prev, { log: "", date: today, filePath: "" }]);
    // setDueDate(moment.utc(today).format("YYYY-MM-DD"));
  }




  useEffect(() => {
    if (attachments?.length >= 1) return
    setAttachments(prev => {
      let newArray = Array.from({ length: 1 - prev?.length }, () => {
        return { date: today, filePath: "", log: "" }
      })
      return [...prev, ...newArray]
    }
    )
  }, [setAttachments, attachments])


  return (
    <>
       <div className="bg-[F1F1F0] rounded-lg shadow-xl w-full  overflow-auto p-3  ">
                      {/* <div className="flex justify-between bg-white items-center my-2 rounded-md  px-3 py-1">
                        <h3 className="text-gray-800 font-semibold text-sm p-1">{Model}</h3>
                        <div className='flex flex-row gap-3'>
                   
                     
                            <button
                          // onClick={saveData}
              
                            className="px-2 py-1 hover:bg-green-600 hover:text-white rounded text-green-600 
                                    border border-green-600 flex items-center gap-1 text-xs">
                            <Check className="w-4 h-4" />
                            {id ? "Update" : "Save"}
                          </button>
                        </div>
                          
                      </div> */}
                   

                 <div className="flex-1 overflow-auto py-2">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                              
                
      <div className="lg:col-span-12 space-y-3">
                {/* <div className="bg-white p-3 rounded-md border border-gray-200  "> */}
                      <div className="border border-slate-200 p-2 bg-white rounded-md shadow-sm max-h-[340px] overflow-auto">
                                  <div className="flex justify-between items-center mb-2">
                                      <h2 className="font-medium text-slate-700">List Of Attachments</h2>
                                      <div className="flex gap-2 items-center">
                  
                                          <button
                                              onClick={() => {
                                                  addNewComments()
                                              }}
                                              className="hover:bg-green-600 text-green-600 hover:text-white border border-green-600 px-2 py-1 rounded-md flex items-center text-xs"
                                          >
                                              <HiPlus className="w-3 h-3 mr-1" />
                                              Add Item
                                          </button>
                                      </div>
                  
                                  </div>
                         <div className="grid grid-cols-1 gap-3 p-3  border-collapse bg-[#F1F1F0] rounded-xl shadow-sm overflow-auto">
                                 <table className="bg-gray-200 text-gray-800 text-sm table-auto w-full">
                <thead className=" py-2  font-medium ">
                  <tr>
                    <th className="py-2  font-medium  w-10 text-center border-r border-white/50">S.No</th>
                    <th className="py-2  font-medium  w-24 text-center border-r border-white/50">Date</th>
                    {/* <th className="py-1 px-3 w-32 text-left border border-gray-400">User</th> */}
                    <th className="py-2  font-medium  center border-white/50"> Name</th>
                    <th className="py-2  font-medium center w-60 border-r border-white/50">File</th>
                      <th className="py-2  font-medium  w-10 text-center">
                        actions
                      </th>
                    
                  </tr>
                </thead>


                <tbody>
                  {(attachments ?? [])?.map((item, index) => (
                    <AttachementForm
                      key={index}
                      item={item}
                      index={index}
                      readOnly={false}
                      setAttachments={setAttachments}
                      attachments={attachments}
                      userRole={userRole}
                    />
                  ))}
                </tbody>
                        </table>
                                                
                                                                 
                                                      </div>                                                                                     
                                                      </div>  
              {/* </div>  */}


          </div>
      </div>
    </div>
       </div>
          {/* <div className="w-full grid grid-cols-1 mt-2  px-5">
            <div className="grid grid-cols-1 gap-4 p-1">
              <table className="border border-gray-300 text-sm table-auto w-full">
                <thead className="bg-gray-300 border border-gray-400">
                  <tr>
                    <th className="py-1 px-3 w-10 text-left border border-gray-400">S.No</th>
                    <th className="py-1 px-3 w-24 text-left border border-gray-400">Date</th>
                    <th className="py-1 px-3 text-left border border-gray-400">Comments</th>
                    <th className="py-1 px-3 text-left w-60 border border-gray-400">File</th>
                    {userRole === "VENDOR" &&
                      <th className="py-1 px-3 w-10 text-center">
                        <button
                          onClick={addNewComments}
                          className="text-green-500 hover:text-green-700 transition duration-150"
                        >
                          {Plus}
                        </button>
                      </th>
                    }
                  </tr>
                </thead>


                <tbody>
                  {(attachments ?? []).map((item, index) => (
                    <AttachementForm
                      key={index}
                      item={item}
                      index={index}
                      readOnly={false}
                      setAttachments={setAttachments}
                      attachments={attachments}
                      userRole={userRole}
                    />
                  ))}
                </tbody>
              </table>

            </div>
       

        <div className="h-[60px] flex items-center justify-end px-5">
          <button
            onClick={() => setFormReport?.(false)}
            className="bg-blue-500 text-white px-3  rounded hover:bg-blue-600"
          >
            DONE
          </button>
        </div>
       </div> */}

    </>

  )
}

export default ArtDesignReport
