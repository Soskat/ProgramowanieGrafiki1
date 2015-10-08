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