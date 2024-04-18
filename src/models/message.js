import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
    },
  },
  {
    timestamps: true,
  },
);

const Message = model('Message', messageSchema);
export default Message;
