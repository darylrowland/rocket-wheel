angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope) {
})

.controller('MainController', function($scope, $rootScope, $stateParams, $interval, $ionicGesture, $ionicBackdrop, $timeout, $http, $ionicLoading) {

    var VEL_THROW = 0.1;
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

            if (angleInDeg >= 0 && angleInDeg < 90) {
                xOffset = -$scope.widthOffset;
                yOffset = -$scope.widthOffset;
            } else if (angleInDeg >= 90 && angleInDeg < 180) {
                xOffset = -$scope.widthOffset;
                yOffset = -$scope.widthOffset;
            } else if (angleInDeg >= 180 && angleInDeg < 270) {
                xOffset = -$scope.widthOffset;
                yOffset = -$scope.widthOffset;
            } else if (angleInDeg >= 270 && angleInDeg < 360) {
                xOffset = -$scope.widthOffset;
                yOffset = -$scope.widthOffset;
            }

            var x = Math.round(width/2 + radius * Math.cos(angle) + xOffset);
            var y = Math.round(height/2 + radius * Math.sin(angle) + yOffset);


            $scope.navBubbles[i].left = x + "px";
            $scope.navBubbles[i].top = y + "px";
            $scope.navBubbles[i].angle = angleInDeg;
            console.log( 'distributeBubbles', angleInDeg );

            angle += step;
        }


    }

    $scope.distributeBubbles($scope.dialWidth);
    $scope.currentRotation = 0;

    var allBubbleElements = document.getElementsByClassName("bubble-icon");
    console.log(allBubbleElements);

    $scope.dragTimer = null;

    $scope.killTimer = function() {
        if ($scope.dragTimer) {
            $interval.cancel($scope.dragTimer);
        }
    }

    $scope.dragEndEvent = function(evt) {
        $scope.killTimer();
    }

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

    $scope.rotateBubbles = function(direction) {
        var changeAmount = $scope.stepAngleDegrees;

        if (direction < 0) {
            $scope.currentRotation = $scope.currentRotation - changeAmount;
            $scope.highlightedIndex ++;
        } else {
            $scope.currentRotation = $scope.currentRotation + changeAmount;
            $scope.highlightedIndex --;
        }

        if ($scope.highlightedIndex < 0) {
            $scope.highlightedIndex = $scope.navBubbles.length - 1;
        }

        if ($scope.highlightedIndex > $scope.navBubbles.length - 1) {
            $scope.highlightedIndex = 0;
        }

        $scope.$apply();

    }

    $scope.dragRotateBubbles = function(direction, dragDistance) {
        var changeAmount = $scope.stepAngleDegrees;

        if (direction < 0) {
            $scope.currentRotation = $scope.currentRotation - changeAmount;
            $scope.highlightedIndex ++;
        } else {
            $scope.currentRotation = $scope.currentRotation + changeAmount;
            $scope.highlightedIndex --;
        }

        if ($scope.highlightedIndex < 0) {
            $scope.highlightedIndex = $scope.navBubbles.length - 1;
        }

        if ($scope.highlightedIndex > $scope.navBubbles.length - 1) {
            $scope.highlightedIndex = 0;
        }

        $scope.$apply();

    }

    $scope.swipeLeft = function(evt) {
        $scope.killTimer();
        $scope.rotateBubbles(-1);
    }

    $scope.swipeRight = function(evt) {
        $scope.killTimer();
        $scope.rotateBubbles(1);
    }

    $scope.smallDragStartEvent = function(evt) {
        //console.log(evt.gesture);

    }

    var dialElem = document.getElementById("dialHolder");

    //var world = anima.world();
    //var dialAnimator = world.add(document.getElementById("dialHolder"))


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

    $scope.rotateAmount = 0;


    function applyRotatation(rotationFromInitial) {
        // Rotate wheel
        dialElem.style.webkitTransform = "translate3d(0px, 0px, 0px) rotate(" + rotationFromInitial + "deg)";        

        // Compenstate for cascade rotations in bubbles
        /*
        for (var i = 0; i < allBubbleElements.length; i++) {
            allBubbleElements[i].style.webkitTransform = "translate3d(0px, 0px, 0px) rotate(" + (-$scope.thisRotation) + "deg)";
        }
        */
    }

    $scope.smallDragEvent = function(evt) {
        if ($scope.lastDragDirection && $scope.lastDragDistance) {
            //console.log("Change = ", evt.gesture.distance - $scope.lastDragDistance);
        } else {
            $scope.lastDragDirection = evt.gesture.direction;
            $scope.lastDragDistance = evt.gesture.distance;
        }

        //$scope.rotateAmount = $scope.rotateAmount + (Math.abs(evt.gesture.deltaX) / 70);
        $scope.deltaAng = getDeltaAngleFromDeltaX( evt.gesture.deltaX );
        //$scope.rotateAmount = 2;

        //console.log($scope.rotateAmount);
        $scope.debug.deltaX = evt.gesture.deltaX;
        $scope.debug.velocX = evt.gesture.velocityX;
        $scope.debug.deltaAng = $scope.deltaAng;
        $scope.debug.currentRotation = $scope.currentRotation;
        $scope.debug.thisRotation = $scope.thisRotation;
        $scope.$apply();


        //if ($scope.rotateAmount >= 0) {
        if (true) {
            //console.log("rotate amount", rotateAmount, "delta", evt.gesture.velocityX);

            $scope.thisRotation = $scope.currentRotation + $scope.deltaAng;


            var transitionTime = 0.009 * evt.gesture.velocity;

            applyRotatation( $scope.thisRotation );


            /*
            // SELECT CLOSEST BUBBLE

            var selectedBubble = -1;
            var selectedIndex = -1;
            var selectedBubbleDistance = 999999;

            for (var i = 0; i < $scope.navBubbles.length; i++) {
                //console.log(Math.abs(($scope.currentRotation % 360) - $scope.navBubbles[i].angle));
                if (Math.abs(($scope.currentRotation % 360) - $scope.navBubbles[i].angle) < selectedBubbleDistance) {
                    selectedBubble = $scope.navBubbles[i];
                    selectedIndex = i;
                    selectedBubbleDistance = Math.abs(($scope.currentRotation % 360) - $scope.navBubbles[i].angle);
                }
            }

            //console.log("selected index", selectedIndex);

            $scope.highlightedIndex = selectedIndex;
            $scope.$apply();
            */

            $scope.$apply();

            $scope.rotateAmount = 0;
        }



        //console.log(evt.gesture);
        //console.log(evt.gesture.direction, evt.gesture.distance);
    }

    $scope.smallDragEndEvent = function(evt) {
        //console.log(evt.gesture);
        $scope.lastDragDirection = null;
        $scope.lastDragDistance = null;

        $scope.currentRotation = $scope.currentRotation + $scope.deltaAng;
    }


    $scope.dragStartEvent = function(evt) {
        evt.preventDefault();

        console.log(evt.gesture.deltaX);
        console.log(evt.gesture.velocityX);

        if (evt.gesture.deltaX < 0) {
            $scope.rotateBubbles(-1);
            $scope.dragTimer = $interval(function() {
                $scope.rotateBubbles(-1);
            }, 500);

        } else if (evt.gesture.deltaX > 0) {
            $scope.rotateBubbles(1);
            $scope.dragTimer = $interval(function() {
                $scope.rotateBubbles(1);
            }, 500);
        }



        /*if (evt.gesture.deltaX < 0) {
            $scope.dragTimer = $interval(function() {
                $scope.currentRotation = $scope.currentRotation - changeAmount;
                //$scope.$apply();
            }, 0);
        } else if (evt.gesture.deltaX > 0) {
            $scope.dragTimer = $interval(function() {
                $scope.currentRotation = $scope.currentRotation + changeAmount;
                //$scope.$apply();
            }, 0);
        }*/


    }

    $scope.calculateIconRotation = function() {
        return -$scope.currentRotation;
    }


    //$ionicGesture.on("drag", $scope.dragEvent, swipeArea);

    //$ionicGesture.on("dragstart", $scope.dragStartEvent, swipeArea);
    //$ionicGesture.on("swipeleft", $scope.swipeLeft, swipeArea);
    //$ionicGesture.on("swiperight", $scope.swipeRight, swipeArea);
    //$ionicGesture.on("dragend", $scope.dragEndEvent, swipeArea);


    $ionicGesture.on("dragstart", $scope.smallDragStartEvent, swipeArea);
    $ionicGesture.on("dragend", $scope.smallDragEndEvent, swipeArea);
    $ionicGesture.on("drag", $scope.smallDragEvent, swipeArea);



    var allBubbleElements = document.getElementsByClassName("bubble-icon");
    console.log(allBubbleElements);

//    var draggable = Draggable.create("#dialHolder", {
//    type: "rotation",
//    throwProps: true,
//    onStartDrag: function() {
//        $scope.currentRotation = drag.rotation;
//        $scope.$apply();
//
//        dialElem.style['-webkit-transition'] = 'none';
//        dialElem.addClass("no-transition");
//
//    },
//    onDrag: function() {
//        dialElem.style['-webkit-transition'] = 'none';
//        //dialElem.addClass("no-transition");
//
//        //$scope.currentRotation = drag.rotation;
//        //$scope.$apply();
//        //console.log("here", drag.rotation);
//        //console.log(drag.rotation);
//
//
//
//        //-webkit-transform: rotate({{currentRotation}}deg);
//        //console.log($scope.currentRotation, drag.rotation);
//
//
//        if (Math.abs($scope.currentRotation - drag.rotation) > 0.6) {
//            $scope.currentRotation = drag.rotation;
//
//
//
//            var topMost = allBubbleElements[0].getBoundingClientRect().top;
//            var topMostIndex = 0;
//
//            for (var i = 0; i < allBubbleElements.length; i++) {
//                //allBubbleElements[i].style.webkitTransform = "rotate(-" + drag.rotation + "deg)";
//                var thisTop = allBubbleElements[i].getBoundingClientRect().top;
//
//                if (thisTop < topMost) {
//                    topMost = thisTop;
//                    topMostIndex = i;
//                }
//
//            }
//
//            $scope.highlightedIndex = topMostIndex;
//            $scope.$apply();
//        }
//
//
//
//
//        /*for (var i = 0; i < allBubbleElements.length; i++) {
//            allBubbleElements[i].style.webkitTransform = "rotate(-" + drag.rotation + "deg)";
//        }*/
//
//
//    },
//    onDragEnd: function() {
//        console.log("Drag has ended");
//        console.log(drag.rotation);
//        console.log(drag.rotation % 360);
//
//        var normalisedAngle = drag.rotation % 360;
//
//        // figure out which is the closest element
//        //var closestIndex = normalisedAngle / $scope.stepAngleDegrees;
//        //console.log("closest index", closestIndex);
//        //console.log($scope.navBubbles[Math.round(Math.abs(closestIndex))].title);
//
//        //$scope.currentRotation = $scope.highlightedIndex * $scope.stepAngleDegrees;
//
//        var transformDegrees = $scope.currentRotation - ($scope.highlightedIndex * $scope.stepAngleDegrees);
//
//        console.log(transformDegrees);
//
//        $scope.currentRotation = transformDegrees;
//
//        dialElem.style.webkitTransform = "rotate(" + transformDegrees + "deg)";
//        dialElem.style['-webkit-transition-duration'] = '1s';
//        dialElem.style['-webkit-transition-property'] = 'all';
//
//        $scope.$apply();
//
//
//    }});


    //var elem = document.getElementById("dialHolder");
    //var drag = Draggable.get(elem);
    //drag.update();



    //drag.onDrag = function(evt) {
    //    console.log(drag.rotation);
    //};

    //$scope.currentRotation = drag.rotation;



    $scope.$on('$destroy', function() {
        //$ionicGesture.off("swipeleft", $scope.swipeLeft, swipeArea);
    });



})
