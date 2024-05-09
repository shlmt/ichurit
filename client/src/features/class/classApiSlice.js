import apiSlice from "../../app/apiSlice"

const classApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllClasses: build.query({
            query: () => ({
                url: '/api/class'
            }),
            providesTags:["Classes"]
        }),
        addClass: build.mutation({
            query:(c)=>({
                url: '/api/class',
                method:"POST",
                body:c
            }),
            invalidatesTags:["Classes"]
        }),
        updateClass: build.mutation({
            query:(c)=>({
                url: `/api/class/${c.id}`,
                method:"PUT",
                body:c
            }),
            invalidatesTags:["Classes"]
        }),
        updateNewYear: build.mutation({
            query:()=>({
                url: `/api/class`,
                method:"PUT"
            }),
            invalidatesTags:["Classes"]
        }),
        deleteClass: build.mutation({
            query:(id)=>({
                url: `/api/class/${id}`,
                method:"DELETE",
            }),
            invalidatesTags:["Classes"]
        })
    })
})

export const { useGetAllClassesQuery,useAddClassMutation,useUpdateClassMutation, useDeleteClassMutation, useUpdateNewYearMutation } = classApiSlice