/**
 * Created by nocah on 08.01.2016.
 */


// ---------------------------------------------------------------------------------------------------------------------
// == Programy shaderow ================================================================================================
// ---------------------------------------------------------------------------------------------------------------------

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec2 aTexCoord;\n'+
    'attribute vec3 normal;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'uniform mat4 rmatrix;\n'+
    'uniform mat4 tmatrix;\n'+
    'varying vec2 vTexCoord;\n'+
    'varying vec3 vNormal;\n'+
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * tmatrix * rmatrix * position;\n' +
    '   vTexCoord = aTexCoord;\n' +
    '   vNormal = vec3(tmatrix * rmatrix * vec4(normalize(normal), 0.0));\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D uSampler;\n' +
    'varying vec2 vTexCoord;\n'+
    'varying vec3 vNormal;\n'+
    // parametry zrodla swiatla:
    'const vec3 source_ambient_color  = vec3(0.5, 0.5, 0.5);\n' +
    'const vec3 source_diffuse_color  = vec3(1.5, 1.5, 1.5);\n' +
    'const vec3 source_direction      = vec3(0.58, 0.58, -0.58);\n' +
    // parametry materialu:
    'const vec3 mat_ambient_color  = vec3(1.0, 1.0, 1.);\n' +
    'const vec3 mat_diffuse_color  = vec3(1.0, 1.0, 1.0);\n' +
    'const float mat_shininess     = 10.0;\n' +
    'void main(){\n' +
    '    vec3 color = vec3(texture2D(uSampler, vTexCoord));\n' +
        // obliczamy elementy oswietlenia:
    '    vec3 I_ambient = source_ambient_color * mat_ambient_color;\n' +
    '    vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0.0, dot(vNormal, source_direction));\n' +
    '    vec3 I = I_ambient + I_diffuse;\n' +
    '    gl_FragColor = vec4(I * color, 1.0);\n' +
    '}\n';



// ---------------------------------------------------------------------------------------------------------------------
// == Funkcje pomocnicze ===============================================================================================
// ---------------------------------------------------------------------------------------------------------------------


var theta = 0.0, phi = 0.0; // katy obrotu macierzy widoku
// Obsluga klawiszy strzalek
function keydown(ev){
    if(ev.keyCode == 38){
        phi += 0.02;
    }
    else if(ev.keyCode == 40){
        phi -= 0.02;
    }
    else if(ev.keyCode == 39){
        theta += 0.02;
    }
    else if(ev.keyCode == 37){
        theta -= 0.02;
    }
}


var viewMatrix = new Float32Array(16);  // macierz widoku
var g_eyeX = 0.20, g_eyeY = -0.25, g_eyeZ = 0.25;
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


// Obraca podana macierz w osi X o wskazany kat
function rotateX(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);
    var mv1 = m[1], mv5 = m[5], mv9 = m[9];

    m[1] = m[1] * c - m[2] * s;
    m[5] = m[5] * c - m[6] * s;
    m[9] = m[9] * c - m[10] * s;

    m[2] = m[2] * c + mv1 * s;
    m[6] = m[6] * c + mv5 * s;
    m[10] = m[10] * c + mv9 * s;
}


// Obraca podana macierz w osi Y o wskazany kat
function rotateY(m, angle) {
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    var mv0 = m[0], mv4 = m[4], mv8 = m[8];
    m[0] = c * m[0] + s * m[2];
    m[4] = c * m[4] + s * m[6];
    m[8] = c * m[8] + s * m[10];

    m[2] = c * m[2] - s * mv0;
    m[6] = c * m[6] - s * mv4;
    m[10] = c * m[10] - s * mv8;
}


var rotMatrixCube = new Float32Array(16);                               // macierz rotacji szescianu
var rotMatrixSphere = new Float32Array(16);                             // macierz rotacji sfery
var identity = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);  // macierz jednostkowa
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


var transMatrix = new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);   // macierz translacji
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
// Animuje elementy sceny
function animate(gl, u_ViewMatrix, r){
    var ANGLE_STEP = 45.0;
    var now = Date.now();
    var elapsed = now - g_last; // milisec
    g_last = now;
    currentAngle = (currentAngle + (ANGLE_STEP * elapsed) / 1000.0) % 360;

    // aktualizacja perspektywy:
    rotateY(viewMatrix, theta);
    rotateX(viewMatrix, phi);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    theta = 0.0;
    phi = 0.0;

    setNewSphereTranslationMatrix(-currentAngle, r);             // przesuniecie sfery
    setNewRotateMatrix(rotMatrixSphere, currentAngle, 'X');     // rotacja sfery
    setNewRotateMatrix(rotMatrixCube, currentAngle, 'Y');       // rotacja szescianu
}


// Wczytuje teksture:
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


var Nx = 0.0, Ny = 0.0, Nz = 0.0;   // wspolrzedne wektora normalnego
// Oblicza wektor normalny dla podanej powierzchni (trojki punktow):
function calculateNormal(p1x, p1y, p1z, p2x, p2y, p2z, p3x, p3y, p3z){
    // U = p2 - p1
    var Ux = p2x - p1x;
    var Uy = p2y - p1y;
    var Uz = p2z - p1z;

    // V = p3 - p1
    var Vx = p3x - p1x;
    var Vy = p3y - p1y;
    var Vz = p3z - p1z;

    Nx = Uy * Vz - Uz * Vy;
    Ny = Uz * Vx - Ux * Vz;
    Nz = Ux * Vy - Uy * Vx;
}


var bigR = 0.2;                             // promien sfery
var accuracy = 10;                          // dokladnosc modelu sfery
var upCape = 0, middle = 0, downCape = 0;   // liczniki wierzcholkow spodow i ciala sfery
// Rysuje model sfery:
function drawSphere(vertices, bigR, accuracy){
    var alpha = 2 * Math.PI / accuracy;             // kat na plaszczyznie X-Z
    var beta = Math.PI / accuracy;                  // kat na plaszczyznie X-Y
    var i = 1, j;                                   // indeksy
    var r1, r2;                                     // promienie dwoch wycinkow sfery
    var y1, y2;                                     // wspolrzedne Y dwoch poziomow punktow
    var p1x, p1z,  p2x, p2z,  p3x, p3z,  p4x, p4z;  // wspolrzedne X i Z czterech punktow pomocniczych
    // wierzcholki tekstury:
    var t0x = 0.5, t0y = 0.0;
    var t1x = 0.0, t1y = 0.0;
    var t2x = 1.0, t2y = 0.0;
    var t3x = 0.0, t3y = 1.0;
    var t4x = 1.0, t4y = 1.0;

    r1 = bigR * Math.sin(i * beta);     // aktualizujemy dlugosc r
    y1 = bigR * Math.cos(i * beta);     // aktualizujemy dlugosc y1

    // rysujemy wierzch sfery:
    vertices.push(0.0, bigR, 0.0,  0.0, 1.0, 0.0,  t0x, t0y);
    upCape++;
    for(j = 0; j <= accuracy; j += 2){
        p1x = r1 * Math.cos(j * alpha);
        p1z = r1 * Math.sin(j * alpha);
        p2x = r1 * Math.cos((j + 1) * alpha);
        p2z = r1 * Math.sin((j + 1) * alpha);

        calculateNormal(0.0, bigR, 0.0, p1x, y1, p1z, p2x, y1, p2z);

        vertices.push(p1x, y1, p1z, Nx, -Ny, Nz, t3x, t3y);
        vertices.push(p2x, y1, p2z, Nx, -Ny, Nz, t4x, t4y);

        upCape += 2;
    }

    for(i; i <= accuracy; i++){
        // aktualizujemy dlugosc r1, r2, y1 i y2:
        r1 = bigR * Math.sin(i * beta);
        r2 = bigR * Math.sin((i + 1) * beta);
        y1 = bigR * Math.cos(i * beta);
        y2 = bigR * Math.cos((i + 1) * beta);

        for(j = 0; j <= accuracy; j++){
            // poziom I punktow:
            p1x = r1 * Math.cos(j * alpha);
            p1z = r1 * Math.sin(j * alpha);
            p2x = r1 * Math.cos((j + 1) * alpha);
            p2z = r1 * Math.sin((j + 1) * alpha);
            // poziom II punktow:
            p3x = r2 * Math.cos(j * alpha);
            p3z = r2 * Math.sin(j * alpha);
            p4x = r2 * Math.cos((j + 1) * alpha);
            p4z = r2 * Math.sin((j + 1) * alpha);

            // wsadzamy punkty do tablicy:
            calculateNormal(p1x, y1, p1z, p2x, y1, p2z, p4x, y2, p4z);
            vertices.push(p1x, y1, p1z, Nx, Ny, Nz, t1x, t1y);
            vertices.push(p2x, y1, p2z, Nx, Ny, Nz, t2x, t2y);
            vertices.push(p4x, y2, p4z, Nx, Ny, Nz, t4x, t4y);
            calculateNormal(p4x, y2, p4z, p3x, y2, p3z, p1x, y1, p1z);
            vertices.push(p4x, y2, p4z, Nx, Ny, Nz, t4x, t4y);
            vertices.push(p3x, y2, p3z, Nx, Ny, Nz, t3x, t3y);
            vertices.push(p1x, y1, p1z, Nx, Ny, Nz, t1x, t1y);

            middle += 6;
        }
    }

    // rysujemy spod sfery:
    vertices.push(0.0, -bigR, 0.0,  0.0, -1.0, 0.0,  t0x, t0y);
    downCape++;
    for(j = 0; j <= accuracy; j += 2){
        p1x = r1 * Math.cos(j * alpha);
        p1z = r1 * Math.sin(j * alpha);
        p2x = r1 * Math.cos((j + 1) * alpha);
        p2z = r1 * Math.sin((j + 1) * alpha);

        calculateNormal(0.0, -bigR, 0.0, p1x, -y1, p1z, p2x, -y1, p2z);

        vertices.push(p1x, -y1, p1z, Nx, Ny, Nz, t3x, t3y);
        vertices.push(p2x, -y1, p2z, Nx, Ny, Nz, t4x, t4y);

        downCape += 2;
    }

    return vertices;
}



// ---------------------------------------------------------------------------------------------------------------------
// == Program glowny ===================================================================================================
// ---------------------------------------------------------------------------------------------------------------------

// Rysuje rzeczy w Canvasie:
function drawStuff() {
    // ladowanie shaderow do programu: =================================================================================
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

    console.log(pixelShader);

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


    // tworzenie listy punktow: ========================================================================================
    var vertices = [
        // wspolrz.:         // normalne      // wspolrz. tekstury:
        -0.5, -0.5, -0.5,    0.0,  1.0,  0.0,    0.25, 0.25,
        -0.5, -0.5,  0.5,    0.0,  1.0,  0.0,    0.25, 0.5,
         0.5, -0.5, -0.5,    0.0,  1.0,  0.0,    0.5,  0.25,
         0.5, -0.5, -0.5,    0.0,  1.0,  0.0,    0.5,  0.25,
        -0.5, -0.5,  0.5,    0.0,  1.0,  0.0,    0.25, 0.5,
         0.5, -0.5,  0.5,    0.0,  1.0,  0.0,    0.5,  0.5
    ];
    var floorN = vertices.length / 8;

    vertices.push(
        // wspolrz.:         // normalne      // wspolrz. tekstury:
        -0.1, -0.1,  0.1,    0.0, -1.0,  0.0,    0.5,  0.5,
         0.1, -0.1,  0.1,    0.0, -1.0,  0.0,    1.0,  0.5,
        -0.1, -0.1, -0.1,    0.0, -1.0,  0.0,    0.5,  0.75,
        -0.1, -0.1, -0.1,    0.0, -1.0,  0.0,    0.5,  0.75,
         0.1, -0.1,  0.1,    0.0, -1.0,  0.0,    1.0,  0.5,
         0.1, -0.1, -0.1,    0.0, -1.0,  0.0,    1.0,  0.75,

        -0.1, -0.1, -0.1,    0.0,  0.0, -1.0,    0.5,  0.0,
         0.1, -0.1, -0.1,    0.0,  0.0, -1.0,    1.0,  0.0,
        -0.1,  0.1, -0.1,    0.0,  0.0, -1.0,    0.5,  0.25,
        -0.1,  0.1, -0.1,    0.0,  0.0, -1.0,    0.5,  0.25,
         0.1, -0.1, -0.1,    0.0,  0.0, -1.0,    1.0,  0.0,
         0.1,  0.1, -0.1,    0.0,  0.0, -1.0,    1.0,  0.25,

        -0.1, -0.1,  0.1,   -1.0,  0.0,  0.0,    0.0,  0.5,
        -0.1, -0.1, -0.1,   -1.0,  0.0,  0.0,    0.0,  0.25,
        -0.1,  0.1,  0.1,   -1.0,  0.0,  0.0,    0.5,  0.5,
        -0.1,  0.1,  0.1,   -1.0,  0.0,  0.0,    0.5,  0.5,
        -0.1, -0.1, -0.1,   -1.0,  0.0,  0.0,    0.0,  0.25,
        -0.1,  0.1, -0.1,   -1.0,  0.0,  0.0,    0.5,  0.25,

        -0.1, -0.1,  0.1,    0.0,  0.0,  1.0,    0.0,  0.25,
         0.1, -0.1,  0.1,    0.0,  0.0,  1.0,    0.5,  0.25,
        -0.1,  0.1,  0.1,    0.0,  0.0,  1.0,    0.0,  0.0,
        -0.1,  0.1,  0.1,    0.0,  0.0,  1.0,    0.0,  0.0,
         0.1, -0.1,  0.1,    0.0,  0.0,  1.0,    0.5,  0.25,
         0.1,  0.1,  0.1,    0.0,  0.0,  1.0,    0.5,  0.0,

         0.1, -0.1,  0.1,    1.0,  0.0,  0.0,    1.0,  0.5,
         0.1,  0.1,  0.1,    1.0,  0.0,  0.0,    0.5,  0.5,
         0.1, -0.1, -0.1,    1.0,  0.0,  0.0,    1.0,  0.25,
         0.1, -0.1, -0.1,    1.0,  0.0,  0.0,    1.0,  0.25,
         0.1,  0.1,  0.1,    1.0,  0.0,  0.0,    0.5,  0.5,
         0.1,  0.1, -0.1,    1.0,  0.0,  0.0,    0.5,  0.25,

         0.1,  0.1,  0.1,    0.0,  1.0,  0.0,    0.5,  0.75,
         0.1,  0.1, -0.1,    0.0,  1.0,  0.0,    0.5,  0.5,
        -0.1,  0.1,  0.1,    0.0,  1.0,  0.0,    0.0,  0.75,
        -0.1,  0.1,  0.1,    0.0,  1.0,  0.0,    0.0,  0.75,
         0.1,  0.1, -0.1,    0.0,  1.0,  0.0,    0.5,  0.5,
        -0.1,  0.1, -0.1,    0.0,  1.0,  0.0,    0.0,  0.5
    );
    var cubeN = (vertices.length / 8) - floorN;

    vertices = drawSphere(vertices, bigR, accuracy);

    var texturedVertices = new Float32Array(vertices);

    var FSIZE = texturedVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu w buforze


    // tworzenie bufora tekstury: ======================================================================================
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texturedVertices), gl.STATIC_DRAW);


    // tworzenie bufora punktow: =======================================================================================
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texturedVertices, gl.STATIC_DRAW);


    // wyciaganie danych z shadera: ====================================================================================
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');   // macierz perspektywy
    document.onkeydown = function(ev){ keydown(ev); };                      // uruchamiamy obsluge klawiszy
    setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var rMatrix = gl.getUniformLocation(gl.program, 'rmatrix');     // macierz rotacji
    gl.uniformMatrix4fv(rMatrix, false, identity);

    var tMatrix = gl.getUniformLocation(gl.program, 'tmatrix');     // macierz translacji
    gl.uniformMatrix4fv(tMatrix, false, identity);

    var position = gl.getAttribLocation(gl.program, 'position');
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 8, 0);
    gl.enableVertexAttribArray(position);

    var normal = gl.getAttribLocation(gl.program, 'normal');
    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(normal);

    var a_TextCoord = gl.getAttribLocation(gl.program, 'aTexCoord');
    gl.vertexAttribPointer(a_TextCoord, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
    gl.enableVertexAttribArray(a_TextCoord);

    var u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');


    // tworzenie tekstur (i rysowanie elementow sceny): ================================================================
    var floorTexture = gl.createTexture();
    var floorImg = new Image();
    floorImg.src = "crackedYellow.jpg";
    floorImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE0, floorTexture, u_Sampler, 0, floorImg); };

    var cubeTexture = gl.createTexture();
    var cubeImg = new Image();
    cubeImg.src = "differentWalls.jpg";
    cubeImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE1, cubeTexture, u_Sampler, 1, cubeImg); };

    var sphereTexture = gl.createTexture();
    var sphereImg = new Image();
    sphereImg.src = "mosaic.jpg";
    sphereImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE2, sphereTexture, u_Sampler, 2, sphereImg); };


    // animowanie sceny: ===============================================================================================
    var tick = function(){
        // animowanie elementow sceny: ------------------------------------------------------
        animate(gl, u_ViewMatrix, 0.5);

        // rysowanie elementow sceny: ------------------------------------------------------
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // ustawiam wyjsciowa rotacje i rysuje podloze:
        gl.uniform1i(u_Sampler, 0);
        gl.uniformMatrix4fv(tMatrix, false, identity);
        gl.uniformMatrix4fv(rMatrix, false, identity);
        gl.drawArrays(gl.TRIANGLES, 0, floorN);

        // ustawiam rotacje dla szescianu i go rysuje:
        gl.uniform1i(u_Sampler, 1);
        gl.uniformMatrix4fv(rMatrix, false, rotMatrixCube);
        gl.drawArrays(gl.TRIANGLES, floorN, cubeN);

        // ustawiam wyjsciowa rotacje i rysuje sfere:
        gl.uniform1i(u_Sampler, 2);
        gl.uniformMatrix4fv(tMatrix, false, transMatrix);
        gl.uniformMatrix4fv(rMatrix, false, rotMatrixSphere);
        gl.drawArrays(gl.TRIANGLE_FAN, floorN + cubeN, upCape);
        gl.drawArrays(gl.TRIANGLES, floorN + cubeN + upCape, middle);
        gl.drawArrays(gl.TRIANGLE_FAN, floorN + cubeN + upCape + middle, downCape);


        requestAnimationFrame(tick);    // request that the browser calls tick
    };

    tick();
}