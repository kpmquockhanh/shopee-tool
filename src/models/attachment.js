import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const fileSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    src: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'profile_image'],
    },
    refId: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

const Attachment = model('Attachment', fileSchema);
export default Attachment;
