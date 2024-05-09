import { useAddClassMutation } from '../features/class/classApiSlice'
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { Toast } from "primereact/toast"
import { useEffect, useRef, useState } from 'react'


const NewClass = () => {
    const [visible, setVisible] = useState(false)

    const [addClass, result] = useAddClassMutation()

    const grade = useRef()
    const number = useRef()
    const teacher = useRef()
    const email = useRef()

    const toast = useRef(null)

    const saveClass = () => {
        if (grade.current.value == "" || teacher.current.value == "" || email.current.value == "")
            toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה למלא את כל השדות', life: 3000 })
        else {
            setVisible(false)
            let g = grade.current.value
            let n = number.current.value
            let t = teacher.current.value
            let e = email.current.value
            let class1 = { grade: g, number: n, teacher: t, email: e }
            addClass(class1)
        }
    }

    useEffect(() => {
        if (result.isSuccess) {
            let details = `${grade.current.value}${number.current.value} מחנכת: ${teacher.current.value}`
            toast.current.show({ severity: 'success', summary: `כיתה נוספה בהצלחה`, detail: details, life: 3000 })
        }
        if (result.isError) {
            let det = result?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [result])

    return (
        <>
            <Button label="&nbsp;הוספת כיתה" icon="pi pi-plus" onClick={() => setVisible(true)} />

            <Dialog header="הוספת כיתה" visible={visible} style={{ width: '400px' }} onHide={() => setVisible(false)}
                footer={<div>
                    <Button label="&nbsp;שמירה" icon="pi pi-check" onClick={saveClass} />
                    <Button label="&nbsp;ביטול" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
                </div>
                }>
                <InputText placeholder='שכבה' ref={grade} /> <br /><br />
                <InputText placeholder='מספר כיתה' ref={number} keyfilter="pint" /> <br /><br />
                <InputText placeholder='מחנכת' ref={teacher} /><br /><br />
                <InputText placeholder='מייל מחנכת הכיתה' ref={email} />
            </Dialog>

            <Toast ref={toast} position="top-left" />
        </>
    )
}

export default NewClass