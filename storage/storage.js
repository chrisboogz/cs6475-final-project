var _ = require('lodash');

var images = {};

function put(image) {
    images[image.id] = image;
}

function get(id) {
    return _.cloneDeep(images[id]);
}

function getAll() {
    var result = [];
    for(var id in images) {
        result.push(images[id]);
    }
    return result;
}

function remove(id) {
    delete images[id];
}

module.exports = {
    put: put,
    get: get,
    getAll: getAll,
    remove: remove
};