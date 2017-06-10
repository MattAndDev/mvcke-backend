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
var zip = require('zip-folder')
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
    this.app.use('/play/:id', Express.static('./frontend/dist'))
    this.app.use('/zips', Express.static('./zips'))
    this.app.use('/', Express.static('./frontend/dist'))

    let swallowAll = (req, res) => {
      res.redirect('/')
    }

    this._addApiRoutes()
    this.app.use(swallowAll)
    this.app.listen(env.port)
  }

  _addApiRoutes () {

    // save svg
    this.router.route('/post/svg').post((req, res) => {
      if (!fs.existsSync(`./data/${req.body.id}`)){
        fs.mkdirSync(`./data/${req.body.id}`);
      }
      fs.writeFile(`./data/${req.body.id}/${req.body.time}.svg`, req.body.raw, function(err) {
        console.log(err);
      });
      res.send('Svg saved')
    })

    // get zip
    this.router.route('/get/zip/:id').get((req, res) => {
      res.header('Content-Type', 'application/zip')
      if (fs.existsSync(`./data/${req.params.id}`)) {
        zip(`./data/${req.params.id}`, `./zips/${req.params.id}.zip`, (err) => {
          if (!err) {
            res.send(req.protocol + '://' + req.get('host') + `/zips/${req.params.id}.zip`)
          }
        })
      }
    })
  }


}

let app = new App()
