// register custom components, from global scope
Vue.component('custom-note', Note);
Vue.component('saved-boards', SavedBoards);

var VERSION = 1.0;

// root app
new Vue({
  el: '#app',
  data: {
    activeBoardIndex: 0,
    activeDrag: null,
    unsavedChanges: false,

    boards: [ {
      title: "My retrospective for <date>",
      notes: [],
      initial: true,
    } ]
  },
  computed: {
    activeBoard: function() {
      if (!Array.isArray(this.boards)) {
        return this.createBoard();
      }
      return this.boards[this.activeBoardIndex];
    }
  },

  beforeMount: function() {
    var self = this;

    bus.$on('remove-note', function(id) {
      var noteIndex = self.activeBoard.notes.findIndex( function(note) {
        return (id === note.id);
      });
      self.activeBoard.notes.splice( noteIndex, 1 );
    });

    bus.$on('load-board', function(id) {
      self.activeBoardIndex = id;
    });

    bus.$on('create-board', function(id) {
      self.boards.push(self.createBoard());
      self.activeBoardIndex = self.boards.length -1;
    });

    bus.$on('remove-board', function(id) {
      self.boards.splice(id, 1 );
      //Set active board to one less than the removed one
      self.activeBoardIndex = id-1;
    });

    bus.$on('clear-board', function() {
      self.activeBoard.notes.splice(0, self.activeBoard.notes.length);
    });

    bus.$on('save-boards', function() {
      self.saveState();
    });
  },

  methods: {
    addNote: function (type) {
      var placeholderText;
      var terciary;
      switch (type) {
        case "improvement":
          placeholderText = "This needs some improvement";
          terciary = 2;
        break;
        case "neutral":
          placeholderText = "Just a remark";
          terciary = 1;
        break;
        case "positive":
          placeholderText = "This went well";
          terciary = 0;
        break;
      }

      var appWidth = this.$el.offsetWidth;
      var typePosition = ((appWidth / 3 ) * terciary);

      var x = Math.floor( (Math.random() * 20 ) -10 ) + typePosition,
          y = Math.floor( (Math.random() * 20 ) -10 );

      // Note default props
      var note = {
        text: placeholderText,
        note_type: type,
        position: {x:x, y:y},
        noteSize: {w: 200, h:150},
        fontSize: 1,
        votes: 0,
        order: 0,
        id: Math.round(Math.random()*100000)
      };

      this.activeBoard.notes.push(note)
    },

    getNoteById: function(id) {
      return this.activeBoard.notes.find( function(note) {
        return id === note.id;
      });
    },

    updateNote: function(id, update) {
      var note = this.getNoteById(id);
      if (note) {

        // The whole board is not "initial" anymore
        if (this.activeBoard.initial) { delete this.activeBoard.initial; }

        // Update note properties
        Object.assign(note, update);
      } else {
        throw "Where's the note!?";
      }
      return note;
    },

    startDrag: function(id) {
      var maxOrder = this.activeBoard.notes.reduce( function(prev, value) {
        if (typeof value.order === "undefined" ) { return prev; }
        return ( prev > value.order ? prev : value.order );
      }, 0);
      var note = this.getNoteById(id);

      // Set as active
      this.activeDrag = id;

      // This note already is the top one, dont add 1
      if (note.order === maxOrder && maxOrder > 0) {
        return;
      } else {
        this.updateNote(id, {order: maxOrder + 1 });
      }

    },
    stopDrag: function(id) {
      this.updateNote(id, {active: false });
    },

    saveBoards: function() {
      bus.$emit('save-boards');
    },

    createBoard: function() {
      var board = {
        title: "New board",
        notes: []
      };
      return board;
    },
    resetActive: function() {
      this.activeDrag = null;
    },
    toggleSidebar: function() {
      bus.$emit('toggle-sidebar');
    },

    // Loads recent config from localstorage
    loadState: function() {
      var storage = window.localStorage;

      //Check if there is saved content available
      if (storage.getItem('retrospective-version') !== VERSION) {
        this.migrateState();
      }

      var loadedContent = storage.getItem('retrospective-board');
      if ( loadedContent ) {
        this.boards = JSON.parse(loadedContent);
      }
    },

    // Saves current config to localstorage
    saveState: function() {
      var storage = window.localStorage;
      var content = JSON.stringify( this.boards );
      storage.setItem('retrospective-board', content);
      this.unsavedChanges = false;
    },

    migrateState: function() {
      var storage = window.localStorage;

      var i = 0;
      // Try to migrate data from older versions
      var oldState = storage.getItem('retrospective-board');

      // Data to migrate
      if (oldState)  {
        var data = JSON.parse(oldState);
        data.forEach( function( board ) {
          if (!board.notes) return;
          board.notes.forEach( function( note ) {
            // Check props for each note
            if (!note.id) {
              note.id = i;
            }
            i++;
          });
        });
        data = JSON.stringify( data );

        //Write updated item back to localStorage
        storage.setItem('retrospective-board', data);
      }

      // If migration succeeds, save version number in localStorage
      storage.setItem("retrospective-version", VERSION);
    }
  },

  watch: {
    'boards': {
      handler: function (newVal, oldVal) {
        //check if we're loading the app for the first time
        if (!oldVal[0].initial) {
          this.unsavedChanges = true;
        }
      },
      deep: true //watch EVERYTHING
    }
  },

  created: function() {
    this.loadState();
  }
})
