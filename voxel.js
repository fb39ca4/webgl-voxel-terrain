function VoxelEngine() {
    this.chunkSize = 32;
    this.viewDistance = 192;
    this.player = new Player(this.chunkSize);
    this.player.viewDistance = this.viewDistance;
    this.chunkManager = new ChunkManager(this.chunkSize);
    this.chunkManager.viewDistance = this.viewDistance;
    this.lastTick = Date.now();
    this.glh = null;
    
    this.paused = false;
    
    this.playerDisplay = document.getElementById("playerDisplay");
    this.engineDisplay = document.getElementById("engineDisplay");
}

function genVertices() {
    function quad(p, e1, e2, c) {
        var p1 = p.concat([1],c);
        var p2 = [p[0]+e1[0], p[1]+e1[1], p[2]+e1[2], 1].concat(c);
        var p3 = [p2[0]+e2[0], p2[1]+e2[1], p2[2]+e2[2], 1].concat(c);
        var p4 = [p[0]+e2[0], p[1]+e2[1], p[2]+e2[2], 1].concat(c);    
        return [].concat(p1, p2, p3, p1, p3, p4);
    }
    var cubeVertices = [];
    cubeVertices = cubeVertices.concat(quad([-1,-1,1],[2,0,0],[0,2,0],[.5,.5,1,1]));
    cubeVertices = cubeVertices.concat(quad([-1,-1,-1],[0,2,0],[2,0,0],[0,0,1,1]));
    cubeVertices = cubeVertices.concat(quad([-1,1,-1],[0,0,2],[2,0,0],[.5,1,.5,1]));
    cubeVertices = cubeVertices.concat(quad([-1,-1,-1],[2,0,0],[0,0,2],[0,1,0,1]));
    cubeVertices = cubeVertices.concat(quad([1,-1,-1],[0,2,0],[0,0,2],[1,.5,.5,1]));
    cubeVertices = cubeVertices.concat(quad([-1,-1,-1],[0,0,2],[0,2,0],[1,0,0,1]));
    cubeVertices = cubeVertices.concat(quad([-2,-2,-1],[4,0,0],[0,4,0],[0,0,0,1]));
    return new Float32Array(cubeVertices).buffer;
}

VoxelEngine.prototype.renderSetup = function(glHelper) {
    this.glh = glHelper;
    
    this.chunkManager.glBufferCreator = this.glh.createBuffer.bind(this.glh);
    this.chunkManager.glBufferDeleter = this.glh.gl.deleteBuffer;
    
    this.chunkManager.chunkGenerator.priorityFunction = this.player.chunkPriority.bind(this.player);
    
    var vertexShaderSource = "attribute vec4 aPos; attribute vec4 aColor; uniform mat4 uTransform; varying vec4 vColor; void main(void) { gl_Position = uTransform * aPos; vColor = aColor; }"
    var fragmentShaderSource = "precision mediump float; varying vec4 vColor; void main(void) { gl_FragColor = vColor; }"
    var vertexShader = this.glh.loadShaderString(vertexShaderSource, this.glh.gl.VERTEX_SHADER);
    var fragmentShader = this.glh.loadShaderString(fragmentShaderSource, this.glh.gl.FRAGMENT_SHADER);
    this.shaderProgram = this.glh.linkShaderProgram(vertexShader, fragmentShader);
    this.glh.readUniforms(this.shaderProgram, ["uTransform"]);
    this.glh.readVertexAttribs(this.shaderProgram, ["aPos", "aColor"]);
    
    this.glh.gl.enable(this.glh.gl.DEPTH_TEST);
    this.glh.gl.enable(this.glh.gl.CULL_FACE);
    this.glh.gl.clearColor(0,0,0, 1.0);
    this.glh.enableVertexAttribArray(this.shaderProgram);
}

VoxelEngine.prototype.render = function() {
    var matrix = mat4.create();
    var tempVec3 = vec3.create();
    var perspectiveMatrix = mat4.perspective(mat4.create(), 0.8, 16/9, 0.25, 1024.0);
    
    this.glh.gl.clear(this.glh.gl.COLOR_BUFFER_BIT);
    this.glh.gl.useProgram(this.shaderProgram);
    
    var numLoaded = 0;
    var numDrawCalls = 0;
    for (var i in this.chunkManager.chunks) {
        var chunk = this.chunkManager.chunks[i];
        if (chunk.loaded == false) continue;
        numLoaded++;
        if (chunk.empty == true) continue;
        
        numDrawCalls++;
        var modelMatrix = mat4.create();
        vec3.copy(tempVec3, chunk.pos);
        vec3.scale(tempVec3, tempVec3, this.chunkSize);
        mat4.translate(modelMatrix, modelMatrix, tempVec3);
        mat4.multiply(matrix, perspectiveMatrix, this.player.cameraMatrix);
        mat4.multiply(matrix, matrix, modelMatrix);
        
        this.glh.gl.bindBuffer(this.glh.gl.ARRAY_BUFFER, chunk.vertexBuffer);
        this.glh.gl.vertexAttribPointer(this.shaderProgram.vertexAttribs.aPos, 4, this.glh.gl.FLOAT, false, 8 * 4, 0);
        this.glh.gl.vertexAttribPointer(this.shaderProgram.vertexAttribs.aColor, 4, this.glh.gl.FLOAT, false, 8 * 4, 4 * 4);
        this.glh.gl.uniformMatrix4fv(this.shaderProgram.uniforms.uTransform, false, matrix);
        this.glh.gl.drawArrays(this.glh.gl.TRIANGLES, 0, chunk.vertexBuffer.numItems / 32);
    }
    this.engineDisplay.textContent = "Engine: " + JSON.stringify({"Chunks Loaded":numLoaded,"Generation Queue":this.chunkManager.chunkGenerator.queue.length,"Draw Calls":numDrawCalls});
}

VoxelEngine.prototype.tick = function() {
    var now = performance.now();
    var dt;
    if (true) {
        dt = now - this.lastTick;
        dt = Math.min(dt, 1.0 / 20.0);
    }
    this.lastTick = now;
    
    this.chunkManager.deleteFarChunks(this.player);
    this.chunkManager.loadNearChunks(this.player);
    
    this.player.tick(dt);
    this.render();
    this.playerDisplay.textContent = "Player: " + JSON.stringify(this.player.pos);
    
    if (!this.paused) requestAnimationFrame(this.tick.bind(this));
}

function Player(chunkSize) {
    this.chunkSize = chunkSize;
    this.chunkCoordinate = new Coord3();
    this.rotH = 0;
    this.rotV = 0;
    this.moveSpeed = 50;
    
    this.chunkPos = vec3.create();
    this.pos = vec3.create();
    this.view = vec3.create();
    this.viewRight = vec3.fromValues(1,0,0);
    this.viewUp = vec3.fromValues(0,0,1);
    this.viewForward = vec3.fromValues(0,1,0);
    this.viewFocus = vec3.fromValues(0,1,0);
    this.cameraMatrix = mat4.create();
    mat4.lookAt(this.cameraMatrix, this.pos, this.viewForward, this.viewUp);
    this.viewQuat = quat.create();
    quat.fromMat3(this.viewQuat, this.cameraMatrix);
    
    this.tempVec3 = vec3.create();
}

Player.prototype.chunkPriority = function(chunkCoord) {
    function lerp(a, b, t) {
        return a * (1-t) + b * t;
    }
    
    var offset = this.tempVec3;
    vec3.subtract(offset, chunkCoord, this.chunkPos);
    vec3.add(offset, offset, [0.5, 0.5, 0.5]);
    vec3.scale(offset, offset, this.chunkSize);
    vec3.subtract(offset, offset, this.pos);
    
    var distance = vec3.length(offset) / this.viewDistance;
    var forwards = vec3.dot(offset, this.viewForward) / distance;
    
    if (distance < 0.25) return lerp(1, 2/3, distance * 4);
    else if (forwards > 0.75) return lerp(2/3, 1/3, distance * 4/3);
    else return lerp(1/3, 0, distance * 4/3);
}

Player.prototype.normalizePosition = function() {
    modulo = function(a, n) {
        res = a % n;
        if (a < 0) res += n;
        return res;
    }
    var n = this.chunkSize;
    this.chunkCoordinate.x += Math.floor(this.localCoordinate.x / n);
    this.chunkCoordinate.y += Math.floor(this.localCoordinate.y / n);
    this.chunkCoordinate.z += Math.floor(this.localCoordinate.z / n);
    
    this.localCoordinate.x = modulo(this.localCoordinate.x, n);
    this.localCoordinate.y = modulo(this.localCoordinate.y, n);
    this.localCoordinate.z = modulo(this.localCoordinate.z, n);
}

Player.prototype.tick = function(dt) {
    if (typeof(dt) != "number") dt = 1.0 / 60.0;
    //get rotation input
    if (mouse.lastClick == true && mouse.click == true) {
        var dx = mouse.x - mouse.lastX;
        var dy = mouse.y - mouse.lastY;
        this.rotH -= 0.25 * dx * dt;
        this.rotV -= 0.25 * dy * dt; 
    };
    mouse.lastClick = mouse.click;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    
    var rotAmount = 5 * dt;
    if (keyboard[38]) this.rotV += rotAmount;
    if (keyboard[40]) this.rotV -= rotAmount;
    if (keyboard[37]) this.rotH += rotAmount;
    if (keyboard[39]) this.rotH -= rotAmount;
    
    this.rotV = Math.min(this.rotV, 0.95 * Math.PI / 2);
    this.rotV = Math.max(this.rotV, -0.95 * Math.PI / 2);
    
    //update view
    vec3.set(this.viewForward, Math.cos(this.rotV) * Math.cos(this.rotH), Math.cos(this.rotV) * Math.sin(this.rotH), Math.sin(this.rotV));
    vec3.set(this.viewRight, Math.sin(this.rotH), -Math.cos(this.rotH), 0);
    vec3.cross(this.viewUp, this.viewRight, this.viewForward);
       
    var moveAmout = this.moveSpeed * dt;
    if (keyboard[87]) vec3.scaleAndAdd(this.pos, this.pos, this.viewForward, moveAmout);
    if (keyboard[83]) vec3.scaleAndAdd(this.pos, this.pos, this.viewForward, -moveAmout);
    if (keyboard[68]) vec3.scaleAndAdd(this.pos, this.pos, this.viewRight, moveAmout);
    if (keyboard[65]) vec3.scaleAndAdd(this.pos, this.pos, this.viewRight, -moveAmout);
    if (keyboard[82]) vec3.scaleAndAdd(this.pos, this.pos, this.viewUp, moveAmout);
    if (keyboard[70]) vec3.scaleAndAdd(this.pos, this.pos, this.viewUp, -moveAmout);
    
    vec3.add(this.viewFocus, this.pos, this.viewForward); 
    this.cameraMatrix = mat4.create();
    mat4.lookAt(this.cameraMatrix, this.pos, this.viewFocus, this.viewUp);
}


function CombinedCoordinate(x, y, z, n) {
    modulo = function(a, n) {
        res = a % n;
        if (a < 0) res += n;
        return res;
    }
    
    this.chunkSize = 32;
    n = this.chunkSize;
    if (typeof(x) != "number") x = 0;
    if (typeof(y) != "number") y = 0;
    if (typeof(z) != "number") z = 0;
    this.cx = Math.floor(x / n);
    this.cy = Math.floor(y / n);
    this.cz = Math.floor(z / n);
    this.lx = VoxelEngine.modulo(x, n);
    this.lx = VoxelEngine.modulo(x, n);
    this.lx = VoxelEngine.modulo(x, n);
}

function Coord3(x, y, z) {
    if (typeof(x) != "number") x = 0;
    if (typeof(y) != "number") y = 0;
    if (typeof(z) != "number") z = 0;
    this.x = x;
    this.y = y;
    this.z = z;
}

Coord3.prototype.scp = function(a) { return new Coord3(this.x * a, this.y * a, this.z * a); };
Coord3.prototype.add = function(a) { return new Coord3(this.x + a.x, this.y + a.y, this.z + a.z); };
Coord3.prototype.sub = function(a) { return new Coord3(this.x - a.x, this.y - a.y, this.z - a.z); };
Coord3.prototype.toArray = function() { return [this.x, this.y, this.z]; };