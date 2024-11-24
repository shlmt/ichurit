const Student = require('../models/Student')
const Class = require('../models/Class')
const Late=require('../models/Late')
const { importDataFromExcel } = require('../servises/dataImportService')
const xlsx = require('xlsx')

const getAllStudents = async (req,res,next)=>{
    try{
        const studentsList = await Student.find({user:req.user._id}).populate("class1",{grade:1,number:1}).sort({grade:1,number:1,name:1})
        if(!studentsList)
            return res.status(404).json({msg:"לא נמצאו תלמידות"})
        res.json(studentsList)
    }
    catch(err){
        next(err)
    }
}

const createStudent = async (req,res,next)=>{
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
            return res.status(503).json({msg:'ארעה שגיאה בהוספת התלמידה'})
        res.status(201).json({msg:`תלמידה חדשה ${name} ת.ז.${idNum} נוספה בהצלחה`})
    }
    catch(err){
        next(err)
    }
}

const createManyStudents= async(req,res,next)=>{
    try{
        const workbook = xlsx.read(req.file.buffer)
        const errLines = await importDataFromExcel(workbook,req)
        if(errLines.length==0) res.status(201).json({msg:"עודכן בהצלחה"})
        else res.status(400).json({msg:"היו שגיאות בשורות הבאות: "+errLines.slice(0,-1)})
    }
    catch(err){
        next(err)
    }
}
    
const updateStudent= async (req,res,next)=>{
    try{
        const {id} = req.params
        const {idNum,name,class1,comment} = req.body
        const student = await Student.findOne({_id:id,user:req.user._id}).exec()
        if(!student)
            return res.status(404).json({msg:"לא נמצאו תלמידות"})
        if(idNum){
            const dup2 = await Student.findOne({idNum,_id:{$ne:id},user:req.user._id}).lean()
            if(dup2 )
                return res.status(409).json({msg:'קיימת כבר תלמידה עם מספר זהות זהה'})
            student.idNum=idNum
        }
        if(name) student.name=name
        if(class1) student.class1=class1
        let n = student.name
        let c = student.class1
        const dup = await Student.findOne({_id:{$ne:id},name:n,class1:c,user:req.user._id}).lean()
        if(dup)
            return res.status(409).json({msg:'קיימת כבר תלמידה בשם זה'})
        if(comment && comment.length>70)
            return res.status(400).json({msg:'אורך הערה מוגבל ל70 תוים'})
        student.comment = comment
        const updatedStudent = await student.save()
        res.status(201).json({msg:`תלמידה ${name} עודכנה בהצלחה`})
    }
    catch(err){
        next(err)
    }
}

const deleteStudent = async (req,res,next)=>{
    try{
        const {id} = req.params
        const student = await Student.findOne({_id:id,user:req.user._id}).exec()
        if(!student)
            return res.status(404).json({msg:'לא נמצאו תלמידות'})
        const delLate =await Late.deleteMany({student:id,user:req.user._id})
        const del = await student.deleteOne({user:req.user._id})
        res.status(200).json({msg:`תלמידה ${student.name} נמחקה בהצלחה`})        
    }
    catch(err){
        next(err)
    }
}

const deleteGrade8 = async (req,res,next)=>{
    try{
        var msg =''
        const classes = await Class.find({grade:'ח',user:req.user._id})
        if(!classes)
            return res.status(404).json({msg:'לא נמצאו תלמידות'})
        classes.forEach(async c=>{
            const del = await Student.deleteMany({class1:c._id,user:req.user._id})
            msg+=`כיתה ח${c.number}: נמחקו ${del.deletedCount} ,תלמידות`
        })
        const del = await Class.deleteMany({grade:'ח',user:req.user._id})
        res.status(200).json({msg})
    }
    catch(err){
        next(err)
    }
}


module.exports = {getAllStudents,createStudent,createManyStudents,updateStudent,deleteStudent,deleteGrade8}