const Connections = require('../model/Connections')
const User = require('../model/User')
const mongoose = require('mongoose')

const connectionResolver = {
    Query: {
        myRequests: async (_, __, context) => {
            console.log("Fetching connection requests");

            const loginUser=context?.user.userId
            
            const myRequest= await Connections.find({toUser:loginUser})
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
    },
    Mutation: {
        sendRequestConnection: async (_, { input }, context) => {
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
                    ]
                });


                if (existingRequest) {  
                    console.log("A connection request has already been sent to this user.");
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
        },


        reviewRequestConnection: async (_, { requestedUser, status }, context) => {
            try {                
                const logginUser = context.user
                const fromUser = requestedUser    
         
                const allowedStatus = ["accepted", "rejected"]

                if (!allowedStatus.includes(status)) {
                    throw new Error("Invalid status request")
                }

                const connectionResult = await Connections.findOne({
                    fromUser: new mongoose.Types.ObjectId(requestedUser),
                    toUser: new mongoose.Types.ObjectId(logginUser.userId)
                }); 
 
                if (!result) {
                    throw new Error("Connection Not found")
                }

                result.status = status

                await result.save()

                return {
                    sucess: true,
                    message: "Your connection request accpected...",
                    request: {
                        fromUser,
                        status,
                        timestamp: new Date()
                    }
                }
            } catch (error) {
                return {
                    success: false,
                    message: error.message || "Failed to review connection request.",
                    request: null,
                };
            }
        },
    }
}

module.exports = connectionResolver