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
var highScores = [];
var playerName = "wibblymat";
var level = 1;
var spawnRate = 200;
var bodyCount = 0;
var fireRadius = 300;
var damage = 40;
var maxDamage = 40;

// Game objects
var player = { angle: 0 };
var aliens = {};
var bullets = {};
var explosions = {};
var stars= [];
var nextId = 0;

// Data
var types = [
	{ fireRate: 150, type: 0, width: 64 },
	{ fireRate: 120, type: 1, width: 16 },
]

// Input
function keyup( event ){ delete keys[ event.which ]; }
function keydown( event ){
	keys[ event.which ] = true;
}
function onblur( event ){ keys = {}; firing = false; }
function mouseup( event ){ fired = true; event.preventDefault(); }
function mousedown( event ){ event.preventDefault(); }
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
		context.fillStyle = "rgb( 200, 200, 200 )";
		context.fillRect( star.x, star.y, 2, 2 );
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

	for( var i in aliens )
	{
		var alien = aliens[ i ];
		var x = alien.radius * Math.cos( alien.angle - ( Math.PI / 2 ) );
		var y = alien.radius * Math.sin( alien.angle - ( Math.PI / 2 ) );

		context.save();
		context.translate( x, y );
		context.rotate( alien.angle );
		context.drawImage( sprites.alien[ alien.type ], -alien.width / 2, -alien.height / 2 );
		context.restore();
	}

	for( var i in explosions )
	{
		var explosion = explosions[ i ];
		var x = explosion.radius * Math.cos( explosion.angle - ( Math.PI / 2 ) );
		var y = explosion.radius * Math.sin( explosion.angle - ( Math.PI / 2 ) );

		context.save();
		context.translate( x, y );
		context.rotate( explosion.angle );

		var colour = [ Math.floor( Math.random() * 256 ), Math.floor( Math.random() * 256 ), Math.floor( Math.random() * 256 ) ];
		context.strokeStyle = "rgb( " + colour[ 0 ] + ", " + colour[ 1 ] + ", " + colour[ 2 ] + " )";

		for( var j = 0; j < 11; j++ )
		{
			context.save();

			context.rotate( ( j / 11 ) * Math.PI * 2 );
			context.beginPath();
			context.moveTo( Math.max( explosion.frame - 20, 0 ), 0 );
			context.lineTo( Math.min( explosion.frame, 80 ), 0 );
			context.stroke();
			context.closePath();

			context.restore();
		}

		if( explosion.frame++ > 80 )
		{
			delete explosions[ i ];
		}

		context.restore();
	}

	context.restore();

	context.font = "36pt Impact"
	context.textAlign = "left";
	context.textBaseline = "top";
	context.fillStyle = "white";
	context.fillText( "SCORE: " + score, 10, 10 );

	context.fillText( "Level: " + level, 10, 50 );

	context.fillStyle = "red";
	context.strokeStyle = "white";
	context.lineWidth = 3;

	context.fillRect( canvas.width - ( ( damage + 1 ) * 10 ), 10, damage * 10, maxDamage );

	var cornerRadius = 8;

	context.beginPath();
	context.moveTo( canvas.width - ( 10 + maxDamage * 10 ) + cornerRadius, 10 );

	context.lineTo( canvas.width - 10 - cornerRadius, 10 ) // Top
	context.arcTo( canvas.width - 10, 10, canvas.width - 10, 10 + cornerRadius, cornerRadius ); // Top-right
	context.lineTo( canvas.width - 10, 50 - cornerRadius ) // Right
	context.arcTo( canvas.width - 10, 50, canvas.width - 10 - cornerRadius, 50, cornerRadius ); // Bottom-right
	context.lineTo( canvas.width - ( 10 + maxDamage * 10 ) + cornerRadius, 50 ) // Bottom
	context.arcTo( canvas.width - ( 10 + maxDamage * 10 ), 50, canvas.width - ( 10 + maxDamage * 10 ), 50 - cornerRadius, cornerRadius ); // Bottom-left
	context.lineTo( canvas.width - ( 10 + maxDamage * 10 ), 10 + cornerRadius ) // Left
	context.arcTo( canvas.width - ( 10 + maxDamage * 10 ), 10, canvas.width - ( 10 + maxDamage * 10 ) + cornerRadius, 10, cornerRadius ); // Top-left

	context.closePath();
	context.stroke();

	//context.strokeRect( canvas.width - 410, 10, 400, 40 );
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
		if( bullet.radius < planetRadius )
		{
			damage--;
			if( damage <= 0 ) dead = true;
			delete bullets[ i ] ;
		}
		else if( bullet.radius > screenRadius )
		{
			delete bullets[ i ] ;
		}
		else if( bullet.direction < 0 && collision( bullet, { radius: planetRadius + 8, angle: -player.angle, width: 8, height: 16 } ) )
		{
			dead = true;
		}
		else if( bullet.direction > 0 )
		{
			for( var j in aliens )
			{
				var alien = aliens[ j ];

				if( collision( bullet, alien ) )
				{
					destroyAlien( j );
				}
			}
		}
	}	
}

function destroyAlien( id )
{
	var nextLevel = ( level + 1 ) * ( level / 2 ) * 10;

	explosions[ nextId++ ] = { radius: aliens[ id ].radius, angle: aliens[ id ].angle, frame: 0 };

	bodyCount++;

	if( bodyCount > nextLevel )
	{
		level++;
		if( damage < maxDamage ) damage++;
	}

	score += ( aliens[ id ].score * level );
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

function collision( bullet, object )
{
	// Bullet is a point with angle, radius
	// Object is a solid with angle, radius, width, height
	// Object's angle and radius define CENTRE of object

	if( Math.abs( bullet.radius - object.radius ) > ( object.height / 2 ) )
	{
		// Get out with little calculation if we can
		return false;
	}

	var d = distance( bullet, object );

	if( d > object.width + object.height )
	{
		return false;
	}

	var theta = angleDiff( bullet.angle, object.angle );

	var alpha = Math.asin( bullet.radius * Math.sin( theta ) / d );
	if( alpha > Math.PI ) alpha = Math.PI - alpha;

	var x = d * Math.sin( alpha );
	var y = d * Math.cos( alpha );

	return ( x < object.width / 2 ) && ( y < object.height / 2 );
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
	if( keys[ "32"] )
	{
		pause(); return;
	}

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
		if( aliens[ i ].radius < fireRadius && loopCount % aliens[ i ].fireRate == 0 )
		{
			play = true;
			bullets[ nextId++ ] = { angle: aliens[ i ].angle, radius: aliens[ i ].radius, direction: -1 };
		}
	}

	if( play ) playSound( "pew" );
}

function spawnAliens()
{
	var spawnCount = Math.ceil( level );

	for( var i = 0; i < spawnCount; i++ )
	{
		aliens[ nextId++ ] = { radius: screenRadius, angle: Math.random() * Math.PI * 2, score: 100, type: 0, fireRate: 120, width: 64, height: 16 };
	}
}

function gameOver()
{
	window.onkeydown = null; canvas.onmouseup = null;

	cancelAnimationFrame( frameId );
	window.onkeyup = null;
	createTimeout( function(){ window.onkeydown = showScores; canvas.onmouseup = showScores; }, 1000 );
	window.onblur = null;
	canvas.onmousedown = null;
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

	if( score > 0 && ( highScores.length < 20 || score > highScores[ 19 ].score ) )
	{
		playerName = prompt( "High Score! What is your name?", playerName );

		highScores.push( { name: playerName, score: score } );

		highScores.sort( function( a, b ){ return b.score - a.score; } )

		while( highScores.length > 20 ) highScores.pop();
	}

	// Hmm, how do we know where we were inserted?

	var lookup = highScores[ 0 ];
	var index = 0;
	var found = highScores.length + 1;

	while( lookup.score >= score && index < highScores.length )
	{
		lookup = highScores[ index ];

		if( lookup.score == score && lookup.name == playerName )
		{
			found = index;
		}

		index++;
	}

	var	bottom = Math.min( 20, highScores.length );

	context.fillStyle = "black";
	context.fillRect( 0, 0, canvas.width, canvas.height );
	context.font = "32pt Impact";

	var centre = canvas.width / 2;

	context.fillStyle = "yellow";

	context.fillText( "HIGH SCORES", centre - ( context.measureText( "HIGH SCORES" ).width / 2 ), 30 )

	context.font = "20pt Impact";

	for( var i = 0; i < bottom; i++ )
	{
		if( i == found )
		{
			context.fillStyle = "yellow";
		}
		else
		{
			context.fillStyle = "white";
		}

		var highScore = highScores[ i ];
		context.fillText( ( i + 1 ), centre - 150 - context.measureText( ( i + 1 ) ).width, 30 * ( 3 + i ) );
		context.fillText( highScore.name, centre - ( context.measureText( highScore.name ).width / 2 ), 30 * ( 3 + i ) );
		context.fillText( highScore.score, centre + 150, 30 * ( 3 + i ) );
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
	var spriteMap = { "alien": [ 64, 16, 1 ], "player": [ 6, 16, 3 ] };
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

	sounds[ "you-suck" ] = { next: 0, channels: [] };
	sounds[ "pew" ] = { next: 0, channels: [] };
	sounds[ "explosion" ] = { next: 0, channels: [] };

	var audio = null;

	for( var i = 0; i < 5; i++ )
	{
		audio = new Audio();
		audio.src = document.getElementById( "you-suck-sound" ).src;
		sounds[ "you-suck" ].channels.push( audio );

		audio = new Audio();
		audio.src = document.getElementById( "pew-sound" ).src;
		sounds[ "pew" ].channels.push( audio );

		audio = new Audio();
		audio.src = document.getElementById( "explosion-sound" ).src;
		sounds[ "explosion" ].channels.push( audio );
	}

	document.getElementById( "loading" ).style.display = "none";

	loadScores();

	if( highScores.length == 0 )
	{
		highScores = [
			{ name: "wibblymat", score: 1000 },
			{ name: "wibblymat", score: 900 },
			{ name: "wibblymat", score: 800 },
			{ name: "wibblymat", score: 700 },
			{ name: "wibblymat", score: 600 },
			{ name: "wibblymat", score: 500 },
			{ name: "wibblymat", score: 400 },
			{ name: "wibblymat", score: 300 },
			{ name: "wibblymat", score: 200 },
			{ name: "wibblymat", score: 100 },
		];
	}

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
	level = 1;
	spawnRate = 300;
	bodyCount = 0;
	damage = maxDamage;


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
	if( frameId != null )
	{
		cancelAnimationFrame( frameId );
	}

	cancelTimeout();

	window.onkeyup = keyup;
	window.onkeydown = keydown;
	window.onblur = onblur;
	canvas.onmouseup = mouseup;
	canvas.onmousedown = mousedown;
	canvas.onmousemove = mousemove;
	canvas.onmouseout = mouseout;

	loop();
}

function pause()
{
	window.onkeydown = null; canvas.onmouseup = null;

	if( frameId != null )
	{
		cancelAnimationFrame( frameId );
	}

	cancelTimeout();

	var colour = [ Math.floor( Math.random() * 256 ), Math.floor( Math.random() * 256 ), Math.floor( Math.random() * 256 ) ];

	for( var x = 0; x < canvas.width / 2; x++ )
	{
		for( var i in colour )
		{
			var change = Math.ceil( Math.random() * 9 ) - 5;
			colour[ i ] = colour[ i ] + change;
			if( colour[ i ] < 0 ) colour[ i ] = 0;
			if( colour[ i ] > 255 ) colour[ i ] = 255;
		}

		pauseStripes[ x ] = "rgba( " + colour[ 0 ] + ", " + colour[ 1 ] + ", " + colour[ 2 ] + ", 0.5 )";
	}

	for( var x = 0; x < canvas.width / 2; x++ )
	{
		pauseStripes[ x + ( canvas.width / 2 ) ] = pauseStripes[ ( canvas.width / 2 - x ) ];
	}

	window.onkeydown = start; canvas.onmouseup = start;

	pauseLoop();
}

var pauseStripes = [];
var pauseLoopCount = 0;

function pauseLoop()
{
	frameId = requestAnimationFrame( pauseLoop );
	context.fillRect( 0, 0, canvas.width, canvas.height );

	for( var x = 0; x < canvas.width; x++ )
	{
		context.fillStyle = pauseStripes[ ( x + pauseLoopCount ) % canvas.width ];
		context.fillRect( x, 0, 1, canvas.height );
	}

	pauseLoopCount++;

	context.drawImage( document.getElementById( "intermission-image" ), 0, 0 );
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
		fireAliens();

		if( mod( loopCount, spawnRate ) == 0 )
		{
			spawnAliens();
		}

		loopCount++;
		draw();
	}
}

function playSound( name )
{
	var sound = sounds[ name ];
	var next = sound.next++ % sound.channels.length;

	sound.channels[ next ].play();
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