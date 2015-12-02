var express = require('express');
var config = require('config');
var multer = require('multer');

var upload = require('./routes/upload');
var images = require('./routes/images');

var app = express();
var storage = multer.memoryStorage();
var imageUpload = multer({ storage: storage });

app.use('/', express.static(__dirname + '/ui'));

app.use('/upload', imageUpload.single('image'), upload);
app.use('/images', images);

var port = process.env.PORT || config.server.port;

var server = app.listen(port, function() {
    console.log("Listening on port " + port);
});