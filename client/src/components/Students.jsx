import { useEffect, useRef, useState } from "react"
import { useGetAllStudentsQuery, useCreateStudentMutation } from "../features/student/studentApiSlice"
import { AutoComplete } from "primereact/autocomplete"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { Dialog } from "primereact/dialog"
import { useGetAllClassesQuery } from "../features/class/classApiSlice"
import StudentDetails from "./StudentDetails"
import { Card } from "primereact/card"

const Students = () => {
    const { data: students = [], refetch } = useGetAllStudentsQuery()
    const { data: classes = [], result2 } = useGetAllClassesQuery()

    const [viewName, setViewName] = useState()
    const [selectedStudent, setSelectedStudent] = useState()
    const [filteredStudents, setFilteredStudents] = useState([])

    const [viewClass, setViewClass] = useState()
    const [selectedClass, setSelectedClass] = useState()
    const [filteredClasses, setFilteredClasses] = useState([])

    useEffect(() => {
        if (selectedStudent)
            setViewName(selectedStudent?.name + ' ' + selectedStudent?.class1?.grade + selectedStudent?.class1?.number)
    }, [selectedStudent])

    const searchStudent = (event) => {
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

    const itemTemplateS = (item) => {
        return (
            <div>{item.name + " " + item.class1.grade + item.class1.number}</div>
        )
    }

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

    const [addStudent, result] = useCreateStudentMutation()
    const [visible, setVisible] = useState(false)
    const name = useRef()
    const idNum = useRef()
    const comment = useRef()

    const toast = useRef(null)

    const saveStudent = () => {
        if (name.current.value == "" || idNum.current.value == "" || selectedClass == null)
            toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'שדות החובה הם: שם, מספר זהות וכיתה', life: 3000 })
        else if (idNum.current.value.length != 9)
            toast.current.show({ severity: 'error', summary: 'מספר זהות לא תקין', detail: 'מספר זהות חייב להיות בעל 9 ספרות', life: 3000 })
        else {
            setVisible(false)
            let n = name.current.value
            let i = idNum.current.value
            let c = comment.current.value
            let student = { name: n, idNum: i, class1: selectedClass, comment: c }
            addStudent(student)
        }
    }

    useEffect(() => {
        if (result.isSuccess) {
            let details = result.data.msg
            toast.current.show({ severity: 'success', summary: `תלמידה חדשה נוספה בהצלחה`, detail: details, life: 3000 })
        }
        if (result.isError) {
            let det = result?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
        setSelectedClass(null)
        setViewClass('')
    }, [result])

    return (
        <>
            <Card title='ניהול תלמידות' style={{ maxWidth: '50%', marginRight: '25%' }}>
                <Button label="&nbsp;הוספת תלמידה" icon="pi pi-user-plus" onClick={() => setVisible(true)} />
                <br /><br />
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                    <AutoComplete
                        autoFocus
                        value={viewName}
                        style={{ textAlign: 'center' }}
                        placeholder='שם התלמידה'
                        suggestions={filteredStudents} completeMethod={searchStudent}
                        itemTemplate={itemTemplateS}
                        onChange={(e) => {
                            if (!e.value?.class1)
                                setViewName(e.value)
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
            </Card>

            <Dialog header="הוספת תלמידה" visible={visible} style={{ width: '400px' }} onHide={() => { setVisible(false); setSelectedClass(null); setViewClass('') }}
                footer={<div>
                    <Button label="&nbsp;שמירה" icon="pi pi-check" onClick={saveStudent} />
                    <Button label="&nbsp;ביטול" icon="pi pi-times" onClick={() => { setVisible(false); setSelectedClass(null); setViewClass('') }} className="p-button-text" />
                </div>
                }>
                <InputText placeholder='שם התלמידה' ref={name} /> <br /><br />
                <InputText placeholder='מספר זהות' ref={idNum} maxLength={9} minLength={9} keyfilter="pint" /> <br /><br />
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
                <InputText placeholder='הערה' ref={comment} maxLength={70} />
            </Dialog>

            <Toast ref={toast} position="top-left" />

            <br /><br />

            {selectedStudent && <StudentDetails refetch={refetch} id={selectedStudent._id} name={selectedStudent.name} class1={selectedStudent.class1} idNum={selectedStudent.idNum} comment={selectedStudent.comment} />}
        </>)
}

export default Students