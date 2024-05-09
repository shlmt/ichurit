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
        if (isError)
            toastTopCenter.current.show({ severity: 'error', summary: "שגיאה", detail: "לא מורשה", life: 2000 })
    }, [isSuccess, isError])

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = { username, password }
        loginFunc(formData)
    }

    return (<>
        <Toast ref={toastTopCenter} position="top-center" />
        <br />
        <Card title="כניסת משתמשים" className='md:w-25rem' style={{ textAlign: 'center', width: '40vw', marginTop: '20vh', marginRight: '30vw', justifyItems: 'center' }}>
            <span className="p-input-icon-right">
                <i className="pi pi-user" />
                <InputText type='password' placeholder="שם משתמש" onChange={(e) => setUsername(e.target.value)} style={{ width: '100%' }} />
            </span>
            <br />
            <br />
            <Password pt={{ input: { style: { width: '100%' } } }} placeholder="סיסמה" feedback={false} toggleMask style={{ marginBottom: '10px' }} onChange={(e) => setPassword(e.target.value)} />
            <br />
            <br />
            <Button label="כניסה" onClick={handleSubmit} />
        </Card>
    </>)
}

export default Login