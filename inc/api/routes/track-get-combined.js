// core
var fs = require('fs-extra')
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
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }

module.exports = function (router) {

  // gets all svg in folder, callbacks an array of objects
  // {
  //  time: time in second of the saved svg (leading zeroes),
  //  raw: raw svg
  // }
  let svgsToArray = (cb) => {
    let jsonFiles = []
    glob(`${env.rawPath}/${this.id}/*.svg`, {nosort: true}, (err, files) => {
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


  let mmToPoints = (mm) => {
    return mm * 2.83465
  }
  let pointsToMm = (points) => {
    return points * 0.352778
  }

  let setSvgSize = (mm) => {
    let standardWidth = 1200
    let scale = mmToPoints(mm) / standardWidth
    this.reverseScale = standardWidth / mmToPoints(mm)
    this.scale = scale
    return scale
  }
  let mmToPointsFixScale = (mm) => {
    return mm * 2.83465 * this.reverseScale
  }

  //
  router.route('/track/get/combined/:id').get((req, res) => {
    res.header('Content-Type', 'application/zip')
    let posterText = req.query.text ? req.query.text : 'inspiring text'
    if (fs.existsSync(`${env.rawPath}/${req.params.id}`)) {
      this.id = req.params.id
      // get files into array
      svgsToArray((files) => {
        // setup moc pdf
        let doc = new PDFDocument({size: [mmToPoints(700),mmToPoints(1000)]})
        // doc.font('fonts/PalatinoBold.ttf')
        doc.scale(1).moveTo(0, 0).save('dad')
        let docstream = fs.createWriteStream(`${env.rawPath}/${this.id}/poster.pdf`)
        doc.pipe(docstream)
        _.each(files, (file, index) => {
          doc.moveTo(0,0)
          doc.save()
          if (index === 4 ) {
            doc.scale(setSvgSize(400))
            doc.addSVG(file.raw, 1200 -  mmToPointsFixScale(400) , index * mmToPointsFixScale(100) - mmToPointsFixScale(100), {
              assumePt: false
            })
          }
          else {
            doc.scale(setSvgSize(100))
            let increment = index >= 6 ? 2600 : 0
            doc.addSVG(file.raw, 1200, index * mmToPointsFixScale(100), {
              assumePt: true
            })
          }
          doc.moveTo(0,0)
          doc.restore()
        })
        doc.fontSize(100).fillColor('#555555').text(posterText, 950, 1500, { align: 'center'})
        doc.end()
        docstream.on('finish', () => {
          fs.copy(`${env.rawPath}/${this.id}/poster.pdf`, `${env.pdfsPath}/${this.id}.pdf`)
          .then(() => {
            res.send(req.protocol + '://' + req.get('host') + `/pdfs/${req.params.id}.pdf`)
          })
        })

      })
    }
  })
}
