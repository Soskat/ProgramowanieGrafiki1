/**
 * Created by nocah on 16.12.2015.
 */


// == Programy shaderow ===========================================================================

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec4 a_color;\n'+
    'varying vec4 v_color;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'uniform mat4 rmatrix;\n'+
    'void main() {\n' +
    '   gl_Position = rmatrix * u_ViewMatrix * position;\n' +
    '   v_color = a_color;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_color;\n'+
    'void main(){\n' +
    '   gl_FragColor = v_color;\n' +  //kolor punktu
    '}\n';

// == Funkcje pomocnicze ==========================================================================

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


var g_eyeX = 0.20, g_eyeY = 0.25, g_eyeZ = 0.25;

// Obsluga klawiszy strzalek:
function keydown(ev, gl, n, u_ViewMatrix){
    if(ev.keyCode == 38){
        g_eyeY += 0.02;
    }
    else if(ev.keyCode == 40){
        g_eyeY -= 0.02;
    }
    else if(ev.keyCode == 39){
        g_eyeX += 0.02;
    }
    else if(ev.keyCode == 37){
        g_eyeX -= 0.02;
    }
    else{
        return;
    }
    setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // rysuje elementy sceny:
    gl.drawArrays(gl.TRIANGLES, 0, n);
}



var rotMatrixCube = new Float32Array(16);   // macierz rotacji szescianu wokol osi Y
var identity = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

// Aktualizuje macierz rotacji
function setNewCubeRotateMatrix(angle){
    var radian = Math.PI * angle / 180.0;   // degr to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    rotMatrixCube[0] = cosB;
    rotMatrixCube[2] = -sinB;
    rotMatrixCube[5] = 1.0;
    rotMatrixCube[8] = sinB;
    rotMatrixCube[10] = cosB;
    rotMatrixCube[15] = 1.0;
}


var g_last = Date.now();
var currentAngle = 0.0;

// Animowanie elementow sceny
function animate(gl, rMatrix, floorN, cubeN){
    var ANGLE_STEP = 45.0;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    currentAngle = (currentAngle + (ANGLE_STEP * elapsed) / 1000.0) % 360;

    setNewCubeRotateMatrix(currentAngle);   // rotacja szescianu

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // ustawiam wyjsciowa rotacje i rysuje podloze:
    gl.uniformMatrix4fv(rMatrix, false, identity);
    gl.drawArrays(gl.TRIANGLES, 0, floorN);

    // ustawiam rotacje dla szescianu i go rysuje:
    gl.uniformMatrix4fv(rMatrix, false, rotMatrixCube);
    gl.drawArrays(gl.TRIANGLES, floorN, cubeN);
}





// == Program glowny ==============================================================================

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


    // czyszczenie bufora:
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);


    var coloredVertices = new Float32Array
    (
        [  // wspolrz.:   // RGB:

            // podloze:
            -0.5, -0.5, -0.5,  0.5, 0.5, 0.5,
            -0.5, -0.5,  0.5,  0.5, 0.5, 0.5,
             0.5, -0.5, -0.5,  0.5, 0.5, 0.5,
             0.5, -0.5, -0.5,  0.5, 0.5, 0.5,
            -0.5, -0.5,  0.5,  0.5, 0.5, 0.5,
             0.5, -0.5,  0.5,  0.5, 0.5, 0.5,

            // szescian:
            -0.1, -0.1,  0.1,   0.1, 0.8, 0.2,
             0.1, -0.1,  0.1,   0.1, 0.8, 0.2,
            -0.1, -0.1, -0.1,   0.1, 0.8, 0.2,
            -0.1, -0.1, -0.1,   0.1, 0.8, 0.2,
             0.1, -0.1,  0.1,   0.1, 0.8, 0.2,
             0.1, -0.1, -0.1,   0.1, 0.8, 0.2,

            -0.1, -0.1, -0.1,   0.4, 0.3, 0.2,
             0.1, -0.1, -0.1,   0.4, 0.3, 0.2,
            -0.1,  0.1, -0.1,   0.4, 0.3, 0.2,
            -0.1,  0.1, -0.1,   0.4, 0.3, 0.2,
             0.1, -0.1, -0.1,   0.4, 0.3, 0.2,
             0.1,  0.1, -0.1,   0.4, 0.3, 0.2,

            -0.1, -0.1,  0.1,   0.3, 0.5, 0.2,
            -0.1, -0.1, -0.1,   0.3, 0.5, 0.2,
            -0.1,  0.1,  0.1,   0.3, 0.5, 0.2,
            -0.1,  0.1,  0.1,   0.3, 0.5, 0.2,
            -0.1, -0.1, -0.1,   0.3, 0.5, 0.2,
            -0.1,  0.1, -0.1,   0.3, 0.5, 0.2,

            -0.1, -0.1,  0.1,   0.4, 0.3, 0.2,
             0.1, -0.1,  0.1,   0.4, 0.3, 0.2,
            -0.1,  0.1,  0.1,   0.4, 0.3, 0.2,
            -0.1,  0.1,  0.1,   0.4, 0.3, 0.2,
             0.1, -0.1,  0.1,   0.4, 0.3, 0.2,
             0.1,  0.1,  0.1,   0.4, 0.3, 0.2,

             0.1, -0.1,  0.1,   0.3, 0.5, 0.2,
             0.1,  0.1,  0.1,   0.3, 0.5, 0.2,
             0.1, -0.1, -0.1,   0.3, 0.5, 0.2,
             0.1, -0.1, -0.1,   0.3, 0.5, 0.2,
             0.1,  0.1,  0.1,   0.3, 0.5, 0.2,
             0.1,  0.1, -0.1,   0.3, 0.5, 0.2,

             0.1,  0.1,  0.1,   0.1, 0.8, 0.2,
             0.1,  0.1, -0.1,   0.1, 0.8, 0.2,
            -0.1,  0.1,  0.1,   0.1, 0.8, 0.2,
            -0.1,  0.1,  0.1,   0.1, 0.8, 0.2,
             0.1,  0.1, -0.1,   0.1, 0.8, 0.2,
            -0.1,  0.1, -0.1,   0.1, 0.8, 0.2
        ]
    );
    var N = coloredVertices.length / 6;




    var FSIZE = coloredVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu w buforze

    // wyciaganie danych z shadera:
    var position = gl.getAttribLocation(gl.program, 'position');
    var color = gl.getAttribLocation(gl.program, 'a_color');

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    document.onkeydown = function(ev){ keydown(ev, gl, N, u_ViewMatrix, viewMatrix); }; // uruchamiamy obsluge klawiszy
    setLookAt(0.20, -0.25, 0.25, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var rMatrix = gl.getUniformLocation(gl.program, 'rmatrix');
    gl.uniformMatrix4fv(rMatrix, false, identity);

    // tworzenie bufora punktow:
    var floorVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coloredVertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    // rysowanie elementow sceny:
    gl.drawArrays(gl.TRIANGLES, 0, N);



    var tick = function(){
        animate(gl, rMatrix, 6, N-6);           // uruchamia animacje elementow sceny
        requestAnimationFrame(tick);    // request that the browser calls tick
    };

    tick();
}