const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  imageURL: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Post', postSchema);
