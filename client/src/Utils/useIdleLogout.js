import { useEffect, useRef } from "react";

const IDLE_TIME = 15 * 60 * 1000; // 15 minutes

const useIdleLogout = (onLogout, isLoggedIn) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      // User not logged in → stop timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    const resetTimer = () => {
      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        // alert("Session expired due to inactivity");
        onLogout();
      }, IDLE_TIME);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // start timer

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [isLoggedIn,onLogout]);
};

export default useIdleLogout;
