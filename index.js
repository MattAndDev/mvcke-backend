'use strict'
// relative paths
require('app-module-path').addPath(__dirname)
// libs
var Express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
// api
var Api = require('./api')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }



class App {

  constructor () {
    // init express stuff
    this.app = new Express()
    this.router = Express.Router()
    // cors (!) this should be remove in prod
    this.app.use(cors())
    // we love json
    this.app.use(bodyParser.json())
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
    // add api routes
    Api.addRoutes(this.router)
    // CUSTOM ROUTES
    // pass directly song id to vue see /js/vue/play.vue
    this.app.use('/play/:id', Express.static('./frontend/dist'))
    // make zip folder publicly aailable for downloads
    this.app.use('/zips', Express.static('./zips'))
    // make pdfs folder publicly aailable for downloads
    this.app.use('/pdfs', Express.static('./pdfs'))

    // all the rest <- redirect home
    let swallowAll = (req, res) => {
      res.redirect('/')
    }
    this.app.use(swallowAll)
    // listening
    this.app.listen(env.port)
  }

}

// WOOT!!
let app = new App()
