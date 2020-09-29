const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth') 
const { sendWelcomeMail, sendGoodbyeMail } = require('../utils/mailer')

const router = new express.Router()
const upload = multer({ 
    //dest: 'images',
    limits: {
        fileSize:1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/.+\.(png|jpg|jpeg)$/)){
            return cb(new Error('Invalid file type'))
        }
        cb(null, true)
    }
})

router.post('/users', async (req, res) =>{
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeMail(req.body.name,req.body.email)
        const token = await user.getAuthToken()
        res.status(201).send({user,token})
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) =>{
    try {
        const user = await User.findByCredentials(req.body.email,req.body.password)
        console.log(user);
        const token = await user.getAuthToken()
        res.status(200).send({user,token})
    } catch (e) {
        res.status(400).send({error:e.message})
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token)=> { 
            return token.token !== req.token
        })
        await req.user.save()
        res.send()   
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()   
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({error:error.message})
})

router.get('/users/me/avatar', auth, async(req, res) => {
    //req.user = await User.findById('5f6c629c1452cdc5fb672309')
    try {
        if(!req.user.avatar){
            res.send()
        }
        res.set('Content-Type','image/png')
        res.send(req.user.avatar)
    } catch (e) {
        res.status(500).send({error:e.message})
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({error:error.message})
})

router.patch('/users/me', auth, async (req, res) => {
    const allowedFields = ['name','email','password']
    if ( !Object.keys(req.body).every((field)=>allowedFields.includes(field)) ) {
        return res.status(500).send({'error':'Invalid request'})
    }
    try {
        Object.keys(req.body).forEach((key) => req.user[key] = req.body[key])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendGoodbyeMail(req.user.name,req.user.email)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router