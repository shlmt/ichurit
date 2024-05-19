const mongoose = require('mongoose')
require('mongoose-type-email');
mongoose.SchemaTypes.Email.defaults.message = 'כתובת המייל אינה חוקית'

const Class = new mongoose.Schema({
    grade:{
        type:String,
        require:true
    },
    number:{
        type:Number,
        require:true,
        default:1,
        min:1
    },
    teacher:{
        type:String,
        require:true
    },
    email:{
        type:mongoose.SchemaTypes.Email,
        require:true,
    },
    user:{
        type:mongoose.SchemaTypes.ObjectId,
        require:true
    }
}
)

module.exports = mongoose.model("Class",Class)