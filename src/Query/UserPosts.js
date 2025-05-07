const User = require("../model/Posts")
const Post=require("../model/Posts")

const UserPosts = async (_, __, context) => {
    const userID = context.user.userId

    if (!userID) {
        throw new Error('User is not authenticated');
    }

    const user = await User.findById(userID)

    if (!user) {
        throw new Error('User not found');
    }

    const posts = await Post.find({ userId: userID });

    return {
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email
        },
        posts: posts,
    }
}


module.exports=UserPosts