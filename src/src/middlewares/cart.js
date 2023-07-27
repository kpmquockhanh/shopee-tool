import { Cart } from '../models/index.js';

// eslint-disable-next-line consistent-return
export default async (req, res, next) => {
  const auth = req.headers['x-kpm-token'];
  const cartToken = req.params.token;
  if (!cartToken || cartToken === 'new') {
    return next();
  }
  req.authKey = auth;

  const cart = await Cart.findOne({
    authKey: auth,
    _id: cartToken,
  });

  if (cart && cart._id) {
    req.isOwner = true;
  } else {
    req.isOwner = false;
  }
  console.log('DEBUG isOwner', req.isOwner);
  next();
};
