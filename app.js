var express = require('express');
var app = express();
var http=require('http');
var bodyParser = require('body-parser');

//serve client webpage
app.use(express.static(__dirname + '/public'));

//enable parsing of received messages
app.use(bodyParser.json()); // for parsing application/json

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
    db.createCollection('userCollectionPhase1', {safe:false}, function (err, collection) {
        console.log("userCollection collection error:"+err);
        userCollection=collection;
    });
    db.createCollection('dataCollectionPhase1', {safe:false}, function (err, collection) {
        console.log("dataCollection collection error:"+err);
        dataCollection=collection;
    });
});

app.post('/user', function(req, res) {
    userName = req.body.user;
    userCollection.insertOne(req.body, function() {
        res.contentType('json');
        res.send(JSON.stringify({id: req.body._id}));
    })
});

app.post('/data', function(req, res) {
    var data = req.body;
    console.log(data);
    dataCollection.insertOne(data);
});
