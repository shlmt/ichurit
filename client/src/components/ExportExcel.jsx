import { Button } from "primereact/button"
import * as FileSaver from "file-saver"
import XLSX from "sheetjs-style"

const ExportExcel = ({ excelData, filename }) => {
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;carset=UTF-8"
    const fileExtension = ".xlsx"
    const exportToExcel = async () => {
        const ws = XLSX.utils.json_to_sheet(excelData)
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] }
        const excelbuffer = XLSX.write(wb, { bookType: 'xlsx', type: "array" })
        const data = new Blob([excelbuffer], { type: fileType })
        FileSaver.saveAs(data, filename + fileExtension)
    }

    return (<>
        <Button onClick={() => exportToExcel(filename)} outlined icon='pi pi-download'>&nbsp;קובץ למילוי</Button>
    </>)
}
export default ExportExcel