var express = require('express');
var Leap = require('leapjs');
controller = new Leap.Controller({ enableGestures:true });
direction = require('curtsy');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
   controller = new Leap.Controller({ enableGestures:true }),

  controller.on('frame', function(frame) {
    if (frame.gestures.length) {
    var gesture = frame.gestures[0];
      if (gesture.type == 'circle') {
        console.log('circle', Curtsy.direction(gesture).type);
        if(Curtsy.direction(gesture).type == 'Clockwise')
        {
           // move one hour ahead
        }
        else
        {
          // move one hour back
        }
      }
    }
  });


  // init
  controller.on('ready', function() { console.log('ready'); });
  controller.connect();
  console.log('\nWaiting for device to connect...');
  res.render('index', { title: 'AIRDATA' });
});

module.exports = router;
