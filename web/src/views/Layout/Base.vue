<template>
  <v-app>
    <v-main>
      <Carts />
      <v-container class="lighten-5 grey mt-16" fluid>
        <Nav />
        <router-view />
      </v-container>
    </v-main>

    <main-footer />
  </v-app>
</template>

<script>
import MainFooter from '@/components/MainFooter.vue'
import Carts from '@/components/Carts.vue'
import Nav from '@/components/Nav.vue'

export default {
  name: 'Base',
  components: {
    Nav,
    Carts,
    MainFooter,
  },
}
</script>
