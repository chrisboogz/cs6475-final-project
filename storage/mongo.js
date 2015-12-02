var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;

var config = require('config');

var url = config.db.url;
var db, images;

var dbEnabled = process.env.DB || config.db.enabled;

if(dbEnabled) {
    MongoClient.connect(url, function(err, database) {
        if(!err) {
            db = database;
            images = database.collection('images');
            console.log("MongoDB connection established");
        }
        else {
            console.log("Error establishing MongoDB connection");
        }
    });
}

function put(image, callback) {
    if(!images) {
        return;
    }

    images.insert(image, function(err, result) {
        if(err) {
            console.log('Error: ' + err);
            return;
        }
        console.log("Image inserted");
        callback(result.insertedIds[0]);
    });
}

function get(id, callback) {
    if(!images) {
        return;
    }

    var o_id = new ObjectID(id);
    images.find({ "_id": o_id}).next(function(err, doc) {
        if(err) {
            console.log('Error: ' + err);
            return;
        }
        if(doc) {
            doc.data = doc.data.buffer;
            callback(doc);
        }
        else {
            callback();
        }
    });
}

function getAll(callback) {
    if(!images) {
        return;
    }

    var results = [];
    images.find({}).each(function(err, doc) {
        if(err) {
            console.log('Error: ' + err);
            return false;
        }
        if(doc) {
            doc.data = doc.data.buffer;
            results.push(doc);
        }
        else {
            callback(results);
        }
    });
}

function remove(id, callback) {
    if(!images) {
        return;
    }

    var o_id = new ObjectID(id);
    images.deleteOne({ "_id": o_id}, function(err, r) {
        if(!err) {
            console.log("Image removed");
            callback();
        }
        else {
            console.log('Error: ' + err);
        }
    });
}

module.exports = {
    put: put,
    get: get,
    remove: remove,
    getAll: getAll
};