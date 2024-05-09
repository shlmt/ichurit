const express = require('express')
const router = express.Router()
const {getLatesByStudent,getLatesByClass,getCountByClass,getLatesForMarks,getGoodStudents,addLate,updateLate,deleteLate,deleteHistory, sendEmailLates} = require('../controllers/lateController')

router.get('/st/:id',getLatesByStudent)
router.get('/cl/:id',getLatesByClass)
router.get('/good',getGoodStudents)
router.get('/count/:id',getCountByClass)
router.get('/marks/:id',getLatesForMarks)

router.post("/",addLate)

router.put("/:id",updateLate)

router.delete("/:id",deleteLate)
router.delete("/",deleteHistory)

module.exports = router