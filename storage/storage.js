var config = require('config');

var dbEnabled = process.env.DB || config.db.enabled;

var storage;

if(dbEnabled) {
    storage = require('./mongo');
}
else {
    storage = require('./inmemory');
}

module.exports = storage;