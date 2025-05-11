const User = require('../model/User')
const Post=require('../model/Posts')

const LikeMutation = async (_, { postID }, context) => {
    console.log("Input", postID);
    const userId=context?.user?.userId
    
    console.log("Context", userId);

    if(!userId){
        throw new Error("Please Authenticate")
    }

    if(!postID){
        throw new Error("No Post is Metioned")
    }

    const post = await Post.findByIdAndUpdate(
        postID,
        { $addToSet: { likes: userId } },
        { new: true } 
    ).populate({
        path: "likes", 
        select: "id userName avatar" 
    });

    return post
}


module.exports = LikeMutation 