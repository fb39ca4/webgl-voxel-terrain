window.addEventListener("load", function() {
    keyboard = {};
    keyboardDisplay = document.getElementById("keyboardDisplay");
    window.addEventListener('keydown', function(event) {
        keyboard[event.keyCode] = true;
        keyboardDisplay.textContent = "Keyboard: " + JSON.stringify(keyboard);
    });
    window.addEventListener('keyup', function(event) {
        delete keyboard[event.keyCode];
        keyboardDisplay.textContent = "Keyboard: " + JSON.stringify(keyboard);
    });
    mouse = {click:false};
    mouseDisplay = document.getElementById("mouseDisplay");
    window.addEventListener('mousedown', function(event) {
        mouse.click = true;
        mouseDisplay.textContent = "Mouse: " + JSON.stringify(mouse);
    });
    window.addEventListener('mouseup', function(event) {
        mouse.click = false;
        mouseDisplay.textContent = "Mouse: " + JSON.stringify(mouse);
    });
    window.addEventListener('mousemove', function(event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouseDisplay.textContent = "Mouse: " + JSON.stringify(mouse);
    });
});