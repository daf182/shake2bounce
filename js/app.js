/**
 * This sample demonstrates how to access the accelerometer, vibration motor
 * or the proximity sensor in Firefox OS.
 * A magenta circle is drown onto a canvas.
 * Features:
 *  - if your finger is close enough to the phone the circle becomes green
 *  - if you shake the phone the ball starts moving
 *  - if the ball reaches one of the wall it turns back and the phone vibrate
 */
var app = (function Application() {

    var canvas = null;
    var context = null;
    var centerX = null;
    var centerY = null;
    var radius = 10;
    var velocityX= 2;
    var velocityY = 2;
    var width = 0;
    var height = 0;
    var animationRunning = false;
    var animationId;
    var proximityClose = false;
    var shakeThreshold = 25; /* m/s */
    var proximityThreshold = 10; /* cm */

    function init () {
        canvas = document.getElementById("canvas");
        context = canvas.getContext('2d');
        centerX = canvas.width / 2;
        centerY = canvas.height / 2;
        width = canvas.width;
        height = canvas.height;
        animate();
    }

    function drawCircle (x, y) {
        context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI, true);
        if (proximityClose) {
            context.fillStyle = '#A7D30C';
        } else {
            context.fillStyle = '#FF5F98';
        }
        context.fill();
        context.stroke();
    }

    function writeHelpText() {
        context.font = '10pt Arial';
        context.fillStyle = '#aaaaaa';
        context.fillText('Razd meg, hogy elinduljon!/Shake to start!', 30, canvas.height/2-20);
        context.fillText('Takard el es szint valt!/Cover to change color!', 30, 20);
    }

    function animate() {
        if (animationRunning) {
            if (centerX-radius <= 0 || centerX+radius >= width) {
                velocityX = -velocityX;
                vibrate();
            }
            if (centerY-radius <= 0 || centerY+radius >= height) {
                velocityY = -velocityY;
                vibrate();
            }
            centerX += velocityX;
            centerY += velocityY;
        }
        context.clearRect(0, 0, width, height);
        writeHelpText();
        drawCircle(centerX, centerY);
    }

    function vibrate() {
        if ('vibrate' in navigator) {
            window.navigator.vibrate(50);
        }
    }

    function shake (event) {
        var shaked = true;
        if (event && event.accelerationIncludingGravity) {
            shaked = isShaked(event.accelerationIncludingGravity);
        }

        if (shaked) {
            if (animationRunning) {
                animationRunning = false;
                clearInterval(animationId);
            } else {
                animationRunning = true;
                animationId = setInterval(animate, 33);
            }
        }
    }

    function isShaked(acceleration) {
        return acceleration.x > shakeThreshold
              || acceleration.y > shakeThreshold
              || acceleration.z > shakeThreshold;
    }

    function proximityHandler (event) {
        if (event.value) {
            proximityClose = event.value > proximityThreshold;
        } else {
            proximityClose = !proximityClose;
        }
        if (!animationRunning) {
            drawCircle(centerX, centerY);
        }
    }

    return {
        init : init,
        shake : shake,
        proximityHandler : proximityHandler
    }
})();

function init() {
    //var status = document.getElementById("status");
    var shake = document.getElementById("canvas");
    var proximityButton = document.getElementById("changeColor");
    app.init();
    if ('onuserproximity' in window) {
        window.addEventListener('userproximity', app.proximityHandler);
        proximityButton.style.display = "none";
    } else {
        proximityButton.addEventListener("click", app.proximityHandler);
    }
    if ('ondevicemotion' in window) {
        window.addEventListener("devicemotion", app.shake, true);
    } else {
        shake.addEventListener("click", app.shake);
    }
}

window.addEventListener("load", init);
