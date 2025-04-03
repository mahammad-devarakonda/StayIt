const User = require('../model/User')
const Post = require('../model/Posts');
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.API_SECRET_KEY
});



const addPost = async (_, { file, content }, context) => {
    const userID = context?.user?.userId;

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
};
module.exports = addPost  