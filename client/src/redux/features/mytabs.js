import { createSlice } from "@reduxjs/toolkit";

const initialstate = {
    tabs: []
}

const openTaps = createSlice({
    name: "openTabs",
    initialstate,
    reducer: {
        push: (state, action) => {


        }
    }
})

export default openTaps