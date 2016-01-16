/**
 * Created by nocah on 08.01.2016.
 */


// == Programy shaderow ===========================================================================

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'uniform mat4 rmatrix;\n'+
    'uniform mat4 tmatrix;\n'+
    'attribute vec2 aTexCoord;\n'+
    'varying vec2 vTexCoord;\n'+
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * tmatrix * rmatrix * position;\n' +
    '   vTexCoord = aTexCoord;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D uSampler;\n' +
        //'uniform sampler2D uSampler1;\n' +
        //'uniform sampler2D uSampler2;\n' +
        //'uniform sampler2D uSampler3;\n' +
    'varying vec2 vTexCoord;\n'+
    'void main(){\n' +
        //'    vec4 color1 = texture2D(uSampler1, vTexCoord);\n' +
        //'    vec4 color2 = texture2D(uSampler2, vTexCoord);\n' +
        //'    vec4 color3 = texture2D(uSampler3, vTexCoord);\n' +
    '    gl_FragColor = texture2D(uSampler, vTexCoord);\n' +
        //'   gl_FragColor = color1 * color2 * color3;\n' + //desperacja t-t
        //'   gl_FragColor = texture2D(uSampler2, vTexCoord);\n' + //tekstura 2.
        //'   gl_FragColor = texture2D(uSampler3, vTexCoord);\n' + //tekstura 3.
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


var g_eyeX = 0.20, g_eyeY = -0.25, g_eyeZ = 0.25;

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


var rotMatrixCube = new Float32Array(16);   // macierz rotacji szescianu
var rotMatrixSphere = new Float32Array(16); // macierz rotacji sfery
var identity = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

// Aktualizuje macierz rotacji
function setNewRotateMatrix(rotMatrix, angle, axis){
    var radian = Math.PI * angle / 180.0;   // degr to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    if(axis == 'X'){
        rotMatrix[0] = 1.0;
        rotMatrix[5] = cosB;
        rotMatrix[6] = sinB;
        rotMatrix[9] = -sinB;
        rotMatrix[10] = cosB;
        rotMatrix[15] = 1.0;
    }
    else if(axis == 'Y'){
        rotMatrix[0] = cosB;
        rotMatrix[2] = -sinB;
        rotMatrix[5] = 1.0;
        rotMatrix[8] = sinB;
        rotMatrix[10] = cosB;
        rotMatrix[15] = 1.0;
    }
    else if(axis == 'Z'){
        rotMatrix[0] = cosB;
        rotMatrix[1] = sinB;
        rotMatrix[4] = -sinB;
        rotMatrix[5] = cosB;
        rotMatrix[10] = 1.0;
        rotMatrix[15] = 1.0;
    }
}


var transMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);

// Aktualizuje macierz translacji
function setNewSphereTranslationMatrix(angle, r){
    var radian = Math.PI * angle / 180.0;   // degr to radians
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    transMatrix[12] = r * sinB;     // vx
    transMatrix[14] = r * cosB;     // vz
}


var g_last = Date.now();
var currentAngle = 0.0;

// Animowanie elementow sceny
function animate(gl, u_ViewMatrix, rMatrix, tMatrix, r, floorN, cubeN, sphereN){
    var ANGLE_STEP = 45.0;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    currentAngle = (currentAngle + (ANGLE_STEP * elapsed) / 1000.0) % 360;

    setNewSphereTranslationMatrix(currentAngle, r);             // przesuniecie sfery
    setNewRotateMatrix(rotMatrixSphere, currentAngle, 'X');     // rotacja sfery
    setNewRotateMatrix(rotMatrixCube, currentAngle, 'Y');       // rotacja szescianu

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    // aktualizacja perspektywy:
    setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    // ustawiam wyjsciowa rotacje i rysuje podloze:
    gl.uniformMatrix4fv(tMatrix, false, identity);
    gl.uniformMatrix4fv(rMatrix, false, identity);
    gl.drawArrays(gl.TRIANGLES, 0, floorN);

    // ustawiam rotacje dla szescianu i go rysuje:
    gl.uniformMatrix4fv(rMatrix, false, rotMatrixCube);
    gl.drawArrays(gl.TRIANGLES, floorN, cubeN);

    // ustawiam wyjsciowa rotacje i rysuje sfere:
    gl.uniformMatrix4fv(tMatrix, false, transMatrix);
    gl.uniformMatrix4fv(rMatrix, false, rotMatrixSphere);
    gl.drawArrays(gl.TRIANGLES, floorN + cubeN, sphereN);
}


// Wczytywanie tekstury:
function loadTextureSettings(gl, gl_texture, texture, u_Sampler, index, img){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.activeTexture(gl_texture);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl. RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(u_Sampler, index); // przeniesienie do pamieci
}



// == Program glowny ==============================================================================

// Rysuje rzeczy w Canvasie:
function drawStuff() {
    // /ladowanie shaderow do programu
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


    var texturedVertices = new Float32Array
    (
        [  // wspolrz.:    // wspolrz. tekstury:

            // podloze:
            -0.5, -0.5, -0.5,   0.25, 0.25,
            -0.5, -0.5,  0.5,   0.25, 0.5,
            0.5, -0.5, -0.5,   0.5,  0.25,
            0.5, -0.5, -0.5,   0.5,  0.25,
            -0.5, -0.5,  0.5,   0.25, 0.5,
            0.5, -0.5,  0.5,   0.5,  0.5,

            // szescian:
            -0.1, -0.1,  0.1,   0.5,  0.5,
            0.1, -0.1,  0.1,   1.0,  0.5,
            -0.1, -0.1, -0.1,   0.5,  0.75,
            -0.1, -0.1, -0.1,   0.5,  0.75,
            0.1, -0.1,  0.1,   1.0,  0.5,
            0.1, -0.1, -0.1,   1.0,  0.75,

            -0.1, -0.1, -0.1,   0.5,  0.0,
            0.1, -0.1, -0.1,   1.0,  0.0,
            -0.1,  0.1, -0.1,   0.5,  0.25,
            -0.1,  0.1, -0.1,   0.5,  0.25,
            0.1, -0.1, -0.1,   1.0,  0.0,
            0.1,  0.1, -0.1,   1.0,  0.25,

            -0.1, -0.1,  0.1,   0.0,  0.5,
            -0.1, -0.1, -0.1,   0.0,  0.25,
            -0.1,  0.1,  0.1,   0.5,  0.5,
            -0.1,  0.1,  0.1,   0.5,  0.5,
            -0.1, -0.1, -0.1,   0.0,  0.25,
            -0.1,  0.1, -0.1,   0.5,  0.25,

            -0.1, -0.1,  0.1,   0.0,  0.25,
            0.1, -0.1,  0.1,   0.5,  0.25,
            -0.1,  0.1,  0.1,   0.0,  0.0,
            -0.1,  0.1,  0.1,   0.0,  0.0,
            0.1, -0.1,  0.1,   0.5,  0.25,
            0.1,  0.1,  0.1,   0.5,  0.0,

            0.1, -0.1,  0.1,   1.0,  0.5,
            0.1,  0.1,  0.1,   0.5,  0.5,
            0.1, -0.1, -0.1,   1.0,  0.25,
            0.1, -0.1, -0.1,   1.0,  0.25,
            0.1,  0.1,  0.1,   0.5,  0.5,
            0.1,  0.1, -0.1,   0.5,  0.25,

            0.1,  0.1,  0.1,   0.5,  0.75,
            0.1,  0.1, -0.1,   0.5,  0.5,
            -0.1,  0.1,  0.1,   0.0,  0.75,
            -0.1,  0.1,  0.1,   0.0,  0.75,
            0.1,  0.1, -0.1,   0.5,  0.5,
            -0.1,  0.1, -0.1,   0.0,  0.5,


            // sfera:
            -0.1, -0.1,  0.1,   0.5,  0.5,
            0.1, -0.1,  0.1,   1.0,  0.5,
            -0.1, -0.1, -0.1,   0.5,  0.75,
            -0.1, -0.1, -0.1,   0.5,  0.75,
            0.1, -0.1,  0.1,   1.0,  0.5,
            0.1, -0.1, -0.1,   1.0,  0.75,

            -0.1, -0.1, -0.1,   0.5,  0.0,
            0.1, -0.1, -0.1,   1.0,  0.0,
            -0.1,  0.1, -0.1,   0.5,  0.25,
            -0.1,  0.1, -0.1,   0.5,  0.25,
            0.1, -0.1, -0.1,   1.0,  0.0,
            0.1,  0.1, -0.1,   1.0,  0.25,

            -0.1, -0.1,  0.1,   0.0,  0.5,
            -0.1, -0.1, -0.1,   0.0,  0.25,
            -0.1,  0.1,  0.1,   0.5,  0.5,
            -0.1,  0.1,  0.1,   0.5,  0.5,
            -0.1, -0.1, -0.1,   0.0,  0.25,
            -0.1,  0.1, -0.1,   0.5,  0.25,

            -0.1, -0.1,  0.1,   0.0,  0.25,
            0.1, -0.1,  0.1,   0.5,  0.25,
            -0.1,  0.1,  0.1,   0.0,  0.0,
            -0.1,  0.1,  0.1,   0.0,  0.0,
            0.1, -0.1,  0.1,   0.5,  0.25,
            0.1,  0.1,  0.1,   0.5,  0.0,

            0.1, -0.1,  0.1,   1.0,  0.5,
            0.1,  0.1,  0.1,   0.5,  0.5,
            0.1, -0.1, -0.1,   1.0,  0.25,
            0.1, -0.1, -0.1,   1.0,  0.25,
            0.1,  0.1,  0.1,   0.5,  0.5,
            0.1,  0.1, -0.1,   0.5,  0.25,

            0.1,  0.1,  0.1,   0.5,  0.75,
            0.1,  0.1, -0.1,   0.5,  0.5,
            -0.1,  0.1,  0.1,   0.0,  0.75,
            -0.1,  0.1,  0.1,   0.0,  0.75,
            0.1,  0.1, -0.1,   0.5,  0.5,
            -0.1,  0.1, -0.1,   0.0,  0.5
        ]
    );
    var N = texturedVertices.length / 6;
    var floorN = 6, cubeN = 36, sphereN = 36;

    var FSIZE = texturedVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu w buforze


    // tworzenie bufora tekstury:
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturedVertices), gl.STATIC_DRAW);

    // tworzenie bufora punktow:
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texturedVertices, gl.STATIC_DRAW);


    // wyciaganie danych z shadera:

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');               // macierz perspektywy
    document.onkeydown = function(ev){ keydown(ev, gl, N, u_ViewMatrix, viewMatrix); }; // uruchamiamy obsluge klawiszy
    setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var rMatrix = gl.getUniformLocation(gl.program, 'rmatrix');     // macierz rotacji
    gl.uniformMatrix4fv(rMatrix, false, identity);

    var tMatrix = gl.getUniformLocation(gl.program, 'tmatrix');     // macierz translacji
    gl.uniformMatrix4fv(tMatrix, false, identity);

    var position = gl.getAttribLocation(gl.program, 'position');
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(position);

    var a_TextCoord = gl.getAttribLocation(gl.program, 'aTexCoord');
    gl.vertexAttribPointer(a_TextCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    gl.enableVertexAttribArray(a_TextCoord);


    // tworzenie tekstur (i rysowanie elementow sceny):
    var floor_u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');
    var floorTexture = gl.createTexture();
    var floorImg = new Image();
    floorImg.src = "basketStyle.jpg";
    floorImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE0, floorTexture, floor_u_Sampler, 0, floorImg); };

    console.log(gl.TEXTURE0);

    gl.drawArrays(gl.TRIANGLES, 0, floorN);

    var cube_u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');
    var cubeTexture = gl.createTexture();
    var cubeImg = new Image();
    cubeImg.src = "differentWalls.jpg";
    cubeImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE1, cubeTexture, cube_u_Sampler, 1, cubeImg); };

    console.log(gl.TEXTURE1);

    gl.drawArrays(gl.TRIANGLES, floorN, cubeN);

    var sphere_u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');
    var sphereTexture = gl.createTexture();
    var sphereImg = new Image();
    sphereImg.src = "cracked.jpg";
    sphereImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE2, sphereTexture, sphere_u_Sampler, 2, sphereImg); };

    console.log(gl.TEXTURE2);

    gl.drawArrays(gl.TRIANGLES, floorN + cubeN, sphereN);


    // animowanie sceny:
    var tick = function(){
        animate(gl, u_ViewMatrix, rMatrix, tMatrix, 0.5, floorN, cubeN, sphereN);    // uruchamia animacje elementow sceny
        requestAnimationFrame(tick);                                            // request that the browser calls tick
    };

    tick();
}