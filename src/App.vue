<template>
  <div id="app">
    <saved-boards :boards="boards" :active-board-index="activeBoardIndex"></saved-boards>
    <div class="board-content">
      <div class="main_menu">
        <span class="heading">Retrospectify<sup>™</sup></span>
        <div class="note_actions">
          <button class="positive" v-on:click="addNote('positive')">Positive note</button>
          <button class="neutral" v-on:click="addNote('neutral')">Neutral note</button>
          <button class="negative" v-on:click="addNote('improvement')">Improvement note</button>
        </div>
        <div class="board_actions">
          <span class="subtle" :class="{'hidden':!unsavedChanges}">There are unsaved changes</span>
          <button v-on:click="saveBoards" :disabled="!unsavedChanges">Save</button>
          <button class="menu-toggle invert" @click.stop="toggleSidebar">☰</button>
        </div>
      </div>
      <p>
        <input class="board-title" v-model="activeBoard.title" />
      </p>
      <div class="notes">
        <div class="empty-state" v-show="!activeBoard.notes.length">this is a very empty screen</div>
        <transition-group name="flip" tag="div">
          <note v-for="note in activeBoard.notes" :key="note.id" :content="note.text"
            :type="note.note_type" :position="note.position" :id="note.id" :note-size="note.noteSize"
            :font-size="note.fontSize" :votes="note.votes" :order="note.order" :active="note.id == activeDrag" @update="updateNote"
            @stop-drag="stopDrag" @start-drag="startDrag">
            </note>
          </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import Note from './components/Note'
import SavedBoards from './components/SavedBoards'
import BoardExport from './boardexport'
import bus from './bus.js'
import moment from 'moment'

export default {
  name: 'app',
  components: {
    SavedBoards,
    Note
  },

  data: function () {
    return {
      activeBoardIndex: 0,
      activeDrag: null,
      unsavedChanges: false,

      boards: []
    }
  },

  computed: {
    activeBoard () {
      return this.boards[this.activeBoardIndex]
    }
  },

  beforeMount () {
    var self = this

    bus.$on('remove-note', function (id) {
      var noteIndex = self.activeBoard.notes.findIndex(function (note) {
        return (id === note.id)
      })
      self.activeBoard.notes.splice(noteIndex, 1)
    })

    bus.$on('load-board', function (id) {
      self.activeBoardIndex = id
    })

    bus.$on('create-board', function () {
      self.boards.push(self.createBoard(false))
      self.activeBoardIndex = self.boards.length - 1
    })

    bus.$on('remove-board', function (id) {
      self.boards.splice(id, 1)
      // Set active board to one less than the removed one
      console.log(id - 1)
      self.activeBoardIndex = id - 1
    })

    bus.$on('clear-board', function () {
      self.activeBoard.notes.splice(0, self.activeBoard.notes.length)
    })

    bus.$on('save-boards', function () {
      self.saveState()
    })
    bus.$on('export-board', () => {
      const board = new BoardExport(this.activeBoard)
      board.save()
    })
  },

  methods: {
    addNote (type) {
      var placeholderText
      var terciary
      switch (type) {
        case 'improvement':
          placeholderText = 'This needs some improvement'
          terciary = 2
          break
        case 'neutral':
          placeholderText = 'Just a remark'
          terciary = 1
          break
        case 'positive':
          placeholderText = 'This went well'
          terciary = 0
          break
      }

      var appWidth = this.$el.offsetWidth
      var typePosition = ((appWidth / 3) * terciary)

      var x = Math.floor((Math.random() * 20) - 10) + typePosition
      var y = Math.floor((Math.random() * 20) - 10)

      // Note default props
      var note = {
        text: placeholderText,
        note_type: type,
        position: {x: x, y: y},
        noteSize: {w: 200, h: 150},
        fontSize: 1,
        votes: 0,
        order: this.getMaxOrder() + 1,
        id: Math.round(Math.random() * 100000)
      }

      this.activeBoard.notes.push(note)
    },

    boardTitle () {
      let today = moment().format('LL')
      return `My retrospective for ${today}`
    },

    getNoteById (id) {
      return this.activeBoard.notes.find(function (note) {
        return id === note.id
      })
    },

    updateNote (id, update) {
      var note = this.getNoteById(id)
      if (note) {
        // The whole board is not "initial" anymore
        if (this.activeBoard.initial) { delete this.activeBoard.initial }

        // Update note properties
        Object.assign(note, update)
      } else {
        throw new Error('Where\'s the note!?')
      }
      return note
    },

    getMaxOrder () {
      return this.activeBoard.notes.reduce(function (prev, value) {
        if (typeof value.order === 'undefined') { return prev }
        return (prev > value.order ? prev : value.order)
      }, 0)
    },

    startDrag (id) {
      var maxOrder = this.getMaxOrder()
      var note = this.getNoteById(id)

      // Set as active
      this.activeDrag = id

      // This note already is the top one, dont add 1
      if (note.order === maxOrder && maxOrder > 0) {
        return
      } else {
        this.updateNote(id, {order: maxOrder + 1})
      }
    },
    stopDrag (id) {
      this.updateNote(id, {active: false})
    },

    saveBoards () {
      bus.$emit('save-boards')
    },

    createBoard (initial) {
      var board = {
        title: this.boardTitle(),
        notes: [],
        initial: initial
      }
      return board
    },

    resetActive () {
      this.activeDrag = null
    },
    toggleSidebar () {
      bus.$emit('toggle-sidebar')
    },

    // Loads recent config from localstorage
    loadState () {
      var storage = window.localStorage

      // Check if there is saved content available
      if (storage.getItem('retrospective-version') !== window.VERSION) {
        this.migrateState()
      }

      var loadedContent = storage.getItem('retrospective-board')
      if (loadedContent) {
        this.boards = JSON.parse(loadedContent)
      }
    },

    // Saves current config to localstorage
    saveState () {
      var storage = window.localStorage
      var content = JSON.stringify(this.boards)
      storage.setItem('retrospective-board', content)
      this.unsavedChanges = false
    },

    migrateState () {
      var storage = window.localStorage

      var i = 0
      // Try to migrate data from older versions
      var oldState = storage.getItem('retrospective-board')

      // Data to migrate
      if (oldState) {
        var data = JSON.parse(oldState)
        data.forEach(function (board) {
          if (!board.notes) return
          board.notes.forEach(function (note) {
            // Check props for each note
            if (!note.id) {
              note.id = i
            }
            i++
          })
        })
        data = JSON.stringify(data)

        // Write updated item back to localStorage
        storage.setItem('retrospective-board', data)
      }

      // If migration succeeds, save version number in localStorage
      storage.setItem('retrospective-version', window.VERSION)
    }
  },

  watch: {
    'boards': {
      handler: function (newVal, oldVal) {
        // check if we're loading the app for the first time
        if (oldVal[0] && !oldVal[0].initial) {
          this.unsavedChanges = true
        }
      },
      deep: true // watch EVERYTHING
    }
  },

  created () {
    this.loadState()
    if (this.boards.length === 0) {
      this.boards.push(this.createBoard(true))
    }
  }
}
</script>

<style src="./assets/styles/common.scss" lang="scss"></style>
