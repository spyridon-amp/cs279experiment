var userName;
var id = "none";
var recording = false;
var coordsTrack = [];
var practiceRun = true;
var practiceIt = 0;
var currentRound = 0;
var totalRounds = 5;
var score = 0;
var pickarea;
var ratio;

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
                loadMain();
            },

            error: function () {
                console.log('process error');
            }
        }
    );
}

var alertrunning = false;
function checkWindowSize() {
    setTimeout(function() {
        if (!alertrunning && (window.innerWidth < 1024 || window.innerHeight < 720)) {
            alertrunning = true;
            alert("You need to resize the browser window to a minimum width of 1024px " +
                "and a minimum height of 720px. " +
                "Resize or use fullscreen mode and click ok to continue.");
            setTimeout(checkWindowSize(), 1000);
        }
        else {
            alertrunning = false;
        }
    }, 1000);
}

$(window).on('resize', function () {
        checkWindowSize();
});

function loadMain() {
    $("#content").load("mainTask.html #content", Mainonload);
}

function Mainonload() {
    var central = document.getElementById("central");
    var displayBar = document.getElementById("displayBar");
    var displayRect = displayBar.getBoundingClientRect();
    var target = document.getElementById("target");

    var centralRect = central.getBoundingClientRect();
    var imgLeft = document.getElementById("leftImage");
    var imgRight = document.getElementById("rightImage");
    var startPos = document.getElementById("startPosition");
    imgLeft.style.top = 50 + "px";
    imgLeft.style.left = centralRect.width*0.5 - 500 + "px";
    imgRight.style.top = imgLeft.style.top;
    imgRight.style.left = centralRect.width*0.5 + 500 - imgRight.clientWidth + "px";

    displayBar.style.top = 50 + "px";
    displayBar.style.left = centralRect.width*0.5 - displayRect.width*0.5 + "px";
    target.style.top = 510 - target.clientHeight*0.5 + "px";
    target.style.left = (centralRect.width - target.clientWidth) * 0.5 + "px";
    startPos.style.left = (centralRect.width - startPos.clientWidth) * 0.5 + "px";
    startPos.style.top = 510 - startPos.clientHeight*0.5 + "px";
    target.style.display = "none";

    startPos.onclick = function (e) {
        //inactive while recording
        if (recording) return;

        //count number of  rounds
        if (practiceRun) practiceIt ++;
        else currentRound ++;

        //draw rect to be classified
        var target = document.getElementById("target");
        target.style.display = "block";
        draw();

        //start recording mouse
        if (!practiceRun) {
            recording = true;
            coordsTrack = [];
            coordsTrack.push(getMouseLocation(e, central));
            //turn on blink on debugging
            $("#mouseCoords").removeClass("mouseCoords");
            $("#mouseCoords").addClass("mouseCoordsAnimated");
        }
    };

    imgLeft.onclick = imgRight.onclick = function (e) {
        target.style.display = "none";

        if (practiceRun && practiceIt >= 5) {
            practiceRun = false;
            $("#content").load("waiting.html #content");
        }
        if (currentRound >= totalRounds) {
            $("#content").load("end.html #content", function() {
                document.getElementById("score").innerHTML = score + "/" + totalRounds;
            });
        }

        if (!practiceRun && ((pickarea > 1 && this.id === "rightImage") || (pickarea < 1 && this.id === "leftImage"))) {
            score ++;
        }

        //stop recording and send data to server
        if (recording) {
            recording = false;
            var data = {
                id: id,
                username: userName,
                selection: this.id,
                coordinates: coordsTrack,
                area: pickarea,
                ratio: ratio
            };
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
            //turn off blink on debugging
            $("#mouseCoords").removeClass("mouseCoordsAnimated");
            $("#mouseCoords").addClass("mouseCoords");
        }
    };

    central.onmousemove = MouseTrack;
    imgLeft.onmousemove = imgRight.onmousemove = startPos.onmousemove = MouseTrack;

    draw();
    drawtop();

    checkWindowSize();
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

function CheckName() {
    var name = document.getElementById("userName");
    name.focus();
    var button = document.getElementById("uNButton");
    var errmessage = document.getElementById("nameError");
    var noerr = document.getElementById("noError");
    name.onkeyup = function (e) {
        var s = name.value.length;
        if (s === 1) {
            errmessage.style.display = "block";
            noerr.style.display = "none";
            button.disabled = true;
        }
        else {
            if (s > 2) {
                name.value = name.value.substring(0, 2);
            }
            if (s !== 0) {
                button.disabled = false;
            }
            errmessage.style.display = "none";
            noerr.style.display = "block";
        }
        if (e.key === "Enter" && !button.disabled) {
            Login();
        }
    }
}

function draw() {
    var target = document.getElementById('target');
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
        var area = [.65, .75, .85, 1.15, 1.25, 1.35];
        pickarea = area[Math.floor(Math.random() * 5)];
        //set width and height formulas
        var w = ratio * Math.sqrt((pickarea * 22500) / ratio);
        var h = Math.sqrt((pickarea * 22500) / ratio);
        //draw rectangle
        ctx.fillRect((target.clientWidth - w)*0.5, (target.clientHeight - h)*0.5, w, h);
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
