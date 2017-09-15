var socket=io('http://127.0.0.1:9876');

socket.on('hello', function() {
    console.log('got hello!');
});

$(document).ready(
    function() {
        var central = document.getElementById("central");
        var mouseCoords = document.getElementById("mouseCoords");

        central.onmousemove = function(e) {
            var pos = getMouseLocation(e, central);
            mouseCoords.value = "[" + pos.x + ", " + parseInt(pos.y) + "]";

            socket.emit('mouseCoords', pos);
        }
    }
);

function getMouseLocation(_event, _element) {
    var rect = _element.getBoundingClientRect();
    return {x:_event.clientX - rect.left, y:_event.clientY - rect.top};
}
