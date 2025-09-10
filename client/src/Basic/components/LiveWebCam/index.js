import React, { useRef, useCallback, useState } from 'react'
import { ThreeCircles } from 'react-loader-spinner';
import Webcam from 'react-webcam'
import { DeleteButton } from '../../../Buttons';
const videoConstraints = {
    width: 250,
    height: 250,
    facingMode: 'user',
}
const LiveWebCam = ({ picture, setPicture, onClose }) => {
    const [failure, setFailure] = useState(false);
    const [loading, setLoading] = useState(!picture);
    const handleUserMedia = () => {
        setLoading(false);
    };
    const webcamRef = useRef(null)
    const capture = useCallback(() => {
        const pictureSrc = webcamRef.current.getScreenshot()
        setPicture(pictureSrc)
    })
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const imageWidth = "250px"
    const imageHeight = "250px";
    return (
        <div className='flex flex-col gap-2'>
            <>
                <>{loading ?
                    <>
                        <div className='flex justify-center text-blue-900'><ThreeCircles color='light-yellow' /></div>
                    </> :
                    <h2 className="text-center border rounded text-gray-900 text-lg">
                        Take Profile Picture
                    </h2>}
                </>
                {failure
                    ?
                    <p className='text-center bg-red-700 text-white flex justify-center'>Check Your Webcam</p>
                    :
                    <div className='flex justify-center'>
                        {picture === '' || picture === null
                            ?
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                onUserMedia={handleUserMedia}
                                onUserMediaError={() => { setLoading(false); setFailure(true); }}
                            />
                            : (<>
                                {(picture instanceof File)
                                    ?
                                    <img id="productImageView" src={toBase64(picture).then(data => setPicture(data))} alt={"employee image"} className='h-full w-64 rounded-full border' />
                                    :
                                    <img src={picture} alt={"employee image"} className='h-full rounded-full border w-64' />
                                }
                                </>
                            )
                            }
                    </div>
                }
                <div className='flex justify-between gap-2'>
                    <button
                        onClick={() => {
                            onClose()
                        }}
                        className="border p-1 rounded"
                    >
                        Close
                    </button>

                    <div className='flex items-center border'>
                        <input type="file" name="" id="profileImage" className='hidden' onChange={(e) => { setPicture(e.target.files[0]) }} />
                        <label htmlFor="profileImage" className="p-1 rounded"> Browse</label>
                    </div>
                    <button
                        hidden={failure}
                        onClick={(e) => {
                            e.preventDefault()
                            capture()
                        }}
                        className={`border p-1 rounded`}
                    >
                        Capture
                    </button>
                    <div className='border'>
                        {<DeleteButton onClick={() => { setPicture(null); onClose(); }} />}
                    </div>
                </div>
            </>
        </div >
    )
}
export default LiveWebCam