/**
 * A start for a draggable directive, making it easier to use drag event data
 * in Vue components
 *
 * Usage:
 * Inside the component set "v-draggable" to point to the function you want
 * to call each time a drag is being done. This callback is called with the delta
 * of your drag as arguments.
 *
 * Additionally you can append the functionname with "Start" and "Stop" in order
 * to do some more things when just starting the drag or when stopping the drag
 * event
 */

export default {
  isFn: true,
  acceptStatement: true,

  bind: function (el, binding, vNode) {
    var MouseMove = function (e) {
      var start, dx, dy, data
      start = this.start
      dx = e.pageX - start.x
      dy = e.pageY - start.y
      data = {dx: dx, dy: dy}

      if (e.buttons === 0) {
        this.onMouseUp()
        return
      }

      // only dispatch relative data for now
      if (this.prev) {
        data.dx -= this.prev.dx
        data.dy -= this.prev.dy
      }
      this.prev = {dx: dx, dy: dy}

      if (this.callback) {
        this.callback.call(vNode.context, data)
      }
      e.stopImmediatePropagation()
    }

    var MouseDown = function (e) {
      this.start = {
        x: e.pageX,
        y: e.pageY
      }

      if (this.callbackStart) {
        this.callbackStart.call(vNode.context)
      }

      window.addEventListener('mousemove', this.onMouseMove)
      e.stopImmediatePropagation()
    }

    var MouseUp = function (e) {
      if (this.callbackStop) {
        this.callbackStop.call(vNode.context)
      }
      this.prev = null
      window.removeEventListener('mousemove', this.onMouseMove)
    }

    // do preparation work
    // e.g. add event listeners or other expensive stuff
    // that needs to be run only once
    el.start = {x: 0, y: 0}
    el.onMouseMove = MouseMove.bind(el)
    el.onMouseDown = MouseDown.bind(el)
    el.onMouseUp = MouseUp.bind(el)

    el.addEventListener('mousedown', el.onMouseDown)
    el.addEventListener('mouseup', el.onMouseUp)

    if (!binding.expression) {
      throw new Error('No callback defined')
    }

    // pointer to the function to call on Drag
    var fn = vNode.context[binding.expression]
    if (typeof fn === 'function') {
      el.callback = fn
    } else {
      console.warn('Callback should be a function!')
    }

    // Based the Naming of the callback, see if theres also a start and stop
    // function defined. If so, use these and call them at the appropriate times
    // Start: When starting to drag
    // Stop:  When dragging has Stoped
    var fnStart = vNode.context[binding.expression + 'Start']
    if (typeof fnStart === 'function') {
      el.callbackStart = fnStart
    }

    var fnStop = vNode.context[binding.expression + 'Stop']
    if (typeof fnStop === 'function') {
      el.callbackStop = fnStop
    }
  },

  unbind: function (el, binding) {
    // do clean up work
    // e.g. remove event listeners added in bind()
    el.removeEventListener('mousedown', el.onMouseDown)
    el.removeEventListener('mouseup', el.onMouseUp)
    window.removeEventListener('mousemove', el.onMouseMove)
  }
}
