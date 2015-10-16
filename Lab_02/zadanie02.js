/**
 * Created by Louve on 2015-10-16.
 */

// rysuje szachownice
function drawChessBoard(){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas

    var tilesAmount = 8;					//ilosc pol szachownicy w jednym wymiarze
    var ind = 0;							// indeks elementu w tablicy colTab
    var colTab = ["#98e79a", "#1c961e"];	// tablica z kolorami szachownicy

    for(var i = 0; i < tilesAmount; i++){
        ctx.save();
        for(var j = 0; j < tilesAmount; j++){
            ctx.fillStyle = colTab[++ind % 2];
            ctx.fillRect(0, 0, 50, 50);
            ctx.translate(50, 0);
        }
        ctx.restore();
        ctx.translate(0, 50);
        ind = ++ind % 2;
    }
}

// rysuje zegar
function drawWatch(coorX, coorY, r){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas

    ctx.fillStyle = "#d1f4fa";
    ctx.strokeStyle = "#2a7481";
    ctx.lineWidth = 5;

    // rysuje tarcze zegara
    ctx.translate(coorX, coorY);
    ctx.beginPath();
    ctx.arc(0, 0, r + 40, 0, 360);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // tworze liste 12 punktow znajdujacych sie na okregu
    var hoursP = [];
    for(var i = 0; i < 12; i++){
        var p = {};
        p["x"] = 0 + r * Math.cos(i * 2 * Math.PI / 12);
        p["y"] = 0 + r * Math.sin(i * 2 * Math.PI / 12);
        hoursP[i] = {x : p["x"], y : p["y"]};
    }

    // rysuje poszczegolne godziny
    ctx.font = "24px Arial";
    for(var j = 0; j < 12; j++){
        i = (j + 10) % 12;
        ctx.fillStyle = "#a2d4dd";
        ctx.beginPath();
        ctx.arc(hoursP[i]["x"], hoursP[i]["y"], 25, 0, 360);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "#3a656d";
        if(j >= 9)
            ctx.fillText((j + 1).toString(), hoursP[i]["x"] - 13, hoursP[i]["y"] + 7);
        else
            ctx.fillText((j + 1).toString(), hoursP[i]["x"] - 7, hoursP[i]["y"] + 7);
    }

    // wskazowka godzinowa
    ctx.fillStyle = "#325359";
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.rotate(-25);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-7, -60);
    ctx.lineTo(0, -75);
    ctx.lineTo(7, -60);
    ctx.lineTo(3, 0);
    ctx.closePath(-3, 0);
    ctx.fill();

    // wskazowka minutowa
    ctx.fillStyle = "#57878f";
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, 360);
    ctx.closePath();
    ctx.fill();

    ctx.rotate(-12);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-5, -90);
    ctx.lineTo(0, -115);
    ctx.lineTo(5, -90);
    ctx.lineTo(3, 0);
    ctx.closePath(-3, 0);
    ctx.fill();
}