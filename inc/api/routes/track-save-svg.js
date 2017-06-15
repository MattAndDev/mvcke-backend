'use strict'
var fs = require('fs')
var path = require('path')
var sharp = require('sharp')
var svg2png = require('svg2png')
var _ = require('lodash')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }

module.exports = function (router, socket) {

  var fileName, id, path

  router.route('/track/save/svg/:id').post((req, res) => {
    // set vars
    id = req.params.id
    path = `${env.rawPath}/${req.params.id}`
    fileName = _ceateFilename(req.body.time)

    // create directory if not existing
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    fs.writeFile(`${path}/${fileName}.svg`, req.body.raw, function(err) {
      if (!err) {
        return res.send('Svg saved')
      }
      else {
        return res.send(err)
      }
    });
  })

  // create 10 digits string with seconds leading 0
  var _ceateFilename = (int) => {
    if (typeof int !== 'string') int = int.toString()
    while (int.length < 10) int = '0' + int
    return int
  }

}
