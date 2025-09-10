import { useState } from "react";
import Modal from "../../../UiComponents/Modal";
import ImageView from "./ImageView";
import { getImageUrlPath } from "../../../Constants";

const SubGrid = ({ item, index, deleteRow }) => {
      const [modalOpen, setModalOpen] = useState(false);
  

  return (
    <>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        widthClass={"w-[50%] h-[50%]"}
        
      >
        <ImageView Image={getImageUrlPath(item?.fabricImage)} />
      </Modal>
      <td className="border border-gray-300 text-[12px] text-center p-0.5">
        {item?.fabType}
      </td>
      <td className="border border-gray-300 text-[12px] text-center p-0.5">
        {item?.fiberContent}
      </td>
      <td className="border border-gray-300 text-[12px] text-right p-0.5">
        {item?.weightGSM}
      </td>
      <td className="border border-gray-300 text-[12px] text-right p-0.5">
        {item?.widthFinished}
      </td>
      <td className="border border-gray-300 text-[12px] text-right p-0.5">
        {item?.smsMoq}
      </td>
      <td className="border border-gray-300 text-[12px] text-right p-0.5">
        {item?.smsMcq}
      </td>
      <td className="border border-gray-300 text-[12px] text-right p-0.5">
        {item?.smsLeadTime}
      </td>
      <td className="border border-gray-300 text-[12px] text-center pl-3">
        {item?.fabricImage && (
          <button
            className="text-blue-600 mt-2  -ml-4  rounded"
            onClick={() => {
              setModalOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </td>
      <td className="text-center border">
        <button
          type="button"
          title="Delete Row"
          onClick={() => deleteRow(index)}
          className="text-red-600 hover:text-red-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 inline-block"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </td>
    </>
  );
};

export default SubGrid;
