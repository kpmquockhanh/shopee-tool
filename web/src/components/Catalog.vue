<template>
  <div class="">
    <v-chip color="pink" label text-color="white" class="mb-1 ml-2">
      <v-icon left> mdi-label</v-icon>
      {{ data.name }}
    </v-chip>

    <v-row no-gutters>
      <v-col v-for="(dish, index) in dishes" :key="index" cols="12" sm="3">
        <v-card elevation="3" outlined class="rounded-lg mb-8 mx-2">
          <v-img :src="getFirstPicture(dish)" :lazy-src="placeholder"></v-img>

          <v-card-title>{{ dish.name }}</v-card-title>

          <v-card-text v-if="dish.description">
            <div>{{ dish.description }}</div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="deep-purple lighten-2"
              text
              @click="onAddToCart(dish)"
              :loading="addingToCart[dish.id]"
            >
              Add to cart
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import get from 'lodash/get'
import { mapActions } from 'vuex'
import mixins from '@/mixins'
import placeholder from '@/assets/placeholder.svg'

export default {
  name: 'Catalog',
  mixins: [mixins],
  data() {
    return {
      addingToCart: {},
    }
  },
  methods: {
    ...mapActions('cart', ['getCartByToken', 'addToCartByToken']),
    getFirstPicture(dish) {
      return get(dish, 'pictures[0].url', '')
    },
    async onAddToCart(dish) {
      this.addingToCart[dish.id] = true
      this.addingToCart = { ...this.addingToCart }
      await this.addToCartByToken({
        token: 'ahihiahaha',
        item: {
          dish_id: dish.id,
          quantity: 1,
          img: this.getFirstPicture(dish),
          user_id: 123,
          store_id: dish.restaurant_id,
          name: dish.name,
          price: dish.price,
          // options: [
          //     {
          //         id: 519652,
          //         option_items: [
          //             {
          //               id: 2658824,
          //               quantity: 1
          //             }
          //         ]
          //     }
          // ]
        },
      })
      this.addingToCart[dish.id] = false
      this.addingToCart = { ...this.addingToCart }
      this.toast('Added to cart')
      await this.getCartByToken('ahihiahaha')
    },
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    dishes() {
      return get(this.data, 'dishes', [])
    },
    placeholder() {
      return placeholder
    },
  },
  filters: {
    currency(value) {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'VND',
      })
      return formatter.format(value)
    },
  },
}
</script>

<style scoped></style>
