const jwt = require('jsonwebtoken')

const verifyJWT = (req,res,next) => {
    try{
    const authHeader = req.headers.authorization || req.headers.Authorization
    if(!authHeader?.startsWith('Bearer '))
        return res.status(401).json({message:'לא מורשה'})
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decode)=>{
        if(err)
            return res.status(403).json({msg:'אסור'})
        req.user = decode
        next()
    }
    )}
    catch(err){
        return res.status(500).json({msg:'ארעה שגיאה לא צפויה, נסו שוב מאוחר יותר'})
    }
}


module.exports = {verifyJWT}