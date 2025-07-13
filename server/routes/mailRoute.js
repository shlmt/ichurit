const express = require('express')
const router = express.Router()
const sendEmail = require('../services/mail');


router.post('/', (req,res,next)=>{
    const {to,title,html} = req.body
    if(!to || !title || !html) 
        return res.status(400).json({ msg: "חסרים שדות חובה" })
    try{
        sendEmail(to,title,html).then((value)=>{
            return res.status(201).json({ msg: "ההודעה נשלחה בהצלחה" })
        },(reason)=>{
            console.log("sendMail rejected",reason);
            return res.status(503).json({ msg: "שליחת ההודעה נכשלה" })
        })
    }
    catch(err){
        console.log(err)
    }
})

module.exports = router
