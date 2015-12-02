var express = require('express');
var lwip = require('lwip');
var PNG = require('pngjs').PNG;
var q = require('q');

var storage = require('../storage/storage');
var filters = require('../processing/filters');

var router = express.Router();

function getImage(req, res) {
    var id = req.params.id;

    storage.get(id, function(imageData) {
        if(!imageData) {
            res.status(400).send('invalid id');
            return;
        }

        makePng(imageData, res).then(function(image) {
            res.status(200).send(image);
        });
    });
}

function getAll(req, res) {
    storage.getAll(function(data) {
        var promises = [];
        var images = [];

        function addPng(image, id) {
            images.push(image);
        }

        for(var i=0; i<data.length; i++) {
            var promise = makePng(data[i]);

            promise.then(addPng);
            promises.push(promise);
        }

        q.all(promises).then(function() {
            res.status(200).send(images);
        });
    });
}

function getFiltered(req, res) {
    var id = req.params.id;
    var filter = req.params.filter;
    storage.get(id, function(imageData) {
        if(!imageData) {
            res.status(400).send('invalid id');
            return;
        }

        if(filter === 'blur') {
            imageData = filters.blur(imageData);
        }
        else if(filter === 'sharpen') {
            imageData = filters.sharpen(imageData);
        }
        else if(filter === 'emboss') {
            imageData = filters.emboss(imageData);
        }
        else if(filter === 'grayscale') {
            imageData = filters.grayscale(imageData);
        }

        makePng(imageData, res).then(function(image) {
            res.status(200).send(image);
        });
    });
}

function makePng(imageData) {
    var deferred = q.defer();

    var png = new PNG({
        width: imageData.width,
        height: imageData.height
    });

    imageData.data.copy(png.data, 0, 0, imageData.data.length);

    var buffers = [];

    png.on('data', function(buffer) {
        buffers.push(buffer);
    });

    png.on('end', function() {
        var buffer = Buffer.concat(buffers);

        var image = {
            id: imageData._id,
            data: 'data:image/png;base64,' + buffer.toString('base64')
        };

        deferred.resolve(image);
    });

    png.on('error', function(err) {
        throw err;
    });

    png.pack();

    return deferred.promise;
}

function removeImage(req, res) {
    var id = req.params.id;
    if(id) {
        storage.remove(id, function() {
            res.status(200).send();
        });
    }
    else {
        res.status(400).send("need to provide an id");
    }
}

router.get('/', getAll);
router.get('/:id', getImage);
router.get('/:id/:filter', getFiltered);
router.delete('/:id', removeImage);

module.exports = router;