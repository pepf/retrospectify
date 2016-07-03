/**
 * Note component, for each individual note in a board
 */
Note = Vue.extend({

  // All props that will be synced to our main app state via two-way binding
  // A.k.a the most important data fields per note
  props: {
    'id': {type:Number, required:true},
    'active': {type: Boolean, default: false},
    'order': {type:Number, default: 0},
    'content': String,
    'type' : String,
    'position': {
      type: Object,
      default:function() {
        return {x:0, y:0}
      }
    },
    'noteSize': Object,
    'fontSize': {type:Number, default: 1},
    'votes': {type:Number, default: 0}
  },

  data: function() {
    return {
      dragging: false,
      stateContent: this.content
    };
  },

  template: '#custom-note-template',

  computed: {
    cStyle: function() {
      var style = {};
      if (this.position) {
        style.left = this.position.x + "px";
        style.top = this.position.y + "px";
      }
      if (this.noteSize) {
        style.width = this.noteSize.w + "px";
        style.height = this.noteSize.h + "px";
      }
      style.zIndex = this.order;

      return style;
    },
    nClass: function() {
      var output =  {};
      output.active = this.active;
      output.dragging = this.dragging;
      output[this.type] = true;
      return output;
    }
  },

  methods: {
    removeNote: function () {
      bus.$emit('remove-note', this.id );
    },
    incrFontSize: function(e) {
      var step = 0.5, max = 2.5;
      var newFontSize = (this.fontSize + step <= max) ? this.fontSize + step : max;
      this.$emit('update', this.id, {fontSize: newFontSize });

    },
    decFontSize: function(e) {
      var step = 0.5, min = 0.5;
      var newFontSize = (this.fontSize - step >= min) ? this.fontSize - step : min;
      this.$emit('update', this.id, {fontSize: newFontSize });
    },
    addVote: function(e) {
      this.$emit('update', this.id, {votes: this.votes+1});
    },
    removeVote: function(e) {
      this.$emit('update', this.id, {votes: this.votes-1});
    },

    onPositionMouseMove: function ( d ) {

      if (Math.abs(d.dx) > 0 || Math.abs(d.dy) > 0) {
        this.dragging = true;
      } else {
        this.dragging = false;
      }

      var newX = this.position.x + d.dx,
          newY = this.position.y + d.dy,
          position = {x: newX, y: newY};

      this.$emit('update', this.id, { position : position });
    },

    onPositionMouseMoveStart: function() {
      this.$emit('start-drag', this.id);
    },

    onPositionMouseMoveStop: function() {
      this.dragging = false;
      this.$emit('stop-drag', this.id);
    },

    onSizeMouseMove: function ( d ) {

      var newW = this.noteSize.w + d.dx,
          newH = this.noteSize.h + d.dy;

      if(newW < 100) { newW = 100; }
      if(newH < 50) {  newH = 50; }

      var noteSize = {w: newW, h: newH};
      this.$emit('update', this.id, { noteSize : noteSize });
    }
  },

  watch: {
    /** listen to input field with content, emit event when changed **/
    stateContent: function(newText, oldText) {
      if (newText !== oldText) {
        this.$emit('update', this.id, {text: newText})
      }
    }
  }
})
