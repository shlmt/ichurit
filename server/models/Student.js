const mongoose = require('mongoose')

const Student = new mongoose.Schema({
    idNum:{
        type:String,
        require:true,
        unique:true,
        maxLength:9,
        minLength:9
    },
    name:{
        type:String,
        require:true
    },
    class1:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Class",
        require:true
    },
    comment:{
        type:String,
        maxLength: 70
    },
    user:{
        type:mongoose.SchemaTypes.ObjectId,
        require:true
    }
})

module.exports = mongoose.model("Student",Student)