import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const roleSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
  },
  {
    timestamps: true,
  },
);

const Role = model('Role', roleSchema);
export default Role;
