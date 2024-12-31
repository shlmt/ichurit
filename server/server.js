require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const corsOptions = require("./config/corsOptions")
const connectDB = require("./config/dbConn")
const {verifyJWT} = require("./middleware/verifyJWT")
const logger = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 1234
connectDB()

app.use(cors(corsOptions))
app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(logger)
app.use(express.static("public"))
app.use("/api/auth", require('./routes/authRoute'))
app.use(verifyJWT)
app.use("/api/student", require('./routes/studentRoute'))
app.use("/api/class", require('./routes/classRoute'))
app.use("/api/late", require('./routes/lateRoute'))
app.use("/api/mail", require('./routes/mailRoute'))
app.use(errorHandler)

mongoose.connection.once('open',()=>{
    console.log("connected to mongoDB")
    app.listen(PORT, ()=>{
        console.log(`server running on ${PORT}`)
    })
})

mongoose.connection.on("error", err=>{
    console.log(`ERROR in connect to DB: ${err}`)
    return res.status(500).json({msg:'ארעה שגיאה בחיסור למסד הנתונים'});
})

 
