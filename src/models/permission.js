import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const permissionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

const Permission = model('Permission', permissionSchema);
export default Permission;
