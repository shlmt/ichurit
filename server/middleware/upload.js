const multer = require("multer")

const excelFilter = (req, file, cb) => {
    try {
        if (
            file.mimetype.includes("excel") ||
            file.mimetype.includes("spreadsheetml")
        ) {
            cb(null, true);
        } else {
            cb("Please upload only excel file.", false)
        }
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }

}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/")
    },
    filename: (req, file, cb) => {
        console.log(file.originalname)
        cb(null, `${Date.now()}-bezkoder-${file.originalname}`)
    },
})

const uploadFile = multer({ storage: storage, fileFilter: excelFilter })
module.exports = uploadFile