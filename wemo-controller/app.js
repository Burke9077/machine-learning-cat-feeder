const express = require('express');
const app = express();
const Wemo = require('wemo-client');
const wemo = new Wemo();
const { spawn } = require('child_process');

/*
  Get the configuration variables we need to run. In this case we only need to
  know what port to use for our webserver and what the Left and Right IP addresses
  are for the wemo devices. I've set the wemos to use a static IP so this doesn't
  change.

  The actual IP addresses are configured in the docker-compose.yml file in the
  parent directory.
*/

const config = {
  port: 8000,
  wemo: {
    commandTimeout: 30
  }
}

let wemoClients = {
  left: null,
  leftLastState: 0,
  right: null,
  rightLastState: 0
}

function setPowerState(leftOrRight, offOrOnZeroOrOne) {
  if (leftOrRight === "left") {
    if (wemoClients.leftLastState !== offOrOnZeroOrOne) {
      // They want us to change state
        wemoClients.left.setBinaryState(offOrOnZeroOrOne);
        wemoClients.leftLastState = offOrOnZeroOrOne;
        return;
    }
  } else if (leftOrRight === "right") {
    if (wemoClients.rightLastState !== offOrOnZeroOrOne) {
      // They want us to change state
        wemoClients.right.setBinaryState(offOrOnZeroOrOne);
        wemoClients.rightLastState = offOrOnZeroOrOne;
        return;
    }
  }
}

wemo.discover(function(err, deviceInfo) {
  // Find the ones we care about
  if (deviceInfo.friendlyName == "Cat Feeder Right") {
    console.log('Wemo Device Found: %j', deviceInfo);

    wemoClients.right = wemo.client(deviceInfo);
    wemoClients.right.on('error', function(err) {
      console.log('Error: %s', err.code);
    });
    wemoClients.right.on('binaryState', function(value) {
      console.log('Binary State changed to: %s', value);
      wemoClients.rightLastState = value;
    });
  }

  if (deviceInfo.friendlyName == "Cat Feeder Left") {
    console.log('Wemo Device Found: %j', deviceInfo);

    wemoClients.left = wemo.client(deviceInfo);
    wemoClients.left.on('error', function(err) {
      console.log('Error: %s', err.code);
    });
    wemoClients.left.on('binaryState', function(value) {
      console.log('Binary State changed to: %s', value);
      wemoClients.leftLastState = value
    });
  }
});


// Define default route for testing
app.get('/', (req, res) => res.send('Hello World!'));

// Setup code to turn on/off the left/right light and punt the work to python
app.get('/v1/device/:device/setPower/:setPower', (request, response) => {
  /*
    The :device variable expects "left" or "right". This could be parameterized to work for
    more than 2 examples but I don't want to encourage myself to get another cat.

    Normally for a function like this we'd implement some error checking but I'm
    not going to go that far here. This isn't production code and we also control
    all inputs to this microservice. It won't be publically exposed, just running
    with docker networking hiding my sins.
  */
  let leftOrRightDevice = request.params.device;

  // The :setPower variable will be "on" or "off".
  let deviceDesiredPowerState = request.params.setPower;

  if (deviceDesiredPowerState === "on") {
    setPowerState(leftOrRightDevice, 1)
  } else if (deviceDesiredPowerState === "off") {
    setPowerState(leftOrRightDevice, 0)
  }

  response.status(500).json({message: `Function not yet supported`});
});

app.listen(config.port, () => console.log(`Wemo cat-feeder controller app listening on port ${config.port}!`));
