const User=require('../model/User')
const Connections=require("../model/Connections")
const Post=require('../model/Posts')
const mongoose = require("mongoose");



const user = async (_, { id }) => {


    console.log(id);
    
    try {
        const user = await User.findById(id)
        const posts = await Post.find({ userId: user });
        console.log("THis is posts Details",posts);
        
        const connection = await Connections.find({
            $or: [
                { toUser: new mongoose.Types.ObjectId(id) },
                { fromUser: new mongoose.Types.ObjectId(id) }
            ],
            status: "accepted"
        })
        
        return {
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                avatar: user.avatar,
                bio: user?.bio
            },
            posts: posts,
            connection: connection.length || 0
        }

    } catch (error) {
        throw new Error("No user Found")
    }
}


module.exports=user

