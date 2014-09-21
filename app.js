/******************************** VARIABLE DEFINITIONS *********************/
//Constants
var row = 26, col =26;
var EMPTY = 0, SNAKE = 1, FOOD = 2, NUMNUM = 3;

//Directions
var UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3;

//Key states
var KEY_LEFT = 37 , KEY_UP = 38, KEY_RIGHT = 39, KEY_DOWN = 40;

//Game objects
var canvas, ctx,keystate, frames, score;

// All var for numnum
var startTime, currTime, numx = 0, numy = 0;

//Food pictures
var cherry  = new  Image();
cherry.src = "cherries.png";

var grapes = new Image();
grapes.src = "grapes.jpeg";

//Main variables
var grid ={

	width: null,
	height: null,
	_grid: null,

	init: function(d,c,r){
		this.width = col;
		this.height = row;

		this._grid =[];

		for (var i = 0; i < col; i++) {
			this._grid.push([]);
			for (var j = 0; j < row; j++) {
				this._grid[i].push(d);
				};			
			};
	},

	set: function( val, x, y ){
		this._grid[x][y] = val;
	},

	get: function( x,y ) {
		return this._grid[x][y];
	},

}

var snake = {

	direction: null,
	last: null,
	_queue: null,

	init: function( d,x,y){
		this.direction = d;

		this._queue = [];
		this.insert(x,y);

	},

	insert: function(x, y ){
		this._queue.unshift({x:x, y:y});
		this.last = this._queue[0];

	},

	remove: function(){
		return this._queue.pop();
	}

}


/****************** FUNCTION DEFINITIONS **********************/


function setFood( type ) {
var empty = [];
	for (var i = 0; i < grid.width; i++) {
		for (var j = 0; j < grid.height; j++) {
			if( grid.get(i,j) == EMPTY ){
				empty.push({x:i, y:j});
			}
		}	

	}
	var randpos = empty[Math.floor(Math.random()*empty.length)];
	grid.set( type, randpos.x, randpos.y);
	return randpos;
}

function getKey()
{
	keystate = [];
	document.addEventListener( "keydown" , function( evt ) {
		keystate[evt.keyCode] = true;
	} );
	document.addEventListener( "keyup" , function( evt ) {
		delete keystate[evt.keyCode];
	} );
}

function createCanvas()
{
	canvas = document.createElement("canvas");
	canvas.classList.add("grid");
	canvas.width = col*20;
	canvas.height = row*20;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);
}

function init() {
	grid.init( EMPTY, col, row);
	score = 0;
	var sp = { x:Math.floor(col/2), y:row -1}; 
	snake.init( LEFT, sp.x, sp.y);
	grid.set( SNAKE, sp.x, sp.y );
	setFood( FOOD );
}

function loop() {

	update();
	draw();

	window.requestAnimationFrame( loop, canvas );
}

function update() {
	
	frames++ ;
	
	//change direction of the snake
	if (keystate[KEY_LEFT] && snake.direction != RIGHT) { snake.direction = LEFT; }
	if (keystate[KEY_RIGHT] && snake.direction != LEFT ) { snake.direction = RIGHT; }
	if (keystate[KEY_DOWN] && snake.direction != UP) { snake.direction = DOWN; }
	if (keystate[KEY_UP] && snake.direction != DOWN) { snake.direction = UP; }

	//automatically move the snake
	if( frames%5 == 0){
		var nx = snake.last.x;
		var ny = snake.last.y;
		switch( snake.direction ){
			case LEFT:
				if(nx<=0) {nx = (col - nx -1 )%col;}
				else { nx = (nx - 1 )%col;}
				break;
			case RIGHT:
				nx = (nx+1)%col;
				break;
			case UP:
				if(ny<=0) {ny = (row - ny -1 )%row;}
				else { ny = (ny - 1 )%row;}
				break;
			case DOWN:
				ny = (ny + 1 )%row;			
				break;
		}

		
	//Move snake based on food/snake/empty

		//if FOOD/NUMNUM
		if( (grid.get(nx,ny) == FOOD) ||( grid.get(nx,ny) == NUMNUM ) )
		{
			var tail = {x:nx, y:ny};

			if(grid.get(nx,ny) == NUMNUM) { score = score +2 ;}
			else{ score++; }

			if( score%5 == 0) {
				foodPos = setFood( NUMNUM ); 

				startTime = new Date().getTime() / 1000;

				numx = foodPos.x;
				numy = foodPos.y;

				}
			else{ setFood( FOOD ); }
		}

		// if snake has suicidal tendencies - kill the snake
		else if( grid.get(nx,ny) == SNAKE )
		{
			init();
			var tail = snake.remove();
		}

		// if nothing, just move on
		else
		{
			var tail = snake.remove();
			grid.set( EMPTY, tail.x, tail.y);
			tail.x = nx;
			tail.y = ny;
		}

	//Remove numnum if > 3s and set normal food item
		currTime = new Date().getTime() / 1000;

		if( grid.get(numx,numy) == NUMNUM )
		{
			if ( currTime - startTime >2 ){

				grid.set( EMPTY, numx, numy );
				setFood( FOOD );
			}
		}

	//finally set the SNAKE and GRID
		grid.set( SNAKE, tail.x, tail.y );
		snake.insert(tail.x, tail.y);
	}

}

function draw() {


	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;
	
	for (var i = 0; i < grid.width; i++) {
		for (var j = 0; j < grid.height; j++) {
			switch( grid.get(i,j)){

			case EMPTY:
				ctx.fillStyle = "#fff";
				ctx.fillRect(i*tw, j*th , tw,th);	
				break;
			case SNAKE:
				ctx.fillStyle = "#00F210";
				ctx.fillRect(i*tw, j*th , tw,th);
				break;
			case FOOD:
				ctx.drawImage(cherry,i*tw, j*th , tw,th );
  				break;
			case NUMNUM:
				ctx.drawImage(grapes,i*tw, j*th , tw,th );
				break;
			}
			
		}	
	}	
	ctx.fillStyle = "#000";
	ctx.font =  "12px Arial";
	ctx.fillText( ( "SCORE : " + score ) , 10 , ( canvas.height - 10 ) );
}

/************************ MAIN FUNCTION **********************/


function main() {

//create the main canvas
	createCanvas();

// init the main variables
	init();

// get the key pressed 	
	getKey();	

// Loopy the game
	frames =0;
	loop();

}

window.onload = main;
