const Connections = require('../model/Connections')
const User=require('../model/User')

const sendRequestConnection = async (_, { input }, context) => {

    try {
        const fromUser = await User.findById(context.user.userId);

        const toUser = await User.findById(input.toUser)

        const fromUserId = fromUser.id
        const toUserId = toUser.id

        const status = input.status

        if (fromUserId === toUserId) {
            throw new Error("You can sent request your self")
        }

        if (!toUser) {
            throw new Error("No user found...!")
        }


        const allowedStatus = ["interested", "accepted", "rejected"]

        if (!allowedStatus.includes(status)) {
            throw new Error("Invalid status request...!")
        }


        const existingRequest = await Connections.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId },
                { toUserId: fromUserId }
            ],
            status: "interested"
        });


        if (existingRequest) {
            throw new Error("A connection request has already been sent to this user.")
        }
        const connectionRequest = new Connections({
            fromUser: fromUser._id,
            toUser: toUser._id,
            status,
            timestamp: new Date()
        })

        await connectionRequest.save()

        return {
            success: true,
            message: `Your connection request was sent successfully.With Request Id ${connectionRequest._id} `,
            toUser: {
                userName: toUser.userName,
            },
            status: input.status,
            timestamp: new Date().toISOString()
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || "Failed to send connection request.",
            request: null,
        };
    }
}

module.exports=sendRequestConnection