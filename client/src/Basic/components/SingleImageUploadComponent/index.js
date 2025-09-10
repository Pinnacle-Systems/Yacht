import React from 'react';
import { EMPTY_PROFILE_IMAGE, IMAGE_ICON } from '../../../icons';

const SingleImageFileUploadComponent = ({ image, disabled, setWebCam, editProfileImage = true }) => {
    const imageFormatter = () => {
        if (image) {
            if (typeof (image) === "object") {
                return URL.createObjectURL(image)
            } else {
                return image
            }
        }
        return null
    }
    const imageWidth = "150px"
    const imageHeight = "150px";
    return (
        <div className='flex gap-1 flex-col items-center'>
            <div>
                {Boolean(image) ?
                    <img style={{ height: imageHeight, width: imageWidth, objectFit: 'cover' }}
                        src={imageFormatter()}
                    />
                    :
                    <EMPTY_PROFILE_IMAGE height={imageHeight} width={imageWidth} />
                }
            </div>
            {
                editProfileImage ?
                    <div>
                        <button style={{ width: imageWidth }} className="text-sm w-full border bg-blue-800 p-1 rounded text-white" disabled={disabled} onClick={() => { setWebCam(true) }} htmlFor="profileImage" >{IMAGE_ICON} Edit Profile Image</button>
                    </div>
                    :
                    ""
            }
        </div>
    );
};

export default SingleImageFileUploadComponent;