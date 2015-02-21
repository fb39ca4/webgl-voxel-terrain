(function () {

function PerlinNoise(permutations) {
    this.perm = new Uint8Array(512);
    for (i = 0; i < 512; i++) {
        this.perm[i] = permutations[i & 255];
    }
}

PerlinNoise.prototype.noise3D = function(x, y, z) {
    var p = this.perm;
    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    function lerp( t, a, b) { return a + t * (b - a); }
    function grad(hash, x, y, z) {
      var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
      var u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
             v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
    } 
    function scale(n) { return n;/*(1 + n)/2;*/ }

    var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
        Y = Math.floor(y) & 255,                  // CONTAINS POINT.
        Z = Math.floor(z) & 255;
    x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
    y -= Math.floor(y);                                // OF POINT IN CUBE.
    z -= Math.floor(z);
    var    u = fade(x),                                // COMPUTE FADE CURVES
           v = fade(y),                                // FOR EACH OF X,Y,Z.
           w = fade(z);
    var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
        B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,

    return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                   grad(p[BA  ], x-1, y  , z   )), // BLENDED
                           lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                   grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                   lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                   grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                           lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                   grad(p[BB+1], x-1, y-1, z-1 )))));
}
self.PerlinNoise = PerlinNoise;
})();