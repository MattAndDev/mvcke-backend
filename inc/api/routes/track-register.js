// core
var fs = require('fs')
// env
var env
try { env = require('.env') }
catch (ex) { env = require('.env.example') }

module.exports = function (router) {
  // register track
  router.route('/track/register/:id').post((req, res) => {
    console.log(`${env.rawPath}/${req.params.id}`);
    if (!fs.existsSync(`${env.rawPath}/${req.params.id}`)){
      fs.mkdirSync(`${env.rawPath}/${req.params.id}`);
    }
    fs.writeFile(`${env.rawPath}/${req.params.id}/track.json`, JSON.stringify(req.body), function(err) {
      if (!err) {
        res.send(`Registered track with id ${req.params.id}`)
      }
    });
  })

}
