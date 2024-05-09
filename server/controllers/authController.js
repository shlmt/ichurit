const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password)
            return res.status(400).json({ msg: "חסרים שדות חובה" })
        const user = await User.findOne({ username }).lean()
        if (!user)
            return res.status(401).json({ msg: 'משתמש לא מורשה' })
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch)
            return res.status(401).json({ msg: 'משתמש לא מורשה' })
        const userInfo = { _id: user._id, username: user.username }
        const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
        res.json({ token })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const createUser = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password)
            return res.status(400).json({ msg: "חסרים שדות חובה" })
        const dup = await User.findOne({ username }).lean()
        if (dup)
            return res.status(409).json({ msg: 'כבר קיים שם משתמש זהה' })
        const hashPass = await bcrypt.hash(password, 10)
        const userObj = { username, password: hashPass }
        const user = await User.create(userObj)
        if (!user)
            return res.status(400).json({ msg: 'ארעה שגיאה בהוספת המשתמש' })
        res.status(201).json({ msg: `משתמש חדש ${username} נוסף בהצלחה` })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const changePass = async (req, res) => {
    try {
        const {newPassword } = req.body
        const { username } = req.user
        if (!username || !newPassword)
            return res.status(400).json({ msg: "חסרים שדות חובה" })
        const user = await User.findOne({ username }).exec()
        if (!user)
            return res.status(401).json({ msg: 'המשתמש המבוקש לא נמצא' })
        const hashPass = await bcrypt.hash(newPassword, 10)
        user.password = hashPass
        const updateUser = await user.save()
        res.json({ msg: "סיסמה  עודכנה בהצלחה" })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        if (!id)
            return res.status(400).json({ msg: "חסרים שדות חובה" })
        const user = await User.findOne({ username }).exec()
        if (!user)
            return res.status(401).json({ msg: 'המשתמש המבוקש לא נמצא' })
        const allUsers = await User.find()
        if(allUsers.length==1)
            return res.status(408).json({ msg: 'אין למחוק את המשתמש האחרון' })
        const del = user.deleteOne()
        res.json({ msg: `משתמש ${username} נמחק בהצלחה` })
    }
    catch (err) {
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}

module.exports = { login, createUser, changePass, deleteUser }