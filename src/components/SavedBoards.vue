<template>
  <div class="sidebar-component">
    <transition name="slide">
      <div class="sidebar" v-show="expanded">
        <p class="sidebar-menu">
          <button class="invert" v-on:click="saveBoards">Save</button>
          <button class="invert small" v-on:click="clearBoard">Clear the board</button>
        </p>
        <h2>Saved boards</h2>
        <ul>
          <li v-for="(board, index) in boards" @click="loadBoard(index)" v-bind:class="{ 'active' : (activeBoardIndex == index)}">
            {{ board.title }}
            <span class="remove-board" title="remove" @click="removeBoard(index)" v-show="boards.length > 1">✕</span>
          </li>
        </ul>
        <button @click="createBoard">+ New</button>
        <div class="about">
          Retrospectify V{{ version }}
        </div>
      </div>
    </transition>
    <div class="sidebar-overlay" @click="toggle" v-show="expanded"></div>
  </div>
</template>

<script>
import bus from '../bus.js'

export default {
  name: 'saved-boards',
  props: ['boards', 'activeBoardIndex'],

  data: function () {
    return {
      expanded: false,
      version: window.VERSION
    }
  },

  template: '#saved-boards',

  created: function () {
    var self = this
    bus.$on('toggle-sidebar', function (e) {
      self.toggle()
    })
  },
  methods: {
    loadBoard: function (id) {
      bus.$emit('load-board', id)
    },
    createBoard: function (id) {
      bus.$emit('create-board', id)
    },
    removeBoard: function (id) {
      bus.$emit('remove-board', id)
    },
    clearBoard: function () {
      bus.$emit('clear-board')
    },
    saveBoards: function () {
      bus.$emit('save-boards')
    },
    toggle: function () {
      this.expanded = !this.expanded
    }
  }
}
</script>
