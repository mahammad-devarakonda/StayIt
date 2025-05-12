const User = require('../model/User');
const Connection = require('../model/Connections');

const feed = async (_, { page = 1, limit = 20 }, context) => {
    const loginUser = context?.user?.userId;
    const skip = (page - 1) * limit;

    const users = await User.find(
        { _id: { $ne: loginUser } },
        "_id userName avatar bio posts"
    )
        .populate({
            path: "posts",
            options: { sort: { createdAt: -1 } },
            populate: {
                path: "likes",
                select: "userName avatar",
            }
        })
        .skip(skip)
        .limit(limit);

    const ConnectionData = await Connection.find({
        fromUser: loginUser,
        toUser: { $in: users.map(user => user?._id) }
    });

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
                likes: (post.likes || []).map(likeUserId => ({
                    id: likeUserId.toString(),
                    userName: likeUserId?.userName || "Unknown",
                    avatar: likeUserId?.avatar || "",
                })),
                createdAt: post.createdAt
            })),
            createdAt: user.createdAt
        }));


    console.log(feedData);


    return feedData;



};

module.exports = feed;
