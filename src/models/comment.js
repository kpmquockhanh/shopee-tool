import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  presence: {
    type: Boolean,
    default: false,
  },
  comment: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    //required: true,
  },
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  ref_id: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  ref_type: {
    type: String,
    enum: ['post', 'comment'],
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      ret.created_at = doc.createdAt;
      delete ret.__v;
    },
  },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
