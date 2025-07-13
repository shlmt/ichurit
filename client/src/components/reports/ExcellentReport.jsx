import { DataTable } from "primereact/datatable"
import { useEffect, useRef } from "react"
import "react-jewish-datepicker/dist/index.css"
import { Column } from "primereact/column"
import { useGetGoodStudentsQuery } from '../../features/late/lateApiSlice'
import { Button } from "primereact/button"
import { Toolbar } from "primereact/toolbar"
import ReactToPrint from "react-to-print"
import { Toast } from "primereact/toast"
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date"
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup"
import { InputText } from "primereact/inputtext"
import { renderToString } from "react-dom/server"
import { useSendEmailMutation } from "../../features/email/mailApiSlice"
import { Badge } from "primereact/badge"

const ExcellentReport = (props) => {

    const toast = useRef(null)

    const { startDate, endDate, maxSum} = props.filter
    const { data: goodStudents = [], isLoading, isError, error } = useGetGoodStudentsQuery({ startDate, endDate, maxSum })

    useEffect(()=>{
        if (isError) 
            toast.current.show({ severity: 'error', summary: 'שגיאה', details: error.data.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר', life: 3000 })
    },[isError])

    const classBodyTemplate = (rowData) => {
        return (
            <div className="flex align-items-center gap-2">
                {rowData.class1.grade + rowData.class1.number}
            </div>
        )
    }

    const dt = useRef()

    const exportCSV = () => {
        dt.current.exportCSV()
    }

    let componentRef = useRef()
    
    const [send, resSend] = useSendEmailMutation()
    const emailAddress = useRef('')
    const sendMail = () => {
        const html = renderToString(
            <div ref={(el) => componentRef = el}>
                <h2 style={{ color: "#6381AC" }}>מצטיינות</h2>
                <h3 style={{ color: "#6381AC",marginTop:'-10px' }}>מתאריך {dateBodyExport(startDate)} עד תאריך {dateBodyExport(endDate)}</h3>
                <DataTable responsiveLayout="stack" breakpoint="600px" ref={dt} value={goodStudents} rows={goodStudents.length} tableStyle={{ width: '50%', marginRight: '25%', marginBottom: '25px' }}
                    emptyMessage="אין תלמידות שעונות על הסינון המבוקש" exportFilename={`מצטיינות מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`} alignHeader='center' /*sortMode="multiple" multiSortMeta={multiSortMeta}*/>
                    <Column field="name" header="שם התלמידה" headerStyle={{ textAlign: 'center' }} alignHeader='center' ></Column>
                    <Column field="class1.grade" exportField={classExport} body={classBodyTemplate} header="כיתה" alignHeader='center' ></Column>
                </DataTable>
            </div>
        )
        send({ to: [emailAddress.current.value], title: `מצטיינות מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}` , html })
    }

    const accept = () => {
        sendMail()
        emailAddress.current = ''
    }

    const reject = () => {
        emailAddress.current = ''
    }

    const showTemplate = (event) => {
        confirmPopup({
            target: event.currentTarget,
            group: 'templating',
            header: 'Confirmation',
            message: (
                <div className="flex flex-column align-items-center w-full gap-3 border-bottom-1 surface-border">
                    <i className="pi pi-envelope text-6xl text-primary-500"></i>
                    <InputText id="username" value={emailAddress.current.value} ref={emailAddress} placeholder="כתובת מייל" inputMode="email" keyfilter='email' required style={{direction:'ltr',marginRight:'20px'}}/>
                </div>
            ),
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptLabel:'אישור',
            rejectLabel:'ביטול',
            rejectClass: 'p-button-sm',
            acceptClass: 'p-button-outlined p-button-sm',
            accept,
            reject
        })
    }

    useEffect(() => {
        if (resSend.isError)
            toast.current.show({ severity: 'error', summary: 'ארעה שגיאה בשליחה', detail: 'נסו שוב מאוחר יותר', life: 3000 })
        else if (resSend.isSuccess) toast.current.show({ severity: 'success', summary: 'ההודעה נשלחה בהצלחה', detail: resSend?.data?.msg || "", life: 3000 })
    }, [resSend])


    const toolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <ConfirmPopup group="templating"/>
                <Button label="&nbsp;שליחה במייל" icon="pi pi-send" outlined onClick={showTemplate} style={{margin:'10px'}}/> 
                <Button label="&nbsp;ייצוא" icon="pi pi-file-export" onClick={exportCSV} style={{ margin: '10px' }} />
                <ReactToPrint
                    trigger={() => <Button label="&nbsp;הדפסה" icon="pi pi-print" severity='secondary' style={{ margin: '10px' }} />}
                    content={() => componentRef}
                    documentTitle={`מצטיינות מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`}
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

    const classExport = (rowData) => rowData.class1.grade + rowData.class1.number

    let multiSortMeta = []
    multiSortMeta.push({ field: 'class1.grade' })
    multiSortMeta.push({ field: 'class1.number' })
    multiSortMeta.push({ field: 'name' })

    return (
        <>
           <Toolbar className="mb-4" right={toolbarTemplate} style={{ width: '50%', marginRight: '25%' }}></Toolbar><br />
            <div ref={(el) => componentRef = el}>
                <h2 style={{ color: "#6381AC" }} className="p-overlay-badge">
                    <i className="pi pi-users p-overlay-badge" style={{ fontSize: '2rem' }}>
                        <Badge value={goodStudents?.length||0} />
                    </i>
                     &nbsp;מצטיינות 
                </h2>
                <h3 style={{ color: "#6381AC",marginTop:'-10px' }}>מתאריך {dateBodyExport(startDate)} עד תאריך {dateBodyExport(endDate)}</h3>
                <DataTable responsiveLayout="stack" breakpoint="600px" ref={dt} value={goodStudents} rows={goodStudents.length} tableStyle={{ width: '50%', marginRight: '25%', marginBottom: '25px' }}
                    emptyMessage="אין תלמידות שעונות על הסינון המבוקש" exportFilename={`מצטיינות מתאריך ${dateBodyExport(startDate)} עד תאריך ${dateBodyExport(endDate)}`} alignHeader='center' /*sortMode="multiple" multiSortMeta={multiSortMeta}*/>
                    <Column field="name" header="שם התלמידה" headerStyle={{ textAlign: 'center' }} alignHeader='center' ></Column>
                    <Column field="class1.grade" exportField={classExport} body={classBodyTemplate} header="כיתה" alignHeader='center' ></Column>
                </DataTable>
            </div>
            <Toast ref={toast} position="top-left" />
        </>
    )
}

export default ExcellentReport