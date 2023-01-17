<template>
  <v-card>
    <v-app-bar fixed height="70">
      <v-toolbar-title>Shopee tool</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-icon v-if="!itemCount" @click="openCart">mdi-cart</v-icon>
      <v-badge v-else bordered overlap :content="itemCount.toString()">
        <v-icon @click="openCart">mdi-cart</v-icon>
      </v-badge>
    </v-app-bar>
  </v-card>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Nav',
  methods: {
    ...mapActions('cart', ['setOpenCart']),
    openCart() {
      this.setOpenCart(true)
    },
  },
  computed: {
    ...mapState('cart', ['cart']),
    itemCount() {
      return this.cart.reduce((acc, item) => acc + item.quantity, 0)
    },
  },
}
</script>

<style scoped></style>
