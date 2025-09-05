// DinoGame.js - T-Rex Runner Game
export class DinoGame {
  constructor(containerElement, callbacks = {}) {
    this.containerElement = containerElement;
    this.callbacks = callbacks;
    this.gameInstance = null;
    this.init();
  }

  init() {
    // Tạo HTML structure cho game
    this.createGameStructure();
    
    // Khởi tạo Runner class
    setTimeout(() => {
      this.initRunner();
    }, 100);
  }

  createGameStructure() {
    this.containerElement.innerHTML = `
      <div id="main-frame-error" class="interstitial-wrapper">
        <div class="game-header" style="font-size: 24px; text-align: center; font-family: Arial; margin-bottom: 20px;">
          T-Rex Game
        </div>
        <div class="game-instruction" style="text-align: center; color: #8a8a8a; margin-bottom: 40px; font-size: 14px;">
          Nhấn "Space" để nhảy và bắt đầu game
        </div>
        <div id="offline-resources">
          <div id="offline-resources-1x">
            <img id="1x-obstacle-large" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAyCAMAAACJUtIoAAAACVBMVEX////39/dTU1OabbyfAAAAAXRSTlMAQObYZgAAAXhJREFUeF7t2NGqAjEMANGM///RlwvaYQndULuFPJgHUYaEI6IPhgNAOA8HZ+3U6384F5y1U6YzAZTWG+dZamnFEstBFtCKJZSHWMADLJ18z+JqpQeLdKoDC8siC5iFCQs4znIxB5B1t6F3lQWkL4N0JsF+u6GXJdbI+FKW+yWr3lhgCZ2VSag3Nlk/FnRkIRbasLCO0oulikMsvmGpeiGLZ1jOMgtIP5bODivYYUXEIVbwFCt4khVssRgsgidZwQaLd2A8m7MYLGTl4KeQQs2y4kMAMGGlmQViDIb5O6xZnnLD485dIBzqDSE1yyFdL4Iqu4XJqUUWl/NVAFSZq1P6a5aqbAUM2epQbBioWflUBABiUyhYyZoCBev8XyMAObDNOhOAfiyxmHU0YNlldGAphGjFCjA3YkUn1o/1Y3EkZFZ5isCC6NUgwDBn1RuXH96doNfAhDXfsIyJ2AnolcCVhay0kcYbW0HvCO8OwIcJ3GzkORpkFuUP/1Ec8FW1qJkAAAAASUVORK5CYII=" />
            <img id="1x-obstacle-small" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAAAjCAMAAABRlI+PAAAADFBMVEX////////39/dTU1PhglcSAAAAAXRSTlMAQObYZgAAAPNJREFUeF7tlkEKwzAMBLXr//+5iQhU7gRRQkyhZI+DhwH74jhmO+oIJBVwURljuAXagG5QqkSgBLqg3JnxJ1Cb8SmQ3o6gpO85owGlOB4m2BNKJ11BSd01owGlOHkcIAuHkz6UNpPKgozPM54dADHjJuNhZiJxdQCQgZJeBczgCAAy3yhPJvcnmdC9mZwBIsQMFV5AkzHBNknFgcKM+oyDIFcfCAoy03m+jSMIcmoVZkKqSjr1fghyahRmoKRUHYLiSI1SMlCq5CDgX6BXmKkfn+oQ0KEyyrzoy8GbXJ9xrM/YjhUZgl9nnsyTCe9rgSRdV15CwRcIEu8GGQAAAABJRU5ErkJggg==" />
            <img id="1x-cloud" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAOCAQAAAD6HOaKAAAAU0lEQVR4XrWSsQkAQAgD3X9El/ELixQpJHCfdApnUCtXz7o49cgagaGPaq4rIwAP9s/C7R7UX3inJ0BDb6qWDC7ScOR/QWjRlFizuPwLtTLj+qkH6DjD2wLtikUAAAAASUVORK5CYII=" />
            <img id="1x-text" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAL8AAAAYAgMAAADWncTDAAAABlBMVEX///9TU1NYzE1OAAAAAXRSTlMAQObYZgAAAO1JREFUeF690TFqxUAQA1BNoRtk7jMu3E9Auv9Vgr/5A863Y9zEhVhkHmhZsEGkw4Lppmllh1tcLHx+aRj2YnEDuQFvcQW+EoZY0TQLCZbEVxRxAvY+i8ikW0C0bwFdbictG2zvu/4EcCuBF0B23IBsQHZBYgm1n86BN+BmyV5rQFyCJAiDJSTfgBV9BbjvXdzIcKchpMOYd3gO/jvCeuUGFALg95J0/SrtQlrzz+sAjDwCIQsbWAdgbqrQpKYRjmPuAfU5dMC+c0rxOTiO+T6ZlK4pbcDLI1DIRaf3GxDGALkQHnD+cGhMKeox+AEOL3mLO7TQZgAAAABJRU5ErkJggg==" />
            <img id="1x-horizon" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABLAAAAAMAgMAAAAPCKxBAAAABlBMVEX///9TU1NYzE1OAAAAAXRSTlMAQObYZgAAALJJREFUeF7t1EEKAyEMhtEvMNm7sPfJEVyY+1+ltLgYAsrQCtWhbxEhQvgxIJtSZypxa/WGshgzKdbq/UihMFMlt3o/CspEYoihIMaAb6mCvM6C+BTAeyo+wN4yykV/6pVfkdLpVyI1hh7GJ6QunUoLEQlQglNP2nkQkeF8+ei9cLxMue1qxVRfk1Ej0s6AEGWfVOk0QUtnK5Xo0Lac6wpdtnQqB6VxomPaz+dgF1PaqqmeWJlz1jYUaSIAAAAASUVORK5CYII=" />
            <img id="1x-trex" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQgAAAAvAgMAAABiRrxWAAAADFBMVEX///9TU1P39/f///+TS9URAAAAAXRSTlMAQObYZgAAAPpJREFUeF7d0jFKRkEMhdGLMM307itNLALyVmHvJuzTDMjdn72E95PGFEZSmeoU4YMMgxhskvQec8YSVFX1NhGcS5ywtbmC8khcZeKq+ZWJ4F8Sr2+ZCErjkJFEfcjAc/6/BMlfcz6xHdhRthYzIZhIHMcTVY1scUUiAphK8CMSPUbieTBhvD9Lj0vyV4wklEGzHpciKGOJoBp7XDcFs4kWxxM7Ey3iZ8JbzASAvMS7XLOJHTTvEkEZSeQl7DMuwVyCasqK5+XzQRYLUJlMbPXjFcn3m8eKBSjWZMJwvGIOvViAzCbUj1VEDoqFOEQGE3SyInJQLOQMJL4B7enP1UbLXJQAAAAASUVORK5CYII=" />
            <img id="1x-restart" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAgCAQAAADQmBIFAAAAZklEQVR4Xu3WMQoAIAxDUe/Y+58jYwV1CwQJWQT5o/DAoaWjV2i/LRym/A5FjEsR41LPQchByEHwIVAEC4gZpghmSDP8egXpr/hQZaAKQFQe+pBOQAblDC336qrlPpSg0MEjInbWTLFFmwc8TpTAAAAAAElFTkSuQmCC" />
          </div>
        </div>
      </div>
    `;
  }

  initRunner() {
    // Khởi tạo Runner với callback
    const Runner = this.createRunnerClass();
    this.gameInstance = new Runner('.interstitial-wrapper', {
      onGameOver: this.callbacks.onGameOver
    });
  }

  createRunnerClass() {
    const self = this;
    
    // Định nghĩa các hằng số
    const DEFAULT_WIDTH = 600;
    const FPS = 60;
    const IS_HIDPI = window.devicePixelRatio > 1;
    const IS_MOBILE = window.navigator.userAgent.indexOf('Mobi') > -1;

    function Runner(outerContainerId, opt_config) {
      // Singleton pattern
      if (Runner.instance_) {
        return Runner.instance_;
      }
      
      Runner.instance_ = this;
      this.outerContainerEl = document.querySelector(outerContainerId);
      this.containerEl = null;
      this.config = opt_config || Runner.config;
      this.dimensions = Runner.defaultDimensions;
      
      // Game state
      this.canvas = null;
      this.canvasCtx = null;
      this.tRex = null;
      this.distanceMeter = null;
      this.distanceRan = 0;
      this.highestScore = 0;
      this.time = 0;
      this.runningTime = 0;
      this.msPerFrame = 1000 / FPS;
      this.currentSpeed = this.config.SPEED;
      this.obstacles = [];
      this.started = false;
      this.activated = false;
      this.crashed = false;
      this.paused = false;
      
      // Audio
      this.audioBuffer = null;
      this.soundFx = {};
      this.audioContext = null;
      
      // Images
      this.images = {};
      this.imagesLoaded = 0;
      
      this.loadImages();
      this.init();
    }

    // Runner config
    Runner.config = {
      ACCELERATION: 0.001,
      BG_CLOUD_SPEED: 0.2,
      BOTTOM_PAD: 10,
      CLEAR_TIME: 3000,
      CLOUD_FREQUENCY: 0.5,
      GAMEOVER_CLEAR_TIME: 750,
      GAP_COEFFICIENT: 0.6,
      GRAVITY: 0.6,
      INITIAL_JUMP_VELOCITY: 12,
      INVERT_FADE_DURATION: 12000,
      INVERT_DISTANCE: 700,
      MAX_BLINK_COUNT: 3,
      MAX_CLOUDS: 6,
      MAX_OBSTACLE_LENGTH: 3,
      MAX_OBSTACLE_DUPLICATION: 2,
      MAX_SPEED: 13,
      MIN_JUMP_HEIGHT: 35,
      MOBILE_SPEED_COEFFICIENT: 1.2,
      RESOURCE_TEMPLATE_ID: 'audio-resources',
      SPEED: 6,
      SPEED_DROP_COEFFICIENT: 3
    };

    Runner.defaultDimensions = {
      WIDTH: DEFAULT_WIDTH,
      HEIGHT: 150
    };

    Runner.events = {
      ANIM_END: 'webkitAnimationEnd',
      CLICK: 'click',
      KEYDOWN: 'keydown',
      KEYUP: 'keyup',
      MOUSEDOWN: 'mousedown',
      MOUSEUP: 'mouseup',
      RESIZE: 'resize',
      TOUCHEND: 'touchend',
      TOUCHSTART: 'touchstart',
      VISIBILITY: 'visibilitychange',
      BLUR: 'blur',
      FOCUS: 'focus',
      LOAD: 'load'
    };

    Runner.keycodes = {
      JUMP: {'38': 1, '32': 1},  // Up, Space
      DUCK: {'40': 1},  // Down
      RESTART: {'13': 1}  // Enter
    };

    // Các phương thức của Runner
    Runner.prototype = {
      loadImages: function() {
        // Sử dụng images từ HTML đã được tạo
        this.images.CACTUS_LARGE = document.getElementById('1x-obstacle-large');
        this.images.CACTUS_SMALL = document.getElementById('1x-obstacle-small');
        this.images.CLOUD = document.getElementById('1x-cloud');
        this.images.HORIZON = document.getElementById('1x-horizon');
        this.images.TEXT_SPRITE = document.getElementById('1x-text');
        this.images.TREX = document.getElementById('1x-trex');
        this.images.RESTART = document.getElementById('1x-restart');
        
        // Đánh dấu images đã load xong
        this.imagesLoaded = 7;
      },

      init: function() {
        this.adjustDimensions();
        this.setSpeed();
        
        // Container element
        this.containerEl = document.createElement('div');
        this.containerEl.className = 'runner-container';
        this.outerContainerEl.appendChild(this.containerEl);
        
        // Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.dimensions.WIDTH;
        this.canvas.height = this.dimensions.HEIGHT;
        this.canvas.className = 'runner-canvas';
        this.containerEl.appendChild(this.canvas);
        this.canvasCtx = this.canvas.getContext('2d');
        
        // Horizon with obstacles and clouds
        this.horizon = new Horizon(this.canvas, this.images, this.dimensions, this.config.GAP_COEFFICIENT);
        
        // T-rex
        this.tRex = new Trex(this.canvas, this.images.TREX);
        
        // Distance meter
        this.distanceMeter = new DistanceMeter(this.canvas, this.images.TEXT_SPRITE, this.dimensions.WIDTH);
        
        // Game over panel
        this.gameOverPanel = new GameOverPanel(this.canvas, this.images.TEXT_SPRITE, this.images.RESTART, this.dimensions);
        
        this.startListening();
        this.update();
      },

      adjustDimensions: function() {
        const boxStyles = window.getComputedStyle(this.outerContainerEl);
        const padding = Number(boxStyles.paddingLeft.substr(0, boxStyles.paddingLeft.length - 2));
        
        this.dimensions.WIDTH = this.outerContainerEl.offsetWidth - padding * 2;
        
        if (this.dimensions.WIDTH > DEFAULT_WIDTH) {
          this.dimensions.WIDTH = DEFAULT_WIDTH;
        }
      },

      setSpeed: function(opt_speed) {
        const speed = opt_speed || this.currentSpeed;
        if (IS_MOBILE) {
          this.currentSpeed = speed * this.config.MOBILE_SPEED_COEFFICIENT;
        } else {
          this.currentSpeed = speed;
        }
      },

      update: function() {
        this.updatePending = false;
        
        const now = new Date().getTime();
        let deltaTime = now - (this.time || now);
        this.time = now;
        
        if (this.activated) {
          this.clearCanvas();
          
          if (this.tRex.jumping) {
            this.tRex.updateJump(deltaTime);
          }
          
          this.runningTime += deltaTime;
          const hasObstacles = this.runningTime > this.config.CLEAR_TIME;
          
          // First jump triggers the intro.
          if (this.tRex.jumpCount === 1 && !this.playIntro) {
            this.playIntro();
          }
          
          // The horizon doesn't move until the intro is over.
          if (this.playingIntro) {
            this.horizon.update(0, this.currentSpeed, hasObstacles, false);
          } else {
            deltaTime = !this.started ? 0 : deltaTime;
            this.horizon.update(deltaTime, this.currentSpeed, hasObstacles, this.invertTimer > this.config.INVERT_FADE_DURATION);
          }
          
          // Check for collisions.
          let collision = hasObstacles && checkForCollision(this.horizon.obstacles[0], this.tRex);
          
          if (!collision) {
            this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
            
            if (this.currentSpeed < this.config.MAX_SPEED) {
              this.currentSpeed += this.config.ACCELERATION;
            }
          } else {
            this.gameOver();
          }
          
          this.distanceMeter.update(deltaTime, Math.ceil(this.distanceRan));
          
          if (this.invertTimer) {
            this.invertTimer += deltaTime;
          }
          
          // Draw the horizon, T-rex, and distance meter.
          this.horizon.draw();
          this.tRex.draw(this.tRex.xPos, this.tRex.yPos);
          this.distanceMeter.draw();
        }
        
        if (!this.crashed) {
          this.raq();
        }
      },

      clearCanvas: function() {
        this.canvasCtx.clearRect(0, 0, this.dimensions.WIDTH, this.dimensions.HEIGHT);
      },

      playIntro: function() {
        if (!this.started && !this.crashed) {
          this.playingIntro = true;
          this.tRex.playingIntro = true;
          
          // CSS animation definition.
          const keyframes = '@-webkit-keyframes intro { ' +
            'from { width:' + Trex.config.WIDTH + 'px; }' +
            'to { width: ' + this.dimensions.WIDTH + 'px; }' +
            '}';
          
          document.head.insertAdjacentHTML('beforeend', '<style>' + keyframes + '</style>');
          
          this.containerEl.style.webkitAnimation = 'intro .4s ease-out 1 both';
          this.containerEl.style.width = this.dimensions.WIDTH + 'px';
          
          setTimeout(() => {
            this.startGame();
          }, this.config.CLEAR_TIME);
        } else if (this.crashed) {
          this.restart();
        }
      },

      startGame: function() {
        this.started = true;
        this.activated = true;
        this.playingIntro = false;
        this.tRex.playingIntro = false;
        this.containerEl.style.webkitAnimation = '';
      },

      gameOver: function() {
        this.crashed = true;
        this.distanceMeter.achievement = false;
        this.tRex.update(100, Trex.status.CRASHED);
        
        // Game over event
        if (this.config.onGameOver && typeof this.config.onGameOver === 'function') {
          const score = parseInt(this.distanceMeter.getActualDistance(this.distanceRan));
          this.config.onGameOver(score);
        }
        
        if (this.distanceRan > this.highestScore) {
          this.highestScore = Math.ceil(this.distanceRan);
          this.distanceMeter.setHighScore(this.highestScore);
        }
        
        this.time = new Date().getTime();
        
        setTimeout(() => {
          this.gameOverPanel.draw();
        }, 600);
        
        this.stop();
      },

      stop: function() {
        this.activated = false;
        this.paused = true;
        this.raq();
      },

      restart: function() {
        if (!this.raqId) {
          this.playCount++;
          this.runningTime = 0;
          this.activated = true;
          this.crashed = false;
          this.distanceRan = 0;
          this.setSpeed(this.config.SPEED);
          this.time = new Date().getTime();
          this.containerEl.classList.remove('crashed');
          this.clearCanvas();
          this.distanceMeter.reset(this.highestScore);
          this.horizon.reset();
          this.tRex.reset();
          this.gameOverPanel.reset();
          this.update();
        }
      },

      onKeyDown: function(e) {
        if (!this.crashed && Runner.keycodes.JUMP[e.keyCode]) {
          e.preventDefault();
          
          if (!this.activated) {
            this.activated = true;
            this.tRex.update(0, Trex.status.RUNNING);
            this.playIntro();
          }
          
          if (!this.tRex.jumping && !this.tRex.ducking) {
            this.tRex.startJump(this.currentSpeed);
          }
        } else if (this.crashed && Runner.keycodes.RESTART[e.keyCode]) {
          e.preventDefault();
          this.restart();
        }
      },

      onKeyUp: function(e) {
        const keyCode = String(e.keyCode);
        
        if (Runner.keycodes.JUMP[keyCode]) {
          this.tRex.endJump();
        }
      },

      startListening: function() {
        document.addEventListener(Runner.events.KEYDOWN, this.onKeyDown.bind(this));
        document.addEventListener(Runner.events.KEYUP, this.onKeyUp.bind(this));
      },

      raq: function() {
        if (!this.updatePending) {
          this.updatePending = true;
          this.raqId = requestAnimationFrame(this.update.bind(this));
        }
      }
    };

    // Định nghĩa các class con (Trex, Horizon, etc.)
    this.defineTrex();
    this.defineHorizon();
    this.defineDistanceMeter();
    this.defineGameOverPanel();
    this.defineCollisionDetection();

    return Runner;
  }

  // Các phương thức định nghĩa class con sẽ được thêm vào đây
  defineTrex() {
    window.Trex = function(canvas, image) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.image = image;
      this.xPos = 0;
      this.yPos = 0;
      this.currentFrame = 0;
      this.currentAnimFrames = [];
      this.blinkDelay = 0;
      this.animStartTime = 0;
      this.timer = 0;
      this.msPerFrame = 1000 / FPS;
      this.config = Trex.config;
      
      // Position
      this.xPos = this.config.START_X_POS;
      this.yPos = canvas.height - this.config.HEIGHT - this.config.BOTTOM_PAD;
      this.groundYPos = this.yPos;
      
      // Jump
      this.jumping = false;
      this.ducking = false;
      this.jumpVelocity = 0;
      this.reachedMinHeight = false;
      this.speedDrop = false;
      this.jumpCount = 0;
      this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;
      
      this.init();
    };

    Trex.config = {
      DROP_VELOCITY: -5,
      GRAVITY: 0.6,
      HEIGHT: 47,
      INITIAL_JUMP_VELOCITY: 12,
      INTRO_DURATION: 1500,
      MAX_JUMP_HEIGHT: 30,
      MIN_JUMP_HEIGHT: 30,
      SPEED_DROP_COEFFICIENT: 3,
      START_X_POS: 50,
      WIDTH: 44,
      BOTTOM_PAD: 10
    };

    Trex.status = {
      CRASHED: 'CRASHED',
      DUCKING: 'DUCKING',  
      JUMPING: 'JUMPING',
      RUNNING: 'RUNNING',
      WAITING: 'WAITING'
    };

    Trex.prototype = {
      init: function() {
        this.setBlinkDelay();
        this.status = Trex.status.WAITING;
      },

      setBlinkDelay: function() {
        this.blinkDelay = Math.ceil(Math.random() * 3000 + 1000);
      },

      update: function(deltaTime, opt_status) {
        this.timer += deltaTime;

        // Update the frame position.
        if (opt_status) {
          this.status = opt_status;
          this.currentFrame = 0;
          this.msPerFrame = Trex.animFrames[opt_status].msPerFrame;
          this.currentAnimFrames = Trex.animFrames[opt_status].frames;
        }

        // Game intro animation, T-rex moves in from the left.
        if (this.playingIntro && this.xPos < this.config.START_X_POS) {
          this.xPos += Math.round((this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime);
        }

        if (this.status === Trex.status.WAITING) {
          this.blink(getTimeStamp());
        } else {
          this.draw(this.xPos, this.yPos);
        }

        // Update the frame position.
        if (this.timer >= this.msPerFrame) {
          this.currentFrame = this.currentFrame === this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
          this.timer = 0;
        }
      },

      draw: function(x, y) {
        let sourceX = this.currentAnimFrames[this.currentFrame];
        let sourceY = 0;

        this.canvasCtx.drawImage(this.image, sourceX, sourceY,
          this.config.WIDTH, this.config.HEIGHT,
          x, y,
          this.config.WIDTH, this.config.HEIGHT);
      },

      blink: function(time) {
        const deltaTime = time - this.animStartTime;

        if (deltaTime >= this.blinkDelay) {
          this.draw(this.xPos, this.yPos);

          if (this.currentFrame === 1) {
            this.setBlinkDelay();
            this.animStartTime = time;
          }
        }
      },

      startJump: function(speed) {
        if (!this.jumping) {
          this.update(0, Trex.status.JUMPING);
          this.jumpVelocity = this.config.INITIAL_JUMP_VELOCITY - (speed / 10);
          this.jumping = true;
          this.reachedMinHeight = false;
          this.speedDrop = false;
        }
      },

      endJump: function() {
        if (this.reachedMinHeight && this.jumpVelocity < this.config.DROP_VELOCITY) {
          this.jumpVelocity = this.config.DROP_VELOCITY;
        }
      },

      updateJump: function(deltaTime, speed) {
        const msPerFrame = Trex.animFrames[this.status].msPerFrame;
        const framesElapsed = deltaTime / msPerFrame;

        // Speed drop makes Trex fall faster.
        if (this.speedDrop) {
          this.yPos += Math.round(this.jumpVelocity * this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
        } else {
          this.yPos += Math.round(this.jumpVelocity * framesElapsed);
        }

        this.jumpVelocity += this.config.GRAVITY * framesElapsed;

        // Minimum height has been reached.
        if (this.yPos < this.minJumpHeight || this.speedDrop) {
          this.reachedMinHeight = true;
        }

        // Reached max height
        if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
          this.endJump();
        }

        // Back down at ground level. Jump completed.
        if (this.yPos > this.groundYPos) {
          this.reset();
          this.jumpCount++;
        }

        this.update(deltaTime);
      },

      setSpeedDrop: function() {
        this.speedDrop = true;
        this.jumpVelocity = 1;
      },

      reset: function() {
        this.yPos = this.groundYPos;
        this.jumpVelocity = 0;
        this.jumping = false;
        this.ducking = false;
        this.update(0, Trex.status.RUNNING);
        this.midair = false;
        this.speedDrop = false;
        this.jumpCount = 0;
      }
    };

    // Animation frames for different states
    Trex.animFrames = {
      WAITING: {
        frames: [44, 0],
        msPerFrame: 1000 / 3
      },
      RUNNING: {
        frames: [88, 132],
        msPerFrame: 1000 / 12
      },
      CRASHED: {
        frames: [220],
        msPerFrame: 1000 / 60
      },
      JUMPING: {
        frames: [0],
        msPerFrame: 1000 / 60
      },
      DUCKING: {
        frames: [264, 323],
        msPerFrame: 1000 / 8
      }
    };
  }

  defineHorizon() {
    window.Horizon = function(canvas, images, dimensions, gapCoefficient) {
      this.canvas = canvas;
      this.canvasCtx = this.canvas.getContext('2d');
      this.config = Horizon.config;
      this.dimensions = dimensions;
      this.gapCoefficient = gapCoefficient;
      this.obstacles = [];
      this.obstacleHistory = [];
      this.horizonOffsets = [0, 0];
      this.cloudFrequency = this.config.CLOUD_FREQUENCY;
      this.spritePos = 0;
      this.nightMode = null;

      // Cloud
      this.clouds = [];
      this.cloudSpeed = this.config.BG_CLOUD_SPEED;

      // Horizon
      this.horizonLine = null;
      this.init();
    };

    Horizon.config = {
      BG_CLOUD_SPEED: 0.2,
      BUMPY_THRESHOLD: .3,
      CLOUD_FREQUENCY: .5,
      HORIZON_HEIGHT: 16,
      MAX_CLOUDS: 6
    };

    Horizon.prototype = {
      init: function() {
        this.addCloud();
        this.horizonLine = new HorizonLine(this.canvas, this.spritePos);
      },

      update: function(deltaTime, currentSpeed, hasObstacles, nightMode) {
        this.runningTime += deltaTime;
        this.horizonLine.update(deltaTime, currentSpeed);
        this.nightMode = nightMode;
        this.updateClouds(deltaTime, currentSpeed);

        if (hasObstacles) {
          this.updateObstacles(deltaTime, currentSpeed);
        }
      },

      updateClouds: function(deltaTime, speed) {
        const cloudSpeed = this.cloudSpeed / 1000 * deltaTime * speed;
        const numClouds = this.clouds.length;

        if (numClouds) {
          for (let i = numClouds - 1; i >= 0; i--) {
            this.clouds[i].update(cloudSpeed);
          }

          const lastCloud = this.clouds[numClouds - 1];

          // Check for adding a new cloud.
          if (numClouds < this.config.MAX_CLOUDS &&
              (this.dimensions.WIDTH - lastCloud.xPos) > lastCloud.cloudGap &&
              this.cloudFrequency > Math.random()) {
            this.addCloud();
          }

          // Remove expired clouds.
          this.clouds = this.clouds.filter(function(obj) {
            return !obj.remove;
          });
        } else {
          this.addCloud();
        }
      },

      updateObstacles: function(deltaTime, currentSpeed) {
        // Obstacles
        const updatedObstacles = this.obstacles.slice(0);

        for (let i = 0; i < this.obstacles.length; i++) {
          const obstacle = this.obstacles[i];
          obstacle.update(deltaTime, currentSpeed);

          // Clean up existing obstacles.
          if (obstacle.remove) {
            updatedObstacles.shift();
          }
        }
        this.obstacles = updatedObstacles;

        if (this.obstacles.length > 0) {
          const lastObstacle = this.obstacles[this.obstacles.length - 1];

          if (lastObstacle && !lastObstacle.followingObstacleCreated &&
              lastObstacle.isVisible() &&
              (lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) <
              this.dimensions.WIDTH) {
            this.addNewObstacle(currentSpeed);
            lastObstacle.followingObstacleCreated = true;
          }
        } else {
          // Create new obstacles.
          this.addNewObstacle(currentSpeed);
        }
      },

      removeFirstObstacle: function() {
        this.obstacles.shift();
      },

      addNewObstacle: function(currentSpeed) {
        const obstacleTypeIndex = getRandomNum(0, Obstacle.types.length - 1);
        const obstacleType = Obstacle.types[obstacleTypeIndex];

        // Check for multiples of the same type of obstacle.
        // Also check obstacle is available at current speed.
        if (this.duplicateObstacleCheck(obstacleType.type) ||
            currentSpeed < obstacleType.minSpeed) {
          this.addNewObstacle(currentSpeed);
        } else {
          const obstacleSpritePos = this.spritePos + obstacleType.x;

          this.obstacles.push(new Obstacle(this.canvasCtx, obstacleType,
              obstacleSpritePos, this.dimensions,
              this.gapCoefficient, currentSpeed, obstacleType.width));

          this.obstacleHistory.unshift(obstacleType.type);

          if (this.obstacleHistory.length > 1) {
            this.obstacleHistory.splice(Runner.config.MAX_OBSTACLE_DUPLICATION);
          }
        }
      },

      duplicateObstacleCheck: function(nextObstacleType) {
        let duplicateCount = 0;

        for (let i = 0; i < this.obstacleHistory.length; i++) {
          duplicateCount = this.obstacleHistory[i] === nextObstacleType ?
              duplicateCount + 1 : 0;
        }
        return duplicateCount >= Runner.config.MAX_OBSTACLE_DUPLICATION;
      },

      reset: function() {
        this.obstacles = [];
        this.horizonLine.reset();
        this.nightMode = false;
      },

      resize: function(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
      },

      addCloud: function() {
        this.clouds.push(new Cloud(this.canvas, this.spritePos,
            this.dimensions.WIDTH));
      },

      draw: function() {
        this.horizonLine.draw();
        this.drawClouds();
      },

      drawClouds: function() {
        for (let i = this.clouds.length - 1; i >= 0; i--) {
          this.clouds[i].draw();
        }
      }
    };
  }

  defineDistanceMeter() {
    // DistanceMeter class sẽ được thêm vào đây
    window.DistanceMeter = function(canvas, spriteSheet, canvasWidth) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.image = spriteSheet;
      this.x = 0;
      this.y = 5;
      
      this.currentDistance = 0;
      this.maxScore = 0;
      this.highScore = 0;
      this.container = null;
      
      this.digits = [];
      this.achievement = false;
      this.defaultString = '';
      this.flashTimer = 0;
      this.flashIterations = 0;
      
      this.config = DistanceMeter.config;
      this.maxScoreUnits = this.config.MAX_DISTANCE_UNITS;
      this.init(canvasWidth);
    };

    DistanceMeter.dimensions = {
      WIDTH: 10,
      HEIGHT: 13,
      DEST_WIDTH: 11
    };

    DistanceMeter.config = {
      MAX_DISTANCE_UNITS: 5,
      ACHIEVEMENT_DISTANCE: 100,
      COEFFICIENT: 0.025,
      FLASH_DURATION: 1000 / 4,
      FLASH_ITERATIONS: 3
    };

    DistanceMeter.prototype = {
      init: function(width) {
        let maxDistanceStr = '';
        
        this.calcXPos(width);
        this.maxScore = this.config.MAX_DISTANCE_UNITS;
        for (let i = 0; i < this.config.MAX_DISTANCE_UNITS; i++) {
          this.draw(i, 0);
          this.defaultString += '0';
          maxDistanceStr += '9';
        }
        
        this.maxScore = parseInt(maxDistanceStr);
      },

      calcXPos: function(canvasWidth) {
        this.x = canvasWidth - (DistanceMeter.dimensions.DEST_WIDTH *
            (this.config.MAX_DISTANCE_UNITS + 1));
      },

      draw: function(digitPos, value, opt_highScore) {
        let sourceWidth = DistanceMeter.dimensions.WIDTH;
        let sourceHeight = DistanceMeter.dimensions.HEIGHT;
        let sourceX = DistanceMeter.dimensions.WIDTH * value;
        let sourceY = 0;

        let targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
        let targetY = this.y;
        let targetWidth = DistanceMeter.dimensions.WIDTH;
        let targetHeight = DistanceMeter.dimensions.HEIGHT;

        // For high DPI we 2x source values.
        if (IS_HIDPI) {
          sourceWidth *= 2;
          sourceHeight *= 2;
          sourceX *= 2;
        }

        sourceX += this.spritePos;

        this.canvasCtx.save();

        if (opt_highScore) {
          // Left of the current score.
          let highScoreX = this.x - (this.maxScoreUnits * 2) *
              DistanceMeter.dimensions.WIDTH;
          this.canvasCtx.translate(highScoreX, this.y);
        } else {
          this.canvasCtx.translate(this.x, this.y);
        }

        this.canvasCtx.drawImage(this.image, sourceX, sourceY,
            sourceWidth, sourceHeight,
            targetX, targetY,
            targetWidth, targetHeight
        );

        this.canvasCtx.restore();
      },

      getActualDistance: function(distance) {
        return distance ? Math.round(distance * this.config.COEFFICIENT) : 0;
      },

      update: function(deltaTime, distance) {
        let paint = true;
        let playSound = false;

        if (!this.achievement) {
          distance = this.getActualDistance(distance);
          
          if (distance > this.maxScore && this.maxScoreUnits ===
              this.config.MAX_DISTANCE_UNITS) {
            this.maxScoreUnits++;
            this.maxScore = parseInt(this.maxScore + '9');
          } else {
            this.distance = 0;
          }

          if (distance > 0) {
            // Achievement unlocked
            if (distance % this.config.ACHIEVEMENT_DISTANCE === 0) {
              this.achievement = true;
              this.flashTimer = 0;
              playSound = true;
            }

            // Create a string representation of the distance with leading 0.
            const distanceStr = (this.defaultString +
                distance).substr(-this.maxScoreUnits);
            this.digits = distanceStr.split('');
          } else {
            this.digits = this.defaultString.split('');
          }
        } else {
          // Control flashing of the distance meter.
          if (this.flashIterations <= this.config.FLASH_ITERATIONS) {
            this.flashTimer += deltaTime;

            if (this.flashTimer < this.config.FLASH_DURATION) {
              paint = false;
            } else if (this.flashTimer >
                this.config.FLASH_DURATION * 2) {
              this.flashTimer = 0;
              this.flashIterations++;
            }
          } else {
            this.achievement = false;
            this.flashIterations = 0;
            this.flashTimer = 0;
          }
        }

        // Draw the digits if not flashing.
        if (paint) {
          for (let i = this.digits.length - 1; i >= 0; i--) {
            this.draw(i, parseInt(this.digits[i]));
          }
        }

        this.drawHighScore();
        return playSound;
      },

      drawHighScore: function() {
        this.canvasCtx.save();
        this.canvasCtx.globalAlpha = .8;
        for (let i = this.highScore.length - 1; i >= 0; i--) {
          this.draw(i, parseInt(this.highScore[i], 10), true);
        }
        this.canvasCtx.restore();
      },

      setHighScore: function(distance) {
        distance = this.getActualDistance(distance);
        const highScoreStr = (this.defaultString +
            distance).substr(-this.maxScoreUnits);

        this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
      },

      reset: function() {
        this.update(0);
        this.achievement = false;
      }
    };
  }

  defineGameOverPanel() {
    window.GameOverPanel = function(canvas, textImgPos, restartImgPos, dimensions) {
      this.canvas = canvas;
      this.canvasCtx = canvas.getContext('2d');
      this.canvasDimensions = dimensions;
      this.textImgPos = textImgPos;
      this.restartImgPos = restartImgPos;
      this.draw();
    };

    GameOverPanel.dimensions = {
      TEXT_X: 0,
      TEXT_Y: 13,
      TEXT_WIDTH: 191,
      TEXT_HEIGHT: 11,
      RESTART_WIDTH: 36,
      RESTART_HEIGHT: 32
    };

    GameOverPanel.prototype = {
      draw: function() {
        const dimensions = GameOverPanel.dimensions;
        const centerX = this.canvasDimensions.WIDTH / 2;

        // Game over text.
        let textSourceX = dimensions.TEXT_X;
        let textSourceY = dimensions.TEXT_Y;
        let textSourceWidth = dimensions.TEXT_WIDTH;
        let textSourceHeight = dimensions.TEXT_HEIGHT;

        let textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH / 2));
        let textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
        let textTargetWidth = dimensions.TEXT_WIDTH;
        let textTargetHeight = dimensions.TEXT_HEIGHT;

        let restartSourceWidth = dimensions.RESTART_WIDTH;
        let restartSourceHeight = dimensions.RESTART_HEIGHT;
        let restartTargetX = centerX - (dimensions.RESTART_WIDTH / 2);
        let restartTargetY = this.canvasDimensions.HEIGHT / 2;

        if (IS_HIDPI) {
          textSourceY *= 2;
          textSourceX *= 2;
          textSourceWidth *= 2;
          textSourceHeight *= 2;
          restartSourceWidth *= 2;
          restartSourceHeight *= 2;
        }

        textSourceX += this.textImgPos;
        restartSourceX += this.restartImgPos;

        // Game over text from sprite.
        this.canvasCtx.drawImage(Runner.imageSprite,
            textSourceX, textSourceY, textSourceWidth, textSourceHeight,
            textTargetX, textTargetY, textTargetWidth, textTargetHeight);

        // Restart button.
        this.canvasCtx.drawImage(Runner.imageSprite,
            restartSourceX, restartSourceY, restartSourceWidth,
            restartSourceHeight, restartTargetX, restartTargetY,
            dimensions.RESTART_WIDTH, dimensions.RESTART_HEIGHT);
      },

      reset: function() {
        // Reset dimensions
        this.canvasDimensions.WIDTH = DEFAULT_WIDTH;
        this.canvasDimensions.HEIGHT = 150;
      }
    };
  }

  defineCollisionDetection() {
    window.checkForCollision = function(obstacle, tRex, opt_canvasCtx) {
      let obstacleBoxXPos = Runner.defaultDimensions.WIDTH + obstacle.xPos;

      // Adjustments are made to the bounding box as there is a 1 pixel white
      // border around the t-rex and obstacles.
      let tRexBox = {
        x: tRex.xPos + 1,
        y: tRex.yPos + 1,
        width: tRex.config.WIDTH - 2,
        height: tRex.config.HEIGHT - 2
      };

      let obstacleBox = {
        x: obstacle.xPos + 1,
        y: obstacle.yPos + 1,
        width: obstacle.typeConfig.width * obstacle.size - 2,
        height: obstacle.typeConfig.height - 2
      };

      // Debug outer box
      if (opt_canvasCtx) {
        drawCollisionBoxes(opt_canvasCtx, tRexBox, obstacleBox);
      }

      // Simple outer bounds check.
      if (boxCompare(tRexBox, obstacleBox)) {
        let collisionBoxes = obstacle.collisionBoxes;
        let tRexCollisionBoxes = tRex.ducking ?
            Trex.collisionBoxes.DUCKING : Trex.collisionBoxes.RUNNING;

        // Detailed axis aligned box check.
        for (let t = 0; t < tRexCollisionBoxes.length; t++) {
          for (let i = 0; i < collisionBoxes.length; i++) {
            // Adjust the box to actual positions.
            let adjTrexBox =
                createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
            let adjObstacleBox =
                createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
            let crashed = boxCompare(adjTrexBox, adjObstacleBox);

            // Draw boxes for debug.
            if (opt_canvasCtx) {
              drawCollisionBoxes(opt_canvasCtx, adjTrexBox, adjObstacleBox);
            }

            if (crashed) {
              return [adjTrexBox, adjObstacleBox];
            }
          }
        }
      }
      return false;
    };

    function createAdjustedCollisionBox(box, adjustment) {
      return {
        x: box.x + adjustment.x,
        y: box.y + adjustment.y,
        width: box.width,
        height: box.height
      };
    }

    function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
      canvasCtx.save();
      canvasCtx.strokeStyle = '#f00';
      canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);

      canvasCtx.strokeStyle = '#00f';
      canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y,
          obstacleBox.width, obstacleBox.height);
      canvasCtx.restore();
    }

    function boxCompare(tRexBox, obstacleBox) {
      let crashed = false;
      let tRexBoxX = tRexBox.x;
      let tRexBoxY = tRexBox.y;

      let obstacleBoxX = obstacleBox.x;
      let obstacleBoxY = obstacleBox.y;

      // Axis-Aligned Bounding Box method.
      if (tRexBox.x < obstacleBoxX + obstacleBox.width &&
          tRexBox.x + tRexBox.width > obstacleBoxX &&
          tRexBox.y < obstacleBox.y + obstacleBox.height &&
          tRexBox.height + tRexBox.y > obstacleBox.y) {
        crashed = true;
      }

      return crashed;
    }
  }

  // Các helper functions
  getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getTimeStamp() {
    return performance && performance.now ? performance.now() : new Date().getTime();
  }

  destroy() {
    if (this.gameInstance && this.gameInstance.stop) {
      this.gameInstance.stop();
    }
    
    // Dọn dẹp DOM
    if (this.containerElement) {
      this.containerElement.innerHTML = '';
    }
    
    // Xóa global variables
    delete window.Runner;
    delete window.Trex;
    delete window.Horizon;
    delete window.DistanceMeter;
    delete window.GameOverPanel;
  }
}

export default DinoGame;
