import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { removeToken } from "../features/auth/authSlice"

const baseQuery = fetchBaseQuery({
    baseUrl: process.env.REACT_APP_BASE_URL,
    credentials: 'include'
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions)
    if (result.error && result.error.status === 401){
        alert('פג תוקף החיבור, יש להתחבר מחדש')
        api.dispatch(removeToken())
        apiSlice.endpoints.logout.initiate()
    }
    return result
}

const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    endpoints: () => ({}),
})

export default apiSlice