/**
 * Created by Louve on 09.10.2015.
 */

// funkcja rysujaca slonia (a przynajmniej cos na jego obraz)
function drawElephant(){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas

    // rysowanie poszczegolnych elementow naszego slonia:
    drawBody(ctx);
    drawHead(ctx);
    drawEyes(ctx);
    drawTusks(ctx);
}

// Funkcja rysujaca cialo slonia
function drawBody(ctx){
    // kolory
    var shadow = "#738085";
    var noshadow = "#8F9596";

    // tulow cz. I (zacieniona czesc)
    ctx.fillStyle = shadow;
    // brzuch :
    ctx.beginPath();
    ctx.moveTo(130,220);
    ctx.lineTo(270,220);
    ctx.lineTo(230,300);
    ctx.lineTo(170,300);
    ctx.lineTo(130,220);
    ctx.arc(200,285,30,90,270);
    ctx.closePath();
    ctx.fill();
    // tylne nogi :
    ctx.fillRect(165,289,20,50);
    ctx.fillRect(215,289,20,50);

    // tulow cz. II (jasna czesc)
    ctx.fillStyle = noshadow;
    // piers :
    ctx.beginPath();
    ctx.arc(200,210,70,0,360);
    ctx.closePath();
    ctx.fill();
    // prawa przednia noga :
    ctx.beginPath();
    ctx.moveTo(130,220);
    ctx.lineTo(165,220);
    ctx.lineTo(155,340);
    ctx.lineTo(125,340);
    ctx.lineTo(130,220);
    ctx.closePath();
    ctx.fill();
    // lewa przednia noga :
    ctx.beginPath();
    ctx.moveTo(270,220);
    ctx.lineTo(235,220);
    ctx.lineTo(245,340);
    ctx.lineTo(275,340);
    ctx.lineTo(270,220);
    ctx.closePath();
    ctx.fill();
}

// Funkcja rysujaca glowe slonia
function drawHead(ctx){
    // kolory
    var shadow = "#818D91";
    var noshadow = "#9A9FA1";

    // uszy
    ctx.fillStyle = noshadow;
    ctx.beginPath();
    ctx.arc(130,170,55,0,360);
    ctx.arc(270,170,55,0,360);
    ctx.closePath();
    ctx.fill();

    // glowa cz. I (zaciemniona czesc)
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(200,190,55,0,360);
    ctx.closePath();
    ctx.fill();
    // glowa cz. II (jasna czesc plus uszy)
    ctx.fillStyle = noshadow;
    ctx.beginPath();
    ctx.arc(200,180,55,0,360);
    ctx.closePath();
    ctx.fill();

    // traba
    ctx.fillStyle = shadow;
    ctx.fillRect(175,220,50,20);
    ctx.fillStyle = noshadow;
    ctx.fillRect(190,220,20,100);
}

// Funkcja rysujaca oczy slonia
function drawEyes(ctx){
    // kolory
    var eyesblack = "#000000";
    var eyeswhite = "#FFFFFF";

    // bialka oczu
    ctx.fillStyle = eyeswhite;
    ctx.beginPath();
    ctx.arc(180,185,10,0,360);
    ctx.arc(220,185,10,0,360);
    ctx.closePath();
    ctx.fill();
    // zrenice oczu
    ctx.fillStyle = eyesblack;
    ctx.beginPath();
    ctx.arc(181,190,5,0,360);
    ctx.arc(219,190,5,0,360);
    ctx.closePath();
    ctx.fill();
}

// Funkcja rysujaca kly slonia
function drawTusks(ctx){
    // kolory
    var cream = "#FFFAE0";
    ctx.fillStyle = cream;

    // prawy kiel
    ctx.beginPath();
    ctx.arc(175,220,10,0,360);
    ctx.arc(160,250,5,0,360);
    ctx.moveTo(165,220);
    ctx.lineTo(185,220);
    ctx.lineTo(165,250);
    ctx.lineTo(155,250);
    ctx.lineTo(165,220);
    ctx.closePath();
    ctx.fill();

    // lewy kiel
    ctx.beginPath();
    ctx.arc(225,220,10,0,360);
    ctx.arc(240,250,5,0,360);
    ctx.moveTo(215,220);
    ctx.lineTo(235,220);
    ctx.lineTo(245,250);
    ctx.lineTo(235,250);
    ctx.lineTo(215,220);
    ctx.closePath();
    ctx.fill();
}