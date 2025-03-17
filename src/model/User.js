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
    avatar: {
        type: String,
        default: "https://www.parkcityflyfishing.com/wp-content/uploads/Dummy-Profile-Picture-300x300.jpg"
    },
    bio:{
        type:String,
        default:""
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
}, { timestamps: true })

const userSchemaModal = mongoose.model('User', userSchema)


module.exports = userSchemaModal