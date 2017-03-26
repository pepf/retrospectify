/**
 * Note component, for each individual note in a board
 */
<template>
  <div class="note" v-bind:class="nClass" v-bind:style="cStyle" v-draggable="onPositionMouseMove"
    @click.stop="" @keyup.46="removeNote">
    <div>
      <textarea v-model="stateContent" v-bind:style="{ fontSize: fontSize + 'em' }"></textarea>
      <button @click="removeNote" class="note-remove">✕</button>
      <div class="note-votes" v-show="votes > 0">
        <transition-group name="flip" tag="span">
          <span class="note-vote" v-for="n in votes" transition="flip" :key="n"></span>
        </transition-group>
      </div>
      <div v-show="nClass.active" class="note-resize-handle" v-draggable="onSizeMouseMove"></div>
    </div>
    <!-- Note sub-menu, only shown when a note is in "edit state" -->
    <div class="menu">
      <button @click.stop="incrFontSize">A+</button>
      <button @click.stop="decFontSize">A-</button>
      <button class="positive" @click.stop="addVote">+</button>
      <button class="negative" @click.stop="removeVote" :disabled="votes<=0">-</button>
      <span>{{votes}}</span>
    </div>
  </div>
</template>

<script>
import bus from '../bus.js'

export default {
  name: 'custom-note',
  // All props that will be synced to our main app state via two-way binding
  // A.k.a the most important data fields per note
  props: {
    'id': {type: Number, required: true},
    'active': {type: Boolean, default: false},
    'order': {type: Number, default: 0},
    'content': String,
    'type': String,
    'position': {
      type: Object,
      default: function () {
        return {x: 0, y: 0}
      }
    },
    'noteSize': Object,
    'fontSize': {type: Number, default: 1},
    'votes': {type: Number, default: 0}
  },

  data: function () {
    return {
      dragging: false,
      stateContent: this.content
    }
  },

  computed: {
    cStyle: function () {
      var style = {}
      if (this.position) {
        style.left = this.position.x + 'px'
        style.top = this.position.y + 'px'
      }
      if (this.noteSize) {
        style.width = this.noteSize.w + 'px'
        style.height = this.noteSize.h + 'px'
      }
      style.zIndex = this.order

      return style
    },
    nClass: function () {
      var output = {}
      output.active = this.active
      output.dragging = this.dragging
      output[this.type] = true
      return output
    }
  },

  methods: {
    removeNote: function () {
      bus.$emit('remove-note', this.id)
    },
    incrFontSize: function (e) {
      var step = 0.5
      var max = 2.5
      var newFontSize = (this.fontSize + step <= max) ? this.fontSize + step : max
      this.$emit('update', this.id, { fontSize: newFontSize })
    },
    decFontSize: function (e) {
      var step = 0.5
      var min = 0.5
      var newFontSize = (this.fontSize - step >= min) ? this.fontSize - step : min
      this.$emit('update', this.id, { fontSize: newFontSize })
    },
    addVote: function (e) {
      this.$emit('update', this.id, {votes: this.votes + 1})
    },
    removeVote: function (e) {
      this.$emit('update', this.id, {votes: this.votes - 1})
    },

    onPositionMouseMove: function (d) {
      if (Math.abs(d.dx) > 0 || Math.abs(d.dy) > 0) {
        this.dragging = true
      } else {
        this.dragging = false
      }

      let newX, newY, position
      newX = this.position.x + d.dx
      newY = this.position.y + d.dy
      position = {x: newX, y: newY}

      this.$emit('update', this.id, { position: position })
    },

    onPositionMouseMoveStart: function () {
      this.$emit('start-drag', this.id)
    },

    onPositionMouseMoveStop: function () {
      this.dragging = false
      this.$emit('stop-drag', this.id)
    },

    onSizeMouseMove: function (d) {
      var newW = this.noteSize.w + d.dx
      var newH = this.noteSize.h + d.dy

      if (newW < 100) { newW = 100 }
      if (newH < 50) { newH = 50 }

      var noteSize = {w: newW, h: newH}
      this.$emit('update', this.id, { noteSize: noteSize })
    }
  },

  watch: {
    /** listen to input field with content, emit event when changed **/
    stateContent: function (newText, oldText) {
      if (newText !== oldText) {
        this.$emit('update', this.id, {text: newText})
      }
    }
  }
}
</script>
