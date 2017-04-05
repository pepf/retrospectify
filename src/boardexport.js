import FileSaver from 'file-saver'
import _ from 'lodash'

class BoardExport {

  constructor (data) {
    this.output = ''
    this.appendtoOutput(data.title)

    const grouped = _.groupBy(data.notes, 'note_type')

    Object.keys(grouped).forEach((notegroup) => {
      this.appendtoOutput(`\nCategory ${notegroup}`)

      const notes = _(grouped[notegroup]).sortBy(['votes', 'text']).reverse().value()

      const notesText = notes.map((note) => {
        return `${note.text} (${note.votes} votes)`
      })
      this.appendtoOutput(notesText.join('\n'))
    })
  }

  appendtoOutput (text) {
    this.output += `${text}\n`
  }

  save () {
    const output = new Blob([this.output], {type: 'text/plain;charset=utf-8'})
    FileSaver.saveAs(output, 'export.txt')
  }
}

export default BoardExport
