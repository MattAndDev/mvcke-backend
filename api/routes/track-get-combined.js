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
    // // get zip
    router.route('/track/get/combined/:id').get((req, res) => {
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
