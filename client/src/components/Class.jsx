import { useDeleteClassMutation, useUpdateClassMutation } from '../features/class/classApiSlice'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Checkbox } from 'primereact/checkbox'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { useEffect, useRef, useState } from 'react'

const Class = (props) => {

    const [del, resDel] = useDeleteClassMutation()
    const [update, resUp] = useUpdateClassMutation()

    const grade = useRef(props.grade)
    const number = useRef(props.number)
    const teacher = useRef(props.teacher)
    const email = useRef(props.email)

    const [visible, setVisible] = useState(false)
    const [checked, setChecked] = useState(false)

    const toast = useRef(null)

    const updateClass = () => {
        if (grade.current.value == "" || teacher.current.value == "" || email.current.value == "")
            toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה למלא את כל השדות', life: 3000 })
        else {
            setVisible(false)
            let g = grade.current.value
            let n = number.current.value
            let t = teacher.current.value
            let e = email.current.value
            let obj = { grade: g, number: n, teacher: t, id: props.id, email: e }
            update(obj)
        }
    }

    useEffect(() => {
        if (resUp.isSuccess) {
            let details = `כיתה ${grade.current.value}${number.current.value} מחנכת: ${teacher.current.value}`
            toast.current.show({ severity: 'success', summary: `הכיתה עודכנה בהצלחה`, detail: details, life: 3000 })
        }
        if (resUp.isError) {
            let det = resUp?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resUp])

    useEffect(() => {
        if (resDel.isSuccess) {
            toast.current.show({ severity: 'success', summary: `הכיתה נמחקה בהצלחה`, detail: resDel.data.msg, life: 3000 })
        }
        if (resDel.isError) {
            let det = resDel?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resDel])

    const accept = () => {
        del(props.id)
    }

    const [v, setV] = useState(false)

    return (<>
        <Card title={props.grade + props.number} subTitle={" מחנכת: " + props.teacher} className="md:w-25rem" style={props.style}>
            <p style={{ marginTop: '-10px' }} className="m-0">{"כתובת מייל:"}</p>
            <p style={{ marginTop: '-10px', direction: 'ltr' }} className="m-0">{props.email}</p>
            <Button icon="pi pi-pencil" rounded outlined style={{ marginLeft: '0.5em' }} tooltip="עריכה" onClick={() => setVisible(true)} />
            <Button severity="secondary" icon="pi pi-trash" rounded outlined tooltip="מחיקה" tooltipOptions={{ position: 'left' }} onClick={() => setV(true)} />
        </Card>

        <Dialog header="עריכת כיתה" visible={visible} style={{ width: '400px' }} onHide={() => setVisible(false)}
            footer={<div>
                <Button label="&nbsp;שמירה" icon="pi pi-check" onClick={updateClass} autoFocus />
                <Button label="&nbsp;ביטול" icon="pi pi-times" onClick={() => setVisible(false)} className="p-button-text" />
            </div>
            }>
            <InputText placeholder='שכבה' ref={grade} defaultValue={props.grade} keyfilter={/^[\u0590-\u05ea]+$/i}/> <br /><br />
            <InputText placeholder='מספר כיתה' ref={number} keyfilter="pint" defaultValue={props.number} /> <br /><br />
            <InputText placeholder='מחנכת' ref={teacher} defaultValue={props.teacher} /><br /><br />
            <InputText placeholder='מייל מחנכת הכיתה' ref={email} defaultValue={props.email} />
        </Dialog>

        <Dialog visible={v} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal onHide={() => { setV(false); setChecked(false) }}
            footer={<>
                <Button label="&nbsp;כן" icon="pi pi-check" onClick={() => { setV(false); accept(); setChecked(false) }} disabled={!checked} />
                <Button label="&nbsp;לא" icon="pi pi-times" outlined onClick={() => { setV(false); setChecked(false) }} />
            </>} >
            <div className="confirmation-content">
                <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem' }} /><br />
                <h3>למחוק את הכיתה וכל התלמידות שרשומות בה?</h3>
                <Checkbox inputId="check" onChange={e => setChecked(e.checked)} checked={checked}></Checkbox><label htmlFor="check" className="ml-2">&nbsp;ידוע לי כי לא ניתן לשחזר לאחר המחיקה</label>
            </div>
        </Dialog>

        <Toast ref={toast} position="top-left" />
    </>)
}

export default Class