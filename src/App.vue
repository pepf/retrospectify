<template>
  <div id="app" @click="resetActive()">
    <saved-boards :boards="boards" :active-board-index="activeBoardIndex"></saved-boards>
    <div class="board-content">
      <div class="main_menu">
        <span class="heading">Retrospectify<sup>™</sup></span>
        <div class="note_actions">
          <button class="positive" @click="$refs.board.addNote('positive')">Positive note</button>
          <button class="neutral" @click="$refs.board.addNote('neutral')">Neutral note</button>
          <button class="negative" @click="$refs.board.addNote('improvement')">Improvement note</button>

          <button @click="$refs.board.reArrange()" title="Rearranges the notes by amount of votes and make them fit the current window">
            Re-arrange <sup class="beta">BETA</sup>
          </button>
        </div>
        <div class="board_actions">
          <span class="subtle" :class="{'hidden':!unsavedChanges}">There are unsaved changes</span>
          <button v-on:click="saveBoards" :disabled="!unsavedChanges">Save</button>
          <button class="menu-toggle invert" @click.stop="toggleSidebar">☰</button>
        </div>
      </div>

      <board ref="board" :board="activeBoard" v-if="activeBoard" />
    </div>
  </div>
</template>

<script>
import Board from './components/Board'
import SavedBoards from './components/SavedBoards'
import BoardExport from './boardexport'
import bus from './bus.js'
import moment from 'moment'

export default {
  name: 'app',
  components: {
    Board,
    SavedBoards
  },

  data: function () {
    return {
      activeBoardIndex: 0,
      unsavedChanges: false,
      boards: []
    }
  },

  computed: {
    activeBoard () {
      return this.boards[this.activeBoardIndex] || false
    }
  },

  beforeMount () {
    var self = this

    bus.$on('remove-note', id => {
      var noteIndex = self.activeBoard.notes.findIndex( note => {
        return (id === note.id)
      })
      self.activeBoard.notes.splice(noteIndex, 1)
    })

    bus.$on('load-board', id => {
      self.activeBoardIndex = id
    })

    bus.$on('create-board', () => {
      self.boards.push(self.createBoard(false))
      self.activeBoardIndex = self.boards.length - 1
    })

    bus.$on('remove-board', id => {
      const last = self.boards.length - 1
      if (self.activeBoardIndex === last && id === last) {
        self.activeBoardIndex--
      }
      self.boards.splice(id, 1)
    })

    bus.$on('clear-board', () => {
      self.activeBoard.notes.splice(0, self.activeBoard.notes.length)
    })

    bus.$on('save-boards', () => {
      self.saveState()
    })
    bus.$on('export-board', () => {
      const board = new BoardExport(this.activeBoard)
      board.save()
    })
  },

  methods: {
    resetActive () {
      bus.$emit('reset-active')
    },

    boardTitle () {
      let today = moment().format('LL')
      return `My retrospective for ${today}`
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

    toggleSidebar () {
      bus.$emit('toggle-sidebar')
    },

    // Loads recent config from localstorage
    loadState () {
      var storage = window.localStorage

      // Check if there is saved content available
      if (storage.getItem('retrospective-version') !== VERSION) {
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
        data.forEach(board => {
          if (!board.notes) return
          board.notes.forEach(note => {
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
      storage.setItem('retrospective-version', VERSION)
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
