/**
 * Note component, for each individual note in a board
 */
Note = Vue.extend({

  // All props that will be synced to our main app state via two-way binding
  // A.k.a the most important data fields per note
  props: ['id','content', 'type', 'position', 'noteSize', 'fontSize', 'votes'],

  data: function() {
    return {
      nClass: {
        active: false,
        dragging: false,
        neutral: false,
        positive: false,
        improvement: false
      },

      // Dragging data
      oldPosition: {},
      oldSize: {},
      start: { x: 0, y: 0 },

      // Defaults
      // noteSize: {w: 200, h:150}
    };
  },

  template: '#custom-note-template',

  events: {
    'reset-active' : function() {
      this.nClass.active=false;
    }
  },

  computed: {
    cStyle: function() {
      return {
        left: this.position.x + "px",
        top: this.position.y + "px",
        width: this.noteSize.w + 'px',
        height: this.noteSize.h + 'px'
      }
    }
  },

  methods: {
    removeNote: function () {
      this.$dispatch('remove', this["id"] );
    },
    incrFontSize: function() {
      var step = 0.5, max = 2.5;
      this.fontSize = (this.fontSize + step <= max) ? this.fontSize + step : max;

    },
    decFontSize: function() {
      var step = 0.5, min = 0.5;
      this.fontSize = (this.fontSize - step >= min) ? this.fontSize - step : min;
    },
    addVote: function() {
      this.votes++;
    },
    removeVote: function() {
      this.votes--;
    },

    setActive: function( e ) {
      this.nClass.active = true;
    },

    onPositionMouseMove: function ( d ) {

      if (Math.abs(d.dx) > 0 || Math.abs(d.dy) > 0) {
        this.nClass.dragging = true;
      } else {
        this.nClass.dragging = false;
      }

      var newX = this.position.x + d.dx,
          newY = this.position.y + d.dy;

      this.position = {x: newX, y: newY };
    },

    onSizeMouseMove: function ( d ) {

      var newW = this.noteSize.w + d.dx,
          newH = this.noteSize.h + d.dy;

      if(newW < 100) { newW = 100; }
      if(newH < 50) {  newH = 50; }

      this.noteSize = {w: newW, h: newH};

    },
  },

  ready: function() {
    this.$nextTick(function () {
      this.nClass[this.type] = true;
    });
  }
})
