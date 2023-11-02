import get from 'lodash/get.js';
import responseHelper from '../../utils/helpers/response-helper.js';
import Shopee from '../../shopee/index.js';
import constants from '../../constants/index.js';

export async function getDishes(req, res) {
  if (!req.params.shop_id) {
    return res.status(400).json(responseHelper(400, constants.invalidParams));
  }
  const shopee = new Shopee(req.token);
  const resp = await shopee.getShopeeProducts(req.params.shop_id);

  if (resp.code !== 0) {
    return res.status(400).json(responseHelper(400, resp.msg));
  }

  return res.json(responseHelper(200, get(resp, 'data.catalogs', [])));
}

export async function getShopInfo(req, res) {
  if (!req.query.url) {
    return res.status(400).json(responseHelper(400, constants.invalidParams));
  }
  const shopee = new Shopee(req.token);
  const resp = await shopee.getShopeeInfo(req.query.url);

  if (resp.result !== 'success') {
    return res.status(400).json(responseHelper(400, resp.msg));
  }

  return res.json(responseHelper(200, get(resp, 'reply', {})));
}

export async function getDishInfo(req, res) {
  if (!req.params.shop_id || !req.params.dish_id) {
    return res.status(400).json(responseHelper(400, constants.invalidParams));
  }

  const shopee = new Shopee(req.token);
  const resp = await shopee.getShopeeProductOptions(req.params.shop_id, req.params.dish_id);
  if (resp.code !== 0) {
    return res.status(400).json(responseHelper(400, resp.msg));
  }

  return res.json(responseHelper(200, get(resp, 'data', {})));
}
