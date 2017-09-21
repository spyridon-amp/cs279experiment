var userName;
var id = "none";
var recording = false;
var coordsTrack = [];

function Login() {
    userName = document.getElementById("userName").value;
    $.ajax({
            url: "/user",
            type: "POST",
            dataType: "json",
            data: JSON.stringify({user: userName}),
            contentType: "application/json",
            cache: false,
            timeout: 5000,
            complete: function () {
                //called when complete
                console.log('process complete');
            },

            success: function (data) {
                console.log(JSON.stringify(data));
                console.log('process sucess');
                id = data.id;
                $("#content").load("mainTask.html #content", Mainonload);
            },

            error: function () {
                console.log('process error');
            }
        }
    );
}

function Mainonload() {
    var central = document.getElementById("central");
    var topBarRect = document.getElementById("topBar").getBoundingClientRect();
    var displayBar = document.getElementById("displayBar");
    var displayRect = displayBar.getBoundingClientRect();
    var target = document.getElementById("target");
    var targetRect = target.getBoundingClientRect();
    central.style.top = topBarRect.top + topBarRect.height + "px";
    //central.style.height = window.innerHeight - parseInt(central.style.top) + "px";

    var centralRect = central.getBoundingClientRect();
    var imgLeft = document.getElementById("leftImage");
    var imgRight = document.getElementById("rightImage");
    var startPos = document.getElementById("startPosition");
    imgLeft.style.top = centralRect.top + 50 + "px";
    imgLeft.style.left = centralRect.left + centralRect.width*0.5 - 500 + "px";
    imgRight.style.top = imgLeft.style.top;
    imgRight.style.left = centralRect.left + centralRect.width*0.5 + 500 - imgRight.clientWidth + "px";

    displayBar.style.top = centralRect.top + 50 + "px";
    displayBar.style.left = centralRect.left + centralRect.width*0.5 - displayRect.width*0.5 + "px";
    target.style.top = centralRect.top + 600 - targetRect.height*0.5 + "px";
    target.style.left = centralRect.left + centralRect.width*0.5 - targetRect.width*0.5 + "px";
    startPos.style.left = (centralRect.left + centralRect.width - startPos.clientWidth) * 0.5 + "px";
    startPos.style.top = centralRect.top + 600 - startPos.clientHeight*0.5 + "px";
    target.style.display = "none";

    startPos.onclick = function (e) {
        if (recording) return;

        recording = true;
        var target = document.getElementById("target");
        var targetRect = target.getBoundingClientRect();
        target.style.display = "block";
        draw();
        coordsTrack = [];
        coordsTrack.push(getMouseLocation(e, central));
        $("#mouseCoords").removeClass("mouseCoords");
        $("#mouseCoords").addClass("mouseCoordsAnimated");
    };

    imgLeft.onclick = imgRight.onclick = function (e) {
        if (!recording) return;

        recording = false;
        target.style.display = "none";
        var data = {id: id, username: userName, selection: this.id, coordinates: coordsTrack, area: area, ratio: ratio};
        $.ajax({
                url: "/data",
                type: "POST",
                dataType: "json",
                data: JSON.stringify(data),
                contentType: "application/json",
                cache: false,
                timeout: 5000,
                complete: function () {
                    //called when complete
                    console.log('process complete');
                },

                success: function (data) {
                    console.log(JSON.stringify(data));
                    console.log('process sucess');
                },

                error: function () {
                    console.log('process error');
                }
            }
        );
        $("#mouseCoords").removeClass("mouseCoordsAnimated");
        $("#mouseCoords").addClass("mouseCoords");
    };

    central.onmousemove = MouseTrack;
    imgLeft.onmousemove = imgRight.onmousemove = startPos.onmousemove = MouseTrack;

    draw();
    drawtop();
}

function MouseTrack(e) {
    var central = document.getElementById("central");
    var mouseCoords = document.getElementById("mouseCoords");
    var pos = getMouseLocation(e, central);
    mouseCoords.value = "[" + pos.x + ", " + parseInt(pos.y) + "]";
    if (recording) {
        coordsTrack.push(getMouseLocation(e, central));
    }
}

function getMouseLocation(_event, _element) {
    var rect = _element.getBoundingClientRect();
    return {x: _event.clientX - rect.left, y: _event.clientY - rect.top, t: Date.now()};
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

var area;
var ratio;
function draw() {
    var target = document.getElementById('target');
    var tRect = target.getBoundingClientRect();
    if (target.getContext) {
        console.log("drawing target");
        var ctx = target.getContext('2d');
        ctx.clearRect(0, 0, target.width, target.height);
        //picking ratio
        ratio = 1 + Math.floor(Math.random() * 15) / 3;
        if (Math.random() >= 0.5) {
            ratio = 1 / ratio;
        }
        // selecting a random area factor
        area = [.65, .75, .85, 1.15, 1.25, 1.35];
        var pickarea = area[Math.floor(Math.random() * 5)];
        //set width and height formulas
        var w = ratio * Math.sqrt((pickarea * 22500) / ratio);
        var h = Math.sqrt((pickarea * 22500) / ratio);
        //draw rectangle
        ctx.fillRect(tRect.width/2 - w/2, tRect.height/2 - h/2, w, h);
        //notes: rect(width/2, height/2, ratio*sqrt(area/ratio), sqrt(area/ratio) ); //w**2 * 2 = area => w = sqrt(area/2)

    }
}

function drawtop() {
    var display = document.getElementById('displayBar');
    if (display.getContext) {
        var ctx = display.getContext('2d');
        var X = display.width / 2;
        var Y = display.height / 2;
        var R = 45;
        ctx.beginPath();
        ctx.arc(X - 300, Y, R, 0, 2 * Math.PI, false);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#a9a9a9';
        ctx.stroke();
        ctx.font = "20px Arial";
        ctx.fillText("Smaller", X - 333, Y + 5);
        ctx.beginPath();
        ctx.arc(X + 300, Y, R, 0, 2 * Math.PI, false);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#a9a9a9';
        ctx.stroke();
        ctx.font = "20px Arial";
        ctx.fillText("Larger", X + 272, Y + 5);
        ctx.fillRect(X - 75, Y - 75, 150, 150);
    }
}