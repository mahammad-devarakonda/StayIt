const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const Post = require('../model/Posts')

const userResolver = {
  Query: {
    user: async (_,{id}) => {

      console.log(id);
      

      try {
        const user=await User.findById(id)
        console.log(user);
        
        const posts = await Post.find({ userId: user });

        console.log(posts);
        

        return {
          user: {
            id: user._id,
            userName: user.userName,
            email: user.email
          },
          posts: posts,
        }
        
      } catch (error) {
        throw new Error("No user Found")
      }
    },

    

    UserPosts: async (_, __, context) => {
      const userID = context.user.userId

      console.log(userID);
      
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
      const loginUser = context?.user.userId;

      const showFeed = await User.find({ _id: { $ne: loginUser } }, "userName,posts").populate("posts userName _id");

      return showFeed.map(user => ({
        id: user._id.toString(),
        userName: user.userName, // Ensure userName is always returned
        posts: user.posts || []  // Ensure posts is always an array
      }));
    }
  },


  Mutation: {
    register: async (_, { userName, email, password }, { res }) => {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        throw new Error("User already exists! Please use another email to register.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        userName,
        email,
        password: hashedPassword,
      });

      await user.save(); // Ensure the user is saved properly.
      // Use the `user` object for the token
      const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('authToken', token, { httpOnly: true, sameSite: "lax" });

      return { token, user }; // Return the token and the created user
    },



    login: async (_, { email, password }, { res }) => {

      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Please enter valid credentionals!");

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.cookie('authToken', token, { httpOnly: true, sameSite: "lax" });
      return { token, user }
    },


    addPost: async (_, { input }, context) => {

      const userID = context.user.userId

      if (!userID) {
        throw new Error('User is not authenticated');
      }

      const { content, imageURL } = input;

      console.log(input);

      const newPost = new Post({
        content,
        imageURL,
        userId: userID,
      });

      const savedPost = await newPost.save();

      const user = await User.findById(userID);
      console.log(user);

      user.posts.push(savedPost._id);
      await user.save();

      return savedPost;
    },
  }
}

module.exports = userResolver