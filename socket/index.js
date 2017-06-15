'use strict'
// relative paths
var SocketsIo = require('socket.io')

class Socket {
  constructor (server) {
    this.io = new SocketsIo(server)
    this.io.on('connection', function (socket) {
    })
  }
}

module.exports = Socket
