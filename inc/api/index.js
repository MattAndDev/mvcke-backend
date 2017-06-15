'use strict'
// relative paths
var _ = require('lodash')
var path = require('path')
var glob = require('glob')

class Api {
  addRoutes (router, socket) {
    // ah snap!
    glob('./inc/api/routes/*.js', (err, routes) => {
     _.each(routes, (route) => {
       require(path.resolve(route))(router, socket)
     })
    })
  }
}

module.exports = new Api()
