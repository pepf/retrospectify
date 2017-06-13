import _ from 'lodash'

/**
 * Various position related things regarding our notes
 * For example, finding a good position for a new note, given the current app
 * "state".
 *
 * Or, sorting notes by the # of votes
 */

class Positioner {
  constructor () {
    return
  }

  // just the "notes" object
  setState (state) {
    this.notes = state
  }

  getPositionforNew (terciary) {
    var appWidth = window.innerWidth
    var typePosition = ((appWidth / 3) * terciary)

    var x = Math.floor((Math.random() * 20) - 10) + typePosition
    var y = Math.floor((Math.random() * 20) - 10)

    return {x, y}
  }

  /**
   * Make sure all notes look the same
   * To simplify aligning them to an imaginary grid
   */
  normalizeDimensions (note, index) {
    let size = note.noteSize
    size.w = 150
    size.h = 150
    return note
  }

  /**
   * Function that returns a function that is able to position
   * a note on the imaginary grid, based on what type it is. (pos, impr, neut)
   */
  alignToGrid (grid, terciary) {
    const column = grid.columns.indexOf(terciary)

    return function (note, index) {
      let position = note.position
      let size = note.noteSize

      // Figure out how much notes would fit per category, based on current window width
      const rowWidth = Math.floor((window.innerWidth / grid.columns.length) / size.w) // 3 notes per row

      const columnWidth = (1 / grid.columns.length) * window.innerWidth
      const columnOffset = column * columnWidth

      position.x = ((index % rowWidth) * size.w) + columnOffset
      position.y = Math.floor(index / rowWidth) * size.h

      return note
    }
  }

  /**
   * Takes the "notes" part of the application state and performs the following
   * actions:
   * - Filters by type
   * - Orders notes by # of votes
   * - Normalizes the size of each notee
   * - And finally aligns them on a grid
   *
   * Since these actions modify the object in-place, references are automatically
   * updated. We could change this if it causes any problems later.
   */
  reArrange () {
    let notes = this.notes;
    ['positive', 'improvement', 'neutral'].forEach(terciary => {
      _.chain(notes)
      .filter({note_type: terciary})
      .orderBy(['votes'], ['desc'])
      .map(this.normalizeDimensions)
      .map(this.alignToGrid(this.grid, terciary))
      .value()
    })

    return
  }

  /**
   * Create a (column)grid based on the notes that are on the board
   */
  setGrid (notes) {
    let grid = {
      columns: []
    };
    ['positive', 'neutral', 'improvement'].forEach(type => {
      const filteredNotes = _.filter(notes, {note_type: type})
      if (filteredNotes.length > 0) {
        grid.columns.push(type)
      }
    })
    this.grid = grid
  }
}

export default Positioner
