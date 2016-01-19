/**
 * Created by Louve on 19.12.2015.
 */


var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec2 aTexCoord;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'varying vec2 vTexCoord;\n'+
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * position;\n' +
    '   vTexCoord = aTexCoord;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D uSampler;\n' +
    'varying vec2 vTexCoord;\n'+
    'void main(){\n' +
    '   gl_FragColor = texture2D(uSampler, vTexCoord);\n' + //tekstura
    '}\n';


// ---------------------------------------------------------------------------------------------------------------------
// == Funkcje pomocnicze ===============================================================================================
// ---------------------------------------------------------------------------------------------------------------------

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


// Animowanie elementow sceny
function animate(gl, u_ViewMatrix, n){
    // aktualizacja perspektywy:
    rotateY(viewMatrix, theta);
    rotateX(viewMatrix, phi);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    theta = 0.0;
    phi = 0.0;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);
}


// ---------------------------------------------------------------------------------------------------------------------
// == Program glowny ===================================================================================================
// ---------------------------------------------------------------------------------------------------------------------

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

    console.log(vertexShader);

    gl.useProgram(program);
    gl.program = program;


    var vertices = new Float32Array     // macierz wspolrzednych punktow i tekstur
    (
        [   // wspol.:      //wsp. tex.:
            -0.3, -0.3,  0.3,    0.5,  0.5,
             0.3, -0.3,  0.3,    1.0,  0.5,
            -0.3, -0.3, -0.3,    0.5,  0.75,
            -0.3, -0.3, -0.3,    0.5,  0.75,
             0.3, -0.3,  0.3,    1.0,  0.5,
             0.3, -0.3, -0.3,    1.0,  0.75,

            -0.3, -0.3, -0.3,    0.5,  0.0,
             0.3, -0.3, -0.3,    1.0,  0.0,
            -0.3,  0.3, -0.3,    0.5,  0.25,
            -0.3,  0.3, -0.3,    0.5,  0.25,
             0.3, -0.3, -0.3,    1.0,  0.0,
             0.3,  0.3, -0.3,    1.0,  0.25,

            -0.3, -0.3,  0.3,    0.0,  0.5,
            -0.3, -0.3, -0.3,    0.0,  0.25,
            -0.3,  0.3,  0.3,    0.5,  0.5,
            -0.3,  0.3,  0.3,    0.5,  0.5,
            -0.3, -0.3, -0.3,    0.0,  0.25,
            -0.3,  0.3, -0.3,    0.5,  0.25,

            -0.3, -0.3,  0.3,    0.0,  0.25,
             0.3, -0.3,  0.3,    0.5,  0.25,
            -0.3,  0.3,  0.3,    0.0,  0.0,
            -0.3,  0.3,  0.3,    0.0,  0.0,
             0.3, -0.3,  0.3,    0.5,  0.25,
             0.3,  0.3,  0.3,    0.5,  0.0,

             0.3, -0.3,  0.3,    1.0,  0.5,
             0.3,  0.3,  0.3,    0.5,  0.5,
             0.3, -0.3, -0.3,    1.0,  0.25,
             0.3, -0.3, -0.3,    1.0,  0.25,
             0.3,  0.3,  0.3,    0.5,  0.5,
             0.3,  0.3, -0.3,    0.5,  0.25,

             0.3,  0.3,  0.3,    0.5,  0.75,
             0.3,  0.3, -0.3,    0.5,  0.5,
            -0.3,  0.3,  0.3,    0.0,  0.75,
            -0.3,  0.3,  0.3,    0.0,  0.75,
             0.3,  0.3, -0.3,    0.5,  0.5,
            -0.3,  0.3, -0.3,    0.0,  0.5
        ]
    );
    var n = vertices.length / 5;

    var textureBuffer = gl.createBuffer();          // bufor tekstury
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // wyciaganie danych z shadera: ====================================================================================
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');   // macierz perspektywy
    document.onkeydown = function(ev){ keydown(ev); };                      // uruchamiamy obsluge klawiszy
    setLookAt(g_eyeX, g_eyeY, g_eyeZ, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var a_position = gl.getAttribLocation(gl.program, 'position');
    gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, FSIZE * 5, 0);
    gl.enableVertexAttribArray(a_position);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'aTexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
    gl.enableVertexAttribArray(a_TexCoord);


    // tworzymy teksture:
    var texture = gl.createTexture();
    var u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');
    var img = new Image();
    img.src = "http://localhost:63342/ProgramowanieGrafiki1/Zaliczeniowy/differentWalls.jpg";
    img.onload = function(){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl. RGB, gl.UNSIGNED_BYTE, img);
        gl.uniform1i(u_Sampler, 0);

        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, n);
    };



    // animowanie sceny: ===============================================================================================
    var tick = function(){
        animate(gl, u_ViewMatrix, n);  // uruchamia animacje elementow sceny
        requestAnimationFrame(tick);                                                                // request that the browser calls tick
    };

    tick();
}