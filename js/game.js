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
var fired = false;
var planetRadius = 100;
var screenRadius = 0;
var frameId = null;
var dead = false;
// Game objects
var player = { angle: 0 };
var aliens = {};
var bullets = {};
var explosions = {};
var stars= [];
var nextId = 0;

// Input
function keyup( event ){ delete keys[ event.which ]; }
function keydown( event ){
	keys[ event.which ] = true;
}
function onblur( event ){ keys = {}; firing = false; }
function mouseup( event ){ fired = true; }
function mousedown( event ){ }
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
	context.fillStyle = "rgb( 0, 0, 30 )";
	context.fillRect( 0, 0, canvas.width, canvas.height );
	context.strokeStyle = "white";
	context.lineWidth = 1;

	context.save();
	context.translate( canvas.width / 2, canvas.height / 2 );

	context.drawImage( sprites.player, - 4, -planetRadius -16 );

	context.rotate( player.angle );
	context.fillStyle = "rgb( 50, 255, 50 )";
	context.beginPath();
	context.arc( 0, 0, planetRadius, 0, Math.PI * 2, true );
	context.fill();
	context.closePath();

	for( var i in stars )
	{
		var star = stars[ i ];
		context.fillStyle = "white";
		context.strokeRect( star.x, star.y, 1, 1 );
	}

	for( var i in aliens )
	{
		var alien = aliens[ i ];
		var x = alien.radius * Math.cos( alien.angle - ( Math.PI / 2 ) );
		var y = alien.radius * Math.sin( alien.angle - ( Math.PI / 2 ) );

		context.save();
		context.translate( x, y );
		context.rotate( alien.angle );
		context.drawImage( sprites.alien, -8, -8 );
		context.restore();
	}

	for( var i in bullets )
	{
		var bullet = bullets[ i ];
		var x = bullet.radius * Math.cos( bullet.angle - ( Math.PI / 2 ) );
		var y = bullet.radius * Math.sin( bullet.angle - ( Math.PI / 2 ) );

		context.save();
		context.translate( x, y );
		context.rotate( bullet.angle );
		context.strokeStyle = "yellow";
		context.beginPath();
		context.moveTo( 0, 0 );
		context.lineTo( 0, 10 );
		context.stroke();
		context.closePath();
		//context.drawImage( sprites.bullet, 0, 0 );
		context.restore();
	}

	context.restore();
}

function mod( n, m )
{
	// JS bug means that -1 mod 4 is -1 rather than 3
	return ((n%m)+m)%m;
}

// Game logic

function firePlayer()
{
	if( fired )
	{
		bullets[ nextId++ ] = { angle: -player.angle, radius: planetRadius + 20, direction: 1 };
		fired = false;
	}
}

function moveBullets()
{
	for( var i in bullets )
	{
		var bullet = bullets[ i ]
		bullet.radius += bullet.direction * 2;
		if( bullet.radius < planetRadius || bullet.radius > screenRadius )
		{
			delete bullets[ i ] ;
		}
		else if( bullet.direction < 0 && distance( bullet, { radius: planetRadius + 26, angle: player.angle } ) < 2 )
		{
			dead = true;
		}
		else if( bullet.direction > 0 )
		{
			for( var j in aliens )
			{
				var alien = aliens[ j ];

				if( distance( bullet, alien ) < 8 )
				{
					destroyAlien( j );
				}
			}
		}
	}	
}

function destroyAlien( id )
{
	delete aliens[ id ];
	// Score/SFX/explosion go here
}

function distance( object1, object2 )
{
	var a = object1.radius;
	var b = object2.radius;
	var alpha = angleDiff( object1.angle, object2.angle );

	// Cosine rule
	return Math.sqrt( a*a + b*b - 2*a*b*Math.cos( alpha ) );
}

function angleDiff( angle1, angle2 )
{
	angle1 = mod( angle1, Math.PI * 2 );
	angle2 = mod( angle2, Math.PI * 2 );

	var diff = Math.abs( angle1 - angle2 );
	if( diff > Math.PI ) diff = ( Math.PI * 2 ) - diff;

	return diff;
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

function moveAliens()
{
	for( var i in aliens )
	{
		aliens[ i ].radius--;

		if( aliens[ i ].radius <= planetRadius + 8 )
		{
			dead = true;
		}
	}	
}

function fireAliens()
{
	for( var i in aliens )
	{
		bullets[ nextId++ ] = { angle: aliens[ i ].angle, radius: aliens[ i ].radius, direction: -1 };
	}	
}

function spawnAliens()
{
	aliens[ nextId++ ] = { radius: screenRadius, angle: Math.random() * Math.PI * 2 };
}

function gameOver()
{
	cancelAnimationFrame( frameId );
	window.onkeyup = null;
	window.onkeydown = function(){ init() };
	window.onblur = null;
	window.onmouseup = function(){ init() };
	window.onmousedown = null;
	canvas.onmousemove = null;
	canvas.onmouseout = null;

	gameOverLoop();
}

function gameOverLoop()
{
		frameId = requestAnimationFrame( gameOverLoop );

		var colours = [ "red", "orange", "yellow", "green", "blue", "indigo", "violet" ];

		for( var i = 0; i < canvas.height / 4; i++ )
		{
			var row = ( loopCount + ( i * 4 ) ) % canvas.height
			context.fillStyle = colours[ i % colours.length ];
			context.fillRect( 0, row, canvas.width, 4 );
		}

		loopCount++;

		context.drawImage( document.getElementById( "game-over-image" ), 0, 0 );
}


// Game loop and init
function initOnce()
{
	// Stuff in here only needs doing on first load, not just when a new game starts
	stars= [];
	sprites = {};

	// Set up
	canvas = document.getElementById( "game" );
	canvas.width = 1024;
	canvas.height = 768;
	context = canvas.getContext( "2d" );

	screenRadius = Math.sqrt( Math.pow( canvas.width / 2, 2 ) + Math.pow( canvas.height / 2, 2 ) );

	var spriteImage = document.getElementById( "sprites" );
	var spriteMap = { "player": [ 9, 16 ], "alien": [ 16, 16 ], "bullet": [ 1, 16 ] };
	var left = 0;

	var max = Math.pow( canvas.width / 2, 3 ) / 3

	for( var i = 0; i < 500; i++ )
	{
		var x = 0;
		var y = 0;
		var radius = 0;

		while( radius <= planetRadius )
		{
			x = ( Math.random() - 0.5 ) * canvas.width;
			y = ( Math.random() - 0.5 ) * canvas.width;
			radius = Math.floor(  Math.sqrt( x*x + y*y ) );
		}

		stars.push( { x: x, y: y } );
	}

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

	init();
}

function init()
{
	if( frameId != null )
	{
		cancelAnimationFrame( frameId );
	}

	// Initialise all the things!
	keys = {}; // Keys currently held
	mouseX = null; // Last known mouse position
	mouseY = null;
	click = null;
	loopCount = 0;
	fired = false;
	dead = false;

	// Game objects
	player = { angle: 0 };
	aliens = {};
	bullets = {};
	explosions = {};
	nextId = 0;

	lastFrame = new Date().getTime();

	//for( var i = 0; i < 10; i++ )
	//{
	//	aliens[ nextId++ ] = { radius: screenRadius, angle: i * ( Math.PI / 5 ) };
//	}

	aliens[ nextId++ ] = { radius: screenRadius, angle: 0 };

	title();
}

function title()
{
	context.drawImage( document.getElementById( "title-image" ), 0, 0 );
	window.onkeydown = function(){ start() };
	window.onmouseup = function(){ start() };
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
	if( dead )
	{
		gameOver();
	}
	else
	{
		frameId = requestAnimationFrame( loop );

		movePlayer();
		moveAliens();
		moveBullets();
		firePlayer();

		if( mod( loopCount, 90 ) == 0 )
		{
			fireAliens();
		}

		if( mod( loopCount, 300 ) == 0 )
		{
			spawnAliens();
		}

		loopCount++;
		draw();
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