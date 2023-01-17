<template>
  <div>
    <div>shop: {{ shop }}</div>
    <div>user: {{ user }}</div>
    <div class="d-flex align-center">
      <v-text-field
        label="Token"
        placeholder="Access token"
        v-model="token"
        class="pr-10"
      ></v-text-field>
      <v-btn color="primary" @click="onUpdateToken"> Update token</v-btn>
    </div>

    <div class="d-flex align-center my-4">
      <v-text-field
        type="text"
        placeholder="Link shopee"
        class="pr-10"
        v-model="link"
      />
      <v-btn color="primary" @click="onGetLink">Get</v-btn>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { getToken, setToken } from '@/api/shopee'

export default {
  name: 'Setting',
  data() {
    return {
      token: '',
      link: '',
    }
  },
  methods: {
    ...mapActions(['setShopId', 'setUserId', 'getShopFromUrl']),
    onGetLink() {
      this.getShopFromUrl(this.resolvedLink)
    },
    onUpdateToken() {
      setToken(this.token)
    },
  },
  computed: {
    ...mapState(['shop', 'user']),
    resolvedLink() {
      const r = /https:\/\/[a-z-A-z.\-\d]+\/(.+)/.exec(this.link)
      return r ? r[1] : ''
    },
  },
  created() {
    this.token = getToken()
  },
}
</script>

<style scoped></style>
