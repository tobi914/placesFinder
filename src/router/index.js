import Vue from 'vue'
import Router from 'vue-router'
import gMap from '../components/gMap.vue'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'gMap',
      component: gMap
    }
  ]
})
