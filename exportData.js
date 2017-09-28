var fs = require('fs');
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
    userCollection = db.collection('userCollectionPhase1'); //just user names and ids
    dataCollection = db.collection('dataCollectionPhase1'); //the rest of the participants are here
    main();
});

/*userids = [];
userCollection.find({user: {$exists: true}}).toArray(function(err, docs) {
    docs.forEach(function(d) {
        userids.push(d.userName);
    })
});*/

function main() {
    var formattedData = [];
    dataCollection0.find({username: 'kp'}).toArray(function(err, docs) {
        assert.equal(err, null);
        docs.forEach(function (d) {
            //check if answer is correct
            if ((d.selection === "leftImage" && d.area < 1) ||
                (d.selection === "rightImage" && d.area > 1)) {
                //calculate and add max deviation
                var entry = formatDatumStack(d);
                formattedData.push(entry);
            }

            //main collection query
            dataCollection.find({username: {$exists: true}}).toArray(function (err, docs) {
                assert.equal(err, null);
                docs.forEach(function (d) {
                    if ((d.selection === "leftImage" && d.area < 1) ||
                        (d.selection === "rightImage" && d.area > 1)) {
                        //calculate and add max deviation
                        var entry = formatDatumStack(d);
                        formattedData.push(entry);
                    }
                });
                //export
                var json = JSON.stringify(formattedData);
                fs.writeFileSync("./formattedDataStack.json", json, 'utf8');
                console.log("data written correctly");
                process.exit(0);
            });
            //.....................

        });
    });
}

function formatDatumSplit(d) {
    //calculate and add max deviation
    d.coordinates = d.coordinates.map(move);
    d.coordinates = rotateEntry(d);
    var maxDev = maxDeviation(d.coordinates);
    var entry = {};
    entry.id = d.id;
    entry.username = d.username;
    var ratio = "ratio " + d.ratio.toFixed(2);
    entry[ratio] = maxDev;
    return entry;
}

function formatDatumStack(d) {
    d.coordinates = d.coordinates.map(move);
    d.coordinates = rotateEntry(d);
    var maxDev = maxDeviation(d.coordinates);
    var entry = {};
    entry.id = d.id;
    entry.username = d.username;
    entry.ratio = d.ratio;
    entry.area = d.area;
    entry.maxDeviation = maxDev;
    return entry;
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

function rotateEntry(data) {
    var rotatedCoords = [];
    if (data.area < 1) { //left image is correct
        data.coordinates.forEach(function (p) {
            var rlp = rotate(p, aL);
            rotatedCoords.push(rlp);
        })
    }
    else { //right image is correct
        data.coordinates.forEach(function (p) {
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