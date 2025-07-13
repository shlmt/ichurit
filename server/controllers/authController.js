const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const login = async (req,res,next) => {
    try {
        const { username, password } = req.body
        if (!username || !password)
            return res.status(400).json({ msg: "חסרים שדות חובה" })
        const user = await User.findOne({ username }).lean()
        if (!user)
            return res.status(401).json({ msg: 'משתמש לא מורשה' })
        const isMatch = await bcrypt.compare(password+'', user.password)
        if (!isMatch)
            return res.status(401).json({ msg: 'משתמש לא מורשה' })
        const userInfo = { _id: user._id, username: user.username }
        const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'PROD',
            sameSite: process.env.NODE_ENV === 'PROD' ? 'None' : '',
            maxAge: 24 * 60 * 60 * 1000 * 7 // one week = 7 days
        })
        res.status(200).json({ message: 'התחבר בהצלחה' });
    }
    catch(err){
        next(err)
    }
}

const logout = async (req,res,next) => {
    try{
        res.cookie('token', '', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'PROD',
            sameSite: 'strict', 
            expires: new Date(0) 
        })
        res.status(200).json({ message: 'התנתק בהצלחה' })
    }
    catch(err){
        next(err)
    }
}

const createUser = async (req,res,next) => {
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
            return res.status(503).json({ msg: 'ארעה שגיאה בהוספת המשתמש' })
        res.status(201).json({ msg: `משתמש חדש ${username} נוסף בהצלחה` })
    }
    catch(err){
        next(err)
    }
}

const changePass = async (req,res,next) => {
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
        res.status(200).json({ msg: "סיסמה  עודכנה בהצלחה" })
    }
    catch(err){
        next(err)
    }
}

const deleteUser = async (req,res,next) => {
    try {
        const { id } = req.params
        if (!id)
            return res.status(400).json({ msg: "חסרים שדות חובה" })
        const user = await User.findOne({ username }).exec()
        if (!user)
            return res.status(401).json({ msg: 'המשתמש המבוקש לא נמצא' })
        const del = user.deleteOne()
        res.status(204).json({ msg: `משתמש ${username} נמחק בהצלחה` })
    }
    catch(err){
        next(err)
    }
}

module.exports = { login, logout, createUser, changePass, deleteUser }
