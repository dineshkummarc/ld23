// LD23 Game Code!

// Globals
var keys = {}; // Keys currently held
var mouseX = null; // Last known mouse position
var mouseY = null;
var click = null;
var loopCount = 0;
var canvas = null;
var context = null;
var sprites = {};
var lastFrame = 0;
var firing = false;
var planetRadius = 100;
// Game objects
var player = { angle: -Math.PI / 2 };
var aliens = [];
var bullets = [];
var explosions = [];

// Input
function keyup( event ){ delete keys[ event.which ]; }
function keydown( event ){
	keys[ event.which ] = true;
}
function onblur( event ){ keys = {}; firing = false; }
function mouseup( event ){ firing = false; }
function mousedown( event ){ firing = true; }
function mousemove( event )
{
	var posx = 0;
	var posy = 0;
	if (!event) var event = window.event;
	if (event.pageX || event.pageY) 	{
		posx = event.pageX;
		posy = event.pageY;
	}
	else if (event.clientX || event.clientY) 	{
		posx = event.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		posy = event.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}

	mouseX = posx;
	mouseY = posy;
}
function mouseout( event ){ mouseX = null; mouseY = null; firing = false; }


function draw()
{
	context.fillStyle = "black";
	context.fillRect( 0, 0, canvas.width, canvas.height );
	context.strokeStyle = "white";
	context.lineWidth = 1;
	context.beginPath();
	//context.moveTo( canvas.width / 2, canvas.height / 2 );
	//context.arc( canvas.width / 2, canvas.height / 2, 500, 0, Math.PI, true );
	context.arc( canvas.width / 2, ( canvas.height / 2 ) + planetRadius, planetRadius, 0, Math.PI * 2, true );
	context.stroke();
	context.closePath();

	context.drawImage( sprites.player, ( canvas.width / 2 ) - 4, ( canvas.height / 2 ) - 16 );

	for( var i in bullets )
	{
		var bullet = bullets[ i ];
		var x = ( canvas.width / 2 ) + bullet.radius * Math.cos( bullet.angle );
		var y = ( canvas.height / 2 ) + planetRadius + bullet.radius * Math.sin( bullet.angle );

		context.rotate( bullet.angle );
		context.drawImage( sprites.bullet, x, y );
		context.restore();
	}
}

function firePlayer()
{
	if( firing )
	{
		bullets.push( { angle: player.angle, radius: planetRadius, direction: 1 } );
	}
}

function moveBullets()
{
	for( var i in bullets )
	{
		bullets[ i ].radius += bullets[ i ].direction;
	}	
}

function movePlayer()
{
	if( keys[ "65" ] ) // A
	{
		player.angle -= Math.PI / 90;
	}

	if( keys[ "68" ] ) // D
	{
		player.angle += Math.PI / 90;
	}
}

// Main game
function init()
{
	lastFrame = new Date().getTime();

	// Set up
	canvas = document.getElementById( "game" );
	canvas.width = 1024;
	canvas.height = 768;
	context = canvas.getContext( "2d" );

	var spriteImage = document.getElementById( "sprites" );
	var spriteMap = { "player": [ 9, 16 ], "alien": [ 16, 16 ], "bullet": [ 1, 16 ] };
	var left = 0;

	for( var i in spriteMap )
	{
		var sprite = spriteMap[ i ];
		var tempCanvas = document.createElement( "canvas" );
		tempCanvas.width = sprite[ 0 ];
		tempCanvas.height = sprite[ 1 ];
		tempCanvas.getContext( "2d" ).drawImage( spriteImage, left, 0, sprite[ 0 ], sprite[ 1 ], 0, 0, sprite[ 0 ], sprite[ 1 ] );
		sprites[ i ] = tempCanvas;
		left += sprite[ 0 ];
	}

	title();
}

function title()
{
	context.drawImage( document.getElementById( "title-image" ), 0, 0 );
	window.onkeydown = function(){ start() };
}

function start()
{
	window.onkeyup = keyup;
	window.onkeydown = keydown;
	window.onblur = onblur;
	window.onmouseup = mouseup;
	window.onmousedown = mousedown;
	canvas.onmousemove = mousemove;
	canvas.onmouseout = mouseout;

	loop();
}

function loop()
{
//	var thisFrame = new Date().getTime();
//	console.log( thisFrame - lastFrame );
//	lastFrame = thisFrame;
	requestAnimationFrame( loop );

	movePlayer();
	firePlayer();
//	moveAliens();
//	fireAliens();
	moveBullets();
	draw();

	if( ++loopCount >= 1 )
	{
		loopCount = 0;
	}

}


// requestAnimationFrame polyfill - http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = 
		  window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
			  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
})();