import { AutoComplete } from "primereact/autocomplete"
import LatesOfStudent from "./LatesOfStudent"
import { useEffect, useRef, useState } from "react"
import { useGetAllStudentsQuery } from "../features/student/studentApiSlice"
import { Card } from "primereact/card"
import { Toast } from "primereact/toast"

const Lates = () => {

    const { data: students = [], isLoading, isError, error } = useGetAllStudentsQuery()

    const [viewName, setViewName] = useState()
    const [selectedStudent, setSelectedStudent] = useState()
    const [filteredStudents, setFilteredStudents] = useState([])

    const toast = useRef()

    useEffect(()=>{
        if (isError) 
            toast.current.show({ severity: 'error', summary: 'שגיאה בשליפת התלמידות', details: error.data.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר', life: 3000 })
    },[isError])

    const itemTemplateS = (item) => {
        return (
            <div>{item.name + " " + item.class1.grade + item.class1.number}</div>
        )
    }

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

    return (
        <>
            <Card title='ניהול נוכחות' style={{ maxWidth: '50%', marginRight: '25%' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                    <AutoComplete
                        autoFocus
                        value={viewName}
                        style={{ textAlign: 'center' }}
                        placeholder='חיפוש תלמידה'
                        suggestions={filteredStudents} completeMethod={searchStudent}
                        itemTemplate={itemTemplateS}
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
            </Card>

            {selectedStudent && <LatesOfStudent id={selectedStudent._id} name={selectedStudent.name} grade={selectedStudent.class1.grade} number={selectedStudent.class1.number} />}
        
            <Toast ref={toast} position="top-left" />
        </>)
}

export default Lates