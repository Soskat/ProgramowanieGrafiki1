/**
 * Created by nocah on 25.11.2015.
 */


var VSHADER_SOURCE =
    'attribute vec3 position;\n' +
    'uniform mat4 tmatrix;\n' +
    'void main(void){\n' +
    '   gl_Position = vec4(position, 1.0) * tmatrix;\n' +
    '}\n';

var FSHADER_SOURCE =
    'void main(void){\n' +
    '   gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0);\n' +
    '}\n';


var newMatrix = new Float32Array(16);   // zmienna globalna
var transMatrix = new Float32Array(16); // zmienna globalna
var g_last = Date.now();
var Tx = 0.0, Ty = 0.0, Tz = 0.0;

// Animacja kata obrotu:
function animateAngle(angle){
    var ANGLE_STEP = 45.0;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

// Animacja polozenia wierzcholkow:
function animatePosition(){
    var STEP = 0.2;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    Tx = Tx + (STEP * elapsed) / 1000.0;
    Ty = Ty + (STEP * elapsed) / 1000.0;
    Tz = Tz + (STEP * elapsed) / 1000.0;
}

// Ustawianie macierzy rotacji:
function setNewRotateMatrix(angle){
    var radian = Math.PI * angle / 180.0;   // degr to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);
    // Elementy macierzy numerowane sa kolumnami!
    newMatrix[0] = cosB;
    newMatrix[1] = sinB;
    newMatrix[4] = -sinB;
    newMatrix[5] = cosB;
    newMatrix[10] = 1.0;
    newMatrix[15] = 1.0;
}

// Ustawianie macierzy translacji:
function setNewTranslateMatrix(Tx, Ty, Tz){
    transMatrix[0] = 1.0;
    transMatrix[5] = 1.0;
    transMatrix[10] = 1.0;
    transMatrix[12] = Tx;
    transMatrix[13] = Ty;
    transMatrix[14] = Tz;
    transMatrix[15] = 1.0;
}

// Rysowanie rotacji (aplikowanie macierzy rotacji):
function drawRotation(gl, n, currentAngle, u_ModelMatrix){
    setNewRotateMatrix(currentAngle);
    gl.uniformMatrix4fv(u_ModelMatrix, false, newMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Rysowanie translacji (aplikowanie macierzy translacji):
function drawTranslation(gl, n, Tx, Ty, Tz, u_ModelMatrix){
    setNewTranslateMatrix(Tx, Ty, Tz);
    gl.uniformMatrix4fv(u_ModelMatrix, false, transMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawStuff(){
    var currentAngle = 0.0;

    var canvas = document.getElementById("MyFirstCanvas");
    var gl = canvas.getContext("webgl");

    if(!gl){
        console.log("Buka! :<");
        return;
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    var pixelShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pixelShader, FSHADER_SOURCE);
    gl.compileShader(pixelShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);

    console.log(gl.getShaderInfoLog((vertexShader)));

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, pixelShader);
    gl.linkProgram(program);

    gl.useProgram(program);
    gl.program = program;

    program.position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(program.position);

    var ANGLE = 45.0;
    var radian = Math.PI * ANGLE  / 180.0;  // convert to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    var transMatrix = new Float32Array([
        cosB, -sinB, 0.0, 0.0,
        sinB, cosB, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);

    var tMatrix = gl.getUniformLocation(gl.program, 'tmatrix');

    // === Tworzenie buforu z wspolrzednymi punktow figury ===
    var pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);

    var vertices = new Float32Array([
        0.2, 0.2,
        -0.2, 0.2,
        0.2, -0.2,
        -0.2, -0.2,
        -0.2, 0.2,
        0.2, -0.2
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pointsBuffer.itemSize = 2;
    pointsBuffer.numItems = 6;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.vertexAttribPointer(program.position, pointsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(tMatrix, false, newMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointsBuffer.numItems);


    // === Funkcja animujaca figure ===
    var tick = function(){
        // rotacja:
        currentAngle = animateAngle(currentAngle);   // Update the rotation
        drawRotation(gl, pointsBuffer.numItems, currentAngle, tMatrix);
        // translacja:
        //animatePosition();
        //drawTranslation(gl, pointsBuffer.numItems, Tx, Ty, Tz, tMatrix);
        requestAnimationFrame(tick);    // request that the browser calls tick
    };

    tick();
}