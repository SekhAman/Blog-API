const mongoose = require('mongoose')

const newUser = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
        type: String,
        required: true,
        select: false,
    }
})

const User = mongoose.model('user', newUser)
module.exports = User