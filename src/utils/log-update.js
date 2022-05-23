import ansiEscapes from 'ansi-escapes'
import wrapAnsi from 'wrap-ansi'
import terminalSize from 'term-size'
// import debounce from 'lodash.debounce'
import { BAR_LENGTH } from './consts'

// Based on https://github.com/sindresorhus/log-update/blob/master/index.js

const originalWrite = Symbol('webpackbarWrite')

export default class LogUpdate {
  constructor () {
    this.prevLineCount = 0
    this.listening = false
    this.extraLines = ''
    this._onData = this._onData.bind(this)
    this._streams = [process.stdout, process.stderr]
  }

  render (lines) {
    this.listen()
    let _lines = lines

    const columns = this.columns

    if (!process.stdin.isTTY) {
      _lines = lines.trim()

      if (_lines.length > columns - 25) {
        _lines = _lines.substring(0, columns - 25 - BAR_LENGTH) + '…'
      }
    }

    const wrappedLines = wrapAnsi('\n' + _lines, columns, {
      trim: false,
      hard: true,
      wordWrap: false
    })

    const data =
      ansiEscapes.eraseLines(this.prevLineCount) +
      wrappedLines +
      '\n' +
      this.extraLines

    this.write(data)

    this.prevLineCount = data.split('\n').length
  }

  get columns () {
    // TODO: terminalSize is slow. Do something about it
    // return debounce(terminalSize, 500)().columns || 80
    return terminalSize().columns || 80
  }

  write (data) {
    const stream = process.stderr
    if (stream.write[originalWrite]) {
      stream.write[originalWrite].call(stream, data, 'utf-8')
    } else {
      stream.write(data, 'utf-8')
    }
  }

  clear () {
    this.done()
    this.write(ansiEscapes.eraseLines(this.prevLineCount))
  }

  done () {
    this.stopListen()

    this.prevLineCount = 0
    this.extraLines = ''
  }

  _onData (data) {
    const str = String(data)
    const lines = str.split('\n').length - 1
    if (lines > 0) {
      this.prevLineCount += lines
      this.extraLines += data
    }
  }

  listen () {
    // Prevent listening more than once
    if (this.listening) {
      return
    }

    // Spy on all streams
    for (const stream of this._streams) {
      // Prevent overriding more than once
      if (stream.write[originalWrite]) {
        continue
      }

      // Create a wrapper fn
      const write = (data, ...args) => {
        if (!stream.write[originalWrite]) {
          return stream.write(data, ...args)
        }
        this._onData(data)
        return stream.write[originalWrite].call(stream, data, ...args)
      }

      // Backup original write fn
      write[originalWrite] = stream.write

      // Override write fn
      stream.write = write
    }

    this.listening = true
  }

  stopListen () {
    // Restore original write fns
    for (const stream of this._streams) {
      if (stream.write[originalWrite]) {
        stream.write = stream.write[originalWrite]
      }
    }

    this.listening = false
  }
}
