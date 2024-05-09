const express = require("express")
const multer = require("multer")
const {getAllStudents,createStudent,createManyStudents,updateStudent,deleteStudent,deleteGrade8} = require('../controllers/studentController')

const router = express.Router()

router.get("/",getAllStudents)

router.post("/",createStudent)

const upload = multer({ storage: multer.memoryStorage()})
router.post("/upload", upload.single('file'), createManyStudents)

router.put("/:id",updateStudent)

router.delete("/",deleteGrade8)
router.delete("/:id",deleteStudent)

module.exports = router