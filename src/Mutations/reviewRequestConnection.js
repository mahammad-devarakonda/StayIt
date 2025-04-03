const Connections = require('../model/Connections')
const User=require('../model/User')
const mongoose = require('mongoose')

const reviewRequestConnection = async (_, { input }, context) => {
    try {
        if (!context.user) {
            throw new Error("Unauthorized: Please log in.");
        }

        const { requestedUser, status } = input;
        const loggedInUser = context.user;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            throw new Error("Invalid status request.");
        }

        // Find connection in either direction
        const connectionResult = await Connections.findOne({
            $or: [
                { fromUser: new mongoose.Types.ObjectId(requestedUser), toUser: new mongoose.Types.ObjectId(loggedInUser.userId) },
                { fromUser: new mongoose.Types.ObjectId(loggedInUser.userId), toUser: new mongoose.Types.ObjectId(requestedUser) }
            ]
        });

        if (!connectionResult) {
            throw new Error("Connection not found.");
        }

        // Update status and timestamp
        connectionResult.status = status;
        connectionResult.timestamp = new Date();
        await connectionResult.save();

        const acceptedByUser = await User.findById(loggedInUser.userId);
        const acceptedToUser = await User.findById(requestedUser);

        return {
            success: true,
            message: `Request ${status}`,
            request: {
                toUser: {
                    id: acceptedToUser._id.toString(),
                    userName: acceptedToUser.userName,
                    email: acceptedToUser.email
                },
                status: connectionResult.status,
                timestamp: connectionResult.timestamp.toISOString()
            }
        };
    } catch (error) {
        console.error("Error in reviewRequestConnection:", error.message);
        return {
            success: false,
            message: error.message || "Failed to review connection request.",
            request: null,
        };
    }
}


module.exports=reviewRequestConnection