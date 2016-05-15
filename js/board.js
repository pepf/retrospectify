/**
 * Component for the sidebar with the saved boards
 */
SavedBoards = Vue.extend({

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
