/**
 * Created by Louve on 2015-10-21.
 */

/* WebGL Programming guide - ksi¹¿ek do WebGL (aczkolwiek du¿o upraszczania jest) */

var VSHADER_SOURCE =
    'attribute vec3 position;\n' +
    'void main(void){\n' +
    '   gl_Position = vec4(position, 1.0);\n' +
    '   gl_PointSize = 10.0;\n' +
    '}\n';

var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'void main(void){\n' +
    '   gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0);\n' +
    '}\n';


function drawPoints(){
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

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, pixelShader);
    gl.linkProgram(program);

    gl.useProgram(program);
    gl.program = program;



    program.position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(program.position);

    var pointsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    /*
    var vertices = [
        0.0, 0.7, 0.0,
        -0.7, -0.7, 0.0,
        0.7, -0.7, 0.0,
        0.5, 0.3, -0.4,
        0.2, -0.3, 0.2
    ]*/
    var vertices = []
    for(var i = 0; i < 3*5; i++){
        vertices.push(Math.random() * 2 - 1);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pointsBuffer.itemSize = 3;
    pointsBuffer.numItems = 5;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
    gl.vertexAttribPointer(program.position, pointsBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, pointsBuffer.numItems);
}