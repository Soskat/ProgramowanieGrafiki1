/**
 * Created by nocah on 16.12.2015.
 */


var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec4 a_color;\n'+
    'varying vec4 v_color;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'void main() {\n' +
    '   gl_Position = u_ViewMatrix * position;\n' +
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


    // macierz wspolrzednych punktow oraz kolorow wierzcholkow podloza
    var floorVertices = new Float32Array
    (
        [  // wspolrz.:   // RGB:
            -0.6, -0.6, -0.6,  0.5, 0.5, 0.5,
            -0.6, -0.6,  0.6,  0.5, 0.5, 0.5,
             0.6, -0.6,  0.6,  0.5, 0.5, 0.5,
             0.6, -0.6, -0.6,  0.5, 0.5, 0.5
        ]
    );
    var floorN = floorVertices.length / 6;

    // macierz wspolrzednych punktow oraz kolorow wierzcholkow piramidy
    var piramidVertices = new Float32Array
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
    var piramidN = piramidVertices.length / 6;


    // rysowanie podloza:
    var floorVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    setLookAt(0.20, -0.25, 0.25, 0, 0, 0, 0, 1, 0);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var position = gl.getAttribLocation(gl.program, 'position');
    var color = gl.getAttribLocation(gl.program, 'a_color');

    var FSIZE = piramidVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);



    gl.drawArrays(gl.TRIANGLE_STRIP, 0, floorN);


    // rysowanie piramidy:
    var piramidVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, piramidVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, piramidVertices, gl.STATIC_DRAW);

    gl.drawArrays(gl.TRIANGLES, 0, piramidN);
}