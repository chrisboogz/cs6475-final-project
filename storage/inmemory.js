var _ = require('lodash');
var id = require('../id');
var images = {};

function put(image, callback) {
    image._id = id.generate();
    images[image._id] = image;

    callback(image._id);
}

function get(id, callback) {
    callback(_.cloneDeep(images[id]));
}

function getAll(callback) {
    var result = [];
    for(var id in images) {
        result.push(images[id]);
    }
    
    callback(result);
}

function remove(id) {
    var image = images[id];
    delete images[id];

    callback(image);
}

module.exports = {
    put: put,
    get: get,
    getAll: getAll,
    remove: remove
};