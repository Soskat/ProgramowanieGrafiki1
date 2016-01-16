
var VSHADER_SOURCE =
    'attribute vec4 position;\n'+
    'attribute vec4 a_color;\n'+
    'varying vec4 v_color;\n'+
    'uniform mat4 u_ViewMatrix;\n'+
    'uniform mat4 rmatrixY;\n'+
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


var viewMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);  // macierz widoku

var theta = 0.0, phi = 0.0; // katy obrotu macierzy widoku

// Obsluga klawiszy strzalek
function keydown(ev){
    if(ev.keyCode == 38){
        phi += 0.05;
    }
    else if(ev.keyCode == 40){
        phi -= 0.05;
    }
    else if(ev.keyCode == 39){
        theta += 0.05;
    }
    else if(ev.keyCode == 37){
        theta -= 0.05;
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


var rotMatrix = new Float32Array(16);   // macierz rotacji wokol osi Y

// Animowanie rotacji piramidy wokol osi Y
function animate(gl, n, rotMatrix, u_ViewMatrix){
    // aktualizacja perspektywy:
    rotateY(viewMatrix, theta);
    rotateX(viewMatrix, phi);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    theta = 0.0;
    phi = 0.0;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n/2);
    gl.drawArrays(gl.TRIANGLE_FAN, n/2, n/2);
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

    var R = 0.2, G = 0.8, B = 0.2;
    var xAccuracy = 10;
    var yAccuracy = 8;
    var alpha = 2 * Math.PI / xAccuracy;
    var beta = Math.PI / yAccuracy;
    var r = 0.5;

    var pattern = [0.0, r, 0.0, R, G, B];
    for(var ip = 0; ip <= xAccuracy; ip++){
        pattern.push(r * Math.cos(ip * alpha));
        pattern.push(0.3);
        pattern.push(r * Math.sin(ip * alpha));
        pattern.push(R);
        pattern.push(G);
        pattern.push(B);
    }


    var vertices = [0.0, r, 0.0, R, G, B];
    // rysowanie spodu i wierzchu sfery:
    var yindex = 1;
    for(var i = 0; i <= xAccuracy; i++){
        vertices.push(r * Math.cos(i * alpha));
        vertices.push(r * Math.sin(yindex * beta));
        vertices.push(r * Math.sin(i * alpha));
        vertices.push(R);
        vertices.push(G);
        vertices.push(B);
    }

    vertices.push(0.0, -r, 0.0, G, G, G);
    for(var i = 0; i <= xAccuracy; i++){
        vertices.push(r * Math.cos(i * alpha));
        vertices.push(-r * Math.sin(yindex * beta));
        vertices.push(r * Math.sin(i * alpha));
        vertices.push(G);
        vertices.push(G);
        vertices.push(G);
    }


    var coloredVertices = new Float32Array(vertices);
    var n = coloredVertices.length / 6;
    console.log(n);

    var colouredVertexBuffer = gl.createBuffer();       // bufor kolorowanych wierzcholkow
    gl.bindBuffer(gl.ARRAY_BUFFER, colouredVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coloredVertices, gl.STATIC_DRAW);

    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    document.onkeydown = function(ev){ keydown(ev); };                      // uruchamiamy obsluge klawiszy
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);

    var position = gl.getAttribLocation(gl.program, 'position');
    var color = gl.getAttribLocation(gl.program, 'a_color');

    var FSIZE = coloredVertices.BYTES_PER_ELEMENT;     // rozmiar pojedynczego elementu

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(position);

    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(color);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // pamietaj aby zmieniac tez funkcje animacji !
    gl.drawArrays(gl.TRIANGLE_FAN, 0, n/2);
    gl.drawArrays(gl.TRIANGLE_FAN, n/2, n/2);


    var tick = function(){
        animate(gl, n, rotMatrix, u_ViewMatrix);   // uruchamiamy animacje piramidy
        requestAnimationFrame(tick);                // request that the browser calls tick
    };

    tick();
}