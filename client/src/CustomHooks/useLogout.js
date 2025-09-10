import { useNavigate } from "react-router-dom";
import { LOGIN } from "../Route/urlPaths";
import io from 'socket.io-client';
import { useEffect, useMemo } from "react";
import { getCommonParams } from "../Utils/helper";

const BASE_URL = process.env.REACT_APP_SERVER_URL;

const socket = io.connect(BASE_URL);

export const loginSocket = (userId) => {
    socket.emit(`login`, { userId });
}

export const useLogout = () => {
    const { userId } = useMemo(() => getCommonParams(), [])

    let navigate = useNavigate();
    useEffect(() => {
        socket.on('connect', () => {
            console.log("connected")
        });

        socket.on('disconnect', () => {
            console.log("disconnect")
        });
        socket.on(`logout/${parseInt(userId)}`, () => {
            const removeKeys = [];
            let len = localStorage.length;
            for (let i = 0; i < len; ++i) {
                if (localStorage.key(i).split(".").length === 3) {
                    if (
                        localStorage
                            .key(i)
                            .split(".")[2]
                            .startsWith(sessionStorage.getItem("sessionId"))
                    ) {
                        removeKeys.push(localStorage.key(i));
                    }
                }
            }
            for (let i of removeKeys) {
                localStorage.removeItem(i);
            }
            sessionStorage.removeItem("sessionId");
            localStorage.clear();
            sessionStorage.clear();
            navigate(LOGIN);
            window.location.reload()
        })
        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off(`logout/${parseInt(userId)}`);
        }
    }, [navigate, userId])

};

export default useLogout;