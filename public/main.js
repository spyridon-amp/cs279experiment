var userName;
var id = "none";
var recording = false;
var coordsTrack = [];

function Login() {
    userName = document.getElementById("userName").value;
    $.ajax({url: "/user",
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
        if (recording) return;

        ShowNextPair();
        recording = true;
        coordsTrack = [];
        coordsTrack.push(getMouseLocation(e, central));
        $("#mouseCoords").removeClass("mouseCoords");
        $("#mouseCoords").addClass("mouseCoordsAnimated");
    };

    imgLeft.onclick = imgRight.onclick = function(e) {
        if (!recording) return;

        recording = false;
        var pos = getMouseLocation(e, central);
        //TODO: ADD RATIO AND AREA TO data
        var data = {id: id, username: userName, selection: this.id, coordinates: coordsTrack};
        $.ajax({url: "/data",
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

function ShowNextPair() {

}