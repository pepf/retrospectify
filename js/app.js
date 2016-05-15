// register custom components, from global scope
Vue.component('custom-note', Note);
Vue.component('saved-boards', SavedBoards);


// root app
new Vue({
  el: '#app',
  data: {
    activeDrag: null,
    activeBoardIndex: 0,
    boards: [ {
      title: "My retrospective for <date>",
      notes: []
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
  events: {
    'remove' : function( id ) {
      this.activeBoard.notes.splice( id, 1 );
    },
    'start_drag': function(child) {
      //Reset the currently selected note
      this.resetActive();

      this.activeDrag = child;

      //move an active note visually to the top
      var activeNote = this.activeBoard.notes.splice( child.id, 1 );
      this.activeBoard.notes.push(activeNote[0]);
    },
    'stop_drag': function(child) {
      this.activeDrag = null;
    },
    'load-board' : function( id ) {
      this.activeBoardIndex = id;
    },
    'create-board' : function() {
      this.boards.push(this.createBoard());
      this.activeBoardIndex = this.boards.length-1;
    }
  },
  methods: {
    addNote: function (type) {
      var placeholderText;

      switch (type) {
        case "improvement": placeholderText = "This needs some improvement";
        break;
        case "neutral": placeholderText = "Just a remark";
        break;
        case "positive": placeholderText = "This went well";
        break;
      }

      var x = Math.floor( (Math.random() * 20 ) -10 ),
          y = Math.floor( (Math.random() * 20 ) -10 );

      var note = {
        text: placeholderText,
        note_type: type,
        position: {x:x, y:y}
      };

      this.activeBoard.notes.push(note)
    },
    createBoard: function() {
      var board = {
        title: "New board",
        notes: []
      };
      return board;
    },
    onMouseMove: function(e) {
      if (this.activeDrag) {
        this.activeDrag.$emit("global_mousemove", e);
      }
    },
    clear: function() {
      this.activeBoard.notes.splice(0, this.activeBoard.notes.length);
    },
    resetActive: function() {
      this.$broadcast('reset-active');
    },
    toggleSidebar: function() {
      this.$broadcast('toggle-sidebar');
    },

    // Loads recent config from localstorage
    loadState: function() {
      var storage = window.localStorage;

      //Check if there is saved content available
      var loadedContent = storage.getItem('retrospective-board');
      if ( loadedContent ) {
        this.boards = JSON.parse(loadedContent);
      }
    },

    // Saves current config to localstorage
    saveState: function( e ) {
      e.currentTarget.disabled = true;

      var storage = window.localStorage;
      var content = JSON.stringify( this.boards );
      storage.setItem('retrospective-board', content);

      e.currentTarget.disabled = false;
    }
  },

  created: function() {
    this.loadState();
  }
})
