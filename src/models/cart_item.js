import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cartItemSchema = Schema(
  {
    cart: { type: Schema.Types.ObjectId, ref: 'Cart' },
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
      quantity: { type: Number, required: true },
      options: { type: Array, required: false },
    },
    addedBy: { type: String, required: false },
    authKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const CartItem = model('CartItem', cartItemSchema, 'cart_items');

export default CartItem;
