import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const cartSchema = Schema(
  {
    dishes: {
      type: [
        {
          dish_id: { type: Number, required: true },
          quantity: { type: Number, required: true },
          note: String,
          options: [
            {
              id: Number,
              option_items: [
                {
                  id: Number,
                  quantity: Number,
                },
              ],
            },
          ],
          user_id: { type: Number, required: true },
          store_id: { type: Number, required: true },
          img: String,
          name: { type: String, required: true },
          price: Number,
        },
      ],
      required: true,
    },
    token: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Cart = model('Cart', cartSchema);

export default Cart;
