<template>
  <v-navigation-drawer v-model="drawer" fixed temporary right width="512px">
    <v-list-item>
      <v-list-item-avatar>
        <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img>
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>John Leider</v-list-item-title>
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <v-list>
      <v-list-item-action-text v-if="!cart || !cart.length">
        <v-list-item-title class="d-flex justify-center my-4"
          >Cart is empty
        </v-list-item-title>
      </v-list-item-action-text>
      <v-list-item v-for="dish in cart" :key="dish.dish_id" link v-else>
        <v-list-item-avatar class="rounded-sm">
          <v-img :src="dish.img"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ dish.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ dish.quantity }} x {{ dish.price | currency }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn icon @click="removeCart(dish)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <template v-slot:append>
      <v-btn block color="red" tile
        >Sync cart ({{ totalCartPrice | currency }})
      </v-btn>
    </template>
  </v-navigation-drawer>
  <!--Cart detail-->
  <!--        <div v-for="dish in cart.dishes" :key="dish.dish_id">-->
  <!--          <div class="flex">-->
  <!--            <div class="mr-3">Dish: {{ dish.dish_id }}</div>-->
  <!--            <div>Qty: {{ dish.quantity }}</div>-->
  <!--          </div>-->
  <!--        </div>-->
  <!--End cart detail-->
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { deleteCart } from '@/api/shopee'

export default {
  name: 'Carts',
  data() {
    return {
      items: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
        },
        {
          title: 'Friends',
          icon: 'mdi-account-group',
        },
        {
          title: 'History',
          icon: 'mdi-history',
        },
        {
          title: 'Settings',
          icon: 'mdi-cog',
        },
      ],
    }
  },
  methods: {
    ...mapActions('cart', ['setOpenCart', 'getCart']),
    async removeCart(dish) {
      console.log('removeCart', dish)
      await deleteCart(dish.store_id, dish.user_id, dish.dish_id)
      await this.getCart()
    },
  },
  computed: {
    ...mapState('cart', ['cartOpen', 'cart']),
    drawer: {
      get() {
        return this.cartOpen
      },
      set(value) {
        this.setOpenCart(value)
      },
    },
    totalCartPrice() {
      return this.cart.reduce((total, dish) => {
        return total + dish.price * dish.quantity
      }, 0)
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
