import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: localStorage.getItem("token") || "",
        isUserLoggedIn: localStorage.getItem("token") ? true : false,
        userFullName: ""
    },
    reducers: {
        setToken: (state, action) => {
            const token = action.payload.data.token
            state.token = token
            state.isUserLoggedIn = true
            state.userFullName = action.payload.username
            localStorage.setItem("token", token)
            localStorage.setItem("username", action.payload.username)
        },
        removeToken: (state) => {
            state.token = ""
            state.isUserLoggedIn = false
            state.userFullName=""
            localStorage.removeItem("token")
            localStorage.removeItem("username")
        }
    }
})

export default authSlice.reducer
export const { setToken, removeToken } = authSlice.actions