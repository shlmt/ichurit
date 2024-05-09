import { useEffect, useRef, useState } from "react"
import { useGetAllClassesQuery } from "../features/class/classApiSlice"
import LatesForMarks from "./LatesForMarks"
import { Card } from "primereact/card"
import { AutoComplete } from "primereact/autocomplete"
import { Button } from "primereact/button"
import { ReactJewishDatePicker, BasicJewishDay } from "react-jewish-datepicker"
import { Toast } from "primereact/toast"

const LatesForMarksFilter = () => {
    const { data: classes = [], result } = useGetAllClassesQuery()
    const [viewClass, setViewClass] = useState()
    const [selectedClass, setSelectedClass] = useState()
    const [filteredClasses, setFilteredClasses] = useState([])

    const toast = useRef(null)

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

    const handleSubmit = () => {
        if (startDate && endDate && selectedClass) {
            let id = selectedClass._id
            let start = new Date(startDate.setHours(0, 0, 0))
            let end = new Date(endDate.setHours(23, 59, 59))
            setFilter({ id, startDate: start, endDate: end })
            setShow(true)
        }
        else {
            if (!startDate || !endDate) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור טווח תאריכים', life: 3000 })
            if (!selectedClass) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור כיתה', life: 3000 })
        }
    }

    return (
        <>
            <Card title='דו"ח תעודות' style={{ maxWidth: '50%', marginRight: '25%' }}>
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
                    <div className="flex justify-content-center" style={{ width: '250px', fontSize: "20px", color: 'GrayText', marginLeft: '10px' }}>
                        <ReactJewishDatePicker
                            isHebrew
                            isRange={true}
                            canSelect={(day) => day.date <= new Date().setHours(23)}
                            onClick={(startDay, endDay) => { setStartDate(startDay.date); setEndDate(endDay.date) }}
                        />
                    </div>
                    <Button icon="pi pi-check" aria-label="Filter" onClick={handleSubmit} style={{ height: '2rem' }} label="&nbsp;סנן" />
                </div>
            </Card>
            <br />
            {show && <LatesForMarks filter={filter} grade={selectedClass.grade} number={selectedClass.number} email={selectedClass.email} />}

            <Toast ref={toast} position="top-left" />
        </>
    )
}

export default LatesForMarksFilter