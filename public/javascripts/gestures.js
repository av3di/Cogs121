var timeAtCircleStart;
var INDEX_FINGER = 1;
var MAX_TIME = 1380;
var swiped=0;
tableTabs = ["CO AQI", "CO", "NO2", "O3"];
var lastTabbed=Date.now();
var lastZoomed=Date.now();
var MAX_ZOOM = 20;
var MIN_ZOOM = 11;
var SEPARATION_SCALING = 1.25;
var zoomDuration;
window.handMarkers = [undefined,undefined];
var HEIGHT_OFFSET = 150;
var BASE_MARKER_SIZE_GRIPPED = 350000, BASE_MARKER_SIZE_UNGRIPPED = 500000; BASE_MARKER_SIZE_POINTED = 100000;
var options = { enableGestures: true };
var LEFT_HAND = 0, RIGHT_HAND = 1;
var X = 0, Y = 1, Z = 2;
var separationStart;
var dragPrev = null;

function isClockwise(frame, gesture) {
    var clockwise = false;
    var pointableID = gesture.pointableIds[0];
    var direction = frame.pointable(pointableID).direction;
    var dotProduct = Leap.vec3.dot(direction, gesture.normal);
    if (dotProduct  >  0) clockwise = true;
    return clockwise;
}

function isGripped(hand) {
  return hand.grabStrength > 0.5;
}

function isPointing(hand){
	var extendedFingers = 0;
	for(var f=0; f <hand.fingers.length;f++)
	{
		var finger = hand.fingers[f];
		if(finger.extended){extendedFingers++;}
	}
	return extendedFingers==1;
}

function filterGesture(gestureType, callback) {
    return function(frame, gesture) {
        if(gesture.type == gestureType) {
            callback(frame, gesture);
        }
    }
}

function getHandColor(hand) {
    if(isGripped(hand)) {
        return "rgb(0,119,0)";
    } else {
        var tint = Math.round((1.0 - hand.grabStrength) * 119);
        tint = "rgb(119," + tint + "," + tint + ")";
        return tint;
    }
}


function turn_clock(frame, circleGesture) {
	// Only zoom based on one index finger
    if(circleGesture.pointableIds.length == 1 &&
            frame.pointable(circleGesture.pointableIds[0]).type == INDEX_FINGER) {
        switch(circleGesture.state) {
            case "start":
            	timeAtCircleStart = $( "#slider" ).labeledslider("option","value");
            // fall through on purpose...
            case "update":
                // figure out if we need to change the zoom level;
                var timeChange = Math.floor(circleGesture.progress)*60.0;
                var currentTime = $( "#slider" ).labeledslider("option","value");
                var timeDirection = isClockwise(frame, circleGesture) ? timeChange : -timeChange;
                if(timeAtCircleStart + timeDirection != currentTime) {
                    var newTime = timeAtCircleStart + timeDirection;
                    if(newTime >= 0 && newTime <= MAX_TIME) {
                        $( "#slider" ).labeledslider("value",newTime);
                    }
                }
                break;
            case "stop":
            	timeAtCircleStart = null;
                break;
        }
    }

}

function swipeHandler(frame, swipeGesture) {
	switch(swipeGesture.state){
		case "start":
			current_tab = tableTabs.indexOf($('.active')[0].id);
		case "update":
			if (Date.now() - lastTabbed > 1500)
			{
				var isHorizontal = Math.abs(swipeGesture.direction[0]) > Math.abs(swipeGesture.direction[1]);
				if(isHorizontal){
			        if(swipeGesture.direction[0] > 0){
			                  console.log(swipeGesture.direction[0]);
			                  lastTabbed = Date.now();
			                  if(current_tab!=(tableTabs.length-1)){$("[id='"+tableTabs[current_tab+1]+"']").click();}
			        } else {
			        		  console.log(swipeGesture.direction[0]);
			                  swiped=1;
			                  lastTabbed = Date.now();
			                  if(current_tab!=0){$("[id='"+tableTabs[current_tab-1]+"']").click();}
			        }
				}				
			}
			/*var isVertical = Math.abs(swipeGesture.direction[0]) < Math.abs(swipeGesture.direction[1]);
			if(isVertical){
				if(Date.now() - lastZoomed > 1000)
				{
					zoomDuration = swipeGesture.duration;
					if(zoomDuration>17000)
					{
						lastZoomed = Date.now();
						if(swipeGesture.direction[1]>0 && current_zoom < MAX_ZOOM){
							//zoom in
							map.setZoom(current_zoom+1);
						}
						else if (current_zoom > 8)
						{
							map.setZoom(current_zoom-1);
						}
					}
				}*/
				/*if(swipeGesture.direction[1] > 0)
				{
					console.log(swipeGesture.direction[1]);
					zoomDuration = swipeGesture.duration;
				}
				else
				{

				}
			}*/
			break;
		case "stop":
			current_tab = undefined;
			break;
	}
}


function markHands(frame) {
    var scaling = (1 / Math.pow(2, map.getZoom()-1));
      var bounds = map.getBounds();
      // FIXME: Sometimes this gets run too early, just exit if its too early.
      if(!bounds) { return; }
      var origin = new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getCenter().lng());
      var hands = frame.hands;
      for(var i in hands) {
          if(hands.hasOwnProperty(i)) {
            // Limit this to 2 hands for now
            if(i > RIGHT_HAND) {
              return;
            }
            var hand = hands[i];
            newCenter = new google.maps.LatLng(origin.lat() + (((hand.stabilizedPalmPosition[1])-75) * scaling), origin.lng() + (hand.stabilizedPalmPosition[0] * scaling));
            // console.log(center.lat() + "," + center.lng());
            // console.log(newCenter.lat() + "," + newCenter.lng());
            var gripped = isGripped(hand);
            var pointing = isPointing(hand);
            var baseRadius = gripped ? BASE_MARKER_SIZE_GRIPPED : BASE_MARKER_SIZE_UNGRIPPED;
            var handColor = getHandColor(hand);
            if(pointing && frame.hands.length==1){ baseRadius = BASE_MARKER_SIZE_POINTED;handColor = "rgb(255,0,0)";}
            if(hand.type=='left')
            {
            	var handMarker = window.handMarkers[0];
	           	if(!handMarker) {
	            	handMarker = new google.maps.Circle();
	            	window.handMarkers[0] = handMarker;
            	}
            }
            else
            {
            	var handMarker = window.handMarkers[1];
	           	if(!handMarker) {
	            	handMarker = new google.maps.Circle();
	            	window.handMarkers[1] = handMarker;
            	}
            }
        	handMarker.setOptions({
              strokeColor: handColor,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: handColor,
              fillOpacity: 0.35,
              map: map,
              center: newCenter,
              radius: baseRadius * scaling
        	});
        	if(pointing && frame.hands.length==1)
        	{
        		var min_coord = undefined;
        		var min_distance = 9999999999;
        		for(var i in window.coords){
          			curr_distance = google.maps.geometry.spherical.computeDistanceBetween(window.coords[i].center,newCenter);
          			if(!min_coord && curr_distance<=600){
          				min_coord = window.coords[i];
          				min_distance = curr_distance;
          			}
          			else if(curr_distance<min_distance && curr_distance<=600){
          				min_coord = window.coords[i];
          				min_distance = curr_distance;
          			}
        		}
        		if(min_coord)
        		{
        			co_to_insert = min_coord.co;
		            no2_to_insert = min_coord.no2;
		            o3_to_insert = min_coord.o3;
		            aqi_to_insert = min_coord.aqi;

		            lat_to_insert = min_coord.lat;
		            lon_to_insert = min_coord.lon;

		            $('#table_coords').html('<small>('+lat_to_insert+','+lon_to_insert+')</small>');


		            if (co_to_insert==7035.0){co_to_insert='--'}
		            if (no2_to_insert==7035.0){no2_to_insert='--'}
		            if (o3_to_insert==7035.0){o3_to_insert='--'}
		            if (aqi_to_insert==7035.0){aqi_to_insert='--'}

		            $('#table_AQI').attr('class' ,'')
		            $('#table_CO').attr('class' ,'')
		            $('#table_NO2').attr('class' ,'')
		            $('#table_O3').attr('class' ,'')

		            if(aqi_to_insert!='--'){
		              if (aqi_to_insert<=50){$('#table_AQI').attr('class' ,'success')}
		              else if (aqi_to_insert<=100){$('#table_AQI').attr('class' ,'warning')}
		              else {$('#table_AQI').attr('class' ,'danger')}
		            }
		            if(co_to_insert!='--'){
		              if (co_to_insert<=9) {$('#table_CO').attr('class' ,'success')}
		              else if (co_to_insert<=35) {$('#table_CO').attr('class' ,'warning')}
		              else {$('#table_CO').attr('class' ,'danger')}
		            }
		            if(no2_to_insert!='--'){
		              if (no2_to_insert<=50) {$('#table_NO2').attr('class' ,'success')}
		              else if (no2_to_insert<=100) {$('#table_NO2').attr('class' ,'warning')}
		              else {$('#table_NO2').attr('class' ,'danger')}
		            }
		            if(o3_to_insert!='--'){
		              if (o3_to_insert<0.075) {$('#table_O3').attr('class' ,'success')}
		              else {$('#table_O3').attr('class' ,'danger')}
		            }

		            $('#table_AQI').children('td').text(String(aqi_to_insert));
		            $('#table_CO').children('td').text(String(co_to_insert));
		            $('#table_NO2').children('td').text(String(no2_to_insert));
		            $('#table_O3').children('td').text(String(o3_to_insert));
        		}
        		else
        		{

        		}
        	}
          }
      }
}

Leap.loop(options, function(frame){
	if(frame.valid && frame.gestures.length > 0){
        frame.gestures.forEach(function(gesture){
            filterGesture("circle", turn_clock)(frame, gesture);
            filterGesture("swipe", swipeHandler)(frame,gesture);
        });
    }

    markHands(frame);

	if(frame.hands.length==0)
	{
		dragPrev=null;
		for(var i in window.handMarkers){
		  currMarker = window.handMarkers[i]
          if(currMarker){currMarker.setMap(null);}
        }
        currMarker = [undefined,undefined];
		$('#hands_right').html('OFF');$('#hands_left').html('OFF');
	}
	else if(frame.hands.length==1)
	{
		var hand = frame.hands[0];
		if(hand.type=='left'){
			currMarker = window.handMarkers[1];
			if(currMarker)
			{
				currMarker.setMap(null);
				window.handMarkers[1]=undefined;
			}
			str="Pinch: "+ hand.pinchStrength;
			$('#hands_left').html(str);$('#hands_right').html('--');
		}
		else{
			currMarker = window.handMarkers[0];
			if(currMarker)
			{
				currMarker.setMap(null);
				window.handMarkers[0]=undefined;
			}			
			str="Pinch: "+ hand.pinchStrength;
			$('#hands_right').html(str);$('#hands_left').html('--');
		}
		if(isGripped(hand))
		{
			if(dragPrev == null) {
        		dragPrev = hand;
        		return;
      		}
      		var dX = dragPrev.stabilizedPalmPosition[X] - hand.stabilizedPalmPosition[X];
      		var dY = dragPrev.stabilizedPalmPosition[Y] - hand.stabilizedPalmPosition[Y];
      		var center = map.getCenter();
      		var scaling = 1.0 / Math.pow(2, map.getZoom()-1);
      		var newLat = center.lat() + dY * scaling;
      		var newLng = center.lng() + dX * scaling;
      		var newCenter = new google.maps.LatLng(newLat, newLng);
      		map.setCenter(newCenter);
      		dragPrev = hand;
		}
		else
		{
			dragPrev = null;
		}
	}
	else
	{
		dragPrev=null;
		var leftHand = frame.hands[LEFT_HAND];
		var rightHand = frame.hands[RIGHT_HAND];
		if(isGripped(leftHand)&&isGripped(rightHand))
		{
			var currentZoom = map.getZoom();
			separation = Math.sqrt(
            Math.pow(rightHand.stabilizedPalmPosition[X] - leftHand.stabilizedPalmPosition[X], 2) + 
            Math.pow(rightHand.stabilizedPalmPosition[Y] - leftHand.stabilizedPalmPosition[Y], 2));
            if(separationStart==null)
            {
            	$('#hands_sep').html(separation);
            	separationStart = separation;
            	return;
            }

            var current_zoom = map.getZoom();

            if(currentZoom > 1 && separation < (separationStart / SEPARATION_SCALING) ) {
            map.setZoom( currentZoom - 1 );
            separationStart = separation;
          	} else if( currentZoom < MAX_ZOOM && separation > (SEPARATION_SCALING * separationStart) ) {
            map.setZoom( currentZoom + 1 );
            separationStart = separation;
          	}
		}
		else{
			separationStart = null;
		}

	}
});