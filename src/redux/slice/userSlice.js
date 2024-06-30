import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  associatedOrgs: [],
  email: "",
  givenName: "",
  lastName: "",
  state: "",
  token: "",
  userId: "",
  isSignIn: false,
  role: "user",
  isAdmin: false,
  orgId: null,
  orgName: null,
  organizationList: [],
  batchVerificationUser: []
}
export const userSlice = createSlice({
  name: 'user',
  initialState: initialValue,
  reducers: {
    setUser(state, action) {
      const { userId, token, email, givenName, lastName, associatedOrgs } = action.payload;
      state.userId = userId;
      state.token = token;
      state.email = email;
      state.lastName = lastName;
      state.givenName = givenName;
      state.associatedOrgs = associatedOrgs;
    },
    setIsSignIn(state, action) {
      state.isSignIn = action.payload
    },
    setOrgId(state, action) {
      state.orgId = action.payload
    },
    setOrgName(state, action) {
      state.orgName = action.payload
    },
    setRole(state, action) {
      state.role = action.payload
    },
    setUserAccess(state, action) {
      state.access = action.payload
    },
    setToken(state, action) {
      state.token = action.payload
    },
    setIsAdmin(state, action) {
      state.isAdmin = action.payload
    },
    setOrganizationList(state, action) {
      state.organizationList = action.payload
    },
    setBatchVerificationUser(state, action) {
      state.batchVerificationUser = action.payload
    },
    setReduxReset: () => initialValue,
  },
});

export const {
  setUser,
  setOrgId,
  setIsSignIn,
  setOrgName,
  setRole,
  setUserAccess,
  setIsAdmin,
  setReduxReset,
  setToken,
  setOrganizationList,
  setBatchVerificationUser
} = userSlice.actions;

export default userSlice.reducer;
