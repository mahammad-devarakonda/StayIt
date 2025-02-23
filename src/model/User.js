const mongoose = require('mongoose')


const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',         },
    ],
})

const userSchemaModal = mongoose.model('User', userSchema)


module.exports = userSchemaModal