    !function(){"use strict";function r(r){r||(r=Math.random),this.perm=new Uint8Array(512),this.permMod12=new Uint8Array(512);for(a=0;512>a;a++)this.perm[a]=p[255&a],this.permMod12[a]=this.perm[a]%12}var a=.5*(Math.sqrt(3)-1),t=(3-Math.sqrt(3))/6,e=1/3,i=1/6,o=(Math.sqrt(5)-1)/4,s=(5-Math.sqrt(5))/20;r.prototype={grad3:new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]),grad4:new Float32Array([0,1,1,1,0,1,1,-1,0,1,-1,1,0,1,-1,-1,0,-1,1,1,0,-1,1,-1,0,-1,-1,1,0,-1,-1,-1,1,0,1,1,1,0,1,-1,1,0,-1,1,1,0,-1,-1,-1,0,1,1,-1,0,1,-1,-1,0,-1,1,-1,0,-1,-1,1,1,0,1,1,1,0,-1,1,-1,0,1,1,-1,0,-1,-1,1,0,1,-1,1,0,-1,-1,-1,0,1,-1,-1,0,-1,1,1,1,0,1,1,-1,0,1,-1,1,0,1,-1,-1,0,-1,1,1,0,-1,1,-1,0,-1,-1,1,0,-1,-1,-1,0]),noise2D:function(r,e){var i,o,s=this.permMod12,h=this.perm,v=this.grad3,f=0,n=0,l=0,M=(r+e)*a,p=Math.floor(r+M),m=Math.floor(e+M),d=(p+m)*t,u=p-d,c=m-d,y=r-u,g=e-c;y>g?(i=1,o=0):(i=0,o=1);var w=y-i+t,A=g-o+t,q=y-1+2*t,D=g-1+2*t,U=255&p,F=255&m,x=.5-y*y-g*g;if(x>=0){var N=3*s[U+h[F]];x*=x,f=x*x*(v[N]*y+v[N+1]*g)}var S=.5-w*w-A*A;if(S>=0){var b=3*s[U+i+h[F+o]];S*=S,n=S*S*(v[b]*w+v[b+1]*A)}var j=.5-q*q-D*D;if(j>=0){var k=3*s[U+1+h[F+1]];j*=j,l=j*j*(v[k]*q+v[k+1]*D)}return 70*(f+n+l)},noise3D:function(r,a,t){var o,s,h,v,f,n,l,M,p,m,d=this.permMod12,u=this.perm,c=this.grad3,y=(r+a+t)*e,g=Math.floor(r+y),w=Math.floor(a+y),A=Math.floor(t+y),q=(g+w+A)*i,D=g-q,U=w-q,F=A-q,x=r-D,N=a-U,S=t-F;x>=N?N>=S?(f=1,n=0,l=0,M=1,p=1,m=0):x>=S?(f=1,n=0,l=0,M=1,p=0,m=1):(f=0,n=0,l=1,M=1,p=0,m=1):S>N?(f=0,n=0,l=1,M=0,p=1,m=1):S>x?(f=0,n=1,l=0,M=0,p=1,m=1):(f=0,n=1,l=0,M=1,p=1,m=0);var b=x-f+i,j=N-n+i,k=S-l+i,z=x-M+2*i,B=N-p+2*i,C=S-m+2*i,E=x-1+3*i,G=N-1+3*i,H=S-1+3*i,I=255&g,J=255&w,K=255&A,L=.6-x*x-N*N-S*S;if(0>L)o=0;else{var O=3*d[I+u[J+u[K]]];L*=L,o=L*L*(c[O]*x+c[O+1]*N+c[O+2]*S)}var P=.6-b*b-j*j-k*k;if(0>P)s=0;else{var Q=3*d[I+f+u[J+n+u[K+l]]];P*=P,s=P*P*(c[Q]*b+c[Q+1]*j+c[Q+2]*k)}var R=.6-z*z-B*B-C*C;if(0>R)h=0;else{var T=3*d[I+M+u[J+p+u[K+m]]];R*=R,h=R*R*(c[T]*z+c[T+1]*B+c[T+2]*C)}var V=.6-E*E-G*G-H*H;if(0>V)v=0;else{var W=3*d[I+1+u[J+1+u[K+1]]];V*=V,v=V*V*(c[W]*E+c[W+1]*G+c[W+2]*H)}return 32*(o+s+h+v)},noise4D:function(r,a,t,e){var i,h,v,f,n,l=(this.permMod12,this.perm),M=this.grad4,p=(r+a+t+e)*o,m=Math.floor(r+p),d=Math.floor(a+p),u=Math.floor(t+p),c=Math.floor(e+p),y=(m+d+u+c)*s,g=m-y,w=d-y,A=u-y,q=c-y,D=r-g,U=a-w,F=t-A,x=e-q,N=0,S=0,b=0,j=0;D>U?N++:S++,D>F?N++:b++,D>x?N++:j++,U>F?S++:b++,U>x?S++:j++,F>x?b++:j++;var k,z,B,C,E,G,H,I,J,K,L,O;k=N>=3?1:0,z=S>=3?1:0,B=b>=3?1:0,C=j>=3?1:0,E=N>=2?1:0,G=S>=2?1:0,H=b>=2?1:0,I=j>=2?1:0,J=N>=1?1:0,K=S>=1?1:0,L=b>=1?1:0,O=j>=1?1:0;var P=D-k+s,Q=U-z+s,R=F-B+s,T=x-C+s,V=D-E+2*s,W=U-G+2*s,X=F-H+2*s,Y=x-I+2*s,Z=D-J+3*s,$=U-K+3*s,_=F-L+3*s,ra=x-O+3*s,aa=D-1+4*s,ta=U-1+4*s,ea=F-1+4*s,ia=x-1+4*s,oa=255&m,sa=255&d,ha=255&u,va=255&c,fa=.6-D*D-U*U-F*F-x*x;if(0>fa)i=0;else{var na=l[oa+l[sa+l[ha+l[va]]]]%32*4;fa*=fa,i=fa*fa*(M[na]*D+M[na+1]*U+M[na+2]*F+M[na+3]*x)}var la=.6-P*P-Q*Q-R*R-T*T;if(0>la)h=0;else{var Ma=l[oa+k+l[sa+z+l[ha+B+l[va+C]]]]%32*4;la*=la,h=la*la*(M[Ma]*P+M[Ma+1]*Q+M[Ma+2]*R+M[Ma+3]*T)}var pa=.6-V*V-W*W-X*X-Y*Y;if(0>pa)v=0;else{var ma=l[oa+E+l[sa+G+l[ha+H+l[va+I]]]]%32*4;pa*=pa,v=pa*pa*(M[ma]*V+M[ma+1]*W+M[ma+2]*X+M[ma+3]*Y)}var da=.6-Z*Z-$*$-_*_-ra*ra;if(0>da)f=0;else{var ua=l[oa+J+l[sa+K+l[ha+L+l[va+O]]]]%32*4;da*=da,f=da*da*(M[ua]*Z+M[ua+1]*$+M[ua+2]*_+M[ua+3]*ra)}var ca=.6-aa*aa-ta*ta-ea*ea-ia*ia;if(0>ca)n=0;else{var ya=l[oa+1+l[sa+1+l[ha+1+l[va+1]]]]%32*4;ca*=ca,n=ca*ca*(M[ya]*aa+M[ya+1]*ta+M[ya+2]*ea+M[ya+3]*ia)}return 27*(i+h+v+f+n)}},self.SimplexNoise=r}();
    var chunkSize;
    var paddedSize;
    var id;
    var p;
    var snoise;
    var sampleBuffer;
    function onMessage(e) {
        var message = e.data;
        if (message.command == "setup") {
            chunkSize = message.chunkSize;
            paddedSize = chunkSize + 2;
            sampleBuffer = new Float32Array(paddedSize * paddedSize * paddedSize);
            id = message.id;
            p = message.perm;
            snoise = new SimplexNoise();
            self.postMessage({command:"ready",id:id});
        }
        else if (message.command == "genchunk") {
            var v = genChunk(message.x, message.y, message.z);
            self.postMessage({command:"takechunk",id:id,x:message.x,y:message.y,z:message.z,vertices:v},[v.buffer])
        }
        else if (message.command == "ping") {
            self.postMessage(message);
        }
    }
    function world(x, y, z) {
        x += 0.5; y += 0.5; z += 0.5;
        //return noise.noise3D(x * 0.0125, y * 0.0125, z * 0.0125);
        //return Math.random() - 0.5;
        //if (z < 5) return 1;
        //else return -1;
        //return noise.noise3D(x * 0.025, y * 0.025, z * 0.025);
        var n0 = snoise.noise3D(x * 0.9, y * 0.9, z * 0.9);
        var n1 = snoise.noise3D(x * 0.025, y * 0.025, z * 0.025);
        var n2 = snoise.noise3D((x + 724) * 0.01, (y - 235) * 0.01, (z + 59) * 0.01);
        x *= 0.025;
        y *= 0.025;
        //return x * x + y * y + 20 - z + 25 * n1 + 1000 * n2;
        return 50 * n1 + 25 * n1 + 100 * n2;
        //return 32 + 20 * Math.sin(x * 0.0125) * Math.sin(y * 0.0125) - z; 
    }
    
    function genChunk(xo, yo, zo) {
        xo *= chunkSize;
        yo *= chunkSize;
        zo *= chunkSize;
        var noiseArray = sampleBuffer;
        function lookupArray(x, y, z) {
            if (x < -1 || x > chunkSize + 1 || y < -1 || y > chunkSize + 1 || z < -1 || z > chunkSize + 1) return -1;
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

        var pushArray = function(dest, source) {for (var i = 0; i < source.length; i++) {dest.push(source[i])}};
        var quad = function(p, e1, e2, c) {
            var p1 = p.concat([1],c);
            var p2 = [p[0]+e1[0], p[1]+e1[1], p[2]+e1[2], 1].concat(c);
            var p3 = [p2[0]+e2[0], p2[1]+e2[1], p2[2]+e2[2], 1].concat(c);
            var p4 = [p[0]+e2[0], p[1]+e2[1], p[2]+e2[2], 1].concat(c);    
            return [].concat(p1, p2, p3, p1, p3, p4);
        }
        vertices = [];
        for (var x = 0; x < chunkSize; x++) {
            for (var y = 0; y < chunkSize; y++) {
                for (var z = 0; z < chunkSize; z++) {
                    if (lookupArray(x, y, z) > 0) {
                        if (lookupArray(x,y,z+1) < 0) pushArray(vertices, quad([x,y,z+1],[1,0,0],[0,1,0],[1,1,1,1]));
                        if (lookupArray(x,y,z-1) < 0) pushArray(vertices, quad([x,y,z],[0,1,0],[1,0,0],[1,1,1,1]));
                        if (lookupArray(x,y+1,z) < 0) pushArray(vertices, quad([x,1+y,z],[0,0,1],[1,0,0],[0.75,0.75,0.75,1]));
                        if (lookupArray(x,y-1,z) < 0) pushArray(vertices, quad([x,y,z],[1,0,0],[0,0,1],[0.75,0.75,0.75,1]));
                        if (lookupArray(x+1,y,z) < 0) pushArray(vertices, quad([x+1,y,z],[0,1,0],[0,0,1],[0.5,0.5,0.5,1]));
                        if (lookupArray(x-1,y,z) < 0) pushArray(vertices, quad([x,y,z],[0,0,1],[0,1,0],[0.5,0.5,0.5,1]));
                    }
                }
            }
        }
        //pushArray(vertices, quad([0,0,0],[1,0,0],[1,0,1],[0,1,0,1]));
        return new Float32Array(vertices);
    }
    self.addEventListener("message", onMessage, false);
    //self.postMessage({command:"ping",text:"Worker is ready."});