'use strict'
// relative paths
var SocketsIo = require('socket.io')

class Socket {
  constructor (server) {
    this.io = new SocketsIo(server)
    this.io.on('connection', function (socket) {})
  }
  // wuuut wuut
  emit (event, params) {
    this.io.emit(event, params)
  }
}

module.exports = Socket
