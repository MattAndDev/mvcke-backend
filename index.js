'use strict'
// relative paths
require('app-module-path').addPath(__dirname)
// libs
var Express = require('express')
var _ = require('lodash')
var cors = require('cors')
var bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')
// api
var Api = require('./api')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }



class App {

  constructor () {
    this.app = new Express()
    this.router = Express.Router()
    this.app.use(cors())
    this.app.use(bodyParser.json())
    this.app.use('/api', this.router)
    this.routes = {}
    this.init()
  }

  init () {
    this.app.use(Express.static('./frontend/dist'))
    console.log(Api);
    Api.addRoutes(this.router)
    this.app.use('/play/:id', Express.static('./frontend/dist'))
    this.app.use('/zips', Express.static('./zips'))
    this.app.use('/', Express.static('./frontend/dist'))

    let swallowAll = (req, res) => {
      res.redirect('/')
    }

    this.app.use(swallowAll)
    this.app.listen(env.port)
  }




}

let app = new App()
