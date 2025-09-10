import { useDispatch } from "react-redux";

const useInvalidateTags = () => {
    const dispatch = useDispatch();

    const apiInvalidateData = [
        {
            type: `Sample/invalidateTags`,
            payload: ["Sample"],
        },

    ];

    function dispatchInvalidate() {
        apiInvalidateData.forEach(item => {
            dispatch(item);
        })
    }
    return [dispatchInvalidate];
};

export default useInvalidateTags;
