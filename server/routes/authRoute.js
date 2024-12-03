const express = require('express')
const router = express.Router()
const {verifyJWT} = require('../middleware/verifyJWT')
const {login,logout,createUser,changePass,deleteUser} = require('../controllers/authController')

router.post('/', login)
router.post('/createUser',verifyJWT,createUser)

router.put('/',verifyJWT,changePass)

router.delete('/', logout)
router.delete('/:id',verifyJWT,deleteUser)

module.exports = router