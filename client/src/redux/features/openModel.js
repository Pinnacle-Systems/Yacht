import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    openPartyModal: false,
    lastTab: null,
};

const partySlice = createSlice({
    name: 'party',
    initialState,
    reducers: {
        setOpenPartyModal(state, action) {
            state.openPartyModal = action.payload;
        },
        setLastTab(state, action) {
            state.lastTab = action.payload;
        },
    },
});

export const { setOpenPartyModal, setLastTab } = partySlice.actions;
export default partySlice.reducer;