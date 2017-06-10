'use strict'
// relative paths
require('app-module-path').addPath(__dirname)
// libs
var Express = require('express')
var _ = require('lodash')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }



class App {

  constructor () {
    this.app = new Express()
    this.router = Express.Router()
    this.app.use('/', this.router)
    this.routes = {}
    this.init()
  }

  init () {
    this.app.use('/', Express.static('./frontend/dist'))

    this.app.listen(env.port, () => {
    })

  }


}

let app = new App()
