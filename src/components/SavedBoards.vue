<template>
  <div class="sidebar-component">
    <transition name="slide">
      <div class="sidebar" v-show="expanded">
        <p class="sidebar-menu">
          <button class="invert" v-on:click="saveBoards" title="Save board for later editing">Save</button>
          <button class="invert" v-on:click="exportBoard(activeBoardIndex)" title="Export board contents to file">Export</button>
          <button class="invert small" v-on:click="clearBoard">Clear the board</button>
        </p>
        <h2>Saved boards</h2>
        <ul>
          <li v-for="(board, index) in boards" :key="index"
            @click="loadBoard(index)"
            :class="{ 'active' : (activeBoardIndex == index)}">
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
      version: VERSION
    }
  },

  created () {
    var self = this
    bus.$on('toggle-sidebar', function () {
      self.toggle()
    })
  },
  methods: {
    loadBoard (id) {
      bus.$emit('load-board', id)
    },
    createBoard () {
      bus.$emit('create-board')
    },
    removeBoard (id) {
      bus.$emit('remove-board', id)
    },
    clearBoard () {
      bus.$emit('clear-board')
    },
    saveBoards () {
      bus.$emit('save-boards')
    },
    exportBoard (id) {
      bus.$emit('export-board', id)
    },
    toggle () {
      this.expanded = !this.expanded
    }
  }
}
</script>

<style lang="scss" scoped>
@import './src/assets/styles/variables.scss';

/* sidebar component styles */
$sidebar-bg: $denim;

.sidebar {
    top: 0;
    bottom: 0;
    position: absolute;
    width: 300px;
    background-color: $sidebar-bg;
    color: $white;
    right: 0;
    padding: 1em;
    z-index: 2000;

  .sidebar-menu {
    clear:both;
    display:block;
    height: 2em;
  }
  .sidebar-menu > * {
    float:right;
  }

  ul {
      list-style: none;
      padding: 0;
  }
  li {
    cursor: pointer;
    padding: 1em;

  }
  li:hover {
    background-color: darken($sidebar-bg, 5%);
  }
  li.active {
    background-color: lighten($sidebar-bg, 5%);
  }

  .remove-board {
    float: right;
    opacity: 0.75;
    cursor: pointer;
  }
  .remove-board:hover {
    opacity: 1.0;
  }

  .about {
    position: absolute;
    bottom: 0;
    font-size: 0.6em;
    padding: 1em;
    right: 0;
  }
}

.sidebar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
}

.slide-enter-active,
.slide-leave-active {
  transition: right 0.25s  cubic-bezier(0.215, 0.610, 0.355, 1.000); //ease out cubic
}
.slide-enter, .slide-leave-to {
  right: -300px;
}
</style>
