/**
 * Created by Louve on 09.10.2015.
 */

// rysuje prostokat wewnatrz okreslonego elementu canvas
function drawRectangle(){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas
    ctx.fillStyle = "rgba(0,0,255,1.0)";                    // okreslamy styl wypelnienia
    ctx.fillRect(30, 30, 20, 40);                           // wypelniamy nasz prostokat
}

// rysuje trojkat wewnatrz okreslonego elementu canvas
function drawTriangle(){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas
    ctx.fillStyle = "rgba(255,0,0,1.0)";                    // okreslamy styl wypelnienia

    // rysujemy sciezke trojkata i wypelniamy ja stworzonym kolorem:
    ctx.beginPath();
    ctx.moveTo(10,10);
    ctx.lineTo(30,10);
    ctx.lineTo(15,30);
    ctx.lineTo(10,10);
    ctx.closePath();
    ctx.fill();
}

// rysuje wycinek okregu wewnatrz okreslonego elementu canvas
function drawArc(){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas
    ctx.fillStyle = "rgba(0,255,0,1.0)";                    // okreslamy styl wypelnienia

    // rysujemy wycinek okregu i wypelniamy go stworzonym kolorem
    ctx.moveTo(50,50);
    ctx.arc(50,50,30,0,30,1);
    ctx.fill();
}
