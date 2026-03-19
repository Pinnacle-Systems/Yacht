import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../Utils/socket";
import SalesBillApi from "../redux/services/SalesBillService";


export function useSalesBillRefetch() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for server event
    socket.on("salesBill:updated", () => {
      // Invalidate RTK cache — triggers automatic refetch for all
      // components using getPurchaseBill query
      dispatch(
        SalesBillApi.util.invalidateTags(["SalesBill"])
      );
    });

    return () => {
      socket.off("salesBill:updated");
    };
  }, [dispatch]);
}