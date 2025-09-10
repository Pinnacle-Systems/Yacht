import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import { toast } from 'react-toastify';
const BASE_URL = process.env.REACT_APP_SERVER_URL;

export const storeData = (methodName, urlName, data, model) => {
    axios({
        method: methodName,
        url: urlName,
        data: data
    }).then((result) => {
        console.log("result", result.data.response);
        if (result.status === 200 || result.status === 304) {
            if (result.data.statusCode === 0) {
                window.location.reload();
                localStorage.setItem(sessionStorage.getItem("sessionId") +"res", "success");
                localStorage.setItem(sessionStorage.getItem("sessionId") +"success", `${model} Saved Successfully!!!`);
            }
            else if (result.data.statusCode === 1) {
                toast.warning(result.data.message, { autoClose: 5000 })
            }
        } else {
            console.log(result);
        }
    }, (error) => {
        console.log(error.status)
        toast.error("Server Down", { autoClose: 5000 })
    });
}

export const storeBranchData = (methodName, urlName, data, branchMasterRender, setBranchMasterRender, resetFormBranch) => {
    axios({
        method: methodName,
        url: urlName,
        data: data
    }).then((result) => {
        console.log("result", result.data.response);
        if (result.status === 200 || result.status === 304) {
            if (result.data.statusCode === 0) {
                setBranchMasterRender(!branchMasterRender);
                resetFormBranch();
                toast.success("Branch added Successfully", { autoClose: 5000 })
            }
            else if (result.data.statusCode === 1) {
                toast.warning(result.data.message, { autoClose: 5000 })
            }
        } else {
            console.log(result);
        }
    }, (error) => {
        console.log(error.status)
        toast.error("Server Down", { autoClose: 5000 })
    });
}

export const generateCompanyId = (urlName, data) => {
    axios({
        method: "post",
        url: urlName,
        data: data
    }).then((result) => {
        console.log("result", result.data.response);
        if (result.status === 200 || result.status === 304) {
            if (result.data.statusCode === 0) {
                console.log(result.data);
                secureLocalStorage.setItem(sessionStorage.getItem("sessionId")+"postData", JSON.stringify(result.data.data));
                window.location.reload();
            }
            else if (result.data.statusCode === 1) {
                toast.warning(result.data.message, { autoClose: 5000 })
            }
        } else {
            console.log(result);
        }
    }, (error) => {
        console.log(error.status)
        toast.error("Server Down", { autoClose: 5000 })
    });
}

export const removeBranchData = (id, API, model, setSelfRender, selfRender) => {
    axios({
        method: 'delete',
        url: BASE_URL + API + `/${id}`
    }).then((result) => {
        if (result.status === 200) {
            if (result.data.statusCode === 0) {
                toast.success(`${model} Removed SuccessFully`);
                setSelfRender(!selfRender);
            } else if (result.data.statusCode === 1) {
                toast.warning(result.data.message, { autoClose: 5000 });
            }
        }
    }, (error) => {
        console.log(error);
        toast.error("Server Down", { autoClose: 5000 });
    });
}

export const removeData = (id, API, model) => {
    axios({
        method: 'delete',
        url: BASE_URL + API + `/${id}`
    }).then((result) => {
        if (result.status === 200) {
            if (result.data.statusCode === 0) {
                window.location.reload();
                localStorage.setItem(sessionStorage.getItem("sessionId") +"res", "success");
                localStorage.setItem(sessionStorage.getItem("sessionId") +"success", `${model} Deleted Successfully!!!`);
            } else if (result.data.statusCode === 1) {
                toast.warning(result.data.message, { autoClose: 5000 });
            }
        }
    }, (error) => {
        console.log(error);
        toast.error("Server Down", { autoClose: 5000 });
    });
}

export const getData = (API, setData, setIsLoading, params = {}, setDataLength) => {
    axios({
        method: 'get',
        url: BASE_URL + API,
        params: params
    }).then((result) => {
        console.log("result", result.data.data);
        if(setDataLength){
            setDataLength(result.data.data.length)
        }
        setData(result.data.data);
        setIsLoading(false)
    }, (error) => {
        console.log(error);
        toast.error("Server Down", { autoClose: 5000 });
        setIsLoading(false);
    });
}

export const getFilterData = (API, setData, setIsLoading, id) => {
    if (!id) {
        return
    }
    console.log("from", id)
    axios({
        method: 'get',
        url: BASE_URL + API + "/filter".concat(`/${id}`),
    }).then((result) => {
        console.log("filter result", result.data.data);
        setData(result.data.data);
        setIsLoading(false);
    }, (error) => {
        console.log(error);
        toast.error("Server Down", { autoClose: 5000 });
        setIsLoading(false);
    });
}


export const getDataById = (id, API, syncFormWithDb) => {
    axios({
        method: 'get',
        url: BASE_URL + API + `/${id}`
    }).then((result) => {
        if (result.status === 200) {
            if (result.data.statusCode === 0) {
                syncFormWithDb(result.data.data);
            }
        } else {
            console.log(result);
        }
    }, (error) => {
        console.log(error);
        toast.error("Server Down", { autoClose: 5000 });
    });
}

export const searchData = (searchParams, API, setDataRetrieved, params = {}) => {
    axios({
        method: 'get',
        url: `${BASE_URL}${API}/search/${searchParams}`,
        params: params
    }).then((result) => {
        console.log("result", result.data.data);
        setDataRetrieved(result.data.data);
    }, (error) => {
        console.log(error);
        toast.error("Server Down", { autoClose: 5000 });
    });
}

