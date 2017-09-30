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

var dataCollection0;
var userCollection;
var dataCollection;
var url = 'mongodb://localhost:27017/cs279';

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected correctly to server");
    dataCollection0 = db.collection('dataCollectionDev'); //I recorded the first participant in the wrong collection
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

app.post('/getData', function(req, res) {
    // res.setHeader('Content-Type', 'application/json');
    getData(function(d) {
        //res.send(JSON.stringify(d));
        res.json(d);
    })
});

function getData(callback) {
    console.log("fetching the data...");
    var formattedData = [];
    dataCollection0.find({username: "kp"}).toArray(function(err, docs) {
        assert.equal(err, null);
        docs.forEach(function (d) {
            formatDatumFull(d);
            formattedData.push(d);
        });
        console.log("fetched from dataCollection0...");
    });

    //main collection query
    dataCollection.find({username: {$exists: true}}).toArray(function (err, docs) {
        assert.equal(err, null);
        docs.forEach(function (d) {
            formatDatumFull(d);
            formattedData.push(d);
        });
        //return
        console.log("fetched from dataCollection...");
        console.log("fetching complete");
        setTimeout(function() {callback(formattedData);}, 500); //TODO: dangerous, may return before datacollection0 finishes
    });
}

function formatDatumFull(d) {
    resetTime(d.coordinates, true);
    d.mcoordinates = d.coordinates.map(move);
    d.rcoordinates = rotateEntry(d, "mcoordinates");
    d.maxDev = maxDeviation(d.rcoordinates);
}


//***************************************************
//                 HELPERS
//***************************************************
var lp = {x: 59, y: 97};   //left point
var rp = {x: 967, y: 97};    //right point
var sp = {x: 512, y: 510};  //start point

var lv = {x: lp.x - sp.x, y: sp.y - lp.y}; //inverse y axis here
var rv = {x: rp.x - sp.x, y: sp.y - rp.y}; //inverse y axis here

var aL = Math.PI - Math.atan2(lv.y, lv.x); //rotate counter clockwise to reach 180 degrees
var aR = -Math.atan2(rv.y, rv.x); //negative because we want to rotate clockwise to 0

function move(p) {
    //set starting point as 0
    //starting point is at (512, 510)
    return {x: p.x-sp.x, y: sp.y - p.y, t: p.t} //inverse y axis here
}

function rotate(p, a) {
    var rx = p.x * Math.cos(a) - p.y * Math.sin(a);
    var ry = p.y * Math.cos(a) + p.x * Math.sin(a);
    return {x: rx, y: ry, t: p.t}
}

function rotateEntry(data, coordinates) {
    if (!coordinates) coordinates = "coordinates";
    var rotatedCoords = [];
    if (data.area < 1) { //left image is correct
        data[coordinates].forEach(function (p) {
            var rlp = rotate(p, aL);
            rotatedCoords.push(rlp);
        })
    }
    else { //right image is correct
        data[coordinates].forEach(function (p) {
            var rrp = rotate(p, aR);
            rotatedCoords.push(rrp);
        })
    }
    return rotatedCoords;
}

function maxDeviation(coords) {
    var max = 0;
    coords.forEach(function(p) {
        if (p.y > max) max = p.y;
    });
    return max;
}

function resetTime(coordinates, seconds) {
    var t0 = coordinates[0].t;
    coordinates.forEach(function(p) {
        p.t = p.t - t0;
        if (seconds) p.t *= 0.001;
    })
}