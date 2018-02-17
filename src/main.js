import Vue from 'vue'
import App from './App'

import VueDraggable from './directives/draggable'
Vue.config.productionTip = false
Vue.directive('draggable', VueDraggable)

import {version} from '../package.json'
window.VERSION = version

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
})
