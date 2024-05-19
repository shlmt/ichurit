const Late = require('../models/Late')
const Student = require('../models/Student');

const getLatesByStudent = async (req, res) => {
    try {
        const { id } = req.params
        if (!id)
            return res.status(401).json({ msg: 'id is required' })
        const lates = await Late.find({ student: id,user:req.user._id }).sort({ time: -1 })
        if (!lates)
            return res.status(400).json({ msg: "לא נמצאו חריגות" })
        res.json(lates)
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const getLatesByClass = async (req, res) => {
    try {
        const { id } = req.params
        const { startDate } = req.query || new Date(2000, 1, 1) //שחר ההיסטוריה
        const { endDate } = req.query || new Date() //היום
        if (!id)
            return res.status(401).json({ msg: 'id is required' })
        const ids = await Student.find({ class1: id,user:req.user._id }, { id: 1 })
        const lates = await Late.find({ user:req.user._id,time: { $gte: startDate, $lte: endDate }, student: { $in: ids } }).populate("student", { name: 1 }).sort({ name: 1, time: 1 })
        if (!lates)
            return res.status(400).json({ msg: "לא נמצאו חריגות" })
        res.json(lates)
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const getCountByClass = async (req, res) => {
    try {
        const { id } = req.params
        const { startDate } = req.query || new Date(2000, 1, 1) //שחר ההיסטוריה
        const { endDate } = req.query || new Date() //היום
        if (!id)
            return res.status(401).json({ msg: 'id is required' })
        const ids = await Student.find({ class1: id,user:req.user._id }, { id: 1 })
        const lates = await Late.find({ time: { $gte: startDate, $lte: endDate }, student: { $in: ids },user:req.user._id })
        if (!lates)
            return res.status(400).json({ msg: "לא נמצאו חריגות" })
        res.json(lates.length)
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const getLatesForMarks = async (req, res) => {
    try {
        const { id } = req.params
        if (!id)
            return res.status(401).json({ msg: 'id is required' })
        const { startDate } = req.query || new Date(2000, 1, 1) //שחר ההיסטוריה
        const { endDate } = req.query || new Date() //היום
        const students = await Student.find({ class1: id,user:req.user._id }, { id: 1, name: 1 })
        const studentsDetails = []
        for(const s of students){
            const name = s.name
            const lates = await Late.find({ student: s._id, time: { $gte: startDate, $lte: endDate }, type: 'איחור',user:req.user._id })
            const legalLates = await Late.find({ student: s._id, time: { $gte: startDate, $lte: endDate }, type: 'איחור מאושר',user:req.user._id })
            const miss = await Late.find({ student: s._id, time: { $gte: startDate, $lte: endDate }, type: 'חיסור',user:req.user._id })
            studentsDetails.push({ name, nLates: lates.length + legalLates.length, nLegalLates: legalLates.length, nMiss: miss.length })
        }
        return res.json(studentsDetails)
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const getGoodStudents = async (req, res) => {
    try {
        const { maxSum } = req.query || 0
        const { startDate } = req.query || new Date(2000, 1, 1) //שחר ההיסטוריה
        const { endDate } = req.query || new Date() //היום
        const lates = await Late.find({ type: { $in: ['איחור', 'איחור מאושר'] },user:req.user._id, time: { $gte: startDate, $lte: endDate } })
        if (!lates)
            return res.status(400).json({ msg: "לא נמצאו חריגות" })
        var dict = {}
        lates.forEach(l => {
            dict[l.student] ? dict[l.student] += 1 : dict[l.student] = 1
        })
        const ids = Object.keys(dict).filter(x => dict[x] > maxSum) //מי שחרגה
        const goodStudents = await Student.find({ _id: { $nin: ids },user:req.user._id }).populate('class1',{grade:1,number:1}).sort({ class1:1, name: 1 })
        if (!goodStudents)
            return res.status(400).json({ msg: 'אין תלמידות שעונות על התנאי המבוקש' })
        return res.json(goodStudents)
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}


const addLate = async (req, res) => {
    try {
        const {studentId, time, type, comment } = req.body
        if (!studentId || !time || !type){
            console.log(req.body);
            return res.status(400).json({ msg: "חסרים שדות חובה" })}
        if (!type in ["איחור", "איחור מאושר", "חיסור"])
            return res.status(400).json({ msg: 'סוג חריגה לא חוקי' })
        if (comment && comment.length > 70)
            return res.status(400).json({ msg: 'אורך הערה מוגבל ל70 תוים' })
        let start=new Date(time.slice(0,10))
        start=new Date(start.setHours(0,0,0))
        let end=new Date(time.slice(0,10))
        end=new Date(end.setHours(23,59,59))
        const lateExist = await Late.findOne({student:studentId, time:{$gte:start,$lte:end},user:req.user._id})
        if(lateExist)
            return res.status(400).json({msg:'קיימת כבר חריגת נוכחות ביום זה'})
        const late = await Late.create({ student: studentId, time, type, comment,user:req.user._id })
        if (!late)
            return res.status(400).json({ msg: 'ארעה שגיאה בהוספת החריגה' })
        return res.status(201).json({ msg: 'חריגות נוכחות נוספו בהצלחה' })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const updateLate = async (req, res) => {
    try {
        const { id } = req.params
        const { studentId, time, type, comment } = req.body
        if (!id)
            return res.status(400).json({ msg: 'id is required' })
        const late = await Late.findOne({_id:id,user:req.user._id}).exec()
        if (!late)
            return res.status(401).json({ msg: 'החריגה המבוקשת לא נמצאה' })
        if (time) {
            late.time = time
            let start=new Date(time.slice(0,10))
            start=new Date(start.setHours(0,0,0))
            let end=new Date(time.slice(0,10))
            end=new Date(end.setHours(23,59,59))
            const lateExist = await Late.findOne({_id:{$ne:id},user:req.user._id,student:studentId, time:{$gte:start,$lte:end}})
            if(lateExist){
                return res.status(400).json({msg:'קיימת כבר חריגת נוכחות ביום זה'})
            }
        }
        if (type) {
            if (!type in ["איחור", "איחור מאושר", "חיסור"])
                return res.status(400).json({ msg: 'סוג חריגה לא חוקי' })
            late.type = type
        }
        if (comment && comment.length > 70)
            return res.status(400).json({ msg: 'אורך הערה מוגבל ל70 תוים' })
        late.comment = comment
        const updated = await late.save()
        if (!updated)
            return res.status(400).json({ msg: 'ארעה שגיאה בעדכון החריגה' })
        return res.status(201).json({ msg: `חריגה עודכנה בהצלחה` })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const deleteLate = async (req, res) => {
    try {
        const { id } = req.params
        const late = await Late.findOne({_id:id,user:req.user._id}).exec()
        if (!late)
            return res.status(401).json({ msg: 'החריגה המבוקשת לא נמצאה' })
        const msg = `ה${late.type} נמחק בהצלחה`
        const del = await late.deleteOne()
        res.status(201).json({ msg })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const deleteHistory = async (req, res) => {
    try {
        await Late.deleteMany({user:req.user._id})
        res.status(201).json({ msg: 'ההיסטוריה נמחקה' })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

module.exports = { getLatesByStudent, getGoodStudents, getCountByClass, getLatesForMarks, getLatesByClass, addLate, updateLate, deleteLate, deleteHistory }