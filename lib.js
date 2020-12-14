/*
A small, simple javascript library for game making, currently dosent support images or sound.
has drawing functions for most shapes and input handing
*/

var canvas = document.getElementById("main");
canvas.setAttribute('draggable', false);
var entirePage = document.getElementById("wholePage");

var c = canvas.getContext("2d"); //c means context
var h = canvas.height;
var w = canvas.width;
var scale = 1
document.addEventListener('contextmenu', event => event.preventDefault());

//Mouse Stuff//
var mouse={x:0,y:0,button:{left:false, middle:false, right:false}};
canvas.addEventListener('mousemove', function(evt) {
    mouse.x = getMouseX(canvas, evt);
    mouse.y = getMouseY(canvas, evt);
}, false);
function getMouseX(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return evt.clientX - rect.left
}
function getMouseY(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return evt.clientY - rect.top
}
document.addEventListener('mousedown', function(event){
	if (event.button == 0){
        mouse.button.left = true;
    }
    if (event.button == 1){
        mouse.button.middle = true;
    }
    if (event.button == 2){
        mouse.button.right = true;
    }
});
document.addEventListener('mouseup', function(event){
	if (event.button == 0){
        mouse.button.left = false;
    }
    if (event.button == 1){
        mouse.button.middle = false;
    }
    if (event.button == 2){
        mouse.button.right = false;
    }
});
//----------//

/*
The keys system currently works by adding any key pressed into the keys object
the key is the key name and the value is a bool of if it is pressed
*/

var shakePos = [0,0];


var keys = {}
var logKeys = false;

var pressedAnyKey = false;
document.addEventListener('keydown', function(event) {
		current_key = event.code;
		keys[current_key] = true;
		if(logKeys){
			console.log(keys);
		}
		pressedAnyKey = true;
	}
);
document.addEventListener('keyup', function(event) {
		current_key = event.code;
		keys[current_key] = false;
	}
);

function checkKey(key){
	if(key in keys){
		if(keys[key] == true){
			return true;
		}
	}
	return false;
}


function collidePoint(point, rect){
	if(point[0] > rect[0] && point[0] < rect[0] + rect[2] && point[1] > rect[1] && point[1] < rect[1] + rect[3]){
		return true;
	}else{
		return false;
	}
}

function collideRect(rect1, rect2){
	if(rect1[0] > rect2[0] + rect2[2] || rect1[0] + rect1[2] < rect2[0] || rect1[1] > rect2[1] + rect2[3] || rect1[1] - rect1[3] < rect2[1]){
		return false;
	}else{
		return true;
	}
}

function blendCols(col1, col2, per){
	var R = col1[0] + (col2[0] - col1[0])*per;
	var G = col1[1] + (col2[1] - col1[1])*per;
	var B = col1[2] + (col2[2] - col1[2])*per;
	return [R, G, B];
}

document.documentElement.style.setProperty('image-rendering', 'pixelated');

function midPoint(point1, point2, per){
	var x = point1[0] + (point2[0] - point1[0])*per;
	var y = point1[1] + (point2[1] - point1[1])*per;
	return [x, y];
}

function drawRotatedRect(X, Y, W, H, colour, rotation){
	c.save();
	c.translate(X, Y);
	c.rotate(rotation);
	c.fillStyle = colour;
	c.beginPath();
	c.rect(-W/2,-H/2, W, H);
	c.fill();
	c.restore();
}
function wrapText(context, text, x, y, maxWidth, lineHeight,col) {
	var words = text.split(' ');
	var line = '';
	var counter = 0;
	var maximumWidth = maxWidth;
	for(var n = 0; n < words.length; n++) {
	  var testLine = line + words[n] + ' ';
	  var metrics = context.measureText(testLine);
	  var testWidth = metrics.width;
	  if (testWidth >= maximumWidth && n > 0) {
		showText(line,x,y,20,col,'left');
		line = words[n] + ' ';
		y += lineHeight;
		counter++;
	  }
	  else {
		line = testLine;
	  }
	}
	showText(line,x+context.measureText(line).width/2,y,20,col);
  }
function showText(text, X, Y, Size, colour = "rgb(0, 0, 0)", align='center',bold = false, stroke = false){
	c.beginPath();
	if(bold === true){
		c.font = "bold "+Size+"px Arial";
	}
	else{
		c.font = 24+"px dtm"
	}
	c.textAlign = align;
	if(stroke === false){
		c.fillStyle=colour;
		c.fillText(text, X+shakePos[0], Y+shakePos[1]);
	}
	if(stroke === true){
		c.lineWidth = Size/25;
		c.strokeStyle = colour;
		c.strokeText(text, X, Y)
	}
}

function onScreen(X, Y, size){
	if(X+size > 0 && X-size < canvas.width && Y+size > 0 && Y-size < canvas.width){
		return true;
	} else{
		return false;
	}
}

function roundRect(x, y, width, height, radius = 5) { // stolen
	/*
	creates the path for a rectangle with rounded corners
	*/
	if (typeof radius === 'number') {
		radius = {tl: radius, tr: radius, br: radius, bl: radius};
	}
	c.moveTo(x + radius.tl, y);
	c.lineTo(x + width - radius.tr, y);
	c.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	c.lineTo(x + width, y + height - radius.br);
	c.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	c.lineTo(x + radius.bl, y + height);
	c.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	c.lineTo(x, y + radius.tl);
	c.quadraticCurveTo(x, y, x + radius.tl, y);
	c.closePath();
}
function roundedLine(startPos, endPos, width, colour){
	c.beginPath();
	c.strokeStyle = colour;
	c.lineWidth = width;
	c.moveTo(startPos[0], startPos[1]);
	c.lineTo(endPos[0], endPos[1]);
	c.stroke();

	c.beginPath();
	c.fillStyle = colour;
	c.arc(startPos[0], startPos[1], width/2, 0, Math.PI*2);
	c.fill();

	c.beginPath();
	c.arc(endPos[0], endPos[1], width/2, 0, Math.PI*2);
	c.fill();
}

function drawCorners(rect){
	c.beginPath();
	c.moveTo(rect[0]+rect[2]*0.1, rect[1]); //top left right
	c.lineTo(rect[0], rect[1]); //top left
	c.lineTo(rect[0], rect[1]+rect[3]*0.1); //top left bottom
	c.stroke();

	c.beginPath();
	c.moveTo(rect[0], rect[1]+rect[3]*0.9); //bottom left top
	c.lineTo(rect[0], rect[1]+rect[3]); // bottom left
	c.lineTo(rect[0]+rect[2]*0.1, rect[1]+rect[3]); //bottom left right
	c.stroke();

	c.beginPath();
	c.moveTo(rect[0]+rect[2]*0.9, rect[1]+rect[3]); //bottom right left
	c.lineTo(rect[0]+rect[2], rect[1]+rect[3]); //botom right
	c.lineTo(rect[0]+rect[2], rect[1]+rect[3]*0.9); //bottom right top
	c.stroke();

	c.beginPath();
	c.moveTo(rect[0]+rect[2], rect[1]+rect[3]*0.1); //top right bottom
	c.lineTo(rect[0]+rect[2], rect[1]); //top right
	c.lineTo(rect[0]+rect[2]*0.9, rect[1]); //top right left
	c.stroke();
}

function scaleNumber(n, x1, x2, z1, z2, clip = false){
	var range1 = x2-x1;
	var range2 = z2-z1;
	var ratio = (n - x1) / range1
    var result = ratio * range2 + z1
    if(clip === true){
    	return clip(result, z1, z2);
    }else{
    	return result;
    }
}

function dist(X1, Y1, X2, Y2){
	return Math.hypot(X1-X2, Y1-Y2);
}

function dist3d(x1, y1, z1, x2, y2, z2){
	return Math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2);
}

function createArray(fill, size){
	var temp_array = [];
	for(var i = 0; i<size; i+=1){
		temp_array.push(fill);
	}
	return temp_array
}

function createNdArray(fill, sizes){
	var temp_array = []
	if(sizes.length === 2){
		for(var i = 0; i<sizes[0]; i+=1){
			temp_array.push(createArray(fill, sizes[0]));
		}
		return temp_array
	}else{
		for(var i = 0; i<sizes[0]; i+=1){
			temp_array.push(createNdArray(fill, sizes.slice(1, sizes.length)));
		}
	}
	return temp_array
}


function round(num, places = 0){
	return Math.round(num*(10**places))/(10**places)
}

function random(min, max, round = false){
	if(round === false){
		return Math.random()*(max-min)+min;
	}else{
		// return round(Math.random()*(max-min)+min);
	}
}

function clip(n, min, max){
	return Math.min(Math.max(n, min), max);
}

function roundList(list, places = 0){
	var newList = []
	for(var i = 0; i < list.length; i+=1){
		newList.push(round(list[i], places))
	}
	return newList
}

function dist2line(x, y, line){
	var x1 = line[0];
	var y1 = line[1];
	var x2 = line[2];
	var y2 = line[3];
	var vx = x1 - x;
	var vy = y1 - y;
	var ux = x2 - x1;
	var uy = y2 - y1;

	var length = ux * ux + uy * uy;
	var det = (-vx * ux) + (-vy * uy);
	if(det < 0){
    	return Math.sqrt((x1 - x)**2 + (y1 - y)**2);
	}
    if(det > length){
    	return Math.sqrt((x2 - x)**2 + (y2 - y)**2);
    }
    det = ux * vy - uy * vx
    return Math.sqrt(det**2 / length)
}

function drawGlow(X, Y, size, brightness, col=[255, 255, 255]){
	//probrobly could go in renderer but its usefull to have in other projects
	c.beginPath();
	var glow = c.createRadialGradient(X, Y, 0, X, Y, size);
	glow.addColorStop(0, "rgba("+col[0]+", "+col[1]+","+col[2]+","+brightness+")")
	glow.addColorStop(1, "rgba("+255+", "+255+","+255+", 0)")
	c.fillStyle = glow;
	c.fillRect(X-size+shakePos[0], Y-size+shakePos[1], size*2, size*2);
}

function guassianRandom(min, max, amount = 2){
	var total = 0
	for(var i = 0; i < amount; i += 1){
		total += random(min,max);
	}
	return total/Math.floor(amount)
}

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}

function shuffle(arra1) { // https://www.w3resource.com/javascript-exercises/javascript-array-exercise-17.php
    let ctr = arra1.length;
    let temp;
    let index;

    // While there are elements in the array
    while (ctr > 0) {
		// Pick a random index
        index = Math.floor(Math.random() * ctr);
		// Decrease ctr by 1
        ctr--;
		// And swap the last element with it
        temp = arra1[ctr];
        arra1[ctr] = arra1[index];
        arra1[index] = temp;
    }
    return arra1;
}

//Image Stuff//
class image{
	constructor(imageLocation){
		this.img = new Image();
		this.img.src=imageLocation;
	}	

	drawImg(X,Y,W,H, alpha){
		c.save();
		c.imageSmoothingEnabled = false;
        c.webkitImageSmoothingEnabled = false;
        c.mozImageSmoothingEnabled = false;
		c.globalAlpha = alpha;
		c.drawImage(this.img, X*scale+shakePos[0],Y*scale+shakePos[1], W*scale,H*scale);
		c.globalAlpha = 1;
		c.restore();
	}

	drawRotatedImg(X, Y, W, H, alpha, rotation, rotateAroundX = 0, rotateAroundY = 0){
		c.save();
		c.translate(X+W/2+shakePos[0], Y+H/2+shakePos[1]);
		c.rotate(rotation);
		c.translate(-X-W/2-shakePos[0], -Y-H/2-shakePos[1]);

		this.drawImg(X,Y, W*scale, H*scale, alpha);
		c.restore();
	}
}
class spriteSheet{
    constructor(src,wofsprite,hofsprite,animationTimer,x,y,w,h){
        this.img = new Image();
        this.img.src = src;
        this.w = wofsprite;
        this.h = hofsprite;
        this.sheetW = this.img.width;
        this.sheetH = this.img.height;
        this.fps = animationTimer;
        this.sheetX = 0;
        this.sheetY = 0;
        this.x = x;
        this.y = y;
        this.states = {};
        this.state = "";
        this.timer = 0;
        this.draww = w;
        this.drawh = h;
    }
    draw(alpha = 1,rotation = false){
        c.save();
        c.imageSmoothingEnabled = false;
        c.webkitImageSmoothingEnabled = false;
        c.mozImageSmoothingEnabled = false;
        if(this.sheetX > this.states[this.state][1]*this.draww-this.draww){
            this.sheetX = 0;
		}
		c.globalAlpha = alpha;
		if(rotation){
			c.translate(this.x+this.draww/2+shakePos[0],this.y+this.drawh/2+shakePos[1]);
			c.rotate(rotation);
			c.translate(-this.x-this.draww/2-shakePos[0],-this.y-this.drawh/2-shakePos[1])
		}
		
        c.drawImage(this.img,this.sheetX,this.states[this.state][0],this.w,this.h,this.x*scale+shakePos[0],this.y*scale+shakePos[1],this.draww*scale,this.drawh*scale);
        c.restore();
    }
    addState(statename,correspondingLine,numofframes){
        this.states[statename] = [correspondingLine*this.h-this.h,numofframes];
        this.state = statename;
    }
    frameCalc(startingframe){
        this.timer++;
        if (this.timer > this.fps){
            this.timer = 0;
            this.sheetX+=this.w;
            if(this.sheetX >= this.states[this.state][1]*this.w){
                this.sheetX = startingframe*this.w-this.w;
            }
        }
    }
}
//Ethan's Stuff//
function arrayRemove(arr, value) { //Idk I just like this
    return arr.filter(function(ele){
        return ele != value;
    });
}
function drawLine(x1,y1,x2,y2,col,alpha=1){ //Drawing shit I like
    c.globalAlpha = alpha;
    c.beginPath();
    c.strokeStyle = col;
    c.moveTo(x1*scale+shakePos[0],y1*scale+shakePos[1]);
    c.lineTo(x2*scale+shakePos[0],y2*scale+shakePos[1]);
	c.stroke();
    c.globalAlpha = 1;
}
function drawRect(x,y,w,h,col,fill,fillcolor,alpha,outline = true){
    c.save();
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.rect(x*scale+shakePos[0],y*scale+shakePos[1],w*scale,h*scale);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
	}
	if(outline){
		c.stroke();
	}
    c.restore();
}
function drawCircle(x,y,r,col,fill,fillcolor,alpha){
    c.save();
    c.strokeStyle = col;
    c.globalAlpha = alpha;
    c.beginPath();
    c.arc(x*scale+shakePos[0],y*scale+shakePos[1],r*scale,0,360,false);
    if (fill){
        c.fillStyle = fillcolor;
        c.fill();
    }
    c.stroke();
    c.closePath();
    c.restore();
}
function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4){ //returns [x,y] of intersection, if there is no intersection then return false
	var den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
	if(den == 0){return false}
	var t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
	var u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
	if(t > 0 && t < 1 && u > 0){
		var x = x1 + t * (x2 - x1);
		var y = y1 + t * (y2 - y1);
		return [x,y];
	}else{
		return false;
	}
}
//https://stackoverflow.com/questions/7837456/how-to-compare-arrays-in-javascript/14853974//
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;
    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

function AABBCollision(x1,y1,w1,h1,x2,y2,w2,h2){
    if (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2){
        return true;
    }else{
        return false;
    }
        
}