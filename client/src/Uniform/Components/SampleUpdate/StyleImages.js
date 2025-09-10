import { faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react'
import { Delete } from '../../../Buttons';

import { toast } from 'react-toastify';
import { getImageUrlPath } from '../../../Utils/helper';
import empty from "../../../assets/empty.png"
import { CheckBox } from '../../../Inputs';
import { useStyleImageDeleteMutation, useStyleImageUploadMutation } from '../../../redux/uniformService/SampleService';
import { VIEW } from '../../../icons';
import ViewImage from './ViewImage';
import Modal from "../../../UiComponents/Modal";


const StyleImages = ({ id, styleImages, setStyleImages, setIsStyleImageOpen }) => {
    const [styleImageUpload] = useStyleImageUploadMutation();
    const [removeData] = useStyleImageDeleteMutation();
    const [isViewImage, setIsViewImage] = useState(false)
    const [currentImage, setCurrentImage] = useState()
    function handleOnChangeImage(file, index, field) {
        setStyleImages(prev => {
            const newObj = structuredClone(prev)
            newObj[index][field] = file
            return newObj
        })
    }

    const handleUpload = async (text, image, comment) => {
        if (!comment) {
            if (!window.confirm("Comment is Empty!....Are you sure to save...?")) {
                return
            }
        }
        try {
            const formData = new FormData()

            if (image instanceof File) {
                formData.append("image", image);
            }
            formData.append("comment", comment);

            let returnData = await styleImageUpload({ id: id, body: formData }).unwrap();

            toast.success(text + " " + "Successfully");
        } catch (error) {
            console.log("handle");
        }

    };

    const deleteData = async (id) => {
        if (id) {
            if (!window.confirm("Are you sure to delete...?")) {
                return;
            }
            try {
                await removeData(id)

                toast.success("Deleted Successfully");
            } catch (error) {
                toast.error("something went wrong");
            }
        }
    };


    const imageFormatter = (image) => {
        if (image) {
            if ((image) instanceof File) {
                return URL.createObjectURL(image)
            } else {
                return getImageUrlPath(image)
            }
        }
        return null
    }

    return (
        <div>
            <Modal isOpen={isViewImage} onClose={() => { setIsViewImage(false); setCurrentImage() }} widthClass={"px-2 h-[55%] w-[35%] "}>
                <ViewImage picture={currentImage} setIsViewImage={setIsViewImage} />
            </Modal>
            <div className='grid grid-cols-1 w-4/4  justify-items-center'>
                <table className='table-auto w-full mt-1'>
                    <thead>
                        <tr className="border border-black bg-blue-200">
                            <th className="text-xs w-5 border border-black capitalize p-1">
                                s.no
                            </th>

                            <th className="w-1/4 text-xs  border border-black capitalize p-1">
                                comment
                            </th>
                            <th className=" W-20 text-xs  border border-black capitalize p-1">
                                Image
                            </th>

                            {/* <th className=" W-16 text-xs  border border-black capitalize p-1"  >
                                <button
                                    type='button' className={`text-green-700`}
                                    onClick={() => {

                                        setStyleImages(prev => {

                                            let newPrev = structuredClone(prev);
                                            newPrev?.push({

                                                comment: "",
                                                image: "",
                                            })
                                            return newPrev

                                        })
                                    }}
                                > {<FontAwesomeIcon icon={faUserPlus} />}
                                </button>

                            </th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {(styleImages ? styleImages : []).map((item, index) =>
                            <tr className="border border-black " key={index}>
                                <td className='text-xs text-center  border border-black'>
                                    {index + 1}
                                </td>


                                <td className='text-xs p-1 border border-black'>{item.comment}
                                    {/* <input className="w-full  h-full p-1 uppercase" name="" type="text" value={item.comment}
                                    onChange={(e) =>
                                        handleOnChangeImage(e.target.value, index, "comment")
                                    }
                                    onBlur={(e) => {
                                        handleOnChangeImage(e.target.value, index, "comment");
                                    }
                                    }
                                    /> */}
                                </td>
                                <td className='text-xs flex  justify-center items-center p-1'>
                                    {(item?.image)
                                        ?
                                        <>
                                            <img className='w-16 h-16'
                                                src={imageFormatter(item?.image)} />
                                            <span className='py-1 text-center pl-3' onClick={() => { setIsViewImage(true); setCurrentImage(item?.image); }}>
                                                {VIEW}
                                            </span>
                                        </>
                                        :
                                        <img src={empty} className='w-16' />
                                    }
                                </td>
                                {/* <td className='text-xs text-center border border-black'>
                                    {item.image ?
                                        <>
                                            {((item.image) instanceof File)
                                                ?
                                                <div>
                                                    <div>
                                                        <button className='w-full bg-green-200 border border-gray-700 text-black p-2  rounded-md' onClick={() => handleUpload("Uploaded", item?.image, item?.comment)}>Upload</button>

                                                    </div>
                                                    OR
                                                    <div>
                                                        <div>
                                                            <div className='flex items-center border border-gray-700 bg-green-200 hover:border-lime-500 rounded-md h-8 px-1'>
                                                                <input type="file" id={`profileImage${index}`} className='hidden' onChange={(e) => {
                                                                    handleOnChangeImage(e.target.files[0], index, "image")
                                                                }} />
                                                                <label htmlFor={`profileImage${index}`} className="text-xs w-full"> Browse</label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <Delete
                                                    onClick={() => {
                                                        handleOnChangeImage(null, index, "image")
                                                        deleteData(item?.id)
                                                    }}
                                                />
                                            }
                                        </>
                                        :
                                        <div>
                                            <div className='flex items-center border border-gray-700 hover:border-lime-500 rounded-md h-8 px-1'>
                                                <input type="file" id={`profileImage${index}`} className='hidden' onChange={(e) => {
                                                    handleOnChangeImage(e.target.files[0], index, "image")
                                                }} accept='image/png' />
                                                <label htmlFor={`profileImage${index}`} className="text-xs w-full"> Browse</label>
                                            </div>
                                        </div>
                                    }
                                </td> */}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StyleImages