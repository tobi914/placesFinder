<template>
  <div id="app">
    <gMap name="test"></gMap>
  </div>
</template>

<script>

import gMap from './components/gMap.vue'

export default {
    name: 'App',
    components:{
      'gMap': gMap
    }
}
</script>

<style>
#app {
  padding-top: 0px;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
