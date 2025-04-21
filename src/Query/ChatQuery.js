const Chat = require('../model/Chat')
const User=require('../model/User')

const chat = async (_, { id }, context) => {
    const loginUser = context?.user?.userId;

    if (!loginUser) {
        console.error("User not authenticated!");
        throw new Error("User not authenticated");
    }

    try {
        const chat = await Chat.findOne({
            participants: { $all: [loginUser, id] },
        }).lean();



        if (!chat) {
            console.error("Chat not found for ID:", id);
            throw new Error("Chat not found!");
        }

        const messages = await Promise.all(
            chat.message.map(async (msg) => {
                const senderUser = await User.findById(msg.senderId).lean();
                return {
                    sender: senderUser ? { id: senderUser._id, userName: senderUser.userName, avatar: senderUser.avatar } : null,
                    text: msg.text,
                    sentAt: msg.createdAt.toISOString(),
                };
            })
        );

        return {
            id: chat._id.toString(),
            participants: chat.participants.map(p => p.toString()),
            message: messages,
            timestamp: chat.timestamp.toISOString(),
        };

    } catch (error) {
        console.error("Error fetching chat:", error);
        throw new Error("Error retrieving chat");
    }
}

module.exports=chat