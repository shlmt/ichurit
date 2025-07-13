const jwt = require('jsonwebtoken')

const verifyJWT = (req,res,next) => {
    try{
        const token = req.cookies.token
        if (!token) return res.status(401).json({ message: 'התחברות חובה' });
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,decode) => {
            if(err)
                return res.status(403).json({msg:'אסור'})
            req.user = decode
            next()
        }
    )}
    catch(err){
        next(err)
    }
}


module.exports = {verifyJWT}