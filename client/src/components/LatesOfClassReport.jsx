import { Button } from "primereact/button"
import { Column } from "primereact/column"
import { DataTable } from "primereact/datatable"
import { Tag } from "primereact/tag"
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date"
import { useEffect, useRef } from "react"
import { useGetLatesByClassQuery } from "../features/late/lateApiSlice"
import { Toolbar } from "primereact/toolbar"
import { Toast } from "primereact/toast"
import ReactToPrint from "react-to-print"
import { renderToString } from "react-dom/server"
import { useSendEmailMutation } from "../features/email/mailApiSlice"

const LatesOfClassReport = (props) => {

    const toast = useRef(null)

    const { grade, number, email } = props
    const { startDate, endDate, id } = props.filter
    const { data: students = [], something } = useGetLatesByClassQuery({ id, startDate, endDate })

    const dateBodyTemplate = (rowData) => {
        const date = new Date(rowData.time)
        const jewishDate = toJewishDate(date)
        const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate)
        return (
            <div className="flex align-items-center gap-2">
                <span>{jewishDateInHebrewStr}</span>
            </div>
        )
    }

    const hoursBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                {rowData.type != 'חיסור' && <span>{rowData.time.split('T')[1].split('.')[0].substr(0, 5)}</span>}
            </div>
        )
    }

    const getSeverity = (option) => {
        switch (option) {
            case 'חיסור':
                return 'danger'
            case 'איחור מאושר':
                return 'success'
            case 'איחור':
                return 'primary'
        }
    }

    const typeBodyTemplate = (option) => {
        return <Tag value={option.type} severity={getSeverity(option.type)} />
    }

    const dt = useRef()

    const exportCSV = () => {
        dt.current.exportCSV()
    }

    let componentRef = useRef()

    const [send, resSend] = useSendEmailMutation()
    const sendMail = () => {
        const html = renderToString(
            <div ref={(el) => componentRef = el}>
                <h2 style={{ color: "#6381AC" }}>{`דוח נוכחות לכיתה ${grade}${number}`}</h2>
                <DataTable responsiveLayout="stack" breakpoint="780px" ref={dt} value={students} rows={students.length} tableStyle={{ width: '80%', minWidth: '400px', marginRight: '10%', marginBottom: '25px' }}
                    emptyMessage="אין חריגות נוכחות העונות על התנאי המבוקש">
                    <Column field="student.name" header="שם התלמידה" alignHeader='center' style={{ width: '21.25%', minWidth: '100%' }} ></Column>
                    <Column field="type" header="סוג חריגה" body={typeBodyTemplate} style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                    <Column field="time" header="תאריך" body={dateBodyTemplate} exportField={dateBodyExport} style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                    <Column field="time" header="שעה" body={hoursBodyTemplate} exportField={hoursBodyExport} style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                    <Column field="comment" header="הערה" style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                </DataTable>
            </div>
        )
        send({ to: [email], title: `דוח נוכחות לכיתה ${grade}${number} מתוכנת איחורית`, html })
    }
    useEffect(() => {
        if (resSend.isError)
            toast.current.show({ severity: 'error', summary: 'ארעה שגיאה בשליחה', detail: 'נסו שוב מאוחר יותר', life: 3000 })
        else if (resSend.isSuccess) toast.current.show({ severity: 'success', summary: 'ההודעה נשלחה בהצלחה', detail: resSend?.data?.msg || "", life: 3000 })
    }, [resSend])

    const toolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="&nbsp;שלח במייל" icon="pi pi-send" outlined onClick={sendMail} style={{ margin: '10px' }} tooltip={email} tooltipOptions={{ position: 'top', pt: { text: { dir: 'ltr' } } }} />
                <Button label="&nbsp;ייצוא" icon="pi pi-file-export" onClick={exportCSV} style={{ margin: '10px' }} />
                <ReactToPrint
                    trigger={() => <Button label="&nbsp;הדפסה" icon="pi pi-print" severity='secondary' style={{ margin: '10px' }} />}
                    content={() => componentRef}
                    documentTitle='מצטיינות'
                    onPrintError={() => toast.current.show({ severity: 'error', summary: 'שגיאת הדפסה', detail: 'נסו שוב מאוחר יותר', life: 3000 })}
                />
            </div>
        )
    }

    const dateBodyExport = (rowData) => {
        const date = rowData.time ? new Date(rowData.time) : rowData
        const jewishDate = toJewishDate(date)
        const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate)
        return jewishDateInHebrewStr
    }

    const hoursBodyExport = (rowData) => rowData.type != 'חיסור' ? rowData.time.split('T')[1].split('.')[0].substr(0, 5) : ''

    return (
        <>
            <Toolbar className="mb-4" right={toolbarTemplate} style={{ width: '50%', marginRight: '25%' }}></Toolbar><br />
            <div ref={(el) => componentRef = el}>
                <h2 style={{ color: "#6381AC" }}>{`דוח נוכחות לכיתה ${grade}${number} מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`}</h2>
                <DataTable responsiveLayout="stack" breakpoint="780px" ref={dt} value={students} rows={students.length} tableStyle={{ width: '80%', minWidth: '400px', marginRight: '10%', marginBottom: '25px' }}
                    emptyMessage="אין חריגות נוכחות העונות על התנאי המבוקש" exportFilename={`דוח נוכחות לכיתה ${grade}${number} מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`}>
                    <Column field="student.name" header="שם התלמידה" alignHeader='center' style={{ width: '21.25%', minWidth: '100%' }} ></Column>
                    <Column field="type" header="סוג חריגה" body={typeBodyTemplate} style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                    <Column field="time" header="תאריך" body={dateBodyTemplate} exportField={dateBodyExport} style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                    <Column field="time" header="שעה" body={hoursBodyTemplate} exportField={hoursBodyExport} style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                    <Column field="comment" header="הערה" style={{ width: '21.25%', minWidth: '100%' }} alignHeader='center'></Column>
                </DataTable>
            </div>
            <Toast ref={toast} position="top-left" />
        </>)
}

export default LatesOfClassReport