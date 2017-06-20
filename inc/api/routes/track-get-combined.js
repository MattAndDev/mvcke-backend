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
            size: sizeOf(file)
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
  let mm2pt = (mm, isDocScaled) => {
    let pt = isDocScaled ? mm * 2.83465 * this.reverseScale : mm * 2.83465
    return pt
  }

  // scales the svg from given px to mm
  let setSvgSize = (mm, px) => {
    let scale = mm2pt(mm) / px
    this.reverseScale = px / mm2pt(mm)
    this.scale = scale
    return scale
  }


  let msTos = (millis) => {
    let minutes = Math.floor(millis / 60000)
    let seconds = ((millis % 60000) / 1000).toFixed(0)
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
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
        doc.font(path.resolve('inc/fonts/Titillium/TitilliumWeb-Light.ttf'))
        let docstream = fs.createWriteStream(`${env.rawPath}/${this.id}/poster.pdf`)
        doc.pipe(docstream)
        doc.moveTo(0,0) // this is acutally default, as reference
        _.each(files, (file, index) => {
          // save context
          doc.save()
          // big element at index, could be randomized
          if (index === 5  ) {
            doc.moveTo(mm2pt(90), index * mm2pt(100) + mm2pt(50)).lineTo(mm2pt(200), index * mm2pt(100)+ mm2pt(50)).strokeColor('#555555').strokeOpacity(0.2).stroke()
            doc.moveTo(0, 0).fontSize(10).fillColor('#555555').text(msTos(parseInt(file.time) * 100), mm2pt(0), index * mm2pt(100)+ mm2pt(47.15),
            { align: 'right', width: mm2pt(88)})
            // set the size
            doc.scale(setSvgSize(300, file.size.width))
            // position and add
            doc.addSVG(file.raw, mm2pt(50, true) , index * mm2pt(100, true) - (mm2pt(100, true)) , { assumePt: true })
          }
          else {
            let increment = index >= 6 ? mm2pt(50) : 0
            doc.moveTo(mm2pt(200), index * mm2pt(100) + mm2pt(25)+ increment).lineTo(mm2pt(250), index * mm2pt(100)+ mm2pt(25) + increment).strokeColor('#555555').strokeOpacity(0.2).stroke()
            doc.moveTo(0, 0).fontSize(10).fillColor('#555555').text(msTos(parseInt(file.time) * 100), mm2pt(252), index * mm2pt(100)+ mm2pt(22.15) + increment,
            { align: 'left', width: mm2pt(88), height: mm2pt(10)})
            // set the size
            doc.scale(setSvgSize(50, file.size.width))
            // set exception to leave space for big element
            increment = index >= 6 ? mm2pt(50, true) : 0
            // position and add
            doc.addSVG(file.raw, mm2pt(175, true), index * mm2pt(100, true) + increment , {
              assumePt: true
            })
          }
          // go back to 0,0
          doc.restore()
        })

        // truncate if text is too long
        let maxTextLenght = 17
        if (posterText.length > maxTextLenght) posterText = posterText.substring(0, maxTextLenght)
        doc.fontSize(80).fillColor('#555555').text(posterText.toLowerCase(), mm2pt(350), mm2pt(524),
        { align: 'center', width: mm2pt(280)})



        // wuut
        doc.end()
        // once save)
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
