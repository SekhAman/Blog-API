const mongoose = require('mongoose')

const newPost = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, { timestamps: true });

const Post = mongoose.model('post', newPost)
module.exports = Post