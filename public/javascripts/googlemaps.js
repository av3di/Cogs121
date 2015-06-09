// When the window has finished loading create our google map below
google.maps.event.addDomListener(window, 'load', init);

    function init() {
        // Basic options for a simple Google Map
        // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
        var mapOptions = {
            // How zoomed in you want the map to start at (always required)
            zoom: 10,

            // The latitude and longitude to center the map (always required)
            center: new google.maps.LatLng(32.7650, -117.1625), // San Diego


            // How you would like to style the map. 
            // This is where you would paste any style found on Snazzy Maps.
            styles: 
[
    {
        "featureType": "landscape",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "stylers": [
            {
                "hue": "#00aaff"
            },
            {
                "saturation": -100
            },
            {
                "gamma": 2.15
            },
            {
                "lightness": 12
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 24
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": 57
            }
        ]
    }
]
        };

        // Get the HTML DOM element that will contain your map 
        // We are using a div with id="map" seen below in the <body>
        var mapElement = document.getElementById('map');

        // Create the Google Map using our element and options defined above
        window.map = new google.maps.Map(mapElement, mapOptions);


      $.getJSON( "hour0.json", function( data ) {
          for(var i in window.coords){
            window.coords[i].setMap(null);
          }

          data_type = $('.active').attr('id');
          window.coords = [];
          window.coord_listeners =[];
          var coordAdd;
          var coord_color;
          $.each( data, function( key, val ) {
            reading = val[data_type];
            if(reading==7035.0){}
            else
            {
              if(data_type=="CO AQI"){
                if (reading<=50){coord_color="#00FF00"}
                else if (reading<=100){coord_color="#FFFF00"}
                else {coord_color="#FF0000"}
              }
              else if(data_type=="CO"){
                if (reading<=9) {coord_color="#00FF00"}
                else if (reading<=35) {coord_color="#FFFF00"}
                else {coord_color="#FF0000"}
              }
              else if(data_type=="NO2"){
                if (reading<=50) {coord_color="#00FF00"}
                else if (reading<=100) {coord_color="#FFFF00"}
                else {coord_color="#FF0000"}
              }
              else if(data_type=="O3"){
                if (reading<0.075) {coord_color="#00FF00"}
                else {coord_color="FF0000"}
              }

              var circleOptions = {
                strokeColor: coord_color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: coord_color,
                fillOpacity: 0.35,
                map: window.map,
                center: new google.maps.LatLng(val.lat,val.lon),
                co: val['CO'],
                no2: val['NO2'],
                o3: val['O3'],
                aqi: val['CO AQI'],
                lat: val['lat'],
                lon: val['lon'],
                radius: 100
              };
              window.coords.push(new google.maps.Circle(circleOptions));
              var idx = window.coords.length-1;
              window.coord_listeners.push(google.maps.event.addListener(window.coords[idx], 'mouseover', function(data) {
                console.log(idx);
                co_to_insert = window.coords[idx].co;
                no2_to_insert = window.coords[idx].no2;
                o3_to_insert = window.coords[idx].o3;
                aqi_to_insert = window.coords[idx].aqi;


                lat_to_insert = window.coords[idx].lat;
                lon_to_insert = window.coords[idx].lon;

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
              }));
            }       
          });
        });

        // Load the station data. When the data comes back, create an overlay.
     /*   d3.json("coords16.json", function(data) {
          var overlay = new google.maps.OverlayView();

          // Add the container when the overlay is added to the map.
          overlay.onAdd = function() {
            var layer = d3.select(this.getPanes().overlayLayer).append("div")
                .attr("class", "stations");

            // Draw each marker as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
              var projection = this.getProjection(),
                  padding = 20;

              var marker = layer.selectAll("svg")
                  .data(d3.entries(data))
                  .each(transform) // update existing markers
                .enter().append("svg:svg")
                  .each(transform)
                  .attr("class", "marker");

              // Add a circle.
              marker.append("svg:circle")
                  .attr("r", 10)
                  .attr("cx", padding)
                  .attr("cy", padding);

              function transform(d) {
                var image = '/images/marker.png';
                
                d = new google.maps.LatLng(d.value[0], d.value[1]);
                var blue_marker = new google.maps.Marker({
                    position: d,
                    map: map,
                    icon: image
                });
                d = projection.fromLatLngToDivPixel(d);
                return d3.select(this)
                    .style("left", (d.x - padding) + "px")
                    .style("top", (d.y - padding) + "px");
              }
            };
          };

          // Bind our overlay to the map…
          overlay.setMap(map);
        });*/
}