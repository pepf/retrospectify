/**
 * Component for the sidebar with the saved boards
 */
SavedBoards = Vue.extend({

  props: ['boards','activeBoardIndex'],

  data: function() { return {
      expanded: false,
      version: VERSION
  } },

  template: '#saved-boards',

  created: function() {
    var self = this;
    bus.$on('toggle-sidebar', function(e) {
      self.toggle();
    });
  },
  methods: {
    loadBoard: function ( id ) {
      bus.$emit('load-board', id);
    },
    createBoard: function ( id ) {
      bus.$emit('create-board', id);
    },
    removeBoard: function ( id ) {
      bus.$emit('remove-board', id);
    },
    clearBoard: function() {
      bus.$emit('clear-board');
    },
    saveBoards: function() {
      bus.$emit('save-boards');
    },
    toggle: function() {
      this.expanded = !this.expanded;
    }
  }
});
