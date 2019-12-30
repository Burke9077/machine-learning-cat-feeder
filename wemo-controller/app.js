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
    leftIpAddr: process.env.WEMO_LEFT_IP_ADDR,
    rightIpAddr: process.env.WEMO_RIGHT_IP_ADDR,
    commandTimeout: 30
  }
}

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

  /*
    Now we need to set a variable for the device's IP address based on if the
    user sent "left" or "right" so we can pass the IP to python for the actual work.
  */
  let ipAddr = (leftOrRightDevice === "left") ? config.wemo.leftIpAddr : config.wemo.rightIpAddr;

  // We have all we need, send it to python
  let child = spawn('python3', ["wemo-controller.py", ipAddr, deviceDesiredPowerState]);
  child.on('exit', code => {
    if (code !== 0) {
      // Send our response to the requestor letting them know there was an error.
      response.status(500).json({message: `Python task existed with code ${code}`});
    } else {
      response.status(200).json({message: `Successfully changed power state of ${leftOrRightDevice} light to ${deviceDesiredPowerState}`})
    }
  })
});

app.listen(config.port, () => console.log(`Wemo cat-feeder controller app listening on port ${config.port}!`));
