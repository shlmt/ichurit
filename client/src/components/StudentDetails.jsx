import { useEffect, useState } from "react"
import { useRef } from "react"
import { useDeleteStudentMutation, useUpdateStudentMutation } from "../features/student/studentApiSlice"
import { Card } from "primereact/card"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { InputText } from "primereact/inputtext"
import { Toast } from "primereact/toast"
import { AutoComplete } from "primereact/autocomplete"
import { useGetAllClassesQuery } from "../features/class/classApiSlice"
import { Checkbox } from "primereact/checkbox"

const StudentDetails = (props) => {
    const { data: classes = [], something2 } = useGetAllClassesQuery()

    const [del, resDel] = useDeleteStudentMutation()
    const [update, resUp] = useUpdateStudentMutation()

    const id = props.id
    const idNum = useRef(props.idNum)
    const name = useRef(props.name)
    const comment = useRef(props.comment)
    const [selectedClass, setSelectedClass] = useState(props.class1)

    const [visible, setVisible] = useState(false)
    const [checked, setChecked] = useState(false)

    const toast = useRef(null)

    const updateStudent = () => {
        if (name.current.value == "" || idNum.current.value == "" || !selectedClass)
            toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה למלא את כל השדות', life: 3000 })
        else {
            setVisible(false)
            let n = name.current.value
            let idN = idNum.current.value
            let c = selectedClass._id
            let com = comment.current.value
            let obj = { name: n, idNum: idN, class1: c, id, comment: com }
            update(obj)
        }
    }

    useEffect(() => {
        if (resUp.isSuccess) {
            let details = `${name.current.value} ${idNum.current.value} עודכנה בהצלחה`
            toast.current.show({ severity: 'success', summary: `פרטי תלמידה עודכנו בהצלחה`, detail: details, life: 3000 })
            props.refetch()
        }
        if (resUp.isError) {
            let det = resUp?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resUp])

    useEffect(() => {
        if (resDel.isSuccess) {
            let details = resDel.data.msg
            toast.current.show({ severity: 'success', summary: `תלמידה נמחקה בהצלחה`, detail: details, life: 3000 })
        }
        if (resDel.isError) {
            let det = resDel?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resDel])

    const accept = () => {
        del(id)
    }

    const [v, setV] = useState(false)

    const [viewClass, setViewClass] = useState(props.class1.grade + props.class1.number)
    const [filteredClasses, setFilteredClasses] = useState([])

    useEffect(() => {
        if (selectedClass)
            setViewClass(selectedClass?.grade + selectedClass?.number)
    }, [selectedClass])

    const searchClass = (event) => {
        setTimeout(() => {
            let _filtered;
            if (!event.query)
                _filtered = [...classes]
            else {
                _filtered = classes.filter((c) => {
                    let string = c.grade + c.number
                    return string.includes(event.query)
                })
            }
            setFilteredClasses(_filtered)
        }, 250)
    }

    const itemTemplateC = (item) => {
        return (
            <div>{item.grade + item.number}</div>
        )
    }

    return (<>
        <Card className="md:w-25rem" style={{ width: '50%', marginRight: '25%' }}>
            <h2>{props.name}</h2>
            <p className="m-0">{" כיתה: " + props.class1?.grade + props.class1?.number}</p>
            <p className="m-0">{"מספר זהות: " + props.idNum}</p>
            {props.comment && <p className="m-0">{"הערה: " + props.comment}</p>}
            <Button icon="pi pi-pencil" rounded outlined style={{ marginLeft: '0.5em' }} tooltip="עריכה" onClick={() => setVisible(true)} />
            <Button severity="secondary" icon="pi pi-trash" rounded outlined tooltip="מחיקה" tooltipOptions={{ position: 'left' }} onClick={() => setV(true)} />
        </Card>

        <Dialog header="עריכת פרטי תלמידה" visible={visible} style={{ width: '400px' }} onHide={() => { setVisible(false) }}
            footer={<div>
                <Button label="&nbsp;שמירה" icon="pi pi-check" onClick={updateStudent} />
                <Button label="&nbsp;ביטול" icon="pi pi-times" onClick={() => { setVisible(false) }} className="p-button-text" />
            </div>
            }>
            <InputText placeholder='שם התלמידה' ref={name} defaultValue={props.name} /> <br /><br />
            <InputText placeholder='מספר זהות' ref={idNum} maxLength={9} minLength={9} keyfilter="pint" defaultValue={props.idNum} /> <br /><br />
            <AutoComplete
                value={viewClass}
                style={{ textAlign: 'center' }}
                placeholder='כיתה'
                suggestions={filteredClasses} completeMethod={searchClass}
                itemTemplate={itemTemplateC}
                onChange={(e) => {
                    if (!e.value?.grade) {
                        setViewClass(e.value)
                    }
                    else {
                        setViewClass(e.value.grade + e.value.number)
                        setSelectedClass(e.value)
                    }
                }
                }
                forceSelection
                onBlur={() => { if (selectedClass) setViewClass(selectedClass.grade + selectedClass.number) }}
            /> <br /><br />
            <InputText placeholder='הערה' ref={comment} maxLength={70} defaultValue={props.comment} />
        </Dialog>

        <Dialog visible={v} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal onHide={() => { setV(false); setChecked(false) }}
            footer={<>
                <Button label="&nbsp;כן" icon="pi pi-check" onClick={() => { setV(false); accept(); setChecked(false) }} disabled={!checked} />
                <Button label="&nbsp;לא" icon="pi pi-times" outlined onClick={() => { setV(false); setChecked(false) }} />
            </>} >
            <div className="confirmation-content">
                <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem' }} /><br />
                <h3>למחוק את התלמידה?</h3>
                <Checkbox inputId="check" onChange={e => setChecked(e.checked)} checked={checked}></Checkbox><label htmlFor="check" className="ml-2">&nbsp;ידוע לי כי לא ניתן לשחזר לאחר המחיקה</label>
            </div>
        </Dialog>

        <Toast ref={toast} position="top-left" />
    </>)
}


export default StudentDetails