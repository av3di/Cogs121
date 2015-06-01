// When the window has finished loading create our google map below
google.maps.event.addDomListener(window, 'load', init);

    function init() {
        // Basic options for a simple Google Map
        // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
        var mapOptions = {
            // How zoomed in you want the map to start at (always required)
            zoom: 9,

            // The latitude and longitude to center the map (always required)
            center: new google.maps.LatLng(32.7150, -117.1625), // San Diego


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
        var map = new google.maps.Map(mapElement, mapOptions);

        // Customize the marker
        

        // Load the station data. When the data comes back, create an overlay.
        d3.json("coords16.json", function(data) {
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
        });
var dataset = [
  { label: 'CO', count: 10 }, 
  { label: 'NO2', count: 20 },
  { label: 'O2', count: 30 },
  { label: 'AQI', count: 40 }
];


var width = 360;
var height = 360;
var radius = Math.min(width, height) / 2;

var color = d3.scale.ordinal()
            .range(['#003d55', '#323232', '#0088bb', '#58585a']); 

var svg = d3.select('#piechart')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) + 
    ',' + (height / 2) + ')');

var arc = d3.svg.arc()
  .outerRadius(radius);

var pie = d3.layout.pie()
  .value(function(d) { return d.count; })
  .sort(null);

var path = svg.selectAll('path')
  .data(pie(dataset))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', function(d, i) { 
    return color(d.data.label);
  });

  var arcs = svg.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
.data(pie(dataset))                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
.enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
    .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
        .attr("class", "slice");    //allow us to style things in the slices (like text)

arcs.append("svg:path")
        .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
        .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

arcs.append("svg:text")                                     //add a label to each slice
        .attr("transform", function(d) {                    //set the label's origin to the center of the arc
        //we have to make sure to set these before calling arc.centroid
        d.innerRadius = 0;
        d.outerRadius = radius;
        return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
    })
    .attr("text-anchor", "middle")                          //center the text on it's origin
    .text(function(d, i) { return dataset[i].label; });        //get the label from our original data array


}