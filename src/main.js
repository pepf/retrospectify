import Vue from 'vue'
import App from './App'

import VueDraggable from './directives/draggable'
Vue.config.productionTip = false
Vue.directive('draggable', VueDraggable)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
