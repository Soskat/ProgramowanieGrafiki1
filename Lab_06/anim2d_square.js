/**
 * Created by nocah on 25.11.2015.
 */


var VSHADER_SOURCE =
    'attribute vec3 position;\n' +
    'uniform mat4 rmatrix;\n' +
    'uniform mat4 tmatrix;\n' +
    'void main(void){\n' +
    '   gl_Position = vec4(position, 1.0) * rmatrix * tmatrix;\n' +
    '}\n';

var FSHADER_SOURCE =
    'void main(void){\n' +
    '   gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0);\n' +
    '}\n';

// zmienne globalne:
var rotMatrix = new Float32Array(16);   // macierz obrotu
var transMatrix = new Float32Array(16); // macierz translacji
var g_last = Date.now();
var Tx = 0.0, Ty = 0.0, Tz = 0.0;
var currAngle = 0.0;


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
    //Tz = Tz + (STEP * elapsed) / 1000.0;

    if(Tx > 1) Tx *= -1.0;
    if(Ty > 1) Ty *= -1.0;
    //if(Tz > 1) Tz *= -1.0;
}

// Animacja kwadratu
function animateSquare(){
    var ANGLE_STEP = 45.0;
    var STEP = 0.2;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;

    currAngle = (currAngle + (ANGLE_STEP * elapsed) / 1000.0) % 360;

    Tx = Tx + (STEP * elapsed) / 1000.0;
    Ty = Ty + (STEP * elapsed) / 1000.0;
    //Tz = Tz + (STEP * elapsed) / 1000.0;

    if(Tx > 1) Tx *= -1.0;
    if(Ty > 1) Ty *= -1.0;
    //if(Tz > 1) Tz *= -1.0;
}

// Ustawianie macierzy rotacji:
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

// Ustawianie macierzy translacji:
function setNewTranslateMatrix(Tx, Ty, Tz){
    transMatrix[0] = 1.0;
    transMatrix[3] = Tx;
    transMatrix[5] = 1.0;
    transMatrix[7] = Ty;
    transMatrix[10] = 1.0;
    transMatrix[11] = Tz;
    transMatrix[15] = 1.0;
}

// Rysowanie rotacji (aplikowanie macierzy rotacji):
function drawRotation(gl, n, currentAngle, u_ModelMatrix){
    setNewRotateMatrix(currentAngle);
    gl.uniformMatrix4fv(u_ModelMatrix, false, rotMatrix);
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

// Rysowanie przeksztalcen kwadratu (rotacja + translacja)
function drawSquare(gl, n, u_r_ModelMatrix, u_t_ModelMatrix){
    setNewRotateMatrix(currAngle);
    setNewTranslateMatrix(Tx,Ty,Tz);

    gl.uniformMatrix4fv(u_r_ModelMatrix, false, rotMatrix);
    gl.uniformMatrix4fv(u_t_ModelMatrix, false, transMatrix);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

// Rysowanie wszystkiego na Canvasie
function drawStuff(){
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

    var rMatrix = gl.getUniformLocation(gl.program, 'rmatrix');
    var tMatrix = gl.getUniformLocation(gl.program, 'tmatrix');

    // === Tworzenie buforu z wspolrzednymi punktow figury ===
    var pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);

    var vertices = new Float32Array([
         0.2,  0.2,
        -0.2,  0.2,
         0.2, -0.2,
        -0.2, -0.2,
        -0.2,  0.2,
         0.2, -0.2
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pointsBuffer.itemSize = 2;
    pointsBuffer.numItems = 6;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.vertexAttribPointer(program.position, pointsBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(tMatrix, false, transMatrix);
    gl.uniformMatrix4fv(rMatrix, false, rotMatrix);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, pointsBuffer.numItems);


    // === Funkcja animujaca figure ===
    var tick = function(){

        // rotacja + translacja:
        animateSquare();    // Update rotation and translation
        drawSquare(gl, pointsBuffer.numItems, rMatrix, tMatrix);

        // rotacja:
        //currAngle = animateAngle(currAngle);
        //drawRotation(gl, pointsBuffer.numItems, currAngle, rMatrix);

        // translacja:
        //animatePosition();
        //drawTranslation(gl, pointsBuffer.numItems, Tx, Ty, Tz, tMatrix);

        requestAnimationFrame(tick);    // request that the browser calls tick
    };

    tick();
}