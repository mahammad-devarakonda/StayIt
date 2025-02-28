const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const User = require('../model/User')
const Post = require('../model/Posts')
const cloudinary = require('cloudinary').v2

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

    addPost: async (_, { file, content }, context) => {

      const userID=context?.user?.userId

      if (!userID) {
        throw new Error("Unauthorized: Please log in.");
    }

      const uploadedFile = await file;

      if (!uploadedFile) {
        throw new Error("No file was uploaded.");
      }
    
      const actualFile = uploadedFile.file || (await uploadedFile.promise);

      if (!actualFile) {
        throw new Error("Failed to extract file details.");
      }
    
      const { createReadStream, filename } = actualFile;
      if (!createReadStream) {
        throw new Error("Invalid file upload!");
      }
    
      const stream = createReadStream();
      const uniqueFilename = `${context.user?.userId}_${Date.now()}_${filename}`;
    
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "social_media_uploads",
            public_id: uniqueFilename,
            resource_type: "auto",
          },
          async (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(new Error("File upload failed!"));
            }

            try {
              const newPost = new Post({
                content: content || "",
                imageURL: result.secure_url,
                userId: context.user?.userId,
              });
    
              const savedPost = await newPost.save();
              const user = await User.findById(context.user?.userId);
              if (!user) throw new Error("User not found");
    
              user.posts.push(savedPost._id);
              await user.save();
    
              resolve({
                success: true,
                message: "File uploaded successfully!",
                fileUrl: result.secure_url,
                fileDetails: {
                  id: savedPost._id,
                  content: savedPost.content,
                  imageURL: savedPost.imageURL,
                },
              });
            } catch (dbError) {
              console.error("Database Error:", dbError);
              reject(new Error("Database operation failed!"));
            }
          }
        );
    
        stream.pipe(uploadStream);
      });
    }
    
    
  }

}

module.exports = userResolver