import get from 'lodash/get'
import { addToCartByToken, getCart, getCartByToken } from '@/api/shopee'

const moduleCart = {
  namespaced: true,

  state: {
    cart: [],
    cartOpen: false,
  },

  mutations: {
    setOpenCart(state, value) {
      state.cartOpen = value
    },
    setCart(state, value) {
      state.cart = get(value, 'data.dishes', [])
    },
  },

  actions: {
    async getCart({ commit }, { shopId, userId }) {
      const resp = await getCart(shopId, userId)
      commit('setCart', resp)
    },
    setOpenCart({ commit }, value) {
      commit('setOpenCart', value)
    },
    async getCartByToken({ commit }, token) {
      const resp = await getCartByToken(token)
      commit('setCart', resp)
    },
    async addToCartByToken({ dispatch }, { token, item }) {
      await addToCartByToken(token, item)
      dispatch('cart/getCartByToken', token)
    },
  },
}

export default moduleCart
