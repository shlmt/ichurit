import apiSlice from "../../app/apiSlice"

export const lateApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getLatesByStudent: build.query({
            query: (id) => ({
                url: `/api/late/st/${id}`
            }),
            providesTags:["Lates"]
        }),
        getLatesByClass: build.query({
            query: (obj) => ({
                url: `/api/late/cl/${obj.id}?startDate=${obj.startDate}&endDate=${obj.endDate}`
            })
        }),
        getGoodStudents: build.query({
            query: (obj) => ({
                url: `/api/late/good?maxSum=${obj.maxSum}&startDate=${obj.startDate}&endDate=${obj.endDate}`
            })
        }),
        
        getLatesForMarks: build.query({
            query: (obj) => ({
                url: `/api/late/marks/${obj.id}?startDate=${obj.startDate}&endDate=${obj.endDate}`
            })
        }),
        addLate: build.mutation({
            query:(late)=>({
                url:"api/late",
                method:"POST",
                body: late
            }),
            invalidatesTags:["Lates"]
        }),
        updateLate: build.mutation({
            query:(late)=>({
                url:`api/late/${late.id}`,
                method:"PUT",
                body:late
            }),
            invalidatesTags:["Lates"]
        }),
        deleteLate: build.mutation({
            query:(id)=>({
                url:`api/late/${id}`,
                method:"DELETE"
            }),
            invalidatesTags:["Lates"]
        }),
        deleteHistory: build.mutation({
            query:()=>({
                url:`api/late`,
                method:"DELETE"
            })
        })
    })
})

export const {useGetLatesForMarksQuery,useGetGoodStudentsQuery,useGetLatesByClassQuery,useGetLatesByStudentQuery,useAddLateMutation,useUpdateLateMutation,useDeleteHistoryMutation,useDeleteLateMutation} = lateApiSlice
