// socket.js — create singleton
import { io } from "socket.io-client";
const BASE_URL = process.env.REACT_APP_SERVER_URL;
export const socket = io(BASE_URL);