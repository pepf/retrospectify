/**
 * Component for the sidebar with the saved boards
 */
SavedBoards = Vue.extend({

  props: ['boards','activeBoardIndex'],

  data: function() { return {bo
      expanded: false,
  } },

  template: '#saved-boards',

  events: {
    'toggle-sidebar': function(e) {
      this.toggle();
    }
  },
  methods: {
    loadBoard: function ( id ) {
      this.$dispatch('load-board', id);
    },
    createBoard: function ( id ) {
      this.$dispatch('create-board', id);
    },
    removeBoard: function ( id ) {
      this.$dispatch('remove-board', id);
    },
    toggle: function() {
      this.expanded = !this.expanded;
    }
  }
});
