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

// NOTE: WIP file
// TODO: most functionality will be shared between templates and be moved to utils


module.exports = function (router) {

  // gets all svg in folder, callbacks an array of objects
  // {
  //  time: time in second of the saved svg (leading zeroes),
  //  raw: raw svg
  // }
  let svgsToArray = (cb) => {
    let jsonFiles = []
    // get all svgs
    glob(`${env.rawPath}/${this.id}/*.svg`, (err, files) => {
      // each
      _.each(files, (file, index) => {
        // filename === time i ds
        let time = path.basename(file).replace('.svg','')
        // read the file
        fs.readFile(file, 'utf8',  (err,data) => {
          // that's how you do error handling :/
          if (err)  return console.log(err)
          // push this file
          jsonFiles.push({
            time: time,
            raw: data,
            location: file, // not used
            size: sizeOf(file) // not used
          })
          // done
          if (index === files.length - 1 ) {
            // ship it
            cb(jsonFiles)
          }
        });
      })
    })
  }

  // converts Mm to points
  let mm2pt = (mm) => {
    return mm * 2.83465
  }

  // sets svg size in mm
  let setSvgSize = (mm) => {
    let standardWidth = 1200
    let scale = mm2pt(mm) / standardWidth
    this.reverseScale = standardWidth / mm2pt(mm)
    this.scale = scale
    return scale
  }

  // workaround
  // NOTE: we use scale to get the appropriate si ze in mm of the svg
  // when the svg is added (svg-to-pdfkit) the context is still scaled
  // and can't be restored
  // so we need to reverse the scale
  let mm2ptWhileScaled = (mm) => {
    return mm * 2.83465 * this.reverseScale
  }

  router.route('/track/get/combined/:id').get((req, res) => {
    res.header('Content-Type', 'application/zip')
    // get text from request if any
    let posterText = req.query.text ? req.query.text : 'inspiring text'
    if (fs.existsSync(`${env.rawPath}/${req.params.id}`)) {
      // scope
      this.id = req.params.id
      // get files into array
      svgsToArray((files) => {
        // setup poster (70*100)
        let doc = new PDFDocument({size: [mm2pt(700),mm2pt(1000)]})
        // doc.font('fonts/PalatinoBold.ttf')
        let docstream = fs.createWriteStream(`${env.rawPath}/${this.id}/poster.pdf`)
        doc.pipe(docstream)
        doc.moveTo(0,0) // this is acutally default, as reference
        _.each(files, (file, index) => {
          // save context
          doc.save()
          // big element at index, could be randomized
          if (index === 5  ) {
            // set the size
            doc.scale(setSvgSize(300))
            // position and add
            doc.addSVG(file.raw, mm2ptWhileScaled(50) , index * mm2ptWhileScaled(100) - (mm2ptWhileScaled(100)) , { assumePt: true })
          }
          else {
            // set the size
            doc.scale(setSvgSize(50))
            // set exception to leave space for big element
            let increment = index >= 6 ? mm2ptWhileScaled(50) : 0
            // position and add
            doc.addSVG(file.raw, mm2ptWhileScaled(175), index * mm2ptWhileScaled(100) + increment , {
              assumePt: true
            })
          }
          // go back to 0,0
          doc.restore()
        })
        doc.fontSize(100).fillColor('#555555').text(posterText, 950, 1500, { align: 'center'})
        // wuut
        doc.end()
        // once save
        docstream.on('finish', () => {
          // copy over to poster directory
          fs.copy(`${env.rawPath}/${this.id}/poster.pdf`, `${env.pdfsPath}/${this.id}.pdf`)
          .then(() => {
            res.send(req.protocol + '://' + req.get('host') + `/pdfs/${req.params.id}.pdf`)
          })
        })

      })
    }
  })
}
