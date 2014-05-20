angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('MainController', function($scope, $rootScope, $stateParams, $interval, $ionicGesture, $ionicBackdrop, $timeout, $http, $ionicLoading) {

    var VEL_THROW = 0.7;
    $scope.debug = {};

    $scope.navBubbles = [
        {id: "houseMove", title: "Summary", colour: "RGBA(57, 161, 223, 1)", icon: "ion-ios7-bookmarks-outline"},
        {id: "houseMove", title: "House", colour: "RGBA(91, 152, 23, 1)", icon: "ion-home"},
        {id: "houseMove", title: "Save Me", colour: "RGBA(235, 130, 30, 1)", icon: "ion-help-buoy"},
        {id: "houseMove", title: "Health", colour: "RGBA(80, 120, 177, 1)", icon: "ion-medkit"},
        {id: "houseMove", title: "Food", colour: "RGBA(201, 47, 10, 1)", icon: "ion-pizza"},
        {id: "houseMove", title: "House Move 5", colour: "RGBA(96, 197, 91, 1)", icon: "ion-home"},
        {id: "houseMove", title: "House Move 7", colour: "blue", icon: "ion-home"},
        {id: "houseMove", title: "House Move 13", colour: "blue", icon: "ion-home"},
        {id: "houseMove", title: "House Move 14", colour: "blue", icon: "ion-home"},
        {id: "houseMove", title: "House Move 7", colour: "blue", icon: "ion-home"},
        {id: "houseMove", title: "House Move 13", colour: "blue", icon: "ion-home"},
        {id: "houseMove", title: "House Move 14", colour: "blue", icon: "ion-home"},
        {id: "houseMove", title: "House Move 15", colour: "blue", icon: "ion-beer"},
        {id: "houseMove", title: "Shopping", colour: "RGBA(185, 50, 117, 1)", icon: "ion-bag"},
        {id: "houseMove", title: "Travel", colour: "RGBA(143, 49, 171, 1)", icon: "ion-model-s"}

    ];



    // Gesture stuff
    var swipeArea = angular.element(document.querySelector('#swipeArea'));
    var dialHolder = angular.element(document.querySelector('#dialHolder'));


    $scope.lastDragDirection = null;
    $scope.lastDragDistance = null;

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

            console.log(i, angle, wheelAngle);

            angle += step;
        }


    }

    $scope.distributeBubbles($scope.dialWidth);
    var currentRotation = 0;
    //$scope.currentRotation = currentRotation;
    var thisRotation = 0;
    var currentMode = 'drag';

    var allBubbleElements = document.getElementsByClassName("bubble-icon");
    console.log(allBubbleElements);

    $scope.dragTimer = null;

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




    $scope.smallDragStartEvent = function(evt) {
        //console.log(evt.gesture);

    }

    var dialElem = document.getElementById("dialHolder");

    var world = anima.world();
    var dialAnimator = world.add( document.getElementById("dialHolder") );
    //console.log("***", document.querySelector('.nav-ball').length);
    var navBallAnimators = [];
    for (var i = 0; i < allBubbleElements.length; i++) {
        navBallAnimators.push( world.add(allBubbleElements[i]) );
        console.log('added', i);
    }
    console.log(navBallAnimators.length);

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


    /* END HELPER FUNCTIONS */


    // Init - setup transition properties (setting duration to zero disables transition)
    dialElem.style['-webkit-transition-property'] = 'all';
    dialElem.style['-webkit-transition-timing-function'] = 'linear';
    for (var i = 0; i < allBubbleElements.length; i++) {
        allBubbleElements[i].style['-webkit-transition-property'] = 'all';
        allBubbleElements[i].style['-webkit-transition-timing-function'] = 'linear';
    }

    $scope.smallDragEvent = function(evt) {
        if ($scope.lastDragDirection && $scope.lastDragDistance) {
            //console.log("Change = ", evt.gesture.distance - $scope.lastDragDistance);
        } else {
            $scope.lastDragDirection = evt.gesture.direction;
            $scope.lastDragDistance = evt.gesture.distance;
        }

        /*
        $scope.debug.dir = evt.gesture.direction;
        $scope.debug.method = ( evt.gesture.velocityX < VEL_THROW ? "DRAG" : "VEL" );
        $scope.debug.deltaX = evt.gesture.deltaX;
        $scope.debug.deltaTime = evt.gesture.deltaTime;
        $scope.debug.velocX = evt.gesture.velocityX;
        $scope.debug.deltaAng = $scope.deltaAng;
        $scope.debug.currentRotation = $scope.currentRotation;
        $scope.debug.thisRotation = $scope.thisRotation;
        $scope.$apply();
        */

        var deltaX = evt.gesture.deltaX;
        var velocity = getVelocityXWithSign(evt.gesture)
        
        // Simple drag (low velocity)
        if ( Math.abs(velocity) < VEL_THROW ) {
            //console.log("simple drag");
            currentMode = 'drag';
            thisRotation = currentRotation + getDeltaAngleFromDeltaX(deltaX);
            dialElem.style['-webkit-transition-duration'] = '0s';      
            dialElem.style.webkitTransform = "rotate(" + thisRotation + "deg)";
            // Compenstate for CSS cascade rotations in bubbles
            for (var i = 0; i < allBubbleElements.length; i++) {
                allBubbleElements[i].style['-webkit-transition-duration'] = '0s';
                allBubbleElements[i].style.webkitTransform = "rotate(" + (-thisRotation) + "deg)";
            }
  
            highlightClosestBubble(thisRotation);

        }


    }


    $scope.smallDragEndEvent = function(evt) {
        
        if ( currentMode == 'drag' ) {
            $scope.lastDragDirection = null;
            $scope.lastDragDistance = null;

            currentRotation = thisRotation; 
            snapToClosestNotch(currentRotation);          
        }        
    }


    $scope.swipeEvent = function(evt) {

        // Throw effect
        console.log("velocity", currentRotation);
        currentMode='vel';

        var velocity = getVelocityXWithSign(evt.gesture);
        console.log(velocity);

        var rotationTargetDelta;
        if ( velocity >= 0 ) {                  // Note:  No need to worry about velocity magnitude here, only sign. (To fire swipe event velocity magnitude will be above a certain threshold.)
            rotationTargetDelta = 180;
        } else {
            rotationTargetDelta = -180;
        }

        // Calculate rotation from velocity
        thisVelocityRotation = currentRotation + rotationTargetDelta;
        var totalDuration = 2;
        console.log(thisVelocityRotation);

        dialElem.style['-webkit-transition-duration'] = totalDuration + 's';
        dialElem.style.webkitTransform = "translate3d(0, 0, 0) rotate(" + parseInt(thisVelocityRotation) + "deg)";
        // Compenstate for CSS cascade rotations in bubbles
        for (var i = 0; i < allBubbleElements.length; i++) {
            allBubbleElements[i].style['-webkit-transition-duration'] = totalDuration + 's';
            allBubbleElements[i].style.webkitTransform = "translate3d(0, 0, 0) rotate(" + parseInt( -(thisVelocityRotation) ) + "deg)";
        }
        //thisRotation = thisVelocityRotation;
        currentRotation = thisVelocityRotation; 
        //$scope.currentRotation = currentRotation;
        highlightClosestBubble(currentRotation);
        $scope.$apply();

    }

    function highlightClosestBubble(absoluteRotation) {
        $scope.highlightedIndex = getTopBubbleIndex(absoluteRotation);
        $scope.$apply();
    }

    function snapToClosestNotch(absoluteRotation) {
        var closestNotchAngle = getClosestNotchAngle(absoluteRotation);

        dialElem.style['-webkit-transition-duration'] = '0.1s';
        dialElem.style.webkitTransform = "translate3d(0, 0, 0) rotate(" + parseInt(closestNotchAngle) + "deg)";

        for (var i = 0; i < allBubbleElements.length; i++) {
            allBubbleElements[i].style['-webkit-transition-duration'] = '0.1s';
            allBubbleElements[i].style.webkitTransform = "translate3d(0, 0, 0) rotate(" + parseInt( -(closestNotchAngle) ) + "deg)";
        }

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


    $ionicGesture.on("dragstart", $scope.smallDragStartEvent, swipeArea);
    $ionicGesture.on("dragend", $scope.smallDragEndEvent, swipeArea);
    $ionicGesture.on("drag", $scope.smallDragEvent, swipeArea);
    $ionicGesture.on("swipe", $scope.swipeEvent, swipeArea);

    var allBubbleElements = document.getElementsByClassName("bubble-icon");


    $scope.$on('$destroy', function() {
        //$ionicGesture.off("swipeleft", $scope.swipeLeft, swipeArea);
    });



})
