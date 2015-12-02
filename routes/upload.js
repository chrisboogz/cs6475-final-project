var express = require('express');
var lwip = require('lwip');
var mime = require('mime');
var PNG = require('pngjs').PNG;

var storage = require('../storage/storage');
var router = express.Router();

function uploadImage(req, res) {
    if(!req.file || !req.file.buffer) {
        res.status(400).send('upload missing image');
        return;
    }

    var imageBuffer = req.file.buffer;
    var fileExtension = mime.extension(req.file.mimetype);

    if(fileExtension !== 'png' && fileExtension !== 'jpeg') {
        res.status(400).send('only jpeg and png formats are supported');
        return;
    }

    lwip.open(imageBuffer, fileExtension, function(err, image) {
        var params = {
            compression: "fast",
            interlaced: false
        };

        image.toBuffer("png", params, function(err, buffer) {
            new PNG().parse(buffer, function(err, data) {

                storage.put(data, function(id) {
                    res.status(200).send(id);
                });
            });
        });
    });
}

router.post('/', uploadImage);

module.exports = router;