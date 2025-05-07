const Post = require('../model/Posts');
const Connection = require('../model/Connections');
const User = require('../model/User');

const Me = async (_, __, context) => {
    const userID = context.user.userId

    const foundUser = await User.findById(userID);
    if (!foundUser) {
        throw new Error("User not found");
    }

    const posts = await Post.find({ userId: userID });
    const connectionCount = await Connection.countDocuments({ userId: userID });

    return {
        user: foundUser,
        posts: posts,
        connection: connectionCount,
    };
};

module.exports = Me;
