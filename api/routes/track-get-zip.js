// core
var fs = require('fs')
// libs
var zip = require('zip-folder')

module.exports = function (router) {
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

}
