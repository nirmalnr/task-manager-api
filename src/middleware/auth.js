const { JsonWebTokenError } = require("jsonwebtoken")

const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) => {
    try {
        const token = req.headers.authorization.replace('Bearer ','')
        const decryptedToken = await jwt.verify(token,process.env.JWT_SECRET)
        user = await User.findOne({_id:decryptedToken.id,'tokens.token':token})
        if(!user){
            throw Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (e) {
        res.status(401).send('Authentication failed')
    }
}

module.exports = auth