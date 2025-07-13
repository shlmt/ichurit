import { useEffect, useRef, useState } from 'react'
import { useGetAllStudentsQuery } from '../features/student/studentApiSlice'
import { useAddLateMutation } from '../features/late/lateApiSlice'
import { AutoComplete } from "primereact/autocomplete"
import { SelectButton } from 'primereact/selectbutton'
import { ReactJewishDatePicker } from "react-jewish-datepicker"
import "react-jewish-datepicker/dist/index.css"
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date"
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
import { InputTextarea } from "primereact/inputtextarea"
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'

const CreateLate = () => {

    const { data: students, isLoading, isError, error } = useGetAllStudentsQuery()
    const [createLate, result] = useAddLateMutation()

    const [viewName, setViewName] = useState()
    const [selectedStudent, setSelectedStudent] = useState()
    const [filteredStudents, setFilteredStudents] = useState([])

    useEffect(() => {
        if (selectedStudent)
            setViewName(selectedStudent?.name + ' ' + selectedStudent?.class1?.grade + selectedStudent?.class1?.number)
    }, [selectedStudent])

    const search = (event) => {
        setTimeout(() => {
            let _filtered;
            if (!event.query)
                _filtered = [...students]
            else {
                _filtered = students.filter((st) => {
                    let string = st.name + ' ' + st.class1.grade + st.class1.number
                    return string.includes(event.query)
                })
            }
            setFilteredStudents(_filtered)
        }, 250)
    }

    const itemTemplate = (item) => {
        return (
            <div>{item.name + " " + item.class1.grade + item.class1.number}</div>
        )
    }

    const [lateVal, setLateVal] = useState('איחור')
    const latesOptions = [
        { icon: 'pi pi-minus', value: 'חיסור' },
        { icon: 'pi pi-plus-circle', value: 'איחור מאושר' },
        { icon: 'pi pi-plus', value: 'איחור' }
    ]

    const justifyTemplate = (option) => {
        return <i className={option.icon}></i>;
    }

    const [date, setDate] = useState(new Date())
    const [hour, setHour] = useState(new Date())
    const [comment, setComment] = useState()

    const toast = useRef(null)

    useEffect(() => {
        if (result.isSuccess) {
            const date = new Date(result.originalArgs.time)
            const jewishDate = toJewishDate(date)
            const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate)
            let details = `${jewishDateInHebrewStr}`
            const offset = date.getTimezoneOffset() / 60 * -1
            if (result.originalArgs.type != 'חיסור')
                details += ` ${date?.getHours() - offset}:${date?.getMinutes()}`
            toast.current.show({ severity: 'success', summary: `${lateVal} נרשם בהצלחה`, detail: details, life: 3000 })
            setViewName()
            setSelectedStudent()
            setComment("")
            setLateVal('איחור')
            setDate(new Date())
            setHour(new Date())
        }
        if (result.isError) {
            toast.current.show({ severity: 'error', summary: result?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר', life: 3000 })
        }
    }, [result])

    const handleSubmit = () => {
        if (!selectedStudent || !lateVal) {
            if (!selectedStudent) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור תלמידה', life: 3000 })
            if (!lateVal) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור סוג חריגה', life: 3000 })
        }
        else {
            let studentId = selectedStudent?._id
            let time = date
            const offset = date.getTimezoneOffset() / 60 * -1
            if (lateVal == 'חיסור') {
                time.setHours(offset)
                time.setMinutes(0)
            }
            else {
                time.setHours(hour.getHours() + offset)
                time.setMinutes(hour.getMinutes())
            }
            createLate({ studentId, type: lateVal, time: date, comment })
        }
    }


    return (<>
        <Card style={{ width: '50%', marginRight: '25%' }}>
            <h2 style={{ color: 'GrayText' }}>עדכון נוכחות</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                <AutoComplete
                    autoFocus
                    value={viewName}
                    style={{ textAlign: 'center' }}
                    placeholder='חיפוש תלמידה'
                    suggestions={filteredStudents} completeMethod={search}
                    itemTemplate={itemTemplate}
                    onChange={(e) => {
                        if (!e.value?.class1) {
                            setViewName(e.value)
                        }
                        else {
                            setViewName(e.value.name + " " + e.value.class1.grade + e.value.class1.number)
                            setSelectedStudent(e.value)
                        }
                    }
                    }
                    forceSelection
                    onBlur={() => { if (selectedStudent) setViewName(selectedStudent.name + " " + selectedStudent.class1.grade + selectedStudent.class1.number) }}
                />
            </div>
            <br />
            <SelectButton
                value={lateVal}
                onChange={(e) => setLateVal(e.value)}
                optionLabel="value"
                options={latesOptions}
                itemTemplate={justifyTemplate}
                style={{ direction: 'ltr' }}
            />
            <br />
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                <div className="flex justify-content-center" style={{ width: '25%', minWidth: '200px', fontSize: "20px", color: 'GrayText', marginLeft: 'auto', marginRight: 'auto' }}>
                    <ReactJewishDatePicker style={{ minHeight: '25px', border: '1px solid #d8dee9' }} value={date} isHebrew
                        onClick={(day) => setDate(day.date)} canSelect={(day) => day.date <= new Date().setHours(23)} />
                </div></div>
            {lateVal != "חיסור" && <><br />
                <div className="flex justify-content-center" style={{ fontSize: "20px", color: 'GrayText' }}>
                    <div className="flex-auto">
                        <Calendar value={hour} onChange={(e) => setHour(e.value)} showIcon timeOnly icon={() => <i className="pi pi-clock" />}
                            style={{ direction: 'ltr' }} panelStyle={{ direction: 'ltr' }} />
                    </div>
                </div></>}

            <br />
            <InputTextarea id="comment" aria-describedby="comment-help" maxLength={70} value={comment} placeholder='הערה' onChange={(e) => setComment(e.target.value)} rows={2} cols={20}
            style={{resize:'none'}}/><br />
            <br />
            <Button label="&nbsp;אישור" icon="pi pi-check" onClick={handleSubmit} />
        </Card>
        <Toast ref={toast} position="top-left" />
    </>)
}

export default CreateLate
