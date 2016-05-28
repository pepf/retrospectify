/**
 * Note component, for each individual note in a board
 */
Note = Vue.extend({

  // All props that will be synced to our main app state via two-way binding
  // A.k.a the most important data fields per note
  props: ['id','content', 'type', 'position', 'fontSize', 'votes'],

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
      tempPosition: {},
      start: { x: 0, y: 0 }
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
        top: this.position.y + "px"
      }
    }
  }

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
    startDrag: function( e ) {
      this.$dispatch("start_drag", this);
      this.nClass.active=true;
      this.start.x = e.pageX;
      this.start.y = e.pageY;
      this.oldPosition = this.position;
      this.$on("global_mousemove", this.onMouseMove);
    },
    onMouseMove: function( e ) {
      var dx = e.pageX - this.start.x,
          dy = e.pageY - this.start.y;

      if (e.buttons != 0 &&
         document.activeElement !== this.$el.querySelector("textarea")) {
        e.preventDefault();

        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          this.nClass.dragging = true;
        } else {
          this.nClass.dragging = false;
        }

        var newX = this.oldPosition.x + dx,
            newY = this.oldPosition.y + dy;
        this.position = {x: newX, y: newY };

        e.stopPropagation();
      }

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
