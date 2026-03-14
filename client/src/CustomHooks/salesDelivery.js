import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { socket } from "../Utils/socket";
import SalesEntryApi from "../redux/uniformService/SalesEntryService";

export function useSalesEntryRefetch() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for server event
    socket.on("purchaseBill:updated", () => {
      // Invalidate RTK cache — triggers automatic refetch for all
      // components using getPurchaseBill query
      dispatch(
        SalesEntryApi.util.invalidateTags(["SalesEntry"])
      );
    });

    return () => {
      socket.off("purchaseBill:updated");
    };
  }, [dispatch]);
}