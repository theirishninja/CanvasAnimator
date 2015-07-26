# CanvasAnimator
A simple HTML5 canvas frame animator with support for sounds and rate control.

# Use
1. Create a canvas element on your page with an ID
    <canvas id="animatedCanvas"></canvas>
2. Include jQuery dependency
3. Configure your animation
    var config = {
	    debug : false,
		autoPlay : true,
		loopAll : true,
		canvasSelector : "#animatedCanvas",
		nearestNeighbor : true,
		pixelMultiplier : 1,
		srcWidth : 119,
		srcHeight : 116,
		updateRateMs : 25
	};
4. Add your animation sets and frame loop definitions to the configuration
	config.animSets = [
		{ // set 1
			shouldLoop : function(loopNumber) {
				return false;
			},
			frameDurationModifier : function(currentFrameDuration, loopTotalElapsedMs, loopNumber, frameNumber) {
				return currentFrameDuration;
			},
			loop : [
			    img : "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png"
				duration : 100
			]
		},
		{ // set N
			shouldLoop : function(loopNumber) {
				return true;
			},
			frameDurationModifier : function(currentFrameDuration, loopTotalElapsedMs, loopNumber, frameNumber) {
				return currentFrameDuration;
			},
			loop : [
			    img : "https://assets-cdn.github.com/images/modules/logos_page/Octocat.png"
				duration : 100
			]
		}
	];
5. Instantiate the canvas animator on document ready
    $(document).ready(function(){
		var animator = new CanvasAnimator(config);
	});
+ Optional: add the debug element to your page to view debug messages
    <div id="canvasAnimatorErrors" style="color:red;font-size:8px"></div>
	
-boned