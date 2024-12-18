import { Password } from "primereact/password"
import { useChangePassMutation } from "../../features/auth/authApiSlice"
import { useRef, useState } from "react"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { Card } from "primereact/card"

const EditPassword = () => {
    const [editPass, res] = useChangePassMutation()
    const [newPassword, setNewPassword] = useState("")
    const [password, setPassword] = useState("")

    const toast = useRef(null)
    const handleSubmit = () => {
        if (!password || !newPassword) {
            if (!password) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור סיסמה חדשה', life: 3000 })
            if (!newPassword) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לאמת את הסיסמה החדשה', life: 3000 })
        }
        if (password != newPassword) toast.current.show({ severity: 'error', summary: 'שגיאה באימות הסיסמה החדשה ', detail: 'אימות הסיסמה אינו תקין', life: 3000 })

        else {
            editPass({ newPassword })
            toast.current.show({ severity: 'success', summary: "הסיסמה עודכנה בהצלחה", life: 3000 })
        }
    }

    return (
        <>
            <Card style={{ width: '50%', marginRight: '25%' }}>
                <h2 style={{ color: 'GrayText' }}>עדכון סיסמה</h2>
                <Password pt={{ input: { style: { width: '100%' } } }} placeholder="סיסמה חדשה" feedback={false} toggleMask style={{ marginBottom: '10px' }} onChange={(e) => setPassword(e.target.value)} />
                <br />
                <Password pt={{ input: { style: { width: '100%' } } }} placeholder="אימות סיסמה חדשה" feedback={false} toggleMask style={{ marginBottom: '10px' }} onChange={(e) => setNewPassword(e.target.value)} />
                <br />
                <br />
                {<Button label="&nbsp;אישור" icon="pi pi-check" onClick={handleSubmit} />}
            </Card>
            <Toast ref={toast} position="top-left" />
        </>
    )
}
export default EditPassword