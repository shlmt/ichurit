import React, { useEffect, useRef, useState } from "react"
import { Button } from "primereact/button"
import { Stepper } from "primereact/stepper"
import { StepperPanel } from "primereact/stepperpanel"
import { Toast } from "primereact/toast"
import { Card } from "primereact/card"
import { Checkbox } from "primereact/checkbox"
import { useDeleteHistoryMutation } from "../features/late/lateApiSlice"
import { useCreateManyStudentsMutation, useDeleteGrade8Mutation } from "../features/student/studentApiSlice"
import { useGetAllClassesQuery, useUpdateNewYearMutation } from "../features/class/classApiSlice"
import ExportExcel from "./ExportExcel"
import { FileUpload } from "primereact/fileupload"
import { Carousel } from 'primereact/carousel'
import Class from "./Class"
import NewClass from "./NewClass"

const StepperNewYear = () => {
    const stepperRef = useRef(null)
    const toast = useRef(null)
    const [checked, setChecked] = useState(false)

    const [orient, setOrient] = useState("horizontal")
    const getWindowDimensions = () => {
        const { innerWidth: width, innerHeight: height } = window
        return { width, height }
    }
    const useWindowDimensions = () => {
        const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions())
        useEffect(() => {
            function handleResize() {
                setWindowDimensions(getWindowDimensions())
            }
            window.addEventListener("resize", handleResize)
            return () => window.removeEventListener("resize", handleResize)
        }, [])
        return windowDimensions
    }
    const { height, width } = useWindowDimensions()
    useEffect(() => {
        if (width < 920) setOrient("vertical")
        else setOrient("horizontal")
    }, [width])

    const [delHistory, resDelHistory] = useDeleteHistoryMutation()
    useEffect(() => {
        if (resDelHistory.isSuccess) {
            let details = resDelHistory.data.msg
            toast.current.show({ severity: 'success', summary: `ההיסטוריה נמחקה בהצלחה`, detail: details, life: 3000 })
        }
        if (resDelHistory.isError) {
            let det = resDelHistory?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resDelHistory])

    const [delGrade8, resDelGrade8] = useDeleteGrade8Mutation()
    useEffect(() => {
        if (resDelGrade8.isSuccess) {
            let details = resDelGrade8.data.msg
            toast.current.show({ severity: 'success', summary: `כיתות ח' נמחקו בהצלחה`, detail: details, life: 3000 })
        }
        if (resDelGrade8.isError) {
            let det = resDelGrade8?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resDelGrade8])

    const [upAllClasses, resUpAllClasses] = useUpdateNewYearMutation()
    useEffect(() => {
        if (resUpAllClasses.isSuccess) {
            let details = resUpAllClasses.data.msg
            toast.current.show({ severity: 'success', summary: `העלאת הכיתות בוצעה בהצלחה`, detail: details, life: 3000 })
        }
        if (resUpAllClasses.isError) {
            let det = resUpAllClasses?.error?.data?.msg || 'ארעה שגיאה. נסה שוב מאוחר יותר'
            toast.current.show({ severity: 'error', summary: 'שגיאה', detail: det, life: 3000 })
        }
    }, [resUpAllClasses])

    const data = [
        {
            "idNum": "",
            "name": "",
            "grade": "",
            "number": ""
        }
    ]

    const [uploadStudents, resUploadStudents] = useCreateManyStudentsMutation()

    const handleUpload = (event) => {
        const file = event.files[0]
        const formData = new FormData()
        formData.append('file', file)
        uploadStudents(formData)
        event.options.clear()
    }

    useEffect(() => {
        if (resUploadStudents.isError) {
            if (resUploadStudents.error.status == 400)
                toast.current.show({ severity: 'warn', summary: `הקובץ עלה כמעט בהצלחה`, detail: resUploadStudents?.error?.data?.msg || "", life: 3000 })
            else toast.current.show({ severity: 'error', summary: `ארעה שגיאה בהעלאת הקובץ`, detail: resUploadStudents?.error?.data?.msg || "", life: 3000 })
        }
        else if (resUploadStudents.isSuccess)
            toast.current.show({ severity: 'success', summary: `הקובץ הועלה בהצלחה`, detail: "כל התלמידות התעדכנו כראוי", sticky: true })
    }, [resUploadStudents])


    const { data: classes = [], res } = useGetAllClassesQuery()

    const cardTemplate = (c) => {
        return (
            <div className="flex flex-column h-12rem flex justify-content-center align-items-center">
                <Class grade={c.grade} number={c.number} teacher={c.teacher} id={c._id} email={c.email} />
            </div>
        )
    }

    return (
        <>
            <div className="card flex justify-content-center">
                <Stepper ref={stepperRef} style={{ flexBasis: '50rem' }} linear orientation={orient}>
                    <StepperPanel header="מחיקת היסטוריה">
                        <div className="flex flex-column h-12rem">
                            <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                                <Card style={{ width: '30%', minWidth: '250px', marginRight: '35%', marginBottom: '30px' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal
                                    footer={<><Button label="&nbsp;מחק" icon="pi pi-trash" outlined onClick={() => { setChecked(false); delHistory() }} disabled={!checked} />
                                    </>} >
                                    <div className="confirmation-content">
                                        <i className="pi pi-history mr-3" style={{ fontSize: '2rem' }} /><br />
                                        <h3>למחוק את כל ההיסטוריה?</h3>
                                        <Checkbox inputId="check" onChange={e => setChecked(e.checked)} checked={checked}></Checkbox><label htmlFor="check" className="ml-2">&nbsp;ידוע לי כי לא ניתן לשחזר לאחר המחיקה</label>
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="flex pt-4 justify-content-end">
                            <Button label="הבא&nbsp;" icon="pi pi-arrow-left" iconPos="right" onClick={() => { stepperRef.current.nextCallback(); setChecked(false) }} />
                        </div>
                    </StepperPanel>
                    <StepperPanel header="מחיקת תלמידות ח'">
                        <div className="flex flex-column h-12rem">
                            <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                                <Card style={{ width: '30%', minWidth: '250px', marginRight: '35%', marginBottom: '30px' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal
                                    footer={<>
                                        <Button label="&nbsp;מחק" icon="pi pi-trash" outlined onClick={() => { setChecked(false); delGrade8() }} disabled={!checked} />
                                    </>} >
                                    <div className="confirmation-content">
                                        <i className="pi pi-exclamation-circle mr-3" style={{ fontSize: '2rem' }} /><br />
                                        <h3>למחוק את כל תלמידות כיתות ח'?</h3>
                                        <Checkbox inputId="check" onChange={e => setChecked(e.checked)} checked={checked}></Checkbox><label htmlFor="check" className="ml-2">&nbsp;ידוע לי כי לא ניתן לשחזר לאחר המחיקה</label>
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="flex pt-4 justify-content-between">
                            <Button label="&nbsp;הקודם" severity="secondary" icon="pi pi-arrow-right" onClick={() => stepperRef.current.prevCallback()} style={{ marginLeft: '10px' }} />
                            <Button label="הבא&nbsp;" icon="pi pi-arrow-left" iconPos="right" onClick={() => { stepperRef.current.nextCallback(); setChecked(false) }} />
                        </div>
                    </StepperPanel>
                    <StepperPanel header="העלאת כיתה">
                        <div className="flex flex-column h-12rem">
                            <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                                <Card style={{ width: '30%', minWidth: '250px', marginRight: '35%', marginBottom: '30px' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal
                                    footer={<>
                                        <Button label="&nbsp;אישור" icon="pi pi-check" outlined onClick={() => { setChecked(false); upAllClasses() }} disabled={!checked} />
                                    </>} >
                                    <div className="confirmation-content">
                                        <i className="pi pi-angle-double-up mr-3" style={{ fontSize: '2rem' }} /><br />
                                        <h3>להעלות שנה את כל התלמידות?</h3>
                                        <Checkbox inputId="check" onChange={e => setChecked(e.checked)} checked={checked}></Checkbox><label htmlFor="check" className="ml-2">&nbsp;ידוע לי כי לא ניתן לשחזר לאחר העדכון</label>
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="flex pt-4 justify-content-between">
                            <Button label="&nbsp;הקודם" severity="secondary" icon="pi pi-arrow-right" onClick={() => stepperRef.current.prevCallback()} style={{ marginLeft: '10px' }} />
                            <Button label="הבא&nbsp;" icon="pi pi-arrow-left" iconPos="right" onClick={() => { stepperRef.current.nextCallback(); setChecked(false) }} />
                        </div>
                    </StepperPanel>
                    <StepperPanel header="הוספת כיתות">
                        <div className="flex flex-column h-12rem">
                            <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium" >
                                <Card style={{ width: '50%', minWidth: '250px', marginRight: '25%', marginBottom: '30px' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal>
                                    <div className="confirmation-content">
                                        <i className="pi pi-plus-circle" style={{ fontSize: '2rem' }} /><br />
                                        <h3>הוספת כיתות</h3>
                                        <p className="m-0">זה המקום להוסיף כיתות א' וכיתות שמתוספות בשנה הקרובה</p>
                                        <NewClass />
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="flex pt-4 justify-content-between">
                            <Button label="&nbsp;הקודם" severity="secondary" icon="pi pi-arrow-right" onClick={() => stepperRef.current.prevCallback()} style={{ marginLeft: '10px' }} />
                            <Button label="הבא&nbsp;" icon="pi pi-arrow-left" iconPos="right" onClick={() => { stepperRef.current.nextCallback(); setChecked(false) }} />
                        </div>
                    </StepperPanel>
                    <StepperPanel header="קליטת תלמידות חדשות">
                        <div className="flex flex-column h-12rem">
                            <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium" >
                                <Card style={{ width: '50%', minWidth: '250px', marginRight: '25%', marginBottom: '30px' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal>
                                    <div className="confirmation-content">
                                        <i className="pi pi-arrow-circle-up" style={{ fontSize: '2rem' }} /><br />
                                        <h3>הוספת תלמידות מקובץ</h3>
                                        <ExportExcel excelData={data} filename={"example"} />
                                        <div className="card">
                                            <FileUpload name="file" accept=".xlsx" emptyTemplate={<p className="m-0">גרור ושחרר קובץ אקסל</p>}
                                                uploadLabel='&nbsp;שמירה ועדכון' cancelLabel='&nbsp;ביטול' chooseLabel='&nbsp;בחירת קובץ'
                                                customUpload uploadHandler={(e) => handleUpload(e)} />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="flex pt-4 justify-content-between">
                            <Button label="&nbsp;הקודם" severity="secondary" icon="pi pi-arrow-right" onClick={() => stepperRef.current.prevCallback()} style={{ marginLeft: '10px' }} />
                            <Button label="הבא&nbsp;" icon="pi pi-arrow-left" iconPos="right" onClick={() => { stepperRef.current.nextCallback(); setChecked(false) }} />
                        </div>
                    </StepperPanel>
                    <StepperPanel header="עדכון מחנכות">
                        <div className="flex flex-column h-12rem">
                            <div className="border-2 border-dashed surface-border border-round surface-ground flex-auto flex justify-content-center align-items-center font-medium">
                                <Card style={{ width: '30%', minWidth: '300px', marginRight: '35%', marginBottom: '30px' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} modal>
                                    <div className="confirmation-content">
                                        <i className="pi pi-briefcase" style={{ fontSize: '2rem' }} /><br />
                                        <h3>עדכון מחנכות</h3>
                                        <p className="m-0">זה המקום לכתוב עבור כל כיתה את הפרטים של המחנכת החדשה</p>
                                        <div className="card flex justify-content-center">
                                            <Carousel value={classes} numVisible={1} numScroll={1} orientation="vertical"
                                                showIndicators={false} verticalViewPortHeight="220px" itemTemplate={cardTemplate} style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                        <div className="flex pt-4 justify-content-start">
                            <Button label="&nbsp;הקודם" severity="secondary" icon="pi pi-arrow-right" onClick={() => { stepperRef.current.prevCallback(); setChecked(false) }} />
                        </div>
                    </StepperPanel>
                </Stepper>
            </div>

            <Toast ref={toast} position="top-left" />
        </>
    )
}

export default StepperNewYear