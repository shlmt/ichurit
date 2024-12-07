import { useGetLatesForMarksQuery } from "../features/late/lateApiSlice"
import { DataTable } from "primereact/datatable"
import { useEffect, useRef } from "react"
import "react-jewish-datepicker/dist/index.css"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Toolbar } from "primereact/toolbar"
import { Toast } from "primereact/toast"
import ReactToPrint from "react-to-print"
import { useSendEmailMutation } from "../features/email/mailApiSlice"
import { renderToString } from "react-dom/server"
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date"

const LatesForMarks = (props) => {
    const toast = useRef(null)

    const { grade, number, email } = props
    const { startDate, endDate, id } = props.filter
    const { data: students = [], isLoading, isError, error } = useGetLatesForMarksQuery({ startDate, endDate, id })
    const [send, resSend] = useSendEmailMutation()

    const dt = useRef()
    let componentRef = useRef()

    useEffect(()=>{
        if (isError) 
            toast.current.show({ severity: 'error', summary: 'שגיאה', details: error.data.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר', life: 3000 })
    },[isError])

    const exportCSV = () => {
        dt.current.exportCSV()
    }


    const sendMail = () => {
        const html = renderToString(
            <div ref={(el) => componentRef = el}>
                <h2 style={{ color: "#6381AC" }}>{`סיכום לתעודות כיתה ${grade}${number} מתוכנת איחורית`}</h2>
                <DataTable responsiveLayout="stack" breakpoint="780px" ref={dt} value={students} rows={students.length} tableStyle={{ width: '50%', marginRight: '25%', marginBottom: '25px' }} emptyMessage="אין תלמידות שעונות על הסינון המבוקש">
                    <Column field="name" header="שם התלמידה" alignHeader='center'></Column>
                    <Column field="nLates" header='סה"כ איחורים' alignHeader='center'></Column>
                    <Column field="nLegalLates" header="מתוכם מאושרים" alignHeader='center'></Column>
                    <Column field="nMiss" header="חיסורים" alignHeader='center'></Column>
                </DataTable>
            </div>
        )
        send({ to: [email], title: `סיכום לתעודות כיתה ${grade}${number} מתוכנת איחורית`, html })
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
                    documentTitle={`סיכום לתעודות כיתה ${grade}${number}`}
                    onPrintError={() => toast.current.show({ severity: 'error', summary: 'שגיאת הדפסה', detail: 'נסו שוב מאוחר יותר', life: 3000 })}
                />
            </div>
        )
    }

    const dateBodyExport = (rowData) => {
        const date = rowData
        const jewishDate = toJewishDate(date)
        const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate)
        return jewishDateInHebrewStr
    }

    return (
        <>
            <Toolbar className="mb-4" right={toolbarTemplate} style={{ width: '50%', marginRight: '25%' }}></Toolbar><br />
            <div ref={(el) => componentRef = el}>
                <h2 style={{ color: "#6381AC" }}>{`סיכום לתעודות כיתה ${grade}${number} מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`}</h2>
                <DataTable responsiveLayout="stack" breakpoint="780px" ref={dt} value={students} rows={students.length} tableStyle={{ width: '50%', marginRight: '25%', marginBottom: '25px' }}
                    emptyMessage="אין תלמידות שעונות על הסינון המבוקש" exportFilename={`תעודות כיתה ${grade}${number} מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`}>
                    <Column field="name" header="שם התלמידה" alignHeader='center'></Column>
                    <Column field="nLates" header='סה"כ איחורים' alignHeader='center'></Column>
                    <Column field="nLegalLates" header="מתוכם מאושרים" alignHeader='center'></Column>
                    <Column field="nMiss" header="חיסורים" alignHeader='center'></Column>
                </DataTable>
            </div>
            <Toast ref={toast} position="top-left" />
        </>
    )
}
export default LatesForMarks