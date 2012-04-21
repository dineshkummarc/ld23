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
var sounds = {};
var lastFrame = 0;
var fired = false;
var planetRadius = 100;
var screenRadius = 0;
var frameId = null;
var timeoutId = [];
var dead = false;
var score = 0;
var playerAnimFrame = 0;
var spawnRate = 400; // 400 frames per spawn
var spawnCount = 1; // 1 enemy per spawn
var highScores = [];
var playerName = "wibblymat";

// Game objects
var player = { angle: 0 };
var aliens = {};
var bullets = {};
var explosions = {};
var stars= [];
var nextId = 0;

// Data
//var types = 

var waves = [
	[ 1 ],
	[ 1 ],
	[ 2 ],
	[ 5 ],
	[ 7 ]
];

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

	context.font = "36pt Courier New"
	context.textAlign = "left";
	context.textBaseline = "top";
	context.fillStyle = "white";
	context.fillText( "SCORE: " + score, 10, 10 );

	context.fillText( "Rate: " + spawnRate, 10, 50 );
	context.fillText( "Count: " + spawnCount, 10, 90 );

	context.save();
	context.translate( canvas.width / 2, canvas.height / 2 );

	context.drawImage( sprites.player[ playerAnimFrame ], - 4, -planetRadius -16 );

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
		context.drawImage( sprites.alien[ 0 ], -8, -8 );
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
		playSound( "pew" );
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
		else if( bullet.direction < 0 && distance( bullet, { radius: planetRadius + 21, angle: -player.angle } ) < 5 )
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
	score += aliens[ id ].score;
	delete aliens[ id ];
	// Score/SFX/explosion go here
	playSound( "explosion" );
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
	playerAnimFrame = Math.floor( loopCount / 20 ) % 2;

	if( keys[ "65" ] ) // A
	{
		player.angle += Math.PI / 90;
	}
	else if( keys[ "68" ] ) // D
	{
		player.angle -= Math.PI / 90;
	}
	else
	{
		playerAnimFrame = 2;
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
	var play = false;

	for( var i in aliens )
	{
		play = true;
		bullets[ nextId++ ] = { angle: aliens[ i ].angle, radius: aliens[ i ].radius, direction: -1 };
	}

	if( play ) playSound( "pew" );
}

function spawnAliens()
{
	spawnRate -= spawnRate * 0.05;

	if( spawnRate < 200 )
	{
		spawnRate = 400;
		spawnCount++;
	}

	for( var i = 0; i < spawnCount; i++ )
	{
		aliens[ nextId++ ] = { radius: screenRadius, angle: Math.random() * Math.PI * 2, score: 100 };
	}
}

function gameOver()
{
	window.onkeydown = null; canvas.onmouseup = null;

	cancelAnimationFrame( frameId );
	window.onkeyup = null;
	createTimeout( function(){ window.onkeydown = showScores; canvas.onmouseup = showScores; }, 1000 );
	window.onblur = null;
	window.onmousedown = null;
	canvas.onmousemove = null;
	canvas.onmouseout = null;

	playSound( "you-suck" );

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

function loadScores()
{
	if( canStore() )
	{
		scores = localStorage.getItem( "scores" );

		if( scores != null ) highScores = JSON.parse( scores );
	}
}

function saveScores()
{
	if( canStore() )
	{
		localStorage.setItem( "scores", JSON.stringify( highScores ) );
	}
}

function canStore()
{
	return typeof window.localStorage != "undefined" && window.localStorage != null;
}

function cancelTimeout()
{
	clearTimeout( timeoutId );
}

function createTimeout( callback, time )
{
	cancelTimeout();
	timeoutId = setTimeout( callback, time );
}

function showScores()
{
	window.onkeydown = null; canvas.onmouseup = null;
	if( frameId != null )
	{
		cancelAnimationFrame( frameId );
	}

	cancelTimeout();

	highScores.push( { name: playerName, score: score } );

	highScores.sort( function( a, b ){ return b.score - a.score; } )

	// Hmm, how do we know where we were inserted?

	var lookup = highScores[ 0 ];
	var index = 0;
	var found = null;

	while( lookup.score >= score && index < highScores.length )
	{
		lookup = highScores[ index ];

		if( lookup.name == playerName )
		{
			found = index;
		}

		index++;
	}

	var bottom = Math.min( found + 5, highScores.length );
	var top = bottom - 10;

	if( top < 0 )
	{
		top = 0;
		bottom = Math.min( top + 10, highScores.length );
	}

	context.fillStyle = "black";
	context.fillRect( 0, 0, canvas.width, canvas.height );
	context.font = "20pt Courier New";

	context.fillStyle = "white";

	var centre = canvas.width / 2;

	for( var i = 0; i < bottom - top; i++ )
	{
		var highScore = highScores[ i + top ];
		context.fillText( ( i + top + 1 ), 50, 30 * ( 1 + i ) );
		context.fillText( highScore.name, centre - 50 - context.measureText( highScore.name ).width, 30 * ( 1 + i ) );
		context.fillText( highScore.score, centre + 50, 30 * ( 1 + i ) );
	}

	saveScores();

	createTimeout( function(){ window.onkeydown = init; canvas.onmouseup = init; }, 1000 );
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
	var spriteMap = { "alien": [ 16, 16, 1 ], "player": [ 6, 16, 3 ] };
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
		sprites[ i ] = [];
		for( var j = 0; j < sprite[ 2 ]; j++ )
		{
			var tempCanvas = document.createElement( "canvas" );
			tempCanvas.width = sprite[ 0 ];
			tempCanvas.height = sprite[ 1 ];
			tempCanvas.getContext( "2d" ).drawImage( spriteImage, left, 0, sprite[ 0 ], sprite[ 1 ], 0, 0, sprite[ 0 ], sprite[ 1 ] );
			sprites[ i ][ j ] = tempCanvas;
			left += sprite[ 0 ];
		}
	}

	sounds[ "you-suck" ] = document.getElementById( "you-suck-sound" );
	sounds[ "pew" ] = document.getElementById( "pew-sound" );
	sounds[ "explosion" ] = document.getElementById( "explosion-sound" );

	document.getElementById( "loading" ).style.display = "none";

	loadScores();

	init();
}

function init()
{
	if( frameId != null )
	{
		cancelAnimationFrame( frameId );
	}

	cancelTimeout();

	// Initialise all the things!
	keys = {}; // Keys currently held
	mouseX = null; // Last known mouse position
	mouseY = null;
	click = null;
	loopCount = 0;
	fired = false;
	dead = false;
	score = 0;
	spawnRate = 400;
	spawnCount = 1;

	// Game objects
	player = { angle: 0 };
	aliens = {};
	bullets = {};
	explosions = {};
	nextId = 0;

	lastFrame = new Date().getTime();

	title();
}

function title()
{
	window.onkeydown = null; canvas.onmouseup = null;
	var image = document.getElementById( "title-image" );
	context.drawImage( image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height );

	createTimeout( function(){ window.onkeydown = start; canvas.onmouseup = start; }, 1000 );
}

function start()
{
	cancelTimeout();

	window.onkeyup = keyup;
	window.onkeydown = keydown;
	window.onblur = onblur;
	canvas.onmouseup = mouseup;
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

		if( mod( loopCount, Math.floor( spawnRate ) ) == 0 )
		{
			spawnAliens();
		}

		loopCount++;
		draw();
	}
}

function playSound( name )
{
	var audio = new Audio();
	audio.src = sounds[ name ].src;
	audio.play();
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