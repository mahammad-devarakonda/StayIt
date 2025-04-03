const Connections = require('../model/Connections')

const myRequests = async (_, __, context) => {

    const loginUser = context?.user.userId;

    const myRequest = await Connections.find({ toUser: loginUser, status: "interested" })
        .populate("fromUser", "id userName email")
        .populate("toUser", "id userName email");

    const formattedRequests = myRequest.map((request) => ({
        id: request._id.toString(),
        fromUser: {
            id: request.fromUser._id.toString(),
            userName: request.fromUser.userName,
            email: request.fromUser.email,
        },
        toUser: {
            id: request.toUser._id.toString(),
            userName: request.toUser.userName,
            email: request.toUser.email,
        },
        status: request.status,
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
    }));

    return formattedRequests;
}

module.exports=myRequests