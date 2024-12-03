import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isUserLoggedIn: localStorage.getItem("isLoggedIn") ? true : false,
        userFullName: ""
    },
    reducers: {
        setToken: (state, action) => {
            state.isUserLoggedIn = true
            state.userFullName = action.payload.username
            localStorage.setItem("isLoggedIn", 'true')
        },
        removeToken: (state) => {
            state.isUserLoggedIn = false
            state.userFullName = ""
            localStorage.removeItem("isLoggedIn")
        }
    }
})

export default authSlice.reducer
export const { setToken, removeToken } = authSlice.actions