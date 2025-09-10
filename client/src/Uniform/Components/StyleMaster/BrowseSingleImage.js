import React from 'react';
import empty from "../../../assets/empty.png"
import { DeleteButton } from '../../../Buttons';

const BrowseSingleImage = ({ picture, setPicture, readOnly }) => {
    console.log(picture, "piccc")
    const imageFormatter = () => {
        if (picture) {
            if (typeof (picture) === "object") {
                return URL.createObjectURL(picture)
            } else {
                return picture
            }
        }
        return null
    }
    const imageWidth = "150px"
    const imageHeight = "150px";
    return (
        <div className='flex gap-1 flex-col items-center'>
            <div>
                {Boolean(picture) ?
                    <img style={{ height: imageHeight, width: imageWidth, objectFit: 'cover' }}
                        src={imageFormatter()}
                    />
                    :
                    <img src={empty} className='w-36' />
                }
            </div>
            <div className='flex flex-col gap-2'>
                <>
                    <div className='flex justify-center gap-2 my-3'>
                        <div className='flex items-center border border-gray-700 hover:border-lime-500 rounded-md h-8 px-5'>
                            <input type="file" id="profileImage" className='hidden' onChange={(e) => {
                                if (readOnly) return
                                setPicture(e.target.files[0])
                            }} />
                            <label htmlFor="profileImage" className="text-xs"> Browse</label>
                        </div>
                        <div className='border border-gray-700 rounded-md h-8 px-2 text-xs hover:border-red-400'>
                            {<DeleteButton onClick={() => { setPicture(null) }} />}
                        </div>
                    </div>
                </>
            </div >
        </div>
    );
};

export default BrowseSingleImage;