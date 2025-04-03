const Connections = require('../model/Connections')

const MyConnections = async (_, { id }, context) => {

    if (!context) {
        throw new Error("User not authenticated");
    }

    try {
        const query = {
            $or: [
                { toUser: new mongoose.Types.ObjectId(id) },
                { fromUser: new mongoose.Types.ObjectId(id) }
            ],
            status: "accepted"
        };

        const userConnections = await Connections.find(query)
            .populate("fromUser", "userName email avatar bio")
            .populate("toUser", "userName email avatar bio");

        const userConnectionData = await Promise.all(userConnections.map(async (connection) => {
            const otherUser = connection.fromUser._id.toString() === id
                ? connection.toUser
                : connection.fromUser;

            return {
                id: otherUser._id.toString(),
                userName: otherUser.userName,
                email: otherUser.email,
                avatar: otherUser.avatar,
                bio: otherUser.bio
            };
        }));

        return userConnectionData;

    } catch (error) {
        console.error("Error fetching connections:", error);
        return [];
    }
}

module.exports=MyConnections