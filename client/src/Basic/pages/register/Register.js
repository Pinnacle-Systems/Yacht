import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  // const [formData,setFormData] = useState({email:email,password:password})
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();


  // Validation function to check email and password
  const validate = () => {
    const errors = {};

    // Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      errors.email = "Invalid email address";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };



  const handleSubmit = (e) => {
    e.preventDefault()
    const validateErrors = validate()
    setErrors(validateErrors)
    if (Object.keys(validateErrors).length === 0) {
      console.log({ email, password })
    }

  }
  return (
    // <div className='d-flex flex-row w-100 vh-100 bg-beige'>
    //    <div className='d-flex justify-content-center align-items-center w-50'>
    //         left
    //    </div>
    //    <div  className='d-flex justify-content-center align-items-center w-50'>

    //      <div className='w-50 form-font px-3 py-4 rounded-xl shadow bg-white'>
    //      <p className=' fw-semibold mb-1 text-center text-2xl'>Sign up</p>
    //      <p className='text-center text-gray-400'>Please enter your details and sign up.</p>
    //      <form onSubmit={(e)=>handleSubmit(e)}>
    //      <div className='mb-3'>
    //       {/* <label className='text-sm' htmlFor='email'>Email</label> */}
    //       <div className='border rounded-md'>
    //       <input className=' p-2 w-full' placeholder='Enter your name...' type='text' name='name' value={name} id='email'  onChange={(e)=>setName(e.target.value)}/>
    //       </div>
    //       {errors.email?(<div className='text-danger '>{errors.email}</div>):(<div className='text-sm'>&nbsp;</div>)}
    //       </div>
    //       <div className='mb-3'>
    //       {/* <label className='text-sm' htmlFor='email'>Email</label> */}
    //       <div className='border rounded-md'>
    //       <input className=' p-2 w-full' placeholder='Enter your email...' type='text' name='email' value={email} id='email'  onChange={(e)=>setEmail(e.target.value)}/>
    //       </div>
    //       {errors.email?(<div className='text-danger '>{errors.email}</div>):(<div className='text-sm'>&nbsp;</div>)}
    //       </div>
    //       <div className='mb-3'>
    //           {/* <label className='text-sm' htmlFor='password'>Password</label> */}
    //           <div className='flex items-center border rounded-md relative'>
    //           <input className=' p-2 w-80' placeholder='password' type={showPassword?'text':'password'} name='password' value={password} id='password' onChange={(e)=>setPassword(e.target.value)} />
    //           <div className='absolute right-2 top-2.5 text-neutral-500'>
    //           {showPassword?<EyeOff size={15} onClick={()=>setShowPassword(false)}/>:<Eye size={15} onClick={()=>setShowPassword(true)}/>}
    //           </div>
    //           </div>
    //       {errors.password?(<div className='text-danger '>{errors.password}</div>):(<div className='text-danger text-sm'>&nbsp;</div>)}
    //       </div>
    //       <div>
    //           <button type='submit' className='btn btn-dark w-full p-2 form-font'>Sign up</button>
    //       </div>
    //      </form>
    //      <div className='mt-3 text-xs text-center'>
    //       <p>Already have an account? <span onClick={()=>navigate('/')}  className='text-primary cursor-pointer'>Sign In</span></p>
    //      </div>
    //      </div>

    //    </div>
    // </div>
    <div className="flex flex-row w-screen h-screen bg-beige">
      {/* Left Section */}
      <div className="flex justify-center items-center w-1/2">
        left
      </div>

      {/* Right Section */}
      <div className="flex justify-center items-center w-1/2">
        <div className="w-1/2 px-3 py-4 rounded-xl shadow-lg bg-white">
          <p className="font-semibold mb-1 text-center text-2xl">Sign up</p>
          <p className="text-center text-gray-400 text-xs p-2">Please enter your details and sign up.</p>

          <form onSubmit={(e) => handleSubmit(e)}>
            {/* Name Input */}
            <div className="mb-3">
              <div className="border rounded-md">
                <input className="p-2 w-full" placeholder="Enter your name..." type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              {errors.name ? (<div className="text-red-500">{errors.name}</div>) : (<div className="text-sm">&nbsp;</div>)}
            </div>

            {/* Email Input */}
            <div className="mb-3">
              <div className="border rounded-md">
                <input className="p-2 w-full" placeholder="Enter your email..." type="text" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {errors.email ? (<div className="text-red-500">{errors.email}</div>) : (<div className="text-sm">&nbsp;</div>)}
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <div className="flex items-center border rounded-md relative">
                <input className="p-2 w-80" placeholder="Password" type={showPassword ? "text" : "password"} name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="absolute right-2 top-2.5 text-neutral-500">
                  {showPassword ? <EyeOff size={15} onClick={() => setShowPassword(false)} /> : <Eye size={15} onClick={() => setShowPassword(true)} />}
                </div>
              </div>
              {errors.password ? (<div className="text-red-500">{errors.password}</div>) : (<div className="text-sm">&nbsp;</div>)}
            </div>

            {/* Submit Button */}
            <div>
              <button type="submit" className="w-full p-2 bg-black text-white rounded-lg">Sign up</button>
            </div>
          </form>

          {/* Sign In Link */}
          <div className="mt-3 text-xs text-center">
            <p>Already have an account? <span onClick={() => navigate('/')} className="text-blue-600 cursor-pointer">Sign In</span></p>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Register
