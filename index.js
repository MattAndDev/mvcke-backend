'use strict'
// relative paths
require('app-module-path').addPath(__dirname)
// libs
var Express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var Socket = require('./inc/socket')
// api
var Api = require('./inc/api')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }



class App {

  constructor () {
    // setup app
    this.app = require('express')()
    // setup server and pass express app -> to make sockets work
    this.server = require('http').Server(this.app);
    // dock sockets
    this.socket = new Socket(this.server)
    // init express stuff
    this.router = Express.Router()
    // setup sockets :tada:
    // cors (!) this should be remove in prod
    this.app.use(cors())
    // we love json
    this.app.use(bodyParser.json({limit: '50mb'}))
    // set api endpoint for this router
    // NOTE: this because the rest
    // is static and handled by vue.js
    this.app.use('/api', this.router)
    // ship it
    this.init()
  }

  init () {
    // first entry point pass static
    this.app.use(Express.static('./frontend/dist'))
    // add api routes, pass socket
    Api.addRoutes(this.router, this.socket)
    // CUSTOM ROUTES
    // pass directly song id to vue see /js/vue/play.vue
    this.app.use('/play/:id', Express.static('./frontend/dist'))
    // make zip folder publicly aailable for downloads
    this.app.use('/zips', Express.static(env.zipPath))
    // make pdfs folder publicly aailable for downloads
    this.app.use('/pdfs', Express.static(env.pdfsPath))

    // all the rest <- redirect home
    let swallowAll = (req, res) => {
      res.redirect('/')
    }
    this.app.use(swallowAll)
    // listening
    this.server.listen(env.port)
  }

}

// WOOT!!
let app = new App()
