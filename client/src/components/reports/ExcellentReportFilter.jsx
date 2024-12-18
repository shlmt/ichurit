import { Button } from "primereact/button"
import { Card } from "primereact/card"
import { InputNumber } from "primereact/inputnumber"
import { useRef, useState } from "react"
import { Toast } from 'primereact/toast'
import { ReactJewishDatePicker, BasicJewishDay } from "react-jewish-datepicker"
import "react-jewish-datepicker/dist/index.css"
import ExcellentReport from "./ExcellentReport"

const ExcellentReportFilter = () => {

    const [maxSum, setMaxSum] = useState(0)
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [filter, setFilter] = useState()
    const [show, setShow] = useState(false)

    const toast = useRef(null)

    const handleSubmit = () => {
        if (startDate && endDate && maxSum >= 0) {
            let start = new Date(startDate.setHours(0, 0, 0))
            let end = new Date(endDate.setHours(23, 59, 59))
            setFilter({ startDate: start, endDate: end, maxSum })
            setShow(true)
        }
        else {
            toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לבחור טווח תאריכים', life: 3000 })
        }
    }

    return (
        <>
            <Card title='דו"ח מצטיינות' style={{ maxWidth: '50%', marginRight: '25%' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                    <div className="flex justify-content-center" style={{ width: '250px', fontSize: "20px", color: 'GrayText' }}>
                        <ReactJewishDatePicker
                            isHebrew
                            isRange={true}
                            canSelect={(day) => day.date <= new Date().setHours(23)}
                            onClick={(startDay, endDay) => { setStartDate(startDay.date); setEndDate(endDay.date) }}
                        />
                    </div>
                    <div style={{ marginLeft: '10px', marginRight: '10px' }}>
                        <InputNumber value={maxSum} tooltip="מקסימום איחורים" tooltipOptions={{ position: 'bottom' }} min={0} onValueChange={(e) => setMaxSum(e.value)}
                            showButtons inputStyle={{ width: '50px' }} style={{ height: '2rem', direction: 'ltr' }} />
                    </div>
                    <Button icon="pi pi-check" aria-label="Filter" onClick={handleSubmit} style={{ height: '2rem' }} label="&nbsp;סנן" />
                </div>
            </Card>
            <br />
            {show && <ExcellentReport filter={filter} />}

            <Toast ref={toast} position="top-left" />
        </>
    )
}

export default ExcellentReportFilter