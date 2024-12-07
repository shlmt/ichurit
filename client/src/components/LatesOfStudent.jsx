import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { useDeleteLateMutation, useGetLatesByStudentQuery, useUpdateLateMutation } from '../features/late/lateApiSlice'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import React, { useEffect, useRef, useState } from 'react'
import { ReactJewishDatePicker, BasicJewishDay } from 'react-jewish-datepicker'
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date"
import "react-jewish-datepicker/dist/index.css"
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { Dialog } from 'primereact/dialog'
import { Checkbox } from 'primereact/checkbox'
import { Toolbar } from 'primereact/toolbar'
import ReactToPrint from 'react-to-print'
import { Calendar } from 'primereact/calendar'

const LatesOfStudent = (props) => {

    const { data: lates = [], something } = useGetLatesByStudentQuery(props.id)
    const [update, resUp] = useUpdateLateMutation()
    const [del, resDel] = useDeleteLateMutation()

    const [checked, setChecked] = useState(false)

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

    const [date, setDate] = useState('')
    const [hour, setHour] = useState(new Date())

    const [currEditRaw, setCurrEditRaw] = useState(null)

    const comment = useRef()

    const textEditor = (options) => {
        return <InputText ref={comment} maxLength={70} type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} style={{ width: '80%', minWidth: '100px' }} />
    }

    const hourEditor = (options) => {
        return <Calendar value={hour} onChange={(e) => { setHour(e.value) }} showIcon timeOnly icon={() => <i className="pi pi-clock" />}
            style={{ direction: 'ltr', width: '30%', minWidth: '100px' }} panelStyle={{ direction: 'ltr' }} />
    }

    const dateEditor = (options) => {
        return <ReactJewishDatePicker value={date} isHebrew
            canSelect={(day) => day.date <= new Date().setHours(23)}
            onClick={(day) => { setDate(day.date) }} />
    }

    const type = useRef()

    const typeEditor = (options) => {
        return (
            <Dropdown
                value={options.value}
                options={['איחור', 'איחור מאושר', 'חיסור']}
                onChange={(e) => options.editorCallback(e.value)}
                placeholder="Select a Status"
                ref={type}
                itemTemplate={(option) => {
                    return <Tag value={option} severity={getSeverity(option)} />
                }}
            />
        )
    }

    const toast = useRef(null)

    const onRowEditComplete = (e) => {
        if (!hour && type.current.props.value != 'חיסור') toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לציין שעה', life: 3000 })
        if (!date) toast.current.show({ severity: 'error', summary: 'חסר שדה חובה', detail: 'חובה לציין תאריך', life: 3000 })
        else {
            setCurrEditRaw(null)
            const id = e.data._id
            const t = e.newData.type
            const c = e.newData.comment
            const studentId = props.id
            let time = date
            const offset = date.getTimezoneOffset() / 60 * -1
            if (t == 'חיסור') {
                time.setHours(offset)
                time.setMinutes(0)
            }
            else {
                time.setHours(hour.getHours() + offset)
                time.setMinutes(hour.getMinutes())
            }
            const updateLate = { id, type: t, time, comment: c, studentId }
            update(updateLate)
        }
    }

    useEffect(() => {
        if (resUp.isSuccess) {
            const date = new Date(resUp.originalArgs.time)
            const jewishDate = toJewishDate(date)
            const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate)
            const offset = date.getTimezoneOffset() / 60 * -1
            let details = `${props.name} ${jewishDateInHebrewStr}`
            if(resUp.originalArgs.type!='חיסור') details+=` ${hour?.getHours() - offset}:${hour?.getMinutes()}`
            toast.current.show({ severity: 'success', summary: `${resUp.originalArgs.type} עודכן בהצלחה`, detail: details, life: 3000 })
        }
        if (resUp.isError) {
            let det = resUp?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resUp])

    useEffect(() => {
        if (resDel.isSuccess) {
            toast.current.show({ severity: 'success', summary: resDel.data.msg, life: 3000 })
        }
        if (resDel.isError) {
            let det = resDel?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resDel])

    const dt = useRef()

    const exportCSV = () => {
        dt.current.exportCSV()
    }

    const allowEdit = (rowData) => {
        return rowData._id == currEditRaw || currEditRaw == null
    }

    const [deleteDialog, setDeleteDialog] = useState(false)
    const [idDel, setIdDel] = useState(null);

    const actionBodyTemplate = (rowData) => {
        return <Button icon="pi pi-trash" rounded severity="danger" onClick={() => { setDeleteDialog(true); setIdDel(rowData._id) }} text />
    }

    const dateBodyExport = (rowData) => {
        const date = new Date(rowData.time)
        const jewishDate = toJewishDate(date)
        const jewishDateInHebrewStr = formatJewishDateInHebrew(jewishDate)
        return jewishDateInHebrewStr
    }

    const hoursBodyExport = (rowData) => rowData.type != 'חיסור' ? rowData.time.split('T')[1].split('.')[0].substr(0, 5) : ''

    let componentRef = useRef()

    const toolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="&nbsp;ייצוא" icon="pi pi-file-export" onClick={exportCSV} style={{ margin: '10px' }} />
                <ReactToPrint
                    trigger={() => <Button label="&nbsp;הדפסה" icon="pi pi-print" severity='secondary' style={{ margin: '10px' }} />}
                    content={() => componentRef}
                    documentTitle={`נוכחות ${props.name} ${props.grade}${props.number}`}
                    onPrintError={() => toast.current.show({ severity: 'error', summary: 'שגיאת הדפסה', detail: 'נסו שוב מאוחר יותר', life: 3000 })}
                />
            </div>
        )
    }

    const rowEditInit = (e) => {
        setCurrEditRaw(Object.values(e.data)[0])
        let d = new Date(e.data.time)
        setDate(d)
        const offset = d.getTimezoneOffset() / 60 * -1
        d.setHours(d.getHours() - offset)
        setHour(d)
    }

    return (
        <>
            <div className="card" style={{ width: '75%', marginRight: '12.5%' }}>
                <Toolbar className="mb-4" right={toolbarTemplate} style={{ width: '50%', marginRight: '25%' }}></Toolbar><br />
                <div ref={(el) => componentRef = el}>
                    <h2 style={{ color: "#6381AC" }}>{`נוכחות ${props.name} ${props.grade}${props.number}. סה"כ: ${lates.length||0} חריגות נוכחות`}</h2>
                    <DataTable ref={dt} value={lates} rows={5} id="_id" dataKey="_id" exportFilename={`נוכחות ${props.name} ${props.grade}${props.number}`}
                        editMode="row" onRowEditCancel={() => setCurrEditRaw(null)} onRowEditComplete={onRowEditComplete} onRowEditInit={(e) => rowEditInit(e)}
                        paginator paginatorTemplate="LastPageLink NextPageLink CurrentPageReport PrevPageLink FirstPageLink RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25, 50]} currentPageReportTemplate="({first} עד {last} מתוך {totalRecords})"
                        emptyMessage="אין חריגות נוכחות" responsiveLayout="stack" breakpoint="1000px" tableStyle={{ width: '90%', minWidth: '280px', marginRight: '5%', marginBottom: '25px' }}>
                        <Column field="type" header="סוג" body={typeBodyTemplate} editor={(options) => typeEditor(options)} style={{ width: '25%', minWidth: '100%' }} alignHeader='center'></Column>
                        <Column field="time" header="תאריך" body={dateBodyTemplate} exportField={dateBodyExport} editor={(options) => dateEditor(options)} style={{ width: '25%', minWidth: '100%' }} alignHeader='center'></Column>
                        <Column field="time" header="שעה" body={hoursBodyTemplate} exportField={hoursBodyExport} editor={(options) => hourEditor(options)} style={{ width: '25%', minWidth: '100%' }} alignHeader='center'></Column>
                        <Column field="comment" header="הערה" editor={(options) => textEditor(options)} style={{ width: '10%', minWidth: '100%' }} alignHeader='center'></Column>
                        <Column rowEditor={allowEdit} headerStyle={{ width: '10%' }} bodyStyle={{ textAlign: 'center', minWidth: '100%' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ width: '5%' }} exportable={false} bodyStyle={{ textAlign: 'center', minWidth: '100%' }}></Column>
                    </DataTable>
                </div>
            </div>

            <Toast ref={toast} position="top-left" />

            <Dialog visible={deleteDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal onHide={() => { setDeleteDialog(false); setChecked(false) }}
                footer={<>
                    <Button label="&nbsp;כן" icon="pi pi-check" onClick={() => { setDeleteDialog(false); del(idDel); setChecked(false) }} disabled={!checked} />
                    <Button label="&nbsp;לא" icon="pi pi-times" outlined onClick={() => { setDeleteDialog(false); setChecked(false) }} />
                </>} >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem' }} /><br />
                    <h3>למחוק את חריגת הנוכחות?</h3>
                    <Checkbox inputId="check" onChange={e => setChecked(e.checked)} checked={checked}></Checkbox><label htmlFor="check" className="ml-2">&nbsp;ידוע לי כי לא ניתן לשחזר לאחר המחיקה</label>
                </div>
            </Dialog>
        </>
    )
}

export default LatesOfStudent