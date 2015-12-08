/**
 * Created by nocah on 02.12.2015.
 */

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec2 aTexCoord;\n'+
    'varying vec2 vTexCoord;\n'+
    'void main() {\n' +
    '   gl_Position = position;\n' +
    '   vTexCoord = aTexCoord;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform sampler2D uSampler;\n' +
    'varying vec2 vTexCoord;\n'+
    'void main(){\n' +
    '   gl_FragColor = texture2D(uSampler, vTexCoord);\n' + //tekstura
    '}\n';

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


    var n = 4;
    var vertices = new Float32Array     // macierz wspolrzednych punktow i tekstur
    (
        [   // wspol.:   //wsp. tex.:
             0.5,  0.5,    0.0, 0.5,
            -0.5,  0.5,    0.0, 0.0,
             0.5, -0.5,    0.5, 0.5,
            -0.5, -0.5,    0.5, 0.0
        ]
    );

    var textureBuffer = gl.createBuffer();          // bufor tekstury
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_position = gl.getAttribLocation(gl.program, 'position');
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_position);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'aTexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);


    // tworzymy teksture:
    var texture = gl.createTexture();
    var u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');
    var img = new Image();
    img.src = "http://localhost:63342/ProgramowanieGrafiki1/Lab_07/lava.jpg";
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
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    };
}