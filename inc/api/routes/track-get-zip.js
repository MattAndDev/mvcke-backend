// core
var fs = require('fs')
// libs
var zip = require('zip-folder')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }

module.exports = function (router) {
  // get zip
  router.route('/track/get/zip/:id').get((req, res) => {
    res.header('Content-Type', 'application/zip')
    if (fs.existsSync(`${env.rawPath}/${req.params.id}`)) {
      zip(`${env.rawPath}/${req.params.id}`, `${env.zipPath}/${req.params.id}.zip`, (err) => {
        if (!err) {
          res.send(req.protocol + '://' + req.get('host') + `/zips/${req.params.id}.zip`)
        }
      })
    }
  })

}
