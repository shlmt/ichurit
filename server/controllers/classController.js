const Class = require('../models/Class')
const Late = require('../models/Late')
const Student = require('../models/Student')

const getAllClasses = async (req,res)=>{
    try{
    const classList = await Class.find({user:req.user._id}).sort({grade:1,number:1})
    if(!classList)
        return res.status(404).json({msg:"לא נמצאו כיתות"})
    res.json(classList)
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const addClass = async (req,res)=>{
    try{
        const {grade,number,teacher,email} = req.body
        if(!grade || !teacher|| !email)
            return res.status(400).json({msg:"חסרים שדות חובה"})
        if(!number) number=1
        const dup = await Class.findOne({user:req.user._id,grade,number}).lean()
        if(dup)
            return res.status(409).json({msg:'קיימת כבר כיתה בשם זה'})
        try{
            const class1 = await Class.create({grade,number,teacher,email,user:req.user._id})
            if(!class1)
                return res.status(503).json({msg:'ארעה שגיאה בהוספת הכיתה'})
            res.status(201).json({msg:`כיתה חדשה ${grade}'${number} נוצרה בהצלחה`})
        }
        catch(err){
            if(err.toString().includes("email"))
                return res.status(400).json({msg:'כתובת המייל אינה תקינה'})
            else throw(err)
        }
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const updateClass = async (req,res)=>{
    try{
    const {id} = req.params
    const {grade,number,teacher,email} = req.body
    if(!id)
        return res.status(400).json({msg:"מספר זהות הוא שדה חובה"})
    if(number<1)
        return res.status(400).json({msg:"מספר כיתה לא תקין"})
    const findClass = await Class.findOne({_id:id,user:req.user._id}).exec()
    if(!findClass)
        return res.status(404).json({msg:'הכיתה המבוקשת לא נמצאה'})
    const num = number || findClass.number
    const gr = grade || findClass.grade
    const dup = await Class.findOne({_id:{$ne:id},user:req.user._id,grade:gr,number:num}).lean()
    if(dup)
        return res.status(409).json({msg:'קיימת כבר כיתה בשם זה'})
    findClass.grade = gr
    findClass.number = num
    if(email) findClass.email=email
    if(teacher) findClass.teacher = teacher
    try{
        const updateClass = await findClass.save()
        if(!updateClass)
            return res.status(503).json({msg:'ארעה שגיאה בעדכון הכיתה'})
        res.json({msg:`כיתה עודכנה בהצלחה`})
    }
    catch(err){
        if(err.toString().includes("email"))
            return res.status(400).json({msg:'כתובת המייל אינה תקינה'})
        else throw(err)
    }
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const updateNewYear = async(req,res)=>{
    try{
    const classes = await Class.find({grade:['א','ב','ג','ד','ה','ו','ז'],user:req.user._id}).exec()
    if(!classes)
        return res.status(404).json({msg:"לא נמצאו כיתות"})
    classes.forEach(async c => {
        c.grade = String.fromCharCode(c.grade.charCodeAt(0) + 1)
        const newC = await c.save()
    })
    res.json({msg:`הכיתה עודכנה בהצלחה`})
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}


const deleteClass = async (req,res)=>{
    try{
    const {id} = req.params
    if(!id)
        return res.status(400).json({msg:"מספר זהות הוא שדה חובה"})
    const foundClass = await Class.findOne({_id:id,user:req.user._id}).exec()
    if(!foundClass)
        return res.status(404).json({msg:'הכיתה המבוקשת לא נמצאה'})
    const students=await Student.find({class1:id,user:req.user._id}).exec()
    students.forEach(async s=>{
        const delLate=await Late.deleteMany({student:s._id})
    })
    const delstudent=await Student.deleteMany({class1:id,user:req.user._id})
    const delClass = await foundClass.deleteOne()
    const msg=`כיתה ${foundClass.grade}'${foundClass.number} נמחקה, נמחקו ${delstudent.deletedCount} תלמידות`
    res.json({msg})
    }
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

module.exports = {getAllClasses,addClass,updateClass,updateNewYear,deleteClass}