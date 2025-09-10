import { toast } from 'react-toastify';

export default function toasterTrigger(){
    const response = localStorage.getItem(sessionStorage.getItem("sessionId") +"res");
    const result = localStorage.getItem(sessionStorage.getItem("sessionId") + response);
    if (response && response === "success") {
        toast.success(result);
        localStorage.removeItem(sessionStorage.getItem("sessionId") +"res");
    } else if (response && response === "err") {
        toast.error(result);
        localStorage.removeItem(sessionStorage.getItem("sessionId") +"res");
    }
}