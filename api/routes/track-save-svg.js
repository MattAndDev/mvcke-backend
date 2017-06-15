'use strict'
var fs = require('fs')
var path = require('path')
var sharp = require('sharp')
var svg2png = require('svg2png')
var _ = require('lodash')

module.exports = function (router, socket) {

  var thumbs = [
    100, 200, 400, 600
  ]
  var fileName, id

  router.route('/track/save/svg/:id').post((req, res) => {
    id = req.params.id
    if (!fs.existsSync(`./data/${id}`)) fs.mkdirSync(`./data/${id}`)
    fileName = _ceateFilename(req.body.time)
    fs.writeFile(`./data/${req.params.id}/${fileName}.svg`, req.body.raw, function(err) {
      if (!err) {
        _svgToPng(`./data/${id}/${fileName}.svg`).then(_saveThumbsFromPng)
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
        sharp(`./data/${id}/thumbs/${fileName}.png`).resize(thumbSize).toBuffer().then((buffer) => {
          fs.writeFile(`./data/${id}/thumbs/${fileName}-${thumbSize.toString()}.png`, buffer, (err) => {
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
        console.log(fileName);
        if (!fs.existsSync(`./data/${id}/thumbs`)) fs.mkdirSync(`./data/${id}/thumbs`)
        svg2png(data).then( (buffer) => {
          fs.writeFile(`./data/${id}/thumbs/${fileName}.png`, buffer, (err) => {
            if (err) {
              reject(err)
            }
            else {
              socket.emit('svgToPng', { fileName: fileName })
              resolve(`./data/${id}/thumbs/${fileName}.png`)
            }
          })
        })
      })
    })
  }

}
