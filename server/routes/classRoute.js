const express = require('express')
const router = express.Router()
const {getAllClasses,addClass,updateClass,updateNewYear,deleteClass} = require('../controllers/classController')

router.get('/',getAllClasses)

router.post('/',addClass)

router.put('/:id',updateClass)
router.put('/',updateNewYear)

router.delete('/:id',deleteClass)

module.exports = router