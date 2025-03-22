const mongoose = require('mongoose')

const messageSchema=new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    text:{
        type:String,
        required:true
    },
},{timestamps:true})


const ChatSchema=new mongoose.Schema({
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
    ],
    message:[messageSchema],
    timestamp: { type: Date, default: Date.now }
})

const Chat =mongoose.model("Chat",ChatSchema)

module.exports = Chat;