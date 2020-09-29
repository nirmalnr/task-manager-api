const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        //unique: true,
        trim: true,
        required: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')) {
                throw new Error("Invalid password")
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
},{
    timestamps:true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.getAuthToken = async function() {
    const token = await jwt.sign({id:this._id.toString()},process.env.JWT_SECRET)
    this.tokens.push({token})
    await this.save()
    return token
}

userSchema.methods.toJSON = function() {
    const userObject = this.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({email})
    if(!user) {
        throw new Error('Invalid login')
    }
    const isMatch = await bcryptjs.compare(password, user.password)
    if(!isMatch) {
        throw new Error('Invalid login')
    }
    return user
}

userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        this.password = await bcryptjs.hash(this.password,8)
    }
    next()
})

userSchema.pre('remove', async function(next) {
    await Task.deleteMany({owner:this._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User