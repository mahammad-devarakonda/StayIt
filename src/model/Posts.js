const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  imageURL: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true, ref: 'User'
  },]
}, { timestamps: true });


postSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await User.updateOne(
      { _id: doc.userId },
      { $pull: { posts: doc._id } }
    );
  }
});

module.exports = mongoose.model('Post', postSchema);
