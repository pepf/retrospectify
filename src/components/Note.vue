/**
 * Note component, for each individual note in a board
 */
<template>
  <transition name="flip" appear>
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
  </transition>
</template>

<script>
import bus from '../bus.js'

export default {
  name: 'custom-note',

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
    cStyle () {
      var style = {}
      if (this.position) {
        style.left = `${this.position.x}px`
        style.top = `${this.position.y}px`
      }
      if (this.noteSize) {
        style.width = `${this.noteSize.w}px`
        style.height = `${this.noteSize.h}px`
      }
      style.zIndex = this.order

      return style
    },
    nClass () {
      var output = {}
      output.active = this.active
      output.dragging = this.dragging
      output[this.type] = true
      return output
    }
  },

  methods: {
    removeNote () {
      bus.$emit('remove-note', this.id)
    },
    incrFontSize (e) {
      var step = 0.5
      var max = 2.5
      var newFontSize = (this.fontSize + step <= max) ? this.fontSize + step : max
      this.$emit('update', this.id, { fontSize: newFontSize })
    },
    decFontSize (e) {
      var step = 0.5
      var min = 0.5
      var newFontSize = (this.fontSize - step >= min) ? this.fontSize - step : min
      this.$emit('update', this.id, { fontSize: newFontSize })
    },
    addVote (e) {
      this.$emit('update', this.id, {votes: this.votes + 1})
    },
    removeVote (e) {
      this.$emit('update', this.id, {votes: this.votes - 1})
    },

    onPositionMouseMove (d) {
      if (Math.abs(d.dx) > 0 || Math.abs(d.dy) > 0) {
        this.dragging = true
      } else {
        this.dragging = false
        return
      }

      let newX, newY, position
      newX = this.position.x + d.dx
      newY = this.position.y + d.dy
      position = {x: newX, y: newY}

      this.$emit('update', this.id, { position: position })
    },

    onPositionMouseMoveStart () {
      this.$emit('start-drag', this.id)
    },

    onPositionMouseMoveStop () {
      this.dragging = false
      this.$emit('stop-drag', this.id)
    },

    onSizeMouseMove (d) {
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
    stateContent (newText, oldText) {
      if (newText !== oldText) {
        this.$emit('update', this.id, {text: newText})
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './src/assets/styles/variables.scss';

.note {
  background-color: $white;
  position: absolute;
  border-radius: 3px;
  border: none;
  border-bottom: 1px solid $grey;
  box-shadow: 0px 0px 5px $shadow;
  transition: box-shadow 0.5s, transform 0.25s;
  cursor: -webkit-grab;

  div {
    overflow: hidden;
    height:100%;
  }
  &.improvement {
    background-color: $red;
  }
  &.neutral {
    background-color: $neutral-grey;
  }
  &.positive {
    background-color: $green;
  }
  &.dragging {
    box-shadow: 0px 0px 20px $shadow;
    transform: scale(1.05);
    cursor: -webkit-grabbing;
  }
  &.active {
    box-shadow: 0px 0px 20px $blue;
  }

  textarea {
    width:100%;
    height:100%;
    border: none;
    margin-top: 15px;
    font-size:1em;
    padding:5px;
    background-color:transparent;
  }
  button.note-remove {
    position:absolute;
    top: 0;
    right: 0;
    border: none;
    background-color: transparent;
    font-size:1.5em;
    cursor:pointer;
    font-size: 1em;
    box-shadow: none;
  }

  .note-votes {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 5px;
      height: auto;
  }

  .note-vote {
      width: 1em;
      height: 1em;
      border-radius: 100%;
      background-color: $ocean;
      display: inline-block;
      margin-right: 0.5em;
  }

  .note-resize-handle {
    position: absolute;
    bottom: 0;
    right:  0;
    width:  20px;
    height: 20px;
    cursor: se-resize;
    background-color: rgba(0,0,0,0.1);
  }

  .menu {
    display:none;
  }
  &.active .menu {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: absolute;
    background-color: $neutral-grey;
    border: 1px solid $grey;
    bottom: -47px;
    height: 47px;
    padding: 0.5em;
    border-radius: 2px;
  }
}

@media screen and (max-width: 768px) {
  .note {
    position: static;
    height: auto !important;
    width: 100% !important;
    margin: 0.5em 0;

    .note-votes {
      position: static;
      margin: 0.5em;
    }
    button.note-remove {
      display: none;
    }
    &:last-child {
      margin-bottom: 3em;
    }
    textarea {
      resize: none;
    }

    &.active {
      border: 1px solid $blue;
      .menu {
        position: fixed;
        left:0;
        right: 0;
        bottom: 0;
      }
    }
  }

}



</style>
