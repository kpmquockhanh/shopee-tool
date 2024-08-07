import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const fileSchema = new Schema(
  {
    origin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    target: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['follow', 'friend'],
      default: 'follow',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },

  },
  {
    timestamps: true,
  },
);

const Relationship = model('Relationship', fileSchema);
export default Relationship;
