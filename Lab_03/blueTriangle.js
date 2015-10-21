/**
 * Created by Louve on 2015-10-21.
 */

var VSHADER_SOURCE = 'attribute vec3 position; void main(){ gl_Position = vec4(position, 1.0); }\n';

var FSHADER_SOURCE = 'precision mediump float; void main(void){ gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0); }';


function drawTriangle(){
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

    var triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    var vertices = [
        0.0, 0.7, 0.0,
        -0.7, -0.7, 0.0,
        0.7, -0.7, 0.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleBuffer.itemSize = 3;
    triangleBuffer.numItems = 3;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.vertexAttribPointer(program.position, triangleBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, triangleBuffer.numItems);
}