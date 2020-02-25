var express = require('express');
var app = express();
app.use(express.static('public'));

app.get('/api/login', function (req, res) {
  res.send('this is login test api');
});
app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
});
