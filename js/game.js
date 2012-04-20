// LD23 Base Code!

// Components
var controllable = {};
var rendered = {};
var pathing = {};
var positionable = {}; // Yucky name
var solid = {};
var attacker = {};
var viewport = {}; // Will only have one member but meh

// Globals
var keys = {}; // Keys currently held
var click = null;
var grid = {};
var nextId = 0;
var loopCount = 0;
var canvas = null;
var context = null;
var screenX = 0;
var screenY = 0;
var sprites = {};

// Systems
function controlSystem()
{
	if( click != null )
	{
		for( var id in controllable )
		{
			var path = { x: click.x, y: click.y, solid: false };
			if( typeof solid[ id ] != "undefined" ) path.solid = true;
			pathing[ id ] = path;
		}

		click = null;
	}
}

function viewportSystem()
{
	//Looping this makes no sense...
	for( var id in viewport )
	{
		var position = positionable[ id ];
		screenX = position.x;
		screenY = position.y;
	}
}

function renderSystem()
{
	context.clearRect( 0, 0, canvas.width, canvas.height );
	context.strokeRect( 0, 0, canvas.width, canvas.height );

	var left = screenX - ( canvas.width / 2 );
	var right = screenX + ( canvas.width / 2 );
	var top = screenY - ( canvas.height / 2 );
	var bottom = screenY + ( canvas.height / 2 );

	for( var id in rendered )
	{
		var item = rendered[ id ];
		var position = positionable[ id ];

		if( left < position.x && right > position.x && top < position.y && bottom > position.y )
		{
			context.drawImage( item.sprite, position.x - left, position.y - top );
		}
	}
}

function pathingSystem()
{
	for( var id in pathing )
	{
		var path = pathing[ id ];
		var position = positionable[ id ];
		var distance2 = Math.pow( path.y - position.y, 2 ) + Math.pow( path.x - position.x, 2 );

		if( distance2 > 25 ) // distance of 5
		{
			var direction = Math.atan2( path.y - position.y, path.x - position.x );

			position.x += ( 5 * Math.cos( direction ) );
			position.y += ( 5 * Math.sin( direction ) );

			positionable[ id ] = position;
		}
		else
		{
			position.x = path.x;
			position.y = path.y;
			delete pathing[ id ];
		}
	}	
}

// Input
function keyup( event ){ delete keys[ event.which ]; }
function keydown( event ){ keys[ event.which ] = true; }
function onblur( event ){ keys = {}; }
function mouseup( event ){  }
function mousedown( event ){ click = { x: event.offsetX + screenX - ( canvas.width / 2 ), y: event.offsetY + screenY - ( canvas.height / 2 ) } }
function mousemove( event ){  }
function mouseout( event ){  }


// Main game
function init()
{
	// Set up
	canvas = document.getElementById( "game" );
	canvas.width = 1024;
	canvas.height = 768;
	context = canvas.getContext( "2d" );

	var spriteImages = document.getElementById( "sprites" ).getElementsByTagName( "img" );

	for( var i = 0; i < spriteImages.length; i++ )
	{
		var image = spriteImages.item( i );
		sprites[ image.id ] = image;
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

	// Create the player
	var id = nextId++;
	controllable[ id ] = {};
	solid[ id ] = {};
	viewport[ id ] = {};
	rendered[ id ] = { sprite: sprites.player, rotation: 0 };
	positionable[ id ] = { x: screenX, y: screenY };

	id = nextId++;
	rendered[ id ] = { sprite: sprites.player, rotation: 0 };
	solid[ id ] = {};
	positionable[ id ] = { x: 200, y: 200 };

	loop();
}

function loop()
{
	requestAnimationFrame( loop );
	controlSystem();
	if( ++loopCount >= 1 )
	{
		pathingSystem();
		loopCount = 0;
	}
	viewportSystem();
	renderSystem();
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