/**
 * Created by Louve on 10.12.2015.
 */

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec4 a_color;\n'+
    'varying vec4 v_color;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'uniform mat4 rmatrixY;\n'+
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * position * rmatrixY;\n' +
    '   v_color = a_color;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_color;\n'+
    'void main(){\n' +
    '   gl_FragColor = v_color;\n' +  //kolor punktu
    '}\n';

var viewMatrix = new Float32Array(16);  // macierz widoku

// Ustawia macierz widoku
function setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ){
    var fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;

    rlf = 1 / Math.sqrt(fx*fx + fy*fy + fz*fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;


    rls = 1 / Math.sqrt(sx*sx + sy*sy + sz*sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;

    viewMatrix[0] = sx;
    viewMatrix[1] = ux;
    viewMatrix[2] = -fx;
    viewMatrix[4] = 0;

    viewMatrix[4] = sy;
    viewMatrix[5] = uy;
    viewMatrix[6] = -fy;
    viewMatrix[7] = 0;

    viewMatrix[8] = sz;
    viewMatrix[9] = uz;
    viewMatrix[10] = -fz;
    viewMatrix[11] = 0;

    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;
    viewMatrix[15] = 1;
}


var rotMatrix = new Float32Array(16);   // macierz rotacji wokol osi Y

function setNewRotateMatrix(angle){
    var radian = Math.PI * angle / 180.0;   // degr to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    // Elementy macierzy numerowane sa kolumnami!
    rotMatrix[0] = cosB;
    rotMatrix[2] = -sinB;
    rotMatrix[5] = 1.0;
    rotMatrix[8] = sinB;
    rotMatrix[10] = cosB;
    rotMatrix[15] = 1.0;
}

var g_last = Date.now();
var currentAngle = 0.0;
// Animowanie rotacji piramidy wokol osi Y
function animate(gl, n, rMatrixY, rotMatrix){
    var ANGLE_STEP = 45.0;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    currentAngle = (currentAngle + (ANGLE_STEP * elapsed) / 1000.0) % 360;

    setNewRotateMatrix(currentAngle);

    gl.uniformMatrix4fv(rMatrixY, false, rotMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}


// Rysuje rzeczy w Canvasie:
function drawStuff() {
    var canvas = document.getElementById('MyFirstCanvas');
    var gl = canvas.getContext("webgl");
    console.log(gl);
    if (!gl) {
        console.log('webGl nie bangla');
        return;
    }

    gl.viewportwidth = canvas.width;
    gl.viewportheight = canvas.height;

    var pixelShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pixelShader, FSHADER_SOURCE);
    gl.compileShader(pixelShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, pixelShader);
    gl.linkProgram(program);

    gl.useProgram(program);
    gl.program = program;


    // macierz wspolrzednych punktow oraz ich kolorow
    var colouredVertices = new Float32Array
    (
        [  // wspolrz.:   // RGB:
            -0.4, -0.4,  0.4,   0.1, 0.8, 0.2,
             0.4, -0.4,  0.4,   0.1, 0.8, 0.2,
            -0.4, -0.4, -0.4,   0.1, 0.8, 0.2,

             0.4, -0.4, -0.4,   0.1, 0.8, 0.2,
            -0.4, -0.4, -0.4,   0.1, 0.8, 0.2,
             0.4, -0.4,  0.4,   0.1, 0.8, 0.2,

            -0.4, -0.4, -0.4,   0.5, 0.9, 0.3,
             0.0,  0.4,  0.0,   0.9, 0.9, 0.3,
             0.4, -0.4, -0.4,   0.5, 0.9, 0.3,

            -0.4, -0.4,  0.4,   0.0, 0.9, 0.6,
             0.0,  0.4,  0.0,   0.5, 0.8, 0.9,
            -0.4, -0.4, -0.4,   0.0, 0.9, 0.6,

             0.4, -0.4,  0.4,   0.5, 0.9, 0.3,
             0.0,  0.4,  0.0,   0.9, 0.9, 0.3,
            -0.4, -0.4,  0.4,   0.5, 0.9, 0.3,

             0.4, -0.4, -0.4,   0.0, 0.9, 0.6,
             0.0,  0.4,  0.0,   0.5, 0.8, 0.9,
             0.4, -0.4,  0.4,   0.0, 0.9, 0.6
        ]
    );
    var n = colouredVertices.length / 6;

    var colouredVertexBuffer = gl.createBuffer();       // bufor kolorowanych wierzcholkow
    gl.bindBuffer(gl.ARRAY_BUFFER, colouredVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colouredVertices, gl.STATIC_DRAW);

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var rMatrixY = gl.getUniformLocation(gl.program, 'rmatrixY');
    gl.uniformMatrix4fv(rMatrixY, false, rotMatrix);

    var position = gl.getAttribLocation(gl.program, 'position');
    var color = gl.getAttribLocation(gl.program, 'a_color');

    var FSIZE = colouredVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, n);


    var tick = function(){
        animate(gl, n, rMatrixY, rotMatrix);   // uruchamiamy animacje piramidy
        requestAnimationFrame(tick);                // request that the browser calls tick
    };

    tick();
}