import { useEffect } from "react";
import { useGetPoByIdQuery } from "../redux/ErpServices/PoServices";

export default function useGetPoDetails(id){
    const {data, isLoading, isFetching} = useGetPoByIdQuery(id, {skip: !id});
    useEffect(()=>{
        if(!data?.data) return
        console.log(data.data)
    },[isLoading, data, isFetching])
}