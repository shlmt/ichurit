import apiSlice from "../../app/apiSlice"

const studentApiSlice = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getAllStudents: build.query({
            query: () => ({
                url: '/api/student'
            }),
            providesTags:["Students"]
        }),
        createStudent: build.mutation({
            query:(student)=>({
                url:"api/student",
                method:"POST",
                body: student
            }),
            invalidatesTags:["Students"]
        }),
        createManyStudents: build.mutation({
            query:(obj)=>({
                url:"api/student/upload",
                method:"POST",
                body: obj,
                formData:true
            }),
            invalidatesTags:["Students"]
        }),
        updateStudent: build.mutation({
            query:(student)=>({
                url:`api/student/${student.id}`,
                method:"PUT",
                body: student
            }),
            invalidatesTags:["Students"]
        }),
        deleteGrade8:build.mutation({
            query:()=>({
                url:"api/student",
                method:"DELETE"
            }),
            invalidatesTags:["Students"]
        }),
        deleteStudent:build.mutation({
            query:(id)=>({
                url:`api/student/${id}`,
                method:"DELETE"
            }),
            invalidatesTags:["Students"]
        })
    })
})

export const {useGetAllStudentsQuery,useCreateStudentMutation,useCreateManyStudentsMutation,useUpdateStudentMutation,useDeleteGrade8Mutation,useDeleteStudentMutation} = studentApiSlice