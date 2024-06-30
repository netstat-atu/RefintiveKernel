import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
    batchVerificationUser: [],
    orgField: [],
    payTypeList: [],
}
export const extraSlice = createSlice({
    name: 'extra',
    initialState: initialValue,
    reducers: {
        setBatchVerificationUser(state, action) {
            state.batchVerificationUser = action.payload
        },
        setOrgField(state, action) {
            state.orgField = action.payload
        },
        setPayTypeList(state, action) {
            state.payTypeList = action.payload
        },
        setExtraReduxReset: () => initialValue,
    },
});

export const {
    setOrgField,
    setPayTypeList,
    setBatchVerificationUser,
    setExtraReduxReset
} = extraSlice.actions;

export default extraSlice.reducer;
