import Vue from 'vue'
import Vuex from 'vuex'
import get from 'lodash/get'
import toast from './moduleToast'
import dialog from './moduleDialog'
import cart from './moduleCart'
import { getShopFromUrl } from '@/api/shopee'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    shop: {},
    user: {},
  },

  mutations: {
    setShop(state, value) {
      state.shopId = value
    },
    setUser(state, value) {
      state.userId = value
    },
  },

  actions: {
    setShopId({ commit }, value) {
      commit('setShop', value)
    },
    setUserId({ commit }, value) {
      commit('setUser', value)
    },
    async getShopFromUrl({ commit }, value) {
      const resp = await getShopFromUrl(value)
      console.log('resp', resp)
      commit('setShop', get(resp, 'reply', {}))
    },
  },

  modules: {
    toast,
    dialog,
    cart,
  },
})
