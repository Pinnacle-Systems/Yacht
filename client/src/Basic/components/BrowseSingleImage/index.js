import React from 'react';
import empty from "../../../assets/empty.png"
import { DeleteButton } from '../../../Buttons';
import { getImageUrlPath } from '../../../Utils/helper';

const BrowseSingleImage = ({ picture, setPicture, readOnly }) => {
    const imageFormatter = () => {
        if (picture) {
            if (typeof (picture) === "object") {
                return URL.createObjectURL(picture)
            } else {
                return getImageUrlPath(picture)
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
                    <img style={{ height: imageHeight, width: imageWidth, objectFit: 'fit' }}
                        src={imageFormatter()}
                    />
                    :
                    <img src={empty} className='w-36' />
                }
            </div>
            <div className='flex flex-col gap-2'>
                <>
                    <div className='flex justify-center gap-2 my-3'>
                        {!readOnly &&
                            <>
                                <div className='flex items-center border border-gray-700 hover:border-lime-500 rounded-md h-8 px-1'>
                                    <input type="file" id="profileImage" className='hidden' onChange={(e) => {
                                        setPicture(e.target.files[0])
                                    }}
                                 
                                    />

                                    <label htmlFor="profileImage" className="text-xs w-full">Browse</label>
                                </div>
                                <div className='border border-gray-700 rounded-md h-8 px-2 text-xs hover:border-red-400'>
                                    {<DeleteButton onClick={() => { setPicture(null) }} />}
                                </div>
                            </>
                        }
                    </div>
                </>
            </div >
        </div>
    );
};

export default BrowseSingleImage;