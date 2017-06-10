'use strict'
// relative paths
require('app-module-path').addPath(__dirname)
// libs
var Express = require('express')
var _ = require('lodash')
var cors = require('cors')
var bodyParser = require('body-parser')
var fs = require('fs')
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
    this.router.route
    this.app.use(function(req, res, next) {
      next();
    });
    this.router.route('/post/svg').post((req, res) => {
      if (!fs.existsSync(`./data/${req.body.id}`)){
        fs.mkdirSync(`./data/${req.body.id}`);
      }
      fs.writeFile(`./data/${req.body.id}/${req.body.time}.svg`, req.body.raw, function(err) {
      console.log(err);
      });
      res.send('Svg saved')
    })

    this.app.use(Express.static('./frontend/dist'))
    this.app.use('/play/:id', Express.static('./frontend/dist'))
    this.app.use('/', Express.static('./frontend/dist'))

    let getAll = (req, res) => {
      res.redirect('/')
    }
    this.app.use(getAll)
    this.app.listen(env.port, () => {
    })

  }


}

let app = new App()
