(function () {
/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 *
 * Copyright (C) 2012 Jonas Wagner
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
"use strict";

var F2 = 0.5 * (Math.sqrt(3.0) - 1.0),
    G2 = (3.0 - Math.sqrt(3.0)) / 6.0,
    F3 = 1.0 / 3.0,
    G3 = 1.0 / 6.0,
    F4 = (Math.sqrt(5.0) - 1.0) / 4.0,
    G4 = (5.0 - Math.sqrt(5.0)) / 20.0;


function SimplexNoise(perms) {
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (var i = 0; i < 512; i++) {
        this.perm[i] = perms[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
    }

}
SimplexNoise.prototype = {
    grad3: new Float32Array([1, 1, 0,
                            - 1, 1, 0,
                            1, - 1, 0,

                            - 1, - 1, 0,
                            1, 0, 1,
                            - 1, 0, 1,

                            1, 0, - 1,
                            - 1, 0, - 1,
                            0, 1, 1,

                            0, - 1, 1,
                            0, 1, - 1,
                            0, - 1, - 1]),
    grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1,
                            0, - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1,
                            1, 0, 1, 1, 1, 0, 1, - 1, 1, 0, - 1, 1, 1, 0, - 1, - 1,
                            - 1, 0, 1, 1, - 1, 0, 1, - 1, - 1, 0, - 1, 1, - 1, 0, - 1, - 1,
                            1, 1, 0, 1, 1, 1, 0, - 1, 1, - 1, 0, 1, 1, - 1, 0, - 1,
                            - 1, 1, 0, 1, - 1, 1, 0, - 1, - 1, - 1, 0, 1, - 1, - 1, 0, - 1,
                            1, 1, 1, 0, 1, 1, - 1, 0, 1, - 1, 1, 0, 1, - 1, - 1, 0,
                            - 1, 1, 1, 0, - 1, 1, - 1, 0, - 1, - 1, 1, 0, - 1, - 1, - 1, 0]),
    noise2D: function (xin, yin) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad3 = this.grad3;
        var n0=0, n1=0, n2=0; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var X0 = i - t; // Unskew the cell origin back to (x,y) space
        var Y0 = j - t;
        var x0 = xin - X0; // The x,y distances from the cell origin
        var y0 = yin - Y0;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        else {
            i1 = 0;
            j1 = 1;
        } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1.0 + 2.0 * G2;
        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = permMod12[ii + perm[jj]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    },
    // 3D simplex noise
    noise3D: function (xin, yin, zin) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad3 = this.grad3;
        var n0, n1, n2, n3; // Noise contributions from the four corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);
        var t = (i + j + k) * G3;
        var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
        var Y0 = j - t;
        var Z0 = k - t;
        var x0 = xin - X0; // The x,y,z distances from the cell origin
        var y0 = yin - Y0;
        var z0 = zin - Z0;
        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // X Y Z order
            else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // X Z Y order
            else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            } // Z X Y order
        }
        else { // x0<y0
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Z Y X order
            else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            } // Y Z X order
            else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            } // Y X Z order
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
        var y1 = y0 - j1 + G3;
        var z1 = z0 - k1 + G3;
        var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
        var y2 = y0 - j2 + 2.0 * G3;
        var z2 = z0 - k2 + 2.0 * G3;
        var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
        var y3 = y0 - 1.0 + 3.0 * G3;
        var z3 = z0 - 1.0 + 3.0 * G3;
        // Work out the hashed gradient indices of the four simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) n0 = 0.0;
        else {
            var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) n1 = 0.0;
        else {
            var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) n2 = 0.0;
        else {
            var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) n3 = 0.0;
        else {
            var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
            t3 *= t3;
            n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to stay just inside [-1,1]
        return 32.0 * (n0 + n1 + n2 + n3);
    },
    // 4D simplex noise, better simplex rank ordering method 2012-03-09
    noise4D: function (x, y, z, w) {
        var permMod12 = this.permMod12,
            perm = this.perm,
            grad4 = this.grad4;

        var n0, n1, n2, n3, n4; // Noise contributions from the five corners
        // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
        var s = (x + y + z + w) * F4; // Factor for 4D skewing
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var k = Math.floor(z + s);
        var l = Math.floor(w + s);
        var t = (i + j + k + l) * G4; // Factor for 4D unskewing
        var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
        var Y0 = j - t;
        var Z0 = k - t;
        var W0 = l - t;
        var x0 = x - X0; // The x,y,z,w distances from the cell origin
        var y0 = y - Y0;
        var z0 = z - Z0;
        var w0 = w - W0;
        // For the 4D case, the simplex is a 4D shape I won't even try to describe.
        // To find out which of the 24 possible simplices we're in, we need to
        // determine the magnitude ordering of x0, y0, z0 and w0.
        // Six pair-wise comparisons are performed between each possible pair
        // of the four coordinates, and the results are used to rank the numbers.
        var rankx = 0;
        var ranky = 0;
        var rankz = 0;
        var rankw = 0;
        if (x0 > y0) rankx++;
        else ranky++;
        if (x0 > z0) rankx++;
        else rankz++;
        if (x0 > w0) rankx++;
        else rankw++;
        if (y0 > z0) ranky++;
        else rankz++;
        if (y0 > w0) ranky++;
        else rankw++;
        if (z0 > w0) rankz++;
        else rankw++;
        var i1, j1, k1, l1; // The integer offsets for the second simplex corner
        var i2, j2, k2, l2; // The integer offsets for the third simplex corner
        var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
        // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
        // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
        // impossible. Only the 24 indices which have non-zero entries make any sense.
        // We use a thresholding to set the coordinates in turn from the largest magnitude.
        // Rank 3 denotes the largest coordinate.
        i1 = rankx >= 3 ? 1 : 0;
        j1 = ranky >= 3 ? 1 : 0;
        k1 = rankz >= 3 ? 1 : 0;
        l1 = rankw >= 3 ? 1 : 0;
        // Rank 2 denotes the second largest coordinate.
        i2 = rankx >= 2 ? 1 : 0;
        j2 = ranky >= 2 ? 1 : 0;
        k2 = rankz >= 2 ? 1 : 0;
        l2 = rankw >= 2 ? 1 : 0;
        // Rank 1 denotes the second smallest coordinate.
        i3 = rankx >= 1 ? 1 : 0;
        j3 = ranky >= 1 ? 1 : 0;
        k3 = rankz >= 1 ? 1 : 0;
        l3 = rankw >= 1 ? 1 : 0;
        // The fifth corner has all coordinate offsets = 1, so no need to compute that.
        var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
        var y1 = y0 - j1 + G4;
        var z1 = z0 - k1 + G4;
        var w1 = w0 - l1 + G4;
        var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
        var y2 = y0 - j2 + 2.0 * G4;
        var z2 = z0 - k2 + 2.0 * G4;
        var w2 = w0 - l2 + 2.0 * G4;
        var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
        var y3 = y0 - j3 + 3.0 * G4;
        var z3 = z0 - k3 + 3.0 * G4;
        var w3 = w0 - l3 + 3.0 * G4;
        var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
        var y4 = y0 - 1.0 + 4.0 * G4;
        var z4 = z0 - 1.0 + 4.0 * G4;
        var w4 = w0 - 1.0 + 4.0 * G4;
        // Work out the hashed gradient indices of the five simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var kk = k & 255;
        var ll = l & 255;
        // Calculate the contribution from the five corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
        if (t0 < 0) n0 = 0.0;
        else {
            var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
            t0 *= t0;
            n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
        if (t1 < 0) n1 = 0.0;
        else {
            var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
            t1 *= t1;
            n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
        if (t2 < 0) n2 = 0.0;
        else {
            var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
            t2 *= t2;
            n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
        if (t3 < 0) n3 = 0.0;
        else {
            var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
            t3 *= t3;
            n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
        }
        var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
        if (t4 < 0) n4 = 0.0;
        else {
            var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
            t4 *= t4;
            n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
        }
        // Sum up and scale the result to cover the range [-1,1]
        return 27.0 * (n0 + n1 + n2 + n3 + n4);
    }


};
self.SimplexNoise = SimplexNoise;

})();




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

function setup() {
    chunkSize = 32;
    paddedSize = chunkSize + 2;
    sampleBuffer = new Float32Array(paddedSize * paddedSize * paddedSize);
    vertexBuffer = new Float32Array(chunkSize * chunkSize * chunkSize * 3 * 6 * 8);
    p = [];
    for (var i = 0; i < 256; i++) p.push(Math.floor(Math.random() * 256));
    noise = new SimplexNoise(p);      
}

var chunkSize;
var paddedSize;
var id;
var snoise;
var sampleBuffer;
var vertexBuffer;
var vertexBufferIdx;
function onMessage(e) {
    var message = e.data;
    if (message.command == "setup") {
        chunkSize = message.chunkSize;
        paddedSize = chunkSize + 2;
        sampleBuffer = new Float32Array(paddedSize * paddedSize * paddedSize);
        vertexBuffer = new Float32Array(chunkSize * chunkSize * chunkSize * 3 * 6 * 8);
        id = message.id;
        noise = new SimplexNoise(message.perm);
        self.postMessage({command:"ready",id:id});
    }
    else if (message.command == "genchunk") {
        var v = genChunk(message.x, message.y, message.z);
        self.postMessage({command:"takechunk",id:id,x:message.x,y:message.y,z:message.z,vertices:v},[v])
    }
    else if (message.command == "ping") {
        self.postMessage(message);
    }
}
function world(x, y, z) {
    x *= 1.5; y *= 1.5; z *= 1.5;
    x += 0.5; y += 0.5; z += 0.5;
    //return noise.noise3D(x * 0.0125, y * 0.0125, z * 0.0125);
    //return Math.random() - 0.5;
    //if (z < 5) return 1;
    //else return -1;
    //return noise.noise3D(x * 0.025, y * 0.025, z * 0.025);
    var n0 = noise.noise3D(x * 0.9, y * 0.9, z * 0.9);
    var n1 = noise.noise3D(x * 0.025, y * 0.025, z * 0.025);
    var n2 = noise.noise3D((x + 724) * 0.01, (y - 235) * 0.01, (z + 59) * 0.01);
    x *= 0.025;
    y *= 0.025;
    //return x * x + y * y + 20 - z + 25 * n1 + 1000 * n2;
    return 75 * n1 + 100 * n2;
    //return 32 + 20 * Math.sin(x * 0.0125) * Math.sin(y * 0.0125) - z; 
}

function genChunk(xo, yo, zo) {
    xo *= chunkSize;
    yo *= chunkSize;
    zo *= chunkSize;
    var noiseArray = sampleBuffer;
    vertexBufferIdx = 0;
    function lookupArray(x, y, z) {
        //if (x < -1 || x > chunkSize + 1 || y < -1 || y > chunkSize + 1 || z < -1 || z > chunkSize + 1) return -1;
        x += 1; y += 1; z += 1;
        //if (x < 0 || x >= chunkSize || y < 0 || y >= chunkSize || z < 0 || z >= chunkSize) return -1;
        //x = Math.floor(x); y = Math.floor(y); z = Math.floor(z);
        return noiseArray[z + y * paddedSize + x * paddedSize * paddedSize];
    }
    function setArray(x, y, z, value) {
        //if (x < -1 || x > chunkSize || y < -1 || y > chunkSize || z < -1 || z > chunkSize) return;
        x += 1; y += 1; z += 1;
        noiseArray[z + y * paddedSize + x * paddedSize * paddedSize] = value;
    }
    for (var x = -1; x <= chunkSize; x++) {
        for (var y = -1; y <= chunkSize; y++) {
            for (var z = -1; z <= chunkSize; z++) {
                var f = world((x+xo), (y+yo), (z+zo));
                setArray(x,y,z,f);
            }
        }
    }

    var pushArray = function(dest, source) {
        for (var i = 0; i < source.length; i++) {
            dest[vertexBufferIdx++] = source[i];
            //dest.push(source[i]);
            //vertexBufferIdx++;
        }
    };
    var quad = function(p, e1, e2, c) {
        var p1 = p.concat([1],c);
        var p2 = [p[0]+e1[0], p[1]+e1[1], p[2]+e1[2], 1].concat(c);
        var p3 = [p2[0]+e2[0], p2[1]+e2[1], p2[2]+e2[2], 1].concat(c);
        var p4 = [p[0]+e2[0], p[1]+e2[1], p[2]+e2[2], 1].concat(c);    
        return [].concat(p1, p2, p3, p1, p3, p4);
    }
    var quadZpos = function(x, y, z) {
        var idx = vertexBufferIdx;
        function vertex(x, y, z) {
            vertexBuffer[idx++] = x; vertexBuffer[idx++] = y; vertexBuffer[idx++] = z; vertexBuffer[idx++] = 1; 
            vertexBuffer[idx++] = 1; vertexBuffer[idx++] = 1; vertexBuffer[idx++] = 1; vertexBuffer[idx++] = 1; 
        }
        vertex(x+1,y,z+1);
        vertex(x+1,y+1,z+1);
        vertex(x,y+1,z+1);
        vertex(x+1,y,z+1);
        vertex(x,y+1,z+1);
        vertex(x,y,z+1);
        vertexBufferIdx = idx;
    }
    var quadZneg = function(x, y, z) {
        var idx = vertexBufferIdx;
        function vertex(x, y, z) {
            vertexBuffer[idx++] = x; vertexBuffer[idx++] = y; vertexBuffer[idx++] = z; vertexBuffer[idx++] = 1; 
            vertexBuffer[idx++] = 1; vertexBuffer[idx++] = 1; vertexBuffer[idx++] = 1; vertexBuffer[idx++] = 1; 
        }
        vertex(x+1,y,z);
        vertex(x,y+1,z);
        vertex(x+1,y+1,z);
        vertex(x+1,y,z);
        vertex(x,y,z);
        vertex(x,y+1,z);
        vertexBufferIdx = idx;
    }
    var quadYpos = function(x, y, z) {
        var idx = vertexBufferIdx;
        function vertex(x, y, z) {
            vertexBuffer[idx++] = x; vertexBuffer[idx++] = y; vertexBuffer[idx++] = z; vertexBuffer[idx++] = 1; 
            vertexBuffer[idx++] = 0.75; vertexBuffer[idx++] = 0.75; vertexBuffer[idx++] = 0.75; vertexBuffer[idx++] = 1; 
        }
        vertex(x+1,y+1,z);
        vertex(x,y+1,z+1);
        vertex(x+1,y+1,z+1);
        vertex(x+1,y+1,z);
        vertex(x,y+1,z);
        vertex(x,y+1,z+1);
        vertexBufferIdx = idx;
    }
    var quadYneg = function(x, y, z) {
        var idx = vertexBufferIdx;
        function vertex(x, y, z) {
            vertexBuffer[idx++] = x; vertexBuffer[idx++] = y; vertexBuffer[idx++] = z; vertexBuffer[idx++] = 1; 
            vertexBuffer[idx++] = 0.75; vertexBuffer[idx++] = 0.75; vertexBuffer[idx++] = 0.75; vertexBuffer[idx++] = 1; 
        }
        vertex(x,y,z+1);
        vertex(x+1,y,z);
        vertex(x+1,y,z+1);
        vertex(x+1,y,z);
        vertex(x,y,z+1);
        vertex(x,y,z);
        vertexBufferIdx = idx;
    }
    var quadXpos = function(x, y, z) {
        var idx = vertexBufferIdx;
        function vertex(x, y, z) {
            vertexBuffer[idx++] = x; vertexBuffer[idx++] = y; vertexBuffer[idx++] = z; vertexBuffer[idx++] = 1; 
            vertexBuffer[idx++] = 0.5; vertexBuffer[idx++] = 0.5; vertexBuffer[idx++] = 0.5; vertexBuffer[idx++] = 1; 
        }
        vertex(x+1,y+1,z);
        vertex(x+1,y+1,z+1);
        vertex(x+1,y,z+1);
        vertex(x+1,y,z);
        vertex(x+1,y+1,z);
        vertex(x+1,y,z+1);
        vertexBufferIdx = idx;
    }
    var quadXneg = function(x, y, z) {
        var idx = vertexBufferIdx;
        function vertex(x, y, z) {
            vertexBuffer[idx++] = x; vertexBuffer[idx++] = y; vertexBuffer[idx++] = z; vertexBuffer[idx++] = 1; 
            vertexBuffer[idx++] = 0.5; vertexBuffer[idx++] = 0.5; vertexBuffer[idx++] = 0.5; vertexBuffer[idx++] = 1; 
        }
        vertex(x,y+1,z+1);
        vertex(x,y+1,z);
        vertex(x,y,z+1);
        vertex(x,y,z);
        vertex(x,y,z+1);
        vertex(x,y+1,z);
        vertexBufferIdx = idx;
    }
    vertices = vertexBuffer;
    for (var x = 0; x < chunkSize; x++) {
        for (var y = 0; y < chunkSize; y++) {
            for (var z = 0; z < chunkSize; z++) {
                if (lookupArray(x, y, z) > 0) {
                    if (lookupArray(x,y,z+1) < 0) pushArray(vertices, quad([x,y,z+1],[1,0,0],[0,1,0],[1,1,1,1]));
                    //if (lookupArray(x,y,z+1) < 0) quadZpos(x, y, z); 
                    if (lookupArray(x,y,z-1) < 0) pushArray(vertices, quad([x,y,z],[0,1,0],[1,0,0],[1,1,1,1]));
                    //if (lookupArray(x,y,z-1) < 0) quadZneg(x, y, z);
                    if (lookupArray(x,y+1,z) < 0) pushArray(vertices, quad([x,1+y,z],[0,0,1],[1,0,0],[0.75,0.75,0.75,1]));
                    //if (lookupArray(x,y+1,z) < 0) quadYpos(x, y, z);
                    if (lookupArray(x,y-1,z) < 0) pushArray(vertices, quad([x,y,z],[1,0,0],[0,0,1],[0.75,0.75,0.75,1]));
                    //if (lookupArray(x,y-1,z) < 0) quadYneg(x, y, z);
                    if (lookupArray(x+1,y,z) < 0) pushArray(vertices, quad([x+1,y,z],[0,1,0],[0,0,1],[0.5,0.5,0.5,1]));
                    //if (lookupArray(x+1,y,z) < 0) quadXpos(x, y, z);
                    if (lookupArray(x-1,y,z) < 0) pushArray(vertices, quad([x,y,z],[0,0,1],[0,1,0],[0.5,0.5,0.5,1]));
                    //if (lookupArray(x-1,y,z) < 0) quadXneg(x, y, z);
                }
            }
        }
    }
    //pushArray(vertices, quad([0,0,0],[1,0,0],[1,0,1],[0,1,0,1]));
    return vertices.buffer.slice(0, vertexBufferIdx * 4);
}
self.addEventListener("message", onMessage, false);
//self.postMessage({command:"ping",text:"Worker is ready."});