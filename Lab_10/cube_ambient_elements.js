var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Normal;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform vec3 u_DiffuseLight;\n' +
    'uniform vec3 u_LightDirection;\n' +
    'uniform vec3 u_AmbientLight;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
        // Make the length of the normal 1.0
    '  vec3 normal = normalize(a_Normal.xyz);\n' +
        // The dot product of the light direction and the normal (the orientation of a surface)
    '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
        // Calculate the color due to diffuse reflection
    '  vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL;\n' +
        // Calculate the color due to ambient reflection
    '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
        // Add the surface colors due to diffuse reflection and ambient reflection
    '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' +
    '}\n';

var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

//var viewMatrix = new Float32Array(16);

function setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    var fx, fy, fz, rlf, sx, sy, sz, rls, ux, uy, uz;

    var viewMatrix = new Float32Array(16);

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


    viewMatrix[12] += viewMatrix[0] * -eyeX + viewMatrix[4] * -eyeY + viewMatrix[8]  * -eyeZ;
    viewMatrix[13] += viewMatrix[1] * -eyeX + viewMatrix[5] * -eyeY + viewMatrix[9]  * -eyeZ;
    viewMatrix[14] += viewMatrix[2] * -eyeX + viewMatrix[6] * -eyeY + viewMatrix[10] * -eyeZ;
    viewMatrix[15] += viewMatrix[3] * -eyeX + viewMatrix[7] * -eyeY + viewMatrix[11] * -eyeZ;

    return viewMatrix;
}


function setPerspective(fovy, aspect, near, far) {
    var  rd, s, ct;

    var viewMatrix = new Float32Array(16);

    if (near === far || aspect === 0) {
        throw 'null frustum';
    }
    if (near <= 0) {
        throw 'near <= 0';
    }
    if (far <= 0) {
        throw 'far <= 0';
    }

    fovy = Math.PI * fovy / 180 / 2;
    s = Math.sin(fovy);
    if (s === 0) {
        throw 'null frustum';
    }

    rd = 1 / (far - near);
    ct = Math.cos(fovy) / s;


    viewMatrix[0]  = ct / aspect;
    viewMatrix[1]  = 0;
    viewMatrix[2]  = 0;
    viewMatrix[3]  = 0;

    viewMatrix[4]  = 0;
    viewMatrix[5]  = ct;
    viewMatrix[6]  = 0;
    viewMatrix[7]  = 0;

    viewMatrix[8]  = 0;
    viewMatrix[9]  = 0;
    viewMatrix[10] = -(far + near) * rd;
    viewMatrix[11] = -1;

    viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = -2 * near * far * rd;
    viewMatrix[15] = 0;

    return viewMatrix;
};



function normalize(vector) {
    var v = vector
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
    return v;
};

function concat(a,b) {
    var i, e, ai0, ai1, ai2, ai3;

    e= a;

    for (i = 0; i < 4; i++) {
        ai0 = a[i];
        ai1 = a[i + 4];
        ai2 = a[i + 8];
        ai3 = a[i + 12];
        e[i] = ai0 * b[0] + ai1 * b[1] + ai2 * b[2] + ai3 * b[3];
        e[i + 4] = ai0 * b[4] + ai1 * b[5] + ai2 * b[6] + ai3 * b[7];
        e[i + 8] = ai0 * b[8] + ai1 * b[9] + ai2 * b[10] + ai3 * b[11];
        e[i + 12] = ai0 * b[12] + ai1 * b[13] + ai2 * b[14] + ai3 * b[15];
    }
    return e;
};

function drawTriangle() {
    var canvas = document.getElementById('example');

    var gl = canvas.getContext("webgl"); //

    if (!gl) {
        console.log('WebGL nie dziala');
        return;
    }

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

    // Create a cube
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    // Coordinates
    var vertices = new Float32Array([
        1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
        1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
        1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
        -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
        1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
    ]);

    // Colors
    var colors = new Float32Array([
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0　    // v4-v7-v6-v5 back
    ]);

    // Normal
    var normals = new Float32Array([
        0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
    ]);

    // Indices of the vertices
    var indices = new Uint8Array([
        0, 1, 2,   0, 2, 3,    // front
        4, 5, 6,   4, 6, 7,    // right
        8, 9,10,   8,10,11,    // up
        12,13,14,  12,14,15,    // left
        16,17,18,  16,18,19,    // down
        20,21,22,  20,22,23     // back
    ]);

    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position= gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);


    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var a_Color= gl.getAttribLocation(gl.program, 'a_Color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);


    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

    var a_Normal= gl.getAttribLocation(gl.program, 'a_Normal');
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    //gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    var n = indices.length;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage locations of uniform variables and so on
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight');
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');

    // Set the light color (white)
    gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
    //
    // Set the light direction (in the world coordinate)
    var lightDirection = normalize(new Float32Array([0.5, 3.0, 4.0]));
    //var lightDirection = new Float32Array([0.25, 0.20, 0.2]);
    gl.uniform3fv(u_LightDirection, lightDirection);
    // Set the ambient light
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    // Calculate the view projection matrix
    var a =setPerspective(30, canvas.width/canvas.height, 1, 100);
    var b =setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
    var viewMatrix=concat(setPerspective(30, canvas.width/canvas.height, 1, 100),setLookAt(3, 3, 7, 0, 0, 0, 0, 1, 0));
    var mat = new Float32Array([
        3.4302961826324463,-0.5388137102127075,-0.3739125430583954,-0.3665083348751068,
        0,3.472355365753174,-0.3739125430583954,-0.3665083348751068,
        -1.4701268672943115,-1.2572320699691772,-0.8724626302719116,-0.8551861047744751,0.0004,
        0.0005, 6.330511093139648,8.185352325439453]);
    // Pass the model view projection matrix to the variable u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, viewMatrix);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}