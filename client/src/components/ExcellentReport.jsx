import { DataTable } from "primereact/datatable"
import { useRef, useState } from "react"
import "react-jewish-datepicker/dist/index.css"
import { Column } from "primereact/column"
import { useGetGoodStudentsQuery } from '../features/late/lateApiSlice'
import { Button } from "primereact/button"
import { Toolbar } from "primereact/toolbar"
import ReactToPrint from "react-to-print"
import { Toast } from "primereact/toast"
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date"

const ExcellentReport = (props) => {

    const toast = useRef(null)

    const { startDate, endDate, maxSum } = props.filter
    const { data: goodStudents = [], result } = useGetGoodStudentsQuery({ startDate, endDate, maxSum })

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

    const toolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
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
                <h2 style={{ color: "#6381AC" }}>מצטיינות מתאריך {dateBodyExport(startDate)} עד תאריך {dateBodyExport(endDate)}</h2>
                <DataTable responsiveLayout="stack" breakpoint="600px" ref={dt} value={goodStudents} rows={goodStudents.length} tableStyle={{ width: '50%', marginRight: '25%', marginBottom: '25px' }}
                    emptyMessage="אין תלמידות שעונות על הסינון המבוקש" exportFilename='מצטיינות' alignHeader='center' /*sortMode="multiple" multiSortMeta={multiSortMeta}*/>
                    <Column field="name" header="שם התלמידה" headerStyle={{ textAlign: 'center' }} alignHeader='center' ></Column>
                    <Column field="class1.grade" exportField={classExport} body={classBodyTemplate} header="כיתה" alignHeader='center' ></Column>
                </DataTable>
            </div>
            <Toast ref={toast} position="top-left" />
        </>
    )
}

export default ExcellentReport