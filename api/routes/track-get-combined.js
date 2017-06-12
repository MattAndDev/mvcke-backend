// core
var fs = require('fs')
var path = require('path')
// libs
var sizeOf = require('image-size');
var PDFDocument = require('pdfkit')
var glob = require('glob')
var _ = require('lodash')
var SVGtoPDF = require('svg-to-pdfkit')
PDFDocument.prototype.addSVG = function(svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options), this;
};

module.exports = function (router) {


  // gets all svg in folder, callbacks an array of objects
  // {
  //  time: time in second of the saved svg (leading zeroes),
  //  raw: raw svg
  // }
  let svgsToArray = (cb) => {
    let jsonFiles = []
    glob(`./data/${this.id}/*.svg`, {nosort: true}, (err, files) => {
      _.each(files, (file, index) => {
        let identifier = path.basename(file).replace('.svg','')
        fs.readFile(file, 'utf8',  (err,data) => {
          if (err)  return console.log(err)
          jsonFiles.push({
            time: identifier,
            raw: data
          })
          if (index === files.length - 1 ) {
            cb(jsonFiles)
          }
        });
      })
    })
  }

  // 
  router.route('/track/get/combined/:id').get((req, res) => {
    res.header('Content-Type', 'application/zip')
    if (fs.existsSync(`./data/${req.params.id}`)) {
      this.id = req.params.id
      // get files into array
      svgsToArray((files) => {
        // setup moc pdf
        let doc = new PDFDocument({size: [2030,2900]}) // somewhat 70/100 cm
        doc.pipe(fs.createWriteStream(`./data/${this.id}/poster.pdf`))
        _.each(files, (file, index) => {
          doc.addSVG(file.raw, 0,0, {assumePt: true});
        })
        doc.end()
        res.send('Svg saved')
      })
    }
  })
}
