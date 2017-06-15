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

  var thumbs = [
    100, 200, 400, 600
  ]
  var fileName, id, path, thumbPath

  router.route('/track/save/svg/:id').post((req, res) => {
    // set vars
    id = req.params.id
    path = `${env.rawPath}/${req.params.id}`
    thumbPath = `${env.rawPath}/${req.params.id}/thumbs`
    fileName = _ceateFilename(req.body.time)


    // create directory if not existing
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    fs.writeFile(`${path}/${fileName}.svg`, req.body.raw, function(err) {
      if (!err) {
        _svgToPng(`${path}/${fileName}.svg`).then(_saveThumbsFromPng)
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

  // saves thumbs from provided png
  var _saveThumbsFromPng = (png) => {
    return new Promise((resolve, reject) => {
      _.each(thumbs, (thumbSize, index) => {
        sharp(`${thumbPath}/${fileName}.png`).resize(thumbSize).toBuffer().then((buffer) => {
          fs.writeFile(`${thumbPath}/${fileName}-${thumbSize.toString()}.png`, buffer, (err) => {
            if (err) {
              reject(err)
            }
            else if (index === thumbs.length - 1){
              resolve()
            }
          })
        })
      })
    })
  }

  var _svgToPng = (svg) => {
    return new Promise((resolve, reject) => {
      fs.readFile(svg, 'utf8',  (err,data) => {
        if (!fs.existsSync(`${thumbPath}`)) fs.mkdirSync(`${thumbPath}`)
        svg2png(data).then( (buffer) => {
          fs.writeFile(`${thumbPath}/${fileName}.png`, buffer, (err) => {
            if (err) {
              reject(err)
            }
            else {
              socket.emit('svgToPng', { fileName: fileName })
              resolve(`${thumbPath}/${fileName}.png`)
            }
          })
        })
      })
    })
  }

}
