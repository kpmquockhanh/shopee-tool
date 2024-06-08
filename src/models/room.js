import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'Attachment',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
);

const Room = model('Room', roomSchema);
export default Room;
