/**
 * Created by nocah on 02.12.2015.
 */

var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute float pointSize;\n'+
    'void main() {\n' +
    'gl_Position = position;\n' +
    'gl_PointSize = pointSize;}\n'; +
    '}\n';
var FSHADER_SOURCE =
    'void main(){\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + //kolor punktu
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


    var n = 3;
    var vertices = new Float32Array
    (
        [
            0.0, 0.5, -0.5, -0.5, 0.5, -0.5
        ]);


    var size = new Float32Array
    (
        [
            10.0, 20.0, 30.0
        ]);

    var vertexBuffer = gl.createBuffer();
    var sizeBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var position = gl.getAttribLocation(gl.program, 'position');


    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position);


    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl.STATIC_DRAW);
    var pointSize = gl.getAttribLocation(gl.program, 'pointSize');
    gl.vertexAttribPointer(pointSize, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pointSize);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, n);



}

