const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const Post = require('../model/Posts');
const Chat = require('../model/Chat')
const Connections = require('../model/Connections')
const cloudinary = require('cloudinary').v2
const mongoose = require('mongoose')
const nodemailer = require('nodemailer')
const redis = require('../utills/redisSetUp')
const register = require('./RegisterMutation');
const verifyOTP = require('./VerifyOTPMutation');
const login = require('./LoginMutation');
const addPost = require('./addPostMutation');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.API_SECRET_KEY
});


const userResolver = {

  Query: {
    user: async (_, { id }) => {

      try {
        const user = await User.findById(id)

        const posts = await Post.find({ userId: user });
        const connection = await Connections.find({
          $or: [
            { toUser: new mongoose.Types.ObjectId(id) },
            { fromUser: new mongoose.Types.ObjectId(id) }
          ],
          status: "accepted"
        })

        return {
          user: {
            id: user._id,
            userName: user.userName,
            email: user.email,
            avatar: user.avatar,
            bio: user?.bio
          },
          posts: posts,
          connection: connection.length
        }

      } catch (error) {
        throw new Error("No user Found")
      }
    },

    UserPosts: async (_, __, context) => {
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
    },

    feed: async (_, __, context) => {
      const loginUser = context?.user?.userId;

      const users = await User.find(
        { _id: { $ne: loginUser } },
        "_id userName avatar bio posts"
      ).populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      });
      const feedData = users
        .filter(user => user.posts.length > 0)
        .map(user => ({
          id: user._id ? user._id.toString() : "",
          userName: user.userName || "Unknown",
          avatar: user.avatar || "",
          bio: user.bio || "",
          posts: user.posts.map(post => ({
            id: post._id ? post._id.toString() : "",
            content: post.content || "",
            imageURL: post.imageURL || "",
          })),
        }));

      return feedData;
    },

    MyConnections: async (_, { id }, context) => {

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
    },

    chat: async (_, { id }, context) => {
      const loginUser = context?.user?.userId;

      if (!loginUser) {
        console.error("User not authenticated!");
        throw new Error("User not authenticated");
      }

      try {
        const chat = await Chat.findOne({
          participants: { $all: [loginUser, id] },
        }).lean();;

        console.log(chat);


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
  },


  Mutation: {
    login,
    register,
    verifyOTP,
    addPost,
  }

}

module.exports = userResolver