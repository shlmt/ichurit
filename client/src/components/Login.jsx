import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLoginMutation } from '../features/auth/authApiSlice'
import { setToken } from '../features/auth/authSlice'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Toast } from 'primereact/toast';

const Login = () => {

    const dispatch = useDispatch()
    const [loginFunc, { isError, error, isSuccess, data }] = useLoginMutation()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const toastTopCenter = useRef(null)

    useEffect(() => {
        if (isSuccess)
            dispatch(setToken({ data, username }))
        if (isError){
            let detail = error.status==401 ? "לא מורשה" : 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toastTopCenter.current.show({ severity: 'error', summary: "שגיאה", detail, life: 2000 })
        }
    }, [isSuccess, isError])

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = { username, password }
        if(!username || ! password)
            toastTopCenter.current.show({ severity: 'error', summary: "חסר שדה חובה", detail: "יש למלא שם משתמש וסיסמה", life: 2000 })
        else loginFunc(formData)
    }

    return (<>
        <Toast ref={toastTopCenter} position="top-center" />
        <Card title="כניסת משתמשים" className='md:w-25rem' style={{ textAlign: 'center', width: '40vw', marginTop: '20vh', marginRight: '30vw', justifyItems: 'center' }}>
            <span className="p-input-icon-right">
                <i className="pi pi-user" />
                <InputText
                    type='text'
                    placeholder="שם משתמש"
                    style={{ width: '100%' }} 
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => {if(e.key=='Enter') handleSubmit(e)}} 
                />
            </span>
            <br />
            <br />
            <Password
                pt={{ input: { style: { width: '100%' } } }}
                placeholder="סיסמה"
                feedback={false}
                toggleMask
                style={{ marginBottom: '10px' }}
                onChange={(e) => setPassword(e.target.value)} 
                onKeyDown={(e) => {if(e.key=='Enter') handleSubmit(e)}} 
            />
            <br />
            <br />
            <Button label="כניסה" onClick={handleSubmit}/>
        </Card>
    </>)
}

export default Login
