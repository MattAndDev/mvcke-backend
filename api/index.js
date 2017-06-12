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
var glob = require('glob')
var sizeOf = require('image-size');
var PDFDocument = require('pdfkit')
var SVGtoPDF = require('svg-to-pdfkit')
PDFDocument.prototype.addSVG = function(svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }



class Api {

  addRoutes (router) {

    // save svg
    router.route('/track/save/svg/:id').post((req, res) => {
      if (!fs.existsSync(`./data/${req.params.id}`)){
        fs.mkdirSync(`./data/${req.params.id}`);
      }
      let fileName = this._ceateFilename(req.body.time)
      fs.writeFile(`./data/${req.params.id}/${fileName}.svg`, req.body.raw, function(err) {
        console.log(err);
      });
      res.send('Svg saved')
    })

    // get zip
    router.route('/track/get/zip/:id').get((req, res) => {
      res.header('Content-Type', 'application/zip')
      if (fs.existsSync(`./data/${req.params.id}`)) {
        zip(`./data/${req.params.id}`, `./zips/${req.params.id}.zip`, (err) => {
          if (!err) {
            res.send(req.protocol + '://' + req.get('host') + `/zips/${req.params.id}.zip`)
          }
        })
      }
    })

    // save svg
    router.route('/track/register/:id').post((req, res) => {
      if (!fs.existsSync(`./data/${req.params.id}`)){
        fs.mkdirSync(`./data/${req.params.id}`);
      }
      fs.writeFile(`./data/${req.params.id}/track.json`, JSON.stringify(req.body), function(err) {
        console.log(err);
        if (!err) {
          res.send(`Registered track with id ${req.params.id}`)
        }
      });
    })
    // // get zip
    router.route('/get/combined/:id').get((req, res) => {
      res.header('Content-Type', 'application/zip')
      if (fs.existsSync(`./data/${req.params.id}`)) {
        var doc = new PDFDocument({size: [2030,2900]}) // somewhat 70/100 cm
        doc.pipe(fs.createWriteStream(`./data/${req.params.id}/poster.pdf`))
        this.files = []
        glob(`./data/${req.params.id}/*.svg`, {nosort: true}, (err, files) => {
          _.each(files, (file, index) => {
            let identifier = path.basename(file).replace('.svg','')
            console.log(identifier);
              fs.readFile(file, 'utf8',  (err,data) => {
                if (err)  return console.log(err)
                this.files.push({
                  name: identifier,
                  data: data
                })
                if (index === files.length - 1 ) {
                  _.each(this.files, (file, index) => {
                    console.log(sizeOf(files[index]));
                    doc.addSVG(file.data, 0,0, {assumePt: true});
                  })
                  doc.end()
                  console.log('done');
                }
              });
          })
          res.send('Svg saved')
        })
      }
    })
  }
  _ceateFilename (int) {
    if (typeof int !== 'string') int = int.toString()
    while (int.length < 10) int = '0' + int
    return int
  }
}

module.exports  = new Api()
