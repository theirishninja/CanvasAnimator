// requires jQuery
// CanvasAnimator
// Copyright (c) 2015, boned (https://github.com/bonedacity)
// All rights reserved.
var CanvasAnimator = function CanvasAnimator(settings) {
	var self = this;
	
	
	self.config = {
		debug : true,
		canvasSelector : "#animatedCanvas",
		animSets : [],
		nearestNeighbor : true,
		pixelMultiplier : 1,
		srcWidth : 800,
		srcHeight : 665,
		autoPlay : true,
		loopAll : true,
		updateRateMs : 25
	};
	
	if (settings && typeof(settings) == 'object') {
		jQuery.extend(self.config, settings);
	}
	
	self.errorLog = jQuery("#canvasAnimatorErrors");
	self.log = function(message) {
		if (!self.config.debug || self.errorLog.length == 0) return;
		var entry = jQuery("<p>").text(message).css({"margin":"0"});
		self.errorLog.append(entry);
	}
	self.cache = {};
	self.canvas = jQuery(self.config.canvasSelector);
	// sanity check
	//
	if (typeof(self.config.nearestNeighbor) != 'boolean') {
		self.log("nearestNeighbor is not a boolean");
		return false;
	}
	if (!self.config.updateRateMs || typeof(self.config.updateRateMs) != 'number' || self.config.updateRateMs <= 0) {
		self.log("updateRateMs is not a positive integer");
		return false;
	} 
	if (!self.config.srcWidth || typeof(self.config.srcWidth) != 'number' || self.config.srcWidth <= 0) {
		self.log("srcWidth is not a positive integer");
		return false;
	} 
	if (!self.config.srcHeight || typeof(self.config.srcHeight) != 'number' || self.config.srcHeight <= 0) {
		self.log("srcHeight is not a positive integer");
		return false;
	}
	if (!self.config.pixelMultiplier || typeof(self.config.pixelMultiplier) != 'number' || self.config.pixelMultiplier <= 0) {
		self.log("pixelMultiplier is not a positive integer");
		return false;
	}
	if (self.config.animSets) {
		if (self.canvas.length == 0) {
			self.log("no canvas found with selector: " + self.config.canvasSelector);
			return false;
		}
	} else {
		self.log("no animSets specified");
		return false;
	}
	if (!self.canvas.is("canvas")) {
		self.log("element selected with '" + self.config.canvasSelector + "' is not a canvas");
		return false;
	}
	// all good to go
	//
	self.noAdvanceSet = false;
	self.noAdvanceFrame = false;
	self.animating = false;
	self.currentSet = 0;
	self.currentFrame = 0;
	self.currentFrameElapsed = 0;
	self.currentLoops = 0;
	self.currentLoopElapsed = 0;
	self.canvas.css({
		"width":self.config.srcWidth * self.config.pixelMultiplier,
		"height":self.config.srcHeight * self.config.pixelMultiplier
	});
	
	self.canvas.attr("width",self.config.srcWidth * self.config.pixelMultiplier);
	self.canvas.attr("height",self.config.srcHeight * self.config.pixelMultiplier);
	
	self.ctx2d = self.canvas[0].getContext("2d");
	
	if (self.config.nearestNeighbor) {
		self.canvas.css({
			"image-rendering":"-webkit-optimize-contrast",
			"image-rendering":"-moz-crisp-edges",
			"image-rendering":"optimizeSpeed",
			"image-rendering":"optimize-contrast",
			"-ms-interpolation-mode":"nearest-neighbor"
		});
		self.ctx2d.mozImageSmoothingEnabled = false;
		self.ctx2d.webkitImageSmoothingEnabled = false;
		self.ctx2d.msImageSmoothingEnabled = false;
		self.ctx2d.imageSmoothingEnabled = false;
	}
	self.isValidDuration = function isValidDuration(duration) {
		return (duration && typeof(duration) == 'number' && duration > 0);
	}
	self.loadAssets = function loadAssets() {
		var set;
		for (set in self.config.animSets) {
			var setIndex = set;
			set = self.config.animSets[set];
			if (!set.loop) {
				self.log("there is no loop object in set " + setIndex + ". stopping.");
				return;
			}
			// scrub durations
			//
			if (!set.shouldLoop || typeof(set.shouldLoop) != 'function') {
				// default to no loop
				//
				self.config.animSets[setIndex].shouldLoop = function(){return false;};
				self.log("didn't find shouldLoop function, defaulting to no loop");
			}
			// scrub duration calculators
			//
			if (!set.frameDurationModifier || typeof(set.frameDurationModifier) != 'function') {
				// default duration modifier
				//
				self.config.animSets[setIndex].frameDurationModifier = function(currentFrameDuration){return currentFrameDuration;};
				self.log("didn't find frameDurationModifier, defaulting to no duration modification");
			}
			for (var i = 0; i < set.loop.length; i++) {
				var frame = set.loop[i];
				var imgUrl = frame.img;
				// scrub sound functions
				//
				if (!frame.soundFunc || typeof(frame.soundFunc) != 'function') {
					self.log("didn't find soundFunc, defaulting to no sound on frame " + i + " in set " + setIndex);
					frame.soundFunc = function(){return null};
				}
				if (self.cache[imgUrl]) continue;
				if (!self.isValidDuration(frame.duration)) { // set default duration to 15ms
					self.config.animSets[set].loop[i].duration = 100;
					self.log("found frame with no duration set, defaulting to 100 ms");
				}
				img = new Image;
				img.src = imgUrl;
				self.cache[imgUrl] = img;
			}
		}
	}
	self.paintImage = function paintImage(imgUrl) {
		var img;
		if (!self.cache[imgUrl]) {
			img = new Image;
			img.src = imgUrl;
			self.cache[imgUrl] = img;
		} else {
			img = self.cache[imgUrl];
		}
		self.ctx2d.drawImage(img, 0, 0, 
			self.config.srcWidth, self.config.srcHeight,
			0, 0, self.config.srcWidth * self.config.pixelMultiplier,
			self.config.srcHeight * self.config.pixelMultiplier);
	}
	self.togglePauseSet = function togglePauseSet() {
		self.noAdvanceSet = !self.noAdvanceSet;
	}
	self.pauseSet = function pauseSet() {
		self.noAdvanceSet = true;
	}
	self.unpauseSet = function unpauseSet() {
		self.noAdvanceSet = false;
	}
	self.togglePauseFrame = function togglePauseFrame() {
		self.noAdvanceFrame = !self.noAdvanceFrame;
	}
	self.pauseFrame = function pauseFrame() {
		self.noAdvanceFrame = true;
	}
	self.unpauseFrame = function unpauseFrame() {
		self.noAdvanceFrame = false;
	}
	self.nextFrame = function nextFrame() {
		var currentSet = self.config.animSets[self.currentSet];
		self.currentFrame++;
		if (self.currentFrame >= currentSet.loop.length) {
			// check if we should loop
			//
			self.currentFrame = 0;
		}
		self.paintCurrentFrame();
	}
	self.previousFrame = function previousFrame() {
		var currentSet = self.config.animSets[self.currentSet];
		self.currentFrame--;
		if (self.currentFrame < 0) {
			// check if we should loop
			//
			self.currentFrame = currentSet.loop.length - 1;
		}
		self.paintCurrentFrame();
	}
	self.nextSet = function nextSet() {
		self.currentFrame = 0;
		self.currentLoops = 0;
		self.currentSet++;
		self.currentLoopElapsed = 0;
		if (self.currentSet >= self.config.animSets.length) {
			self.currentSet = 0;
		}
		self.paintCurrentFrame();
	}
	self.previousSet = function previousSet() {
		self.currentFrame = 0;
		self.currentLoops = 0;
		self.currentSet--;
		self.currentLoopElapsed = 0;
		if (self.currentSet < 0) {
			self.currentSet = self.config.animSets.length - 1;
		}
		self.paintCurrentFrame();
	}
	self.advanceCurrentSet = function advanceCurrentSet() {
		if (self.noAdvanceSet) {
			return;
		}
		self.currentLoops = 0;
		self.currentSet++;
		self.currentLoopElapsed = 0;
		if (self.currentSet >= self.config.animSets.length) {
			if (self.config.loopAll) {
				self.currentSet = 0;
			} else {
				self.animating = false;
				self.currentSet--;
			}
		}
	}
	self.advanceCurrentFrame = function advanceCurrentFrame() {
		var currentSet = self.config.animSets[self.currentSet];
		self.currentFrame++;
		// do loop
		//
		if (self.currentFrame >= currentSet.loop.length) {
			// check if we should loop
			//
			self.currentFrame = 0;
			if (currentSet.shouldLoop(self.currentLoops)) {
				self.currentLoops++;
			} else {
				self.advanceCurrentSet();
			}
		}
		self.currentFrameElapsed = 0;
	}
	self.paintCurrentFrame = function paintCurrentFrame() {
		var currentSet = self.config.animSets[self.currentSet];
		var currentFrame = currentSet.loop[self.currentFrame];
		self.paintImage(currentFrame.img);
	}
	self.reset = function reset() {
		self.dirty = true;
		self.startTime = new Date();
		self.animating = true;
		self.currentSet = 0;
		self.currentFrame = 0;
		self.currentLoops = 0;
		self.currentLoopElapsed = 0;
	}
	self.stop = function stop() {
		self.animating = false;
	}
	self.start = function start() {
		self.animating = true;
	}
	self.toggle = function toggle() {
		self.animating = !self.animating;
	}
	self.animate = function animate() {
		self.reset();
		if (!self.animateInterval) {
			self.animateInterval = setInterval(function() {
				if (self.animating && !self.noAdvanceFrame) {
					var endTime = new Date();
					var elapsed = endTime - self.startTime;
					self.startTime = endTime;
					self.currentFrameElapsed += elapsed;
					self.currentLoopElapsed += elapsed;
					var currentSet = self.config.animSets[self.currentSet];
					var currentFrame = currentSet.loop[self.currentFrame];
					
					var duration = currentSet.frameDurationModifier(currentFrame.duration,
						self.currentLoopElapsed, self.currentLoops, self.currentFrame);
						
					if (self.currentFrameElapsed > duration) {
						self.advanceCurrentFrame();
						currentSet = self.config.animSets[self.currentSet];
						currentFrame = currentSet.loop[self.currentFrame];
						var soundUrl = currentFrame.soundFunc();
						var cachedSound;
						if (!self.cache[soundUrl]) {
							self.cache[soundUrl] = new Audio(soundUrl);
						}
						cachedSound = self.cache[soundUrl];
						cachedSound.play();
						self.dirty = true;
					}
					if (self.dirty) {
						self.dirty = false;
						self.paintCurrentFrame();
					}
				}
			}, self.config.updateRateMs);
		}
	};
	self.loadAssets();
	self.canvas.css({"cursor":"pointer"});
	self.paintCurrentFrame();
	if (self.config.autoPlay) {
		self.animate();
		self.canvas.on("click", self.toggle);
	} else {
		self.canvas.on("click", function() {
			self.animate();
			self.canvas.off("click");
			self.canvas.on("click", self.toggle);
		});
	}
	
}

