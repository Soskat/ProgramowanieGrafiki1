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
    'uniform sample2D uSampler;\n' +
    'varying vec2 vTexCoord;\n'+
    'void main(){\n' +
    '   gl_FragColor = texture2D(uSampler, vTexCoord);\n' + //kolor punktu
    '}\n';

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





    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    var vertices = new Float32Array
    (
        [
            0.5, 0.5, 0.0, 0.5,
            -0.5, 0.5, 0.0, 0.0,
            0.5, -0.5, 0.5, 0.5,
            -0.5, -0.5, 0.5, 0.0
        ]
    );
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;
    var n = 4;

    var vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'position');
    gl.vertexAttribPointer(a_Position, 2, gl.float, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'aTexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.float, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    program.position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(program.position);


    var texture = gl.createTexture();

    var u_Sampler = gl.getUniformLocation(gl.program, 'uSampler');
    var img = new Image();
    img.src = "http://localhost:63342/stones.png";
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

