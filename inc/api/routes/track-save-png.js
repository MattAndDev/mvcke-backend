'use strict'
var fs = require('fs')
var path = require('path')
var multer  = require('multer')
var sharp  = require('sharp')
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
  var upload = multer()
  router.route('/track/save/png/:id').post(upload.single('file'), (req, res) => {
    // // set vars
    id = req.params.id
    path = `${env.rawPath}/${req.params.id}`
    thumbPath = `${env.rawPath}/${req.params.id}/thumbs`
    fileName = _ceateFilename(req.file.originalname)
    // create directory if not existing
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    if (!fs.existsSync(thumbPath)) fs.mkdirSync(thumbPath)
    fs.writeFile(`${path}/${fileName}.png`, req.file.buffer, (err) => {
      if (!err) {
        _saveThumbsFromPng(`${path}/${fileName}.png`).then(() => {
          return res.send('png saved')
        })
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
        sharp(`${path}/${fileName}.png`).resize(thumbSize).toBuffer().then((buffer) => {
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

}
