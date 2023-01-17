import Vue from 'vue'
import Vuetify from 'vuetify/lib/framework'
import en from 'vuetify/es5/locale/en'
import '../assets/styles/material-icons.css'

Vue.use(Vuetify)

export default new Vuetify({
  lang: {
    locales: { en },
    current: 'en',
  },
  icons: {
    iconfont: 'md',
  },
})
