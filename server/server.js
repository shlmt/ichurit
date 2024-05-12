require("dotenv").config()
const express = require("express")
const cors = require("cors")
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConn")
const mongoose = require("mongoose")
const { verifyJWT } = require("./middleware/verifyJWT")

const app = express()
const PORT = process.env.PORT || 1234
connectDB()

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static("public"))
app.use("/api/auth", require('./routes/authRoute'))
app.use(verifyJWT)
app.use("/api/student", require('./routes/studentRoute'))
app.use("/api/class", require('./routes/classRoute'))
app.use("/api/late", require('./routes/lateRoute'))
app.use("/api/mail", require('./routes/mailRoute'))

mongoose.connection.once('open',()=>{
    console.log("connected to mongoDB")
    app.listen(PORT, ()=>{
        console.log(`server running on ${PORT}`)
    })
})

mongoose.connection.on("error", err=>{
    //return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'});
    console.log(`ERROR in connect to DB: ${err}`)
})

 
