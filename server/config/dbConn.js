const mongoose = require("mongoose")

const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.DATEBASE_URI)
    } catch (error) {
        console.log("error_db:"+error);
    }
}

module.exports = connectDB