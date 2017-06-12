var fs = require('fs')

module.exports = function (router) {
  // create 10 digits string with seconds leading 0
  _ceateFilename = (int) => {
    if (typeof int !== 'string') int = int.toString()
    while (int.length < 10) int = '0' + int
    return int
  }
  // save svg
  router.route('/track/save/svg/:id').post((req, res) => {
    if (!fs.existsSync(`./data/${req.params.id}`)){
      fs.mkdirSync(`./data/${req.params.id}`);
    }
    let fileName = _ceateFilename(req.body.time)
    fs.writeFile(`./data/${req.params.id}/${fileName}.svg`, req.body.raw, function(err) {
      console.log(err);
    });
    res.send('Svg saved')
  })
}
