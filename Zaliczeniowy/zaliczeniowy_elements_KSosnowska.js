/**
 * Created by Louve on 24.01.2016.
 */

// ---------------------------------------------------------------------------------------------------------------------
// == Programy shaderow ================================================================================================
// ---------------------------------------------------------------------------------------------------------------------

var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'attribute vec3 a_Normal;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 rmatrix;\n' +
    'uniform mat4 tmatrix;\n' +
    'varying vec2 vTexCoord;\n' +
    'varying vec3 vNormal;\n' +
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * tmatrix * rmatrix * a_Position;\n' +
    '   vTexCoord = a_TexCoord;\n' +
    '   vNormal = vec3(tmatrix * rmatrix * vec4(normalize(a_Normal), 0.0));\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D uSampler;\n' +
    'varying vec2 vTexCoord;\n' +
    'varying vec3 vNormal;\n' +
        // parametry zrodla swiatla:
    'const vec3 source_ambient_color  = vec3(0.5, 0.5, 0.5);\n' +
    'const vec3 source_diffuse_color  = vec3(1.5, 1.5, 1.5);\n' +
    'const vec3 source_direction      = vec3(0.58, 0.58, -0.58);\n' +
        // parametry materialu:
    'const vec3 mat_ambient_color  = vec3(1.0, 1.0, 1.0);\n' +
    'const vec3 mat_diffuse_color  = vec3(1.0, 1.0, 1.0);\n' +
    'const float mat_shininess     = 10.0;\n' +
    'void main(){\n' +
    '   vec3 color = vec3(texture2D(uSampler, vTexCoord));\n' +
        // obliczamy elementy oswietlenia:
    '   vec3 I_ambient = source_ambient_color * mat_ambient_color;\n' +
    '   vec3 I_diffuse = source_diffuse_color * mat_diffuse_color * max(0.0, dot(vNormal, source_direction));\n' +
    '   vec3 I = I_ambient + I_diffuse;\n' +
    '   gl_FragColor = vec4(I * color, 1.0);\n' +
    '}\n';



// ---------------------------------------------------------------------------------------------------------------------
// == Funkcje pomocnicze ===============================================================================================
// ---------------------------------------------------------------------------------------------------------------------

var theta = 0.0, phi = 0.0;             // katy obrotu macierzy widoku
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


// Obraca podana macierz o wskazany kat w osi X lub Y
function rotateView(m, angle, axis){
    var c = Math.cos(angle);
    var s = Math.sin(angle);

    if(axis == 'X'){
        var mv1 = m[1], mv5 = m[5], mv9 = m[9];

        m[1] = m[1] * c - m[2] * s;
        m[5] = m[5] * c - m[6] * s;
        m[9] = m[9] * c - m[10] * s;

        m[2] = m[2] * c + mv1 * s;
        m[6] = m[6] * c + mv5 * s;
        m[10] = m[10] * c + mv9 * s;
    }
    else if (axis == 'Y'){
        var mv0 = m[0], mv4 = m[4], mv8 = m[8];

        m[0] = c * m[0] + s * m[2];
        m[4] = c * m[4] + s * m[6];
        m[8] = c * m[8] + s * m[10];

        m[2] = c * m[2] - s * mv0;
        m[6] = c * m[6] - s * mv4;
        m[10] = c * m[10] - s * mv8;
    }
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
    rotateView(viewMatrix, theta, 'Y');
    rotateView(viewMatrix, phi, 'X');
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    theta = 0.0;
    phi = 0.0;

    setNewSphereTranslationMatrix(-currentAngle, r);            // przesuniecie sfery
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
    gl.uniform1i(u_Sampler, index);
}


// Rysuje model sfery:
function drawSphere(bigR, SPHERE_DIV, vertices, normals, uvCoords, indices){
    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;
    var x, y, z;
    var u, v;
    var index = vertices.length / 3;

    // tworzenie wierzcholkow punktow, wektorow normalych i tekstur
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            x = si * sj;
            y = cj;
            z = ci * sj;
            u = 1 - (i / SPHERE_DIV);
            v = 1 - (j / SPHERE_DIV);

            vertices.push(bigR * x, bigR * y, bigR * z);
            normals.push(x, y, z);
            uvCoords.push(u, v);
        }
    }

    // tworzenie indeksow
    for (j = 0; j < SPHERE_DIV + 2; j++) {
        for (i = 0; i < SPHERE_DIV + 6; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            if(p1 >= index){
                indices.push(p1);
                indices.push(p2);
                indices.push(p1 + 1);

                indices.push(p1 + 1);
                indices.push(p2);
                indices.push(p2 + 1);
            }
        }
    }
}


// ---------------------------------------------------------------------------------------------------------------------
// == Program glowny ===================================================================================================
// ---------------------------------------------------------------------------------------------------------------------

// Funkcja glowna; rysuje rzeczy w Canvasie:
function drawStuff() {
    var canvas = document.getElementById('MyFirstCanvas');
    var gl = canvas.getContext("webgl");
    console.log(gl);
    if (!gl) {
        console.log('Huston, webGl ma problem');
        return;
    }

    gl.viewportwidth = canvas.width;
    gl.viewportheight = canvas.height;

    // ladowanie shaderow do programu: =================================================================================
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


    // tworzenie listy punktow: ========================================================================================
    // podloze: ------------------------------------------------
    var vertices = [
        -0.5,-0.5,-0.5,  -0.5,-0.5,0.5,  0.5,-0.5,-0.5,  0.5,-0.5,0.5
    ];
    var normals = [
        0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0,  0.0,1.0,0.0
    ];
    var uvCoords = [
        0.0,0.0,  0.0,1.0,  1.0,0.0,  1.0,1.0
    ];
    var indices = [
        0, 1, 2,  2, 3, 1
    ];
    var floorN = indices.length;

    // szescian: -----------------------------------------------
    vertices.push(
        -0.1,-0.1, 0.1,   0.1,-0.1, 0.1,  -0.1,-0.1,-0.1,   0.1,-0.1,-0.1, // down
        -0.1,-0.1,-0.1,   0.1,-0.1,-0.1,  -0.1, 0.1,-0.1,   0.1, 0.1,-0.1, // back
        -0.1,-0.1, 0.1,  -0.1,-0.1,-0.1,  -0.1, 0.1, 0.1,  -0.1, 0.1,-0.1, // left
        -0.1,-0.1, 0.1,   0.1,-0.1, 0.1,  -0.1, 0.1, 0.1,   0.1, 0.1, 0.1, // front
         0.1,-0.1, 0.1,   0.1, 0.1, 0.1,   0.1,-0.1,-0.1,   0.1, 0.1,-0.1, // right
         0.1, 0.1, 0.1,   0.1, 0.1,-0.1,  -0.1, 0.1, 0.1,  -0.1, 0.1,-0.1  // up
    );
    normals.push(
         0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0, // down
         0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0, // back
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, // left
         0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, // front
         1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0, // right
         0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0  // up
    );
    uvCoords.push(
        0.5,  0.5,   1.0,  0.5,   0.5,  0.75,   1.0,  0.75, // down
        0.5,  0.0,   1.0,  0.0,   0.5,  0.25,   1.0,  0.25, // back
        0.0,  0.5,   0.0,  0.25,  0.5,  0.5,    0.5,  0.25, // left
        0.0,  0.25,  0.5,  0.25,  0.0,  0.0,    0.5,  0.0,  // front
        1.0,  0.5,   0.5,  0.5,   1.0,  0.25,   0.5,  0.25, // right
        0.5,  0.75,  0.5,  0.5,   0.0,  0.75,   0.0,  0.5   // up
    );
    indices.push(
        4,  5,  6,   5,  7,  6,  // down
        8, 10,  9,   9, 10, 11,  // back
        12, 14, 13,  13, 14, 15, // left
        16, 18, 17,  17, 18, 19, // front
        20, 21, 22,  21, 23, 22, // right
        24, 25, 26,  25, 26, 27  // up
    );
    var cubeN = indices.length - floorN;

    // sfera: --------------------------------------------------
    var bigR = 0.2;         // promien sfery
    var accuracy = 10;      // dokladnosc modelu sfery
    drawSphere(bigR, accuracy, vertices, normals, uvCoords, indices);
    var sphereN = indices.length - (floorN + cubeN);


    // tworzenie buforow: ==============================================================================================
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');    // pozycja w przestrzeni
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);


    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');        // wektor normalny
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);


    var uvCoordsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvCoordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvCoords), gl.STATIC_DRAW);
    var a_TextCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');   // wspolrzedne tekstur
    gl.vertexAttribPointer(a_TextCoord, 2, gl.FLOAT, false, 0, 0);


    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Normal);
    gl.enableVertexAttribArray(a_TextCoord);


    // edytowanie pozostalych danych z shadera: ========================================================================
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');    // macierz widoku
    var tMatrix      = gl.getUniformLocation(gl.program, 'tmatrix');         // macierz translacji
    var rMatrix      = gl.getUniformLocation(gl.program, 'rmatrix');         // macierz rotacji
    var u_Sampler    = gl.getUniformLocation(gl.program, 'uSampler');        // sampler tekstury

    document.onkeydown = function(ev){ keydown(ev); };  // uruchamiamy obsluge klawiszy
    setLookAt(0.20, -0.10, 0.30, 0, 0, 0, 0, 1, 0);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    gl.uniformMatrix4fv(rMatrix, false, identity);
    gl.uniformMatrix4fv(tMatrix, false, identity);


    // tworzenie tekstur: ==============================================================================================
    var floorTexture = gl.createTexture();
    var floorImg = new Image();
    floorImg.src = "http://localhost:63342/ProgramowanieGrafiki1/Zaliczeniowy/pz_crackedYellow.jpg";
    floorImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE0, floorTexture, u_Sampler, 0, floorImg); };

    var cubeTexture = gl.createTexture();
    var cubeImg = new Image();
    cubeImg.src = "http://localhost:63342/ProgramowanieGrafiki1/Zaliczeniowy/pz_differentWalls.jpg";
    cubeImg.onload = function(){ loadTextureSettings(gl, gl.TEXTURE1, cubeTexture, u_Sampler, 1, cubeImg); };

    var sphereTexture = gl.createTexture();
    var sphereImg = new Image();
    sphereImg.src = "http://localhost:63342/ProgramowanieGrafiki1/Zaliczeniowy/pz_mosaic.jpg";
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
        gl.drawElements(gl.TRIANGLES, floorN, gl.UNSIGNED_BYTE, 0);

        // ustawiam rotacje dla szescianu i go rysuje:
        gl.uniform1i(u_Sampler, 1);
        gl.uniformMatrix4fv(rMatrix, false, rotMatrixCube);
        gl.drawElements(gl.TRIANGLES, cubeN, gl.UNSIGNED_BYTE, floorN);

        // ustawiam wyjsciowa rotacje i rysuje sfere:
        gl.uniform1i(u_Sampler, 2);
        gl.uniformMatrix4fv(tMatrix, false, transMatrix);
        gl.uniformMatrix4fv(rMatrix, false, rotMatrixSphere);
        gl.drawElements(gl.TRIANGLES, sphereN, gl.UNSIGNED_BYTE, floorN + cubeN);


        requestAnimationFrame(tick);    // request that the browser calls tick
    };

    tick();
}