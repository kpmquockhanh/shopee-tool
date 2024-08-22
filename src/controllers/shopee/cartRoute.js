import pick from 'lodash/pick.js';
import responseHelper from '../../utils/helpers/response-helper.js';
import { Cart, CartItem } from '../../models/index.js';
import { errorHelper } from '../../utils/index.js';
import { genCartToken } from '../../utils/helpers/cartHelper.js';
import Shopee from '../../shopee/index.js';

const responseFields = [
  'id',
  'isNew',
  'createdBy',
  'isSync',
  'cartItems',
  'createdAt',
  'updatedAt',
];
const responseFieldsCartItem = [
  'product',
  'addedBy',
  'createdAt',
  'updatedAt',
];

export async function getCartByToken(req, res) {
  let { token } = req.params;
  const { hash, resId } = req.query;
  if (!hash || !resId) {
    return res.status(400).json(errorHelper('00080', req, 'Invalid request'));
  }

  if (token === 'new') {
    token = '';
  }

  let isNew = false;
  try {
    let cart;
    if (token) {
      cart = await Cart.findOne({
        _id: token,
        resId,
      }).populate('cartItems', [...responseFieldsCartItem, 'authKey']).exec();
    }
    if (!cart) {
      cart = await Cart.create({
        createdBy: hash,
        resId,
        isSync: false,
        authKey: genCartToken(),
      });
      isNew = true;
    }

    cart.cartItems = (cart.cartItems || []).map((item) => ({
      ...item._doc,
      authKey: '',
      removable: item.authKey === req.authKey || req.isOwner,
    }));

    if (req.io) {
      const allSockets = req.io.sockets.sockets;
      const socketsNotInRoom = Array.from(
        allSockets.values(),
      ).filter((socket) => socket.rooms.size === 1
        && socket.rooms.has(socket.id)
        && parseInt(socket.res_id, 10) === parseInt(resId, 10));
      socketsNotInRoom.forEach((socket) => {
        socket.join(token);
      });
    }
    return res.json(
      responseHelper(
        '00000',
        {
          ...pick(cart, responseFields),
          isNew,
          authKey: isNew ? cart.authKey : '',
          isOwner: req.isOwner,
        },
      ),
    );
  } catch (err) {
    return res.status(500).json(errorHelper('00080', req, err.message));
  }
}

export async function deleteCart(req, res) {
  const { token } = req.params;
  const { isOwner } = req;

  if (!token) {
    return res.status(400).json(errorHelper('00080', req, 'Invalid token'));
  }

  if (!isOwner) {
    return res.status(403).json(errorHelper('00080', req, 'You have not permission'));
  }

  try {
    const cart = Cart.findById(token);
    if (!cart) {
      return res.status(400).json(errorHelper('00080', req, 'Cart not found or you have not permission'));
    }
    await Cart.deleteOne({
      _id: token,
    });
    await CartItem.deleteMany({
      cart: token,
    });
  } catch (err) {
    return res.status(500).json(errorHelper('00080', req, err.message));
  }
  return res.json(
    responseHelper(
      '00000',
      {
        status: true,
      },
    ),
  );
}

export async function updateCartItems(req, res) {
  const { token } = req.params;
  const {
    product, addedBy, resId,
  } = req.body;
  if (!addedBy
    || !product
    || !product.id
    || !product.name
    || !product.price
    // || !product.image
    || !product.quantity
    || !resId) {
    return res.status(400).json(errorHelper('00080', req, 'Invalid product'));
  }

  if (!product.image) {
    product.image = 'https://images.foody.vn/default/s120x120/shopeefood-deli-dish-no-image.png';
  }
  try {
    let cart = await Cart.findOne({
      _id: token,
      resId,
    });
    if (!cart) {
      return res.status(404).json(errorHelper('00081', req, 'Cart not found'));
    }
    await CartItem.findOneAndUpdate({
      cart: cart._id,
      'product.id': product.id,
      'product.options': product.options || {},
      addedBy,
      authKey: req.authKey,
    }, {
      product,
    }, {
      upsert: true,
    });
    await Cart.findOneAndUpdate({
      _id: token,
      resId,
    }, {
      isSync: false,
    });

    cart = await Cart.findOne({
      _id: token,
      resId,
    }).populate('cartItems', responseFieldsCartItem).exec();

    if (req.io) {
      req.io.to(token).emit('cart_updated', {
        msg: `added ${product.name}`,
        product,
        addedBy,
      });
    }
    return res.json(
      responseHelper(
        '00000',
        pick(cart, responseFields),
      ),
    );
  } catch (err) {
    return res.status(500).json(errorHelper('00080', req, err.message));
  }
}

export async function deleteCartItems(req, res) {
  const { token } = req.params;
  const { id, addedBy } = req.body;
  if (!id) {
    return res.status(400).json(errorHelper('00080', req, 'Invalid request'));
  }

  const cartItem = await CartItem.findOne({
    _id: id,
  });

  await CartItem.findOneAndDelete({
    _id: id,
  });

  await Cart.findOneAndUpdate({
    _id: token,
  }, {
    isSync: false,
  });

  if (req.io) {
    req.io.to(token).emit('cart_updated', {
      msg: `deleted ${cartItem.product.name}`,
      product: cartItem.product,
      addedBy,
      isDelete: true,
    });
  }

  return res.json(
    responseHelper(
      '00000',
      {
        status: true,
      },
    ),
  );
}

export async function deleteAllCart(req, res) {
  const { token } = req.params;

  await CartItem.remove({
    cart: token,
  });

  await Cart.findOneAndDelete({
    _id: token,
  }, {
    isSync: false,
  });

  if (req.io) {
    req.io.to(token).emit('cart_updated', {
      msg: 'Deleted all cart items',
      product: null,
      isDeleteAll: true,
    });
  }

  return res.json(
    responseHelper(
      '00000',
      {
        status: true,
      },
    ),
  );
}

export async function syncCartItems(req, res) {
  const { token } = req.params;
  const { createdBy, token: shopeeToken } = req.body;
  if (!token || !createdBy || !shopeeToken) {
    return res.status(400).json(errorHelper('00080', req, 'Invalid token'));
  }
  const { isOwner } = req;
  if (!isOwner) {
    return res.status(403).json(errorHelper('00080', req, 'You have not permission'));
  }

  const cart = await Cart.findOne({
    _id: token,
    createdBy,
  }).populate('cartItems', responseFieldsCartItem).exec();

  const shopee = new Shopee(shopeeToken);
  let isSuccess = true;
  try {
    const respEmpty = await shopee.emptyCart(cart.resId);
    if (respEmpty.code !== 0) {
      return res.status(400).json(errorHelper('00080', req, 'Cannot empty cart'));
    }
    // eslint-disable-next-line no-restricted-syntax
    for await (const cartItem of cart.cartItems) {
      const payload = {
        store_id: cart.resId,
        delivery_type: 1,
        shipping_type: 1,
        dishes: [{
          dish_id: parseInt(cartItem.product.id, 10),
          quantity: cartItem.product.quantity,
          options: cartItem.product.options.map((option) => ({
            id: parseInt(option.option_id, 10),
            option_items: option.option_value_ids
              ? option.option_value_ids.map((optionValueId) => ({
                id: optionValueId,
                quantity: 1,
              }))
              : [],
          })).filter((option) => option.option_items.length > 0),
        }],
      };
      const resp = await shopee.addToCart(payload);
      if (resp.code !== 0) {
        isSuccess = false;
      }
    }
  } catch (e) {
    console.log(e);
    isSuccess = false;
  }
  if (isSuccess) {
    await Cart.findOneAndUpdate({
      _id: token,
    }, {
      isSync: true,
    });
  }

  return res.json(
    responseHelper(
      isSuccess ? '00000' : '00080',
      {
        success: isSuccess,
      },
    ),
  );
}

export async function createNewCart(req, res) {
  if (!req.body.owner || !req.body.resId) {
    return res.status(400).json(errorHelper('00080', req, 'Invalid request'));
  }
  try {
    const { owner } = req.body;
    const existsCart = await Cart.findOne({
      createdBy: owner,
      resId: req.body.resId,
    });
    if (existsCart) {
      return res.status(400).json(errorHelper('00080', req, 'Cart already exists'));
    }

    const cart = await Cart.create({
      // token: genCartToken(),
      createdBy: owner,
      resId: req.body.resId,
      authKey: genCartToken(),
    }).catch((err) => res.status(500).json(errorHelper('00080', req, err.message)));
    return res.json(
      responseHelper(
        '00000',
        pick(cart, responseFields),
      ),
    );
  } catch (err) {
    return res.status(500).json(errorHelper('00080', req, err.message));
  }
}
