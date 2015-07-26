# CanvasAnimator
Is a simple javascript library for making lightweight animations using HTML5 canvas.

#### Browser Support
+ Firefox
+ Chrome
+ IE11+ (no sound / I will add support soon™)

#### Dependencies
+ jQuery

#### Core Features
+ Animation Sequences
+ Custom animation loop logic
+ Frame sound playback
+ Overridable frame sound function
+ Nearest neighbor rendering support
+ Internal image and sound caching

### Usage
+ Add your animation's `<canvas>` element to your page with an `ID`.

```html
<canvas id="animatedCanvas"></canvas>
```
+ Include **CanvasAnimator.js** and **jQuery** on your page.
+ Add your animation's `<script>` tag to your page's HTML and put some code in it.

```javascript
        // wait for the dom to be ready
        $(document).ready(function() {
            var animation1config = {
                debug : false,
				autoPlay : false,
				loopAll : true,
				canvasSelector : "#animatedCanvas",
				nearestNeighbor : true,
				pixelMultiplier : 3,
				srcWidth : 119,
				srcHeight : 116,
				updateRateMs : 10,
				animSets : []
            }
            var animation1 = new CanvasAnimator( animation1config );
        });
```
        
+ Add animation sets to the `animSet` array.

```javascript
        // wait for the dom to be ready
        $(document).ready(function() {
            var animation1config = {
                debug : false,
				autoPlay : false,
				loopAll : true,
				canvasSelector : "#animatedCanvas",
				nearestNeighbor : true,
				pixelMultiplier : 3,
				srcWidth : 119,
				srcHeight : 116,
				updateRateMs : 10,
				animSets : []
            }
            animation1config.animSets = [
                { // set 1
                    shouldLoop : function(loopNumber) { return false; },
                    frameDurationModifier : 
                        function(currentFrameDuration, loopTotalElapsedMs, loopNumber, frameNumber) {
                            return currentFrameDuration;
                        },
                    loop : [
                        { // frame 1
        					img : "http://abc.def/frame1.png",
        					duration : 90,
        					soundFunc : function() {
        									return "http://abc.def/ding.wav";
        								}
        				},
        				{ // frame 2
        					img : "http://abc.def/frame2.png",
        					duration : 90
        				}
                    ]
                },
                { // set 2
                    shouldLoop : function(loopNumber) { return true; },
                    loop : [
                        { // frame 1
        					img : "http://abc.def/frame1.png",
        					duration : 90
        				},
        				{ // frame 2
        					img : "http://abc.def/frame2.png",
        					duration : 90
        				}
                    ]
                }
            ];
            var animation1 = new CanvasAnimator( animation1config );
        });
```

#### Methods
+ `start` - Start the animation
+ `stop` - Stop the animation
+ `toggle` - Toggle the animation
+ `reset` - Reset the animation
+ `togglePauseSet` - Toggle the current animation set for permanent looping
+ `pauseSet` - Pause the current animation set for permanent looping
+ `unpauseSet` - Un-pause the current animation set for permanent looping
+ `nextSet` - Go to next animation set
+ `previousSet` - Go to previous animation set
+ `togglePauseFrame` - Toggle pause on current animation frame
+ `pauseFrame` - Pause current animation frame
+ `unpauseFrame` - Un-pause current animation frame
+ `nextFrame` - Go to next animation frame in set
+ `previousFrame` - Go to previous animation frame in set

Use example: `myAnimator.reset();`

#### Config
+ `boolean` **debug** - When true, CanvasAnimator will verbosely log to any `<div id="canvasAnimatorErrors"></div>` on the page.
+ `string` **canvasSelector** - CSS selector used to select the canvas for this animation
+ `number` **pixelMultiplier** - Multiply the source resolution by this number for resizing
+ `number` **srcWidth** - Animation frame source image width
+ `number` **srcHeight** - Animation frame source image height
+ `boolean` **nearestNeighbor** - Use Nearest Neighbor image scaling
+ `boolean` **autoPlay** - Should the animation play automatically?
+ `boolean` **loopAll** - Should the animation restart after finishing?
+ `number` **updateRateMs** - The rate at which CanvasAnimator will check if the animation's frame should advance. *There are 16.666ms per frame in a 60Hz refresh rate.*
+ `array` **animSets** - This is the array that holds your animation sets.
 
#### Configuring animSets
Animation **sets** are a sequential array of image frame **loops**. You might want to loop a portion of your animation multiple times and this structure supports that by allowing you to re-use images.
The most basic *functional* animSet object layout is as follows:

```javascript
animSets = [
    { // set 1
        loop : [
            { // image (frame)
                img : "http://url"
            }
        ]
    },
    { // set 2
        loop : [
            { // image (frame)
                img : "http://url"
            }
        ]
    }
];
```

#### `animSet` objects
+ **required** `loop : []` - Array of image objects.
+ **optional** `shouldLoop : function(loopNumber){ return true; }` - Allows user to define if the loop should loop based on how many repetitions have occured with the provided `loopNumber` arg. *Defaults to no looping.*
+ **optional** `frameDurationModifier : function(currentFrameDuration, loopTotalElapsedMs, loopNumber, frameNumber) { return currentFrameDuration; }` - Allows the user to apply fairly complex logic to modify each frame's playback duration in milliseconds via the provided parameters. *Defaults to original duration.*

#### `image` objects
+ **required** `img` - URL to the frame's image
+ **optional** `duration` - Milliseconds to play the frame. *Defaults to 100ms.*
+ **optional** `soundFunc` - The function that should be executed when the image is displayed. The function can return either a `string` or a `function`. If it is a `string`, it will be treated as a javascript `Audio` object URL and played. If it is a `function`, it will be executed without any parameters. This allows you to use your own audio solution completely via callbacks.

License
----

BSD
