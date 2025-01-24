const mongoose=require('mongoose')

const connectionModal=new mongoose.Schema({
    fromUser:{
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:"User",
    },
    toUser:{
        type:mongoose.Schema.ObjectId,
        required:true,
        ref:"User"
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["interested", "accepted", "rejected"], 
            message: "{VALUE} is not a valid status"
        }
    },
    
},
{timestamps:true});

connectionModal.index({fromUser:1,toUser:1})

const connectRequestModel=mongoose.model("Connections",connectionModal)


module.exports=connectRequestModel