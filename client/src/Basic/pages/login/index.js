import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { LOGIN_API } from '../../../Api';
import { generateSessionId } from '../../../Utils/helper';
import Modal from '../../../UiComponents/Modal';
import BranchAndFinYearForm from '../../components/BranchAndFinyear';
import { PRODUCT_ADMIN_HOME_PATH } from '../../../Route/urlPaths';
import { toast } from 'react-toastify';
import logobanner from '../../../assets/logobanner.avif'
const BASE_URL = process.env.REACT_APP_SERVER_URL;

const Login = () => {



  const [username, setUsername] = useState("");
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({});
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planExpirationDate, setPlanExpirationDate] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};


    if (!username) {
      errors.email = "Email is required";
    }

    if (!password) {
      errors.password = "Password is required";
    }


    return errors;
  };
// Cloud Sync Icon
const CloudSyncIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l-4-4m0 0l4-4m-4 4h18" />
  </svg>
);

// AI Icon
const AIIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Factory Icon
const FactoryIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

// Smartphone Icon
const SmartphoneIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

// Beaker Icon
const BeakerIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

// Shopping Cart Icon
const ShoppingCartIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

  const data = { username, password }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validateErrors = validate()
    setErrors(validateErrors)
    if (Object.keys(validateErrors).length === 0) {
      axios({
        method: "post",
        url: BASE_URL + LOGIN_API,
        data: data,
      }).then(
        (result) => {
          console.log(result, "result")
                  console.log(isGlobalOpen,"isGlobalOpen")

          if (result.status === 200) {
            if (result.data.statusCode === 0) {
              sessionStorage.setItem("sessionId", generateSessionId());
              if (!result.data.userInfo.roleId) {
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "userId",
                  result.data.userInfo.id
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "username",
                  result.data.userInfo.username
                );
                console.log(result.data.userInfo, ' result.data.userInfo')

                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "userType",
                  result.data.userInfo.userType
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "partyId",
                  result.data.userInfo.partyType
                );
                secureLocalStorage.setItem(
                  sessionStorage.getItem("sessionId") + "superAdmin",
                  true
                );
                navigate(PRODUCT_ADMIN_HOME_PATH);
              } else {
                const currentPlanActive =
                  result.data.userInfo.role.company.Subscription.some(
                    (sub) => sub.planStatus
                  );
                if (currentPlanActive) {
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "employeeId",
                    result.data.userInfo.employeeId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userId",
                    result.data.userInfo.id
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "username",
                    result.data.userInfo.username
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userEmail",
                    result.data.userInfo.email
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userCompanyId",
                    result.data.userInfo.role.companyId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "defaultAdmin",
                    JSON.stringify(result.data.userInfo.role.defaultRole)
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRoleId",
                    result.data.userInfo.roleId
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "partyId",
                    result.data.userInfo.partyType
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") +
                    "latestActivePlanExpireDate",
                    new Date(
                      result.data.userInfo.role.company.Subscription[0].expireAt
                    ).toDateString()
                  );
                  secureLocalStorage.setItem(
                    sessionStorage.getItem("sessionId") + "userRole",
                    result.data.userInfo.role.name
                  );
                  setIsGlobalOpen(true);                             
                } else {



                  

                  const expireDate = new Date(
                    result.data.userInfo.role.company.Subscription[0].expireAt
                  );
                  setPlanExpirationDate(expireDate.toDateString());
                }
              }
            } else {
              console.log(result)
              toast.error(result.data.message);
              setLoading(false);
            }
          }
          console.log("result", result.data.data);
        },
        (error) => {
          console.log(error);
          toast.error("Server Down", { autoClose: 5000 });
          setLoading(false);
        }
      );
    };
  }


  return (
    <>
      <Modal
        isOpen={isGlobalOpen}
        onClose={() => {
          setIsGlobalOpen(false);
        }}
        widthClass={""}
      >
        <BranchAndFinYearForm setIsGlobalOpen={setIsGlobalOpen} />
      </Modal>
    <div className=" w-full grid  h-screen bg-beige">
  <div className="min-h-screen  flex">
    <div className="w-full bg-gradient-to-br from-indigo-900 to-blue-800 p-5 flex flex-col overflow-y-auto">
      <div className="mb-5">
       <img className='w-52' src='https://www.pinnaclesystems.co.in/assets/imgs/pages/home5/logo.PNG' />
      </div>

     <div className="space-y-4 ">
  <div className="group relative bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-[1.03]">
    <div className="absolute inset-0 border border-white/20 rounded-xl" />
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-white/5 rounded-md">
        <FactoryIcon className="h-5 w-5 text-blue-300" />
      </div>
      <div>
        <h3 className="text-white text-lg mb-1">ERP for Textile Industries</h3>
        <p className="text-blue-100 text-[12px] tracking-wider  leading-snug">
         An ERP (Enterprise Resource Planning) system tailored for textile industries streamlines and optimizes various operations, from supply chain management to production planning and inventory control
        </p>
      </div>
    </div>
  </div>

  <div className="group relative bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-[1.03]">
    <div className="absolute inset-0 border border-white/20 rounded-xl" />
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-white/5 rounded-md">
        <SmartphoneIcon className="h-5 w-5 text-blue-300" />
      </div>
      <div>
        <h3 className="text-white text-lg mb-1">Payroll management system</h3>
        <p className="text-blue-100 text-[12px] tracking-wider  leading-snug">
          Payroll management system with mobile app integration, employee self-service 
          portal, and real-time attendance tracking.
        </p>
      </div>
    </div>
  </div>

  <div className="group relative bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-[1.03]">
    <div className="absolute inset-0 border border-white/20 rounded-xl" />
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-white/5 rounded-md">
        <BeakerIcon className="h-5 w-5 text-blue-300" />
      </div>
      <div>
        <h3 className="text-white text-lg mb-1">ERP For Textile Lab</h3>
        <p className="text-blue-100 text-[12px] tracking-wider  leading-snug">
         Certainly, cloud and IoT (Internet of Things) solutions are increasingly important for various industries, including textiles.
          These technologies can offer enhanced efficiency, real-time monitoring, data analytics, and scalability.
        </p>
      </div>
    </div>
  </div>

  <div className="group relative bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-[1.03]">
    <div className="absolute inset-0 border border-white/20 rounded-xl" />
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-white/5 rounded-md">
        <ShoppingCartIcon className="h-5 w-5 text-blue-300" />
      </div>
      <div>
        <h3 className="text-white text-lg mb-1">POS</h3>
        <p className="text-blue-100 text-[12px] tracking-wider  leading-snug">
          Retail Point of Sale system with inventory management, customer loyalty programs, 
          and multi-store support.
        </p>
      </div>
    </div>
  </div>
  <div className="group relative bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform hover:scale-[1.03]">
    <div className="absolute inset-0 border border-white/20 rounded-xl" />
    <div className="flex items-start space-x-3">
      <div className="p-2 bg-white/5 rounded-md">
        <FactoryIcon className="h-5 w-5 text-blue-300" />
      </div>
      <div>
        <h3 className="text-white text-lg mb-1">Hospital Management</h3>
        <p className="text-blue-100 text-[12px] tracking-wider  leading-snug">
         Streamline hospital operations with an integrated ERP solution. Manage patient records, billing, and resource allocation efficiently. Enhance patient care through seamless coordination and data-driven insights.
        </p>
      </div>
    </div>
  </div>
</div>
    </div>

<div 
  className="w-full bg-gray-100 flex items-center justify-center p-12"
  style={{ 
    backgroundImage: `url(${logobanner})`, 
    backgroundSize: 'cover', 
    backgroundPosition: 'center' 
  }}>   <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10 transition-all hover:shadow-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
          <input
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter your credentials"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input 
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Access Platform
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          New to Pinnacle? {' '}
          <a 
            onClick={() => navigate('/register')} 
            className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium transition-colors"
          >
            Create Account
          </a>
        </p>
      </div>
    </div>
  </div>
  </div>
</div>

    </>
  )
}

export default Login
