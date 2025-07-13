import { useCreateUserMutation } from "../../features/auth/authApiSlice"

const NewUser=()=>{
    const [createUser,res] = useCreateUserMutation()
    return(
        <>
        </>
    )
}
export default NewUser
