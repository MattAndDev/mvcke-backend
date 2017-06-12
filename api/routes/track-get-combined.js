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
            raw: data,
            location: file,
            size: sizeOf(file)
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
    let posterText = req.query.text ? req.query.text : 'inspiring text'
    if (fs.existsSync(`./data/${req.params.id}`)) {
      this.id = req.params.id
      // get files into array
      svgsToArray((files) => {
        // setup moc pdf
        let doc = new PDFDocument({size: [2030,2900]}) // somewhat 70/100 cm
        doc.scale(1).moveTo(0, 0).save('dad')
        doc.pipe(fs.createWriteStream(`./data/${this.id}/poster.pdf`))
        _.each(files, (file, index) => {
          doc.save()
          if (index === 5 ) {
            doc.scale(1.5)
            doc.addSVG(file.raw, -108, 580, {
              assumePt: false
            })
          }
          else {
            doc.scale(0.25)
            let increment = index >= 6 ? 2600 : 0
            doc.addSVG(file.raw, 1600,index * 600 * 1.5 + increment, {
              assumePt: false
            })
          }
          doc.moveTo(0,0)
          // doc.moveTo(0, index * 600)
          doc.restore()
        })
        doc.fontSize(100).fillColor('#555555').text(posterText, 950, 1500, { align: 'center'})
        doc.end()
        fs.createReadStream(`./data/${this.id}/poster.pdf`).pipe(fs.createWriteStream(`./pdfs/${this.id}.pdf`));

        res.send('Svg saved')
      })
    }
  })
}
