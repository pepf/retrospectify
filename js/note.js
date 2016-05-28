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
    startDrag: function( e, attribute ) {
      this.$dispatch("start_drag", this);
      this.nClass.active=true;
      this.start.x = e.pageX;
      this.start.y = e.pageY;
      if (attribute === "position") {
        this.oldPosition = this.position;
        this.$on("global_mousemove", this.onPositionMouseMove);
      } else if (attribute === "size") {
        this.oldSize = this.noteSize;
        this.$on("global_mousemove", this.onSizeMouseMove);
      }
    },

    onPositionMouseMove: function ( e ) {
      var pos = this.onMouseMove(e),
          dx = pos[0], dy = pos[1];

      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        this.nClass.dragging = true;
      } else {
        this.nClass.dragging = false;
      }

      var newX = this.oldPosition.x + dx,
          newY = this.oldPosition.y + dy;
      this.position = {x: newX, y: newY };
    },

    onSizeMouseMove: function ( e ) {
      var pos = this.onMouseMove(e),
          dx = pos[0], dy = pos[1];

      var newW = this.oldSize.w + dx,
          newH = this.oldSize.h + dy;

      if(newW < 100) { newW = 100; }
      if(newH < 50) {  newH = 50; }

      this.noteSize = {w: newW, h: newH};

    },

    //common onmousemove handler for click and drag events
    onMouseMove: function( e ) {
      var dx = e.pageX - this.start.x,
          dy = e.pageY - this.start.y;

      if (e.buttons != 0 &&
         document.activeElement !== this.$el.querySelector("textarea")) {
        e.preventDefault();
        e.stopPropagation();
        return [dx, dy];

      }

      return false;
    },
    stopDrag: function( e ) {
      if( e.pageX - this.start.x === 0 &&
          e.pageY - this.start.y === 0 ) {
          this.$el.querySelector("textarea").focus();
          this.nClass.active = true;
      }
      this.nClass.dragging = false;
      this.$dispatch("stop_drag", this);
      this.$off("global_mousemove");
    }
  },

  ready: function() {
    this.$nextTick(function () {
      this.nClass[this.type] = true;
    });
  }
})
