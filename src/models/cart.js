import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cartSchema = Schema(
  {
    createdBy: {
      type: {
        iv: { type: String, required: true },
        content: { type: String, required: true },
      },
      required: true,
    },
    resId: {
      type: Number,
      required: true,
    },
    isSync: {
      type: Boolean,
    },
    authKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

cartSchema.virtual('cartItems', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'cart',
});

const Cart = model('Cart', cartSchema);

export default Cart;
