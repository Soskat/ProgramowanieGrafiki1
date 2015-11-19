/**
 * Created by nocah on 19.11.2015.
 */

var VSHADER_SOURCE =
    'attribute vec3 position;\n' +
    'uniform mat4 smatrix;\n' +
    'void main(void){\n' +
    '   gl_Position = vec4(position, 1.0) * smatrix;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'void main(void){\n' +
    '   gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0);\n' +
    '}\n';


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


    // tworze wspolczynnik skali i macierz skalowania
    var scale = 3.4;
    var scaleMatrix = new Float32Array([
        scale, 0.0, 0.0, 0.0,
        0.0, scale, 0.0, 0.0,
        0.0, 0.0, scale, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
    var sMatrix = gl.getUniformLocation(gl.program, 'smatrix');
    gl.uniformMatrix4fv(sMatrix, false, scaleMatrix);


    var pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);

    var vertices = [
        0, 0.2,
        0.2, -0.2,
        -0.2, -0.2,
        0, 0.2
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.vertexAttribPointer(program.position, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}