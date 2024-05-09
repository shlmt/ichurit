const mongoose = require('mongoose')

const Late = new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        require:true
    },
    time:{
        type:mongoose.Schema.Types.Date,
        require:true
    },
    type:{
        type:String,
        require:true,        
        enum:["איחור","איחור מאושר","חיסור"],
        default:"איחור"
    },
    comment:{
        type:String,
        maxLength: 70
    }
})

module.exports = mongoose.model("Late",Late)
