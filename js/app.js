// define new note component
var Note = Vue.extend({
  props: ['id','content', 'type', 'position'], //text
  data: function() {
    return {
      nClass: {
        active: false,
        editing: false,
        neutral: false,
        positive: false,
        improvement: false
      },
      nStyle: {
        left: ""
      },
      oldPosition: {},
      tempPosition: {},
      dragging: false,
      start: { x: 0, y: 0 }
    };
  },
  template: '#custom-note-template',

  methods: {
    removeNote: function () {
      this.$dispatch('remove', this["id"] );
    },
    startDrag: function( e ) {
      if ( this.nClass.editing ) {
        return;
      }
      this.nClass.active=true;
      this.dragging = true;
      this.start.x = e.pageX;
      this.start.y = e.pageY;
      this.oldPosition = this.position;
      this.$dispatch("start_drag", this);
      this.$on("global_mousemove", this.onMouseMove);
    },
    onMouseMove: function( e ) {
      var dx = e.pageX - this.start.x,
          dy = e.pageY - this.start.y;
      if (this.dragging && e.buttons != 0 &&
         document.activeElement !== this.$el.querySelector("textarea")) {
        e.preventDefault();

        var newX = this.oldPosition.x + dx,
            newY = this.oldPosition.y + dy;
        this.nStyle.left = newX + "px";
        this.nStyle.top = newY + "px";
        this.position = {x: newX, y: newY };

      }
    },
    stopDrag: function( e ) {
      if( e.pageX - this.start.x === 0 &&
          e.pageY - this.start.y === 0 ) {
          this.$el.querySelector("textarea").focus();
          this.nClass.editing = true;
      }
      this.dragging = false;
      this.nClass.active = false;
      this.$dispatch("stop_drag", this);
      this.$off("global_mousemove");
    },
    stopEdit: function( e ) {
      this.$el.querySelector("textarea").blur();
      this.nClass.editing = false;
    }
  },

  ready: function() {
    this.$nextTick(function () {
      this.nStyle.left = this.position.x + "px";
      this.nStyle.top = this.position.y + "px";
      this.nClass[this.type] = true;
    });
  }
})

// Sidebar with saved boards
var SavedBoards = Vue.extend({
  props: ['boards','activeBoardIndex'],
  data: function() { return {
      expanded: false,
  } },
  template: '#saved-boards',
  events: {
    'toggle-sidebar': function(e) {
      this.toggle();
    }
  },
  methods: {
    loadBoard: function (id ) {
      this.$dispatch('load-board', id);
    },
    createBoard: function () {
      this.$dispatch('create-board');
    },
    toggle: function() {
      this.expanded = !this.expanded;
    }
  }
});

// register custom component
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
      return this.boards[this.activeBoardIndex];
    }
  },
  events: {
    'remove' : function( id ) {
      this.activeBoard.notes.splice( id, 1 );
    },
    'start_drag': function(child) {
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
      var board = {
        title: "New board",
        notes: []
      };
      this.boards.push(board);
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
    onMouseMove: function(e) {
      if (this.activeDrag) {
        this.activeDrag.$emit("global_mousemove", e);
      }
    },
    clear: function() {
      this.activeBoard.notes.splice(0, this.activeBoard.notes.length);
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
