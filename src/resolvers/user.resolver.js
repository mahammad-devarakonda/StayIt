const register = require('../Mutations/RegisterMutation');
const verifyOTP = require('../Mutations/VerifyOTPMutation');
const login = require('../Mutations/LoginMutation');
const addPost = require('../Mutations/addPostMutation');
const user=require('../Query/UserQuery')
const UserPosts=require('../Query/UserPosts')
const feed=require('../Query/FeedQuery')
const MyConnections=require('../Query/MyConnectionsQuery')
const chat=require('../Query/ChatQuery')
const Me=require("../Query/MeQuery")

const userResolver = {

  Query: {
    user,
    UserPosts,
    feed,
    MyConnections,
    chat,
    Me
  },

  Mutation: {
    login,
    register,
    verifyOTP,
    addPost,
  }

}

module.exports = userResolver