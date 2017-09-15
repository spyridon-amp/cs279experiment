var socket = io('http://127.0.0.1:9876');

socket.on('hello', function () {
    console.log('got hello!');
});

socket.on('uniqueId', function(d) {
   id = d.id;
});

var userName;
var id = "none";
var transmit = false;

function Login() {
    userName = document.getElementById("userName").value;
    socket.emit("userName", {user: userName});

    $("#content").load("mainTask.html #content", Mainonload);
}

function Mainonload() {
    var central = document.getElementById("central");
    var topBarRect = document.getElementById("topBar").getBoundingClientRect();
    central.style.top = topBarRect.top + topBarRect.height + "px";
    central.style.height = window.innerHeight - parseInt(central.style.top) + "px";

    var centralRect = central.getBoundingClientRect();
    var imgLeft = document.getElementById("leftImage");
    var imgRight = document.getElementById("rightImage");
    var startPos = document.getElementById("startPosition");
    imgLeft.style.top = centralRect.top + 50 + "px";
    imgLeft.style.left = centralRect.left + 50 + "px";
    imgRight.style.top = imgLeft.style.top;
    imgRight.style.left = centralRect.left + centralRect.width - 50 - imgRight.clientHeight + "px";
    startPos.style.left = (centralRect.left + centralRect.width - startPos.clientWidth) * 0.5 + "px";
    startPos.style.top =  centralRect.top + centralRect.height - startPos.clientHeight - 50 + "px";

    startPos.onclick = function(e) {
        ShowNextPair();
        transmit = true;
        socket.emit("newSet", getMouseLocation(e, central));
    };

    imgLeft.onclick = imgRight.onclick = function(e) {
        transmit = false;
        socket.emit("endSet", getMouseLocation(e, central));
    };

    central.onmousemove = MouseTrack;
    imgLeft.onmousemove = imgRight.onmousemove = startPos.onmousemove = MouseTrack;
}

function MouseTrack(e) {
    var central = document.getElementById("central");
    var mouseCoords = document.getElementById("mouseCoords");
    var pos = getMouseLocation(e, central);
    mouseCoords.value = "[" + pos.x + ", " + parseInt(pos.y) + "]";
    if (transmit) {
        mouseCoords.style.background = "magenta";
        socket.emit('mouseCoords', pos);
    }
    else {
        mouseCoords.style.background = "white";
    }
}


function getMouseLocation(_event, _element) {
    var rect = _element.getBoundingClientRect();
    return {x: _event.clientX - rect.left, y: _event.clientY - rect.top};
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function CheckName() {
    var name = document.getElementById("userName");
    name.focus();
    var button = document.getElementById("uNButton");
    var errmessage = document.getElementById("nameError");
    name.onkeyup = function (e) {
        var s = name.value.length;
        if (s === 1) {
            errmessage.style.display = "block";
            button.disabled = true;
        }
        else {
            if (s > 2) {
                name.value = name.value.substring(0, 2);
            }
            errmessage.style.display = "none";
            button.disabled = false;
        }
        if (e.key === "Enter" && !button.disabled) {
            Login();
        }
    }
}

function ShowNextPair() {

}