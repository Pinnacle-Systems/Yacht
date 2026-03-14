// In your main App.jsx or a custom hook
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../Utils/socket";
import { purchaseBillApi } from "../redux/services";

export function usePurchaseBillRefetch() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for server event
    socket.on("purchaseBill:updated", () => {
      // Invalidate RTK cache — triggers automatic refetch for all
      // components using getPurchaseBill query
      dispatch(
        purchaseBillApi.util.invalidateTags(["PurchaseBill"])
      );
    });

    return () => {
      socket.off("purchaseBill:updated");
    };
  }, [dispatch]);
}