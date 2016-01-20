/**
 * Created by kprzystalski on 04/10/15.
 */

var VSHADER_SOURCE =
    'attribute vec4 position;\n' +
    'attribute vec4 a_color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform vec3 u_DiffuseLight;\n' +
    'uniform vec3 u_LightDirection;\n' +
    'uniform vec3 u_AmbientLight;\n' +
    'varying vec4 v_color;\n' +
    'void main() {\n' +
    '  vec3 normal = normalize(a_Normal.xyz);\n' +
    '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
    '  vec3 diffuse = u_DiffuseLight * a_color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * a_color.rgb;\n' +
    '  gl_Position =  u_ViewMatrix * position;\n' +
    '  v_color = vec4(diffuse + ambient, a_color.a);\n' +
        //'  v_color=a_color;\n'+
    '}\n';


var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_color;\n' +
    '}\n';

var Vector3 = function (opt_src) {
    var v = new Float32Array(3);
    if (opt_src && typeof opt_src === 'object') {
        v[0] = opt_src[0];
        v[1] = opt_src[1];
        v[2] = opt_src[2];
    }
    this.elements = v;
}

Vector3.prototype.normalize = function () {
    var v = this.elements;
    var c = v[0], d = v[1], e = v[2], g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
        if (g == 1)
            return this;
    } else {
        v[0] = 0;
        v[1] = 0;
        v[2] = 0;
        return this;
    }
    g = 1 / g;
    v[0] = c * g;
    v[1] = d * g;
    v[2] = e * g;
    return this;
};


var viewMatrix = new Float32Array(16);
var veyeX = 1.0;
var veyeY = 0.25;
var veyeZ = 0.25;
var signX = true;
var signZ = false;

function setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    var e, fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    fx = centerX - eyeX;
    fy = centerY - eyeY;
    fz = centerZ - eyeZ;

    rlf = 1 / Math.sqrt(fx * fx + fy * fy + fz * fz);
    fx *= rlf;
    fy *= rlf;
    fz *= rlf;

    sx = fy * upZ - fz * upY;
    sy = fz * upX - fx * upZ;
    sz = fx * upY - fy * upX;


    rls = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
    sx *= rls;
    sy *= rls;
    sz *= rls;

    ux = sy * fz - sz * fy;
    uy = sz * fx - sx * fz;
    uz = sx * fy - sy * fx;


    viewMatrix[0] = sx;
    viewMatrix[1] = ux;
    viewMatrix[2] = -fx;
    viewMatrix[3] = 0;

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

function drawTriangle() {
    var canvas = document.getElementById('example');

    var gl = canvas.getContext("webgl"); //

    if (!gl) {
        console.log('WebGL nie dziala');
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);


    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    var pixelShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(pixelShader, FSHADER_SOURCE);
    gl.compileShader(pixelShader);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);

    console.log(gl.getShaderInfoLog(pixelShader));

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, pixelShader);
    gl.linkProgram(program);

    gl.useProgram(program);
    gl.program = program;

    var n = 24;
    var colouredVertices = new Float32Array([
        0.2, 0.2, -0.2, 1.0, 0.0, 0.0, 1.0, // tył, czerwony
        0.2, -0.2, -0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, 0.2, -0.2, 1.0, 0.0, 0.0, 1.0,

        0.2, -0.2, -0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, -0.2, -0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, 0.2, -0.2, 1.0, 0.0, 0.0, 1.0,

        0.2, -0.2, -0.2, 1.0, 0.0, 0.0, 1.0, // prawy, zielony
        0.2, 0.2, -0.2, 1.0, 0.0, 0.0, 1.0,
        0.2, 0.2, 0.2, 1.0, 0.0, 0.0, 1.0,

        0.2, 0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        0.2, -0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        0.2, -0.2, -0.2, 1.0, 0.0, 0.0, 1.0,

        0.2, 0.2, 0.2, 1.0, 0.0, 0.0, 1.0, // przód, niebieski
        0.2, -0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, 0.2, 0.2, 1.0, 0.0, 0.0, 1.0,

        0.2, -0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, -0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, 0.2, 0.2, 1.0, 0.0, 0.0, 1.0,

        -0.2, 0.2, 0.2, 1.0, 0.0, 0.0, 1.0, // lewy, żółty
        -0.2, -0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, 0.2, -0.2, 1.0, 0.0, 0.0, 1.0,

        -0.2, 0.2, -0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, -0.2, 0.2, 1.0, 0.0, 0.0, 1.0,
        -0.2, -0.2, -0.2, 1.0, 0.0, 0.0, 1.0
    ]);

    var normals = new Float32Array([
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, //tył
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, //tył
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //prawa
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, //prawa
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, //front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //lewy
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, //lewy
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0
    ]);


    var colouredVertexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colouredVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colouredVertices, gl.STATIC_DRAW);

    var position = gl.getAttribLocation(gl.program, 'position');
    var color = gl.getAttribLocation(gl.program, 'a_color');

    var FSIZE = colouredVertices.BYTES_PER_ELEMENT;

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 7, 0);
    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(color, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
    gl.enableVertexAttribArray(color);


    var normalsBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    var normal = gl.getAttribLocation(gl.program, 'a_Normal');

    gl.vertexAttribPointer(normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normal);


    var u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);

    var lightDirection = new Vector3([1.0, 3.0, 4.0]);
    lightDirection.normalize();

    gl.uniform3fv(u_LightDirection, lightDirection.elements);

    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    setLookAt(veyeX, veyeY, veyeZ, 0, 0, 0, 0, 1, 0);

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, n);

}