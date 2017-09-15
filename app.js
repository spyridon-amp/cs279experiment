var express = require('express');
var app = express();
var http=require('http');

app.use(express.static(__dirname + '/public'));

var server = app.listen(process.env.PORT || 1234, function() {
    console.log('Listening on port %d', server.address().port);
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    console.log("CONNECTION");
    socket.emit('hello', {});

    socket.on('mouseCoords', function(d) {
        //store the coordinates to a database
    })

});

//TODO: database. what structure? should have usernames with corresponding data