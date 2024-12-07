import { useEffect, useRef, useState } from "react"
import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { AutoComplete } from "primereact/autocomplete"
import { ReactJewishDatePicker, BasicJewishDay } from "react-jewish-datepicker"
import "react-jewish-datepicker/dist/index.css"
import { useGetAllClassesQuery } from "../features/class/classApiSlice"
import LatesOfClassReport from "./LatesOfClassReport"
import { Toast } from "primereact/toast"

const LatesOfClassReportFilter = () => {

    const { data: classes = [], isLoading, isError, error } = useGetAllClassesQuery()

    const [viewClass, setViewClass] = useState()
    const [selectedClass, setSelectedClass] = useState()
    const [filteredClasses, setFilteredClasses] = useState([])

    useEffect(()=>{
        if (isError) 
            toast.current.show({ severity: 'error', summary: 'שגיאה בשליפת הכיתות', details: error.error || 'ארעה שגיאה. נסה שוב מאוחר יותר', life: 3000 })
    },[isError])

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

    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()

    const [filter, setFilter] = useState()
    const [show, setShow] = useState(false)

    const toast = useRef(null)

    const handleSubmit = () => {
        if (startDate && endDate && selectedClass) {
            let id = selectedClass._id
            let start = new Date(startDate.setHours(0, 0, 0))
            let end = new Date(endDate.setHours(23, 59, 59))
            setFilter({ startDate: start, endDate: end, id })
            setShow(true)
        }
        else {
            if (!startDate || !endDate) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור טווח תאריכים', life: 3000 })
            if (!selectedClass) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור כיתה', life: 3000 })
        }
    }

    return (<>
        <Card title='דו"ח נוכחות כיתה' style={{ maxWidth: '50%', marginRight: '25%' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                <div style={{ marginLeft: '10px', marginRight: '10px' }}>
                    <AutoComplete
                        value={viewClass}
                        style={{ textAlign: 'center', marginBottom: '10px' }}
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
                    />
                </div>
                <div className="flex justify-content-center" style={{ width: '250px', fontSize: "20px", color: 'GrayText', marginLeft: '10px', marginBottom: '10px' }}>
                    <ReactJewishDatePicker
                        isHebrew
                        isRange={true}
                        canSelect={(day) => day.date <= new Date().setHours(23)}
                        onClick={(startDay, endDay) => { setStartDate(startDay.date); setEndDate(endDay.date) }}
                    />
                </div>
                <Button icon="pi pi-check" aria-label="Filter" onClick={handleSubmit} style={{ height: '2rem', marginBottom: '10px' }} label="&nbsp;סנן" />
            </div>
        </Card>
        <br />
        {show && <LatesOfClassReport filter={filter} grade={selectedClass.grade} number={selectedClass.number} email={selectedClass.email} />}
        <Toast ref={toast} position="top-left" />
    </>)
}

export default LatesOfClassReportFilter