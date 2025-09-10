import moment from "moment";
import React, { useEffect, useState } from "react";
import { CLOSE_ICON, DELETE, VIEW } from "../../../icons";
import { getImageUrlPath } from "../../../helper";
import { renameFile } from "../../../Utils/helper";
import secureLocalStorage from "react-secure-storage";
import Modal from "../../../UiComponents/Modal";
import CommentPreview from "./CommentPreview";

const SampleDetailsForm = ({
  setCurrentImage,
  setIsStyleImageOpen,
  item,
  index,
  readOnly,
  userData,
  sampleFollowId,
  setSampleDetails,
  sampleDetails,
}) => {
  const [openCommentPreview, setOpenCommentPreview] = useState(false);
  const [currentComment, setCurrentComment] = useState("");
  const branchId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "currentBranchId"
  );
  const userId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userId"
  );
  const companyId = secureLocalStorage.getItem(
    sessionStorage.getItem("sessionId") + "userCompanyId"
  );
  const params = {
    branchId,
    companyId,
  };
  console.log(userData, "userDataforchild");

  function handleInputChange(value, index, field) {
    const newBlend = structuredClone(sampleDetails);
    newBlend[index][field] = value;
    setSampleDetails(newBlend);
  }

  function isLineCompletedOrNot(index, field) {
    let item = sampleDetails[index][field];
    return item;
  }

  function lineCompleted(index, value, field) {
    setSampleDetails((sample) => {
      const newItems = structuredClone(sample);

      if (field == "pattern") {
        newItems[index][field] = value;
        newItems[index]["patternDate"] = new Date();
      } else if (field == "cutting") {
        newItems[index][field] = value;
        newItems[index]["cuttingDate"] = new Date();
      } else if (field == "stitching") {
        newItems[index][field] = value;
        newItems[index]["stitchingDate"] = new Date();
      } else if (field == "ironingAndPacking") {
        newItems[index][field] = value;
        newItems[index]["ironingAndPackingDate"] = new Date();
      } else if (field == "embroiding") {
        newItems[index][field] = value;
        newItems[index]["embroidingDate"] = new Date();
      } else if (field == "printing") {
        newItems[index][field] = value;
        newItems[index]["printingDate"] = new Date();
      }

      return newItems;
    });
  }



  function openPreview(field) {
    window.open(
      item[field] instanceof File
        ? URL.createObjectURL(item[field])
        : getImageUrlPath(item[field])
    );
  }
  return (
    <>
      <Modal
        isOpen={openCommentPreview}
        onClose={() => setOpenCommentPreview(false)}
        widthClass={"px-2 h-[20%] w-[50%]"}
      >
        <CommentPreview
          comment={currentComment}
          setOpenCommentPreview={setOpenCommentPreview}
        />
      </Modal>

      <tr key={index} className="hover:bg-gray-100 text-xs transition duration-150">
        <td className="py-0.5 px-1 text-center border border-gray-400">
          {index + 1}
        </td>
        <td className="py-0.5 px-1 border border-gray-400">
          {item.ItemType?.name || ""}
        </td>
        <td className="py-0.5 px-1 border border-gray-400">
          {item.Item?.name || ""}
        </td>
        <td className="py-0.5 px-1 border border-gray-400">
          {item.Fabric?.name || ""}
        </td>
        <td className="py-0.5 px-1 border border-gray-400">
          {item.Size?.name || ""}
        </td>

        <td className="py-0.5 px-1 border border-gray-400">
          {item?.Color?.name || ""}
        </td>
        <td className="py-0.5 px-1 border border-gray-400  text-center">
          <button
            className="text-center"
            onClick={() => {
              setOpenCommentPreview(true);
              setCurrentComment(item.comment);
            }}
          >
            {VIEW}
          </button>
          {/* {item?.comment || ""} */}
        </td>

        <td className="py-0.5 px-1 border border-gray-400 text-center">
          {item.filePath && (
            <>
              <button
                onClick={() => {
                  setIsStyleImageOpen(true);
                  setCurrentImage(item.filePath);
                }}
              >
                {VIEW}
              </button>
            </>
          )}
        </td>
        <td className="py-0.5 px-1 border border-gray-400 text-center">
          {/* {item?.patternUserId > 0 && (
            <tittle className="bg-green-800 text-white rounded px-2 py-0.5 mb-1 text-xs ">
              {
                userData?.data?.find((user) => user.id === item?.patternUserId)
                  ?.username
              }
            </tittle>
          )} */}
          <input
            type="checkbox"
            checked={isLineCompletedOrNot(index, "pattern")}
            disabled={readOnly}
            onChange={(e) => {
              lineCompleted(index, e.target.checked, "pattern");
            }}
            title={
              item?.patternUserId > 0
                ? userData?.data?.find(
                  (user) => user.id === item?.patternUserId
                )?.username
                : ""
            }
          />
        </td>

        <td className="py-0.5 px-1 border border-gray-400 text-center">
          {/* {item?.cuttingUserId > 0 && (
              <tittle className="bg-green-800 text-white rounded px-2 py-0.5 mb-1 text-xs ">
                {
                  userData?.data?.find(
                    (user) => user.id === item?.cuttingUserId
                  )?.username
                }
              </tittle>
            )} */}
          <input
            type="checkbox"
            checked={isLineCompletedOrNot(index, "cutting")}
            disabled={readOnly}
            onChange={(e) => {
              if (isLineCompletedOrNot(index, "cutting")) {
                lineCompleted(index, e.target.checked, "cutting");
              } else {
                lineCompleted(index, e.target.checked, "cutting");
              }
            }}
            title={
              item?.cuttingUserId > 0
                ? userData?.data?.find(
                  (user) => user.id === item?.cuttingUserId
                )?.username
                : ""
            }
          />
          {/* <input type={"checkbox"} value={item?.cutting} checked={item?.cutting} onChange={(e) => handleInputChange(e.target.checked, index, "cutting")} disabled={readOnly} /> */}
        </td>
        <td
          className={`py-0.5 px-1 border border-gray-400  w-40 ${item.printingFilePath ? "pl-16" : "text-left"
            }`}
        >
          {/* {item?.printingUserId > 0 && (
              <p className="bg-green-800 text-white rounded px-2 py-0.5 mb-1 text-xs w-20 ">
                {
                  userData?.data?.find(
                    (user) => user.id === item?.printingUserId
                  )?.username
                }
              </p>
            )} */}
          <div className="flex gap-2">

            <input
              type="checkbox"
              checked={isLineCompletedOrNot(index, "printing")}
              disabled={readOnly}
              onChange={(e) => {
                if (isLineCompletedOrNot(index, "printing")) {
                  lineCompleted(index, e.target.checked, "printing");
                } else {
                  lineCompleted(index, e.target.checked, "printing");
                }
              }}
              title={
                item?.printingUserId > 0
                  ? userData?.data?.find(
                    (user) => user.id === item?.printingUserId
                  )?.username
                  : ""
              }
            />

            {!readOnly && !item.printingFilePath && (
              <input
                title=" "
                className="w-full"
                type="file"
                disabled={readOnly}
                onChange={(e) =>
                  e.target.files[0]
                    ? handleInputChange(
                      renameFile(e.target.files[0]),
                      index,
                      "printingFilePath"
                    )
                    : () => { }
                }
              />
            )}
            {item.printingFilePath && (
              <>
                {/* <button onClick={() => { openPreview("printingFilePath") }}> */}
                <button
                  onClick={() => {
                    setCurrentImage(item.printingFilePath);
                    setIsStyleImageOpen(true);
                  }}
                >
                  {VIEW}
                </button>
                {!readOnly && (
                  <button
                    onClick={() => {
                      handleInputChange("", index, "printingFilePath");
                    }}
                  >
                    {CLOSE_ICON}
                  </button>
                )}
              </>
            )}
          </div>
        </td>
        <td
          className={`py-0.5 px-1 border border-gray-400  w-40 ${item.embroidingFilePath ? "pl-16" : "text-left"
            }`}
        >
          {/* {item?.embroidingUserId > 0 && (
              <p className="bg-green-800 text-white rounded px-2 py-0.5 w-20 mb-1 text-xs ">
                {
                  userData?.data?.find(
                    (user) => user.id === item?.embroidingUserId
                  )?.username
                }
              </p>
            )} */}
          <div className="flex gap-2">

            <input
              type="checkbox"
              checked={isLineCompletedOrNot(index, "embroiding")}
              disabled={readOnly}
              onChange={(e) => {
                if (isLineCompletedOrNot(index, "embroiding")) {
                  lineCompleted(index, e.target.checked, "embroiding");
                } else {
                  lineCompleted(index, e.target.checked, "embroiding");
                }
              }}
              title={
                item?.embroidingUserId > 0
                  ? userData?.data?.find(
                    (user) => user.id === item?.embroidingUserId
                  )?.username
                  : ""
              }
            />

            {!readOnly && !item.embroidingFilePath && (
              <input
                title=" "
                className="w-full"
                type="file"
                disabled={readOnly}
                onChange={(e) =>
                  e.target.files[0]
                    ? handleInputChange(
                      renameFile(e.target.files[0]),
                      index,
                      "embroidingFilePath"
                    )
                    : () => { }
                }
              />
            )}
            {item.embroidingFilePath && (
              <>
                {/* <button onClick={() => { openPreview("embroidingFilePath") }}> */}
                <button
                  onClick={() => {
                    setCurrentImage(item.embroidingFilePath);
                    setIsStyleImageOpen(true);
                  }}
                >
                  {VIEW}
                </button>
                {!readOnly && (
                  <button
                    onClick={() => {
                      handleInputChange("", index, "embroidingFilePath");
                    }}
                  >
                    {CLOSE_ICON}
                  </button>
                )}
              </>
            )}
          </div>
        </td>
        <td className="py-0.5 px-1 border border-gray-400 text-center">
          {/* {item?.stitchingUserId > 0 && (
              <p className="bg-green-800 text-white rounded px-2 py-0.5 mb-1 text-xs ">
                {
                  userData?.data?.find(
                    (user) => user.id === item?.stitchingUserId
                  )?.username
                }
              </p>
            )} */}
          <input
            type="checkbox"
            checked={isLineCompletedOrNot(index, "stitching")}
            disabled={readOnly}
            onChange={(e) => {
              if (isLineCompletedOrNot(index, "stitching")) {
                lineCompleted(index, e.target.checked, "stitching");
              } else {
                lineCompleted(index, e.target.checked, "stitching");
              }
            }}
            title={
              item?.stitchingUserId > 0
                ? userData?.data?.find(
                  (user) => user.id === item?.stitchingUserId
                )?.username
                : ""
            }
          />
        </td>
        <td
          className={`py-0.5 px-1 border border-gray-400  w-40 ${item.ironingAndPackingFilePath ? "pl-16" : "text-left"
            }`}
        >
          <div className="flex gap-2">
            {/* {item?.ironingAndPackingUserId > 0 && (
              <p className="bg-green-800 text-white rounded px-2 py-0.5 mb-1 text-xs ">
                {
                  userData?.data?.find(
                    (user) => user.id === item?.ironingAndPackingUserId
                  )?.username
                }
              </p>
            )} */}
            <input
              type="checkbox"
              checked={isLineCompletedOrNot(index, "ironingAndPacking")}
              disabled={readOnly}
              onChange={(e) => {
                if (isLineCompletedOrNot(index, "ironingAndPacking")) {
                  lineCompleted(index, e.target.checked, "ironingAndPacking");
                } else {
                  lineCompleted(index, e.target.checked, "ironingAndPacking");
                }
              }}
              title={
                item?.ironingAndPackingUserId > 0
                  ? userData?.data?.find(
                    (user) => user.id === item?.ironingAndPackingUserId
                  )?.username
                  : ""
              }
            />

            {!readOnly && !item.ironingAndPackingFilePath && (
              <input
                title=" "
                className="w-full"
                type="file"
                disabled={readOnly}
                onChange={(e) =>
                  e.target.files[0]
                    ? handleInputChange(
                      renameFile(e.target.files[0]),
                      index,
                      "ironingAndPackingFilePath"
                    )
                    : () => { }
                }
              />
            )}
            {item.ironingAndPackingFilePath && (
              <>
                {/* <button onClick={() => { openPreview("ironingAndPackingFilePath") }}> */}
                <button
                  onClick={() => {
                    setCurrentImage(item.ironingAndPackingFilePath);
                    setIsStyleImageOpen(true);
                  }}
                >
                  {VIEW}
                </button>
                {!readOnly && (
                  <button
                    onClick={() => {
                      handleInputChange("", index, "ironingAndPackingFilePath");
                    }}
                  >
                    {CLOSE_ICON}
                  </button>
                )}
              </>
            )}
          </div>
        </td>
      </tr>
    </>
  );
};

export default SampleDetailsForm;
