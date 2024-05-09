import apiSlice from "../../app/apiSlice"

const mailApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        sendEmail: build.mutation({
            query:(obj)=>({
                url:"api/mail",
                method:"POST",
                body: obj
            })
        }),
    })
})

export const {useSendEmailMutation} = mailApiSlice

