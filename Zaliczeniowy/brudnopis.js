
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
function animate(gl, n, rotMatrix, u_ViewMatrix, upCape, middle, downCape){
    // aktualizacja perspektywy:
    rotateY(viewMatrix, theta);
    rotateX(viewMatrix, phi);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix);
    theta = 0.0;
    phi = 0.0;

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, upCape);
    gl.drawArrays(gl.TRIANGLES, upCape, middle);
    gl.drawArrays(gl.TRIANGLE_FAN, upCape + middle, downCape);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
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


    var vertices = [];   // robocza tablica wierzcholkow

    var R = 0.2, G = 0.8, B = 0.2;              // kolory testowe
    var upCape = 0, middle = 0, downCape = 0;   // liczniki wierzcholkow spodow i ciala sfery

    // stale:
    var bigR = 0.7;                         // promien sfery
    var accuracy = 10;                      // dokladnosc modelu sfery
    var alpha = 2 * Math.PI / accuracy;     // kat na plaszczyznie X-Z
    var beta = Math.PI / accuracy;          // kat na plaszczyznie X-Y

    // zmienne:
    var i = 1, j;                                   // indeksy
    var r1, r2;                                     // promienie dwoch wycinkow sfery
    var y1, y2;                                     // wspolrzedne Y dwoch poziomow punktow
    var p1x, p1z,  p2x, p2z,  p3x, p3z,  p4x, p4z;  // wspolrzedne X i Z czterech punktow pomocniczych:


    r1 = bigR * Math.sin(i * beta);     // aktualizujemy dlugosc r
    y1 = bigR * Math.cos(i * beta);     // aktualizujemy dlugosc y1

    // rysujemy wierzch sfery:
    vertices.push(0.0, bigR, 0.0, R, G, B);
    upCape++;
    for(j = 0; j <= accuracy; j++){
        vertices.push(r1 * Math.cos(j * alpha));
        vertices.push(y1);
        vertices.push(r1 * Math.sin(j * alpha));
        vertices.push(R, G, B);
        upCape++;
    }

    for(i; i <= accuracy; i++){
        // aktualizujemy dlugosc r1, r2, y1 i y2:
        r1 = bigR * Math.sin(i * beta);
        r2 = bigR * Math.sin((i + 1) * beta);
        y1 = bigR * Math.cos(i * beta);
        y2 = bigR * Math.cos((i + 1) * beta);

        for(j = 0; j <= accuracy; j++){
            // poziom I punktow:
            p1x = r1 * Math.cos(j * alpha);
            p1z = r1 * Math.sin(j * alpha);
            p2x = r1 * Math.cos((j + 1) * alpha);
            p2z = r1 * Math.sin((j + 1) * alpha);
            // poziom II punktow:
            p3x = r2 * Math.cos(j * alpha);
            p3z = r2 * Math.sin(j * alpha);
            p4x = r2 * Math.cos((j + 1) * alpha);
            p4z = r2 * Math.sin((j + 1) * alpha);

            // wsadzamy punktu do tablicy:
            vertices.push(p1x, y1, p1z, R, G, B);
            vertices.push(p2x, y1, p2z, R, G, B);
            vertices.push(p4x, y2, p4z, R, G, B);
            vertices.push(p4x, y2, p4z, R, G, B);
            vertices.push(p3x, y2, p3z, R, G, B);
            vertices.push(p1x, y1, p1z, R, G, B);

            middle += 6;
        }
    }

    // rysujemy spod sfery:
    vertices.push(0.0, -bigR, 0.0, R, G, B);
    downCape++;
    for(j = 0; j <= accuracy; j++){
        vertices.push(r1 * Math.cos(j * alpha));
        vertices.push(-y1);
        vertices.push(r1 * Math.sin(j * alpha));
        vertices.push(R, G, B);
        downCape++;
    }






    var coloredVertices = new Float32Array(vertices);
    var n = coloredVertices.length / 6;
    console.log('n =', n, ', middle =', middle);

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
    gl.drawArrays(gl.TRIANGLE_FAN, 0, upCape);
    gl.drawArrays(gl.TRIANGLES, upCape, middle);
    gl.drawArrays(gl.TRIANGLE_FAN, upCape + middle, downCape);


    var tick = function(){
        animate(gl, n, rotMatrix, u_ViewMatrix, upCape, middle, downCape);   // uruchamiamy animacje piramidy
        requestAnimationFrame(tick);                // request that the browser calls tick
    };

    tick();
}