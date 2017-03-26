// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

import VueDraggable from './directives/draggable'
Vue.config.productionTip = false

Vue.directive('draggable', VueDraggable)

window.VERSION = 1.0

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
