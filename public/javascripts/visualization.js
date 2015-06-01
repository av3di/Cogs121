//slider
//slider
  $(function() {
    $( "#slider" ).slider({
      min:0,
      max:1440,
      step:60,
      slide: function(e,ui) {
        var hours = Math.floor(ui.value/60);
        var minutes = ui.value - (hours*60);

        if(String(hours).length==1) {hours = '0' + hours;}
        if(String(minutes).length==1) {minutes = '0' + minutes;}

        $('#the-time').html('Time: '+hours+':'+minutes);
      }}
    )
  });
