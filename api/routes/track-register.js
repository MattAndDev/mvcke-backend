var fs = require('fs')

module.exports = function (router) {
  // register track
  router.route('/track/register/:id').post((req, res) => {
    if (!fs.existsSync(`./data/${req.params.id}`)){
      fs.mkdirSync(`./data/${req.params.id}`);
    }
    fs.writeFile(`./data/${req.params.id}/track.json`, JSON.stringify(req.body), function(err) {
      if (!err) {
        res.send(`Registered track with id ${req.params.id}`)
      }
    });
  })

}
