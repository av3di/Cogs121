//slider
//slider
  $(function() {
    $( "#slider" ).labeledslider({
      min:0,
      max:1380,
      tickArray: [0,360,720,1080,1380],
      tickLabels: {0:'12AM',360:'6AM',720:'12PM',1080:'6PM',1380:'11PM'},
      step:60,
      slide: function(e,ui) {
        var begin_time = Math.floor(ui.value/60);
        var minutes = ui.value - (begin_time*60);

        console.log(begin_time);
        function time_to_str(time){
          if (time>=12){
            if(time==12){return '12PM'}
            else if(time==24){return '12AM'}
            else{return String(time-12)+'PM'}}
          else{
            if(time==0){return '12AM'}
            return String(time)+'AM'}
        };

        begintime_string = time_to_str(begin_time);
        endtime_string = time_to_str(begin_time+1)

        $('#the-time').html('<big>Pollutant averages from ' + begintime_string +' to ' + endtime_string + '</big>');
      
        $.getJSON( "hour"+begin_time+".json", function( data ) {
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
                  radius: 100,
                  lat: val['lat'],
                  lon: val['lon']
                };
                window.coords.push(new google.maps.Circle(circleOptions));
                var idx = window.coords.length-1;
                console.log(idx);
                window.coord_listeners.push(google.maps.event.addListener(window.coords[idx], 'mouseover', function(data) {
                  console.log(idx);
                  co_to_insert = window.coords[idx].co;
                  no2_to_insert = window.coords[idx].no2;
                  o3_to_insert = window.coords[idx].o3;
                  aqi_to_insert = window.coords[idx].aqi;

                  print_arr = [co_to_insert,no2_to_insert,o3_to_insert,aqi_to_insert];

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

        }}
    )
  });

$('.datatype_select').click(function(event){
  var selected_id = event.target.id;
  $('.active').toggleClass("active");
  $(this).toggleClass("active");

  var begin_time = $('#slider').labeledslider("option", "value");
  begin_time = Math.floor(begin_time/60);

  $.getJSON( "hour"+begin_time+".json", function( data ) {
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
          console.log(idx);
          window.coord_listeners.push(google.maps.event.addListener(window.coords[idx], 'mouseover', function(data) {
            console.log(idx);
            co_to_insert = window.coords[idx].co;
            no2_to_insert = window.coords[idx].no2;
            o3_to_insert = window.coords[idx].o3;
            aqi_to_insert = window.coords[idx].aqi;

            print_arr = [co_to_insert,no2_to_insert,o3_to_insert,aqi_to_insert];

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



});