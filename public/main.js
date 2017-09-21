//initialize socket.io and set listeners
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
        if (transmit) return;

        ShowNextPair();
        transmit = true;
        socket.emit("newSet", getMouseLocation(e, central));
        $("#mouseCoords").removeClass("mouseCoords");
        $("#mouseCoords").addClass("mouseCoordsAnimated");
    };

    imgLeft.onclick = imgRight.onclick = function(e) {
        if (!transmit) return;

        transmit = false;
        var pos = getMouseLocation(e, central);
        socket.emit("selection", {id: id, username: userName, coordinates: pos, selection: this.id});
        $("#mouseCoords").removeClass("mouseCoordsAnimated");
        $("#mouseCoords").addClass("mouseCoords");
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
        socket.emit("tracking", {id: id, username: userName, coordinates: pos});
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

function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    //picking ratio
    var ratio = 1 + Math.floor(Math.random()*15) * 1/3;
    if (Math.random() >= 0.5)  {
      ratio = 1/ratio;
    }
    // selecting a random area factor
  var area = [.65, .75, .85, 1.15, 1.25, 1.35];
  var pickarea = function () {
  var randomarea = area_factor[Math.floor(Math.random()* 5)];
  return randomarea;
   };
   //set width and height formulas
   var w = ratio*sqrt((pickarea*22500)/ratio;                  
   var h = sqrt((pickarea*22500)/ratio;
    //draw rectangle
    ctx.fillRect(500, 200, w, h);
    //notes: rect(width/2, height/2, ratio*sqrt(area/ratio), sqrt(area/ratio) ); //w**2 * 2 = area => w = sqrt(area/2)
 
  }
}
