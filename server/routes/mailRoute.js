const express = require('express')
const router = express.Router()
const sendEmailToUser = require('../servises/mail');


router.post('/', (req,res)=>{
    try{
        sendEmailToUser(req.body.to,req.body.title,req.body.html)
    }
    catch(err){
        res.status(401).json({ msg: "שליחת ההודעה נכשלה" })
    }
    res.json({ msg: "ההודעה נשלחה בהצלחה" })
})

module.exports = router
