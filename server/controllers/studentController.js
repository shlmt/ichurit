const Student = require('../models/Student')
const Class = require('../models/Class')
const Late=require('../models/Late')
const readXlsxFile = require("read-excel-file/node")
const { getLatesByStudent } = require('./lateController')
const { importDataFromExcel } = require('../servises/dataImportService')
const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const getAllStudents = async (req,res)=>{
    try{
    const studentsList = await Student.find({user:req.user._id}).populate("class1",{grade:1,number:1}).sort({grade:1,number:1,name:1})
    if(!studentsList)
        return res.status(400).json({msg:"לא נמצאו תלמידות"})
    res.json(studentsList)
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const createStudent = async (req,res)=>{
    try{
    const {idNum,name,class1,comment} = req.body
    if(!idNum || !name || !class1)
        return res.status(400).json({msg:"חסרים שדות חובה"})
    const dup = await Student.findOne({name,class1,user:req.user._id}).lean()
    if(dup)
        return res.status(409).json({msg:'קיימת כבר תלמידה בשם זה'})
    const dup2 = await Student.findOne({idNum,user:req.user._id}).lean()
    if(dup2)
        return res.status(409).json({msg:'קיימת כבר תלמידה עם מספר זהות זהה'})
    if(comment && comment.length>70)
        return res.status(400).json({msg:'אורך הערה מוגבל ל70 תוים'})
    const student = await Student.create({idNum,name,class1,comment,user:req.user._id})
    if(!student)
        return res.status(400).json({msg:'ארעה שגיאה בהוספת התלמידה'})
    res.status(201).json({msg:`תלמידה חדשה ${name} נוספה בהצלחה`})
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const createManyStudents= async(req,res)=>{
    console.log(req.body);
    try{
        const workbook = xlsx.read(req.file.buffer)
        const errLines = await importDataFromExcel(workbook)
        console.log(errLines)
        if(errLines.length==0) res.status(201).json({msg:"עודכן בהצלחה"})
        else res.status(400).json({msg:"היו שגיאות בשורות הבאות: "+errLines.slice(0,-1)})
    }
    catch(e){
        console.log(e)
        res.status(400).json({msg:e})
    }
}
    
const updateStudent= async (req,res)=>{
    try{
    const {id} = req.params
    const {idNum,name,class1,comment} = req.body
    const student = await Student.findOne({_id:id,user:req.user._id}).exec()
    if(!student)
        return res.status(404).json({msg:"לא נמצאו תלמידות"})
    if(idNum) student.idNum=idNum
    if(name) student.name=name
    if(class1) student.class1=class1
    if(comment && comment.length>70)
        return res.status(400).json({msg:'אורך הערה מוגבל ל70 תוים'})
    student.comment = comment
    const updatedStudent = await student.save()
    res.status(201).json({msg:`תלמידה ${name} עודכנה בהצלחה`})
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const deleteStudent = async (req,res)=>{
    try{
    const {id} = req.params
    const student = await Student.findOne({_id:id,user:req.user._id}).exec()
    if(!student)
        return res.status(401).json({msg:'לא נמצאו תלמידות'})
    const delLate =await Late.deleteMany({student:id,user:req.user._id})
    const del = await student.deleteOne({user:req.user._id})
    res.status(201).json({msg:`תלמידה ${student.name} נמחקה בהצלחה`})        
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const deleteGrade8 = async (req,res)=>{
    try{
    var msg =''
    const classes = await Class.find({grade:'ח',user:req.user._id})
    if(!classes)
        return res.status(401).json({msg:'לא נמצאו תלמידות'})
    classes.forEach(async c=>{
        const del = await Student.deleteMany({class1:c._id,user:req.user._id})
        msg+=`כיתה ח${c.number}: נמחקו ${del.deletedCount} ,תלמידות`
    })
    const del = await Class.deleteMany({grade:'ח',user:req.user._id})
    res.status(201).json({msg})
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}


module.exports = {getAllStudents,createStudent,createManyStudents,updateStudent,deleteStudent,deleteGrade8}