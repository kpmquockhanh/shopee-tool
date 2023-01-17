<template>
  <v-container>
    <Setting />
    <div>
      <template v-if="isLoading">
        <v-row>
          <v-col cols="12" md="4">
            <v-skeleton-loader
              type="list-item-avatar, divider, list-item-three-line, card-heading, image, actions"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader
              type="list-item-avatar, divider, list-item-three-line, card-heading, image, actions"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-skeleton-loader
              type="list-item-avatar, divider, list-item-three-line, card-heading, image, actions"
            />
          </v-col>
        </v-row>
      </template>
      <template v-else>
        <catalog
          v-for="catalog in catalogs"
          :key="catalog.id"
          :data="catalog"
          class="mb-5"
        />
      </template>
    </div>
  </v-container>
</template>

<script>
import get from 'lodash/get'
import { mapActions, mapState } from 'vuex'
import { getShopeeProducts } from '@/api/shopee'
import Catalog from './Catalog.vue'
import Setting from '@/components/Setting.vue'

export default {
  components: {
    Setting,
    Catalog,
  },
  props: {
    msg: String,
  },
  data() {
    return {
      catalogs: [],
      isLoading: false,
    }
  },
  computed: {
    ...mapState('cart', ['cartOpen', 'cart']),
  },
  methods: {
    ...mapActions('cart', ['getCartByToken']),
  },
  async created() {
    this.isLoading = true
    const resp = await getShopeeProducts(1031462)
    this.catalogs = get(resp, 'data', [])
    await this.getCartByToken('ahihiahaha')
    this.isLoading = false
  },
}
</script>
