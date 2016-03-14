$(document).ready(function() {
	dBug("Document is ready!");

	var canvas = $("#myCanvas");
	var context = canvas.get( 0).getContext("2d");

	// Canvas dimensions
	var canvasWidth = canvas.width();
	var canvasHeight = canvas.height();

	// Game settings
	var playGame;

	var arrowUp = 38;
	var arrowRight = 39;
	var arrowDown = 40;
	var space = 32;

	// Asteroid object
	var asteroids;
	var numAsteroids;

	var Asteroid = function(x, y, radius, vX) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
	};

	var Player = function(x, y) {
		this.x = x;
		this.y = y;
		this.width = 24;
		this.height = 24;
		this.halfWidth = this.width/2;
		this.halfHeight = this.height/2;

		this.vX = 0;
		this.vY = 0;

		this.moveRight = false;
		this.moveUp = false;
		this.moveDown = false;
		this.flameLength = 20;
	};

	var Bullet = function(x, y, radius, vX, isFlying) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
		this.isFlying = isFlying;
	}

	var score;
	var scoreTimeout;
	
	// Game UI
	var ui = $("#gameUI");
	var uiIntro = $("#gameIntro");
	var uiStats = $("#gameStats");
	var uiComplete = $("#gameComplete");
	var uiPlay = $("#gamePlay");
	var uiReset = $(".gameReset");
	var uiScore = $(".gameScore");
	var uiAsteroidScore = $(".asteroidScore")

	var soundBackground = $("#gameSoundBackground").get(0);
	var soundThrust = $("#gameSoundThrust").get(0);
	var soundDeath = $("#gameSoundDeath").get(0);

	// Reset and start the game
	function startGame() {
		// Reset game stats
		uiScore.html("0");
		uiAsteroidScore.html("0");
		uiStats.show();

		// Set up initial game settings
		playGame = false;

		// create asteroids
		asteroids = new Array();

		numAsteroids = 10;


		// reset score
		score = 0;
		asteroidscore = 0;

		// create player
		player = new Player(150, canvasHeight/2);

		// create bullet
		bullet = new Bullet(-5,-5,3,0,false);

		// putting random asteroids into the array now
		for (var i = 0; i < numAsteroids; i++) {
			var radius = 5+(Math.random()*10);
			var x = canvasWidth+radius+Math.floor(Math.random()*canvasWidth);
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);

			asteroids.push(new Asteroid(x,y,radius,vX));
		};

		$(window).keydown(function(e) {
			var keyCode = e.keyCode;

			if (!playGame) { //starts game when presses a button
				playGame = true;
				soundBackground.currentTime = 0;
				soundBackground.play();
				animate();
				timer();
			};

			if (keyCode == arrowRight) {
				player.moveRight = true;
					// play thrust sound
					if (soundThrust.paused) {
						soundThrust.currentTime = 0;
						soundThrust.play();
					};

			} else if (keyCode == arrowUp) {
				player.moveUp = true;
			} else if (keyCode == arrowDown) {
				player.moveDown = true;
			} else if (keyCode == space) {
				player.space = true;
			}
		});

		$(window).keyup(function(e) {

			var keyCode = e.keyCode;

			if (keyCode == arrowRight) {
				player.moveRight = false;
				soundThrust.pause();
			} else if (keyCode == arrowUp) {
				player.moveUp = false;
			} else if (keyCode == arrowDown) {
				player.moveDown = false;
			} else if (keyCode == space) {
				player.space = false;
				dBug("false");
			};
		});

		// Start Animation loop
		animate();
	};

	// Initialize the game enviroment
	function init() {
		uiStats.hide();
		uiComplete.hide();

		uiPlay.click(function(e) { // when play button clicked
			e.preventDefault();
			uiIntro.hide();
			startGame();
		});

		uiReset.click(function(e) {
			e.preventDefault();
			uiComplete.hide();

			$(window).unbind("keyup");
			$(window).unbind("keydown");

			soundThrust.pause();
			soundBackground.pause();
			clearTimeout(scoreTimeout);
			startGame();
			dBug("reset clicked");
		});
	};

	// keep track of time passed
	function timer() {
		if (playGame) {
			scoreTimeout = setTimeout(function() {
				uiScore.html(++score);

				if (score % 5 == 0) {
					numAsteroids += 5;
				};

				timer();
			}, 1000);
		};
	};

	// Animation loop
	function animate() {
		// Clear
		context.clearRect(0, 0, canvasWidth, canvasHeight);

		var asteroidsLength = asteroids.length;

		for (var i = 0; i < asteroidsLength; i++) {
			var tmpAsteroid = asteroids[i];

			tmpAsteroid.x += tmpAsteroid.vX; // change coords of roids

			//recycle asteroids when they are canvas x < 0
			if (tmpAsteroid.x+tmpAsteroid.radius < 0) {
				tmpAsteroid.radius = 5+(Math.random()*10);
				tmpAsteroid.x = canvasWidth+tmpAsteroid.radius;
				tmpAsteroid.y = Math.floor(Math.random()*canvasHeight);
				tmpAsteroid.vX = -5-(Math.random()*5);
			}

			// Check if asteroid collides the player
			var dX = player.x - tmpAsteroid.x;
			var dY = player.y - tmpAsteroid.y;
			var distance = Math.sqrt((dX*dX)+(dY*dY));

			// kill player if collides
			if (distance < player.halfWidth+tmpAsteroid.radius) {
				soundThrust.pause();

				soundDeath.currentTime = 0;
				soundDeath.play();

				// Game over
				playGame = false;
				clearTimeout(scoreTimeout);
				uiStats.hide();
				uiComplete.show();

				soundBackground.pause();

				$(window).unbind("keyup");
				$(window).unbind("keydown");
			};

			// Check if bullet collides the asteroid
			var dXb = bullet.x - tmpAsteroid.x;
			var dYb = bullet.y - tmpAsteroid.y;
			var distanceb = Math.sqrt((dXb*dXb)+(dYb*dYb));

			if (distanceb < bullet.radius+tmpAsteroid.radius) {
				dBug("bullethit");

				// reset asteroid
				asteroidscore += Math.floor(5 * tmpAsteroid.radius);
				tmpAsteroid.radius = 5+(Math.random()*10);
				tmpAsteroid.x = canvasWidth+tmpAsteroid.radius;
				tmpAsteroid.y = Math.floor(Math.random()*canvasHeight);
				tmpAsteroid.vX = -5-(Math.random()*5);

				// move bullet offscreen
				bullet.x = -5;
				bullet.y = -5;
				bullet.vX = 0;
				bullet.isFlying = false;

				uiAsteroidScore.html(++asteroidscore);
			};


			context.fillStyle = "rgb(255, 255, 255)";
			context.beginPath();
			context.arc(tmpAsteroid.x, tmpAsteroid.y, tmpAsteroid.radius, 0, Math.PI*2, true);
			context.closePath();
			context.fill();
		};

	// Animating bullets
		bullet.x += bullet.vX; // make it fly

		//recycle bullet when it's at x > canvas.width
		if (bullet.x+bullet.radius > canvasWidth) {
			dBug("out");
			bullet.x = -5;
			bullet.y = -5;
			bullet.vX = 0;
			bullet.isFlying = false;
		}

		// increase bullet velocity
		if (player.space) { // player has pressed space
			if (!bullet.isFlying) { // if the bullet is not in the air
				bullet.vX = 10;
				bullet.x = player.x + player.halfWidth;
				bullet.y = player.y;
				bullet.isFlying = true;
			}
		}


		context.fillStyle = "rgb(0, 255, 0)";
		context.beginPath();
		context.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI*2, true);
		context.closePath();
		context.fill();

		player.vX = 0;
		player.vY = 0;

		if (player.moveRight) {
			player.vX = 3;
		} else {
			player.vX = -3;
		}

		if (player.moveUp) {
			player.vY = -3;
		};

		if (player.moveDown) {
			player.vY = 3;
		};

		player.x += player.vX;
		player.y += player.vY;

		if (player.x-player.halfWidth < 20 ) { // left-x coord boundary
			player.x = 20+player.halfHeight;
		} else if (player.x+player.halfWidth > canvasWidth-20) { // right-x coord boundary
			player.x = canvasWidth-20-player.halfWidth;
		}

		if (player.y-player.halfHeight < 20) { // top-y coord boundary
			player.y = 20+player.halfHeight;
		} else if (player.y+player.halfHeight > canvasHeight-20) { // bot-y coord boundary
			player.y = canvasHeight-20-player.halfHeight;
		}

		if (player.moveRight) {
			context.save();
			context.translate(player.x-player.halfWidth, player.y);

			if (player.flameLength == 20) { // flickers from big to small
				player.flameLength = 15;
			} else {
				player.flameLength = 20;
			};

			context.fillStyle = "orange";
			context.beginPath();
			context.moveTo(0, -5);
			context.lineTo(-player.flameLength,0);
			context.lineTo(0, 5);
			context.closePath();
			context.fill();

			context.restore();
		};

		context.fillStyle = "rgb(255,0,0)";//red
		context.beginPath();
		context.moveTo(player.x+player.halfWidth, player.y);
		context.lineTo(player.x-player.halfWidth, player.y-player.halfHeight);
		context.lineTo(player.x-player.halfWidth, player.y+player.halfHeight);
		context.closePath();
		context.fill();

		// Create random asteroids
		while (asteroids.length < numAsteroids) {
			var radius = 5+(Math.random()*10);
			var x = Math.floor(Math.random()*canvasWidth)+canvasWidth+radius;
			var y = Math.floor(Math.random()*canvasHeight);
			var vX = -5-(Math.random()*5);

			asteroids.push(new Asteroid(x, y, radius, vX));
		};


		if (playGame) {
			// Run again in 33 ms
			setTimeout (animate, 33);
		};
	};

	init();
	

	
	function dBug(data){
		console.log(data);
	};
});