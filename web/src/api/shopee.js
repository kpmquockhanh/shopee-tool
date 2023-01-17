import axios from 'axios'

const baseUrl = 'http://127.0.0.1:3000/api/v1'
const shopeeUrl = 'https://gappapi.deliverynow.vn/api'

export const getToken = () => {
  return localStorage.getItem('token')
}

export const setToken = (token) => {
  localStorage.setItem('token', token)
}

function getHeaders() {
  const headers = {}
  headers['access-token'] = getToken() || 'empty'

  return headers
}

const fetchApi = async (method, url, data = {}) => {
  const response = await axios({
    method,
    data,
    url: `${baseUrl}${url}`,
    headers: getHeaders(),
  })
  return response.data
}

const fetchShopeeApi = async (method, url, data = {}) => {
  const response = await axios({
    method,
    data,
    url: `${shopeeUrl}${url}`,
    headers: getHeaders(),
  })
  return response.data
}

export const getShopeeProductOptions = async (shopId, dishId) => {
  if (!shopId || !dishId || !getToken()) {
    return {}
  }
  return fetchApi('get', `/v5/buyer/store/dish/option_groups`, {
    restaurant_id: shopId,
    dish_id: dishId,
    delivery_type: 1,
    shipping_type: 1,
  })
}

export const getShopeeProducts = async (shopId) => {
  if (!shopId) {
    return []
  }

  return fetchApi('get', `/dishes?shop_id=${shopId}`)
}

export const getCart = async (shopId, userId) => {
  return fetchApi('get', `/cart?shop_id=${shopId}&user_id=${userId}`)
}

export const getCartByToken = async (token) => {
  return fetchApi('get', `/cart/${token}`)
}

export const deleteCart = async (shopId, userId, dishId) => {
  return fetchApi('delete', `/cart/remove`, {
    shop_id: shopId,
    user_id: userId,
    dish_id: dishId,
  })
}

export const addToCart = async (shopId, userId, item) => {
  return fetchApi('post', `/cart/add?shop_id=${shopId}`, {
    user_id: userId,
    item,
  })
}

export const addToCartByToken = async (token, item) => {
  return fetchApi('post', `/cart/${token}/add`, {
    item,
  })
}

export const getShopFromUrl = (url) => {
  return fetchShopeeApi('get', `/delivery/get_from_url?url=${url}`)
}

export const getUserProfile = async () => {
  return fetchShopeeApi('get', `/user/get_profile`)
}
