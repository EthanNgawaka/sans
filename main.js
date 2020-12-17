var bgalpha = 1;

var shakeTimer = 0;
var shake = false;
var shakeStrength = 5;

function screenShake(strength,length){
    shakeTimer=length;
    shake=true;
    shakeStrength=strength;
}

//player related stuffs
class Player{
    constructor(){
        this.x = w/2-7.5;
        this.y = 350;
        this.w = 17;
        this.h = 17;
        this.speed = 2.5;
        this.mode = 'red';
        this.hp = 92;
        this.sprite = new spriteSheet("heart.png",16,16,1,this.x,this.y,this.w,this.h)
        this.sprite.addState("red",1,1);
        this.sprite.addState("blue",2,1);
        this.oldx = 0;
        this.oldy = 0;

        //platforming stuff
        this.gravity = 0.13;
        this.xgravity = 0;
        this.yv = 0;
        this.jumpHeight = 5.5;
        this.grounded = false;
        this.gravityDirection = "down";


        this.invisible = false;
        this.rotation = 0;
        this.xv = 0;
    }
    draw(){
        if(!this.invisible){
            this.sprite.state = this.mode;
            this.sprite.x = this.x;
            this.sprite.y = this.y;
            this.sprite.draw(1,this.rotation);
            this.sprite.frameCalc(1);
            //drawRect(this.x,this.y,this.w,this.h,this.mode,1,this.mode,1,false);
        }
    }
    input(){
        var vector = [0,0];
        this.oldx = this.x;
        this.oldy = this.y;
        this.xv = 0;

        if(checkKey("ArrowUp")){
            vector[1] -= 1;
        }
        if(checkKey("ArrowLeft")){
            vector[0] -= 1;
        }
        if(checkKey("ArrowDown")){
            vector[1] += 1;
        }
        if(checkKey("ArrowRight")){
            vector[0] += 1;
        }

        /* Normalize diagonal movement, cant decide if it feels right or not
        if(vector[0] != 0 && vector[1] != 0){
            vector[0] *= 0.707107;
            vector[1] *= 0.707107;
        }
        */

        if(this.mode == "red"){
            this.x += vector[0] * this.speed;
            this.y += vector[1] * this.speed;
            this.rotation = 0;
        }
        if(this.mode == "blue"){
            
            
            if(this.gravityDirection == "down"){
                this.rotation = 0;
                if(vector[1] < 0 && this.grounded){
                    this.yv -= this.jumpHeight;
                    test = true;
                    this.grounded = false;
                }
                if(this.yv < 0 && vector[1] >= 0){
                    this.yv *= 0.5;
                }
                
                this.xv = Math.round(vector[0]) * this.speed;
                this.yv += this.gravity;
                this.y += this.yv;
                this.yv *= 0.99;
            }else if(this.gravityDirection == "up"){
                this.rotation = Math.PI;
                if(vector[1] > 0 && this.grounded){
                    test = true;
                    this.grounded = false;
                    this.yv += this.jumpHeight;
                }
                if(this.yv > 0 && vector[1] <= 0){
                    this.yv *= 0.5;
                }
                
                this.xv = Math.round(vector[0]) * this.speed;
                this.yv += -this.gravity;
                this.y += this.yv;
                this.yv *= 0.99;
            }else if(this.gravityDirection == "left"){
                this.rotation = Math.PI/2;
                if(vector[0] > 0 && this.grounded){
                    test = true;
                    this.grounded = false;
                    this.yv += this.jumpHeight;
                }
                if(this.yv > 0 && vector[0] <= 0){
                    this.yv *= 0.5;
                }
                
                this.y += Math.round(vector[1]) * this.speed;
                this.yv += -this.gravity;
                this.xv = this.yv;
                this.yv *= 0.99;
            }
            else if(this.gravityDirection == "right"){
                this.rotation = -Math.PI/2;
                if(vector[0] < 0 && this.grounded){
                    this.grounded = false;
                    test = true;
                    this.yv -= this.jumpHeight;
                }
                if(this.yv < 0 && vector[0] >= 0){
                    this.yv *= 0.5;
                }
                
                this.y += Math.round(vector[1]) * this.speed;
                this.yv += this.gravity;
                this.xv = this.yv;
                this.yv *= 0.99;
            }

            
            this.x+=this.xv;
        }
        
            
    }
}
var player = new Player();
var slamming = false;

function slam(direction,speed = 20){
    slamming = true;
    player.mode='blue'
    player.gravityDirection = direction;
    if(direction=="up"||direction=='left'){
        player.yv = -speed;
    }
    if(direction=="down"||direction=='right'){
        player.yv = speed;
    }
}

//attack related stuffs
class AttackManager{
    constructor(){
        this.arrows = [];
        this.axeSlices = [];
        this.swords = [];
        this.popupSwords = [];
        this.popupSwordSprite = new image("popupsword.png");
        this.sidewaysPopupSwordSprite = new image("sidewayspopupsword.png");
        this.arrowSprite = new image("arrow.png")
        this.swordBase = new image("popupswordBase.png");
        this.swordTip = new image("swordTip.png");
        this.sideswordBase = new image("sidepopupswordBase.png");
        this.sideswordTip = new image("sideswordTip.png");
        this.color = 'red';
        this.colortimer = 0;
        this.platforms = [];
    }
    spawnPopupSwords(direction,length,duration,windup){
        this.popupSwords.push([direction,length,duration,duration,windup,0]);
    }
    spawnArrow(x,y,direction){
        this.arrows.push([x,y,direction,300,direction+Math.PI]);
    }
    spawnAxeSlice(x,y,angle){
        this.axeSlices.push([x,y,angle,70,new spriteSheet("slash.png",16,66,3,x-24/2,y-99/2,24,99),0.7]);
        this.axeSlices[this.axeSlices.length-1][4].addState("idle",1,6);
        this.axeSlices[this.axeSlices.length-1][4].state = 'idle';
        
    }
    spawnSword(x,y,w,h,lifetime,vector,rotation){
        this.swords.push([x,y,w,h,lifetime,rotation,vector]);
    }
    spawnPlatform(x,y,w,h,lifetime,vector,carryPlayer,collisionDirection){
        this.platforms.push([x,y,w,h,lifetime,vector,carryPlayer,collisionDirection]);
    }
    update(){
        //platforms
        for(var x of this.platforms){
            x[0]+=x[5][0];
            x[1]+=x[5][1];
            if(player.mode=='blue'){
                for(var x of this.platforms){
                    //top and bottom collisions kind of condensed because i felt like it, idk why i did its just harder to read lmao
                    if((player.gravityDirection =='down'&&x[7]=="top")||(player.gravityDirection =='up'&&x[7]=="bottom")){
                        if(AABBCollision(x[0],x[1],x[2],x[3],player.x,player.y,player.w,player.h)){ // && !AABBCollision(x[0],x[1],x[2],x[3],player.oldx,player.oldy,player.w,player.h)){
                            var moving = false;
                            if(x[7]=='top'){
                                if(player.oldy + player.h < x[1] && player.yv >= 0){
                                    test = false;
                                    player.yv=0
                                    player.y = x[1] - player.h-0.0001; //not 100% sure why i need to subtract 0.0001 but hey, it works
                                    player.oldy=player.y
                                    moving = true;
                                }
                            }
                            if(x[7]=='bottom'){
                                if(player.oldy > x[1]+x[3] && player.yv <= 0){
                                    test = false;
                                    player.yv=0
                                    player.y = x[1]+x[3]+0.0001;
                                    player.oldy=player.y
                                    moving = true;
                                }
                            }
                            if(moving&&x[6]){
                                if(player.y>battleBox.y&&player.y + player.h < battleBox.y + battleBox.h){
                                    player.y+=x[5][1]
                                }
                                if(player.x>battleBox.x&&player.x + player.w < battleBox.x + battleBox.w){
                                    player.x+=x[5][0]
                                }
                            }
                        }
                    }
                    //right and left collisions
                    if((player.gravityDirection =='left'&&x[7]=="right")||(player.gravityDirection =='right'&&x[7]=="left")){
                        if(AABBCollision(x[0],x[1],x[2],x[3],player.x,player.y,player.w,player.h)){ //&& !AABBCollision(x[0],x[1],x[2],x[3],player.oldx,player.oldy,player.w,player.h)){
                            var moving = false;
                            if(x[7]=='left'){
                                if(player.oldx+player.w*0.9  < x[0] && player.yv >= 0){
                                    test = false;
                                    console.log(player.yv)
                                    player.x = x[0] - player.w-0.0001;
                                    player.oldx=player.x
                                    moving = true;
                                }else{
                                    console.log('hh')
                                }
                            }
                            if(x[7]=='right'){
                                if(player.oldx+player.w/10 > x[0]+x[2] && player.yv <= 0){
                                    player.yv = 0;
                                    test = false;
                                    player.x = x[0]+x[2]+0.0001;
                                    player.oldx=player.x
                                    moving = true;
                                }
                            }
                            if(moving&&x[6]){
                                if(player.y>battleBox.y&&player.y + player.h < battleBox.y + battleBox.h){
                                    player.y+=x[5][1]
                                }
                                if(player.x>battleBox.x&&player.x + player.w < battleBox.x + battleBox.w){
                                    player.x+=x[5][0]
                                }
                            }
                        }
                    }
                }
            }

            x[4]--;
            if(x[4]<0){
                this.platforms = arrayRemove(this.platforms,x);
            }
        }
        //
        //popup swords
        for(var x of this.popupSwords){
            if(x[2] < x[3] - x[4]){
                if(x[2] > 2){
                    x[5] = lerp(x[5],x[1],0.5);
                }else{
                    x[5] = lerp(x[5],0,0.5);

                }
            }

            x[2]--;
            if(x[2]<0){
                this.popupSwords = arrayRemove(this.popupSwords,x);
            }

        }
        //
        //swords
        for(var x of this.swords){
            x[0] += x[6][0];
            x[1] += x[6][1];

            x[4]--;
            if(AABBCollision(x[0],x[1],x[2],x[3],player.x,player.y,player.w,player.h,)){
                player.hp-=1;
            }
            if(x[4] < 0){
                this.swords = arrayRemove(this.swords,x);
            }
        }
        //
        //arrows
        for(var x of this.arrows){
            if(x[3] > 300-70){
                x[4] = lerp(x[4],x[2],0.1);
            }else{
                x[4] = x[2];
                x[0] += Math.cos(x[4])*5;
                x[1] += Math.sin(x[4])*5;
            }

            //player collision//
            if(AABBCollision(x[0]+Math.cos(x[4])*25-2.5,x[1]+Math.sin(x[4])*25-2.5,7.5,7.5,player.x,player.y,player.w,player.h)||AABBCollision(x[0]-2.5,x[1]-2.5,7.5,7.5,player.x,player.y,player.w,player.h)||AABBCollision(x[0]+Math.cos(x[4])*12.5-2.5,x[1]+Math.sin(x[4])*12.5-2.5,7.5,7.5,player.x,player.y,player.w,player.h)){
                player.hp--;
            }

            //
            x[3] -= 1;
            if(x[3]<0){
                this.arrows=arrayRemove(this.arrows,x);
            }
        }
        //
        //axe slices
        for(var x of this.axeSlices){
            if(x[3] < 20){
                //player collision//
                var linePos = [x[0]-Math.cos(x[2])*w,x[1]-Math.sin(x[2])*w,x[0]+Math.cos(x[2])*w,x[1]+Math.sin(x[2])*w];
                var line = lineIntersection(player.x,player.y,player.x+player.w,player.y+player.h,linePos[0],linePos[1],linePos[2],linePos[3]);
                var line4 = lineIntersection(player.x,player.y+player.h,player.x+player.w,player.y,linePos[0],linePos[1],linePos[2],linePos[3]);
                var line2 = lineIntersection(player.x,player.y,player.x+player.w,player.y+player.h,linePos[0]+Math.cos(x[2]+Math.PI/2)*20,linePos[1]+Math.sin(x[2]-Math.PI/2)*20,linePos[2]+Math.cos(x[2]+Math.PI/2)*20,linePos[3]+Math.sin(x[2]-Math.PI/2)*20);
                var line5 = lineIntersection(player.x,player.y+player.h,player.x+player.w,player.y,linePos[0]+Math.cos(x[2]+Math.PI/2)*20,linePos[1]+Math.sin(x[2]-Math.PI/2)*20,linePos[2]+Math.cos(x[2]+Math.PI/2)*20,linePos[3]+Math.sin(x[2]-Math.PI/2)*20);
                var line3 = lineIntersection(player.x,player.y,player.x+player.w,player.y+player.h,linePos[0]-Math.cos(x[2]+Math.PI/2)*20,linePos[1]-Math.sin(x[2]-Math.PI/2)*20,linePos[2]-Math.cos(x[2]+Math.PI/2)*20,linePos[3]-Math.sin(x[2]-Math.PI/2)*20);
                var line6 = lineIntersection(player.x,player.y+player.h,player.x+player.w,player.y,linePos[0]-Math.cos(x[2]+Math.PI/2)*20,linePos[1]-Math.sin(x[2]-Math.PI/2)*20,linePos[2]-Math.cos(x[2]+Math.PI/2)*20,linePos[3]-Math.sin(x[2]-Math.PI/2)*20);
                if(line || line2 || line3 || line4 || line5 || line6){
                    if(x[3] > 10){player.hp-=1};
                }
                //
            }
            x[3]--;
            if(x[3]<0){
                this.axeSlices = arrayRemove(this.axeSlices,x)
            }
        }
        //
    }
    drawSwords(){
        for(var x of this.swords){
            //drawRect(x[0],x[1],x[2],x[3],"white",1,"white",1,0);
            if(x[5] == Math.PI || x[5] == 0){
                this.popupSwordSprite.drawRotatedImg(x[0],x[1],x[2],x[3],1,x[5]);
            }else{
                this.sidewaysPopupSwordSprite.drawRotatedImg(x[0],x[1],x[2],x[3],1,x[5]-Math.PI/2);
                
            }
        }
        drawRect(0,0,w,battleBox.y-4,"black",1,"black",1)
        drawRect(0,battleBox.y+battleBox.h+4,w,h,"black",1,"black",1)
        drawRect(0,0,battleBox.x-4,h,"black",1,"black",1)
        drawRect(battleBox.x+battleBox.w+4,0,w,h,"black",1,"black",1)
    }
    draw(){
        //platforms
        for(var x of this.platforms){
            if(x[6]){
                var col = 'green'
            }else{
                var col = 'pink'
            }
            drawRect(x[0],x[1],x[2],x[3],col,false,0,1);
        }
        //
        
        //popup swords

        for(var x of this.popupSwords){
            if(x[2]< x[3] - x[4]){
                var boxX = 0;
                var boxY = 0;
                var boxW = 0;
                var boxH = 0;
                var boxRotation = 0;
                var tipY = 0;
                if(x[0]=="up"){
                    tipY = battleBox.y+battleBox.h-x[5]-6;
                    boxX = battleBox.x;
                    boxY = battleBox.y+battleBox.h-x[5]+6;
                    boxW = battleBox.w;
                    boxH = x[5];
                    boxRotation = 0;
                }
                if(x[0]=="down"){
                    boxX = battleBox.x;
                    boxY = battleBox.y;
                    boxW = battleBox.w;
                    boxH = x[5]-6;
                    boxRotation = Math.PI;
                    tipY = boxY+boxH-6;

                }
                if(x[0]=="left"){
                    boxX = battleBox.x+battleBox.w-x[5]+6;
                    boxY = battleBox.y;
                    boxW = x[5]-6;
                    boxH = battleBox.h;
                    boxRotation = Math.PI;
                    tipY = battleBox.x+battleBox.w-x[5]-6
                }
                if(x[0]=="right"){
                    boxX = battleBox.x;
                    boxY = battleBox.y;
                    boxW = x[5];
                    boxH = battleBox.h;
                    boxRotation = 0;
                    tipY = boxX+boxW
                }

                //image drawing for up and down swords
                if(x[0]=="up"||x[0]=='down'){
                    for(var i=0;i<battleBox.w/14;i++){
                        this.swordBase.drawRotatedImg(boxX+14*i,boxY,10,boxH-6,1,boxRotation);
                        this.swordTip.drawRotatedImg(boxX+14*i,tipY,10,12,1,boxRotation);

                    }
                }
                //image drawing for left and right swords
                if(x[0]=="left"||x[0]=='right'){
                    for(var i=0;i<battleBox.h/14;i++){
                        this.sideswordBase.drawRotatedImg(boxX,boxY+14*i,boxW,10,1,boxRotation);
                        this.sideswordTip.drawRotatedImg(tipY,boxY+14*i,12,10,1,boxRotation);
                    }
                }
                

                if(AABBCollision(boxX,boxY,boxW,boxH,player.x,player.y,player.w,player.h) && x[2] < x[3] - x[4]){
                    player.hp--;
                }
            
            }else{//draw red warning box
                c.lineWidth = 1;
                if(x[0]=="up"){
                    drawRect(battleBox.x,battleBox.y+battleBox.h-x[1],battleBox.w,x[1],this.color,0,"white",1,1);
                }
                if(x[0]=="down"){
                    drawRect(battleBox.x,battleBox.y,battleBox.w,x[1],this.color,0,"white",1,1);
                }
                if(x[0]=="left"){
                    drawRect(battleBox.x+battleBox.w-x[1],battleBox.y,x[1],battleBox.h,this.color,0,"white",1,1);
                }
                if(x[0]=="right"){
                    drawRect(battleBox.x,battleBox.y,x[1],battleBox.h,this.color,0,"white",1,1);
                }
                c.lineWidth=1;
                this.colortimer++;
                if(this.colortimer > 5){
                    if(this.color == 'red'){
                        this.color = "yellow"
                    }else{
                        this.color = 'red'
                    }
                    this.colortimer = 0;

                }

            }
        }
        //
        
        //arrows
        for(var x of this.arrows){
            this.arrowSprite.drawRotatedImg(x[0]+Math.cos(x[4])*12.5-20.25,x[1]+Math.sin(x[4])*12.5-3.75,40.5,7.5,1,x[4]);
        }
        //
        //axe slices
        for(var x of this.axeSlices){
            if(x[3] < 20){
                if(x[3]==19){
                    screenShake(8,8)
                }
                x[5]= lerp(x[5],0,0.1);
                var linePos = [x[0]-Math.cos(x[2])*w,x[1]-Math.sin(x[2])*w,x[0]+Math.cos(x[2])*w,x[1]+Math.sin(x[2])*w];
                c.lineWidth = 20;
                drawLine(linePos[0],linePos[1],linePos[2],linePos[3],"red",x[5]);
                c.lineWidth = 1;

            }else{
                if(x[3]<60 && x[3] > 38){
                    x[4].frameCalc(1);
                }
                if(x[3] > 30){
                    x[4].draw(x[5],x[2]+Math.PI/2);

                }

                //c.lineWidth = 1;
                //drawCircle(x[0],x[1],5,"blue",1,"blue",1)
                //drawLine(x[0]-Math.cos(x[2])*w,x[1]-Math.sin(x[2])*w,x[0]+Math.cos(x[2])*w,x[1]+Math.sin(x[2])*w,"white",1);
                //c.lineWidth = 1;
            }
        }
        //
    }
}
var attackManager = new AttackManager();
//Spawn an arrow pointing at the player || attackManager.spawnArrow(400,400,Math.atan2(player.y+player.h/2-400,player.x+player.w/2-400)))
//attackManager.spawnAxeSlice(w/2,h/2,120*Math.PI/180)
//attackManager.spawnSword(battleBox.x,battleBox.y+battleBox.h-30,10,30,600,[5,0],"up")


//Battle box stuff
var battleBox = {
    x:150,
    y:280,
    w:500,
    h:150,
}


function drawBattleBox(){
    drawRect(battleBox.x-4,battleBox.y-4,4,battleBox.h+8,"white",1,"white",1,false);
    drawRect(battleBox.x+battleBox.w,battleBox.y,4,battleBox.h+4,"white",1,"white",1,false);
    drawRect(battleBox.x,battleBox.y-4,battleBox.w+4,4,"white",1,"white",1,false);
    drawRect(battleBox.x,battleBox.y+battleBox.h,battleBox.w,4,"white",1,"white",1,false);
}
var test = true;
function battleBoxCollisions(){
    if(player.x < battleBox.x){
        player.x = battleBox.x;
        if(player.gravityDirection=="left"){
            player.yv = 0;
            test=false;
        }
    }
    if(player.y < battleBox.y){
        player.y = battleBox.y;
        if(player.gravityDirection=="up"){
            player.yv = 0;
            test=false;
        }
    }
    if(player.x + player.w > battleBox.x + battleBox.w){
        player.x = battleBox.x + battleBox.w - player.w;
        if(player.gravityDirection=="right"){
            player.yv = 0;
            test=false;
        }
    }
    if(player.y + player.h > battleBox.y + battleBox.h){
        player.y = battleBox.y + battleBox.h - player.h;
        if(player.gravityDirection=="down"){
            player.yv = 0;
            test=false;
        }
    }
    if(test){
        player.grounded = false;
    }else{
        player.grounded = true;
        if(slamming){
            slamming = false;
            console.log('ah')
            screenShake(12,8);
        }
    }
    test = true;
}
//draw and update functions

var timer = 0;
function drawOverlay(){
    var y = 470;
    //fight
    drawRect(146,y,90,40,"orange",1,"black",1);
    //act
    drawRect(146+139,y,90,40,"orange",1,"black",1);
    //item
    drawRect(146+139*2,y,90,40,"orange",1,"black",1);
    //mercy
    drawRect(146+139*3,y,90,40,"orange",1,"black",1);


    drawRect(146+139*menuX,y,90,40,"yellow",1,"black",1);

    if(!attacking){
        
        if(menuType=='act'||menuType=='spare'){
            var tempNum1 = 0;
            var tempNum2 = 0;
            for(var x of currentMenu){
                if(x!=0){
                    showText("*",battleBox.x+25+player.w*2+tempNum1*260,battleBox.y+25+player.h+tempNum2*50,20,'white')
                    showText(x,battleBox.x+25+tempNum1*260+player.w*4,battleBox.y+25+tempNum2*50+player.h,20,'white','left')
                }
                tempNum1++;
                if(tempNum1>1){
                    tempNum2++;
                    tempNum1=0;

                }
            }
        }


    }

    //hp
    showText(player.hp,w/2,550,20,'white');
    drawRect(146+139*1.5-10,y-30,110,20,"black",1,"red",1,false);
    drawRect(146+139*1.5-10,y-30,(110/92)*player.hp,20,"black",1,"yellow",1,false);
}

var menuX = 0;
var menuKeyDown = false;
var menuType = "selection";

var textQueue = [];

var displayText = '';
var textTimer = 0;
var done = false;

//fight = 155
var num = 0;
function boxText(){
    if(textQueue.length>0){
        textTimer++

        if(textTimer>3 && !done){
            textTimer = 0;
            var temp = textQueue[0].split('');
            displayText += temp[0];
            temp.splice(0,1)
            var output = ''
            for(var x of temp){
                output+=x;
            }
            textQueue[0] = output
            if(textQueue[0] == ''){
                done = true;
                textQueue.splice(0,1)
            }
        }
        
    }
    if(done){
        if(checkKey("KeyZ")){
            done=false;
            displayText ='';
        }
    }
    if(displayText!=''){
        showText("*",battleBox.x+25+player.w*0,battleBox.y+25+player.h+50,20,'white')
        showText("*",battleBox.x+25+player.w*0,battleBox.y+25+player.h+25,20,'white')
        showText("*",battleBox.x+25+player.w*0,battleBox.y+25+player.h,20,'white')
        wrapText(c,displayText,battleBox.x+25+player.w*1,battleBox.y+25+player.h,battleBox.w-50,25,"white")
        
    }
}
function draw(){
    drawRect(0,0,w,h,"black",true,"black",bgalpha);
    attackManager.drawSwords();
    drawBattleBox();
    drawOverlay();
    attackManager.draw();
    if(menuType!='dialogue'){
        player.draw();
    }else{
        menuX = -11
        if(displayText==''&& textQueue.length<1){
            menuType = 'selection'
            menuX = 0;
        }
    }

    boxText();
    
}

var attacking = 1;
var heartPos = [0,0]
var actingMenu = [
    "Dream",0,
    0,0
]
var dreamActingMenu = [
    "Check",0,
    0,0
]
var spareMenu = [
    "Spare",0,
    0,0
]
var currentMenu = actingMenu;



function update(){
    if(attacking){
        player.input();
        battleBoxCollisions()
    }else{
        if(menuType == "selection"){
            player.x = 155+139*menuX;
            player.y = 483;
            if(checkKey("KeyZ")&&!menuKeyDown){
                if(menuX==1){
                    menuType='act'
                    currentMenu = actingMenu;
                }
                if(menuX==3){
                    menuType = 'spare';
                    currentMenu = spareMenu;
                }
            }
            if(checkKey("ArrowLeft") && menuX>0 && !menuKeyDown){
                menuX-=1;
            }
            if(checkKey("ArrowRight") && menuX<3 && !menuKeyDown){
                menuX+=1;
            }
        }else if(menuType=='spare'){
            player.x = battleBox.x+25+heartPos[0]*260
            player.y = battleBox.y+25+heartPos[1]*50
            if(checkKey("ArrowDown")){
                if(spareMenu[2*heartPos[1]+heartPos[0]+2]!=undefined&&spareMenu[2*heartPos[1]+heartPos[0]+2]!=0){
                    heartPos[1]+=1;
                }
            }
            if(checkKey("ArrowUp")){
                if(spareMenu[2*heartPos[1]+heartPos[0]-2]!=undefined&&spareMenu[2*heartPos[1]+heartPos[0]-2]!=0){
                    heartPos[1]-=1;
                }
            }
            if(checkKey("ArrowRight")){
                if(heartPos[0]+1 > 1){

                }else{
                    if(spareMenu[2*heartPos[1]+heartPos[0]+1]!=undefined&&spareMenu[2*heartPos[1]+heartPos[0]+1]!=0){
                        heartPos[0]+=1;
                    }
                }
                
            }
            if(checkKey("ArrowLeft")){
                if(heartPos[0]-1 < 0){

                }else{
                    if(spareMenu[2*heartPos[1]+heartPos[0]-1]!=undefined&&spareMenu[2*heartPos[1]+heartPos[0]-1]!=0){
                        heartPos[0]-=1;
                    }
                }
                
            }
            if(checkKey("KeyX")&&!menuKeyDown){
                if(currentMenu==spareMenu){
                    menuType='selection'
                }
            }

        }else if(menuType == "act"){
            player.x = battleBox.x+25+heartPos[0]*260
            player.y = battleBox.y+25+heartPos[1]*50
            if(checkKey("ArrowDown")){
                if(actingMenu[2*heartPos[1]+heartPos[0]+2]!=undefined&&actingMenu[2*heartPos[1]+heartPos[0]+2]!=0){
                    heartPos[1]+=1;
                }
            }
            if(checkKey("ArrowUp")){
                if(actingMenu[2*heartPos[1]+heartPos[0]-2]!=undefined&&actingMenu[2*heartPos[1]+heartPos[0]-2]!=0){
                    heartPos[1]-=1;
                }
            }
            if(checkKey("ArrowRight")){
                if(heartPos[0]+1 > 1){

                }else{
                    if(actingMenu[2*heartPos[1]+heartPos[0]+1]!=undefined&&actingMenu[2*heartPos[1]+heartPos[0]+1]!=0){
                        heartPos[0]+=1;
                    }
                }
                
            }
            if(checkKey("ArrowLeft")){
                if(heartPos[0]-1 < 0){

                }else{
                    if(actingMenu[2*heartPos[1]+heartPos[0]-1]!=undefined&&actingMenu[2*heartPos[1]+heartPos[0]-1]!=0){
                        heartPos[0]-=1;
                    }
                }
                
            }
            if(checkKey("KeyZ")&&!menuKeyDown){
                if(currentMenu==actingMenu){
                    currentMenu = dreamActingMenu;
                    heartPos= [0,0]
                }
                else if(currentMenu==dreamActingMenu){
                    menuType = 'dialogue';
                    textQueue.push("Dream - ATK 13 DEF 99999            His shield wont last forever.        Keep attacking =]")
                }
            }
            if(checkKey("KeyX")&&!menuKeyDown){
                if(currentMenu==dreamActingMenu){
                    currentMenu = actingMenu;
                }
                else if(currentMenu==actingMenu){
                    menuType='selection'
                }
            }
        }
        

        if(checkKey("ArrowRight")||checkKey("ArrowLeft")||checkKey("KeyZ")||checkKey('KeyX')){menuKeyDown = true;
        }else{menuKeyDown=false}
    }
    attackManager.update();
    
}

function main(){
    update();
    draw();
    timer++;
    if(shakeTimer>0 && shake){
        shakeTimer--;
        shakePos[0] = random(-shakeStrength,shakeStrength)
        shakePos[1] = random(-shakeStrength,shakeStrength)
    }
    if(shakeTimer<=0){shake=false}
    if(!shake){
        shakePos[0] = lerp(shakePos[0],0,0.4);
        shakePos[1] = lerp(shakePos[1],0,0.4);
    }
    
    atk18()

    
}
setInterval(main,1000/60);
function atk18(){
    if(timer>70&&timer<200){
        battleBox.w=lerp(battleBox.w,100,0.1)
    }
    if(timer>200){
        attackManager.swords=[]
        battleBox.w=lerp(battleBox.w,500,0.3)
    }
    if(timer==1){
        slam("down")
        attackManager.spawnSword(battleBox.x+battleBox.w,battleBox.y+battleBox.h/2,10,battleBox.h/2,1170,[-5,0],0)
        attackManager.spawnSword(battleBox.x-10,battleBox.y,10,battleBox.h/2,1170,[2,0],Math.PI)
    }
    if(timer==70){
        attackManager.spawnAxeSlice(battleBox.x+10,battleBox.y+battleBox.h/2,Math.PI*1.5)
        slam("left",10)
    }
    if(timer>70 &&timer%10==0&&timer<150){
        num++
        attackManager.spawnAxeSlice(battleBox.x+8*num,battleBox.y+battleBox.h/2,Math.PI*1.5)
    }
    if(timer==10){
        attackManager.spawnPlatform(battleBox.x+70,-50,10,50,1000,[0,2.5],false,'right')
        attackManager.spawnPlatform(-50,battleBox.y+battleBox.h/2,50,10,3000,[1,0],false,'bottom')
    }
    if(timer==200){
        slam("up")
        attackManager.spawnPopupSwords("down",battleBox.h/2-15,600,60)
        attackManager.spawnPopupSwords("up",15,600,60)
    }
    if(timer>250&&timer%65==0&&timer<600){
        attackManager.spawnArrow(battleBox.x+battleBox.w+50,battleBox.y+battleBox.h/2+15,Math.PI)
    }
    if(timer==700){
        slam('left')
        attackManager.spawnPopupSwords('right',20,100,60)
    }
}
function atk17(){
    if(timer == 1){
        slam("left")
    }
    if(timer % 55 == 0){
        num++
        if(num%2==0){
            attackManager.spawnSword(-80,battleBox.y,10,battleBox.h/4-5,1170,[1.9,0],Math.PI)
        }else{
            attackManager.spawnSword(-80,battleBox.y+battleBox.h-battleBox.h/4+5,10,battleBox.h/4-5,1170,[1.9,0],0)

        }
        attackManager.spawnPlatform(-80,battleBox.y+battleBox.h/2-40,10,80,10000,[1.9,0],true,'right')
    }
    if(timer%15==0){
        attackManager.spawnSword(battleBox.x+battleBox.w-40,battleBox.y-20,40,10,170,[0,2],Math.PI*1.5)

    }
    
}
function atk16(){
    if(timer==1){
        slam('down');
        attackManager.spawnPopupSwords('up',battleBox.h/2-20,100000,300)
    }
    if(timer % 55 == 0){
        attackManager.spawnPlatform(-80,battleBox.y+battleBox.h/2+20,80,10,10000,[3,0],true,'top')
    }
    if(timer%15 == 0){
        attackManager.spawnSword(battleBox.x-40,battleBox.y,10,battleBox.h/4,1170,[3,0],Math.PI)
        
    }
}
function atk15(){
    if(timer==1){
        slam("left")
    }else if(timer==100){
        player.mode = 'red'
    }
    if(timer%100==0){
        attackManager.spawnPopupSwords('up',battleBox.h/2-4,100,80);
        
    }
    if(timer%45==0){
        attackManager.spawnSword(battleBox.x+battleBox.w,battleBox.y,10,battleBox.h/2,570,[-2.5,0],Math.PI)
        attackManager.spawnSword(battleBox.x-40,battleBox.y,10,battleBox.h/2,1170,[.3,0],Math.PI)
    }
}
function atk14(){
    battleBox.x = lerp(battleBox.x,w/2-player.w*2,0.1)
    battleBox.w = lerp(battleBox.w,player.w*4,0.1)
    battleBox.h = lerp(battleBox.w,player.w*4,0.1)
    if(timer%100==0){
        if(Math.random()>0.5){
            var temp1 = 'up'
        }else{
            var temp1 = 'down'
        }
        if(Math.random()>0.5){
            var temp2 = 'left'
        }else{
            var temp2 = 'right'
        }
        attackManager.spawnPopupSwords(temp1,battleBox.h/2-4,100,80);
        attackManager.spawnPopupSwords(temp2,battleBox.h/2-4,100,80);
    }
    
}
function atk13(){
    if(timer%80==0){
        num++;
        if(num%2==0){
            attackManager.spawnPopupSwords("up",battleBox.h/2,80,20);
        }else{
            attackManager.spawnPopupSwords("down",battleBox.h/2,80,20);
        }
    }
}
function atk12(){
    if(timer%100==0){
        attackManager.spawnAxeSlice(player.x+player.w/2,player.y+player.h/2,Math.PI*1.5)
    }
    if(timer%25==0){
        attackManager.spawnArrow(battleBox.x-40,player.y+player.h/2,0)
        attackManager.spawnArrow(battleBox.x+battleBox.w+40,player.y+player.h/2,Math.PI)
    }
}
function atk11(){
    battleBox.x = lerp(battleBox.x,w/2-player.w,0.1)
    battleBox.w = lerp(battleBox.w,player.w*2,0.1)
    if(timer==1){slam("down")}
    if(timer==480){
        slam("left")
    }
    if(timer>480&&timer<1000){
        battleBox.y = lerp(battleBox.y,430-player.h,0.1);
        battleBox.h = lerp(battleBox.h,player.h,0.1);
    }else{
        battleBox.y = lerp(battleBox.y,280,0.1);
        battleBox.h = lerp(battleBox.h,150,0.1);
    }
    if(timer==1050){
        attackManager.spawnPopupSwords('up',battleBox.h-player.h,600,300)
    }
    if(timer<350){
        if(timer%20==0&&timer>50){
            num++;
            if(num%2==0){
                attackManager.spawnArrow(battleBox.x+player.w*2-8,200,Math.PI/2)
            }else{
                attackManager.spawnArrow(battleBox.x+player.w/4+4,200,Math.PI/2)
            }
        }
    }
    if(timer>480){
        if(timer%30==0&&timer>50){
            num++;
            if(num%2==0){
                attackManager.spawnArrow(battleBox.x+player.w*2-8,200,Math.PI/2)
            }else{
                attackManager.spawnArrow(battleBox.x+player.w/4+4,200,Math.PI/2)
            }
        }
    }

}
function atk10(){
    battleBox.x = lerp(battleBox.x,300,0.1)
    battleBox.w = lerp(battleBox.w,200,0.1)
    if(timer%250==0){
        num++;
        if(num%2==0){
            attackManager.spawnPopupSwords("up",battleBox.h/2-10,100,60);
        }else{
            attackManager.spawnPopupSwords("down",battleBox.h/2-10,100,60);
        }
    }
    if(timer%45==0){
        attackManager.spawnSword(battleBox.x+battleBox.w,battleBox.y,10,battleBox.h/2,570,[-2.5,0],Math.PI)
        attackManager.spawnSword(battleBox.x-20,battleBox.y+battleBox.h-battleBox.h/2,10,battleBox.h/2,470,[2.5,0],0)
    }
}
function atk9(){
    if(timer==1){slam("left")}
    if(timer==105){
        attackManager.spawnArrow(battleBox.x+8,100,Math.PI/2)

    }
    if(timer%10==0&&timer<360){
        if(timer<190){
            num+=5;
        }else{
            num-=5
        }        
        
        var temp = 40+num
        attackManager.spawnSword(battleBox.x-20,battleBox.y+battleBox.h-temp,10,temp,570,[2,0],0)
        attackManager.spawnSword(battleBox.x-20,battleBox.y,10,battleBox.h-temp-40,570,[2,0],Math.PI)
    }
}
function atk8(){
    if(timer == 1){slam("left")}    
    if(timer>60){
        if(timer<62){
            attackManager.spawnAxeSlice(battleBox.x+5,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+5,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+5,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+5,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+5,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+5,battleBox.y+battleBox.h/2,Math.PI*1.5)
        }
        if(timer%10==0&&timer<190){
            player.mode ='red'
            attackManager.spawnAxeSlice(battleBox.x+(timer-60)*3,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+(timer-60)*3+25,battleBox.y+battleBox.h/2,Math.PI*1.5)
            attackManager.spawnAxeSlice(battleBox.x+(timer-60)*3+50,battleBox.y+battleBox.h/2,Math.PI*1.5)
        }
    }
    if(timer>190){
        battleBox.h = lerp(battleBox.h,player.h*2,0.15);
        if(timer<192){
            attackManager.spawnPopupSwords("left",400,400,220)
        }
        if(timer==640){
            attackManager.spawnPopupSwords("right",400,400,220)

        }
        if(timer%25 == 0 && timer < 760){
            num++
            if(num%2==0){
                attackManager.spawnArrow(battleBox.x+battleBox.w+50,battleBox.y+5,Math.PI)

            }else{
                attackManager.spawnArrow(battleBox.x+battleBox.w+50,battleBox.y+25,Math.PI)
            }
        }
    }else{
        battleBox.h = lerp(battleBox.h,player.h,0.15);

    }
}
function atk7(){
    player.mode="blue"
    if(timer==1){slam("right")}
    if(timer==50){slam("down")}
    battleBox.w-=0.5
    if(timer%15==0){
        attackManager.spawnSword(battleBox.x+battleBox.w-40,battleBox.y-20,40,10,170,[0,3],Math.PI*1.5)
    }
    if(timer%50==0){

        var temp = random(20,80)
        attackManager.spawnSword(battleBox.x-20,battleBox.y+battleBox.h-temp,10,temp,170,[3,0],0)
        attackManager.spawnSword(battleBox.x-20,battleBox.y,10,battleBox.h-temp-40,570,[3,0],Math.PI)
    }
}
function atk6(){
    player.mode="blue"
    if(timer>60){
        var temp = random(20,80)
        attackManager.spawnSword(battleBox.x+battleBox.w,battleBox.y+battleBox.h-temp,10,temp,170,[-3,0],0)
        attackManager.spawnSword(battleBox.x-20,battleBox.y,10,battleBox.h-temp-40,570,[3,0],Math.PI)
        timer=0;
    }
}
function atk5(){
    player.mode="blue";

    if(num==4){
        if(player.gravityDirection=="up"){
            slam('down')
        }else{
            slam("up")
        }
        num=0
    }
    
    if(timer%100==0){
        num++
        attackManager.spawnAxeSlice(battleBox.x+battleBox.w/2,battleBox.y+battleBox.h/2,0)
    }
    if(timer%45==0){
        attackManager.spawnSword(battleBox.x+battleBox.w-40,battleBox.y-20,40,10,170,[0,3],Math.PI*1.5)
        attackManager.spawnSword(battleBox.x,battleBox.y+battleBox.h,40,10,170,[0,-3],Math.PI/2)
        attackManager.spawnSword(battleBox.x-20,battleBox.y,10,40,570,[3,0],Math.PI)
        attackManager.spawnSword(battleBox.x+battleBox.w,battleBox.y+battleBox.h-40,10,40,170,[-3,0],0)
    }
}

function atk4(){
    if(timer>90){
        timer=0;
        var temp = Math.round(random(1,4))
        if(temp==1){
            slam("left");
            attackManager.spawnPopupSwords("right",30,60,30)
        }else if(temp == 2){
            slam("right")
            attackManager.spawnPopupSwords("left",30,60,30)
        }else if(temp == 3){
            slam("up")
            attackManager.spawnPopupSwords("down",30,60,30)
        }else if(temp == 4){
            slam("down")
            attackManager.spawnPopupSwords("up",30,60,30)
        }
        
    }
}
function atk3(){
    if(timer>90){
        timer=0;
        slam("down")
        attackManager.spawnPopupSwords("up",40,60,40)
        
    }
    if(timer%30==0){
        var temp = random(100,w-100)
        attackManager.spawnArrow(temp,200,Math.atan2(player.y+player.h/2-200,player.x+player.w/2-temp))
    }
}
function atk2(){
    if(timer>50-num){
        timer=0;
        num+=0.5
        if(Math.floor(num)==num){
            attackManager.spawnAxeSlice(player.x+player.w/2,player.y+player.h/2,Math.PI);
            attackManager.spawnAxeSlice(player.x+player.w/2,player.y+player.h/2,Math.PI/2);
        }else{
            attackManager.spawnAxeSlice(player.x+player.w/2,player.y+player.h/2,Math.PI*0.75);
            attackManager.spawnAxeSlice(player.x+player.w/2,player.y+player.h/2,Math.PI/4);
        }
    }
}
function atk1(){
    if(timer>10){
        if(num == 0){
            attackManager.spawnPopupSwords("up",30,1000,50)
            attackManager.spawnPopupSwords("down",30,1000,50)
        }
        timer=0;
        if(num > 3000){
            num+=65;

        }else{
            num+=30;

        }
        attackManager.spawnAxeSlice(battleBox.x+battleBox.w/2,battleBox.y+battleBox.h/2,num*Math.PI/360)
    }
}


