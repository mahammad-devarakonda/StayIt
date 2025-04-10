const User = require('../model/User')
const Connection = require('../model/Connections')

const feed = async (_, __, context) => {
    const loginUser = context?.user?.userId;

    const users = await User.find(
        { _id: { $ne: loginUser } },
        "_id userName avatar bio posts"
    ).populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
    });

    const ConnectionData = await Connection.find({
        fromUser: loginUser,
        toUser: { $in: users.map(user => user?._id) }
    })


    const connectionMap = new Map();
    ConnectionData.forEach(conn => {
        connectionMap.set(conn.toUser.toString(), conn.status);
    });

    const feedData = users
        .filter(user => user.posts.length > 0)
        .map(user => ({
            id: user._id ? user._id.toString() : "",
            userName: user.userName || "Unknown",
            avatar: user.avatar || "",
            bio: user.bio || "",
            connectionStatus: connectionMap.get(user._id.toString()) || null,
            posts: user.posts.map(post => ({
                id: post._id ? post._id.toString() : "",
                content: post.content || "",
                imageURL: post.imageURL || "",
            })),
        }));

    return feedData;


}


module.exports = feed