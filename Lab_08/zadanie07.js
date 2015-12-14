/**
 * Created by nocah on 10.12.2015.
 */

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec4 a_color;\n'+
    'varying vec4 v_color;\n'+
    'void main() {\n' +
    '   gl_Position = position;\n' +
    '   v_color = a_color;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_color;\n'+
    'void main(){\n' +
    '   gl_FragColor = v_color;\n' +  //kolor punktu
    '}\n';





// wspolrzedne wierzcholkow ruchomego trojkata:
var X1 = 0.0, Y1 = 0.5, Z1 = 0.0;
var X2 = -0.5, Y2 = -0.5, Z2 = 0.0;
var X3 = 0.5, Y3 = -0.5, Z3 = 0.0;
// inne zmienne globalne:
var g_last = Date.now();
var currentAngle = 0.0;
var rotMatrix = new Float32Array(16);   // macierz rotacji wokol osi Y


// aktualizuje macierz rotacji:
function setNewRotateMatrix(angle){
    var radian = Math.PI * angle / 180.0;   // degr to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    // Elementy macierzy numerowane sa kolumnami!
    rotMatrix[0] = cosB;
    rotMatrix[1] = sinB;
    rotMatrix[4] = -sinB;
    rotMatrix[5] = cosB;
    rotMatrix[10] = 1.0;
    rotMatrix[15] = 1.0;
}

// rotacja punktów ruchomego trojkata przez macierz rotacji:
function multiplayMatrixPerVectorPoints(){
    // pierwszy punkt:
    X1 = rotMatrix[0]*X1 + rotMatrix[4]*Y1 + rotMatrix[8]*Z1;
    Y1 = rotMatrix[1]*X1 + rotMatrix[5]*Y1 + rotMatrix[9]*Z1;
    Z1 = rotMatrix[2]*X1 + rotMatrix[6]*Y1 + rotMatrix[10]*Z1;

    // drugi punkt:
    X2 = rotMatrix[0]*X2 + rotMatrix[4]*Y2 + rotMatrix[8]*Z2;
    Y2 = rotMatrix[1]*X2 + rotMatrix[5]*Y2 + rotMatrix[9]*Z2;
    Z2 = rotMatrix[2]*X2 + rotMatrix[6]*Y2 + rotMatrix[10]*Z2;

    // trzeci punkt:
    X3 = rotMatrix[0]*X3 + rotMatrix[4]*Y3 + rotMatrix[8]*Z3;
    Y3 = rotMatrix[1]*X3 + rotMatrix[5]*Y3 + rotMatrix[9]*Z3;
    Z3 = rotMatrix[2]*X3 + rotMatrix[6]*Y3 + rotMatrix[10]*Z3;
}

// Animowanie rotacji piramidy wokol osi Y
function animate(gl, n){
    var ANGLE_STEP = 45.0;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    currentAngle = (currentAngle + (ANGLE_STEP * elapsed) / 1000.0) % 360;

    setNewRotateMatrix(currentAngle);
    multiplayMatrixPerVectorPoints();

    //gl.uniformMatrix4fv(rMatrix, false, rotMatrix);


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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // macierz wspolrzednych punktow oraz ich kolorow
    var stillVertices = new Float32Array
    (
        [    // wspolrz.:       // RGB:
            0.0,  0.5, -0.4,   1.0, 0.0, 0.0,
            -0.5, -0.5, -0.4,   1.0, 0.0, 0.0,
            0.5, -0.5, -0.4,   1.0, 0.0, 0.0,

            0.5,  0.4, -0.2,   0.0, 1.0, 0.0,
            -0.5,  0.4, -0.2,   0.0, 1.0, 0.0,
            0.0, -0.6, -0.2,   0.0, 1.0, 0.0,

            X1,  Y1,  Z1,   0.0, 0.0, 1.0,
            X2,  Y2,  Z2,   0.0, 0.0, 1.0,
            X3,  Y3,  Z3,   0.0, 0.0, 1.0
        ]
    );
    var n = stillVertices.length / 6;

    var colouredVertexBuffer = gl.createBuffer();       // bufor kolorowanych wierzcholkow
    gl.bindBuffer(gl.ARRAY_BUFFER, colouredVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, stillVertices, gl.STATIC_DRAW);

    var position = gl.getAttribLocation(gl.program, 'position');
    var color = gl.getAttribLocation(gl.program, 'a_color');

    var FSIZE = stillVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    gl.drawArrays(gl.TRIANGLES, 0, n);


    var tick = function(){
        animate(gl, n);   // uruchamiamy animacje piramidy
        requestAnimationFrame(tick);                // request that the browser calls tick
    };

    tick();
}