/* GLOBAL TIMER VARIABLES */

angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('MainController', function($scope, $rootScope, $stateParams, $interval, $ionicGesture, $ionicBackdrop, $timeout, $http, $ionicLoading) {

    //var VEL_THROW = 10;
    const THROW_DELTA_DELTAX = 30;    // Threshold for change in DeltaX value at which gesture turns into a throw

    const THROW_ROTATION_COMPONENT_CONSTANT = 50;           // y = mx + C
    const THROW_ROTATION_COMPONENT_LINEAR_MULTIPLIER = 100;    // y = Mx + c

    const WEBKIT_TRANSITION_DIAL_ROTATE = 'none';
    const DIAL_SPIN_DURATION_SECS = 5;
    const WEBKIT_TRANSITION_DIAL_SPIN = '-webkit-transform ' + parseInt(DIAL_SPIN_DURATION_SECS) + 's cubic-bezier(0.075, 0.82, 0.165, 1)'         // Ease Out Circ
    const WEBKIT_TRANSITION_DIAL_BOUNCE = '-webkit-transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'   // Ease Out Back
    const CURRENT_MODE_DRAG = 'drag';
    const CURRENT_MODE_THROW = 'throw';
    

    $scope.navBubbles = [
        {id: "houseMove", title: "Summary", colour: "RGBA(57, 161, 223, 1)", icon: "ion-ios7-bookmarks-outline", image: "summary.png"},
        {id: "houseMove", title: "House", colour: "RGBA(91, 152, 23, 1)", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "Save Me", colour: "RGBA(235, 130, 30, 1)", icon: "ion-help-buoy", image: "savings.png"},
        {id: "houseMove", title: "Health", colour: "RGBA(80, 120, 177, 1)", icon: "ion-medkit", image: "health.png"},
        {id: "houseMove", title: "Food", colour: "RGBA(201, 47, 10, 1)", icon: "ion-pizza", image: "food.png"},
        {id: "houseMove", title: "House Move 5", colour: "RGBA(96, 197, 91, 1)", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 7", colour: "blue", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 13", colour: "blue", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 14", colour: "blue", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 7", colour: "blue", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 13", colour: "blue", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 14", colour: "blue", icon: "ion-home", image: "housemove.png"},
        {id: "houseMove", title: "House Move 15", colour: "blue", icon: "ion-beer", image: "housemove.png"},
        {id: "houseMove", title: "Shopping", colour: "RGBA(185, 50, 117, 1)", icon: "ion-bag", image: "shopping.png"},
        {id: "houseMove", title: "Travel", colour: "RGBA(143, 49, 171, 1)", icon: "ion-model-s", image: "travel.png"}
    ];



    // Gesture stuff
    var swipeArea = angular.element(document.querySelector('#swipeArea'));
    var dialHolder = angular.element(document.querySelector('#dialHolder'));


    $scope.highlightedIndex = 0;
    $scope.dialWidth = 500;
    $scope.windowWidth = window.innerWidth;
    $scope.windowHeight = window.innerHeight;
    $scope.bottomDialerLeft = ($scope.windowWidth - $scope.dialWidth) / 2;
    $scope.bottomDialerWidth = $scope.dialWidth;
    $scope.bottomDialerTop = $scope.windowHeight - 200;

    if ($scope.bottomDialerLeft < 0) {
        $scope.bottomDialerWidth = $scope.bottomDialerWidth - $scope.bottomDialerLeft;
    }

    $scope.angleIncrement = (2 * Math.PI) / $scope.navBubbles.length;
    $scope.widthOffset = 20;

    $scope.stepAngleDegrees = 0;

    $scope.distributeBubbles = function(width) {
        var radius = (width / 2) -50;
        var height = width;
        var angle = 0, step = (2* Math.PI) / $scope.navBubbles.length;

        $scope.stepAngleDegrees = step * (180 / Math.PI);

        for (var i = 0; i < $scope.navBubbles.length; i++) {
            var xOffset = 0;
            var yOffset = 0;
            var angleInDeg = angle * (180 / Math.PI);

            // wheelAngle positions first bubble at top of wheel 
            var wheelAngle = ( angle - (Math.PI/2) ) % (2*Math.PI);
            //var wheelAngle = angle;

            var x = Math.round(width/2 + radius * Math.cos(wheelAngle) -$scope.widthOffset);
            var y = Math.round(height/2 + radius * Math.sin(wheelAngle) -$scope.widthOffset);

            $scope.navBubbles[i].left = x + "px";
            $scope.navBubbles[i].top = y + "px";
            $scope.navBubbles[i].angle = angleInDeg;

            angle += step;
        }


    }

    $scope.distributeBubbles($scope.dialWidth);
    
    /* MODULE LEVEL VARAIBLES */

    var currentRotation = 0;
    //$scope.currentRotation = currentRotation;
    var thisRotation = 0;
    var currentMode = null;
    var lastDeltaX = 0;

    var allBubbleElements = document.getElementsByClassName("bubble-icon");

    var INTERVAL_throwRefresh = null;
    var TIMEOUT_throwEnd = null;

    $scope.calcLeftForContent = function(index) {
        if (index == $scope.highlightedIndex) {
            return 20;
        } else if (index == $scope.highlightedIndex - 1) {
            return -$scope.windowWidth;
        } else if (index == $scope.highlightedIndex + 1) {
            return $scope.windowWidth;
        }
    }

    $scope.contentIsVisible = function(index) {
        if (index > $scope.highlightedIndex - 1 && index < $scope.highlightedIndex + 1) {
            return "block";
        } else {
            return "none"
        }
    }



    var dialElem = document.getElementById("dialHolder");
    var panelElem = document.getElementById("panelContainer");
  
    /* HELPER FUNCTIONS */

    var RADIUS_DIAL = $scope.dialWidth / 2;

    function getDeltaAngleFromDeltaX(deltaX) {
        // sinθ = deltaX / RADIUS_DIAL

        var deltaAngleInRad;
        var absDeltaX = Math.abs(deltaX);

        if ( absDeltaX < RADIUS_DIAL )   // 0 to 90 degrees
            deltaAngleInRad = Math.asin( absDeltaX / RADIUS_DIAL );   // In degrees
        else if ( absDeltaX == RADIUS_DIAL )   // 90 degrees
            deltaAngleInRad = Math.PI/2;
        else // 90 to 180 degrees
            return Math.PI/2 + Math.asin( (absDeltaX-RADIUS_DIAL) / RADIUS_DIAL );

        if ( deltaX >= 0 )
            return deltaAngleInRad * 360 / (2*Math.PI)
        else
            return -deltaAngleInRad * 360 / (2*Math.PI)
        
    }

    function getVelocityXWithSign(gesture) {
        var velocityX = gesture.velocityX;
        if ( gesture.direction=="left" ) {
            velocityX = -velocityX;    
        }

        return velocityX;
    }

    function getTopBubbleIndex(absoluteRotation) {

        // Reverse rotation needed as we want to find bubble on moving frame of reference
        reverseRotation = ( 360 - ( absoluteRotation % 360 ) ) % 360;

        var stepAngleDegrees = $scope.stepAngleDegrees;
        var bubbleCount = $scope.navBubbles.length;

        var leftHandBubbleIndex = Math.floor( reverseRotation/stepAngleDegrees )

        var leftHandBubbleAngle = leftHandBubbleIndex * stepAngleDegrees;
        // Return left hand bubble if reverse rotation is less than midpoint to the right
        if ( reverseRotation < (leftHandBubbleAngle+stepAngleDegrees/2) ) {
            return leftHandBubbleIndex;
        // Otherwise return right hand bubble
        } else {
            return (leftHandBubbleIndex + 1) % bubbleCount; // Modulus is to wrap round from last bubble to first bubble
        }

    }

    function getBubbleAngle(bubbleIndex) {
        return bubbleIndex * $scope.stepAngleDegrees;
    }

    function getPanelOffsetFromRotation(absoluteRotation) {
        console.log(absoluteRotation, -( $scope.windowWidth * (absoluteRotation%360)/$scope.stepAngleDegrees ));
        return Math.abs( $scope.windowWidth * (absoluteRotation%360)/$scope.stepAngleDegrees )
    }


    // Dial transition and rotation functions (inc panel)

    function setStyleOnDial(property, value) {
        // Dial
        dialElem.style[property] = value;
        for (var i = 0; i < allBubbleElements.length; i++) {
            allBubbleElements[i].style[property] = value;
        }
        // Panels
        panelElem.style[property] = value;
    }

    function setRotationOnDial(absoluteRotation) {
        console.log(absoluteRotation);
        dialElem.style.webkitTransform = "translate3d(0, 0, 0) rotate(" + absoluteRotation + "deg)";
        for (var i = 0; i < allBubbleElements.length; i++) {
            allBubbleElements[i].style.webkitTransform = "translate3d(0, 0, 0) rotate(" + (-absoluteRotation) + "deg)";
        }
        panelElem.style.webkitTransform = "translate3d(-" + getPanelOffsetFromRotation(absoluteRotation) + "px, 0, 0)"
    }

    function getComputedStyleAngleInDegrees(element) {
        // CREDIT: http://css-tricks.com/get-value-of-css-rotation-through-javascript/

        var el = element;
        var st = window.getComputedStyle(el, null);
        var tr = st.getPropertyValue("-webkit-transform") ||
                 st.getPropertyValue("-moz-transform") ||
                 st.getPropertyValue("-ms-transform") ||
                 st.getPropertyValue("-o-transform") ||
                 st.getPropertyValue("transform") ||
                 "fail...";

        // With rotate(30deg)...
        // matrix(0.866025, 0.5, -0.5, 0.866025, 0px, 0px)
        //console.log('Matrix: ' + tr);

        // rotation matrix - http://en.wikipedia.org/wiki/Rotation_matrix

        var values = tr.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
        var a = values[0];
        var b = values[1];
        var c = values[2];
        var d = values[3];

        var scale = Math.sqrt(a*a + b*b);

        // arc sin, convert from radians to degrees, round
        // DO NOT USE: see update below
        var sin = b/scale;
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

        // works!
        //console.log('Rotate: ' + angle + 'deg');

        return angle;
    }

    /* END HELPER FUNCTIONS */


    var touchEvent = function(evt) {

        currentMode = null;

        // Make sure dial is stopped (use computed style in case we are doing an animation)
        var instantAngle = getComputedStyleAngleInDegrees(dialElem);
        setStyleOnDial('-webkit-transition', 'none');
        setRotationOnDial(instantAngle);
        currentRotation = instantAngle;

        clearInterval(INTERVAL_throwRefresh);
        INTERVAL_throwRefresh = null;
        
        clearTimeout(TIMEOUT_throwEnd);
        TIMEOUT_throwEnd = null;

        highlightClosestBubble(currentRotation);

        lastDeltaX = 0;

    }

    var releaseEvent = function(evt) {
        
        if ( currentMode == null ) {
            // Make sure dial is snapped to a notch
            snapToClosestNotch(currentRotation);
            highlightClosestBubble(currentRotation);
        }

    }

    var smallDragStartEvent = function(evt) {
        
    }

    var smallDragEvent = function(evt) {

        var deltaX = evt.gesture.deltaX;
        var velocity = getVelocityXWithSign(evt.gesture)

        // Check change in DeltaX value since last event fired
        var deltaDeltaX = deltaX - lastDeltaX;
        if ( Math.abs( deltaDeltaX ) < THROW_DELTA_DELTAX ) {
            // If small, set drag mode
            currentMode = CURRENT_MODE_DRAG
        } else {
            // If large, set throw mode
            currentMode = CURRENT_MODE_THROW
        }
        lastDeltaX = deltaX;
        
        // Simple drag (low velocity)
        if ( currentMode==CURRENT_MODE_DRAG ) {
            //console.log("simple drag");
            thisRotation = currentRotation + getDeltaAngleFromDeltaX(deltaX);

            setStyleOnDial('-webkit-transition', WEBKIT_TRANSITION_DIAL_ROTATE);
            setRotationOnDial(thisRotation);
  
            highlightClosestBubble(thisRotation);

        } else if ( currentMode==CURRENT_MODE_THROW ) {

            // Throw effect

            var rotationTargetDelta = Math.round(THROW_ROTATION_COMPONENT_CONSTANT + THROW_ROTATION_COMPONENT_LINEAR_MULTIPLIER*(Math.abs(evt.gesture.velocityX)));
            if ( evt.gesture.direction=="left" ) {                  // Note:  No need to worry about deltaDeltaX magnitude here, only sign. (Magnitude must be above a certain threshold to reach this point.)
                rotationTargetDelta = -rotationTargetDelta;
            } 

            // Calculate rotation from velocity
            thisVelocityRotation = currentRotation + rotationTargetDelta;
            var totalDuration = 2;

            // Spin dial
            setStyleOnDial('-webkit-transition', WEBKIT_TRANSITION_DIAL_SPIN)
            setRotationOnDial(thisVelocityRotation);

            currentRotation = thisVelocityRotation;

            // Keep highlighting bubbles as dial spins        
            if (!INTERVAL_throwRefresh) {
                INTERVAL_throwRefresh = setInterval(function() {
                    var instantAngle = getComputedStyleAngleInDegrees(dialElem);
                    highlightClosestBubble(instantAngle);
                }, 200);
            }

            // Timer to stop interval timer above and snap to closest bubble
            if (!TIMEOUT_throwEnd) {
                TIMEOUT_throwEnd = setTimeout(function() {
                    clearInterval(INTERVAL_throwRefresh);
                    INTERVAL_throwRefresh = null;

                    highlightClosestBubble(currentRotation);
                    snapToClosestNotch(currentRotation);
                }, DIAL_SPIN_DURATION_SECS*1000);
            }


        }


    }


    var smallDragEndEvent = function(evt) {
        
        if ( currentMode == CURRENT_MODE_DRAG ) {
            currentRotation = thisRotation; 
            snapToClosestNotch(currentRotation);          
        }        
    }


    function highlightClosestBubble(absoluteRotation) {
        $scope.highlightedIndex = getTopBubbleIndex(absoluteRotation);
        $scope.$apply();
    }

    function snapToClosestNotch(absoluteRotation) {
        var closestNotchAngle = getClosestNotchAngle(absoluteRotation);
        console.log('***', absoluteRotation, closestNotchAngle);

        setStyleOnDial('-webkit-transition', WEBKIT_TRANSITION_DIAL_BOUNCE);
        setRotationOnDial(closestNotchAngle);
        currentRotation = closestNotchAngle;
    }

    function getClosestNotchAngle(absoluteRotation) {

        var stepAngleDegrees = $scope.stepAngleDegrees;
        var bubbleCount = $scope.navBubbles.length;

        // NB: This is not bubble index (bubble index can be deduced from notch index by reversing rotation and using modulus, etc)
        var leftHandNotchIndex = Math.floor( absoluteRotation/stepAngleDegrees )
        var leftHandNotchAngle = leftHandNotchIndex * stepAngleDegrees;

        // Return left hand notch angle if absolute rotation is less than midpoint to the right
        if ( absoluteRotation < (leftHandNotchAngle+stepAngleDegrees/2) ) {
            return leftHandNotchAngle;
        // Otherwise return right hand notch angle
        } else {
            return (leftHandNotchAngle + stepAngleDegrees) // NB: No wrap around here to make animations work properly
        }


        var topBubbleIndex = getTopBubbleIndex(absoluteRotation);
        var topBubbleAngle = getBubbleAngle(topBubbleIndex);


    }


    $ionicGesture.on("dragstart", smallDragStartEvent, swipeArea);
    $ionicGesture.on("dragend", smallDragEndEvent, swipeArea);
    $ionicGesture.on("drag", smallDragEvent, swipeArea);
    $ionicGesture.on("touch", touchEvent, swipeArea);
    $ionicGesture.on("release", releaseEvent, swipeArea);

    var allBubbleElements = document.getElementsByClassName("bubble-icon");


    $scope.$on('$destroy', function() {
        //$ionicGesture.off("swipeleft", $scope.swipeLeft, swipeArea);
    });



})
