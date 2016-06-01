/**
 * A start for a draggable directive, making it easier to respond to drag
 * events in Vue
 */

Vue.directive('draggable', {
  isFn: true,
  acceptStatement: true,

  start: {x: 0, y:0},

  bind: function () {
    // do preparation work
    // e.g. add event listeners or expensive stuff
    // that needs to be run only once
    this.onMouseMove = this.MouseMove.bind(this);
    this.onMouseDown = this.MouseDown.bind(this);
    this.onMouseUp   = this.MouseUp.bind(this);

    this.el.addEventListener('mousedown', this.onMouseDown);
    this.el.addEventListener('mouseup', this.onMouseUp);

  },
  update: function (fn) {
    // do something based on the updated value
    // this will also be called for the initial value
    // console.log("set event handler to:");

    if (typeof fn === "function") {
      this.callback = fn;
    } else {
      console.warn("Callback should be a function!");
    }
  },

  unbind: function () {
    // do clean up work
    // e.g. remove event listeners added in bind()
    this.el.removeEventListener("mousedown", this.onMouseDown);
    this.el.removeEventListener("mouseup",   this.onMouseUp);
    window.removeEventListener("mousemove",  this.onMouseMove);
  },

  MouseMove: function ( e ) {
    var dx = e.pageX - this.start.x,
        dy = e.pageY - this.start.y,
        data = {dx: dx, dy: dy};

    //only dispatch relative data for now
    if(this.prev) {
      data.dx -= this.prev.dx;
      data.dy -= this.prev.dy;
    }
    this.prev = {dx: dx, dy: dy};

    if (this.callback) {
      this.callback.call(this.vm, data);
    }
  },

  MouseDown: function ( e ) {

    this.start = {
      x: e.pageX,
      y: e.pageY
    };

    window.addEventListener("mousemove", this.onMouseMove);
    e.stopPropagation();
  },

  MouseUp: function ( e ) {
    this.prev = null;
    window.removeEventListener("mousemove", this.onMouseMove);
  }
})
