<template>
  <div>
    <h1>{{ msg }}</h1>

    <p>
      <a
        href="https://vitejs.dev/guide/features.html"
        target="_blank"
      >Vite Documentation</a> |
      <a
        href="https://vuejs.org/v2/guide/"
        target="_blank"
      >Vue 2 Documentation</a>
    </p>

    <v-btn @click="count++" color="primary">
      <v-icon>favorite</v-icon>
      <span>count is: {{ count }}</span>
      </v-btn>
  </div>
</template>

<script>

export default {
  props: {
    msg: String,
  },

  data() {
    return {
      count: 0,
    };
  },
  created() {
    console.log('HelloWorld created', this.$store.state);
  },
};
</script>

<style scoped>
a {
  color: #42b983;
}
</style>
