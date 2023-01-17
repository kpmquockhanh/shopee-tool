import responseHelper from "../../utils/helpers/response-helper.js";
import Shopee from "../../shopee/index.js";
import constants from "../../constants/index.js";
import get from 'lodash/get.js'

export async function getDishes(req, res) {
  if (!req.query.shop_id) {
    return res.status(400).json(responseHelper(400, constants.invalidParams));
  }
  const shopee = new Shopee(req.token);
  const resp = await shopee.getShopeeProducts(req.query.shop_id);
  if (resp.code !== 0) {
    return res.status(400).json(responseHelper(400, resp.msg));
  }

  return res.json(responseHelper(200, get(resp, 'data.catalogs', [])));
}
