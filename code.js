const ctx = document.getElementById("gameScreen").getContext("2d");
const audio = {"brick":new Audio("brick.ogg"), "pad":new Audio("pad.ogg")};
var Bricks, Balls, pad, Powerups, score, lives, gamemode, barrier;
var speed = 10;
var powChance = 50// 1/x per Powerup
loadLevel()

function load(){
    lives = 3;
    score = 0;
    Balls = [];
    Bricks = [];
    Powerups = [];
    barrier = false;
    for(var i of document.getElementsByClassName("menu")){
        i.style.display = "none"
    }
    var livesInput = Math.floor(Number(document.getElementById("lives").value));
    if(livesInput > 0){lives=livesInput}
    gamemode = document.getElementById("gamemode").value;

    var canvas = document.getElementById("gameScreen");
    canvas.style.display = "block"
    canvas.height = "900";
    canvas.width = "850";

    drawInfo();

    //wait for player input
    ctx.fillText("Press any Key to play with <- & ->", 234.6, 400);
    ctx.fillText("Click to play with mouse", 262.6, 430);
    document.addEventListener("click", start)
    document.addEventListener("keydown", start)
}

function start(caller){
    if(caller.target.tagName == "BUTTON") return;
    document.removeEventListener("click", start);
    document.removeEventListener("keydown", start);
    ctx.clearRect(200, 350, 450, 100);

    makeBricks(document.getElementById("textInput").value);

    input = "Keys"
    if(caller instanceof PointerEvent){
        input = "Mouse";
    }
    pad = new Pad(input)
    Balls.push(new Ball());
    requestAnimationFrame(gameloop);
}

function end(){
    document.removeEventListener("click", end)
    document.removeEventListener("keydown", end)
    document.getElementById("gameScreen").style.display = "none";
    for(var i of document.getElementsByClassName("menu")){
        i.style.display = "block"
    }
    for(var i of document.getElementsByClassName("InputWrapper")){
        i.style.display = "flex"
    }
}

function makeBricks(text){
    //calculate lines (wrap / <br>)
    var lines = [""];
    for(var word of text.replaceAll("\n", " \n ").split(" ")){
        if(word == "\n"){
            lines.push("")
        }else if(lines[lines.length-1].length + word.length <= 76){
            lines[lines.length-1] += word + " ";
        }else{
            lines.push(word+" ")
        }
    }
    for(var i in lines){
        var length = lines[i].length
        lines[i] = lines[i].substring(0,length - 1)
            .padStart(Math.ceil((75+length)/2)," ")
            .padEnd(77, " ");
    }    
    // make blocks
    for(var i in lines){
        var index = 0
        for(var j of lines[i].split(" ")){
            if(j){
                Bricks.push(new Brick(j, i, index))
            }
            index += j.length+1;
        }
    }
}

function gameloop(){
    var startTime = window.performance.now();

    if(barrier){
        ctx.fillStyle='#00FFFF';
        ctx.fillRect(0, 895, 850, 5);
        ctx.fillStyle="#000000"
    }

    pad.update();
    for(var i=0;i<speed;i++){
        for(var o of Balls){
            o.update();
        }
        Bricks = Bricks.filter((b)=>!b.del)
    }
    Balls = Balls.filter((b)=>!b.del)
    for(var o of Powerups){
        o.update();
    }
    Powerups = Powerups.filter((b)=>!b.del)
    for(var o of Bricks){
        o.draw();
    }
    drawInfo();

    if(Balls.length == 0){
        lives -= 1
        Balls.push(new Ball())
    }

    if(Bricks.length == 0 || lives == 0){
        ctx.clearRect(0,0,850,900)
        ctx.font = "50px Monospace"
        if(lives == 0){
            ctx.fillText("You Lose", 318.2, 400);
        }else{
            score += 1000*lives
            ctx.fillText("You Win", 331.5, 400)
            ctx.font = "30px Monospace"
            ctx.fillText("Score: "+score, (850-16.6*("Score: "+score).length)/2,440)
        }
        document.addEventListener("click", end)
        document.addEventListener("keydown", end)
        return;
    }

    waitForFPS(startTime);
    requestAnimationFrame(gameloop);
}

function drawInfo(){
    ctx.clearRect(0, 0, 850, 60)
    ctx.font = "30px Arial"
    ctx.fillStyle = "#000000";

    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(850, 60);
    ctx.stroke();

    ctx.fillText("Score: "+score, 200, 40);
    ctx.fillText("Lives: "+lives, 550, 40);
    ctx.font = "20px Monospace"
}

function extendCor(x,y,w,h){
    return [x-1,y-1,w+2,h+2];
}

function randomColor(){
    var colors = ["#3278C8", "#DC6428", "#C85078", "#73FF4B"];
    return colors[Math.floor((Math.random()*colors.length))];
}

function waitForFPS(startTime){
    while(window.performance.now()-startTime < 1000/60){
        continue;
    }
}

class Brick {
    constructor(text, line, index) {
        this.text = text;
        this.textCor = [11.2*index, 80+24*line];
        this.brickCor = [11.2*index-3.6, 80+24*line-16, 11.2*text.length+7.2, 20];
        this.color = randomColor();
        this.del = false;
        this.draw();
        switch (gamemode){
            case "words":
                this.onhit = this._words;
                break;
            case "letters":
                this.onhit = this._letters;
                break;
            case "uppercase":
                this.onhit = this._case;
                break;
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(...this.brickCor)
        ctx.fillStyle = "#000000";
        ctx.fillText(this.text, ...this.textCor)
    }
    _words(multiplier) {
        this.break(multiplier)
    }
    _letters(multiplier) {
        if(this.text.length == 1){
            this.break(multiplier)
        }else{
            this.text = this.text.slice(0,-1);
            this.textCor[0] += 5.6
            this.color = randomColor();
            score += 10*multiplier
        }        
    }
    _case(multiplier) {
        var index = Math.floor(Math.random()*this.text.length);
        if(this.text[index].toLowerCase() == this.text[index]){
            this.break(multiplier);
        }else{
            this.text = this.text.slice(0,index) + this.text[index].toLowerCase() + this.text.slice(index+1)
            this.color = randomColor();
            score += 10*multiplier
        }
        
    }
    break(multiplier) {
        score += 100*multiplier
        ctx.clearRect(...extendCor(...this.brickCor))
        switch (Math.floor(Math.random()*powChance)){
            case 0:
                Powerups.push(new Powerup("+life", 0, this.brickCor))
                break;
            case 1:
                Powerups.push(new Powerup("+ball", 0, this.brickCor))
                break;
            case 2:
                Powerups.push(new Powerup("barrier", 10000, this.brickCor))
                break;
            case 3:
                Powerups.push(new Powerup("wide", 10000, this.brickCor))
                break;
        }
        
        this.del = true;
    }
}

class Ball {
    constructor() {
        this.img = document.getElementById("ball");
        this.Cor = [415,778,20,20]
        this.rot = (Math.random()*90+315)%360;
        this.sticky;
        this.moveX;
        this.moveY;
        this.reflected;
        this.multiplier = 1;
        this.del = false;
        this.wait();
    }
    wait() {
        this.sticky = true;
        if(pad.input == "Mouse"){
            document.addEventListener("click", this.go.bind(this));
        }else{
            document.addEventListener("keydown", this.go.bind(this));
        }
    }
    go(e) {
        if((pad.input == "Mouse") || (["ArrowUp", "ArrowDown", "Enter", " "].includes(e.key))){
            this.sticky = false;
        }
    }
    update() {
        if(this.del){return}
        ctx.clearRect(...extendCor(...this.Cor))
        if(this.sticky){
            this.Cor[0] = pad.Cor[0]+pad.Cor[2]/2-10;
            ctx.drawImage(this.img, ...this.Cor);
            return;
        }
        this.moveX = Math.cos((this.rot+270)*Math.PI/180)
        this.moveY = Math.sin((this.rot+270)*Math.PI/180)

        //bricks
        this.reflected = {x:false, y:false};
        for(var b of Bricks){
            if(this.collisionHandler(b.brickCor)){
                b.onhit(this.multiplier)
                audio["brick"].play();
                this.multiplier ++;
            }
        }
         // walls
         this.reflected = {x:false, y:false};
         this.collisionHandler([19, 60, -19, 840]) 
         this.collisionHandler([850, 60, -19, 840])
         this.collisionHandler([0, 79, 850, -19])
         if(this.collisionHandler([0, 900, 850, -19])){
             if(!barrier){
                 this.del = true;
                 return;
             }
         }
         //pad
         this.reflected = {x:false, y:false};
         var padX = pad.Cor[0];
         var padW = pad.Cor[2]/5;
         for(var i=0;i<5;i++){
             if(this.collisionHandler([padX+i*padW+10*(i>0), 800, (padW-20)+10*(i==0 || i==4), -19])){
                 this.multiplier = 1;
                 this.rot += 10*(i-2);
                 audio["pad"].play()
             }
         }

        this.Cor[0] += this.moveX;
        this.Cor[1] += this.moveY;
        ctx.drawImage(this.img, ...this.Cor);
    }
    brickcollision(bCor) {
        // make four wall for collision, do with collHandler, return result
    }
    collisionHandler(bCor) {
        //TODO only acept one wall and bounce it
        // -> add param isY
        // -> switch to rect coll for bricks
        var bounced = false;
        var quater = Math.floor(this.rot/90);
        var x = bCor[0]-10+(bCor[2]+20)*(quater>=2);
        var y = bCor[1]-10+(bCor[3]+20)*(((quater+1)%4)<2);

        //|
        if((!this.reflected.x) && this.Cor[0]+10+this.moveX > x && this.Cor[0]+10+this.moveX < x+1
            && this.Cor[1]+10+this.moveY > bCor[1]-10 && this.Cor[1]+10+this.moveY < bCor[1]+bCor[3]+10){
            this.rot = (360-this.rot)
            this.reflected.x = true;
            bounced = true;
        }
        //_
        if((!this.reflected.y) && this.Cor[1]+10+this.moveY > y && this.Cor[1]+10+this.moveY < y+1
            && this.Cor[0]+10+this.moveX > bCor[0]-10 && this.Cor[0]+10+this.moveX < bCor[0]+bCor[2]+10){
            this.rot = (540-this.rot)%360
            this.reflected.y = true;
            bounced = true;
        }
        return bounced;
    }
}

class Pad {
    constructor(input) {
        this.img = document.getElementById("pad");
        this.Cor = [350,800,150,20]
        this.target = 350;
        this.input = input;
        if(input == "Mouse"){
            this.move = this._mouseMove
            document.addEventListener("mousemove", (e) => pad.move(e));
        }else{
            this.move = this._keysMove
            document.addEventListener("keydown", (e) => pad.move(e))
            document.addEventListener("keyup", (e) => pad.move(e))
        }
    }
    _mouseMove(e) {
        var canvasX = document.getElementById("gameScreen").getBoundingClientRect().left;
        this.target = e.x-canvasX;
    }
    _keysMove(e){
        if(e.type == "keyup"){
            this.target = this.Cor[0]+this.Cor[2]/2;;
        }else if(e.key == "ArrowLeft"){
            this.target = 0;
        }else if(e.key == "ArrowRight"){
            this.target = 850
        }
    }
    update() {
        ctx.clearRect(...extendCor(...this.Cor))
        var center = this.Cor[0]+this.Cor[2]/2;
        this.Cor[0] += [0+this.Cor[2]/2, center-10, this.target, 
            center+10, 850-this.Cor[2]/2].sort((a,b)=>a-b)[2]-center;
        ctx.drawImage(this.img, ...this.Cor);
    }
}

class Powerup {
    constructor(type, time, Cor) {
        this.time = time;
        this.rectCor = [Cor[0]+Cor[2]/2-10, Cor[1], 20, 20]
        this.powCor = [Cor[0]+Cor[2]/2, Cor[1]+Cor[3]/2, 10, 0, 2*Math.PI];
        this.del = false;
        this.color = {'+life':'#EB73FF', '+ball':'#FFD800',
            'barrier':'#00FFFF', 'wide':'#4800FF'}[type];
        this.effect = {
            '+life':   ()=>{lives+=1}, 
            '+ball':   ()=>{Balls.push(new Ball())},
            'barrier': ()=>{barrier=true},
            'wide':    ()=>{pad.Cor[0]-=50;pad.Cor[2]+=100}
        }[type];
        this.effectEnd = {
            '+life':   ()=>{},
            '+ball':   ()=>{},
            'barrier': ()=>{barrier=false;ctx.clearRect(0, 895, 850, 5)},
            'wide':    ()=>{ctx.clearRect(...extendCor(...pad.Cor));pad.Cor[0]+=50;pad.Cor[2]-=100}
        }[type];
    }
    update() {
        ctx.clearRect(...extendCor(...this.rectCor));
        if(this.powCor[1] > 790 && this.powCor[1] < 830 && 
            this.rectCor[0] < pad.Cor[0]+pad.Cor[2] && this.rectCor[0]+20 > pad.Cor[0]){
            this.del = true;
            this.effect();
            setTimeout(this.effectEnd, this.time); 
            return;    
        }
        if(this.powCor[0]>900){
            this.del;
            return;
        }
        this.rectCor[1] += 2;
        this.powCor[1] += 2;
        ctx.beginPath();
        ctx.arc(...this.powCor);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
    }
}

/* TODO
more levels 
see TODO in class Ball (collision)
more powerups (add negative?)
onsided collision-Boxes (walls, pad)
add distance wall<->bricks
*/