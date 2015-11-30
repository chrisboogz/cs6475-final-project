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

var server = app.listen(config.server.port, function() {
    console.log("Listening on port " + config.server.port);
});