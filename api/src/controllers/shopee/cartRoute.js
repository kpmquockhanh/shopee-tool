import responseHelper from "../../utils/helpers/response-helper.js";
import { Cart } from "../../models/index.js";
import constants from "../../constants/index.js";
import { errorHelper } from "../../utils/index.js";
import pick from "lodash/pick.js";
import get from "lodash/get.js";
import {
  genCartToken,
  updateCartItems,
} from "../../utils/helpers/cartHelper.js";

export async function getCart(req, res) {
  const cart = await Cart.findOne({
    user_id: req.query.user_id,
    store_id: req.query.shop_id,
    token: req.cartToken,
  })
    .exec()
    .catch((err) => {
      return res.status(500).json(errorHelper("00080", req, err.message));
    });
  return res.json(
    responseHelper(
      "00000",
      pick(cart, [
        "token",
        "dishes",
        "shop_id",
        "user_id",
        "createdAt",
        "updatedAt",
      ])
    )
  );
}

export async function getCartByToken(req, res) {
  const cartToken = req.cartToken;
  const cart = await Cart.findOne({
    token: cartToken,
  })
    .exec()
    .catch((err) => {
      return res.status(500).json(errorHelper("00080", req, err.message));
    });
  return res.json(
    responseHelper(
      "00000",
      pick(cart, [
        "token",
        "dishes",
        "shop_id",
        "user_id",
        "createdAt",
        "updatedAt",
      ])
    )
  );
}

export async function createNewCart(req, res) {
  if (!req.query.user_id || !req.query.shop_id) {
    return res
      .status(400)
      .json(errorHelper("00081", req, constants.invalidParams));
  }
  const cart = await Cart.create({
    user_id: req.query.user_id,
    store_id: req.query.shop_id,
    dishes: [],
    token: genCartToken(),
  }).catch((err) => {
    return res.status(500).json(errorHelper("00080", req, err.message));
  });
  return res.json(
    responseHelper(
      "00000",
      pick(cart, [
        "token",
        "dishes",
        "shop_id",
        "user_id",
        "createdAt",
        "updatedAt",
      ])
    )
  );
}

export async function addToCartByToken(req, res) {
  const updateItem = req.body.item;
  let cartToken = req.cartToken;
  if (!updateItem) {
    return res
      .status(400)
      .json(responseHelper("00081", constants.invalidParams));
  }
  let cart = await Cart.findOne({
    token: cartToken,
  }).exec();
  console.log("cart", { cartToken });
  if (!cart) {
    // gen cart token
    cartToken = genCartToken();
    cart = await Cart.create({
      token: cartToken,
      dishes: [],
    }).catch((err) => {
      return res.status(500).json(errorHelper("00076", req, err.message));
    });
  }

  let currentItems = cart.dishes;
  currentItems = updateCartItems(updateItem, currentItems);
  console.log("update cart", cart);
  const resp = await Cart.updateOne(
    { user_id: cart.user_id, store_id: cart.store_id, token: cart.token },
    { dishes: currentItems }
  )
    .exec()
    .catch((err) => {
      return res.status(500).json(errorHelper("00077", req, err.message));
    });

  return res.json(
    responseHelper(
      200,
      pick(resp, [
        "token",
        "dishes",
        "shop_id",
        "user_id",
        "createdAt",
        "updatedAt",
      ])
    )
  );
}

export async function removeCart(req, res) {
  const { user_id: userId, shop_id: shopId, dish_id: dishId } = req.body;

  if (!userId || !shopId || !dishId) {
    return res
      .status(400)
      .json(responseHelper("00082", constants.invalidParams));
  }

  let cart = await Cart.findOne({
    user_id: userId,
    store_id: shopId,
  }).exec();
  if (!cart) {
    return res.json(
      responseHelper(200, "Not found cart, remove cart successfully!")
    );
  }

  const currentItems = cart.dishes.filter((d) => d.dish_id !== dishId);

  await Cart.updateOne(
    { user_id: userId, store_id: shopId },
    { dishes: currentItems }
  )
    .exec()
    .catch((err) => {
      return res.status(500).json(errorHelper("00077", req, err.message));
    });

  return res.json(responseHelper(200, "Remove cart successfully!"));
}

export function syncCart(req, res) {
  return res.json(responseHelper(200, "Sync cart"));
}
