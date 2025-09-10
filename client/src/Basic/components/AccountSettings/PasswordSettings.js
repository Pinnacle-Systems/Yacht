import React, { useState, useEffect, useCallback } from 'react';
import { TextInput, DisabledInput } from '../../../Inputs';
import 'react-toastify/dist/ReactToastify.css';
import { USERS_API } from '../../../Api';
import axios from "axios";
import { toast } from 'react-toastify';
import secureLocalStorage from "react-secure-storage";
import { useUpdateUserMutation, useGetUserByIdQuery, useSendOtpMutation } from "../../../redux/services/UsersMasterService";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const PasswordSettings = () => {
  const [otp, setOtp] = useState("")

  const [email, setEmail] = useState("");

  const [otpPanel, setOtpPanel] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);

  const [otpVerified, setOtpVerified] = useState(false);

  const [password, setpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const id = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId")
  const {
    data: singleData,
    isFetching: isSingleFetching,
    isLoading: isSingleLoading,
  } = useGetUserByIdQuery(id);


  const [sendOtp] = useSendOtpMutation()
  const handleResetPassword = () => {
    sendOtp({ userId: id });
    setOtpPanel(true);
    setTimeLeft(30);
  }

  useEffect(() => {
    if (timeLeft === 0) {
      console.log("TIME LEFT IS 0");
      setTimeLeft(null)
    }

    // exit early when we reach 0
    if (!timeLeft) return;

    // save intervalId to clear the interval when the
    // component re-renders
    const intervalId = setInterval(() => {

      setTimeLeft(timeLeft - 1);
    }, 1000);

    // clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
    // add timeLeft as a dependency to re-rerun the effect
    // when we update it
  }, [timeLeft]);


  const verifyOtp = () => {
    axios({
      method: 'post',
      url: BASE_URL + USERS_API + "/verifyOtp",
      data: { userId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userId"), otp }
    }).then((result) => {
      if (result.status === 200) {
        if (result.data.statusCode === 0) {
          setOtpVerified(true);
          toast.success(result.data.message)
        } else if (result.data.statusCode === 1) {
          toast.warning(result.data.message, { autoClose: 5000 });
        }
      }
    }, (error) => {
      console.log(error);
      toast.error("Server Down", { autoClose: 5000 });
    });
  }

  const handleConfirmOnChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(password === e.target.value);
  }

  const [update, updateData] = useUpdateUserMutation()

  const saveNewPassword = async() => {
    if (!passwordMatch) {
      toast.info("Passwords Should Be Same to proceed", { position: "top-center" })
      return
    }
    await update({password, id});
    setOtpPanel(false);
  }


  const syncFormWithDb = useCallback((data) => {
    setEmail(data?.Employee?.email ? data.Employee.email : (data?.email ? data?.email : ""));
  }, []);

  useEffect(() => {
    syncFormWithDb(singleData?.data);
  }, [isSingleFetching, isSingleLoading, id, syncFormWithDb, singleData]);

  return (
    <div className='col-span-7 h-full bg-theme flex flex-col frame'>
      <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-x-2 overflow-clip'>
        <div className='col-span-3 grid md:grid-cols-2 overflow-auto'>
          <div className='mr-1 md:ml-2'>
            {otpPanel ?
              otpVerified ?
                <fieldset className='frame my-1'>
                  <legend className='sub-heading'>Password </legend>
                  <div className='grid grid-cols-1 my-2' autoComplete="chrome-off">
                    <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data'>
                      <label className='md:text-start flex'>New Password</label>
                      <input type={"password"} required={true} className='input-field focus:outline-none md:col-span-2 border rounded' value={password} onChange={(e) => { setpassword(e.target.value); }} />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 items-center md:my-0.5 md:px-1 data'>
                      <label className='md:text-start flex'>Confirm Password</label>
                      <input type={"password"} required={true} className='input-field focus:outline-none md:col-span-2 border rounded' value={confirmPassword} onChange={(e) => { handleConfirmOnChange(e); }} />
                    </div>
                    {passwordMatch ? <p></p> : <p className='text-red-700'> Passwords not Matching</p>}
                    <div className='flex m-1'>
                      <button onClick={() => { saveNewPassword() }} className='bg-blue-700 text-white rounded p-1 px-2 text-sm'> Save</button>
                    </div>
                  </div>
                </fieldset>
                :
                <fieldset className='frame my-1'>
                  <legend className='sub-heading'>OTP </legend>
                  <div className='grid grid-cols-1 my-2' autoComplete="chrome-off">
                    <TextInput name="Otp" type="text" value={otp} setValue={setOtp} />
                    {timeLeft ?
                      <div className='sub-heading underline hover:cursor-pointer flex justify-end p-1'><span>Resend otp in {timeLeft} Seconds</span></div>
                      :
                      <div className='sub-heading underline hover:cursor-pointer flex justify-end p-1'><span onClick={() => handleResetPassword()}>Resend otp</span></div>
                    }
                    <div className='flex mx-1'>
                      <button className='bg-blue-700 text-white rounded p-1 text-sm' onClick={() => { verifyOtp() }}> Verify Otp</button>
                    </div>
                  </div>
                </fieldset>
              :
              <fieldset className='frame my-1'>
                <legend className='sub-heading'>Email</legend>
                <div className='grid grid-cols-1 my-2' autoComplete="chrome-off">
                  <DisabledInput name="Verification Email" type="text" value={email} />
                  <div className='sub-heading underline hover:cursor-pointer flex justify-end p-1'><span onClick={() => { handleResetPassword() }}>Reset Password</span></div>
                </div>
              </fieldset>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordSettings