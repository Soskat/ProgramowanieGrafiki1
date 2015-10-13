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


// rysuje figure
function drawFigure(){
    var canvas = document.getElementById("MyFirstCanvas");  // tworzymy zmienna dla naszego canvas
    var ctx = canvas.getContext("2d");                      // bierzemy kontekst naszego canvas
    ctx.fillStyle = "rgba(0,255,0,1.0)";                    // okreslamy styl wypelnienia
    ctx.lineWidth = 1;                                      // okreslamy grubosc linii konturu
    ctx.strokeStyle = "#000000";                            // okreslamy styl konturu

    //polygon(ctx, 100, 100, 50, 8);          // rysuje wielokat foremny
    doodle(ctx, 100, 100, 100, 5, 4);        // rysuje gwiazde na planie wielokata foremnego
}

// rysuje wielokat foremny o n-katach
function polygon(ctx, x, y, r, n){
    ctx.beginPath();
    ctx.moveTo(x + r * Math.cos(0), y + r * Math.sin(0));
    for(var i = 1; i <= n; i += 1){
        ctx.lineTo(
            x + r * Math.cos(i * 2 * Math.PI / n),
            y + r * Math.sin(i * 2 * Math.PI / n)
        );
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// rysuje gwiazdki
function doodle(ctx, x, y, r, n, k){
    var v = {};
    // tworze liste wierzcholkow wielokata foremnego
    for(var i = 1; i <= n; i += 1){
        var p = {};
        p.x = x + r * Math.cos(i * 2 * Math.PI / n);
        p.y = y + r * Math.sin(i * 2 * Math.PI / n);
        v[i] = p;
    }

    ctx.beginPath();
    ctx.moveTo((v[0]).x, (v[0]).y);     // PROBLEM - jak odzyskac informacje o wspolrzednych punktu
    var i = 1;
    while((i*k - 1)%n != 0){
        var j = (i*k - 1)%n;
        ctx.lineTo((v[j]).x, (v[j]).y); // PROBLEM - jak powyzej
        i += 1;
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}