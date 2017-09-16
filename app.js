var express = require('express');
var app = express();
var http=require('http');

//serve client webpage
app.use(express.static(__dirname + '/public'));

var server = app.listen(process.env.PORT || 9876, function() {
    console.log('Listening on port %d', server.address().port);
});

//initialize mongodb for data storage
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var userCollection;
var dataCollection;
var url = 'mongodb://localhost:27017/cs279';

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    db.createCollection('userCollectionDev', {safe:false}, function (err, collection) {
        console.log("userCollectionDev collection error:"+err);
        userCollection=collection;
    });
    db.createCollection('dataCollectionDev', {safe:false}, function (err, collection) {
        console.log("dataCollectionDev collection error:"+err);
        dataCollection=collection;
    });
});

//socket.io connection for data collection
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    console.log("CONNECTION");
    socket.emit('hello', {});

    socket.on('userName', function(d) {
       userCollection.insertOne(d, function() {
           socket.emit('uniqueId', {id: d._id});
       });
    });

    socket.on('mouseCoords', function(d) {
        //console.log(d);
        //store the coordinates to a database
    });

    socket.on('newSet', function(d) {
        console.log(d);
    });

    socket.on('selection', function(d) {
        console.log(d);
    });

});